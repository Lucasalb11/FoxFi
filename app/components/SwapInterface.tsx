'use client'

import { useState } from 'react'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'
import {
  INPUT_MINT,
  INPUT_SYMBOL,
  INTENT_LIFETIME_SECONDS,
  OUTPUT_MINT,
  OUTPUT_SYMBOL,
  AUCTION_SECONDS,
  ata,
  configPda,
  configured,
  intentPda,
  program,
  reason,
  toUnits,
  vaultPda,
} from '@/lib/foxfi'
import { BN } from '@coral-xyz/anchor'

export const SwapInterface = ({ onCreated }: { onCreated?: () => void }) => {
  const { connection } = useConnection()
  const wallet = useAnchorWallet()
  const [inputAmount, setInputAmount] = useState('1')
  const [minOutput, setMinOutput] = useState('0.9')
  const [busy, setBusy] = useState<'faucet' | 'create' | null>(null)

  const requestTokens = async () => {
    if (!wallet) return toast.error('Connect a wallet first')
    setBusy('faucet')
    try {
      const res = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: wallet.publicKey.toBase58() }),
      })
      const body = await res.json()
      res.ok ? toast.success(body.message) : toast.error(body.error)
    } finally {
      setBusy(null)
    }
  }

  const createIntent = async () => {
    if (!wallet) return toast.error('Connect a wallet first')
    setBusy('create')
    try {
      const p = program(connection, wallet)
      const config = await p.account.protocolConfig.fetch(configPda)
      const intent = intentPda(wallet.publicKey, config.totalIntents)
      await p.methods
        .createIntent(toUnits(inputAmount), toUnits(minOutput), new BN(INTENT_LIFETIME_SECONDS))
        .accountsPartial({
          intent,
          config: configPda,
          user: wallet.publicKey,
          inputMint: INPUT_MINT,
          outputMint: OUTPUT_MINT,
          userInputAccount: ata(INPUT_MINT, wallet.publicKey),
          inputVault: vaultPda(INPUT_MINT),
        })
        .rpc()
      toast.success(`Intent created. Solvers have ${AUCTION_SECONDS}s to bid.`)
      onCreated?.()
    } catch (e) {
      toast.error(reason(e))
    } finally {
      setBusy(null)
    }
  }

  if (!configured()) {
    return <div className="card max-w-2xl mx-auto text-gray-300">This deployment isn&apos;t connected to the devnet demo tokens yet.</div>
  }

  return (
    <div className="card max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Swap {INPUT_SYMBOL} for {OUTPUT_SYMBOL}</h2>
        <p className="text-gray-400 text-sm">
          Say how much you&apos;re selling and the least you&apos;ll accept. Your {INPUT_SYMBOL} is locked in the program; solvers
          bid for {AUCTION_SECONDS} seconds and the best quote is what you receive. If nobody fills it, you get it back.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="block text-sm font-medium text-gray-300 mb-2">You sell ({INPUT_SYMBOL})</span>
          <input className="input-field" type="number" min="0" step="any" value={inputAmount} onChange={(e) => setInputAmount(e.target.value)} />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-gray-300 mb-2">You receive at least ({OUTPUT_SYMBOL})</span>
          <input className="input-field" type="number" min="0" step="any" value={minOutput} onChange={(e) => setMinOutput(e.target.value)} />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={!!busy || !wallet} onClick={createIntent}>
          {busy === 'create' ? 'Confirm in your wallet…' : 'Create intent'}
        </button>
        <button className="btn-secondary" disabled={!!busy || !wallet} onClick={requestTokens}>
          {busy === 'faucet' ? 'Sending…' : 'Get demo tokens'}
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Devnet only. Demo tokens have no value; you&apos;ll also need a little devnet SOL for fees.
      </p>
    </div>
  )
}
