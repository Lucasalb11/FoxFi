#!/bin/bash

# FoxFi Protocol Deployment Script
# Deploy to Devnet or Mainnet

set -e

echo "🦊 FoxFi Protocol Deployment Script"
echo "===================================="
echo ""

# Check if network argument is provided
if [ -z "$1" ]; then
  echo "Usage: ./scripts/deploy.sh [devnet|mainnet]"
  exit 1
fi

NETWORK=$1

if [ "$NETWORK" != "devnet" ] && [ "$NETWORK" != "mainnet" ]; then
  echo "Error: Network must be 'devnet' or 'mainnet'"
  exit 1
fi

echo "📍 Target Network: $NETWORK"
echo ""

# Build the program
echo "🔨 Building program..."
anchor build

# Run tests before deployment
if [ "$NETWORK" == "devnet" ]; then
  echo ""
  echo "🧪 Running tests..."
  anchor test --skip-local-validator
fi

# Deploy
echo ""
echo "🚀 Deploying to $NETWORK..."
anchor deploy --provider.cluster $NETWORK

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/foxfi-keypair.json)
echo ""
echo "✅ Deployment successful!"
echo "📝 Program ID: $PROGRAM_ID"
echo ""

# Verify deployment
echo "🔍 Verifying deployment..."
solana program show $PROGRAM_ID --url $NETWORK

echo ""
echo "🎉 FoxFi Protocol deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Initialize the protocol with: anchor run initialize-$NETWORK"
echo "2. Update frontend with program ID"
echo "3. Deploy frontend to Vercel/Netlify"
echo ""

