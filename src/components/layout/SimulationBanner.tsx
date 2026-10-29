import React from "react";
import { AlertTriangle } from "lucide-react";
import { SIMULATION_BANNER_TEXT } from "@/lib/constants";

export function SimulationBanner() {
  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-xs sm:text-sm font-medium border-b border-amber-600 shadow-sm flex items-center justify-center gap-2 text-center sticky top-0 z-50">
      <AlertTriangle className="w-4 h-4 text-amber-950 flex-shrink-0" />
      <span>{SIMULATION_BANNER_TEXT}</span>
    </div>
  );
}
