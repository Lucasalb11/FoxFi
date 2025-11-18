use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use crate::{constants::*, state::*};

/// Initialize a token vault for holding intent tokens
/// This should be called once per token mint before creating intents
pub fn initialize_vault(_ctx: Context<InitializeVault>) -> Result<()> {
    msg!("Token vault initialized successfully");
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    pub token_mint: Account<'info, Mint>,

    /// Vault to hold tokens
    #[account(
        init,
        payer = payer,
        seeds = [VAULT_SEED, token_mint.key().as_ref()],
        bump,
        token::mint = token_mint,
        token::authority = config
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

