use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::{constants::*, errors::*, state::*};

/// Register as a solver. The stake is actually moved into the Solver PDA, so a
/// solver has something to lose; it comes back with `close_solver`.
pub fn register_solver(ctx: Context<RegisterSolver>, stake_amount: u64) -> Result<()> {
    require!(
        stake_amount >= ctx.accounts.config.min_solver_stake,
        FoxFiError::InsufficientSolverStake
    );

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.authority.to_account_info(),
                to: ctx.accounts.solver.to_account_info(),
            },
        ),
        stake_amount,
    )?;

    let now = Clock::get()?.unix_timestamp;
    let solver = &mut ctx.accounts.solver;
    solver.authority = ctx.accounts.authority.key();
    solver.stake_amount = stake_amount;
    solver.total_solved = 0;
    solver.total_failed = 0;
    solver.reputation_score = 5_000;
    solver.total_fees_earned = 0;
    solver.unclaimed_rewards = 0;
    solver.is_active = true;
    solver.registered_at = now;
    solver.last_active = now;
    solver.bump = ctx.bumps.solver;
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

    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Leave the network: the account closes and returns rent plus stake.
pub fn close_solver(_ctx: Context<CloseSolver>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct CloseSolver<'info> {
    #[account(
        mut,
        close = authority,
        seeds = [SOLVER_SEED, authority.key().as_ref()],
        bump = solver.bump,
        has_one = authority @ FoxFiError::Unauthorized
    )]
    pub solver: Account<'info, Solver>,

    #[account(mut)]
    pub authority: Signer<'info>,
}
