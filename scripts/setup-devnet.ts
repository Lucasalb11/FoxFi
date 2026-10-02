/**
 * One-time devnet setup for the FoxFi demo, after `anchor deploy --provider.cluster devnet`.
 *
 *   ANCHOR_PROVIDER_URL=https://api.devnet.solana.com ANCHOR_WALLET=~/.config/solana/id.json \
 *     npx ts-node scripts/setup-devnet.ts
 *
 * Creates a faucet keypair (written to .secrets/, git-ignored) that owns two demo
 * mints, initialises the protocol config and the input vault, and prints the env
 * vars for the frontend. Safe to re-run: existing accounts are left alone.
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import fs from "fs";
import path from "path";
import { Foxfi } from "../target/types/foxfi";

const SECRETS = path.join(process.cwd(), ".secrets");
const FAUCET_FILE = path.join(SECRETS, "faucet.json");
const MINTS_FILE = path.join(SECRETS, "mints.json");

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Foxfi as Program<Foxfi>;
  const connection = provider.connection;
  const admin = (provider.wallet as anchor.Wallet).payer;

  fs.mkdirSync(SECRETS, { recursive: true });
  const faucet = fs.existsSync(FAUCET_FILE)
    ? Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(FAUCET_FILE, "utf8"))))
    : Keypair.generate();
  fs.writeFileSync(FAUCET_FILE, JSON.stringify(Array.from(faucet.secretKey)), { mode: 0o600 });

  // The faucet pays for users' token accounts and mint transactions.
  if ((await connection.getBalance(faucet.publicKey)) < 0.3 * LAMPORTS_PER_SOL) {
    await anchor.web3.sendAndConfirmTransaction(
      connection,
      new Transaction().add(SystemProgram.transfer({ fromPubkey: admin.publicKey, toPubkey: faucet.publicKey, lamports: 0.5 * LAMPORTS_PER_SOL })),
      [admin]
    );
  }

  let mints: { input: string; output: string };
  if (fs.existsSync(MINTS_FILE)) {
    mints = JSON.parse(fs.readFileSync(MINTS_FILE, "utf8"));
  } else {
    const input = await createMint(connection, admin, faucet.publicKey, null, 6);
    const output = await createMint(connection, admin, faucet.publicKey, null, 6);
    mints = { input: input.toBase58(), output: output.toBase58() };
    fs.writeFileSync(MINTS_FILE, JSON.stringify(mints, null, 2));
  }
  const inputMint = new PublicKey(mints.input);
  const outputMint = new PublicKey(mints.output);

  const [config] = PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId);
  if (!(await connection.getAccountInfo(config))) {
    // 0.05% protocol fee, 0.1 SOL minimum solver stake.
    await program.methods
      .initialize(5, 10, new anchor.BN(0.1 * LAMPORTS_PER_SOL), 100)
      .accountsPartial({ config, admin: admin.publicKey, treasury: admin.publicKey })
      .rpc();
  }

  const [vault] = PublicKey.findProgramAddressSync([Buffer.from("vault"), inputMint.toBuffer()], program.programId);
  if (!(await connection.getAccountInfo(vault))) {
    await program.methods
      .initializeVault()
      .accountsPartial({ config, tokenMint: inputMint, vault, payer: admin.publicKey })
      .rpc();
  }

  // Fee destination: the treasury's output-token account.
  await getOrCreateAssociatedTokenAccount(connection, admin, outputMint, admin.publicKey);

  console.log("\nFrontend env (Vercel):");
  console.log(`NEXT_PUBLIC_FOXFI_INPUT_MINT=${mints.input}`);
  console.log(`NEXT_PUBLIC_FOXFI_OUTPUT_MINT=${mints.output}`);
  console.log(`FOXFI_FAUCET_SECRET_KEY=<contents of .secrets/faucet.json>`);
  console.log(`\nFaucet: ${faucet.publicKey.toBase58()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
