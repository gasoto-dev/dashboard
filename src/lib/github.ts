export const TRACKED_REPOS = [
  "portfolio",
  "kelly-soto-photography",
  "the-crate",
  "fish-tank-tools",
  "codelens",
  "workflow",
  "dashboard",
] as const

export type RepoName = (typeof TRACKED_REPOS)[number]

const ORG = "gasoto-dev"
const BASE = "https://api.github.com"

interface GHPullRequest {
  number: number
  title: string
  state: string
  merged_at: string | null
  created_at: string
  closed_at: string | null
}

interface GHIssue {
  number: number
  title: string
  state: string
  created_at: string
  closed_at: string | null
  pull_request?: unknown
}

export interface PRWeekBucket {
  week: string // "YYYY-Www"
  [repo: string]: number | string
}

export interface RepoCycleTime {
  repo: string
  avgDays: number | null
  closedCount: number
}

export interface RepoOpenIssues {
  repo: string
  openCount: number
}

export interface RepoSummary {
  repo: string
  lastMergedPR: string | null
  openIssues: number
  avgCycleDays: number | null
}

function weekLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github.v3+json" },
    next: { revalidate: 300 }, // 5-min cache
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${url}`)
  return res.json() as Promise<T>
}

export async function fetchClosedPRs(repo: string): Promise<GHPullRequest[]> {
  try {
    const prs = await fetchJSON<GHPullRequest[]>(
      `${BASE}/repos/${ORG}/${repo}/pulls?state=closed&per_page=100`
    )
    return prs.filter((pr) => pr.merged_at !== null)
  } catch {
    return []
  }
}

export async function fetchIssues(repo: string): Promise<GHIssue[]> {
  try {
    return await fetchJSON<GHIssue[]>(
      `${BASE}/repos/${ORG}/${repo}/issues?state=all&per_page=100`
    )
  } catch {
    return []
  }
}

export async function buildPRVelocityData(
  repoData: Record<string, GHPullRequest[]>
): Promise<PRWeekBucket[]> {
  // Collect all weeks
  const weekSet = new Set<string>()
  for (const prs of Object.values(repoData)) {
    for (const pr of prs) {
      if (pr.merged_at) weekSet.add(weekLabel(pr.merged_at))
    }
  }

  const weeks = Array.from(weekSet).sort()
  return weeks.map((week) => {
    const bucket: PRWeekBucket = { week }
    for (const [repo, prs] of Object.entries(repoData)) {
      bucket[repo] = prs.filter((pr) => pr.merged_at && weekLabel(pr.merged_at) === week).length
    }
    return bucket
  })
}

export async function buildCycleTimeData(
  repoData: Record<string, GHIssue[]>
): Promise<RepoCycleTime[]> {
  return Object.entries(repoData).map(([repo, issues]) => {
    // Only real issues (not PRs), that are closed
    const closed = issues.filter(
      (i) => !i.pull_request && i.state === "closed" && i.closed_at
    )
    if (closed.length === 0) return { repo, avgDays: null, closedCount: 0 }
    const totalDays = closed.reduce((sum, i) => {
      const created = new Date(i.created_at).getTime()
      const closedAt = new Date(i.closed_at!).getTime()
      return sum + (closedAt - created) / 86400000
    }, 0)
    return {
      repo,
      avgDays: Math.round((totalDays / closed.length) * 10) / 10,
      closedCount: closed.length,
    }
  })
}

export async function buildOpenIssueCounts(
  repoData: Record<string, GHIssue[]>
): Promise<RepoOpenIssues[]> {
  return Object.entries(repoData).map(([repo, issues]) => ({
    repo,
    openCount: issues.filter((i) => i.state === "open" && !i.pull_request).length,
  }))
}
