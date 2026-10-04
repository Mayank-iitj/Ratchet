"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRun() {
  const router = useRouter();
  const [repo, setRepo] = useState("");
  const [fixRef, setFixRef] = useState("");
  const [trace, setTrace] = useState("");
  const [logs, setLogs] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const type = fixRef.includes("pull") ? "pr" : "commit";
      let sha = type === "commit" ? fixRef : undefined;
      let url = type === "pr" ? fixRef : undefined;
      // Note: for production, API_URL should be set in .env.local and exposed or rewrites should be used
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      
      const res = await fetch(`${apiUrl}/api/v1/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo,
          fix: { type, sha, url },
          trace,
          logs: logs || undefined
        })
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }
      
      const data = await res.json();
      router.push(`/runs/${data.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start run. Please ensure backend is running.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col p-8 md:p-24 bg-ink">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        <h1 className="text-title font-display font-semibold text-bone">
          New Run
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-small font-medium text-bone">
              Repository
            </label>
            <input 
              type="text" 
              placeholder="owner/repo" 
              required
              value={repo}
              onChange={e => setRepo(e.target.value)}
              className="w-full bg-panel border border-line rounded-control px-3 py-2 text-bone focus:outline-none focus:border-magenta focus:ring-1 focus:ring-magenta" 
            />
            <p className="text-small text-mute">Install Ratchet on a repo to see it here.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-small font-medium text-bone">
              Fix Commit or PR URL
            </label>
            <input 
              type="text" 
              placeholder="https://github.com/owner/repo/pull/123 or commit SHA" 
              required
              value={fixRef}
              onChange={e => setFixRef(e.target.value)}
              className="w-full bg-panel border border-line rounded-control px-3 py-2 text-bone focus:outline-none focus:border-magenta focus:ring-1 focus:ring-magenta" 
            />
            <p className="text-small text-mute">The commit or merged PR that fixed the incident.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-small font-medium text-bone">
              Stack Trace
            </label>
            <textarea 
              rows={6}
              required
              value={trace}
              onChange={e => setTrace(e.target.value)}
              placeholder="Paste the trace from your error tracker..." 
              className="w-full bg-panel border border-line rounded-control px-3 py-2 text-bone font-mono text-small focus:outline-none focus:border-magenta focus:ring-1 focus:ring-magenta" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-small font-medium text-bone">
              Logs (Optional)
            </label>
            <textarea 
              rows={4}
              value={logs}
              onChange={e => setLogs(e.target.value)}
              placeholder="Paste surrounding logs..." 
              className="w-full bg-panel border border-line rounded-control px-3 py-2 text-bone font-mono text-small focus:outline-none focus:border-magenta focus:ring-1 focus:ring-magenta" 
            />
            <p className="text-small text-mute">We redact secrets and personal data before processing.</p>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-violet hover:bg-magenta text-bone rounded-control px-6 py-2.5 font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Starting Run..." : "Start run"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
