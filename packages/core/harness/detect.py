import os
from pathlib import Path

class HarnessDetector:
    @staticmethod
    def detect_pytest(worktree_path: str) -> bool:
        """
        Detects if the project uses pytest according to TRD 7.1 heuristics.
        """
        markers = [
            "pytest.ini",
            "tox.ini",
            "setup.cfg",
            "conftest.py"
        ]
        
        # Check files
        for marker in markers:
            if os.path.exists(os.path.join(worktree_path, marker)):
                return True
                
        # Check pyproject.toml
        pyproject_path = os.path.join(worktree_path, "pyproject.toml")
        if os.path.exists(pyproject_path):
            with open(pyproject_path, "r", encoding="utf-8") as f:
                content = f.read()
                if "[tool.pytest" in content or "pytest" in content:
                    return True
                    
        return False

    @staticmethod
    def detect_jest(worktree_path: str) -> bool:
        """
        Detects if the project uses Jest.
        """
        if list(Path(worktree_path).glob("jest.config.*")):
            return True
            
        package_json = os.path.join(worktree_path, "package.json")
        if os.path.exists(package_json):
            with open(package_json, "r", encoding="utf-8") as f:
                if "jest" in f.read():
                    return True
                    
        return False
