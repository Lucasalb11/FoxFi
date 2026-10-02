'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { SwapInterface } from '@/components/SwapInterface'
import { IntentDashboard } from '@/components/IntentDashboard'
import { Analytics } from '@/components/Analytics'
import { SolverPortal } from '@/components/SolverPortal'
import toast, { Toaster } from 'react-hot-toast'

type Tab = 'swap' | 'intents' | 'solver' | 'analytics'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('swap')

  return (
    <main className="min-h-screen bg-gradient-to-br from-foxfi-dark via-gray-900 to-foxfi-secondary">
      <Toaster position="top-right" />
      <Navbar />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">FoxFi Protocol</span>
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Intent-Based DEX on Solana
          </p>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Say what you want to trade and the least you&apos;ll accept. Solvers bid for 20 seconds; the best quote
            settles atomically, or you get your tokens back. Runs on Solana devnet with demo tokens.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 glass rounded-xl p-2 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('swap')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'swap'
                ? 'bg-foxfi-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🦊 Swap
          </button>
          <button
            onClick={() => setActiveTab('intents')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'intents'
                ? 'bg-foxfi-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📋 My Intents
          </button>
          <button
            onClick={() => setActiveTab('solver')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'solver'
                ? 'bg-foxfi-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⚡ Solver
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-foxfi-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📊 Analytics
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto animate-fadeIn">
          {activeTab === 'swap' && <SwapInterface />}
          {activeTab === 'intents' && <IntentDashboard />}
          {activeTab === 'solver' && <SolverPortal />}
          {activeTab === 'analytics' && <Analytics />}
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="card text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2 text-white">Intent-Based</h3>
            <p className="text-gray-400">
              Express what you want, not how to do it. Solvers find the best execution.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-2 text-white">MEV Protected</h3>
            <p className="text-gray-400">
              Sealed bids and price oracles protect you from front-running.
            </p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2 text-white">Best Prices</h3>
            <p className="text-gray-400">
              Solvers compete to give you optimal execution across all DEXs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-500 pb-8">
          <p className="mb-2">Built for School of Solana 🚀</p>
          <p className="text-sm">
            FoxFi Protocol - Making DeFi trading smarter, one intent at a time
          </p>
        </footer>
      </div>
    </main>
  )
}

