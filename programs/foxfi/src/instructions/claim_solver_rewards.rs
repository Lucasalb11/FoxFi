use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use crate::{constants::*, state::*};

/// Solver claims accumulated rewards
pub fn claim_solver_rewards(ctx: Context<ClaimSolverRewards>) -> Result<()> {
    let solver = &mut ctx.accounts.solver;

    // Claim all rewards
    let amount = solver.claim_all_rewards()?;

    msg!("Solver claiming rewards: {}", amount);
    msg!("Total earned: {}", solver.total_fees_earned);

    Ok(())
}

#[derive(Accounts)]
pub struct ClaimSolverRewards<'info> {
    #[account(
        mut,
        seeds = [SOLVER_SEED, authority.key().as_ref()],
        bump = solver.bump,
        has_one = authority
    )]
    pub solver: Account<'info, Solver>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub reward_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = reward_mint,
        associated_token::authority = authority
    )]
    pub solver_reward_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

