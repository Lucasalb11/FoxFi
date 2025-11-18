use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint, transfer, Transfer};
use crate::{constants::*, errors::*, state::*};

/// Cancel an active intent
/// Returns tokens to user if not yet executed
pub fn cancel_intent(ctx: Context<CancelIntent>) -> Result<()> {
    let intent = &mut ctx.accounts.intent;
    let clock = Clock::get()?;

    // Check if intent can be cancelled
    require!(intent.can_cancel(), FoxFiError::IntentAlreadyExecuted);
    require!(!intent.is_expired(clock.unix_timestamp), FoxFiError::IntentExpired);

    // Mark as cancelled
    intent.status = IntentStatus::Cancelled;

    // Return input tokens to user
    let seeds = &[
        CONFIG_SEED,
        &[ctx.accounts.config.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.input_vault.to_account_info(),
        to: ctx.accounts.user_input_account.to_account_info(),
        authority: ctx.accounts.config.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
    transfer(cpi_ctx, intent.input_amount)?;

    msg!("Intent cancelled and tokens returned to user");

    Ok(())
}

#[derive(Accounts)]
pub struct CancelIntent<'info> {
    #[account(
        mut,
        seeds = [
            INTENT_SEED,
            user.key().as_ref(),
            &intent.seed.to_le_bytes()
        ],
        bump = intent.bump,
        has_one = user
    )]
    pub intent: Account<'info, Intent>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub input_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = input_mint,
        associated_token::authority = user
    )]
    pub user_input_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [VAULT_SEED, input_mint.key().as_ref()],
        bump,
        token::mint = input_mint,
        token::authority = config
    )]
    pub input_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

