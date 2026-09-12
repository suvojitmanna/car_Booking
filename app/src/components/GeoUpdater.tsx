"use client";

import React, { useEffect, useRef } from "react";
import { getSocket } from "../lib/socket";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const GeoUpdater = ({ userId }: { userId?: string }) => {
  const socketRef = useRef<any>(null);
  const { userData } = useSelector((state: RootState) => state.user);
  const activeUserId = userId || userData?._id?.toString();

  useEffect(() => {
    if (!activeUserId) return;
    if (typeof window === "undefined" || !navigator.geolocation) return;

    socketRef.current = getSocket();
    socketRef.current.emit("identity", activeUserId);

    const emitLocation = (coords: GeolocationCoordinates) => {
      const { latitude, longitude } = coords;
      if (socketRef.current) {
        socketRef.current.emit("update-location", {
          userId: activeUserId,
          longitude,
          latitude,
        });
      }
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        emitLocation(position.coords);
      },
      (error) => {
        console.warn("Geolocation initial fix error:", error.message);
      },
      options,
    );

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        emitLocation(position.coords);
      },
      (error) => {
        console.warn("Geolocation watch update error:", error.message);
      },
      options,
    );

    return () => {
      navigator.geolocation.clearWatch(watcher);
    };
  }, [activeUserId]);

  return null;
};

export default GeoUpdater;
