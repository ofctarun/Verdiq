async function githubFetch(path, token) {
    const res = await fetch(`https://api.github.com${path}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "devlens-app",
        },
    });

    if (!res.ok) {
        const err = new Error(`GitHub API request failed: ${res.status} ${res.statusText}`);
        err.status = res.status;
        throw err;
    }

    return res;
}

function lastPageCount(res, fallbackLength) {
    const link = res.headers.get("link");
    if (!link) return fallbackLength;
    const match = link.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/);
    return match ? Number(match[1]) : fallbackLength;
}

export async function listUserRepos({ token }) {
    const res = await githubFetch("/user/repos?per_page=30&sort=updated&affiliation=owner,collaborator,organization_member", token);
    const repos = await res.json();

    return JSON.stringify({
        count: repos.length,
        repositories: repos.map((r) => ({
            fullName: r.full_name,
            private: r.private,
            stars: r.stargazers_count,
            language: r.language,
            updatedAt: r.updated_at,
        })),
    });
}

export async function getRepoHealth({ owner, repo, token }) {
    const [repoRes, commitsRes, openIssuesRes, closedIssuesRes, contributorsRes] = await Promise.all([
        githubFetch(`/repos/${owner}/${repo}`, token),
        githubFetch(`/repos/${owner}/${repo}/commits?per_page=1`, token),
        githubFetch(`/search/issues?q=repo:${owner}/${repo}+type:issue+state:open`, token),
        githubFetch(`/search/issues?q=repo:${owner}/${repo}+type:issue+state:closed`, token),
        githubFetch(`/repos/${owner}/${repo}/contributors?per_page=1&anon=true`, token),
    ]);

    const [repoData, commits, openIssuesData, closedIssuesData, contributors] = await Promise.all([
        repoRes.json(),
        commitsRes.json(),
        openIssuesRes.json(),
        closedIssuesRes.json(),
        contributorsRes.json(),
    ]);

    const openCount = openIssuesData.total_count ?? 0;
    const closedCount = closedIssuesData.total_count ?? 0;
    const issueCloseRatio =
        closedCount + openCount > 0 ? Number((closedCount / (closedCount + openCount)).toFixed(2)) : null;

    const contributorCount = lastPageCount(contributorsRes, contributors.length);

    const lastCommitDate = commits?.[0]?.commit?.author?.date ? new Date(commits[0].commit.author.date) : null;

    const daysSinceLastCommit = lastCommitDate
        ? Math.floor((Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    return JSON.stringify({
        owner,
        repo,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        primaryLanguage: repoData.language,
        openIssuesCount: openCount,
        closedIssuesCount: closedCount,
        issueCloseRatio,
        contributorCount,
        lastCommitDate: lastCommitDate ? lastCommitDate.toISOString() : null,
        daysSinceLastCommit,
    });
}
