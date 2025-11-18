use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint, transfer, Transfer};
use crate::{constants::*, errors::*, state::*};

/// Execute settlement of an intent
/// Performs the swap and distributes fees
pub fn execute_settlement(ctx: Context<ExecuteSettlement>) -> Result<()> {
    let intent = &mut ctx.accounts.intent;
    let solver = &mut ctx.accounts.solver;
    let config = &mut ctx.accounts.config;
    let clock = Clock::get()?;

    // Validate intent is ready for settlement
    require!(
        intent.can_settle(clock.unix_timestamp),
        FoxFiError::IntentNotReadyForSettlement
    );

    // Verify winning solver
    require!(
        Some(solver.key()) == intent.winning_solver,
        FoxFiError::Unauthorized
    );

    // For MVP: We simulate the swap by transferring tokens from solver to user
    // In production, this would involve CPI calls to DEXs (Orca, Raydium, etc)
    
    // Calculate output amount (from solution)
    // In real implementation, this would come from actual DEX execution
    let output_amount = intent.min_output_amount; // MVP: use minimum for safety

    // Calculate fees
    let protocol_fee = config.calculate_protocol_fee(output_amount)?;
    let solver_fee = config.calculate_solver_fee(output_amount)?;
    let total_fees = protocol_fee.checked_add(solver_fee)
        .ok_or(FoxFiError::ArithmeticOverflow)?;

    // Net amount to user after fees
    let net_output = output_amount.checked_sub(total_fees)
        .ok_or(FoxFiError::ArithmeticOverflow)?;

    // Transfer output tokens to user (MVP: from solver's account)
    // In production: would come from DEX pools
    let cpi_accounts = Transfer {
        from: ctx.accounts.solver_output_account.to_account_info(),
        to: ctx.accounts.user_output_account.to_account_info(),
        authority: ctx.accounts.solver_authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    transfer(cpi_ctx, net_output)?;

    // Transfer protocol fee
    if protocol_fee > 0 {
        let cpi_accounts = Transfer {
            from: ctx.accounts.solver_output_account.to_account_info(),
            to: ctx.accounts.protocol_fee_account.to_account_info(),
            authority: ctx.accounts.solver_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        transfer(cpi_ctx, protocol_fee)?;
    }

    // Add solver fee to unclaimed rewards
    solver.add_rewards(solver_fee)?;

    // Update intent
    intent.status = IntentStatus::Executed;
    intent.actual_output = net_output;
    intent.fees_paid = total_fees;

    // Update solver reputation
    solver.update_reputation(true);

    // Update global stats
    config.total_executed = config.total_executed
        .checked_add(1)
        .ok_or(FoxFiError::ArithmeticOverflow)?;
    config.total_protocol_fees = config.total_protocol_fees
        .checked_add(protocol_fee)
        .ok_or(FoxFiError::ArithmeticOverflow)?;
    config.total_solver_fees = config.total_solver_fees
        .checked_add(solver_fee)
        .ok_or(FoxFiError::ArithmeticOverflow)?;

    msg!("Intent executed successfully!");
    msg!("Output: {} (net: {})", output_amount, net_output);
    msg!("Fees: {} (protocol: {}, solver: {})", total_fees, protocol_fee, solver_fee);
    msg!("Solver reputation: {}", solver.reputation_score);

    Ok(())
}

#[derive(Accounts)]
pub struct ExecuteSettlement<'info> {
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
        mut,
        seeds = [SOLVER_SEED, solver_authority.key().as_ref()],
        bump = solver.bump
    )]
    pub solver: Account<'info, Solver>,

    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    pub solver_authority: Signer<'info>,

    pub output_mint: Account<'info, Mint>,

    /// CHECK: User who created the intent
    pub user: UncheckedAccount<'info>,

    #[account(
        mut,
        associated_token::mint = output_mint,
        associated_token::authority = user
    )]
    pub user_output_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = output_mint,
        associated_token::authority = solver_authority
    )]
    pub solver_output_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = output_mint,
        associated_token::authority = config.treasury
    )]
    pub protocol_fee_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

