"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAllStates } from "@/data/states";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const stateNameToAbbr: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
  Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI",
  Wyoming: "WY", "District of Columbia": "DC",
};

export function USMap() {
  const router = useRouter();
  const allStates = getAllStates();
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const stateByAbbr = Object.fromEntries(
    allStates.map((s) => [s.abbreviation, s])
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const hoveredState = hovered ? stateByAbbr[hovered] : null;

  // Determine map color category for a state
  function getStateColor(s: typeof allStates[0] | null): string {
    if (!s) return "var(--primary)";
    if (!s.allowsMedicalExemption) return "#ef4444"; // red
    if (!s.offered) return "#eab308"; // yellow
    return "#22c55e"; // green
  }

  return (
    <div className="relative" onMouseMove={handleMouseMove}>
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-green-500" />
          <span className="text-muted-foreground">Available Through OnlineTintExemption</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-yellow-500" />
          <span className="text-muted-foreground">Exemption Allowed — Not Offered by Us</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-500" />
          <span className="text-muted-foreground">No Medical Exemption</span>
        </div>
      </div>

      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1000 }}
        width={800}
        height={500}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.name;
              const abbr = stateNameToAbbr[stateName];
              const state = abbr ? stateByAbbr[abbr] : null;
              const isHovered = hovered === abbr;

              const baseColor = getStateColor(state);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => abbr && setHovered(abbr)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    if (state) {
                      router.push(
                        `/${state.slug}-window-tint-medical-exemption`
                      );
                    }
                  }}
                  style={{
                    default: {
                      fill: `color-mix(in srgb, ${baseColor} 25%, var(--background))`,
                      stroke: `color-mix(in srgb, ${baseColor} 40%, var(--border))`,
                      strokeWidth: 0.75,
                      outline: "none",
                      cursor: state ? "pointer" : "default",
                      transition: "all 0.2s ease",
                    },
                    hover: {
                      fill: `color-mix(in srgb, ${baseColor} 55%, var(--background))`,
                      stroke: baseColor,
                      strokeWidth: 1.5,
                      outline: "none",
                      cursor: "pointer",
                      filter: `drop-shadow(0 4px 12px color-mix(in srgb, ${baseColor} 50%, transparent))`,
                      transform: "translateY(-2px)",
                      transition: "all 0.2s ease",
                    },
                    pressed: {
                      fill: `color-mix(in srgb, ${baseColor} 70%, var(--background))`,
                      stroke: baseColor,
                      strokeWidth: 2,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Hover Tooltip Card */}
      {hoveredState && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltipPos.x + 20, top: tooltipPos.y - 20 }}
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl p-4 w-72 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-base text-white ${
                !hoveredState.allowsMedicalExemption ? "bg-red-500"
                  : hoveredState.offered ? "bg-green-500"
                  : "bg-yellow-500"
              }`}>
                {hovered}
              </span>
              <div>
                <div className="font-bold text-base text-card-foreground leading-tight">
                  {hoveredState.name}
                </div>
                <div className={`text-xs font-semibold flex items-center gap-1.5 mt-0.5 ${
                  !hoveredState.allowsMedicalExemption ? "text-red-400"
                    : hoveredState.offered ? "text-emerald-400"
                    : "text-yellow-400"
                }`}>
                  <span className={`inline-block h-2 w-2 rounded-full ${
                    !hoveredState.allowsMedicalExemption ? "bg-red-400"
                      : hoveredState.offered ? "bg-emerald-400"
                      : "bg-yellow-400"
                  }`} />
                  {!hoveredState.allowsMedicalExemption
                    ? "No Medical Exemption"
                    : hoveredState.offered
                    ? "Medical Exemption Available"
                    : "Exemption Allowed — Not Our Service"}
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Front Windows</span>
                <span className="text-card-foreground font-semibold">
                  {hoveredState.tintLaws.frontSideWindows}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ticket Fine</span>
                <span className="text-card-foreground font-semibold">
                  {hoveredState.ticketFine}
                </span>
              </div>
              {hoveredState.allowsMedicalExemption && hoveredState.offered && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-card-foreground font-semibold">
                    {hoveredState.exemptionDuration}
                  </span>
                </div>
              )}
            </div>
            {/* OnlineTintExemption service status */}
            <div className={`mt-3 pt-2 border-t border-border text-xs font-semibold ${
              hoveredState.offered ? "text-emerald-400" : "text-muted-foreground"
            }`}>
              {hoveredState.offered
                ? `OnlineTintExemption — $${hoveredState.price} • Click for details →`
                : !hoveredState.allowsMedicalExemption
                ? "OnlineTintExemption — Not available in this state"
                : "OnlineTintExemption — Contact your DMV for exemption info"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
