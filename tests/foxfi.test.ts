import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Foxfi } from "../target/types/foxfi";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { expect } from "chai";

describe("FoxFi Protocol - Intent-Based DEX", () => {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Foxfi as Program<Foxfi>;
  
  // Test accounts
  let admin: Keypair;
  let treasury: Keypair;
  let user: Keypair;
  let solver: Keypair;
  
  // Token mints
  let inputMint: PublicKey;
  let outputMint: PublicKey;
  
  // Token accounts
  let userInputAccount: PublicKey;
  let userOutputAccount: PublicKey;
  let solverOutputAccount: PublicKey;
  let treasuryOutputAccount: PublicKey;
  
  // PDAs
  let configPda: PublicKey;
  let solverPda: PublicKey;
  let intentPda: PublicKey;
  let inputVaultPda: PublicKey;
  
  // Test parameters
  const PROTOCOL_FEE_BPS = 5; // 0.05%
  const SOLVER_FEE_BPS = 10; // 0.10%
  const MIN_SOLVER_STAKE = new anchor.BN(LAMPORTS_PER_SOL); // 1 SOL
  const MAX_SLIPPAGE_BPS = 100; // 1%
  
  const INPUT_AMOUNT = new anchor.BN(1_000_000); // 1 token (6 decimals)
  const MIN_OUTPUT_AMOUNT = new anchor.BN(900_000); // 0.9 token
  const EXPIRATION_SECONDS = new anchor.BN(3600); // 1 hour

  before(async () => {
    // Generate keypairs
    admin = Keypair.generate();
    treasury = Keypair.generate();
    user = Keypair.generate();
    solver = Keypair.generate();

    // Airdrop SOL to test accounts
    await airdrop(provider.connection, admin.publicKey, 10);
    await airdrop(provider.connection, user.publicKey, 10);
    await airdrop(provider.connection, solver.publicKey, 10);

    // Create token mints
    inputMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      6 // decimals
    );

    outputMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      6
    );

    // Create token accounts for user
    userInputAccount = await createAccount(
      provider.connection,
      user,
      inputMint,
      user.publicKey
    );

    userOutputAccount = await createAccount(
      provider.connection,
      user,
      outputMint,
      user.publicKey
    );

    // Create token account for solver
    solverOutputAccount = await createAccount(
      provider.connection,
      solver,
      outputMint,
      solver.publicKey
    );

    // Create token account for treasury
    treasuryOutputAccount = await createAccount(
      provider.connection,
      admin,
      outputMint,
      treasury.publicKey
    );

    // Mint tokens
    await mintTo(
      provider.connection,
      admin,
      inputMint,
      userInputAccount,
      admin.publicKey,
      10_000_000 // 10 tokens
    );

    await mintTo(
      provider.connection,
      admin,
      outputMint,
      solverOutputAccount,
      admin.publicKey,
      10_000_000 // 10 tokens
    );

    // Derive PDAs
    [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    [solverPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("solver"), solver.publicKey.toBuffer()],
      program.programId
    );

    [inputVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), inputMint.toBuffer()],
      program.programId
    );
  });

  describe("1. Protocol Initialization", () => {
    it("✅ Should initialize protocol config", async () => {
      const tx = await program.methods
        .initialize(
          PROTOCOL_FEE_BPS,
          SOLVER_FEE_BPS,
          MIN_SOLVER_STAKE,
          MAX_SLIPPAGE_BPS
        )
        .accounts({
          config: configPda,
          admin: admin.publicKey,
          treasury: treasury.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([admin])
        .rpc();

      console.log("Initialize tx:", tx);

      // Verify config
      const config = await program.account.protocolConfig.fetch(configPda);
      expect(config.admin.toString()).to.equal(admin.publicKey.toString());
      expect(config.protocolFeeBps).to.equal(PROTOCOL_FEE_BPS);
      expect(config.solverFeeBps).to.equal(SOLVER_FEE_BPS);
      expect(config.minSolverStake.toNumber()).to.equal(MIN_SOLVER_STAKE.toNumber());
      expect(config.totalIntents.toNumber()).to.equal(0);
    });

    it("❌ Should fail to initialize with fees too high", async () => {
      const anotherConfig = Keypair.generate();
      
      try {
        await program.methods
          .initialize(
            200, // Too high: 2%
            SOLVER_FEE_BPS,
            MIN_SOLVER_STAKE,
            MAX_SLIPPAGE_BPS
          )
          .accounts({
            config: anotherConfig.publicKey,
            admin: admin.publicKey,
            treasury: treasury.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([admin])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.toString()).to.include("ProtocolFeeTooHigh");
      }
    });
  });

  describe("2. Solver Registration", () => {
    it("✅ Should register solver with valid stake", async () => {
      const tx = await program.methods
        .registerSolver(MIN_SOLVER_STAKE)
        .accounts({
          solver: solverPda,
          config: configPda,
          authority: solver.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([solver])
        .rpc();

      console.log("Register solver tx:", tx);

      // Verify solver
      const solverAccount = await program.account.solver.fetch(solverPda);
      expect(solverAccount.authority.toString()).to.equal(solver.publicKey.toString());
      expect(solverAccount.stakeAmount.toNumber()).to.equal(MIN_SOLVER_STAKE.toNumber());
      expect(solverAccount.isActive).to.be.true;
      expect(solverAccount.totalSolved.toNumber()).to.equal(0);
      expect(solverAccount.reputationScore.toNumber()).to.equal(5000); // 50%
    });

    it("❌ Should fail to register with insufficient stake", async () => {
      const anotherSolver = Keypair.generate();
      await airdrop(provider.connection, anotherSolver.publicKey, 1);

      const [anotherSolverPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("solver"), anotherSolver.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .registerSolver(new anchor.BN(100_000)) // Too low
          .accounts({
            solver: anotherSolverPda,
            config: configPda,
            authority: anotherSolver.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([anotherSolver])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.toString()).to.include("InsufficientSolverStake");
      }
    });
  });

  describe("3. Intent Creation", () => {
    it("✅ Should create intent successfully", async () => {
      // Get current total intents to derive PDA
      const config = await program.account.protocolConfig.fetch(configPda);
      const intentSeed = config.totalIntents;

      [intentPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("intent"),
          user.publicKey.toBuffer(),
          intentSeed.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const tx = await program.methods
        .createIntent(
          INPUT_AMOUNT,
          MIN_OUTPUT_AMOUNT,
          EXPIRATION_SECONDS
        )
        .accounts({
          intent: intentPda,
          config: configPda,
          user: user.publicKey,
          inputMint: inputMint,
          outputMint: outputMint,
          userInputAccount: userInputAccount,
          inputVault: inputVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      console.log("Create intent tx:", tx);

      // Verify intent
      const intent = await program.account.intent.fetch(intentPda);
      expect(intent.user.toString()).to.equal(user.publicKey.toString());
      expect(intent.inputAmount.toNumber()).to.equal(INPUT_AMOUNT.toNumber());
      expect(intent.minOutputAmount.toNumber()).to.equal(MIN_OUTPUT_AMOUNT.toNumber());
      expect(intent.status).to.deep.equal({ open: {} });

      // Verify tokens transferred to vault
      const vaultAccount = await getAccount(provider.connection, inputVaultPda);
      expect(Number(vaultAccount.amount)).to.equal(INPUT_AMOUNT.toNumber());
    });

    it("❌ Should fail with zero input amount", async () => {
      const config = await program.account.protocolConfig.fetch(configPda);
      const intentSeed = config.totalIntents;

      const [badIntentPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("intent"),
          user.publicKey.toBuffer(),
          intentSeed.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      try {
        await program.methods
          .createIntent(
            new anchor.BN(0), // Invalid
            MIN_OUTPUT_AMOUNT,
            EXPIRATION_SECONDS
          )
          .accounts({
            intent: badIntentPda,
            config: configPda,
            user: user.publicKey,
            inputMint: inputMint,
            outputMint: outputMint,
            userInputAccount: userInputAccount,
            inputVault: inputVaultPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.toString()).to.include("InvalidInputAmount");
      }
    });

    it("❌ Should fail with invalid expiration", async () => {
      const config = await program.account.protocolConfig.fetch(configPda);
      const intentSeed = config.totalIntents;

      const [badIntentPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("intent"),
          user.publicKey.toBuffer(),
          intentSeed.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      try {
        await program.methods
          .createIntent(
            INPUT_AMOUNT,
            MIN_OUTPUT_AMOUNT,
            new anchor.BN(30) // Too short: < 60 seconds
          )
          .accounts({
            intent: badIntentPda,
            config: configPda,
            user: user.publicKey,
            inputMint: inputMint,
            outputMint: outputMint,
            userInputAccount: userInputAccount,
            inputVault: inputVaultPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.toString()).to.include("InvalidExpiration");
      }
    });
  });

  describe("4. Solution Submission", () => {
    let solutionPda: PublicKey;

    it("✅ Should submit solution successfully", async () => {
      const EXPECTED_OUTPUT = new anchor.BN(950_000); // Better than minimum

      [solutionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("solution"),
          intentPda.toBuffer(),
          solverPda.toBuffer(),
        ],
        program.programId
      );

      const tx = await program.methods
        .submitSolution(EXPECTED_OUTPUT)
        .accounts({
          intent: intentPda,
          solution: solutionPda,
          solver: solverPda,
          config: configPda,
          solverAuthority: solver.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([solver])
        .rpc();

      console.log("Submit solution tx:", tx);

      // Verify solution
      const solution = await program.account.solution.fetch(solutionPda);
      expect(solution.solver.toString()).to.equal(solverPda.toString());
      expect(solution.expectedOutput.toNumber()).to.equal(EXPECTED_OUTPUT.toNumber());
      expect(solution.isWinning).to.be.true;

      // Verify intent updated
      const intent = await program.account.intent.fetch(intentPda);
      expect(intent.status).to.deep.equal({ readyForSettlement: {} });
      expect(intent.winningSolver).to.not.be.null;
    });

    it("❌ Should fail to submit solution below minimum", async () => {
      const anotherUser = Keypair.generate();
      await airdrop(provider.connection, anotherUser.publicKey, 1);

      const [anotherSolverPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("solver"), anotherUser.publicKey.toBuffer()],
        program.programId
      );

      // Register another solver
      await program.methods
        .registerSolver(MIN_SOLVER_STAKE)
        .accounts({
          solver: anotherSolverPda,
          config: configPda,
          authority: anotherUser.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([anotherUser])
        .rpc();

      const [badSolutionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("solution"),
          intentPda.toBuffer(),
          anotherSolverPda.toBuffer(),
        ],
        program.programId
      );

      try {
        await program.methods
          .submitSolution(new anchor.BN(800_000)) // Below minimum
          .accounts({
            intent: intentPda,
            solution: badSolutionPda,
            solver: anotherSolverPda,
            config: configPda,
            solverAuthority: anotherUser.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([anotherUser])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.toString()).to.include("MinOutputNotMet");
      }
    });
  });

  describe("5. Intent Settlement", () => {
    it("✅ Should execute settlement successfully", async () => {
      const userOutputAccountBefore = await getAccount(
        provider.connection,
        userOutputAccount
      );

      const tx = await program.methods
        .executeSettlement()
        .accounts({
          intent: intentPda,
          solver: solverPda,
          config: configPda,
          solverAuthority: solver.publicKey,
          outputMint: outputMint,
          user: user.publicKey,
          userOutputAccount: userOutputAccount,
          solverOutputAccount: solverOutputAccount,
          protocolFeeAccount: treasuryOutputAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([solver])
        .rpc();

      console.log("Execute settlement tx:", tx);

      // Verify intent executed
      const intent = await program.account.intent.fetch(intentPda);
      expect(intent.status).to.deep.equal({ executed: {} });
      expect(intent.actualOutput.toNumber()).to.be.greaterThan(0);

      // Verify user received tokens
      const userOutputAccountAfter = await getAccount(
        provider.connection,
        userOutputAccount
      );
      const received = Number(userOutputAccountAfter.amount) - 
                       Number(userOutputAccountBefore.amount);
      expect(received).to.be.greaterThan(0);

      // Verify solver rewards
      const solverAccount = await program.account.solver.fetch(solverPda);
      expect(solverAccount.unclaimedRewards.toNumber()).to.be.greaterThan(0);
      expect(solverAccount.totalSolved.toNumber()).to.equal(1);
    });
  });

  describe("6. Intent Cancellation", () => {
    let cancelIntentPda: PublicKey;

    before(async () => {
      // Create another intent to cancel
      const config = await program.account.protocolConfig.fetch(configPda);
      const intentSeed = config.totalIntents;

      [cancelIntentPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("intent"),
          user.publicKey.toBuffer(),
          intentSeed.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      // Mint more tokens to user
      await mintTo(
        provider.connection,
        admin,
        inputMint,
        userInputAccount,
        admin.publicKey,
        10_000_000
      );

      await program.methods
        .createIntent(
          INPUT_AMOUNT,
          MIN_OUTPUT_AMOUNT,
          EXPIRATION_SECONDS
        )
        .accounts({
          intent: cancelIntentPda,
          config: configPda,
          user: user.publicKey,
          inputMint: inputMint,
          outputMint: outputMint,
          userInputAccount: userInputAccount,
          inputVault: inputVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();
    });

    it("✅ Should cancel intent successfully", async () => {
      const userInputAccountBefore = await getAccount(
        provider.connection,
        userInputAccount
      );

      const tx = await program.methods
        .cancelIntent()
        .accounts({
          intent: cancelIntentPda,
          config: configPda,
          user: user.publicKey,
          inputMint: inputMint,
          userInputAccount: userInputAccount,
          inputVault: inputVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();

      console.log("Cancel intent tx:", tx);

      // Verify intent cancelled
      const intent = await program.account.intent.fetch(cancelIntentPda);
      expect(intent.status).to.deep.equal({ cancelled: {} });

      // Verify tokens returned
      const userInputAccountAfter = await getAccount(
        provider.connection,
        userInputAccount
      );
      const returned = Number(userInputAccountAfter.amount) - 
                       Number(userInputAccountBefore.amount);
      expect(returned).to.equal(INPUT_AMOUNT.toNumber());
    });
  });

  describe("7. Protocol Statistics", () => {
    it("✅ Should track global statistics", async () => {
      const config = await program.account.protocolConfig.fetch(configPda);
      
      expect(config.totalIntents.toNumber()).to.be.greaterThan(0);
      expect(config.totalExecuted.toNumber()).to.be.greaterThan(0);
      expect(config.totalProtocolFees.toNumber()).to.be.greaterThan(0);
      expect(config.totalSolverFees.toNumber()).to.be.greaterThan(0);

      console.log("\n📊 Protocol Statistics:");
      console.log("Total Intents:", config.totalIntents.toNumber());
      console.log("Total Executed:", config.totalExecuted.toNumber());
      console.log("Protocol Fees:", config.totalProtocolFees.toNumber());
      console.log("Solver Fees:", config.totalSolverFees.toNumber());
    });
  });
});

// Helper function to airdrop SOL
async function airdrop(connection: any, publicKey: PublicKey, amount: number) {
  const signature = await connection.requestAirdrop(
    publicKey,
    amount * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(signature);
}

