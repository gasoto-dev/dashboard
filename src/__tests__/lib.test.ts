import {
  buildPRVelocityData,
  buildCycleTimeData,
  buildOpenIssueCounts,
} from "@/lib/github"
import { getLatestTestCounts } from "@/lib/vex-metrics"
import type { VexMetricEntry } from "@/lib/vex-metrics"

// buildPRVelocityData
describe("buildPRVelocityData", () => {
  it("returns empty array when no PRs", async () => {
    const result = await buildPRVelocityData({ portfolio: [], codelens: [] })
    expect(result).toEqual([])
  })

  it("groups PRs by week", async () => {
    const result = await buildPRVelocityData({
      portfolio: [
        { number: 1, title: "PR1", state: "closed", merged_at: "2026-03-10T10:00:00Z", created_at: "2026-03-09T10:00:00Z", closed_at: "2026-03-10T10:00:00Z" },
        { number: 2, title: "PR2", state: "closed", merged_at: "2026-03-11T10:00:00Z", created_at: "2026-03-10T10:00:00Z", closed_at: "2026-03-11T10:00:00Z" },
      ],
      codelens: [],
    })
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty("week")
    expect(result[0]).toHaveProperty("portfolio")
  })

  it("excludes unmerged PRs", async () => {
    const result = await buildPRVelocityData({
      portfolio: [
        { number: 1, title: "Unmerged", state: "closed", merged_at: null, created_at: "2026-03-09T10:00:00Z", closed_at: "2026-03-10T10:00:00Z" },
      ],
    })
    expect(result).toEqual([])
  })
})

// buildCycleTimeData
describe("buildCycleTimeData", () => {
  it("returns null avgDays when no closed issues", async () => {
    const result = await buildCycleTimeData({ portfolio: [] })
    expect(result[0].avgDays).toBeNull()
    expect(result[0].closedCount).toBe(0)
  })

  it("calculates average days correctly", async () => {
    const result = await buildCycleTimeData({
      portfolio: [
        {
          number: 1, title: "Issue 1", state: "closed",
          created_at: "2026-03-01T00:00:00Z",
          closed_at: "2026-03-03T00:00:00Z", // 2 days
        },
        {
          number: 2, title: "Issue 2", state: "closed",
          created_at: "2026-03-01T00:00:00Z",
          closed_at: "2026-03-05T00:00:00Z", // 4 days
        },
      ],
    })
    expect(result[0].avgDays).toBe(3) // (2 + 4) / 2
    expect(result[0].closedCount).toBe(2)
  })

  it("excludes open issues", async () => {
    const result = await buildCycleTimeData({
      portfolio: [
        { number: 1, title: "Open", state: "open", created_at: "2026-03-01T00:00:00Z", closed_at: null },
      ],
    })
    expect(result[0].avgDays).toBeNull()
  })

  it("excludes pull requests from cycle time", async () => {
    const result = await buildCycleTimeData({
      portfolio: [
        {
          number: 1, title: "PR as issue", state: "closed",
          created_at: "2026-03-01T00:00:00Z",
          closed_at: "2026-03-03T00:00:00Z",
          pull_request: { url: "..." },
        },
      ],
    })
    expect(result[0].avgDays).toBeNull()
  })
})

// buildOpenIssueCounts
describe("buildOpenIssueCounts", () => {
  it("counts open issues only", async () => {
    const result = await buildOpenIssueCounts({
      portfolio: [
        { number: 1, title: "Open", state: "open", created_at: "2026-03-01T00:00:00Z", closed_at: null },
        { number: 2, title: "Closed", state: "closed", created_at: "2026-03-01T00:00:00Z", closed_at: "2026-03-02T00:00:00Z" },
      ],
    })
    expect(result[0].openCount).toBe(1)
  })

  it("excludes PRs from open issue count", async () => {
    const result = await buildOpenIssueCounts({
      portfolio: [
        { number: 1, title: "PR", state: "open", created_at: "2026-03-01T00:00:00Z", closed_at: null, pull_request: {} },
      ],
    })
    expect(result[0].openCount).toBe(0)
  })

  it("returns 0 for repo with no issues", async () => {
    const result = await buildOpenIssueCounts({ portfolio: [] })
    expect(result[0].openCount).toBe(0)
  })
})

// getLatestTestCounts
describe("getLatestTestCounts", () => {
  it("returns empty array for empty input", () => {
    expect(getLatestTestCounts([])).toEqual([])
  })

  it("returns latest entry per repo when multiple dates exist", () => {
    const entries: VexMetricEntry[] = [
      { date: "2026-03-10", repo: "portfolio", branch: "main", testCount: 20, buildPass: true },
      { date: "2026-03-13", repo: "portfolio", branch: "main", testCount: 25, buildPass: true },
    ]
    const result = getLatestTestCounts(entries)
    expect(result).toHaveLength(1)
    expect(result[0].latestCount).toBe(25)
  })

  it("handles multiple repos", () => {
    const entries: VexMetricEntry[] = [
      { date: "2026-03-13", repo: "portfolio", branch: "main", testCount: 25, buildPass: true },
      { date: "2026-03-13", repo: "codelens", branch: "main", testCount: 70, buildPass: true },
    ]
    const result = getLatestTestCounts(entries)
    expect(result).toHaveLength(2)
  })

  it("includes buildPass status", () => {
    const entries: VexMetricEntry[] = [
      { date: "2026-03-13", repo: "portfolio", branch: "main", testCount: 25, buildPass: false },
    ]
    const result = getLatestTestCounts(entries)
    expect(result[0].buildPass).toBe(false)
  })
})
