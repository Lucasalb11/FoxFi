# 🦊 FoxFi Protocol

**Intent-Based DEX on Solana**

FoxFi is an innovative decentralized exchange that allows users to express trading *intents* rather than executing swaps directly. Solvers compete off-chain to find the best execution, providing users with optimal prices and MEV protection.

---

## 🌟 Features

### For Traders
- **🎯 Intent-Based Trading**: Simply specify what you want to swap and your constraints
- **💰 Best Execution**: Solvers compete to give you the best price across all DEXs
- **🛡️ MEV Protection**: Sealed bid system prevents front-running
- **⚡ Fast Settlement**: On-chain execution once best solution is found
- **📊 Transparent Fees**: Only 0.15% total (0.05% protocol + 0.10% solver)

### For Solvers
- **💸 Earn Fees**: Receive 0.10% on every solved intent
- **📈 Build Reputation**: Performance-based reputation system
- **🔄 Continuous Opportunities**: Access to real-time intent feed
- **⚙️ Flexible Integration**: Integrate with any Solana DEX

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  FoxFi Protocol                          │
└─────────────────────────────────────────────────────────┘

1️⃣ User submits Intent (on-chain)
   ├─> Input token + amount
   ├─> Output token + minimum amount
   ├─> Expiration time
   └─> Tokens locked in vault

2️⃣ Solvers compete (off-chain)
   ├─> Monitor intent pool
   ├─> Query prices from Orca, Raydium, Jupiter
   ├─> Calculate optimal route
   └─> Submit solution on-chain

3️⃣ Best solution wins
   ├─> Highest output amount
   ├─> Meets minimum requirements
   ├─> First-come-first-served tiebreaker

4️⃣ Settlement (on-chain)
   ├─> Execute swap via CPI to DEXs
   ├─> Transfer output tokens to user
   ├─> Distribute fees (protocol + solver)
   └─> Update solver reputation
```

---

## 🚀 Quick Start

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (v1.18+)
- [Anchor](https://www.anchor-lang.com/docs/installation) (v0.30.1)
- [Node.js](https://nodejs.org/) (v18+)
- [Yarn](https://yarnpkg.com/) or npm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Lucasalb11/foxfi.git
cd foxfi
```

2. **Install dependencies**
```bash
yarn install
cd app && yarn install && cd ..
```

3. **Build the program**
```bash
anchor build
```

4. **Run tests**
```bash
anchor test
```

### Deployment

#### Deploy to Devnet

1. **Configure Solana CLI**
```bash
solana config set --url devnet
solana airdrop 2  # Get some SOL for deployment
```

2. **Deploy the program**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh devnet
```

3. **Initialize the protocol**
```bash
anchor run initialize-devnet
```

#### Deploy Frontend

1. **Navigate to app directory**
```bash
cd app
```

2. **Update program ID** in `app/lib/constants.ts` with your deployed program ID

3. **Run development server**
```bash
yarn dev
```

4. **Deploy to Vercel/Netlify**
```bash
# Vercel
vercel deploy

# Or Netlify
netlify deploy
```

---

## 📚 Program Instructions

### `initialize`
Initialize the protocol configuration (admin only, one-time)
```typescript
await program.methods
  .initialize(protocolFeeBps, solverFeeBps, minSolverStake, maxSlippageBps)
  .accounts({ config, admin, treasury, systemProgram })
  .rpc();
```

### `create_intent`
User creates a new swap intent
```typescript
await program.methods
  .createIntent(inputAmount, minOutputAmount, expirationSeconds)
  .accounts({
    intent, config, user,
    inputMint, outputMint,
    userInputAccount, inputVault,
    tokenProgram, systemProgram
  })
  .rpc();
```

### `register_solver`
Register as a solver in the network
```typescript
await program.methods
  .registerSolver(stakeAmount)
  .accounts({ solver, config, authority, systemProgram })
  .rpc();
```

### `submit_solution`
Solver submits a solution for an intent
```typescript
await program.methods
  .submitSolution(expectedOutput)
  .accounts({
    intent, solution, solver, config,
    solverAuthority, systemProgram
  })
  .rpc();
```

### `execute_settlement`
Execute the winning solution
```typescript
await program.methods
  .executeSettlement()
  .accounts({
    intent, solver, config,
    solverAuthority, outputMint,
    user, userOutputAccount,
    solverOutputAccount, protocolFeeAccount,
    tokenProgram
  })
  .rpc();
```

### `cancel_intent`
User cancels their intent (before execution)
```typescript
await program.methods
  .cancelIntent()
  .accounts({
    intent, config, user,
    inputMint, userInputAccount,
    inputVault, tokenProgram
  })
  .rpc();
```

### `claim_solver_rewards`
Solver claims accumulated rewards
```typescript
await program.methods
  .claimSolverRewards()
  .accounts({
    solver, config, authority,
    rewardMint, solverRewardAccount,
    tokenProgram
  })
  .rpc();
```

---

## 🧪 Testing

### Run All Tests
```bash
anchor test
```

### Run Specific Test Suite
```bash
anchor test -- --grep "Protocol Initialization"
anchor test -- --grep "Intent Creation"
anchor test -- --grep "Solution Submission"
```

### Test Coverage

The test suite includes:
- ✅ Protocol initialization
- ✅ Solver registration
- ✅ Intent creation (happy + unhappy paths)
- ✅ Solution submission
- ✅ Intent settlement
- ✅ Intent cancellation
- ✅ Fee calculations
- ✅ Reputation system
- ✅ Error handling

---

## 🔒 Security

### Implemented Security Features

1. **PDA-Based Authorization**: All accounts use PDAs with proper seeds
2. **Owner Checks**: Strict validation of account ownership
3. **Slippage Protection**: User-defined minimum output amounts
4. **Expiration Checks**: Intents expire automatically
5. **Solver Staking**: Sybil resistance through minimum stake
6. **Reputation System**: Bad actors lose reputation
7. **Fee Caps**: Maximum fees enforced on protocol level

### Security Considerations

⚠️ **This is an educational project for School of Solana**

Before production use:
- [ ] Complete professional audit
- [ ] Implement comprehensive monitoring
- [ ] Add emergency pause mechanism
- [ ] Use multisig for admin operations
- [ ] Implement rate limiting
- [ ] Add oracle price verification
- [ ] Test with real market conditions

---

## 📖 Documentation

### Account Structure

#### `ProtocolConfig`
```rust
pub struct ProtocolConfig {
    pub admin: Pubkey,              // Protocol admin
    pub protocol_fee_bps: u16,      // Protocol fee (0.05%)
    pub solver_fee_bps: u16,        // Solver fee (0.10%)
    pub min_solver_stake: u64,      // Minimum stake (1 SOL)
    pub max_slippage_bps: u16,      // Max slippage (1%)
    pub treasury: Pubkey,           // Fee destination
    // ... statistics fields
}
```

#### `Intent`
```rust
pub struct Intent {
    pub user: Pubkey,               // Intent creator
    pub input_mint: Pubkey,         // Token to swap from
    pub output_mint: Pubkey,        // Token to receive
    pub input_amount: u64,          // Amount to swap
    pub min_output_amount: u64,     // Minimum acceptable output
    pub expiration: i64,            // Unix timestamp
    pub status: IntentStatus,       // Current status
    pub winning_solver: Option<Pubkey>,
    // ... other fields
}
```

#### `Solver`
```rust
pub struct Solver {
    pub authority: Pubkey,          // Solver authority
    pub stake_amount: u64,          // Staked amount
    pub total_solved: u64,          // Successful solutions
    pub reputation_score: u64,      // Performance score
    pub unclaimed_rewards: u64,     // Pending rewards
    pub is_active: bool,            // Active status
    // ... other fields
}
```

### Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 6000 | ProtocolFeeTooHigh | Protocol fee exceeds 1% |
| 6001 | SolverFeeTooHigh | Solver fee exceeds 2% |
| 6002 | SlippageTooHigh | Slippage exceeds 10% |
| 6003 | IntentExpired | Intent has expired |
| 6004 | MinOutputNotMet | Solution below minimum |
| 6005 | SolverNotRegistered | Solver not found |
| 6006 | InsufficientSolverStake | Stake too low |
| ... | ... | ... |

---

## 🛣️ Roadmap

### Phase 1: MVP ✅ (Current)
- [x] Basic intent creation
- [x] Solver registration
- [x] Solution submission
- [x] Simple settlement
- [x] Frontend interface

### Phase 2: Enhanced Features 🚧
- [ ] Multi-hop routing
- [ ] Jupiter aggregator integration
- [ ] Price oracle verification (Pyth/Switchboard)
- [ ] Partial fill support
- [ ] Advanced solver competition

### Phase 3: Advanced Trading 🔮
- [ ] Limit orders (price-conditional intents)
- [ ] DCA (Dollar Cost Averaging) intents
- [ ] Stop-loss intents
- [ ] TWAP execution
- [ ] Cross-program composability

### Phase 4: Ecosystem 🌐
- [ ] Solver SDK
- [ ] API for integrations
- [ ] Mobile app
- [ ] Governance token
- [ ] DAO for protocol upgrades

---

## 🤝 Contributing

Contributions are welcome! This is an educational project for School of Solana.

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow Rust best practices and idioms
- Add comprehensive tests for new features
- Document all public APIs
- Use meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **School of Solana** for the learning opportunity
- **Orca** for DEX architecture inspiration
- **CoW Protocol** (Ethereum) for intent-based trading concepts
- **Solana Foundation** for ecosystem support
- **Anchor Framework** for excellent developer experience

---

## 📞 Contact

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)
- **Discord**: School of Solana Discord

---

## ⚖️ Disclaimer

This is an educational project created for School of Solana Task 5. It is NOT audited and should NOT be used in production without proper security review. Use at your own risk.

---

<div align="center">
  <p>Built with ❤️ for the Solana ecosystem</p>
  <p>🦊 FoxFi Protocol - Making DeFi trading smarter, one intent at a time</p>
</div>

