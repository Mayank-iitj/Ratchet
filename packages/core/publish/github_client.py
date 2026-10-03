import httpx

class GitHubClient:
    def __init__(self, installation_token: str, repo_full_name: str):
        self.token = installation_token
        self.repo = repo_full_name
        self.base_url = f"https://api.github.com/repos/{repo_full_name}"
        self.headers = {
            "Authorization": f"Bearer {installation_token}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        
    async def get_default_branch_sha(self) -> str:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.base_url}/git/refs/heads/main", headers=self.headers)
            if resp.status_code == 404:
                resp = await client.get(f"{self.base_url}/git/refs/heads/master", headers=self.headers)
            resp.raise_for_status()
            return resp.json()["object"]["sha"]

    async def create_branch(self, branch_name: str, sha: str):
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/git/refs",
                headers=self.headers,
                json={"ref": f"refs/heads/{branch_name}", "sha": sha}
            )
            resp.raise_for_status()
            
    async def create_pull_request(self, title: str, body: str, head: str, base: str) -> str:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/pulls",
                headers=self.headers,
                json={"title": title, "body": body, "head": head, "base": base}
            )
            resp.raise_for_status()
            return resp.json()["html_url"]
