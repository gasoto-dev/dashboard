import {
  TRACKED_REPOS,
  fetchClosedPRs,
  fetchIssues,
  buildPRVelocityData,
  buildCycleTimeData,
  buildOpenIssueCounts,
} from "@/lib/github"
import { readVexMetrics, getLatestTestCounts } from "@/lib/vex-metrics"
import PRVelocityChart from "@/components/PRVelocityChart"
import CycleTimeChart from "@/components/CycleTimeChart"
import RepoTable from "@/components/RepoTable"
import StatCard from "@/components/StatCard"

export const revalidate = 300 // 5-min ISR

async function fetchAllData() {
  const [prResults, issueResults] = await Promise.all([
    Promise.all(TRACKED_REPOS.map(async (repo) => ({ repo, prs: await fetchClosedPRs(repo) }))),
    Promise.all(TRACKED_REPOS.map(async (repo) => ({ repo, issues: await fetchIssues(repo) }))),
  ])

  const prData = Object.fromEntries(prResults.map(({ repo, prs }) => [repo, prs]))
  const issueData = Object.fromEntries(issueResults.map(({ repo, issues }) => [repo, issues]))

  const [prVelocity, cycleTime, openIssues] = await Promise.all([
    buildPRVelocityData(prData),
    buildCycleTimeData(issueData),
    buildOpenIssueCounts(issueData),
  ])

  const vexEntries = readVexMetrics()
  const testCounts = getLatestTestCounts(vexEntries)

  const totalMergedPRs = Object.values(prData).reduce((sum, prs) => sum + prs.length, 0)
  const totalOpenIssues = openIssues.reduce((sum, r) => sum + r.openCount, 0)
  const totalTests = testCounts.reduce((sum, t) => sum + t.latestCount, 0)
  const avgCycle = cycleTime
    .filter((c) => c.avgDays !== null)
    .map((c) => c.avgDays as number)
  const avgCycleTime =
    avgCycle.length > 0
      ? `${Math.round(avgCycle.reduce((a, b) => a + b, 0) / avgCycle.length)}d`
      : "—"

  return { prVelocity, cycleTime, openIssues, testCounts, totalMergedPRs, totalOpenIssues, totalTests, avgCycleTime }
}

export default async function DashboardPage() {
  const {
    prVelocity,
    cycleTime,
    openIssues,
    testCounts,
    totalMergedPRs,
    totalOpenIssues,
    totalTests,
    avgCycleTime,
  } = await fetchAllData()

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100">AI Crew Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">gasoto-dev · Ren + Forge + Vex</p>
          </div>
          <span className="text-xs text-slate-600">Updates every 5 min</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stat strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Merged PRs" value={totalMergedPRs} sub="all repos" />
          <StatCard label="Open Issues" value={totalOpenIssues} sub="across all repos" />
          <StatCard label="Avg Cycle Time" value={avgCycleTime} sub="issue open → close" />
          <StatCard
            label="Tests (Vex Audit)"
            value={totalTests > 0 ? totalTests : "—"}
            sub={totalTests > 0 ? "latest snapshot" : "no audit data yet"}
          />
        </div>

        {/* PR Velocity */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            PR Velocity — Merged per Week
          </h2>
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-5">
            <PRVelocityChart data={prVelocity} />
          </div>
        </section>

        {/* Cycle Time */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Issue Cycle Time — Avg Days to Close
          </h2>
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-5">
            <CycleTimeChart data={cycleTime} />
          </div>
        </section>

        {/* Repo table */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Repos
          </h2>
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-5">
            <RepoTable openIssues={openIssues} testCounts={testCounts} />
          </div>
        </section>
      </main>
    </div>
  )
}
