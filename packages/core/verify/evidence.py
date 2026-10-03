import json
import os
from pathlib import Path

class EvidenceBundle:
    def __init__(self, run_id: str, base_dir: str = ".ratchet/runs"):
        self.run_id = run_id
        self.run_dir = Path(base_dir) / run_id
        self.evidence_dir = self.run_dir / "evidence"
        self.parent_dir = self.evidence_dir / "parent"
        self.fix_dir = self.evidence_dir / "fix"
        self.diff_dir = self.evidence_dir / "diff"
        
        # Ensure directories exist
        for d in [self.parent_dir, self.fix_dir, self.diff_dir]:
            d.mkdir(parents=True, exist_ok=True)
            
    def write_summary(self, data: dict):
        with open(self.evidence_dir / "summary.json", "w") as f:
            json.dump(data, f, indent=2)
            
    def write_parent_log(self, content: str, run_number: int = 1):
        with open(self.parent_dir / f"run-{run_number}.log", "w") as f:
            f.write(content)
            
    def write_fix_log(self, content: str, run_number: int = 1):
        with open(self.fix_dir / f"run-{run_number}.log", "w") as f:
            f.write(content)
            
    def write_reproduce_script(self, test_path: str):
        script = f"""#!/bin/bash
echo "Ratchet Verification Bundle for Run {self.run_id}"
echo "Test file: {test_path}"
echo "Run 'ratchet verify {self.run_id}' to execute this test against parent and fix commits."
"""
        with open(self.evidence_dir / "reproduce.sh", "w") as f:
            f.write(script)
        os.chmod(self.evidence_dir / "reproduce.sh", 0o755)
