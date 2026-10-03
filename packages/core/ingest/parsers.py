import re
from typing import List, Optional
from pydantic import BaseModel

class Frame(BaseModel):
    file: str
    line: int
    function: str
    in_repo: bool = False

class ParsedTrace(BaseModel):
    frames: List[Frame]
    exception_type: str
    message: str
    trace_unanchored: bool = False

def parse_python_traceback(trace_text: str, repo_files: set[str] = set()) -> ParsedTrace:
    """
    Parses a Python traceback into structured frames.
    """
    frames = []
    exception_type = "Unknown"
    message = ""
    
    # Simple regex parsing for typical python tracebacks
    frame_pattern = re.compile(r'File "(.*?)", line (\d+), in (.*)')
    exception_pattern = re.compile(r'^([a-zA-Z_]\w*Error|Exception):\s*(.*)$')
    
    lines = trace_text.strip().split('\n')
    for i, line in enumerate(lines):
        line = line.strip()
        frame_match = frame_pattern.search(line)
        if frame_match:
            file_path = frame_match.group(1)
            line_no = int(frame_match.group(2))
            func = frame_match.group(3)
            
            # Simple heuristic for in_repo
            in_repo = not any(x in file_path for x in ["site-packages", "/usr/lib", "node_modules"])
            
            frames.append(Frame(file=file_path, line=line_no, function=func, in_repo=in_repo))
            continue
            
        exc_match = exception_pattern.search(line)
        if exc_match and i == len(lines) - 1:
            exception_type = exc_match.group(1)
            message = exc_match.group(2)
            
    unanchored = not any(f.in_repo for f in frames) if frames else True
    
    return ParsedTrace(
        frames=frames,
        exception_type=exception_type,
        message=message,
        trace_unanchored=unanchored
    )
