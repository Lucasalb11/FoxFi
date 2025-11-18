use anchor_lang::prelude::*;

/// Represents a solver's proposed solution for an intent
/// Solvers submit solutions that compete for best execution
#[account]
pub struct Solution {
    /// Intent this solution is for
    pub intent: Pubkey,
    
    /// Solver who submitted this solution
    pub solver: Pubkey,
    
    /// Expected output amount this solution will provide
    pub expected_output: u64,
    
    /// Execution route/path (for future multi-hop support)
    /// For MVP, this could be empty or contain DEX identifier
    pub route: Vec<u8>,
    
    /// When this solution was submitted
    pub submitted_at: i64,
    
    /// Whether this solution won
    pub is_winning: bool,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl Solution {
    // Base size without vec
    pub const BASE_LEN: usize = 8 + // discriminator
        32 + // intent
        32 + // solver
        8 + // expected_output
        4 + // vec length prefix
        8 + // submitted_at
        1 + // is_winning
        1; // bump
    
    // For MVP, we'll support routes up to 256 bytes
    pub const MAX_ROUTE_LEN: usize = 256;
    
    pub const LEN: usize = Self::BASE_LEN + Self::MAX_ROUTE_LEN;

    /// Check if this solution is better than another
    pub fn is_better_than(&self, other: &Solution) -> bool {
        // Higher expected output is better
        if self.expected_output != other.expected_output {
            return self.expected_output > other.expected_output;
        }
        
        // If equal output, earlier submission wins (first-come-first-served)
        self.submitted_at < other.submitted_at
    }

    /// Calculate improvement over minimum requirement
    pub fn calculate_improvement(&self, min_output: u64) -> Option<u64> {
        self.expected_output.checked_sub(min_output)
    }

    /// Calculate improvement percentage in basis points
    pub fn calculate_improvement_bps(&self, min_output: u64) -> Option<u16> {
        if min_output == 0 {
            return None;
        }
        
        let improvement = self.calculate_improvement(min_output)?;
        let improvement_bps = improvement
            .checked_mul(10_000)?
            .checked_div(min_output)?;
        
        Some(improvement_bps as u16)
    }
}

/// Route information for solution execution
/// For future multi-hop support
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RouteHop {
    /// DEX program ID to use
    pub dex_program: Pubkey,
    
    /// Pool/market account
    pub pool: Pubkey,
    
    /// Intermediate token (if multi-hop)
    pub intermediate_mint: Option<Pubkey>,
}

