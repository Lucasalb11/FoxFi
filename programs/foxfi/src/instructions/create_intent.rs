use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint, transfer, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use crate::{constants::*, errors::*, state::*};

/// Create a new swap intent
/// User specifies what they want to swap and their constraints
pub fn create_intent(
    ctx: Context<CreateIntent>,
    input_amount: u64,
    min_output_amount: u64,
    expiration_seconds: i64,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let intent = &mut ctx.accounts.intent;
    let clock = Clock::get()?;

    // Validate parameters
    require!(input_amount > 0, FoxFiError::InvalidInputAmount);
    require!(min_output_amount > 0, FoxFiError::InvalidOutputAmount);
    require!(
        expiration_seconds >= MIN_INTENT_EXPIRATION && 
        expiration_seconds <= MAX_INTENT_EXPIRATION,
        FoxFiError::InvalidExpiration
    );

    // Calculate expiration timestamp
    let expiration = clock
        .unix_timestamp
        .checked_add(expiration_seconds)
        .ok_or(FoxFiError::ArithmeticOverflow)?;

    // Generate unique seed for this intent
    let seed = config.total_intents;

    // Initialize intent
    intent.user = ctx.accounts.user.key();
    intent.input_mint = ctx.accounts.input_mint.key();
    intent.output_mint = ctx.accounts.output_mint.key();
    intent.input_amount = input_amount;
    intent.min_output_amount = min_output_amount;
    intent.expiration = expiration;
    intent.created_at = clock.unix_timestamp;
    intent.status = IntentStatus::Open;
    intent.winning_solver = None;
    intent.best_solution = None;
    intent.actual_output = 0;
    intent.best_output = 0;
    intent.auction_end = clock
        .unix_timestamp
        .checked_add(AUCTION_SECONDS)
        .ok_or(FoxFiError::ArithmeticOverflow)?;
    intent.fees_paid = 0;
    intent.seed = seed;
    intent.bump = ctx.bumps.intent;

    // Transfer input tokens from user to vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_input_account.to_account_info(),
        to: ctx.accounts.input_vault.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    transfer(cpi_ctx, input_amount)?;

    // Update global stats
    config.total_intents = config.total_intents
        .checked_add(1)
        .ok_or(FoxFiError::ArithmeticOverflow)?;

    msg!("Intent created!");
    msg!("User: {}", intent.user);
    msg!("Input: {} of {}", input_amount, intent.input_mint);
    msg!("Min output: {} of {}", min_output_amount, intent.output_mint);
    msg!("Expires at: {}", expiration);

    Ok(())
}

#[derive(Accounts)]
#[instruction(input_amount: u64, min_output_amount: u64, expiration_seconds: i64)]
pub struct CreateIntent<'info> {
    #[account(
        init,
        payer = user,
        space = Intent::LEN,
        seeds = [
            INTENT_SEED,
            user.key().as_ref(),
            &config.total_intents.to_le_bytes()
        ],
        bump
    )]
    pub intent: Account<'info, Intent>,

    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub input_mint: Account<'info, Mint>,
    pub output_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = input_mint,
        associated_token::authority = user
    )]
    pub user_input_account: Account<'info, TokenAccount>,

    /// Vault to hold input tokens during intent lifecycle
    /// Note: In production, use a single vault per mint initialized separately
    #[account(
        mut,
        seeds = [VAULT_SEED, input_mint.key().as_ref()],
        bump,
    )]
    pub input_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

