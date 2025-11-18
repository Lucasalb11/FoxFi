'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'

export const SwapInterface = () => {
  const { connected, publicKey } = useWallet()
  
  const [inputMint, setInputMint] = useState('')
  const [outputMint, setOutputMint] = useState('')
  const [inputAmount, setInputAmount] = useState('')
  const [minOutput, setMinOutput] = useState('')
  const [expirationHours, setExpirationHours] = useState('1')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateIntent = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!inputMint || !outputMint || !inputAmount || !minOutput) {
      toast.error('Please fill all fields')
      return
    }

    setIsCreating(true)
    
    try {
      // TODO: Integrate with Anchor program
      toast.success('Intent created! Solvers are competing for best execution...')
      
      // Reset form
      setInputAmount('')
      setMinOutput('')
    } catch (error) {
      console.error('Error creating intent:', error)
      toast.error('Failed to create intent')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create Swap Intent</h2>
        <p className="text-gray-400 text-sm">
          Specify what you want to swap. Solvers will compete to give you the best price.
        </p>
      </div>

      {/* Input Token */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          From Token
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Input token mint address"
            value={inputMint}
            onChange={(e) => setInputMint(e.target.value)}
            className="input bg-gray-800 text-white"
          />
        </div>
      </div>

      {/* Input Amount */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount to Swap
        </label>
        <input
          type="number"
          placeholder="0.00"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          className="input bg-gray-800 text-white"
        />
      </div>

      {/* Swap Icon */}
      <div className="flex justify-center my-4">
        <button className="bg-foxfi-primary p-3 rounded-full hover:bg-foxfi-accent transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
            />
          </svg>
        </button>
      </div>

      {/* Output Token */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          To Token
        </label>
        <input
          type="text"
          placeholder="Output token mint address"
          value={outputMint}
          onChange={(e) => setOutputMint(e.target.value)}
          className="input bg-gray-800 text-white"
        />
      </div>

      {/* Min Output */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Minimum Output Amount (Slippage Protection)
        </label>
        <input
          type="number"
          placeholder="0.00"
          value={minOutput}
          onChange={(e) => setMinOutput(e.target.value)}
          className="input bg-gray-800 text-white"
        />
        <p className="text-xs text-gray-500 mt-1">
          Transaction will fail if output is less than this amount
        </p>
      </div>

      {/* Expiration */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Intent Expiration
        </label>
        <select
          value={expirationHours}
          onChange={(e) => setExpirationHours(e.target.value)}
          className="input bg-gray-800 text-white"
        >
          <option value="0.25">15 minutes</option>
          <option value="0.5">30 minutes</option>
          <option value="1">1 hour</option>
          <option value="6">6 hours</option>
          <option value="24">24 hours</option>
        </select>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <span className="text-blue-400 text-xl">ℹ️</span>
          <div className="text-sm text-blue-200">
            <p className="font-semibold mb-1">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Your intent is submitted on-chain</li>
              <li>Solvers compete off-chain to find best execution</li>
              <li>Best solution is executed automatically</li>
              <li>You receive tokens with optimal price</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Create Intent Button */}
      <button
        onClick={handleCreateIntent}
        disabled={!connected || isCreating}
        className={`w-full btn-primary ${
          !connected || isCreating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {!connected
          ? 'Connect Wallet'
          : isCreating
          ? 'Creating Intent...'
          : 'Create Intent'}
      </button>

      {/* Fee Info */}
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>
          Protocol Fee: 0.05% | Solver Fee: 0.10% | Total: 0.15%
        </p>
      </div>
    </div>
  )
}

