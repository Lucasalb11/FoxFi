import { AnchorProvider, BN, Program } from '@coral-xyz/anchor'
import type { AnchorWallet } from '@solana/wallet-adapter-react'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import idl from './idl/foxfi.json'
import type { Foxfi } from './idl/foxfi-types'

export const PROGRAM_ID = new PublicKey((idl as { address: string }).address)

/** Demo tokens created by scripts/setup-devnet.ts. */
export const INPUT_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_FOXFI_INPUT_MINT || '11111111111111111111111111111111'
)
export const OUTPUT_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_FOXFI_OUTPUT_MINT || '11111111111111111111111111111111'
)
export const DECIMALS = 6
export const INPUT_SYMBOL = 'fSOL'
export const OUTPUT_SYMBOL = 'fUSD'

export const AUCTION_SECONDS = 20
export const INTENT_LIFETIME_SECONDS = 120

export const configured = () => Boolean(process.env.NEXT_PUBLIC_FOXFI_INPUT_MINT && process.env.NEXT_PUBLIC_FOXFI_OUTPUT_MINT)

const readOnly = {
  publicKey: Keypair.generate().publicKey,
  signTransaction: async () => {
    throw new Error('Connect a wallet to sign')
  },
  signAllTransactions: async () => {
    throw new Error('Connect a wallet to sign')
  },
} as unknown as AnchorWallet

export function program(connection: Connection, wallet?: AnchorWallet) {
  return new Program<Foxfi>(idl as Foxfi, new AnchorProvider(connection, wallet ?? readOnly, { commitment: 'confirmed' }))
}
export type FoxfiProgram = ReturnType<typeof program>

const pda = (...seeds: (Buffer | Uint8Array)[]) => PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)[0]
export const configPda = pda(Buffer.from('config'))
export const solverPda = (authority: PublicKey) => pda(Buffer.from('solver'), authority.toBuffer())
export const intentPda = (user: PublicKey, seed: BN | number) =>
  pda(Buffer.from('intent'), user.toBuffer(), new BN(seed).toArrayLike(Buffer, 'le', 8))
export const solutionPda = (intent: PublicKey, solver: PublicKey) =>
  pda(Buffer.from('solution'), intent.toBuffer(), solver.toBuffer())
export const vaultPda = (mint: PublicKey) => pda(Buffer.from('vault'), mint.toBuffer())
export const ata = (mint: PublicKey, owner: PublicKey) => getAssociatedTokenAddressSync(mint, owner)

export const toUnits = (amount: string | number) => new BN(Math.round(Number(amount) * 10 ** DECIMALS))
export const fromUnits = (units: BN | number) => Number(units.toString()) / 10 ** DECIMALS

export type IntentRow = {
  address: PublicKey
  user: PublicKey
  inputAmount: number
  minOutput: number
  bestOutput: number
  actualOutput: number
  status: 'open' | 'solutionSubmitted' | 'executed' | 'cancelled' | 'readyForSettlement' | 'expired'
  winningSolver: PublicKey | null
  auctionEnd: number
  expiration: number
  createdAt: number
}

export async function fetchIntents(p: FoxfiProgram, user?: PublicKey): Promise<IntentRow[]> {
  // Intent.user sits right after the 8-byte discriminator.
  const filters = user ? [{ memcmp: { offset: 8, bytes: user.toBase58() } }] : []
  const rows = await p.account.intent.all(filters)
  return rows
    .map(({ publicKey, account }) => ({
      address: publicKey,
      user: account.user,
      inputAmount: fromUnits(account.inputAmount),
      minOutput: fromUnits(account.minOutputAmount),
      bestOutput: fromUnits(account.bestOutput),
      actualOutput: fromUnits(account.actualOutput),
      status: Object.keys(account.status)[0] as IntentRow['status'],
      winningSolver: account.winningSolver,
      auctionEnd: account.auctionEnd.toNumber(),
      expiration: account.expiration.toNumber(),
      createdAt: account.createdAt.toNumber(),
    }))
    .sort((a, b) => b.createdAt - a.createdAt)
}

/** Human summary of where an intent stands right now. */
export function phase(row: IntentRow, now = Date.now() / 1000) {
  if (row.status === 'executed') return 'settled'
  if (row.status === 'cancelled') return 'refunded'
  if (now <= row.auctionEnd) return 'bidding'
  if (row.status === 'solutionSubmitted' && now <= row.expiration) return 'awaiting settlement'
  if (row.status === 'solutionSubmitted') return 'winner missed deadline'
  return 'no bids'
}

/** Anchor errors are long; show the program's own error name when there is one. */
export function reason(e: unknown) {
  const text = e instanceof Error ? e.message : String(e)
  return text.match(/Error Code: (\w+)/)?.[1] ?? text.slice(0, 160)
}
