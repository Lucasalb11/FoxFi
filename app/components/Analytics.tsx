'use client'

export const Analytics = () => {
  // Mock data - in production, fetch from program
  const stats = {
    totalVolume: '0',
    totalIntents: 0,
    totalExecuted: 0,
    totalSolvers: 0,
    avgExecutionTime: '0',
    protocolFees: '0',
  }

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-3xl font-bold text-white mb-1">
            ${stats.totalVolume}
          </div>
          <div className="text-sm text-gray-400">Total Volume</div>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.totalIntents}
          </div>
          <div className="text-sm text-gray-400">Total Intents</div>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.totalExecuted}
          </div>
          <div className="text-sm text-gray-400">Executed</div>
        </div>
      </div>

      {/* More Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-2">⚡</div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.totalSolvers}
          </div>
          <div className="text-sm text-gray-400">Active Solvers</div>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-2">⏱️</div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.avgExecutionTime}s
          </div>
          <div className="text-sm text-gray-400">Avg Execution Time</div>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-2">💰</div>
          <div className="text-3xl font-bold text-white mb-1">
            ${stats.protocolFees}
          </div>
          <div className="text-sm text-gray-400">Protocol Fees</div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Volume Over Time</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-6xl mb-4">📈</div>
            <p>Chart coming soon</p>
            <p className="text-sm mt-2">Track protocol activity and growth</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">🔄</div>
          <p>No recent activity</p>
          <p className="text-sm mt-2">Activity will appear here once intents are executed</p>
        </div>
      </div>
    </div>
  )
}

