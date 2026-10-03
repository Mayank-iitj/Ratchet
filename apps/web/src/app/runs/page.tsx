"use client";

import Link from "next/link";

const MOCK_RUNS = [
  { id: "1", title: "billing: KeyError on missing plan_id", repo: "owner/shop-api", status: "Shipped", result: "PR #482", duration: "4m 12s", cost: "$0.21" },
  { id: "2", title: "auth: token refresh race", repo: "owner/shop-api", status: "Discarded", result: "Failed to import `pkg.mod` on parent", duration: "2m 51s", cost: "$0.33" },
  { id: "3", title: "search: unicode normalization", repo: "owner/search-svc", status: "Verifying", result: "gate 3 of 4", duration: "1m 08s", cost: "$0.10" },
];

export default function RunsList() {
  return (
    <main className="flex min-h-screen flex-col p-8 md:p-24 bg-ink">
      <div className="max-w-[1120px] w-full mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-line pb-4">
          <h1 className="text-title font-display font-semibold text-bone">Runs</h1>
          <Link href="/runs/new">
            <button className="bg-raised border border-line hover:border-magenta text-bone rounded-control px-4 py-2 text-sm font-medium transition-colors">
              New run
            </button>
          </Link>
        </div>

        <div className="flex space-x-4 text-small text-mute pb-4">
          <span>Filter:</span>
          <span className="text-bone cursor-pointer">All repos ▾</span>
          <span className="text-bone cursor-pointer">Any status ▾</span>
          <span className="text-bone cursor-pointer">Last 30 days ▾</span>
        </div>

        <div className="w-full text-left border-t border-line">
          {MOCK_RUNS.map((run) => (
            <Link key={run.id} href={`/runs/${run.id}`} className="block w-full">
              <div className="flex flex-col md:flex-row md:items-center py-4 border-b border-line hover:bg-raised transition-colors cursor-pointer px-4 -mx-4 group">
                <div className="w-6 shrink-0 flex items-center justify-center mr-4">
                  {run.status === "Shipped" && <div className="w-3 h-3 rounded-full bg-gradient-to-r from-magenta via-violet to-teal" />}
                  {run.status === "Discarded" && <div className="w-3 h-3 rounded-full border-2 border-mute" />}
                  {run.status === "Verifying" && <div className="w-3 h-3 rounded-full border-2 border-bone border-t-transparent animate-spin" />}
                </div>
                
                <div className="flex-grow min-w-0 pr-4">
                  <div className="text-body text-bone font-medium truncate group-hover:text-magenta transition-colors">{run.title}</div>
                </div>
                
                <div className="w-40 shrink-0 text-mute text-small">{run.repo}</div>
                <div className="w-24 shrink-0 text-bone text-small">{run.status}</div>
                <div className="w-64 shrink-0 text-mute text-small truncate pr-4">{run.result}</div>
                <div className="w-20 shrink-0 text-right text-mute text-small font-variant-numeric:tabular-nums">{run.duration}</div>
                <div className="w-20 shrink-0 text-right text-mute text-small font-variant-numeric:tabular-nums">{run.cost}</div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
