import type { RepoOpenIssues } from "@/lib/github"
import type { TestCountByRepo } from "@/lib/vex-metrics"

interface Props {
  openIssues: RepoOpenIssues[]
  testCounts: TestCountByRepo[]
}

export default function RepoTable({ openIssues, testCounts }: Props) {
  const testMap = new Map(testCounts.map((t) => [t.repo, t]))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
            <th className="py-3 pr-4">Repo</th>
            <th className="py-3 pr-4">Open Issues</th>
            <th className="py-3 pr-4">Tests</th>
            <th className="py-3 pr-4">Build</th>
            <th className="py-3">Last Audit</th>
          </tr>
        </thead>
        <tbody>
          {openIssues.map((row) => {
            const metrics = testMap.get(row.repo)
            return (
              <tr key={row.repo} className="border-b border-slate-800 hover:bg-slate-800/40">
                <td className="py-3 pr-4 font-medium text-slate-200">
                  <a
                    href={`https://github.com/gasoto-dev/${row.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    {row.repo}
                  </a>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      row.openCount > 0
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {row.openCount}
                  </span>
                </td>
                <td className="py-3 pr-4 text-slate-300">
                  {metrics ? metrics.latestCount : <span className="text-slate-600">—</span>}
                </td>
                <td className="py-3 pr-4">
                  {metrics ? (
                    <span
                      className={`text-xs font-medium ${
                        metrics.buildPass ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {metrics.buildPass ? "✓ pass" : "✗ fail"}
                    </span>
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </td>
                <td className="py-3 text-slate-500 text-xs">
                  {metrics ? metrics.latestDate : "—"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
