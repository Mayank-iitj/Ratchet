from unidiff import PatchSet
import subprocess

class DiffResult:
    def __init__(self, diff_text: str):
        self.patch = PatchSet(diff_text)
        
    def get_source_files(self) -> list:
        # Heuristics to determine if a file is a test file
        test_markers = ['test_', '_test.py', 'tests/', 'conftest.py', '.test.', '.spec.']
        source_files = []
        for file in self.patch:
            if not any(marker in file.path for marker in test_markers):
                source_files.append(file)
        return source_files
        
    def get_test_files(self) -> list:
        test_markers = ['test_', '_test.py', 'tests/', 'conftest.py', '.test.', '.spec.']
        test_files = []
        for file in self.patch:
            if any(marker in file.path for marker in test_markers):
                test_files.append(file)
        return test_files

def get_git_diff(worktree_path: str, parent_sha: str, fix_sha: str) -> DiffResult:
    """
    Computes diff between parent and fix commit.
    TRD 6.1: git diff --unified=0 --find-renames <parent> <fix>
    """
    cmd = ["git", "diff", "--unified=0", "--find-renames", parent_sha, fix_sha]
    result = subprocess.run(cmd, cwd=worktree_path, capture_output=True, text=True)
    if result.returncode != 0:
        raise ValueError(f"git diff failed: {result.stderr}")
        
    return DiffResult(result.stdout)
