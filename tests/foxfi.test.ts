import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  createMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { expect } from "chai";
import { Foxfi } from "../target/types/foxfi";

const BN = anchor.BN;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const AUCTION_SECONDS = 20;
const EXPIRATION = 60; // minimum the program accepts

describe("FoxFi: auction, settlement and refunds", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const program = anchor.workspace.Foxfi as Program<Foxfi>;

  const admin = Keypair.generate();
  const treasury = Keypair.generate();
  const user = Keypair.generate();
  const solverA = Keypair.generate();
  const solverB = Keypair.generate();

  let inputMint: PublicKey;
  let outputMint: PublicKey;
  const ata: Record<string, PublicKey> = {};

  const pda = (...seeds: (Buffer | Uint8Array)[]) => PublicKey.findProgramAddressSync(seeds, program.programId)[0];
  const configPda = pda(Buffer.from("config"));
  const solverPda = (k: Keypair) => pda(Buffer.from("solver"), k.publicKey.toBuffer());
  const intentPda = (seed: number) =>
    pda(Buffer.from("intent"), user.publicKey.toBuffer(), new BN(seed).toArrayLike(Buffer, "le", 8));
  const solutionPda = (intent: PublicKey, solver: Keypair) =>
    pda(Buffer.from("solution"), intent.toBuffer(), solverPda(solver).toBuffer());
  const vaultPda = () => pda(Buffer.from("vault"), inputMint.toBuffer());
  const balance = async (a: PublicKey) => Number((await getAccount(connection, a)).amount);

  const expectError = async (p: Promise<unknown>, code: string) => {
    try {
      await p;
      expect.fail(`expected ${code}`);
    } catch (e) {
      const text = String(e) + JSON.stringify((e as { logs?: string[] }).logs ?? []);
      expect(text, text.slice(0, 1200)).to.include(code);
    }
  };

  const createIntent = async (input: number, minOut: number) => {
    const seed = (await program.account.protocolConfig.fetch(configPda)).totalIntents.toNumber();
    await program.methods
      .createIntent(new BN(input), new BN(minOut), new BN(EXPIRATION))
      .accountsPartial({
        intent: intentPda(seed),
        config: configPda,
        user: user.publicKey,
        inputMint,
        outputMint,
        userInputAccount: ata.userIn,
        inputVault: vaultPda(),
      })
      .signers([user])
      .rpc();
    return intentPda(seed);
  };

  const bid = (intent: PublicKey, solver: Keypair, out: number) =>
    program.methods
      .submitSolution(new BN(out))
      .accountsPartial({
        intent,
        solution: solutionPda(intent, solver),
        solver: solverPda(solver),
        config: configPda,
        solverAuthority: solver.publicKey,
      })
      .signers([solver])
      .rpc();

  const settle = (intent: PublicKey, solver: Keypair, name: "A" | "B") =>
    program.methods
      .executeSettlement()
      .accountsPartial({
        intent,
        solver: solverPda(solver),
        config: configPda,
        solverAuthority: solver.publicKey,
        user: user.publicKey,
        inputMint,
        outputMint,
        inputVault: vaultPda(),
        userOutputAccount: ata.userOut,
        solverOutputAccount: ata[`solver${name}Out`],
        solverInputAccount: ata[`solver${name}In`],
        protocolFeeAccount: ata.treasuryOut,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([solver])
      .rpc();

  const refund = (intent: PublicKey, winningSolver: PublicKey | null) =>
    program.methods
      .cancelIntent()
      .accountsPartial({
        intent,
        config: configPda,
        user: user.publicKey,
        inputMint,
        userInputAccount: ata.userIn,
        inputVault: vaultPda(),
        winningSolver,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

  let intentA: PublicKey; // competitive auction, settled
  let intentC: PublicKey; // winner never settles, user refunds after expiry

  before(async () => {
    for (const k of [admin, user, solverA, solverB]) {
      await connection.confirmTransaction(await connection.requestAirdrop(k.publicKey, 5 * LAMPORTS_PER_SOL));
    }
    inputMint = await createMint(connection, admin, admin.publicKey, null, 6);
    outputMint = await createMint(connection, admin, admin.publicKey, null, 6);
    const make = async (mint: PublicKey, owner: PublicKey) =>
      (await getOrCreateAssociatedTokenAccount(connection, admin, mint, owner)).address;
    ata.userIn = await make(inputMint, user.publicKey);
    ata.userOut = await make(outputMint, user.publicKey);
    ata.solverAIn = await make(inputMint, solverA.publicKey);
    ata.solverAOut = await make(outputMint, solverA.publicKey);
    ata.solverBIn = await make(inputMint, solverB.publicKey);
    ata.solverBOut = await make(outputMint, solverB.publicKey);
    ata.treasuryOut = await make(outputMint, treasury.publicKey);
    await mintTo(connection, admin, inputMint, ata.userIn, admin, 10_000_000);
    await mintTo(connection, admin, outputMint, ata.solverAOut, admin, 10_000_000);
    await mintTo(connection, admin, outputMint, ata.solverBOut, admin, 10_000_000);

    await program.methods
      .initialize(5, 10, new BN(0.1 * LAMPORTS_PER_SOL), 100)
      .accountsPartial({ config: configPda, admin: admin.publicKey, treasury: treasury.publicKey })
      .signers([admin])
      .rpc();
    await program.methods
      .initializeVault()
      .accountsPartial({ config: configPda, tokenMint: inputMint, vault: vaultPda(), payer: admin.publicKey })
      .signers([admin])
      .rpc();
  });

  it("locks a real stake when a solver registers", async () => {
    for (const s of [solverA, solverB]) {
      await program.methods
        .registerSolver(new BN(0.1 * LAMPORTS_PER_SOL))
        .accountsPartial({ solver: solverPda(s), config: configPda, authority: s.publicKey })
        .signers([s])
        .rpc();
    }
    const info = await connection.getAccountInfo(solverPda(solverA));
    const rent = await connection.getMinimumBalanceForRentExemption(info!.data.length);
    expect(info!.lamports - rent).to.equal(0.1 * LAMPORTS_PER_SOL);
  });

  it("keeps the best quote: a later, worse bid doesn't replace it", async () => {
    intentA = await createIntent(1_000_000, 900_000);
    intentC = await createIntent(1_000_000, 900_000);
    await bid(intentA, solverB, 990_000);
    await bid(intentA, solverA, 950_000);
    await bid(intentC, solverA, 920_000);

    const a = await program.account.intent.fetch(intentA);
    expect(a.bestOutput.toNumber()).to.equal(990_000);
    expect(a.winningSolver!.toBase58()).to.equal(solverPda(solverB).toBase58());
  });

  it("rejects bids below the minimum, and refunds right away when nobody bid", async () => {
    const intentB = await createIntent(500_000, 450_000);
    await expectError(bid(intentB, solverA, 400_000), "MinOutputNotMet");
    const before = await balance(ata.userIn);
    await refund(intentB, null);
    expect((await balance(ata.userIn)) - before).to.equal(500_000);
  });

  it("doesn't settle while bidding is open", async () => {
    await expectError(settle(intentA, solverB, "B"), "AuctionStillOpen");
  });

  it("settles at the winning quote and pays the solver the input", async () => {
    await sleep((AUCTION_SECONDS + 2) * 1000);
    await expectError(settle(intentA, solverA, "A"), "Unauthorized");

    const userOut = await balance(ata.userOut);
    const solverIn = await balance(ata.solverBIn);
    const fees = await balance(ata.treasuryOut);
    await settle(intentA, solverB, "B");

    const fee = Math.floor((990_000 * 5) / 10_000);
    expect((await balance(ata.userOut)) - userOut).to.equal(990_000 - fee);
    expect((await balance(ata.treasuryOut)) - fees).to.equal(fee);
    expect((await balance(ata.solverBIn)) - solverIn).to.equal(1_000_000);
    expect((await program.account.intent.fetch(intentA)).status).to.deep.equal({ executed: {} });
  });

  it("refunds the user once the winner misses the deadline, and penalises the winner", async () => {
    await expectError(refund(intentC, solverPda(solverA)), "RefundNotAvailable");
    const expiration = (await program.account.intent.fetch(intentC)).expiration.toNumber();
    await sleep(Math.max(0, expiration - Math.floor(Date.now() / 1000) + 3) * 1000);

    const before = await balance(ata.userIn);
    await refund(intentC, solverPda(solverA));
    expect((await balance(ata.userIn)) - before).to.equal(1_000_000);
    const solver = await program.account.solver.fetch(solverPda(solverA));
    expect(solver.totalFailed.toNumber()).to.equal(1);
  });

  it("returns the stake when a solver leaves", async () => {
    const before = await connection.getBalance(solverB.publicKey);
    await program.methods
      .closeSolver()
      .accountsPartial({ solver: solverPda(solverB), authority: solverB.publicKey })
      .signers([solverB])
      .rpc();
    expect((await connection.getBalance(solverB.publicKey)) - before).to.be.greaterThan(0.1 * LAMPORTS_PER_SOL);
  });
});
