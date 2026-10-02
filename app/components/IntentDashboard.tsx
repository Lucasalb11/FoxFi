'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'
import {
  INPUT_MINT,
  INPUT_SYMBOL,
  OUTPUT_SYMBOL,
  ata,
  configPda,
  fetchIntents,
  phase,
  program,
  reason,
  vaultPda,
  type IntentRow,
} from '@/lib/foxfi'
import { useNow } from '@/lib/useNow'

export const IntentDashboard = () => {
  const { connection } = useConnection()
  const wallet = useAnchorWallet()
  const now = useNow()
  const [rows, setRows] = useState<IntentRow[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!wallet) return
    try {
      setRows(await fetchIntents(program(connection), wallet.publicKey))
    } catch (e) {
      toast.error(reason(e))
      setRows([])
    }
  }, [connection, wallet])

  useEffect(() => {
    load()
    const id = setInterval(load, 8000)
    return () => clearInterval(id)
  }, [load])

  const refund = async (row: IntentRow) => {
    if (!wallet) return
    setBusy(row.address.toBase58())
    try {
      await program(connection, wallet)
        .methods.cancelIntent()
        .accountsPartial({
          intent: row.address,
          config: configPda,
          user: wallet.publicKey,
          inputMint: INPUT_MINT,
          userInputAccount: ata(INPUT_MINT, wallet.publicKey),
          inputVault: vaultPda(INPUT_MINT),
          winningSolver: row.status === 'solutionSubmitted' ? row.winningSolver : null,
        })
        .rpc()
      toast.success(`Refunded ${row.inputAmount} ${INPUT_SYMBOL}`)
      load()
    } catch (e) {
      toast.error(reason(e))
    } finally {
      setBusy(null)
    }
  }

  if (!wallet) return <div className="card max-w-3xl mx-auto text-gray-300">Connect a wallet to see your intents.</div>
  if (!rows) return <div className="card max-w-3xl mx-auto text-gray-400">Loading from devnet…</div>
  if (rows.length === 0) return <div className="card max-w-3xl mx-auto text-gray-300">No intents yet. Create one on the Swap tab.</div>

  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">My intents</h2>
      <ul className="divide-y divide-gray-800">
        {rows.map((row) => {
          const stage = phase(row, now)
          const refundable = stage === 'no bids' || stage === 'winner missed deadline' || (row.status === 'open' && stage === 'bidding')
          const secondsLeft = Math.max(0, Math.ceil((stage === 'bidding' ? row.auctionEnd : row.expiration) - now))
          return (
            <li key={row.address.toBase58()} className="py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">
                  {row.inputAmount} {INPUT_SYMBOL} → at least {row.minOutput} {OUTPUT_SYMBOL}
                </p>
                <p className="text-sm text-gray-400">
                  {stage}
                  {stage === 'bidding' || stage === 'awaiting settlement' ? ` · ${secondsLeft}s` : ''}
                  {row.bestOutput > 0 && stage !== 'settled' ? ` · best quote ${row.bestOutput} ${OUTPUT_SYMBOL}` : ''}
                  {stage === 'settled' ? ` · received ${row.actualOutput} ${OUTPUT_SYMBOL}` : ''}
                </p>
              </div>
              {refundable ? (
                <button className="btn-secondary" disabled={!!busy} onClick={() => refund(row)}>
                  {busy === row.address.toBase58() ? 'Refunding…' : 'Get my tokens back'}
                </button>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
