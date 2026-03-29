import { useState, useEffect } from "react";
import {
  MapPin, Phone, Navigation, RefreshCw,
  Loader2, AlertCircle, Maximize2, Minimize2,
  ChevronDown, ChevronUp, Hospital
} from "lucide-react";
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

const TYPE_CFG: Record<string, { label: string; bg: string; text: string; dot: string; emoji: string }> = {
  hospital:  { label: "Hospital",  bg: "bg-red-50 dark:bg-red-950/40",     text: "text-red-600 dark:text-red-400",     dot: "bg-red-500",     emoji: "🏥" },
  clinic:    { label: "Clinic",    bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500", emoji: "🏨" },
  counselor: { label: "Counselor", bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-600 dark:text-indigo-400", dot: "bg-indigo-500", emoji: "🧠" },
  ngo:       { label: "NGO",       bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", emoji: "🤝" },
  pharmacy:  { label: "Pharmacy",  bg: "bg-blue-50 dark:bg-blue-950/40",    text: "text-blue-600 dark:text-blue-400",    dot: "bg-blue-500",    emoji: "💊" },
};

function distanceLabel(m: number) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchPlaces(lat: number, lon: number): Promise<Place[]> {
  // Use backend proxy to avoid CORS
  const res  = await fetch(`/api/nearby?lat=${lat}&lon=${lon}&radius=5000`);
  if (!res.ok) throw new Error("API error");
  const data = await res.json();

  return (data.elements ?? [])
    .filter((el: any) => el.tags?.name)
    .map((el: any) => {
      const elLat   = el.lat ?? el.center?.lat;
      const elLon   = el.lon ?? el.center?.lon;
      const amenity = el.tags?.amenity || el.tags?.office || el.tags?.social_facility || "";
      let type = "clinic";
      if (amenity === "hospital")                                  type = "hospital";
      else if (amenity === "pharmacy")                             type = "pharmacy";
      else if (amenity === "ngo" || amenity === "social_facility") type = "ngo";
      else if (amenity === "doctors")                              type = "counselor";
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

// ── Single place card ──────────────────────────────────────────────────────────
function PlaceCard({ p }: { p: Place }) {
  const cfg = TYPE_CFG[p.type] ?? TYPE_CFG.clinic;
  return (
    <div className="flex items-start gap-3 p-4 bg-white/70 dark:bg-white/5 rounded-2xl border border-white/50 dark:border-white/10 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 group">
      {/* Type icon */}
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm", cfg.bg)}>
        {cfg.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{p.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", cfg.bg, cfg.text)}>{cfg.label}</span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
            <MapPin className="w-2.5 h-2.5" />{distanceLabel(p.distance)}
          </span>
        </div>
        {p.address && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{p.address}</p>}
      </div>

      {/* Action buttons */}
      <div className="flex gap-1.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
        {p.phone && (
          <a href={`tel:${p.phone}`} title={`Call: ${p.phone}`}
            className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 flex items-center justify-center transition-colors">
            <Phone className="w-3.5 h-3.5" />
          </a>
        )}
        <button onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}&zoom=16`, "_blank")}
          title="View on map"
          className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center justify-center transition-colors">
          <Navigation className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function NearbyHelp() {
  const [places,    setPlaces]    = useState<Place[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [location,  setLocation]  = useState<{ lat: number; lon: number } | null>(null);
  const [filter,    setFilter]    = useState("all");
  const [expanded,  setExpanded]  = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [searching, setSearching] = useState(false);

  const searchByCity = async () => {
    if (!cityInput.trim()) return;
    setSearching(true); setError("");
    try {
      // Geocode city using Nominatim (free, no key)
      const geo = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityInput)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const geoData = await geo.json();
      if (!geoData.length) { setError(`City "${cityInput}" not found. Try a different name.`); setSearching(false); return; }
      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);
      load(lat, lon);
    } catch {
      setError("Geocoding failed. Check your internet connection.");
    } finally {
      setSearching(false);
    }
  };

  const load = (manualLat?: number, manualLon?: number) => {
    setLoading(true); setError("");

    // If manual coords provided, skip geolocation
    if (manualLat && manualLon) {
      setLocation({ lat: manualLat, lon: manualLon });
      fetchPlaces(manualLat, manualLon)
        .then(setPlaces)
        .catch(() => setError("Could not load nearby places. Make sure the dev server is running."))
        .finally(() => setLoading(false));
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser."); setLoading(false); return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        setLocation({ lat, lon });
        try {
          setPlaces(await fetchPlaces(lat, lon));
        } catch {
          setError("Could not load nearby places. Make sure the dev server is running.");
        } finally { setLoading(false); }
      },
      err => {
        setLoading(false);
        setError(err.code === 1
          ? "Location access denied. Click the lock icon in your browser address bar and allow location."
          : "Could not get your location. Please try again.");
      },
      { timeout: 12000 }
    );
  };

  useEffect(() => { load(); }, []);

  const types    = ["all", ...Array.from(new Set(places.map(p => p.type)))];
  const filtered = filter === "all" ? places : places.filter(p => p.type === filter);

  return (
    <>
      {/* ── Expanded full-screen overlay ── */}
      {expanded && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}>
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}>
            {/* Expanded header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">Nearby Help Centers</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {location ? `${filtered.length} places found near you` : "Getting your location..."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => load()} disabled={loading}
                  className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors disabled:opacity-50">
                  <RefreshCw className={cn("w-4 h-4 text-slate-400", loading && "animate-spin")} />
                </button>
                <button onClick={() => setExpanded(false)}
                  className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 transition-colors">
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            {places.length > 0 && (
              <div className="grid grid-cols-5 gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                {[
                  { label: "Total",     value: places.length,                                    color: "slate"   },
                  { label: "Hospitals", value: places.filter(p => p.type === "hospital").length, color: "red"     },
                  { label: "Clinics",   value: places.filter(p => p.type === "clinic").length,   color: "orange"  },
                  { label: "NGOs",      value: places.filter(p => p.type === "ngo").length,      color: "emerald" },
                  { label: "Pharmacy",  value: places.filter(p => p.type === "pharmacy").length, color: "blue"    },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-950/30 text-center`}>
                    <p className={`text-2xl font-extrabold text-${color}-600 dark:text-${color}-400`}>{value}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filter */}
            {places.length > 0 && (
              <div className="flex gap-2 px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex-wrap">
                {types.map(t => (
                  <button key={t} onClick={() => setFilter(t)}
                    className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      filter === t ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30")}>
                    {t === "all" ? `All (${places.length})` : `${TYPE_CFG[t]?.emoji} ${TYPE_CFG[t]?.label} (${places.filter(p => p.type === t).length})`}
                  </button>
                ))}
              </div>
            )}

            {/* Grid list */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading && (
                <div className="flex items-center justify-center gap-3 py-12">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  <p className="text-slate-500 dark:text-slate-400">Finding nearby places...</p>
                </div>
              )}
              {error && !loading && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">{error}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 space-y-3">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Search by city name</p>
                    <div className="flex gap-2">
                      <input type="text" value={cityInput} onChange={e => setCityInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && searchByCity()}
                        placeholder="e.g. Delhi, Mumbai, Chandigarh"
                        className="flex-1 h-10 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500" />
                      <button onClick={searchByCity} disabled={searching || !cityInput.trim()}
                        className="px-4 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold disabled:opacity-50 transition-colors flex items-center gap-2">
                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />} Search
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {["Delhi","Mumbai","Chandigarh","Bangalore","Chennai","Hyderabad","Pune","Kolkata"].map(city => (
                        <button key={city} onClick={() => { setCityInput(city); }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 transition-colors">
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => load()} className="w-full py-3 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-sm font-bold hover:bg-amber-200 transition-colors">
                    Try GPS Again
                  </button>
                </div>
              )}
              {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.map(p => <PlaceCard key={p.id} p={p} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Inline compact view ── */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Nearby Help</span>
            {location && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCollapsed(c => !c)} title={collapsed ? "Show" : "Hide"}
              className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors text-slate-400">
              {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setExpanded(true)} title="Full view"
              className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors text-slate-400">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => load()} disabled={loading} title="Refresh"
              className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors disabled:opacity-50">
              <RefreshCw className={cn("w-3.5 h-3.5 text-slate-400", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {!collapsed && (
          <>
            {/* Loading */}
            {loading && (
              <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
                <p className="text-xs text-indigo-700 dark:text-indigo-300">Finding nearby hospitals...</p>
              </div>
            )}

            {/* Error + manual city search fallback */}
            {error && !loading && (
              <div className="space-y-2">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">{error}</p>
                  </div>
                </div>
                {/* Manual city input */}
                <div className="p-3 bg-white/60 dark:bg-white/5 rounded-xl border border-white/40 dark:border-white/10 space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Search by city instead</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cityInput}
                      onChange={e => setCityInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && searchByCity()}
                      placeholder="e.g. Delhi, Mumbai, Chandigarh"
                      className="flex-1 h-8 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={searchByCity}
                      disabled={searching || !cityInput.trim()}
                      className="px-3 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-1">
                      {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                      Go
                    </button>
                  </div>
                  {/* Quick city buttons */}
                  <div className="flex gap-1 flex-wrap">
                    {["Delhi","Mumbai","Chandigarh","Bangalore","Chennai"].map(city => (
                      <button key={city}
                        onClick={() => { setCityInput(city); }}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 transition-colors">
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => load()}
                  className="w-full py-2 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-200 transition-colors">
                  Try GPS Again
                </button>
              </div>
            )}

            {/* Filter */}
            {places.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {types.map(t => (
                  <button key={t} onClick={() => setFilter(t)}
                    className={cn("px-2 py-1 rounded-lg text-[10px] font-bold transition-all",
                      filter === t ? "bg-indigo-600 text-white" : "bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-white/40 dark:border-white/10")}>
                    {t === "all" ? `All (${places.length})` : `${TYPE_CFG[t]?.emoji} ${TYPE_CFG[t]?.label}`}
                  </button>
                ))}
              </div>
            )}

            {/* Compact list */}
            {!loading && filtered.length > 0 && (
              <div className="space-y-2">
                {filtered.slice(0, 4).map(p => <PlaceCard key={p.id} p={p} />)}
                {filtered.length > 4 && (
                  <button onClick={() => setExpanded(true)}
                    className="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 border border-indigo-100 dark:border-indigo-800">
                    <Maximize2 className="w-3.5 h-3.5" />
                    View all {filtered.length} places
                  </button>
                )}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && places.length === 0 && (
              <button onClick={() => load()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold hover:shadow-md transition-all flex items-center justify-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Find Nearby Help
              </button>
            )}

            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
              OpenStreetMap · Tap <Maximize2 className="w-2.5 h-2.5 inline" /> for full view
            </p>
          </>
        )}
      </div>
    </>
  );
}
