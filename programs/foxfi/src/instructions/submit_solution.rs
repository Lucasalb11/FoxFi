use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

/// Solver submits a solution for an intent
/// Solution includes expected output amount
pub fn submit_solution(
    ctx: Context<SubmitSolution>,
    expected_output: u64,
) -> Result<()> {
    let intent = &mut ctx.accounts.intent;
    let solver = &mut ctx.accounts.solver;
    let solution = &mut ctx.accounts.solution;
    let config = &ctx.accounts.config;
    let clock = Clock::get()?;

    // Validate solver eligibility
    require!(
        solver.is_eligible(config.min_solver_stake),
        FoxFiError::SolverNotActive
    );

    // Validate intent can accept solutions
    require!(
        intent.can_accept_solution(clock.unix_timestamp),
        FoxFiError::AuctionClosed
    );
    require!(
        expected_output >= intent.min_output_amount,
        FoxFiError::MinOutputNotMet
    );

    solution.intent = intent.key();
    solution.solver = solver.key();
    solution.expected_output = expected_output;
    solution.route = vec![]; // Routing happens off-chain; the solver delivers the output itself.
    solution.submitted_at = clock.unix_timestamp;
    solution.bump = ctx.bumps.solution;

    intent.status = IntentStatus::SolutionSubmitted;

    // Strictly better quotes replace the leader; ties keep the earlier bid.
    solution.is_winning = expected_output > intent.best_output;
    if solution.is_winning {
        intent.best_output = expected_output;
        intent.best_solution = Some(solution.key());
        intent.winning_solver = Some(solver.key());
        msg!("New best quote: {}", expected_output);
    }

    solver.last_active = clock.unix_timestamp;

    msg!("Solution submitted by solver: {}", solver.authority);
    msg!("Expected output: {}", expected_output);

    Ok(())
}

#[derive(Accounts)]
pub struct SubmitSolution<'info> {
    #[account(
        mut,
        seeds = [
            INTENT_SEED,
            intent.user.as_ref(),
            &intent.seed.to_le_bytes()
        ],
        bump = intent.bump
    )]
    pub intent: Account<'info, Intent>,

    #[account(
        init,
        payer = solver_authority,
        space = Solution::LEN,
        seeds = [
            SOLUTION_SEED,
            intent.key().as_ref(),
            solver.key().as_ref()
        ],
        bump
    )]
    pub solution: Account<'info, Solution>,

    #[account(
        mut,
        seeds = [SOLVER_SEED, solver_authority.key().as_ref()],
        bump = solver.bump,
        constraint = solver.authority == solver_authority.key() @ FoxFiError::Unauthorized
    )]
    pub solver: Account<'info, Solver>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub solver_authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

