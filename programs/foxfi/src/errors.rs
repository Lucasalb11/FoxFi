use anchor_lang::prelude::*;

#[error_code]
pub enum FoxFiError {
    #[msg("Protocol fee exceeds maximum allowed")]
    ProtocolFeeTooHigh,

    #[msg("Solver fee exceeds maximum allowed")]
    SolverFeeTooHigh,

    #[msg("Slippage tolerance exceeds maximum allowed")]
    SlippageTooHigh,

    #[msg("Intent has already expired")]
    IntentExpired,

    #[msg("Intent expiration time is invalid")]
    InvalidExpiration,

    #[msg("Intent is still active and cannot be cancelled")]
    IntentStillActive,

    #[msg("Intent has already been executed")]
    IntentAlreadyExecuted,

    #[msg("Intent has been cancelled")]
    IntentCancelled,

    #[msg("Minimum output amount not met")]
    MinOutputNotMet,

    #[msg("Solution does not meet intent requirements")]
    InvalidSolution,

    #[msg("Solver is not registered")]
    SolverNotRegistered,

    #[msg("Solver stake is insufficient")]
    InsufficientSolverStake,

    #[msg("Solver is not active")]
    SolverNotActive,

    #[msg("Solver already registered")]
    SolverAlreadyRegistered,

    #[msg("No rewards available to claim")]
    NoRewardsToClaim,

    #[msg("Unauthorized access")]
    Unauthorized,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Invalid token mint")]
    InvalidMint,

    #[msg("Input amount must be greater than zero")]
    InvalidInputAmount,

    #[msg("Output amount must be greater than zero")]
    InvalidOutputAmount,

    #[msg("Solution already submitted for this intent")]
    SolutionAlreadySubmitted,

    #[msg("Intent not ready for settlement")]
    IntentNotReadyForSettlement,

    #[msg("Invalid vault authority")]
    InvalidVaultAuthority,
}

