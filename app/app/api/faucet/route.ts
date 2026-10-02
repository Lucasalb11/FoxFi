import { NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { getAccount, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'

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

  const connection = new Connection(RPC, 'confirmed')
  const minted: string[] = []
  try {
    for (const mint of mints.map((m) => new PublicKey(m!))) {
      const account = await getOrCreateAssociatedTokenAccount(connection, faucet, mint, owner)
      const current = Number((await getAccount(connection, account.address)).amount)
      if (current >= REFILL_BELOW) continue
      minted.push(await mintTo(connection, faucet, mint, account.address, faucet, PER_REQUEST))
    }
  } catch (e) {
    return NextResponse.json({ error: `Faucet transaction failed: ${(e as Error).message}` }, { status: 502 })
  }

  return NextResponse.json({
    minted: minted.length,
    message: minted.length ? 'Sent 100 of each demo token.' : 'You already have enough demo tokens.',
    signatures: minted,
  })
}
