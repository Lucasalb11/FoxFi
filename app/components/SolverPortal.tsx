'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export const SolverPortal = () => {
  const { connected } = useWallet()
  const [isRegistered, setIsRegistered] = useState(false)
  const [stakeAmount, setStakeAmount] = useState('1.0')
  const [isRegistering, setIsRegistering] = useState(false)

  const handleRegister = async () => {
    setIsRegistering(true)
    try {
      // TODO: Integrate with Anchor program
      toast.success('Successfully registered as solver!')
      setIsRegistered(true)
    } catch (error) {
      console.error('Error registering solver:', error)
      toast.error('Failed to register as solver')
    } finally {
      setIsRegistering(false)
    }
  }

  if (!connected) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">⚡</div>
        <h3 className="text-xl font-bold text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-400">
          Connect your wallet to become a solver
        </p>
      </div>
    )
  }

  if (!isRegistered) {
    return (
      <div className="card max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Become a Solver</h2>
        <p className="text-gray-400 mb-6">
          Solvers compete to find the best execution for user intents and earn fees.
        </p>

        <div className="space-y-6">
          {/* Benefits */}
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <h3 className="font-semibold text-green-200 mb-2">Benefits:</h3>
            <ul className="space-y-1 text-sm text-green-100">
              <li>• Earn 0.10% fee on every solved intent</li>
              <li>• Build reputation in the solver network</li>
              <li>• Access to real-time intent feed</li>
              <li>• Automated settlement and rewards</li>
            </ul>
          </div>

          {/* Requirements */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold text-blue-200 mb-2">Requirements:</h3>
            <ul className="space-y-1 text-sm text-blue-100">
              <li>• Minimum stake: 1 SOL (refundable)</li>
              <li>• Technical knowledge of DEX integration</li>
              <li>• Ability to run solver infrastructure</li>
              <li>• Good reputation maintained through performance</li>
            </ul>
          </div>

          {/* Stake Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stake Amount (SOL)
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              min="1"
              step="0.1"
              className="input bg-gray-800 text-white"
              placeholder="1.0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum: 1 SOL. Your stake can be withdrawn when unregistering.
            </p>
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={isRegistering}
            className={`w-full btn-primary ${
              isRegistering ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isRegistering ? 'Registering...' : 'Register as Solver'}
          </button>

          {/* Warning */}
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-400 text-xl">⚠️</span>
              <div className="text-sm text-yellow-100">
                <p className="font-semibold mb-1">Important:</p>
                <p>
                  Your stake can be slashed if you submit invalid solutions or engage in
                  malicious behavior. Make sure you understand the solver responsibilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Registered solver view
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Stats Card */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Your Stats</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Solved:</span>
            <span className="text-2xl font-bold text-white">0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Success Rate:</span>
            <span className="text-2xl font-bold text-green-400">0%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Reputation:</span>
            <span className="text-2xl font-bold text-blue-400">50%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Earned:</span>
            <span className="text-2xl font-bold text-foxfi-accent">0 SOL</span>
          </div>
        </div>
      </div>

      {/* Rewards Card */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Unclaimed Rewards</h3>
        <div className="text-center py-8">
          <div className="text-5xl font-bold text-foxfi-primary mb-4">
            0 SOL
          </div>
          <button className="btn-primary">
            Claim Rewards
          </button>
        </div>
      </div>

      {/* Open Intents Feed */}
      <div className="card md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Open Intents</h3>
          <span className="text-sm text-gray-400">Live feed</span>
        </div>
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <p>No open intents at the moment</p>
          <p className="text-sm mt-2">Check back soon for new opportunities</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card md:col-span-2">
        <h3 className="text-xl font-bold text-white mb-4">Solver Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr className="text-gray-400 text-sm">
                <th className="pb-2">Rank</th>
                <th className="pb-2">Solver</th>
                <th className="pb-2">Solved</th>
                <th className="pb-2">Success Rate</th>
                <th className="pb-2">Reputation</th>
              </tr>
            </thead>
            <tbody className="text-white">
              <tr className="border-b border-gray-800">
                <td className="py-3">🥇</td>
                <td className="py-3 font-mono text-sm">Coming soon...</td>
                <td className="py-3">-</td>
                <td className="py-3">-</td>
                <td className="py-3">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

