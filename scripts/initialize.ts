/**
 * FoxFi Protocol Initialization Script
 * 
 * This script initializes the protocol configuration after deployment
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Foxfi } from "../target/types/foxfi";
import { PublicKey, Keypair } from "@solana/web3.js";

const PROTOCOL_FEE_BPS = 5;      // 0.05%
const SOLVER_FEE_BPS = 10;       // 0.10%
const MIN_SOLVER_STAKE = 1_000_000_000; // 1 SOL
const MAX_SLIPPAGE_BPS = 100;    // 1%

async function initialize() {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Foxfi as Program<Foxfi>;
  
  console.log("🦊 FoxFi Protocol Initialization");
  console.log("================================");
  console.log("");
  console.log("Program ID:", program.programId.toString());
  console.log("Admin:", provider.wallet.publicKey.toString());
  console.log("");

  // Derive config PDA
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );

  console.log("Config PDA:", configPda.toString());
  console.log("");

  // Check if already initialized
  try {
    const config = await program.account.protocolConfig.fetch(configPda);
    console.log("⚠️  Protocol already initialized!");
    console.log("");
    console.log("Current Configuration:");
    console.log("- Admin:", config.admin.toString());
    console.log("- Protocol Fee:", config.protocolFeeBps, "bps");
    console.log("- Solver Fee:", config.solverFeeBps, "bps");
    console.log("- Min Solver Stake:", config.minSolverStake.toString());
    console.log("- Total Intents:", config.totalIntents.toString());
    console.log("");
    return;
  } catch (error) {
    // Not initialized yet, continue
  }

  console.log("Initializing with parameters:");
  console.log("- Protocol Fee:", PROTOCOL_FEE_BPS, "bps (0.05%)");
  console.log("- Solver Fee:", SOLVER_FEE_BPS, "bps (0.10%)");
  console.log("- Min Solver Stake:", MIN_SOLVER_STAKE / 1e9, "SOL");
  console.log("- Max Slippage:", MAX_SLIPPAGE_BPS, "bps (1%)");
  console.log("");

  // Create treasury keypair (in production, use a multisig)
  const treasury = Keypair.generate();
  console.log("Treasury:", treasury.publicKey.toString());
  console.log("");

  // Initialize
  console.log("📝 Sending transaction...");
  const tx = await program.methods
    .initialize(
      PROTOCOL_FEE_BPS,
      SOLVER_FEE_BPS,
      new anchor.BN(MIN_SOLVER_STAKE),
      MAX_SLIPPAGE_BPS
    )
    .accounts({
      config: configPda,
      admin: provider.wallet.publicKey,
      treasury: treasury.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("✅ Transaction successful!");
  console.log("Transaction signature:", tx);
  console.log("");

  // Fetch and display config
  const config = await program.account.protocolConfig.fetch(configPda);
  console.log("✨ Protocol Initialized Successfully!");
  console.log("");
  console.log("Configuration:");
  console.log("- Admin:", config.admin.toString());
  console.log("- Treasury:", config.treasury.toString());
  console.log("- Protocol Fee:", config.protocolFeeBps, "bps");
  console.log("- Solver Fee:", config.solverFeeBps, "bps");
  console.log("- Min Solver Stake:", config.minSolverStake.toString());
  console.log("");
  console.log("🎉 FoxFi Protocol is ready!");
  console.log("");
  console.log("⚠️  Important: Save the treasury private key securely!");
  console.log("Treasury private key:", `[${treasury.secretKey.toString()}]`);
}

initialize()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

