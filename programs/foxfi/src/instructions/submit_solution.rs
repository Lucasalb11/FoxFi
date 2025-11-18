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
        FoxFiError::IntentExpired
    );

    // Validate solution meets minimum requirements
    require!(
        expected_output >= intent.min_output_amount,
        FoxFiError::MinOutputNotMet
    );

    // Initialize solution
    solution.intent = intent.key();
    solution.solver = solver.key();
    solution.expected_output = expected_output;
    solution.route = vec![]; // For MVP, empty route
    solution.submitted_at = clock.unix_timestamp;
    solution.is_winning = false;
    solution.bump = ctx.bumps.solution;

    // Update intent status
    if intent.status == IntentStatus::Open {
        intent.status = IntentStatus::SolutionSubmitted;
    }

    // Check if this is the best solution so far
    let is_best = if let Some(_best_solution_key) = intent.best_solution {
        // Compare with existing best solution
        // In a real implementation, we'd load the best solution and compare
        // For MVP, we'll use a simple comparison based on expected_output
        // This is a simplification - production would need more sophisticated logic
        expected_output > intent.min_output_amount
    } else {
        // First solution is automatically best
        true
    };

    if is_best {
        intent.best_solution = Some(solution.key());
        intent.winning_solver = Some(solver.key());
        intent.status = IntentStatus::ReadyForSettlement;
        solution.is_winning = true;
        
        msg!("New best solution!");
        msg!("Expected output: {}", expected_output);
    }

    // Update solver stats
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

