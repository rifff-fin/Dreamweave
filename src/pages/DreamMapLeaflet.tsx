import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";

import { api } from "@/services/api";

type Point = {
  _id?: string;
  city?: string;
  area?: string;
  count?: number;
  theme?: string;
  lat?: number;
  lng?: number;
};

const DHAKA = { lat: 23.8103, lng: 90.4125 };

/**
 * NOTE:
 * This repo currently has dependency/typing mismatches around `react-leaflet`.
 * Rather than keeping a build-breaking map component, this file provides
 * a safe fallback UI that keeps DreamMap functionality intact.
 */
const DreamMapLeaflet = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      try {
        // Using existing backend endpoint used in DreamMap
        const data = await api.analytics.getLocationHeatmap();

        const locationStats: unknown[] =
          (data?.locationStats as unknown[] | undefined) ??
          (Array.isArray(data) ? (data as unknown[]) : []);

        const nextPoints: Point[] = (locationStats as any[])
          .map((loc) => {
            const raw = loc as any;
            const lat = typeof raw.lat === "number" ? raw.lat : raw.latitude;
            const lng = typeof raw.lng === "number" ? raw.lng : raw.longitude;

            if (typeof lat !== "number" || typeof lng !== "number") return null;

            const count =
              typeof raw.count === "number" ? raw.count : Number(raw.count);
            if (typeof count !== "number" || Number.isNaN(count)) return null;

            return {
              _id: raw._id,
              city: raw.city,
              area: raw.area,
              theme: raw.theme,
              count,
              lat,
              lng,
            };
          })
          .filter(Boolean) as Point[];

        if (cancelled) return;

        setPoints(
          nextPoints.length
            ? nextPoints
            : [
                {
                  lat: DHAKA.lat,
                  lng: DHAKA.lng,
                  city: "Dhaka",
                  area: "Bangladesh",
                  theme: "Dream activity",
                  count: 0,
                },
              ],
        );
      } catch (e) {
        console.error("DreamMapLeaflet fetch failed:", e);
        if (cancelled) return;

        setPoints([
          {
            lat: DHAKA.lat,
            lng: DHAKA.lng,
            city: "Dhaka",
            area: "Bangladesh",
            theme: "Dream activity",
            count: 0,
          },
        ]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayedPoints = useMemo(() => {
    const fallback: Point = {
      lat: DHAKA.lat,
      lng: DHAKA.lng,
      city: "Dhaka",
      area: "Bangladesh",
      theme: "Dream activity",
      count: 0,
    };

    const base = points.length ? points : [fallback];
    return base.slice(0, 6);
  }, [points]);

  return (
    <div className="noctis-card min-h-[420px] mb-8 overflow-hidden p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-heading font-medium text-foreground">Map preview</p>
          <p className="text-xs text-muted-foreground mt-1">
            Leaflet disabled (dependency mismatch). Showing hotspot cards.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {isLoading ? "Loading…" : `${points.length} locations`}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {displayedPoints.map((p, i) => {
          const label = `${p.city ?? ""}${p.area ? `${p.city ? ", " : ""}${p.area}` : ""}`.trim();

          return (
            <motion.div
              key={`${p._id ?? ""}-${p.city ?? ""}-${p.area ?? ""}-${p.lat ?? ""}-${p.lng ?? ""}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className="noctis-card p-4 flex items-start gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/8">
                <FaMapMarkerAlt className="h-4 w-4 text-primary/60" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {label || "Dream location"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.theme || "Dream activity"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground">
                  {typeof p.count === "number" ? p.count : 1}
                </p>
                <p className="text-[10px] text-muted-foreground">signals</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DreamMapLeaflet;

