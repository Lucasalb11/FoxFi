use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

/// Initialize the FoxFi Protocol
/// Sets up the global configuration
pub fn initialize(
    ctx: Context<Initialize>,
    protocol_fee_bps: u16,
    solver_fee_bps: u16,
    min_solver_stake: u64,
    max_slippage_bps: u16,
) -> Result<()> {
    // Validate fee parameters
    require!(
        protocol_fee_bps <= MAX_PROTOCOL_FEE_BPS,
        FoxFiError::ProtocolFeeTooHigh
    );
    require!(
        solver_fee_bps <= MAX_SOLVER_FEE_BPS,
        FoxFiError::SolverFeeTooHigh
    );
    require!(
        max_slippage_bps <= MAX_SLIPPAGE_BPS,
        FoxFiError::SlippageTooHigh
    );

    let config = &mut ctx.accounts.config;
    
    config.admin = ctx.accounts.admin.key();
    config.protocol_fee_bps = protocol_fee_bps;
    config.solver_fee_bps = solver_fee_bps;
    config.min_solver_stake = min_solver_stake;
    config.max_slippage_bps = max_slippage_bps;
    config.treasury = ctx.accounts.treasury.key();
    config.total_protocol_fees = 0;
    config.total_solver_fees = 0;
    config.total_intents = 0;
    config.total_executed = 0;
    config.total_volume = 0;
    config.bump = ctx.bumps.config;

    msg!("FoxFi Protocol initialized!");
    msg!("Protocol fee: {} bps", protocol_fee_bps);
    msg!("Solver fee: {} bps", solver_fee_bps);
    msg!("Min solver stake: {}", min_solver_stake);

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = ProtocolConfig::LEN,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: Treasury account for protocol fees
    pub treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

