import { render, screen } from "@testing-library/react"
import ProjectHistory from "@/components/ProjectHistory"
import PRVelocityChart from "@/components/PRVelocityChart"
import CycleTimeChart from "@/components/CycleTimeChart"
import RepoTable from "@/components/RepoTable"
import StatCard from "@/components/StatCard"

// --- ProjectHistory ---
describe("ProjectHistory", () => {
  it("renders without crashing", () => {
    render(<ProjectHistory />)
  })
  it("shows all four category sections", () => {
    render(<ProjectHistory />)
    expect(screen.getByText("Infrastructure")).toBeInTheDocument()
    expect(screen.getByText("Agent Crew")).toBeInTheDocument()
    expect(screen.getByText("Repos")).toBeInTheDocument()
    expect(screen.getByText("Workflow Standards")).toBeInTheDocument()
  })
  it("lists the three AI agents", () => {
    render(<ProjectHistory />)
    expect(screen.getByText("Ren AI")).toBeInTheDocument()
    expect(screen.getByText("Forge AI")).toBeInTheDocument()
    expect(screen.getByText("Vex AI")).toBeInTheDocument()
  })
  it("lists all repos", () => {
    render(<ProjectHistory />)
    expect(screen.getByText("the-crate")).toBeInTheDocument()
    expect(screen.getByText("codelens")).toBeInTheDocument()
    expect(screen.getByText("portfolio")).toBeInTheDocument()
    expect(screen.getByText("kelly-soto-photography")).toBeInTheDocument()
    expect(screen.getByText("dashboard")).toBeInTheDocument()
  })
  it("renders the section container", () => {
    render(<ProjectHistory />)
    expect(screen.getByTestId("project-history")).toBeInTheDocument()
  })
})

// --- StatCard ---
describe("StatCard", () => {
  it("renders without crashing", () => {
    render(<StatCard label="Total PRs" value={42} />)
  })
  it("shows label and value", () => {
    render(<StatCard label="Total PRs" value={42} sub="all repos" />)
    expect(screen.getByText("Total PRs")).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
    expect(screen.getByText("all repos")).toBeInTheDocument()
  })
  it("renders without sub", () => {
    render(<StatCard label="Tests" value="—" />)
    expect(screen.getByText("Tests")).toBeInTheDocument()
    expect(screen.getByText("—")).toBeInTheDocument()
  })
})

// --- PRVelocityChart ---
describe("PRVelocityChart", () => {
  it("renders without crashing with data", () => {
    render(<PRVelocityChart data={[{ week: "2026-W11", portfolio: 2, codelens: 1 }]} />)
  })
  it("shows empty state when no data", () => {
    render(<PRVelocityChart data={[]} />)
    expect(screen.getByText(/No merged PRs yet/i)).toBeInTheDocument()
  })
  it("renders a chart container when data is present", () => {
    render(<PRVelocityChart data={[{ week: "2026-W11", portfolio: 1 }]} />)
    expect(screen.getByTestId("recharts-responsive")).toBeInTheDocument()
  })
})

// --- CycleTimeChart ---
describe("CycleTimeChart", () => {
  it("renders without crashing with data", () => {
    render(
      <CycleTimeChart
        data={[{ repo: "portfolio", avgDays: 3.5, closedCount: 2 }]}
      />
    )
  })
  it("shows empty state when no valid data", () => {
    render(<CycleTimeChart data={[{ repo: "portfolio", avgDays: null, closedCount: 0 }]} />)
    expect(screen.getByText(/No closed issues yet/i)).toBeInTheDocument()
  })
  it("renders chart when data is present", () => {
    render(
      <CycleTimeChart
        data={[{ repo: "codelens", avgDays: 1.2, closedCount: 5 }]}
      />
    )
    expect(screen.getByTestId("recharts-responsive")).toBeInTheDocument()
  })
})

// --- RepoTable ---
describe("RepoTable", () => {
  const openIssues = [
    { repo: "portfolio", openCount: 2 },
    { repo: "codelens", openCount: 0 },
  ]
  const testCounts = [
    { repo: "portfolio", latestCount: 25, latestDate: "2026-03-13", buildPass: true },
  ]

  it("renders without crashing", () => {
    render(<RepoTable openIssues={openIssues} testCounts={testCounts} />)
  })
  it("shows all repo names", () => {
    render(<RepoTable openIssues={openIssues} testCounts={testCounts} />)
    expect(screen.getByText("portfolio")).toBeInTheDocument()
    expect(screen.getByText("codelens")).toBeInTheDocument()
  })
  it("shows open issue counts", () => {
    render(<RepoTable openIssues={openIssues} testCounts={testCounts} />)
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("0")).toBeInTheDocument()
  })
  it("shows test count when vex data available", () => {
    render(<RepoTable openIssues={openIssues} testCounts={testCounts} />)
    expect(screen.getByText("25")).toBeInTheDocument()
  })
  it("shows pass/fail build status", () => {
    render(<RepoTable openIssues={openIssues} testCounts={testCounts} />)
    expect(screen.getByText(/✓ pass/i)).toBeInTheDocument()
  })
  it("repo names link to github", () => {
    render(<RepoTable openIssues={openIssues} testCounts={testCounts} />)
    const link = screen.getByRole("link", { name: "portfolio" })
    expect(link).toHaveAttribute("href", "https://github.com/gasoto-dev/portfolio")
  })
})
