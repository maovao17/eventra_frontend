"use client";

import { useState } from "react";

export default function BudgetTracker() {

  const [budget] = useState(100000);
  const [spent] = useState(65000);

  const remaining = budget - spent;
  const progress = (spent / budget) * 100;

  return (
    <div className="theme-card w-full max-w-md p-6">

      <h2 className="text-lg font-semibold mb-4">
        Budget Overview
      </h2>

      {/* Budget Numbers */}
      <div className="flex justify-between text-sm mb-3">

        <div>
          <p className="theme-muted">Total Budget</p>
          <p className="font-semibold">₹{budget}</p>
        </div>

        <div>
          <p className="theme-muted">Spent</p>
          <p className="theme-primary font-semibold">
            ₹{spent}
          </p>
        </div>

        <div>
          <p className="theme-muted">Remaining</p>
          <p className="theme-secondary font-semibold">
            ₹{remaining}
          </p>
        </div>

      </div>

      {/* Progress Bar */}

      <div className="theme-progress-track h-3 w-full rounded-full">

        <div
          className="h-3 rounded-full bg-[var(--primary)] transition-all"
          style={{ width: `${progress}%` }}
        ></div>

      </div>

      <p className="theme-muted mt-2 text-xs">
        {Math.round(progress)}% of budget used
      </p>

    </div>
  );
}
