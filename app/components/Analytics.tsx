'use client'

import { useEffect, useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { INPUT_SYMBOL, OUTPUT_SYMBOL, configPda, fromUnits, program } from '@/lib/foxfi'

type Stats = { intents: number; executed: number; volume: number; fees: number }

export const Analytics = () => {
  const { connection } = useConnection()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    program(connection)
      .account.protocolConfig.fetch(configPda)
      .then((c) =>
        setStats({
          intents: c.totalIntents.toNumber(),
          executed: c.totalExecuted.toNumber(),
          volume: fromUnits(c.totalVolume),
          fees: fromUnits(c.totalProtocolFees),
        })
      )
      .catch(() => setError('Couldn’t read the protocol config from devnet.'))
  }, [connection])

  if (error) return <div className="card max-w-3xl mx-auto text-gray-300">{error}</div>
  if (!stats) return <div className="card max-w-3xl mx-auto text-gray-400">Loading from devnet…</div>

  const items = [
    { label: 'Intents created', value: stats.intents },
    { label: 'Settled', value: stats.executed },
    { label: `Volume (${INPUT_SYMBOL})`, value: stats.volume },
    { label: `Protocol fees (${OUTPUT_SYMBOL})`, value: stats.fees },
  ]
  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-1">Protocol totals</h2>
      <p className="text-sm text-gray-400 mb-6">Read live from the program&apos;s config account on devnet.</p>
      <div className="grid gap-4 sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.label}>
            <p className="text-sm text-gray-400">{i.label}</p>
            <p className="text-2xl font-semibold text-white">{i.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
