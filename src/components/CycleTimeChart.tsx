"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { RepoCycleTime } from "@/lib/github"

interface Props {
  data: RepoCycleTime[]
}

const filtered = (data: RepoCycleTime[]) =>
  data.filter((d) => d.avgDays !== null && d.closedCount > 0)

export default function CycleTimeChart({ data }: Props) {
  const chartData = filtered(data)

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No closed issues yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="repo"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          angle={-30}
          textAnchor="end"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          label={{ value: "days", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
          labelStyle={{ color: "#e2e8f0" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(val: any) => [`${val} days`, "Avg cycle time"]}
        />
        <Bar dataKey="avgDays" radius={[3, 3, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={i % 2 === 0 ? "#6366f1" : "#8b5cf6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
