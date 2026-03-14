// Mock recharts for tests — renders data-testid containers
import React from "react"

const makeChart = (name: string) =>
  function MockChart({ children }: { children?: React.ReactNode }) {
    return <div data-testid={`recharts-${name}`}>{children}</div>
  }

export const BarChart = makeChart("bar-chart")
export const Bar = () => null
export const XAxis = () => null
export const YAxis = () => null
export const CartesianGrid = () => null
export const Tooltip = () => null
export const Legend = () => null
export const ResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="recharts-responsive">{children}</div>
)
export const Cell = () => null
export const LineChart = makeChart("line-chart")
export const Line = () => null
