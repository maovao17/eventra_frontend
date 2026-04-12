"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useVendorData } from "@/context/VendorContext";

export default function RevenueChart() {
  const { dashboard } = useVendorData();

  const data = dashboard?.monthlyRevenue ?? [];
  const hasRevenue = data.some((d: any) => d.revenue > 0);
  const year = new Date().getFullYear();

  return (
    <div className="theme-card p-6">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="font-semibold text-lg">Revenue Growth ({year})</h2>
      </div>

      {!hasRevenue ? (
        <div className="h-[250px] flex items-center justify-center theme-muted text-sm">
          No revenue data yet. Completed paid bookings will appear here.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => v >= 1000 ? `₹${v / 1000}k` : `₹${v}`}
            />
            <Tooltip
              formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ fill: "var(--primary)", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
