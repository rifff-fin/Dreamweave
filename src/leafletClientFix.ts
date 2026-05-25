// Leaflet client-side fix helpers
// Fixes marker icon URLs when using bundlers (Vite) and ensures map renders.
import L from "leaflet";

export function applyLeafletMarkerIconFix() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L as any).Icon.Default.prototype._getIconUrl;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (L as any).Icon.Default.mergeOptions({
    iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).toString(),
    iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString(),
    shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString(),
  });
}

export function safeInvalidateSize(map: L.Map | null | undefined) {
  if (!map) return;
  // Helps when the container was hidden during init
  setTimeout(() => {
    try {
      map.invalidateSize();
    } catch {
      // ignore
    }
  }, 50);

  setTimeout(() => {
    try {
      map.invalidateSize();
    } catch {
      // ignore
    }
  }, 250);
}

