import Link from "next/link";
import { notFound } from "next/navigation";

// Define the shape of our API response based on the new FastAPI schema
interface RunDetail {
  id: string;
  repo_full_name: string;
  fix_sha: string;
  parent_sha: string;
  status: string;
  started_at: string | null;
  created_at: string;
  pr_url: string | null;
  error_message: string | null;
  parent_fail_log: string | null;
  fix_pass_log: string | null;
}

async function getRun(id: string): Promise<RunDetail | null> {
  // Use localhost in development. In production, this uses the same env var as the client.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${apiUrl}/api/v1/runs/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch run:", e);
    return null;
  }
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export default async function RunDetail({ params }: { params: { id: string } }) {
  // Await the params before using them as required in Next.js 15+
  const { id } = await params;
  const run = await getRun(id);
  
  if (!run) {
    // If run isn't in DB yet or API is down, fallback to 404 or a neat error
    notFound();
  }

  const shortFix = run.fix_sha.substring(0, 7);
  const shortParent = run.parent_sha.substring(0, 7);
  const timeText = run.started_at ? `started ${timeAgo(run.started_at)}` : `created ${timeAgo(run.created_at)}`;
  const prText = run.pr_url ? `Shipped PR` : `Run Status`;

  return (
    <main className="flex min-h-screen flex-col p-8 md:p-24 bg-ink">
      <div className="max-w-[1280px] w-full mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <Link href="/runs" className="text-mute text-small hover:text-bone">‹ Runs</Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-title font-display font-semibold text-bone">{run.error_message || "Error resolving issue"}</h1>
              <p className="text-mute text-small mt-1">{run.repo_full_name} · fix {shortFix} · {timeText}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`text-small font-medium px-2 py-1 rounded-control ${run.status === 'shipped' || run.status === 'verifying' ? 'bg-pass/10 text-pass' : 'bg-fail/10 text-fail'}`}>
                {run.status.toUpperCase()}
              </span>
              {run.pr_url && (
                <a href={run.pr_url} target="_blank" rel="noreferrer" className="bg-violet hover:bg-magenta text-bone rounded-control px-4 py-2 text-sm font-medium transition-colors">
                  Open PR
                </a>
              )}
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
               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${run.status === 'queued' ? 'border-2 border-mute' : ''}`} style={{ background: run.status !== 'queued' ? 'linear-gradient(90deg, var(--color-teal), #19C3B0)' : '' }}>
                 {run.status !== 'queued' && <span className="text-ink text-xs font-bold">✓</span>}
               </div>
               <span className="text-bone text-xs mt-2 font-medium">Passes on fix</span>
               <span className={run.status !== 'queued' ? "text-pass bg-pass/10 px-1.5 py-0.5 rounded font-mono text-[10px] mt-1" : "text-mute px-1.5 py-0.5 mt-1"}>
                 {run.status !== 'queued' ? 'PASS' : 'WAIT'}
               </span>
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
               <span className="text-bone text-small">Parent {shortParent}</span>
            </div>
            <pre className="p-4 text-mono text-small text-mute overflow-x-auto whitespace-pre-wrap">
{run.parent_fail_log || "Awaiting reproduction on parent..."}
            </pre>
          </div>
          
          <div className="bg-panel border border-line rounded-panel overflow-hidden">
            <div className="bg-raised border-b border-line px-4 py-2 flex items-center space-x-2">
               <span className="text-pass font-mono text-small">PASS</span>
               <span className="text-bone text-small">Fix {shortFix}</span>
            </div>
            <pre className="p-4 text-mono text-small text-mute overflow-x-auto whitespace-pre-wrap">
{run.fix_pass_log || "Awaiting fix verification..."}
            </pre>
          </div>
        </div>

      </div>
    </main>
  );
}
