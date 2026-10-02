use anchor_lang::prelude::*;

// PDA Seeds
#[constant]
pub const CONFIG_SEED: &[u8] = b"config";

#[constant]
pub const INTENT_SEED: &[u8] = b"intent";

#[constant]
pub const SOLVER_SEED: &[u8] = b"solver";

#[constant]
pub const VAULT_SEED: &[u8] = b"vault";

#[constant]
pub const SOLUTION_SEED: &[u8] = b"solution";

// Protocol Parameters
#[constant]
pub const DEFAULT_PROTOCOL_FEE_BPS: u16 = 5; // 0.05%

#[constant]
pub const DEFAULT_SOLVER_FEE_BPS: u16 = 10; // 0.10%

#[constant]
pub const DEFAULT_MIN_SOLVER_STAKE: u64 = 1_000_000_000; // 1 SOL

#[constant]
pub const DEFAULT_MAX_SLIPPAGE_BPS: u16 = 100; // 1%

#[constant]
pub const MAX_PROTOCOL_FEE_BPS: u16 = 100; // 1% maximum

#[constant]
pub const MAX_SOLVER_FEE_BPS: u16 = 200; // 2% maximum

#[constant]
pub const MAX_SLIPPAGE_BPS: u16 = 1000; // 10% maximum

#[constant]
pub const MIN_INTENT_EXPIRATION: i64 = 60; // 1 minute minimum

#[constant]
pub const MAX_INTENT_EXPIRATION: i64 = 86400; // 24 hours maximum

#[constant]
pub const BPS_DENOMINATOR: u64 = 10_000;


/// How long solvers can bid on a new intent. Settlement opens afterwards.
#[constant]
pub const AUCTION_SECONDS: i64 = 20;
