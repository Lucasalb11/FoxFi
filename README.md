# FoxFi

**Intent-based swaps on Solana, built as a learning project.** A user locks the tokens they want
to sell and the least they'll accept. Staked solvers bid for 20 seconds; the best quote settles
atomically (the solver pays the user and receives the input in one transaction), or the user
takes their tokens back.

- Program: Anchor 0.30, `programs/foxfi`
- Frontend: Next.js, `app/` (swap, my intents, solver portal, protocol totals, demo-token faucet)
- Notes on design and what could go wrong: [lucasalmeida.me/work/foxfi](https://lucasalmeida.me/work/foxfi)

## How an intent moves

```text
user   create_intent(in, min_out, 120s)   input locked in vault PDA, auction_end = now + 20s
solver submit_solution(quote)             only while bidding; strictly better quotes take the lead
winner execute_settlement                  after bidding, before expiry:
                                             solver -> user: quote - 0.05% fee (never below min_out)
                                             solver -> treasury: fee
                                             vault  -> solver: the user's input
user   cancel_intent                       before any bid, or after expiry if the winner didn't settle
                                           (the winner loses reputation)
```

Solvers register with `register_solver(stake)`, which moves the stake into their PDA, and get it
back with `close_solver`.

## What changed from the hackathon version

The first version looked complete but didn't work as an auction or as a swap:

- The first bid closed the auction, and any later bid above the minimum replaced the leader even
  if it was worse.
- Settlement paid the user their *minimum*, took fees out of it, and never released the locked
  input to the solver.
- `user` in settlement was unconstrained, so a solver could pay someone else and still mark the
  intent executed; output mint wasn't checked either.
- An intent that expired without a fill could never be cancelled: the tokens stayed in the vault.
- Solver stake was recorded but never transferred, and "rewards" were only a counter.
- Settlement overflowed the BPF stack (too many accounts on the stack), so it couldn't run at all.
- The original test suite never initialised the vault and didn't pass.

All of the above are fixed and covered by `tests/foxfi.test.ts` (7 tests, local validator).

Known limits: bids are public, so there's no protection from front-running between solvers; a
commit-reveal round would fix that. Solvers aren't slashed, only lose reputation.

## Develop

```bash
yarn install
anchor build
anchor test                    # spins up a local validator

cd app && yarn install && yarn dev
```

Devnet setup after deploying: `npx ts-node scripts/setup-devnet.ts` creates the demo mints, the
config and the vault, and prints the frontend env vars. The faucet key stays in `.secrets/`
(git-ignored) and goes to Vercel as `FOXFI_FAUCET_SECRET_KEY`.
