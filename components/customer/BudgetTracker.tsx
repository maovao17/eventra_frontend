"use client";

import { useState } from "react";

export default function BudgetTracker() {

  const [budget] = useState(100000);
  const [spent] = useState(65000);

  const remaining = budget - spent;
  const progress = (spent / budget) * 100;

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full max-w-md">

      <h2 className="text-lg font-semibold mb-4">
        Budget Overview
      </h2>

      {/* Budget Numbers */}
      <div className="flex justify-between text-sm mb-3">

        <div>
          <p className="text-gray-500">Total Budget</p>
          <p className="font-semibold">₹{budget}</p>
        </div>

        <div>
          <p className="text-gray-500">Spent</p>
          <p className="font-semibold text-[#E87D5F]">
            ₹{spent}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Remaining</p>
          <p className="font-semibold text-green-600">
            ₹{remaining}
          </p>
        </div>

      </div>

      {/* Progress Bar */}

      <div className="w-full bg-gray-200 h-3 rounded-full">

        <div
          className="bg-[#E87D5F] h-3 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>

      </div>

      <p className="text-xs text-gray-500 mt-2">
        {Math.round(progress)}% of budget used
      </p>

    </div>
  );
}