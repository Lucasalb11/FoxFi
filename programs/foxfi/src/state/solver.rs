use anchor_lang::prelude::*;

/// Solver account - represents a registered solver in the network
/// Solvers compete to find best execution for intents
#[account]
pub struct Solver {
    /// Authority that controls this solver
    pub authority: Pubkey,
    
    /// Amount staked by this solver
    /// Required to participate and can be slashed for misbehavior
    pub stake_amount: u64,
    
    /// Total number of intents solved by this solver
    pub total_solved: u64,
    
    /// Total number of intents failed/invalid
    pub total_failed: u64,
    
    /// Reputation score (0-10000 basis points)
    /// Higher score = better solver
    pub reputation_score: u64,
    
    /// Total fees earned by this solver
    pub total_fees_earned: u64,
    
    /// Unclaimed rewards available for withdrawal
    pub unclaimed_rewards: u64,
    
    /// Whether this solver is active
    pub is_active: bool,
    
    /// When this solver was registered
    pub registered_at: i64,
    
    /// Last time this solver submitted a solution
    pub last_active: i64,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl Solver {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 + // stake_amount
        8 + // total_solved
        8 + // total_failed
        8 + // reputation_score
        8 + // total_fees_earned
        8 + // unclaimed_rewards
        1 + // is_active
        8 + // registered_at
        8 + // last_active
        1; // bump

    /// Calculate success rate in basis points (0-10000)
    pub fn success_rate_bps(&self) -> u64 {
        let total = self.total_solved.saturating_add(self.total_failed);
        if total == 0 {
            return 10_000; // New solvers get benefit of doubt
        }
        
        self.total_solved
            .saturating_mul(10_000)
            .saturating_div(total)
    }

    /// Update reputation based on performance
    /// Called after each intent execution
    pub fn update_reputation(&mut self, success: bool) {
        const REPUTATION_DECAY: u64 = 50; // Small decay to keep solvers active
        const REPUTATION_BOOST: u64 = 100; // Reward for success
        const REPUTATION_PENALTY: u64 = 200; // Penalty for failure
        
        if success {
            self.reputation_score = self.reputation_score
                .saturating_add(REPUTATION_BOOST)
                .min(10_000);
            self.total_solved = self.total_solved.saturating_add(1);
        } else {
            self.reputation_score = self.reputation_score
                .saturating_sub(REPUTATION_PENALTY);
            self.total_failed = self.total_failed.saturating_add(1);
        }
        
        // Apply small decay to prevent stale high scores
        self.reputation_score = self.reputation_score.saturating_sub(REPUTATION_DECAY);
    }

    /// Check if solver is eligible to submit solutions
    pub fn is_eligible(&self, min_stake: u64) -> bool {
        self.is_active && self.stake_amount >= min_stake
    }

}
