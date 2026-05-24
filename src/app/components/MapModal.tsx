"use client";

import { useState, useEffect, useRef } from "react";
import Map, { Marker, MapMouseEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { ApiMapa, LocationSuggestion } from "@/services/api/ApiMapa";
import { Coordinates } from "@/services/api/ILocation";
import { Search, X, MapPin } from "lucide-react";

interface MapModalProps {
  apiMapa: ApiMapa;
  onConfirm: () => void;
  onClose: () => void;
}

export default function MapModal({ apiMapa, onConfirm, onClose }: MapModalProps) {
  const [marker, setMarker] = useState<Coordinates | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced autocomplete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await apiMapa.searchSuggestions(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, apiMapa]);

  function handleClick(e: MapMouseEvent) {
    const lat = e.lngLat.lat;
    const lon = e.lngLat.lng;
    apiMapa.selectLocation(lat, lon);
    setMarker({ lat, lon });
    setShowSuggestions(false);
  }

  function pickSuggestion(s: LocationSuggestion) {
    apiMapa.selectLocation(s.lat, s.lon);
    setMarker({ lat: s.lat, lon: s.lon });
    setQuery(s.name);
    setShowSuggestions(false);
  }

  function handleConfirm() {
    if (marker) onConfirm();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-up"
      style={{ backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Seleccionar ubicación
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search with suggestions */}
        <div className="p-4 border-b border-white/10 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Buscar ciudad..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition"
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <ul
              className="absolute left-4 right-4 mt-1 rounded-xl overflow-hidden z-10 shadow-2xl"
              style={{
                background: "rgba(15, 23, 42, 0.98)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(16px)",
              }}
            >
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    onClick={() => pickSuggestion(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 transition flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <span className="truncate">{s.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Map */}
        <div className="h-96 relative">
          <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            initialViewState={{
              longitude: -67.48,
              latitude: -45.86,
              zoom: 4,
            }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            onClick={handleClick}
            style={{ width: "100%", height: "100%" }}
          >
            {marker && (
              <Marker latitude={marker.lat} longitude={marker.lon} anchor="bottom">
                <MapPin
                  className="w-9 h-9 text-orange-400"
                  fill="currentColor"
                  style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }}
                />
              </Marker>
            )}
          </Map>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-2 p-4 border-t border-white/10">
          <p className="text-xs text-white/40">
            {marker
              ? `${marker.lat.toFixed(4)}, ${marker.lon.toFixed(4)}`
              : "Buscá una ciudad o hacé click en el mapa"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!marker}
              className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-medium transition"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
