import fs from "fs"
import path from "path"

export interface VexMetricEntry {
  date: string
  repo: string
  branch: string
  testCount: number
  buildPass: boolean
}

const METRICS_DIR = path.join(
  process.env.HOME ?? "/home/georges",
  ".openclaw/workspace-vex/metrics"
)

export function readVexMetrics(): VexMetricEntry[] {
  try {
    if (!fs.existsSync(METRICS_DIR)) return []
    const files = fs.readdirSync(METRICS_DIR).filter((f) => f.endsWith(".json"))
    const entries: VexMetricEntry[] = []
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(METRICS_DIR, file), "utf-8")
        const data = JSON.parse(content)
        if (Array.isArray(data)) {
          entries.push(...data)
        } else if (data && typeof data === "object") {
          entries.push(data as VexMetricEntry)
        }
      } catch {
        // skip malformed files
      }
    }
    return entries
  } catch {
    return []
  }
}

export interface TestCountByRepo {
  repo: string
  latestCount: number
  latestDate: string
  buildPass: boolean
}

export function getLatestTestCounts(entries: VexMetricEntry[]): TestCountByRepo[] {
  const byRepo = new Map<string, VexMetricEntry>()
  for (const entry of entries) {
    const existing = byRepo.get(entry.repo)
    if (!existing || entry.date > existing.date) {
      byRepo.set(entry.repo, entry)
    }
  }
  return Array.from(byRepo.values()).map((e) => ({
    repo: e.repo,
    latestCount: e.testCount,
    latestDate: e.date,
    buildPass: e.buildPass,
  }))
}
