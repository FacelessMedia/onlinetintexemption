"use client";

import { useState } from "react";
import Link from "next/link";
import { getAllStates } from "@/data/states";

// Grid positions for US map layout (row, col) - 11 cols x 8 rows
const statePositions: Record<string, [number, number]> = {
  AK: [0, 0], HI: [7, 0],
  WA: [0, 1], OR: [1, 1], CA: [2, 1],
  MT: [0, 2], ID: [1, 2], NV: [2, 2], UT: [3, 2], AZ: [4, 2],
  WY: [0, 3], CO: [3, 3], NM: [4, 3],
  ND: [0, 4], SD: [1, 4], NE: [2, 4], KS: [3, 4], OK: [4, 4], TX: [5, 4],
  MN: [0, 5], IA: [1, 5], MO: [2, 5], AR: [3, 5], LA: [4, 5],
  WI: [0, 6], IL: [1, 6], MS: [3, 6], 
  MI: [0, 7], IN: [1, 7], KY: [2, 7], TN: [3, 7], AL: [4, 7],
  OH: [1, 8], WV: [2, 8], NC: [3, 8], GA: [4, 8], FL: [5, 8],
  PA: [1, 9], VA: [2, 9], SC: [3, 9],
  NY: [0, 9], NJ: [2, 10], MD: [3, 10], DE: [4, 10],
  VT: [0, 10], NH: [0, 11], MA: [1, 11], CT: [2, 11], RI: [3, 11], ME: [0, 12],
  DC: [4, 9],
};

export function USMap() {
  const allStates = getAllStates();
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const stateMap = Object.fromEntries(allStates.map((s) => [s.abbreviation, s]));

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="relative">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: "repeat(13, 1fr)",
          gridTemplateRows: "repeat(8, 1fr)",
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Render empty cells for the full grid */}
        {Array.from({ length: 8 * 13 }).map((_, i) => {
          const row = Math.floor(i / 13);
          const col = i % 13;

          const entry = Object.entries(statePositions).find(
            ([, [r, c]]) => r === row && c === col
          );

          if (!entry) {
            return <div key={i} className="aspect-square" />;
          }

          const [abbr] = entry;
          const state = stateMap[abbr];
          if (!state) {
            return <div key={i} className="aspect-square" />;
          }

          const isHovered = hovered === abbr;

          return (
            <Link
              key={abbr}
              href={`/${state.slug}-window-tint-medical-exemption`}
              className={`aspect-square rounded-md flex flex-col items-center justify-center text-center transition-all duration-150 cursor-pointer border ${
                isHovered
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-110 z-10"
                  : "bg-card/80 text-card-foreground border-border hover:border-primary/50"
              }`}
              onMouseEnter={() => setHovered(abbr)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className={`font-bold text-sm leading-none ${isHovered ? "text-primary-foreground" : "text-primary"}`}>
                {abbr}
              </span>
              <span className="text-[8px] leading-tight mt-0.5 opacity-70 hidden xl:block">
                {state.name.length > 8 ? state.name.slice(0, 7) + "…" : state.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Tooltip */}
      {hovered && stateMap[hovered] && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltipPos.x + 16, top: tooltipPos.y - 10 }}
        >
          <div className="bg-card border border-border rounded-lg shadow-xl p-3 w-56">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
                {hovered}
              </span>
              <div>
                <div className="font-semibold text-sm text-card-foreground">
                  {stateMap[hovered].name}
                </div>
                <div className="text-xs text-muted-foreground">
                  Window Tint Exemption
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Front Windows:</span>
                <span className="text-foreground font-medium">{stateMap[hovered].tintLaws.frontSideWindows}</span>
              </div>
              <div className="flex justify-between">
                <span>Ticket Fine:</span>
                <span className="text-foreground font-medium">{stateMap[hovered].ticketFine}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-primary font-medium">
              Click to learn more →
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
