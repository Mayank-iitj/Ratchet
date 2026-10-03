"use client";

import Link from "next/link";

const BENCHMARK_DATA = {
  benchmark: "BugsInPy",
  subset: "v1-top-100",
  yield: "72.4%",
  shipped: 72,
  discarded: 24,
  infra_failed: 4,
  median_duration: "1m 45s",
  median_cost: "$0.14"
};

export default function BenchmarkDashboard() {
  return (
    <main className="flex min-h-screen flex-col p-8 md:p-24 bg-ink">
      <div className="max-w-[1120px] w-full mx-auto space-y-12">
        
        {/* Header */}
        <div>
          <h1 className="text-display font-display tracking-tight text-bone">Benchmarks</h1>
          <p className="text-mute mt-2">Continuous evaluation of Ratchet&apos;s orchestration across known bug datasets.</p>
        </div>

        {/* Topline Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-panel border border-line rounded-panel p-6">
            <div className="text-mute text-sm font-medium">Dataset</div>
            <div className="text-title font-display text-bone mt-2">{BENCHMARK_DATA.benchmark}</div>
            <div className="text-mute text-xs mt-1">{BENCHMARK_DATA.subset}</div>
          </div>
          
          <div className="bg-panel border border-line rounded-panel p-6 border-b-4" style={{ borderBottomColor: 'var(--color-teal)' }}>
            <div className="text-mute text-sm font-medium">Yield (Shipped/Valid)</div>
            <div className="text-display font-display text-pass mt-2">{BENCHMARK_DATA.yield}</div>
            <div className="text-mute text-xs mt-1">{BENCHMARK_DATA.shipped} tests shipped</div>
          </div>
          
          <div className="bg-panel border border-line rounded-panel p-6">
            <div className="text-mute text-sm font-medium">Median Run Time</div>
            <div className="text-title font-display text-bone mt-2">{BENCHMARK_DATA.median_duration}</div>
          </div>
          
          <div className="bg-panel border border-line rounded-panel p-6">
            <div className="text-mute text-sm font-medium">Median Cost (LLM)</div>
            <div className="text-title font-display text-bone mt-2">{BENCHMARK_DATA.median_cost}</div>
          </div>
        </div>

        {/* Discard Reasons */}
        <div className="space-y-4">
          <h2 className="text-body font-semibold text-bone">Discard Breakdown</h2>
          <div className="bg-panel border border-line rounded-panel p-6">
            <div className="space-y-4">
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-bone">G1_PASSES_ON_PARENT</span>
                  <span className="text-mute">12 (50%)</span>
                </div>
                <div className="w-full bg-raised h-2 rounded-full overflow-hidden">
                  <div className="bg-warn h-full" style={{ width: '50%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-bone">G0_STATIC_VIOLATION</span>
                  <span className="text-mute">8 (33%)</span>
                </div>
                <div className="w-full bg-raised h-2 rounded-full overflow-hidden">
                  <div className="bg-warn h-full" style={{ width: '33%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-bone">G2_FAILS_ON_FIX</span>
                  <span className="text-mute">4 (17%)</span>
                </div>
                <div className="w-full bg-raised h-2 rounded-full overflow-hidden">
                  <div className="bg-warn h-full" style={{ width: '17%' }}></div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
