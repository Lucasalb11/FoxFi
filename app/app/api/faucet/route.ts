import { NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'

export const runtime = 'nodejs'

const RPC = process.env.SOLANA_RPC || 'https://api.devnet.solana.com'
const PER_REQUEST = 100 * 10 ** 6
/** Don't top up wallets that still hold plenty: keeps the demo tokens from being farmed. */
const REFILL_BELOW = 50 * 10 ** 6

function faucetKey(): Keypair | null {
  const raw = process.env.FOXFI_FAUCET_SECRET_KEY
  if (!raw) return null
  try {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)))
  } catch {
    return null
  }
}

/**
 * Returns a transaction the user's wallet signs and sends. The user is the fee payer and pays
 * the rent for their own token accounts; the faucet only co-signs as mint authority, so
 * scripted requests for fresh addresses can't drain the faucet's SOL.
 */
export async function POST(req: Request) {
  const faucet = faucetKey()
  const mints = [process.env.NEXT_PUBLIC_FOXFI_INPUT_MINT, process.env.NEXT_PUBLIC_FOXFI_OUTPUT_MINT]
  if (!faucet || mints.some((m) => !m)) {
    return NextResponse.json({ error: 'The demo faucet isn’t configured on this deployment.' }, { status: 503 })
  }

  let owner: PublicKey
  try {
    owner = new PublicKey((await req.json()).wallet)
  } catch {
    return NextResponse.json({ error: 'Send { "wallet": "<base58 address>" }.' }, { status: 400 })
  }
  if (!PublicKey.isOnCurve(owner.toBytes())) {
    return NextResponse.json({ error: 'Use a wallet address, not a program account.' }, { status: 400 })
  }

  const connection = new Connection(RPC, 'confirmed')
  try {
    const tx = new Transaction()
    for (const mint of mints.map((m) => new PublicKey(m!))) {
      const account = getAssociatedTokenAddressSync(mint, owner)
      const balance = await connection.getTokenAccountBalance(account).then(
        (b) => Number(b.value.amount),
        () => 0,
      )
      if (balance >= REFILL_BELOW) continue
      tx.add(
        createAssociatedTokenAccountIdempotentInstruction(owner, account, owner, mint),
        createMintToInstruction(mint, account, faucet.publicKey, PER_REQUEST),
      )
    }
    if (!tx.instructions.length) {
      return NextResponse.json({ message: 'You already have enough demo tokens.' })
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
    tx.feePayer = owner
    tx.recentBlockhash = blockhash
    tx.lastValidBlockHeight = lastValidBlockHeight
    tx.partialSign(faucet)
    return NextResponse.json({
      transaction: tx.serialize({ requireAllSignatures: false }).toString('base64'),
      message: 'Approve in your wallet to receive 100 of each demo token.',
    })
  } catch (e) {
    console.error('[faucet]', e)
    return NextResponse.json({ error: 'The faucet couldn’t build the transaction. Try again.' }, { status: 502 })
  }
}
