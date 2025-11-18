use anchor_lang::prelude::*;

/// Protocol configuration account
/// Stores global protocol parameters that can be updated by admin
#[account]
pub struct ProtocolConfig {
    /// Admin authority that can update config
    pub admin: Pubkey,
    
    /// Protocol fee in basis points (1 bps = 0.01%)
    /// Goes to protocol treasury
    pub protocol_fee_bps: u16,
    
    /// Solver reward fee in basis points
    /// Paid to solver for finding best execution
    pub solver_fee_bps: u16,
    
    /// Minimum stake required to become a solver
    pub min_solver_stake: u64,
    
    /// Maximum allowed slippage in basis points
    pub max_slippage_bps: u16,
    
    /// Protocol treasury for collecting fees
    pub treasury: Pubkey,
    
    /// Total fees collected by protocol
    pub total_protocol_fees: u64,
    
    /// Total fees paid to solvers
    pub total_solver_fees: u64,
    
    /// Total number of intents created
    pub total_intents: u64,
    
    /// Total number of intents executed
    pub total_executed: u64,
    
    /// Total volume processed (in USD equivalent)
    pub total_volume: u64,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl ProtocolConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // admin
        2 + // protocol_fee_bps
        2 + // solver_fee_bps
        8 + // min_solver_stake
        2 + // max_slippage_bps
        32 + // treasury
        8 + // total_protocol_fees
        8 + // total_solver_fees
        8 + // total_intents
        8 + // total_executed
        8 + // total_volume
        1; // bump

    /// Calculate protocol fee for a given amount
    pub fn calculate_protocol_fee(&self, amount: u64) -> Result<u64> {
        amount
            .checked_mul(self.protocol_fee_bps as u64)
            .and_then(|v| v.checked_div(10_000))
            .ok_or(error!(crate::FoxFiError::ArithmeticOverflow))
    }

    /// Calculate solver fee for a given amount
    pub fn calculate_solver_fee(&self, amount: u64) -> Result<u64> {
        amount
            .checked_mul(self.solver_fee_bps as u64)
            .and_then(|v| v.checked_div(10_000))
            .ok_or(error!(crate::FoxFiError::ArithmeticOverflow))
    }

    /// Calculate total fees (protocol + solver)
    pub fn calculate_total_fees(&self, amount: u64) -> Result<u64> {
        let protocol_fee = self.calculate_protocol_fee(amount)?;
        let solver_fee = self.calculate_solver_fee(amount)?;
        protocol_fee
            .checked_add(solver_fee)
            .ok_or(error!(crate::FoxFiError::ArithmeticOverflow))
    }
}

