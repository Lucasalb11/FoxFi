use anchor_lang::prelude::*;

/// Represents a user's swap intent
/// This is the core data structure of FoxFi Protocol
#[account]
pub struct Intent {
    /// User who created this intent
    pub user: Pubkey,
    
    /// Token the user wants to swap from
    pub input_mint: Pubkey,
    
    /// Token the user wants to receive
    pub output_mint: Pubkey,
    
    /// Amount of input token to swap
    pub input_amount: u64,
    
    /// Minimum acceptable amount of output token
    /// Protects against slippage
    pub min_output_amount: u64,
    
    /// Unix timestamp when this intent expires
    pub expiration: i64,
    
    /// When this intent was created
    pub created_at: i64,
    
    /// Current status of this intent
    pub status: IntentStatus,
    
    /// Solver who won the right to execute this intent
    pub winning_solver: Option<Pubkey>,
    
    /// Best solution submitted so far
    pub best_solution: Option<Pubkey>,
    
    /// Actual output amount received (set after execution)
    pub actual_output: u64,
    
    /// Fees paid (protocol + solver)
    pub fees_paid: u64,
    
    /// Seed used for PDA derivation
    pub seed: u64,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl Intent {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        32 + // input_mint
        32 + // output_mint
        8 + // input_amount
        8 + // min_output_amount
        8 + // expiration
        8 + // created_at
        1 + // status
        33 + // winning_solver (Option)
        33 + // best_solution (Option)
        8 + // actual_output
        8 + // fees_paid
        8 + // seed
        1; // bump

    /// Check if intent has expired
    pub fn is_expired(&self, current_time: i64) -> bool {
        current_time > self.expiration
    }

    /// Check if intent can be cancelled
    pub fn can_cancel(&self) -> bool {
        matches!(self.status, IntentStatus::Open | IntentStatus::SolutionSubmitted)
    }

    /// Check if intent can accept solutions
    pub fn can_accept_solution(&self, current_time: i64) -> bool {
        self.status == IntentStatus::Open && !self.is_expired(current_time)
    }

    /// Check if intent is ready for settlement
    pub fn can_settle(&self, current_time: i64) -> bool {
        self.status == IntentStatus::ReadyForSettlement && !self.is_expired(current_time)
    }

    /// Calculate slippage percentage in basis points
    pub fn calculate_slippage_bps(&self) -> Option<u16> {
        if self.actual_output == 0 {
            return None;
        }
        
        let expected = self.min_output_amount;
        let actual = self.actual_output;
        
        if actual >= expected {
            Some(0) // No negative slippage (positive slippage is good)
        } else {
            let diff = expected.checked_sub(actual)?;
            let slippage = diff.checked_mul(10_000)?.checked_div(expected)?;
            Some(slippage as u16)
        }
    }
}

/// Status of an intent through its lifecycle
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum IntentStatus {
    /// Intent is open and accepting solutions
    Open,
    
    /// At least one solution has been submitted
    SolutionSubmitted,
    
    /// Best solution selected, ready for execution
    ReadyForSettlement,
    
    /// Intent successfully executed
    Executed,
    
    /// Intent cancelled by user
    Cancelled,
    
    /// Intent expired without execution
    Expired,
}

