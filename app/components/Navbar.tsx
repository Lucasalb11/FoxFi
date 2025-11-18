'use client'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export const Navbar = () => {
  return (
    <nav className="glass border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🦊</span>
            <span className="text-2xl font-bold gradient-text">FoxFi</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="https://github.com/School-of-Solana" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Docs
            </a>
            <WalletMultiButton className="!bg-foxfi-primary hover:!bg-foxfi-accent" />
          </div>
        </div>
      </div>
    </nav>
  )
}

