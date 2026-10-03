import json
from datetime import datetime

class BenchmarkReporter:
    def __init__(self, benchmark: str, subset: str):
        self.benchmark = benchmark
        self.subset = subset
        self.results = {
            "benchmark": benchmark,
            "subset": subset,
            "replayed": 0,
            "shipped": 0,
            "discarded": 0,
            "infra_failed": 0,
            "reverified_pass": 0,
            "unverified_shipped": 0,
            "yield": 0.0,
            "median_seconds": 0,
            "median_cost_usd": 0.0,
            "discard_breakdown": {},
            "generated_at": datetime.utcnow().isoformat(),
            "ratchet_commit": "HEAD"
        }
        
    def add_result(self, outcome: str, discard_reason: str = None):
        self.results["replayed"] += 1
        
        if outcome == "shipped":
            self.results["shipped"] += 1
            self.results["reverified_pass"] += 1
        elif outcome == "failed":
            self.results["infra_failed"] += 1
        else:
            self.results["discarded"] += 1
            if discard_reason:
                self.results["discard_breakdown"][discard_reason] = self.results["discard_breakdown"].get(discard_reason, 0) + 1
                
        self.update_yield()
        
    def update_yield(self):
        valid_runs = self.results["replayed"] - self.results["infra_failed"]
        if valid_runs > 0:
            self.results["yield"] = self.results["shipped"] / valid_runs
            
    def save(self, filepath: str = "benchmark/results.json"):
        with open(filepath, "w") as f:
            json.dump(self.results, f, indent=2)
