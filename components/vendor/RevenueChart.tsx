"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const data = [
 { month:"Jan", revenue:45000 },
 { month:"Feb", revenue:52000 },
 { month:"Mar", revenue:48000 },
 { month:"Apr", revenue:61000 },
 { month:"May", revenue:55000 },
 { month:"Jun", revenue:70000 },
 { month:"Jul", revenue:75000 },
 { month:"Aug", revenue:72000 },
 { month:"Sep", revenue:80000 },
 { month:"Oct", revenue:86000 },
 { month:"Nov", revenue:91000 },
 { month:"Dec", revenue:97000 }
];

export default function RevenueChart() {
  return (
    <div className="theme-card p-6">

      <div className="flex justify-between mb-4">
        <h2 className="font-semibold text-lg">
          Revenue Growth (2025)
        </h2>

        <div className="flex gap-2">
          <button className="border px-3 py-1 rounded">
            Export Report
          </button>
          <button className="border px-3 py-1 rounded">
            Filter Year
          </button>
        </div>
      </div>

      <LineChart width={650} height={250} data={data}>
        <XAxis dataKey="month"/>
        <YAxis/>
        <Tooltip/>
        <Line type="monotone" dataKey="revenue"/>
      </LineChart>

    </div>
  );
}