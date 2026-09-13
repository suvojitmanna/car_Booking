"use client";

import axios from "axios";
import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import FitBounds from "./FitBounds";
import { motion, AnimatePresence } from "motion/react";
import { Navigation, Clock } from "lucide-react";
import { geoapifyReverseGeocode, geoapifyGeocode } from "@/src/lib/geoapify";

type Props = {
  pickUp: string;
  drop: string;
  pickupLat?: number;
  pickupLon?: number;
  dropLat?: number;
  dropLon?: number;
  vehicles?: any[];
  onChange?: (p: string, d: string) => void;
  onDistance?: (d: number) => void;
  onDuration?: (time: string) => void;
};

const createPickupIcon = () =>
  L.divIcon({
    className: "leaflet-custom-marker",
    html: `
      <div style="width: 32px; height: 32px; position: relative; display: flex; align-items: center; justify-content: center; cursor: grab;">
        <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); transform: scale(1.2);"></div>
        <div style="width: 26px; height: 26px; border-radius: 50%; background: #10b981; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; position: relative; z-index: 2;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

const createDropIcon = () =>
  L.divIcon({
    className: "leaflet-custom-marker",
    html: `
      <div style="width: 32px; height: 32px; position: relative; display: flex; align-items: center; justify-content: center; cursor: grab;">
        <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(239, 68, 68, 0.35); transform: scale(1.2);"></div>
        <div style="width: 26px; height: 26px; border-radius: 50%; background: #ef4444; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; position: relative; z-index: 2;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

const getVehicleEmoji = (type: string) => {
  const t = type?.toLowerCase() || "";
  if (t === "bike" || t === "motorcycle" || t === "scooter") return "🏍️";
  if (t === "auto" || t === "rickshaw" || t === "tuk-tuk") return "🛺";
  if (t === "truck" || t === "loading") return "🚚";
  if (t === "heavy" || t === "lorry") return "🚛";
  return "🚗";
};

const createVehicleIcon = (type: string, vehicleModel: string) => {
  const emoji = getVehicleEmoji(type);

  return L.divIcon({
    className: "leaflet-custom-vehicle-marker",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
        <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: rgba(0, 0, 0, 0.15); animation: pulse 2s infinite;"></div>
        <div style="width: 34px; height: 34px; border-radius: 50%; background: #ffffff; border: 2.5px solid #18181b; box-shadow: 0 4px 14px rgba(0,0,0,0.28); display: flex; align-items: center; justify-content: center; position: relative; z-index: 2;">
          <span style="font-size: 19px; line-height: 1; display: inline-block; user-select: none; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.12));">
            ${emoji}
          </span>
        </div>
        <div style="margin-top: 3px; background: rgba(9, 9, 11, 0.92); backdrop-filter: blur(4px); color: #ffffff; font-size: 9.5px; font-weight: 800; padding: 1.5px 7px; border-radius: 9999px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 2px 8px rgba(0,0,0,0.3); letter-spacing: 0.02em;">
          ${vehicleModel || type}
        </div>
      </div>
    `,
    iconSize: [36, 54],
    iconAnchor: [18, 27],
    popupAnchor: [0, -28],
  });
};

function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 1) return "< 1 min";
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

const SearchMap = ({
  pickUp,
  drop,
  pickupLat,
  pickupLon,
  dropLat,
  dropLon,
  vehicles = [],
  onChange,
  onDistance,
  onDuration,
}: Props) => {
  const [p1, setP1] = useState<[number, number] | undefined>(
    pickupLat && pickupLon && pickupLat !== 0 && pickupLon !== 0
      ? [pickupLat, pickupLon]
      : undefined,
  );
  const [p2, setP2] = useState<[number, number] | undefined>(
    dropLat && dropLon && dropLat !== 0 && dropLon !== 0
      ? [dropLat, dropLon]
      : undefined,
  );
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [km, setKm] = useState<number | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  const reverseGeocode = async (
    lat: number,
    lon: number,
  ): Promise<string | null> => {
    try {
      const res = await geoapifyReverseGeocode(lat, lon);
      return res.address || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    }
  };

  const geoCoding = async (q: string): Promise<[number, number] | null> => {
    if (!q || !q.trim()) return null;
    try {
      return await geoapifyGeocode(q);
    } catch (err) {
      console.error("Geocoding error:", err);
      return null;
    }
  };

  const fetchRoute = useCallback(
    async (point1?: [number, number], point2?: [number, number]) => {
      if (!point1 || !point2) {
        setRouteCoords([]);
        setKm(null);
        setDuration(null);
        return;
      }

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${point1[1]},${point1[0]};${point2[1]},${point2[0]}?overview=full&geometries=geojson`;
        const res = await axios.get(url);

        if (res.data?.routes?.length > 0) {
          const route = res.data.routes[0];
          const coords: [number, number][] = route.geometry.coordinates.map(
            ([lon, lat]: [number, number]) => [lat, lon],
          );
          setRouteCoords(coords);

          const drivingKm = Number((route.distance / 1000).toFixed(1));
          const drivingDuration = formatDuration(route.duration);

          setKm(drivingKm);
          setDuration(drivingDuration);

          if (onDistance) onDistance(drivingKm);
          if (onDuration) onDuration(drivingDuration);
        } else {
          // Fallback
          setRouteCoords([point1, point2]);
          const fallbackKm = calculateDistance(
            point1[0],
            point1[1],
            point2[0],
            point2[1],
          );
          const estMins = Math.round((fallbackKm / 30) * 60);
          const fallbackDuration = formatDuration(estMins * 60);

          setKm(fallbackKm);
          setDuration(fallbackDuration);

          if (onDistance) onDistance(fallbackKm);
          if (onDuration) onDuration(fallbackDuration);
        }
      } catch (error) {
        console.warn("OSRM routing fallback to straight line:", error);
        setRouteCoords([point1, point2]);
        const fallbackKm = calculateDistance(
          point1[0],
          point1[1],
          point2[0],
          point2[1],
        );
        const estMins = Math.round((fallbackKm / 30) * 60);
        const fallbackDuration = formatDuration(estMins * 60);

        setKm(fallbackKm);
        setDuration(fallbackDuration);

        if (onDistance) onDistance(fallbackKm);
        if (onDuration) onDuration(fallbackDuration);
      }
    },
    [onDistance, onDuration],
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      if (pickupLat && pickupLon && pickupLat !== 0 && pickupLon !== 0) {
        setP1([pickupLat, pickupLon]);
      } else if (pickUp) {
        geoCoding(pickUp).then((coords) => coords && setP1(coords));
      }

      if (dropLat && dropLon && dropLat !== 0 && dropLon !== 0) {
        setP2([dropLat, dropLon]);
      } else if (drop) {
        geoCoding(drop).then((coords) => coords && setP2(coords));
      }
    }
  }, [pickUp, drop, pickupLat, pickupLon, dropLat, dropLon]);

  useEffect(() => {
    if (p1 && p2) {
      fetchRoute(p1, p2);
    }
  }, [p1, p2, fetchRoute]);

  const pickupEventHandlers = useMemo(
    () => ({
      async dragend(e: any) {
        const marker = e.target;
        const position = marker.getLatLng();
        const newCoords: [number, number] = [position.lat, position.lng];
        setP1(newCoords);
        if (p2) {
          fetchRoute(newCoords, p2);
        }
        const newAddr = await reverseGeocode(position.lat, position.lng);
        if (newAddr && onChange) {
          onChange(newAddr, drop);
        }
      },
    }),
    [drop, p2, fetchRoute, onChange],
  );

  const dropEventHandlers = useMemo(
    () => ({
      async dragend(e: any) {
        const marker = e.target;
        const position = marker.getLatLng();
        const newCoords: [number, number] = [position.lat, position.lng];
        setP2(newCoords);
        if (p1) {
          fetchRoute(p1, newCoords);
        }
        const newAddr = await reverseGeocode(position.lat, position.lng);
        if (newAddr && onChange) {
          onChange(pickUp, newAddr);
        }
      },
    }),
    [pickUp, p1, fetchRoute, onChange],
  );

  const defaultCenter: [number, number] = p1 || p2 || [22.5726, 88.3639];

  return (
    <div className="relative h-full w-full bg-zinc-100 overflow-hidden">
      <MapContainer
        style={{ width: "100%", height: "100%" }}
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            color="#0f172a"
            weight={7}
            opacity={0.75}
            lineCap="round"
            lineJoin="round"
          />
        )}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            color="#2563eb"
            weight={4}
            opacity={0.95}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {p1 && (
          <Marker
            position={p1}
            icon={createPickupIcon()}
            draggable={true}
            eventHandlers={pickupEventHandlers}
          >
            <Popup>
              <div className="text-xs font-semibold text-zinc-800 space-y-1">
                <div>
                  <span className="text-emerald-600 font-bold">Pickup:</span>{" "}
                  {pickUp || "Pickup Location"}
                </div>
                <div className="text-[10px] text-zinc-400 font-normal">
                  (Drag marker to reposition)
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {p2 && (
          <Marker
            position={p2}
            icon={createDropIcon()}
            draggable={true}
            eventHandlers={dropEventHandlers}
          >
            <Popup>
              <div className="text-xs font-semibold text-zinc-800 space-y-1">
                <div>
                  <span className="text-red-500 font-bold">Drop:</span>{" "}
                  {drop || "Drop Location"}
                </div>
                <div className="text-[10px] text-zinc-400 font-normal">
                  (Drag marker to reposition)
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Vehicles (Uber style) */}
        {vehicles &&
          vehicles.map((v: any, idx: number) => {
            const coords = v.owner?.location?.coordinates;
            let vLat: number | undefined;
            let vLon: number | undefined;

            if (
              coords &&
              Array.isArray(coords) &&
              coords.length === 2 &&
              (coords[0] !== 0 || coords[1] !== 0)
            ) {
              vLon = coords[0];
              vLat = coords[1];
            } else if (p1) {
              // If driver location hasn't been emitted yet, generate realistic nearby position around pickup point
              const angle = ((idx + 1) * 137.5 * Math.PI) / 180;
              const radiusKm = 0.35 + (idx % 4) * 0.18; // 350m - 900m
              const offsetLat = (radiusKm / 111) * Math.cos(angle);
              const offsetLon =
                (radiusKm / (111 * Math.cos((p1[0] * Math.PI) / 180))) *
                Math.sin(angle);
              vLat = p1[0] + offsetLat;
              vLon = p1[1] + offsetLon;
            }

            if (!vLat || !vLon) return null;

            return (
              <Marker
                key={v._id || idx}
                position={[vLat, vLon]}
                icon={createVehicleIcon(v.type, v.vehicleModel)}
              >
                <Popup>
                  <div className="text-xs font-sans text-zinc-900 p-1.5 space-y-1.5 min-w-[160px]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base leading-none">
                          {getVehicleEmoji(v.type)}
                        </span>
                        <span className="font-black text-sm text-zinc-950">
                          {v.vehicleModel}
                        </span>
                      </div>
                      <span className="text-[9px] bg-zinc-900 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                        {v.type}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono font-bold text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 inline-block uppercase tracking-wider">
                      {v.number}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-bold">
                      ₹{v.pricePerKM}/km • ₹{v.baseFare || 30} base
                    </div>
                    {v.owner?.name && (
                      <div className="text-[10px] text-zinc-400 font-medium">
                        Driver: {v.owner.name}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {p1 && p2 && <FitBounds p1={p1} p2={p2} />}
      </MapContainer>

      <AnimatePresence>
        {km !== null && duration !== null && (
          <motion.div
            initial={{ opacity: 0, x: -25, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -15, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute bottom-4 left-4 z-[1000] w-auto max-w-sm bg-white/95 backdrop-blur-md border border-zinc-200/90 shadow-2xl rounded-2xl p-3 flex items-center gap-4"
          >
            {/* Distance */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Navigation size={15} />
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block leading-none">
                  Distance
                </span>
                <span className="text-sm font-bold text-zinc-900">{km} km</span>
              </div>
            </div>

            <div className="h-7 w-px bg-zinc-200" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <Clock size={15} />
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block leading-none">
                  Est. Time
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  {duration}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchMap;
