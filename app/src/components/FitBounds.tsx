"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

type FitBoundsProps = {
  p1: [number, number];
  p2: [number, number];
};

const FitBounds = ({ p1, p2 }: FitBoundsProps) => {
  const map = useMap();

  useEffect(() => {
    if (p1 && p2 && map) {
      if (p1[0] === p2[0] && p1[1] === p2[1]) {
        map.setView(p1, 14);
      } else {
        const bounds = L.latLngBounds(p1, p2);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      }
    }
  }, [map, p1, p2]);

  return null;
};

export default FitBounds;
