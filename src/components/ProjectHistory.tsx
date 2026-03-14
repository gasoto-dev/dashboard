const HISTORY = [
  {
    category: "Infrastructure",
    items: [
      { label: "Pi 5 hardened", detail: "SSH keys, UFW firewall, fail2ban, 2GB swap, 8GB RAM" },
      { label: "Google account", detail: "gasoto.ai@gmail.com + gog CLI (Gmail, Calendar, Drive)" },
      { label: "Tailscale", detail: "Pi on gasoto-dev tailnet — 100.122.117.128" },
      { label: "GitHub org", detail: "gasoto-ai (primary) + gasoto-dev (backup mirror)" },
      { label: "Daily backup", detail: "3am cron, ~/.openclaw → 34MB smart backup, 7-day rotation" },
      { label: "System monitor", detail: "CPU / RAM / disk check on every heartbeat, alerts at thresholds" },
    ],
  },
  {
    category: "Agent Crew",
    items: [
      { label: "Ren AI", detail: "Planner + orchestrator · #fish-tank · ID: 1481802596443357196" },
      { label: "Forge AI", detail: "Builder · #fish-tank · ID: 1481893856633950248" },
      { label: "Vex AI", detail: "QA gatekeeper · #fish-tank · ID: 1482113890610446449" },
    ],
  },
  {
    category: "Repos",
    items: [
      { label: "workflow", detail: "Handoff format, TASK.md, PR standards, TDD policy" },
      { label: "the-crate", detail: "Vinyl shop app · 32 tests · TDD rebuild" },
      { label: "fish-tank-tools", detail: "Kanban + notes + handoff gen · 39 tests · TDD rebuild" },
      { label: "codelens", detail: "Codebase modernization analyzer · 70 tests · dependency graph" },
      { label: "portfolio", detail: "George Soto portfolio site · 25 tests · codeyoursuccess.com" },
      { label: "kelly-soto-photography", detail: "Kelly's photography portfolio · 32 tests · masonry→uniform grid, lightbox" },
      { label: "dashboard", detail: "This dashboard · 34 tests · GitHub metrics + Vex audit data" },
    ],
  },
  {
    category: "Workflow Standards",
    items: [
      { label: "GitHub Issues", detail: "Canonical task source — full spec lives in the issue, Discord gets one-liner" },
      { label: "Pipeline", detail: "Ren plans → Forge builds → Vex gates → Ren pre-reviews → George merges" },
      { label: "TDD", detail: "Mandatory — tests written before/alongside code; static sites get smoke tests minimum" },
      { label: "CI", detail: "npm test + build on every PR across all repos" },
      { label: "Daily research", detail: "9am MST — Ren surfaces one finding, George approves/rejects" },
      { label: "Weekly digest", detail: "Friday 5pm — what shipped, PRs, Pi health, anything needing George" },
      { label: "Weekly audit", detail: "Monday 10am — Vex checks test counts + build health across all repos" },
    ],
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Infrastructure: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  "Agent Crew": "text-violet-400 bg-violet-400/10 border-violet-400/20",
  Repos: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "Workflow Standards": "text-amber-400 bg-amber-400/10 border-amber-400/20",
}

const CATEGORY_DOT: Record<string, string> = {
  Infrastructure: "bg-sky-400",
  "Agent Crew": "bg-violet-400",
  Repos: "bg-emerald-400",
  "Workflow Standards": "bg-amber-400",
}

export default function ProjectHistory() {
  return (
    <section data-testid="project-history">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Project History
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HISTORY.map((group) => {
          const colorClass = CATEGORY_COLORS[group.category] ?? "text-slate-400 bg-slate-400/10 border-slate-400/20"
          const dotClass = CATEGORY_DOT[group.category] ?? "bg-slate-400"

          return (
            <div
              key={group.category}
              className="bg-slate-800/60 border border-slate-700 rounded-lg p-5"
            >
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded border mb-4 ${colorClass}`}>
                {group.category}
              </div>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li key={item.label} className="flex gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dotClass}`} />
                    <div>
                      <span className="text-slate-200 text-sm font-medium">{item.label}</span>
                      <span className="text-slate-500 text-sm"> — {item.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
