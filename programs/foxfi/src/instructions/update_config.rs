use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

/// Update protocol configuration
/// Only admin can call this
pub fn update_config(
    ctx: Context<UpdateConfig>,
    protocol_fee_bps: Option<u16>,
    solver_fee_bps: Option<u16>,
    min_solver_stake: Option<u64>,
    max_slippage_bps: Option<u16>,
) -> Result<()> {
    let config = &mut ctx.accounts.config;

    // Update protocol fee if provided
    if let Some(fee) = protocol_fee_bps {
        require!(fee <= MAX_PROTOCOL_FEE_BPS, FoxFiError::ProtocolFeeTooHigh);
        config.protocol_fee_bps = fee;
        msg!("Protocol fee updated to: {} bps", fee);
    }

    // Update solver fee if provided
    if let Some(fee) = solver_fee_bps {
        require!(fee <= MAX_SOLVER_FEE_BPS, FoxFiError::SolverFeeTooHigh);
        config.solver_fee_bps = fee;
        msg!("Solver fee updated to: {} bps", fee);
    }

    // Update min solver stake if provided
    if let Some(stake) = min_solver_stake {
        config.min_solver_stake = stake;
        msg!("Min solver stake updated to: {}", stake);
    }

    // Update max slippage if provided
    if let Some(slippage) = max_slippage_bps {
        require!(slippage <= MAX_SLIPPAGE_BPS, FoxFiError::SlippageTooHigh);
        config.max_slippage_bps = slippage;
        msg!("Max slippage updated to: {} bps", slippage);
    }

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump,
        has_one = admin
    )]
    pub config: Account<'info, ProtocolConfig>,

    pub admin: Signer<'info>,
}

