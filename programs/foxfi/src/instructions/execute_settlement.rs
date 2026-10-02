use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};
use crate::{constants::*, errors::*, state::*};

/// Settle an intent with the winning quote.
///
/// The winning solver pays the user exactly what it quoted (minus the protocol
/// fee) from its own output tokens, and in the same transaction receives the
/// user's locked input from the vault. Either both legs happen or neither does.
pub fn execute_settlement(ctx: Context<ExecuteSettlement>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let intent = &ctx.accounts.intent;

    require!(now > intent.auction_end, FoxFiError::AuctionStillOpen);
    require!(intent.can_settle(now), FoxFiError::IntentNotReadyForSettlement);
    require!(
        intent.winning_solver == Some(ctx.accounts.solver.key()),
        FoxFiError::Unauthorized
    );

    let quoted = intent.best_output;
    let protocol_fee = ctx.accounts.config.calculate_protocol_fee(quoted)?;
    let net_output = quoted.checked_sub(protocol_fee).ok_or(FoxFiError::ArithmeticOverflow)?;
    // The fee never pushes the user below the minimum they asked for.
    require!(net_output >= intent.min_output_amount, FoxFiError::MinOutputNotMet);
    let input_amount = intent.input_amount;

    // Leg 1: solver pays the user (and the protocol fee) from its own tokens.
    let token_program = ctx.accounts.token_program.to_account_info();
    transfer(
        CpiContext::new(
            token_program.clone(),
            Transfer {
                from: ctx.accounts.solver_output_account.to_account_info(),
                to: ctx.accounts.user_output_account.to_account_info(),
                authority: ctx.accounts.solver_authority.to_account_info(),
            },
        ),
        net_output,
    )?;
    if protocol_fee > 0 {
        transfer(
            CpiContext::new(
                token_program.clone(),
                Transfer {
                    from: ctx.accounts.solver_output_account.to_account_info(),
                    to: ctx.accounts.protocol_fee_account.to_account_info(),
                    authority: ctx.accounts.solver_authority.to_account_info(),
                },
            ),
            protocol_fee,
        )?;
    }

    // Leg 2: the vault releases the user's input to the solver.
    let config_bump = ctx.accounts.config.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[CONFIG_SEED, &[config_bump]]];
    transfer(
        CpiContext::new_with_signer(
            token_program,
            Transfer {
                from: ctx.accounts.input_vault.to_account_info(),
                to: ctx.accounts.solver_input_account.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
            },
            signer_seeds,
        ),
        input_amount,
    )?;

    let intent = &mut ctx.accounts.intent;
    intent.status = IntentStatus::Executed;
    intent.actual_output = net_output;
    intent.fees_paid = protocol_fee;

    let solver = &mut ctx.accounts.solver;
    solver.update_reputation(true);
    solver.last_active = now;

    let config = &mut ctx.accounts.config;
    config.total_executed = config.total_executed.checked_add(1).ok_or(FoxFiError::ArithmeticOverflow)?;
    config.total_protocol_fees = config
        .total_protocol_fees
        .checked_add(protocol_fee)
        .ok_or(FoxFiError::ArithmeticOverflow)?;
    config.total_volume = config.total_volume.checked_add(input_amount).ok_or(FoxFiError::ArithmeticOverflow)?;

    msg!("Settled: user received {} (quote {}, fee {})", net_output, quoted, protocol_fee);
    Ok(())
}

#[derive(Accounts)]
pub struct ExecuteSettlement<'info> {
    #[account(
        mut,
        seeds = [INTENT_SEED, intent.user.as_ref(), &intent.seed.to_le_bytes()],
        bump = intent.bump,
        has_one = user,
        has_one = input_mint @ FoxFiError::InvalidMint,
        has_one = output_mint @ FoxFiError::InvalidMint,
    )]
    pub intent: Box<Account<'info, Intent>>,

    #[account(
        mut,
        seeds = [SOLVER_SEED, solver_authority.key().as_ref()],
        bump = solver.bump,
        constraint = solver.authority == solver_authority.key() @ FoxFiError::Unauthorized
    )]
    pub solver: Box<Account<'info, Solver>>,

    #[account(mut, seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Box<Account<'info, ProtocolConfig>>,

    #[account(mut)]
    pub solver_authority: Signer<'info>,

    /// CHECK: bound to the intent by `has_one = user`; only receives tokens.
    pub user: UncheckedAccount<'info>,

    pub input_mint: Box<Account<'info, Mint>>,
    pub output_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        seeds = [VAULT_SEED, input_mint.key().as_ref()],
        bump,
        token::mint = input_mint,
        token::authority = config
    )]
    pub input_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut, associated_token::mint = output_mint, associated_token::authority = user)]
    pub user_output_account: Box<Account<'info, TokenAccount>>,

    #[account(mut, associated_token::mint = output_mint, associated_token::authority = solver_authority)]
    pub solver_output_account: Box<Account<'info, TokenAccount>>,

    #[account(mut, associated_token::mint = input_mint, associated_token::authority = solver_authority)]
    pub solver_input_account: Box<Account<'info, TokenAccount>>,

    #[account(mut, associated_token::mint = output_mint, associated_token::authority = config.treasury)]
    pub protocol_fee_account: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
