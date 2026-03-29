import { useState, useEffect } from "react";
import { MapPin, Phone, Navigation, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Place {
  id: number;
  name: string;
  type: string;
  distance: number; // meters
  lat: number;
  lon: number;
  phone?: string;
  address?: string;
}

const TYPE_CFG: Record<string, { label: string; color: string; emoji: string }> = {
  hospital:   { label: "Hospital",   color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40",         emoji: "🏥" },
  clinic:     { label: "Clinic",     color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40", emoji: "🏨" },
  counselor:  { label: "Counselor",  color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40", emoji: "🧠" },
  ngo:        { label: "NGO",        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40", emoji: "🤝" },
  pharmacy:   { label: "Pharmacy",   color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40",     emoji: "💊" },
};

function distanceLabel(m: number): string {
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
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

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const data = await res.json();

  const places: Place[] = data.elements
    .filter((el: any) => el.tags?.name)
    .map((el: any) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      const amenity = el.tags?.amenity || el.tags?.office || el.tags?.social_facility || "";
      let type = "clinic";
      if (amenity === "hospital")                          type = "hospital";
      else if (amenity === "pharmacy")                     type = "pharmacy";
      else if (amenity === "ngo" || amenity === "social_facility") type = "ngo";
      else if (amenity === "doctors")                      type = "counselor";

      return {
        id:       el.id,
        name:     el.tags.name,
        type,
        distance: haversine(lat, lon, elLat, elLon),
        lat:      elLat,
        lon:      elLon,
        phone:    el.tags?.phone || el.tags?.["contact:phone"],
        address:  el.tags?.["addr:street"] ? `${el.tags["addr:housenumber"] ?? ""} ${el.tags["addr:street"]}`.trim() : undefined,
      };
    })
    .sort((a: Place, b: Place) => a.distance - b.distance)
    .slice(0, 8);

  return places;
}

export default function NearbyHelp() {
  const [places,   setPlaces]   = useState<Place[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [filter,   setFilter]   = useState<string>("all");

  const fetchLocation = () => {
    setLoading(true);
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLocation({ lat, lon });
        try {
          const results = await fetchNearbyPlaces(lat, lon);
          setPlaces(results);
          if (results.length === 0) setError("No places found nearby. Try increasing search radius.");
        } catch {
          setError("Could not fetch nearby places. Check your internet connection.");
        } finally {
          setLoading(false);
        }
      },
      err => {
        setLoading(false);
        if (err.code === 1) setError("Location access denied. Please allow location in browser settings.");
        else setError("Could not get your location. Please try again.");
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => { fetchLocation(); }, []);

  const types = ["all", ...Array.from(new Set(places.map(p => p.type)))];
  const filtered = filter === "all" ? places : places.filter(p => p.type === filter);

  const openMaps = (p: Place) => {
    window.open(`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}&zoom=16`, "_blank");
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Nearby Help</span>
          {location && <span className="text-[10px] text-emerald-500 font-bold">Live</span>}
        </div>
        <button onClick={fetchLocation} disabled={loading}
          className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors disabled:opacity-50">
          <RefreshCw className={cn("w-3.5 h-3.5 text-slate-400", loading && "animate-spin")} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
          <p className="text-xs text-indigo-700 dark:text-indigo-300">Finding nearby hospitals & support centers...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">{error}</p>
        </div>
      )}

      {/* Filter tabs */}
      {places.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={cn("px-2 py-1 rounded-lg text-[10px] font-bold transition-all capitalize",
                filter === t ? "bg-indigo-600 text-white" : "bg-white/50 dark:bg-white/10 text-slate-600 dark:text-slate-300")}>
              {t === "all" ? "All" : TYPE_CFG[t]?.label ?? t}
            </button>
          ))}
        </div>
      )}

      {/* Places list */}
      {!loading && filtered.map(p => {
        const cfg = TYPE_CFG[p.type] ?? TYPE_CFG.clinic;
        return (
          <div key={p.id} className="p-3 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm">{cfg.emoji}</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{p.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", cfg.color)}>{cfg.label}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{distanceLabel(p.distance)}</span>
                </div>
                {p.address && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{p.address}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                {p.phone && (
                  <a href={`tel:${p.phone}`}
                    className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors">
                    <Phone className="w-3 h-3" />
                  </a>
                )}
                <button onClick={() => openMaps(p)}
                  className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors">
                  <Navigation className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {!loading && !error && places.length === 0 && (
        <button onClick={fetchLocation}
          className="w-full py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
          <MapPin className="w-3.5 h-3.5" /> Find Nearby Help
        </button>
      )}

      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
        Powered by OpenStreetMap · Data may vary by region
      </p>
    </div>
  );
}
