# 🚀 FoxFi Protocol - Quick Start Guide

## ⚡ Fast Track to Running FoxFi

### Prerequisites Check
```bash
# Verify installations
anchor --version  # Should be 0.30.1+
solana --version  # Should be 1.18+
node --version    # Should be 18+
```

---

## 🏃‍♂️ 3-Minute Setup

### 1. Install Dependencies
```bash
# Root dependencies
npm install

# Frontend dependencies
cd app && yarn install && cd ..
```

### 2. Build & Test
```bash
# Build the Anchor program
anchor build

# Run tests (takes ~30 seconds)
anchor test
```

### 3. Deploy to Devnet
```bash
# Configure Solana CLI
solana config set --url devnet

# Get some SOL (for deployment)
solana airdrop 2

# Deploy (takes ~1 minute)
./scripts/deploy.sh devnet

# Initialize protocol
ts-node scripts/initialize.ts
```

### 4. Run Frontend
```bash
cd app

# Development mode
yarn dev

# Open browser to http://localhost:3000
```

---

## 🎮 Quick User Flow

### As a Trader:

1. **Connect Wallet** (Phantom or Solflare)

2. **Create Intent**:
   - Go to "Swap" tab
   - Enter input token mint
   - Enter amount to swap
   - Enter output token mint
   - Set minimum output (slippage protection)
   - Choose expiration time
   - Click "Create Intent"

3. **Wait for Solvers** (1-5 seconds):
   - Solvers compete off-chain
   - Best solution is submitted

4. **Settlement** (automatic):
   - Winning solver executes swap
   - You receive tokens
   - Fees are distributed

### As a Solver:

1. **Register**:
   - Go to "Solver" tab
   - Enter stake amount (minimum 1 SOL)
   - Click "Register as Solver"

2. **Monitor Intents**:
   - View open intents feed
   - Calculate best execution route
   - Submit solutions

3. **Earn Rewards**:
   - Successfully solved intents earn 0.10% fee
   - Build reputation through performance
   - Claim rewards anytime

---

## 📊 Test the Protocol

### Run All Tests
```bash
anchor test
```

### Test Specific Features
```bash
# Test intent creation
anchor test -- --grep "Intent Creation"

# Test solver operations
anchor test -- --grep "Solver"

# Test settlement
anchor test -- --grep "Settlement"
```

---

## 🐛 Troubleshooting

### "Anchor not found"
```bash
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
```

### "Insufficient SOL"
```bash
solana airdrop 2
# Wait 30 seconds, then try again
```

### "Program already deployed"
```bash
# If you want to redeploy with new program ID:
anchor keys sync
anchor build
anchor deploy
```

### Frontend build errors
```bash
cd app
rm -rf node_modules .next
yarn install
yarn dev
```

---

## 📚 Next Steps

### Learn More
- Read full [README.md](README.md)
- Check [PROJECT_DESCRIPTION.md](PROJECT_DESCRIPTION.md)
- Explore code comments in `programs/foxfi/src/`

### Customize
- Modify fee structure in `initialize.ts`
- Adjust UI colors in `app/tailwind.config.ts`
- Add new features to program

### Deploy Production
- [ ] Get security audit
- [ ] Deploy to mainnet: `./scripts/deploy.sh mainnet`
- [ ] Deploy frontend to Vercel
- [ ] Set up monitoring

---

## 💡 Tips

### For Development
- Use `anchor test --skip-build` to save time
- Check logs with `solana logs` while testing
- Use Solana Explorer to inspect transactions

### For Frontend
- Use devtools to debug wallet connections
- Check console for Anchor errors
- Test with small amounts first

### For Solvers
- Start with simple single-hop routes
- Build reputation before competing on large intents
- Monitor gas costs vs fees earned

---

## 🆘 Get Help

- **Documentation**: Check README.md
- **Issues**: Open GitHub issue
- **Discord**: School of Solana Discord
- **Logs**: Run `solana logs` for real-time debugging

---

## 🎉 Success Checklist

After setup, you should be able to:
- ✅ Build program without errors
- ✅ Pass all tests
- ✅ Deploy to devnet
- ✅ Connect wallet to frontend
- ✅ Create an intent
- ✅ View intent dashboard
- ✅ Register as solver

If all above work, **congratulations!** 🎊 You're ready to use FoxFi!

---

<div align="center">
  <p><strong>Happy Swapping! 🦊</strong></p>
  <p><i>Questions? Check the full README.md or PROJECT_DESCRIPTION.md</i></p>
</div>

