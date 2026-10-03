import typer
from rich.console import Console

console = Console()
app = typer.Typer(name="ratchet", help="Ratchet Verification Pipeline")

@app.command()
def run(
    repo: str = typer.Option(..., help="Path to the repository clone"),
    fix: str = typer.Option(..., help="The commit SHA that fixed the bug"),
    trace: str = typer.Option(..., help="Path to file containing stack trace"),
    logs: str = typer.Option(None, help="Path to logs file (optional)")
):
    """
    Run Ratchet in local CLI mode.
    Outputs evidence bundle to .ratchet/runs/<run_id>/
    """
    console.print(f"[bold blue]ratchet[/] [green]{repo}[/] fix [cyan]{fix}[/]")
    console.print()
    
    # Placeholder for the actual pipeline execution
    console.print(" ✔ [bold green]ingest[/]      3 secrets redacted")
    console.print(" ✔ [bold green]locate[/]      2 changed symbols")
    console.print(" ✔ [bold green]prepare[/]     image cache hit")
    console.print(" ✔ [bold green]synthesize[/]  attempt 1 of 4")
    console.print(" ✔ [bold green]gate 1[/]      fails on parent (expected)")
    console.print(" ✔ [bold green]relevance[/]   executes relevant lines")
    console.print(" ✔ [bold green]gate 2[/]      passes on fix")
    console.print(" ✔ [bold green]stability[/]   5/5 identical on both")
    console.print()
    console.print(" [bold green]Verified.[/] Wrote tests/regression/test_ratchet_local.py")

@app.command()
def verify(run_id: str = typer.Argument(..., help="The ID of the run to re-verify")):
    """
    Independently re-verify a Ratchet run.
    """
    console.print(f"Re-verifying run {run_id}...")

@app.command()
def replay(benchmark: str, subset: str = "v1"):
    """
    Run the replay benchmark.
    """
    console.print(f"Running replay on {benchmark} ({subset})...")

if __name__ == "__main__":
    app()
