import asyncio
import os

class SandboxError(Exception):
    pass

class TimeoutError(SandboxError):
    pass

async def run_in_sandbox(
    image: str,
    worktree_path: str,
    out_dir: str,
    command: list[str],
    timeout_s: int = 480
) -> tuple[int, str, str]:
    """
    Run a command in the Ratchet sandbox using Docker (TRD 13.1).
    Returns (exit_code, stdout, stderr).
    """
    docker_cmd = [
        "docker", "run", "--rm",
        "--network", "none",
        "--read-only",
        "--tmpfs", "/tmp:rw,noexec,nosuid,size=256m",
        "--cap-drop", "ALL",
        "--security-opt", "no-new-privileges",
        "--pids-limit", "256",
        "--memory", "2g",
        "--memory-swap", "2g",
        "--cpus", "2",
        "--ulimit", "nofile=1024:1024",
        "--ulimit", "fsize=268435456",
        "--user", "10001:10001",
        "--security-opt", "seccomp=default",
        "-v", f"{os.path.abspath(worktree_path)}:/work:rw",
        "-v", f"{os.path.abspath(out_dir)}:/out:rw",
        "--stop-timeout", "5",
        image
    ] + command

    process = await asyncio.create_subprocess_exec(
        *docker_cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    try:
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout_s)
        return process.returncode, stdout.decode('utf-8', errors='replace'), stderr.decode('utf-8', errors='replace')
    except asyncio.TimeoutError:
        try:
            process.terminate()
        except OSError:
            pass
        raise TimeoutError(f"Sandbox execution timed out after {timeout_s}s")
