'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { createAssociatedTokenAccountIdempotentInstruction } from '@solana/spl-token'
import toast from 'react-hot-toast'
import {
  INPUT_MINT,
  INPUT_SYMBOL,
  OUTPUT_MINT,
  OUTPUT_SYMBOL,
  ata,
  configPda,
  fetchIntents,
  phase,
  program,
  reason,
  solutionPda,
  solverPda,
  toUnits,
  vaultPda,
  type IntentRow,
} from '@/lib/foxfi'
import { useNow } from '@/lib/useNow'

export const SolverPortal = () => {
  const { connection } = useConnection()
  const wallet = useAnchorWallet()
  const now = useNow()
  const [solver, setSolver] = useState<{ stake: number; solved: number; failed: number; reputation: number } | null | undefined>(undefined)
  const [minStake, setMinStake] = useState(0.1)
  const [rows, setRows] = useState<IntentRow[]>([])
  const [quotes, setQuotes] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!wallet) return
    const p = program(connection)
    const [config, s, intents] = await Promise.all([
      p.account.protocolConfig.fetch(configPda),
      p.account.solver.fetchNullable(solverPda(wallet.publicKey)),
      fetchIntents(p),
    ])
    setMinStake(config.minSolverStake.toNumber() / LAMPORTS_PER_SOL)
    setSolver(
      s
        ? {
            stake: s.stakeAmount.toNumber() / LAMPORTS_PER_SOL,
            solved: s.totalSolved.toNumber(),
            failed: s.totalFailed.toNumber(),
            reputation: s.reputationScore.toNumber() / 100,
          }
        : null
    )
    setRows(intents.filter((r) => r.status === 'open' || r.status === 'solutionSubmitted'))
  }, [connection, wallet])

  useEffect(() => {
    load().catch((e) => toast.error(reason(e)))
    const id = setInterval(() => load().catch(() => undefined), 8000)
    return () => clearInterval(id)
  }, [load])

  const act = async (key: string, fn: () => Promise<string>, ok: string) => {
    setBusy(key)
    try {
      await fn()
      toast.success(ok)
      await load()
    } catch (e) {
      toast.error(reason(e))
    } finally {
      setBusy(null)
    }
  }

  if (!wallet) return <div className="card max-w-3xl mx-auto text-gray-300">Connect a wallet to act as a solver.</div>
  const p = program(connection, wallet)
  const me = solverPda(wallet.publicKey)

  if (solver === undefined) return <div className="card max-w-3xl mx-auto text-gray-400">Loading from devnet…</div>

  if (solver === null) {
    return (
      <div className="card max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-white">Become a solver</h2>
        <p className="text-gray-400 text-sm">
          Solvers lock a stake ({minStake} SOL) in the program. You get it back when you leave; missing a settlement you
          won costs reputation.
        </p>
        <button
          className="btn-primary"
          disabled={!!busy}
          onClick={() =>
            act(
              'register',
              () =>
                p.methods
                  .registerSolver(new BN(minStake * LAMPORTS_PER_SOL))
                  .accountsPartial({ solver: me, config: configPda, authority: wallet.publicKey })
                  .rpc(),
              'Registered. Your stake is locked in the program.'
            )
          }
        >
          {busy === 'register' ? 'Confirm in your wallet…' : `Stake ${minStake} SOL and register`}
        </button>
      </div>
    )
  }

  return (
    <div className="card max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-2xl font-bold text-white">Solver</h2>
        <p className="text-sm text-gray-400">
          Stake {solver.stake} SOL · {solver.solved} settled · {solver.failed} missed · reputation {solver.reputation}%
        </p>
      </div>
      <p className="text-gray-400 text-sm">
        Bid by committing to deliver an amount of {OUTPUT_SYMBOL}. If yours is the best when bidding closes, settle before
        the intent expires: you pay your quote and receive the user&apos;s {INPUT_SYMBOL} in the same transaction.
      </p>

      {rows.length === 0 ? (
        <p className="text-gray-400">No open intents right now. Create one on the Swap tab and bid on it here.</p>
      ) : (
        <ul className="divide-y divide-gray-800">
          {rows.map((row) => {
            const key = row.address.toBase58()
            const stage = phase(row, now)
            const iWin = row.winningSolver?.equals(me)
            const left = Math.max(0, Math.ceil((stage === 'bidding' ? row.auctionEnd : row.expiration) - now))
            return (
              <li key={key} className="py-4 space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-white">
                    {row.inputAmount} {INPUT_SYMBOL} for at least {row.minOutput} {OUTPUT_SYMBOL}
                  </p>
                  <p className="text-sm text-gray-400">
                    {stage} · {left}s{row.bestOutput > 0 ? ` · best ${row.bestOutput}${iWin ? ' (yours)' : ''}` : ''}
                  </p>
                </div>
                {stage === 'bidding' ? (
                  <div className="flex gap-2">
                    <input
                      className="input-field max-w-[10rem]"
                      type="number"
                      step="any"
                      placeholder={String(Math.max(row.minOutput, row.bestOutput))}
                      value={quotes[key] ?? ''}
                      onChange={(e) => setQuotes({ ...quotes, [key]: e.target.value })}
                    />
                    <button
                      className="btn-primary"
                      disabled={!!busy || !quotes[key]}
                      onClick={() =>
                        act(
                          key,
                          () =>
                            p.methods
                              .submitSolution(toUnits(quotes[key]))
                              .accountsPartial({
                                intent: row.address,
                                solution: solutionPda(row.address, me),
                                solver: me,
                                config: configPda,
                                solverAuthority: wallet.publicKey,
                              })
                              .rpc(),
                          'Bid placed.'
                        )
                      }
                    >
                      Bid
                    </button>
                  </div>
                ) : null}
                {stage === 'awaiting settlement' && iWin ? (
                  <button
                    className="btn-primary"
                    disabled={!!busy}
                    onClick={() =>
                      act(
                        key,
                        async () => {
                          const config = await p.account.protocolConfig.fetch(configPda)
                          // Make sure both receiving token accounts exist; no-ops if they already do.
                          const pre = [
                            createAssociatedTokenAccountIdempotentInstruction(wallet.publicKey, ata(OUTPUT_MINT, row.user), row.user, OUTPUT_MINT),
                            createAssociatedTokenAccountIdempotentInstruction(wallet.publicKey, ata(INPUT_MINT, wallet.publicKey), wallet.publicKey, INPUT_MINT),
                          ]
                          return p.methods
                            .executeSettlement()
                            .preInstructions(pre)
                            .accountsPartial({
                              intent: row.address,
                              solver: me,
                              config: configPda,
                              solverAuthority: wallet.publicKey,
                              user: row.user,
                              inputMint: INPUT_MINT,
                              outputMint: OUTPUT_MINT,
                              inputVault: vaultPda(INPUT_MINT),
                              userOutputAccount: ata(OUTPUT_MINT, row.user),
                              solverOutputAccount: ata(OUTPUT_MINT, wallet.publicKey),
                              solverInputAccount: ata(INPUT_MINT, wallet.publicKey),
                              protocolFeeAccount: ata(OUTPUT_MINT, config.treasury),
                            })
                            .rpc()
                        },
                        'Settled: you paid your quote and received the input.'
                      )
                    }
                  >
                    Settle now
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
