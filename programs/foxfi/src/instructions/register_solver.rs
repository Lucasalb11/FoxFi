use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

/// Register as a solver in the FoxFi network
/// Requires staking minimum amount to participate
pub fn register_solver(ctx: Context<RegisterSolver>, stake_amount: u64) -> Result<()> {
    let config = &ctx.accounts.config;
    let solver = &mut ctx.accounts.solver;
    let clock = Clock::get()?;

    // Validate stake amount
    require!(
        stake_amount >= config.min_solver_stake,
        FoxFiError::InsufficientSolverStake
    );

    // Initialize solver account
    solver.authority = ctx.accounts.authority.key();
    solver.stake_amount = stake_amount;
    solver.total_solved = 0;
    solver.total_failed = 0;
    solver.reputation_score = 5_000; // Start with 50% reputation
    solver.total_fees_earned = 0;
    solver.unclaimed_rewards = 0;
    solver.is_active = true;
    solver.registered_at = clock.unix_timestamp;
    solver.last_active = clock.unix_timestamp;
    solver.bump = ctx.bumps.solver;

    msg!("Solver registered!");
    msg!("Authority: {}", solver.authority);
    msg!("Stake: {}", stake_amount);
    msg!("Initial reputation: {}", solver.reputation_score);

    Ok(())
}

#[derive(Accounts)]
pub struct RegisterSolver<'info> {
    #[account(
        init,
        payer = authority,
        space = Solver::LEN,
        seeds = [SOLVER_SEED, authority.key().as_ref()],
        bump
    )]
    pub solver: Account<'info, Solver>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

