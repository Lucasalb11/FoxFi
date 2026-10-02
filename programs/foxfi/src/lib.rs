use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

pub use constants::*;
pub use errors::*;
pub use instructions::*;
pub use state::*;

declare_id!("FBC9go2hb8pMYGgeAYZa6hWYPSxFbGVuF3fv1J7gtXtb");

#[program]
pub mod foxfi {
    use super::*;

    /// Initializes the protocol configuration
    /// Only called once to set up the protocol
    pub fn initialize(
        ctx: Context<Initialize>,
        protocol_fee_bps: u16,
        solver_fee_bps: u16,
        min_solver_stake: u64,
        max_slippage_bps: u16,
    ) -> Result<()> {
        instructions::initialize(
            ctx,
            protocol_fee_bps,
            solver_fee_bps,
            min_solver_stake,
            max_slippage_bps,
        )
    }

    /// Initialize a token vault (must be called before creating intents for that token)
    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        instructions::initialize_vault(ctx)
    }

    /// Creates a new swap intent
    /// User submits what they want to swap and constraints
    pub fn create_intent(
        ctx: Context<CreateIntent>,
        input_amount: u64,
        min_output_amount: u64,
        expiration_seconds: i64,
    ) -> Result<()> {
        instructions::create_intent(ctx, input_amount, min_output_amount, expiration_seconds)
    }

    /// Refunds the user's input: before any bid, or after the winner misses the deadline
    pub fn cancel_intent(ctx: Context<CancelIntent>) -> Result<()> {
        instructions::cancel_intent(ctx)
    }

    /// Registers a new solver in the network
    /// Solver must stake minimum amount to participate
    pub fn register_solver(ctx: Context<RegisterSolver>, stake_amount: u64) -> Result<()> {
        instructions::register_solver(ctx, stake_amount)
    }

    /// Solver submits a solution for an intent
    /// Solution includes expected output amount and route
    pub fn submit_solution(
        ctx: Context<SubmitSolution>,
        expected_output: u64,
    ) -> Result<()> {
        instructions::submit_solution(ctx, expected_output)
    }

    /// Winning solver pays its quote and receives the user's input, atomically
    pub fn execute_settlement(ctx: Context<ExecuteSettlement>) -> Result<()> {
        instructions::execute_settlement(ctx)
    }

    /// Solver leaves the network and gets its stake back
    pub fn close_solver(ctx: Context<CloseSolver>) -> Result<()> {
        instructions::close_solver(ctx)
    }

    /// Admin updates protocol configuration
    pub fn update_config(
        ctx: Context<UpdateConfig>,
        protocol_fee_bps: Option<u16>,
        solver_fee_bps: Option<u16>,
        min_solver_stake: Option<u64>,
        max_slippage_bps: Option<u16>,
    ) -> Result<()> {
        instructions::update_config(
            ctx,
            protocol_fee_bps,
            solver_fee_bps,
            min_solver_stake,
            max_slippage_bps,
        )
    }
}

