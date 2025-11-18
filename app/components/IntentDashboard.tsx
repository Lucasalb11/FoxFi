'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useEffect } from 'react'

interface Intent {
  id: string
  inputToken: string
  outputToken: string
  inputAmount: number
  minOutput: number
  status: 'Open' | 'SolutionSubmitted' | 'Executed' | 'Cancelled' | 'Expired'
  createdAt: number
  expiration: number
}

export const IntentDashboard = () => {
  const { connected, publicKey } = useWallet()
  const [intents, setIntents] = useState<Intent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (connected && publicKey) {
      // TODO: Fetch user's intents from program
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    } else {
      setLoading(false)
    }
  }, [connected, publicKey])

  const getStatusColor = (status: Intent['status']) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-500'
      case 'SolutionSubmitted':
        return 'bg-yellow-500'
      case 'Executed':
        return 'bg-green-500'
      case 'Cancelled':
        return 'bg-gray-500'
      case 'Expired':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: Intent['status']) => {
    switch (status) {
      case 'Open':
        return '🔵'
      case 'SolutionSubmitted':
        return '⚡'
      case 'Executed':
        return '✅'
      case 'Cancelled':
        return '❌'
      case 'Expired':
        return '⏰'
    }
  }

  if (!connected) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">🦊</div>
        <h3 className="text-xl font-bold text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-400">
          Connect your wallet to view your intents
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card text-center">
        <div className="animate-spin text-6xl mb-4">⚡</div>
        <p className="text-gray-400">Loading your intents...</p>
      </div>
    )
  }

  if (intents.length === 0) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-white mb-2">
          No Intents Yet
        </h3>
        <p className="text-gray-400 mb-4">
          Create your first swap intent to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-4">My Intents</h2>
        
        <div className="space-y-3">
          {intents.map((intent) => (
            <div
              key={intent.id}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getStatusIcon(intent.status)}</span>
                  <div>
                    <div className="font-semibold text-white">
                      {intent.inputAmount} {intent.inputToken} → {intent.outputToken}
                    </div>
                    <div className="text-sm text-gray-400">
                      Min Output: {intent.minOutput}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(intent.status)}`}>
                  {intent.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white ml-2">
                    {new Date(intent.createdAt * 1000).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Expires:</span>
                  <span className="text-white ml-2">
                    {new Date(intent.expiration * 1000).toLocaleString()}
                  </span>
                </div>
              </div>

              {intent.status === 'Open' && (
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                    Cancel Intent
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

