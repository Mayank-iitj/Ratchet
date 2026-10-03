"use client";

import Link from "next/link";

export default function RunDetail({ params }: { params: { id: string } }) {
  return (
    <main className="flex min-h-screen flex-col p-8 md:p-24 bg-ink">
      <div className="max-w-[1280px] w-full mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <Link href="/runs" className="text-mute text-small hover:text-bone">‹ Runs</Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-title font-display font-semibold text-bone">KeyError when a subscription has no plan_id</h1>
              <p className="text-mute text-small mt-1">owner/shop-api · fix c41d7e0 · started 4 min ago</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-bone text-small font-medium bg-pass/10 text-pass px-2 py-1 rounded-control">Shipped PR #482</span>
              <button className="bg-violet hover:bg-magenta text-bone rounded-control px-4 py-2 text-sm font-medium transition-colors">
                Open PR
              </button>
            </div>
          </div>
        </div>

        {/* Gate Strip */}
        <div className="bg-panel border border-line rounded-panel p-8 my-8 flex flex-col md:flex-row items-center overflow-x-auto">
          <div className="flex items-center">
             <div className="flex flex-col items-center">
               <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(90deg, var(--color-magenta), var(--color-violet))' }}>
                 <span className="text-ink text-xs font-bold">✓</span>
               </div>
               <span className="text-bone text-xs mt-2 font-medium">Fails on parent</span>
               <span className="text-pass bg-pass/10 px-1.5 py-0.5 rounded font-mono text-[10px] mt-1">FAIL</span>
             </div>
             
             <div className="h-0.5 w-16 md:w-32 mx-4" style={{ background: 'linear-gradient(90deg, var(--color-violet), var(--color-teal))' }}></div>
             
             <div className="flex flex-col items-center">
               <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(90deg, var(--color-teal), #19C3B0)' }}>
                 <span className="text-ink text-xs font-bold">✓</span>
               </div>
               <span className="text-bone text-xs mt-2 font-medium">Passes on fix</span>
               <span className="text-pass bg-pass/10 px-1.5 py-0.5 rounded font-mono text-[10px] mt-1">PASS</span>
             </div>
             
             <div className="h-0.5 w-16 md:w-32 mx-4 bg-line"></div>
             
             <div className="flex flex-col items-center opacity-50">
               <div className="w-8 h-8 rounded-full border-2 border-mute flex items-center justify-center"></div>
               <span className="text-mute text-xs mt-2 font-medium">Stable ×5</span>
             </div>
          </div>
        </div>

        {/* Evidence Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-panel border border-line rounded-panel overflow-hidden">
            <div className="bg-raised border-b border-line px-4 py-2 flex items-center space-x-2">
               <span className="text-fail font-mono text-small">FAIL</span>
               <span className="text-bone text-small">Parent 9f3c2ab</span>
            </div>
            <pre className="p-4 text-mono text-small text-mute overflow-x-auto">
{`tests/regression/test_x.py::test_y
E   KeyError: 'plan_id'
app/billing.py:88  charge()
ran 5× identical`}
            </pre>
          </div>
          
          <div className="bg-panel border border-line rounded-panel overflow-hidden">
            <div className="bg-raised border-b border-line px-4 py-2 flex items-center space-x-2">
               <span className="text-pass font-mono text-small">PASS</span>
               <span className="text-bone text-small">Fix c41d7e0</span>
            </div>
            <pre className="p-4 text-mono text-small text-mute overflow-x-auto">
{`tests/regression/test_x.py::test_y
1 passed in 0.04s

ran 5× identical`}
            </pre>
          </div>
        </div>

      </div>
    </main>
  );
}
