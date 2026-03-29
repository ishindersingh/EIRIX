import { useState, useEffect } from "react";
import { MapPin, Phone, Navigation, RefreshCw, Loader2, AlertCircle, Maximize2, Minimize2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Place {
  id: number;
  name: string;
  type: string;
  distance: number;
  lat: number;
  lon: number;
  phone?: string;
  address?: string;
}

const TYPE_CFG: Record<string, { label: string; color: string; dot: string; emoji: string }> = {
  hospital:  { label: "Hospital",  color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40",             dot: "bg-red-500",     emoji: "🏥" },
  clinic:    { label: "Clinic",    color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40", dot: "bg-orange-500",  emoji: "🏨" },
  counselor: { label: "Counselor", color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40", dot: "bg-indigo-500",  emoji: "🧠" },
  ngo:       { label: "NGO",       color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40", dot: "bg-emerald-500", emoji: "🤝" },
  pharmacy:  { label: "Pharmacy",  color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40",         dot: "bg-blue-500",    emoji: "💊" },
};

function distanceLabel(m: number) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function fetchNearbyPlaces(lat: number, lon: number, radius = 5000): Promise<Place[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="clinic"](around:${radius},${lat},${lon});
      node["amenity"="doctors"](around:${radius},${lat},${lon});
      node["amenity"="pharmacy"](around:${radius},${lat},${lon});
      node["office"="ngo"](around:${radius},${lat},${lon});
      node["social_facility"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="clinic"](around:${radius},${lat},${lon});
    );
    out center 20;
  `;
  const res  = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body:   `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const data = await res.json();
  return data.elements
    .filter((el: any) => el.tags?.name)
    .map((el: any) => {
      const elLat   = el.lat ?? el.center?.lat;
      const elLon   = el.lon ?? el.center?.lon;
      const amenity = el.tags?.amenity || el.tags?.office || el.tags?.social_facility || "";
      let type = "clinic";
      if (amenity === "hospital")                                    type = "hospital";
      else if (amenity === "pharmacy")                               type = "pharmacy";
      else if (amenity === "ngo" || amenity === "social_facility")   type = "ngo";
      else if (amenity === "doctors")                                type = "counselor";
      return {
        id: el.id, name: el.tags.name, type,
        distance: haversine(lat, lon, elLat, elLon),
        lat: elLat, lon: elLon,
        phone:   el.tags?.phone || el.tags?.["contact:phone"],
        address: el.tags?.["addr:street"]
          ? `${el.tags["addr:housenumber"] ?? ""} ${el.tags["addr:street"]}`.trim()
          : undefined,
      };
    })
    .sort((a: Place, b: Place) => a.distance - b.distance)
    .slice(0, 12);
}

// ── Place Card ─────────────────────────────────────────────────────────────────
function PlaceCard({ p, expanded }: { p: Place; expanded: boolean }) {
  const cfg = TYPE_CFG[p.type] ?? TYPE_CFG.clinic;
  return (
    <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 hover:shadow-lg hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200 group">
      {/* Color dot */}
      <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", cfg.dot)} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{p.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", cfg.color)}>
                {cfg.emoji} {cfg.label}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {distanceLabel(p.distance)}
              </span>
            </div>
            {p.address && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{p.address}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
            {p.phone && (
              <a href={`tel:${p.phone}`} title={p.phone}
                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors">
                <Phone className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}&zoom=16`, "_blank")}
              title="Open in map"
              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors">
              <Navigation className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function NearbyHelp() {
  const [places,   setPlaces]   = useState<Place[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [filter,   setFilter]   = useState("all");
  const [expanded, setExpanded] = useState(false);   // full-width mode
  const [collapsed,setCollapsed]= useState(false);   // hide list

  const fetchLocation = () => {
    setLoading(true); setError("");
    if (!navigator.geolocation) {
      setError("Geolocation not supported."); setLoading(false); return;
    }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLocation({ lat, lon });
        try {
          const results = await fetchNearbyPlaces(lat, lon);
          setPlaces(results);
          if (!results.length) setError("No places found nearby. Try again later.");
        } catch { setError("Could not fetch places. Check your connection."); }
        finally   { setLoading(false); }
      },
      err => {
        setLoading(false);
        setError(err.code === 1 ? "Location denied. Allow location in browser settings." : "Could not get location.");
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => { fetchLocation(); }, []);

  const types    = ["all", ...Array.from(new Set(places.map(p => p.type)))];
  const filtered = filter === "all" ? places : places.filter(p => p.type === filter);

  return (
    <div className={cn(
      "transition-all duration-500 ease-in-out",
      expanded ? "fixed inset-4 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 p-6 overflow-y-auto" : "space-y-3"
    )}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-md">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Nearby Help</span>
            {location && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-500 font-bold">Live</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Collapse list toggle */}
          <button onClick={() => setCollapsed(c => !c)} title={collapsed ? "Show list" : "Hide list"}
            className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors text-slate-400">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {/* Expand/collapse full-width */}
          <button onClick={() => setExpanded(e => !e)} title={expanded ? "Collapse" : "Expand full view"}
            className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors text-slate-400">
            {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {/* Refresh */}
          <button onClick={fetchLocation} disabled={loading} title="Refresh"
            className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors disabled:opacity-50">
            <RefreshCw className={cn("w-4 h-4 text-slate-400", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* ── Stats row (when expanded) ── */}
      {expanded && places.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total",     value: places.length,                                    color: "indigo" },
            { label: "Hospitals", value: places.filter(p => p.type === "hospital").length, color: "red"    },
            { label: "Clinics",   value: places.filter(p => p.type === "clinic").length,   color: "orange" },
            { label: "NGOs",      value: places.filter(p => p.type === "ngo").length,      color: "emerald"},
          ].map(({ label, value, color }) => (
            <div key={label} className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-950/30 text-center border border-${color}-100 dark:border-${color}-800`}>
              <p className={`text-xl font-extrabold text-${color}-600 dark:text-${color}-400`}>{value}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
          <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Finding nearby hospitals & support centers...</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">{error}</p>
            <button onClick={fetchLocation} className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline mt-1">Try again</button>
          </div>
        </div>
      )}

      {/* ── Filter tabs ── */}
      {places.length > 0 && !collapsed && (
        <div className="flex gap-1.5 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={cn(
                "px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all",
                filter === t
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-white/40 dark:border-white/10"
              )}>
              {t === "all" ? `All (${places.length})` : `${TYPE_CFG[t]?.emoji ?? ""} ${TYPE_CFG[t]?.label ?? t} (${places.filter(p=>p.type===t).length})`}
            </button>
          ))}
        </div>
      )}

      {/* ── Places list ── */}
      {!loading && !collapsed && (
        <div className={cn(
          "transition-all duration-300",
          expanded
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            : "space-y-2"
        )}>
          {filtered.map(p => <PlaceCard key={p.id} p={p} expanded={expanded} />)}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && places.length === 0 && (
        <button onClick={fetchLocation}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:shadow-md transition-all flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" /> Find Nearby Help
        </button>
      )}

      {/* ── Footer ── */}
      {!collapsed && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center pt-1">
          Powered by OpenStreetMap · {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── Expanded backdrop close ── */}
      {expanded && (
        <button onClick={() => setExpanded(false)}
          className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 transition-colors border border-white/20 dark:border-white/10">
          <Minimize2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
