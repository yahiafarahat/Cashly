import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"

import { ChartContainer } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

// Compact circular progress gauge built on the same shadcn chart primitives
// (recharts + ChartContainer) already used by the Analytics page's charts.
function RadialProgress({
  percent,
  color = "var(--primary)",
  trackColor = "var(--muted)",
  size = 132,
  thickness = 12,
  glow = true,
  className,
  children,
}) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0))
  const data = [{ value: clamped }]

  // Derive the ring band directly from the pixel thickness (rather than a
  // separate barSize) so it scales correctly with `size` instead of staying
  // a fixed width regardless of how big the circle is drawn.
  const radius = size / 2
  const innerRadiusPercent = Math.max(0, ((radius - thickness) / radius) * 100)

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{
        width: size,
        height: size,
        filter: glow ? `drop-shadow(0 0 14px color-mix(in srgb, ${color} 35%, transparent))` : undefined,
      }}
    >
      <ChartContainer
        config={{ value: { label: "Progress", color } }}
        className="aspect-square"
        style={{ width: size, height: size }}
      >
        <RadialBarChart
          data={data}
          cx="50%"
          cy="50%"
          startAngle={90}
          endAngle={-270}
          innerRadius={`${innerRadiusPercent}%`}
          outerRadius="100%"
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar dataKey="value" fill={color} background={{ fill: trackColor }} cornerRadius={thickness / 2} isAnimationActive={false} />
        </RadialBarChart>
      </ChartContainer>

      {children && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
          {/* Kept narrower than the ring's inner circle so longer amounts wrap instead of overflowing it. */}
          <div className="flex max-w-[68%] flex-col items-center gap-0.5">{children}</div>
        </div>
      )}
    </div>
  )
}

export default RadialProgress
