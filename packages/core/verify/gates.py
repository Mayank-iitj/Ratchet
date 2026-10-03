import ast

class GateResult:
    def __init__(self, passed: bool, reason: str = ""):
        self.passed = passed
        self.reason = reason

def run_g0_static(test_code: str) -> GateResult:
    """
    G0 Static Gate: AST/regex checks on candidate.
    Must parse; no forbidden calls (subprocess, os.system, etc.).
    """
    try:
        tree = ast.parse(test_code)
    except SyntaxError as e:
        return GateResult(False, f"STATIC_VIOLATION: Syntax error: {e}")
        
    forbidden_calls = {'subprocess', 'os.system', 'socket', 'requests', 'eval', 'exec'}
    
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id in forbidden_calls:
                return GateResult(False, f"STATIC_VIOLATION: Forbidden call '{node.func.id}'")
            if isinstance(node.func, ast.Attribute) and node.func.attr in forbidden_calls:
                return GateResult(False, f"STATIC_VIOLATION: Forbidden call '{node.func.attr}'")
                
    return GateResult(True)

async def run_g1_parent(sandbox_runner, image: str, worktree: str, test_file: str, test_name: str) -> GateResult:
    """
    G1 Parent Gate: Test must fail on the parent commit.
    """
    cmd = [
        "python", "-m", "pytest", f"{test_file}::{test_name}",
        "-x", "-q", "-p", "no:cacheprovider", "-p", "no:randomly",
        "--junitxml=/out/junit.xml"
    ]
    exit_code, stdout, stderr = await sandbox_runner(image, worktree, "/tmp/out", cmd)
    
    if exit_code == 0:
        return GateResult(False, "PASSES_ON_PARENT")
    
    # In reality, this requires parsing junit.xml for ASSERTION / EXPECTED_EXCEPTION
    # vs WRONG_REASON_COLLECTION_ERROR, etc.
    if "ImportError" in stdout or "SyntaxError" in stdout:
        return GateResult(False, "WRONG_REASON_COLLECTION_ERROR")
        
    return GateResult(True, "ASSERTION")

async def run_g2_fix(sandbox_runner, image: str, worktree: str, test_file: str, test_name: str) -> GateResult:
    """
    G2 Fix Gate: Test must pass on the fix commit.
    """
    cmd = [
        "python", "-m", "pytest", f"{test_file}::{test_name}",
        "-x", "-q", "-p", "no:cacheprovider", "-p", "no:randomly",
        "--junitxml=/out/junit.xml"
    ]
    exit_code, stdout, stderr = await sandbox_runner(image, worktree, "/tmp/out", cmd)
    
    if exit_code != 0:
        return GateResult(False, "FAILS_ON_FIX")
        
    return GateResult(True)
