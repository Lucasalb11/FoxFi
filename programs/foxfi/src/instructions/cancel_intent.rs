use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};
use crate::{constants::*, errors::*, state::*};

/// Return the locked input to the user.
///
/// Allowed while nobody has bid, or after expiry if the winning solver never
/// settled. In the second case the solver loses reputation. Expiry alone used to
/// block cancellation, which left unfilled intents' tokens stuck in the vault.
pub fn cancel_intent(ctx: Context<CancelIntent>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let intent = &ctx.accounts.intent;
    require!(intent.can_refund(now), FoxFiError::RefundNotAvailable);
    let input_amount = intent.input_amount;
    let defaulted = intent.status == IntentStatus::SolutionSubmitted;
    let winner = intent.winning_solver;

    let config_bump = ctx.accounts.config.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[CONFIG_SEED, &[config_bump]]];
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.input_vault.to_account_info(),
                to: ctx.accounts.user_input_account.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
            },
            signer_seeds,
        ),
        input_amount,
    )?;

    ctx.accounts.intent.status = IntentStatus::Cancelled;

    if defaulted {
        let solver = ctx
            .accounts
            .winning_solver
            .as_mut()
            .ok_or(FoxFiError::SolverNotRegistered)?;
        require!(Some(solver.key()) == winner, FoxFiError::Unauthorized);
        solver.update_reputation(false);
        msg!("Winning solver missed the deadline; reputation reduced");
    }

    msg!("Refunded {} to the user", input_amount);
    Ok(())
}

#[derive(Accounts)]
pub struct CancelIntent<'info> {
    #[account(
        mut,
        seeds = [INTENT_SEED, user.key().as_ref(), &intent.seed.to_le_bytes()],
        bump = intent.bump,
        has_one = user,
        has_one = input_mint @ FoxFiError::InvalidMint,
    )]
    pub intent: Account<'info, Intent>,

    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub input_mint: Account<'info, Mint>,

    #[account(mut, associated_token::mint = input_mint, associated_token::authority = user)]
    pub user_input_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [VAULT_SEED, input_mint.key().as_ref()],
        bump,
        token::mint = input_mint,
        token::authority = config
    )]
    pub input_vault: Account<'info, TokenAccount>,

    /// Required only when refunding after the winner defaulted.
    #[account(mut)]
    pub winning_solver: Option<Account<'info, Solver>>,

    pub token_program: Program<'info, Token>,
}
