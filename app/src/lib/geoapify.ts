export const GEOAPIFY_API_KEY =
  process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
  "c8d6263bbff84661a3556d78ecfaeb49";

export interface GeoapifyFeature {
  type: string;
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    suburb?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
    country_code?: string;
    countryCode?: string;
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    lat?: number;
    lon?: number;
    place_id?: string;
    osm_id?: number | string;
    id?: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

export async function geoapifyReverseGeocode(
  lat: number,
  lon: number,
  apiKey?: string,
): Promise<{ address: string; country: string; properties?: any }> {
  const key =
    apiKey || process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || GEOAPIFY_API_KEY;

  if (key) {
    try {
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${key}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data?.features?.length > 0) {
          const p = data.features[0].properties;
          const formatted =
            p.formatted ||
            [p.name, p.street, p.city, p.state, p.country]
              .filter(Boolean)
              .join(", ");
          return {
            address: formatted || `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
            country: p.country || "",
            properties: p,
          };
        }
      }
    } catch {}
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      {
        headers: { "User-Agent": "RydexCarBookingApp/1.0" },
        signal: AbortSignal.timeout(4000),
      },
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.display_name) {
        const country = data.address?.country || "";
        return {
          address: data.display_name,
          country,
          properties: data.address,
        };
      }
    }
  } catch {}

  try {
    const res = await fetch(
      `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.features?.length > 0) {
        const p = data.features[0].properties;
        const parts = [
          p.name,
          p.street,
          p.locality || p.district || p.suburb,
          p.city,
          p.state,
          p.country,
        ].filter(Boolean);
        const uniqueParts = parts.filter(
          (item: string, index: number) => parts.indexOf(item) === index,
        );
        return {
          address:
            uniqueParts.join(", ") || `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
          country: p.country || "",
          properties: p,
        };
      }
    }
  } catch {}

  return {
    address: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    country: "",
  };
}

export async function geoapifyAutocomplete(
  query: string,
  limit: number = 8,
  apiKey?: string,
): Promise<GeoapifyFeature[]> {
  if (!query || query.trim().length < 2) return [];

  const key =
    apiKey || process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || GEOAPIFY_API_KEY;

  if (key) {
    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        query.trim(),
      )}&limit=${limit}&apiKey=${key}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data?.features?.length > 0) {
          return data.features;
        }
      }
    } catch {}
  }

  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(
        query.trim(),
      )}&limit=${limit}&lang=en`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (res.ok) {
      const data = await res.json();
      return (data?.features || []).map((f: any) => ({
        ...f,
        properties: {
          ...f.properties,
          formatted: [
            f.properties.name,
            f.properties.street,
            f.properties.city,
            f.properties.state,
            f.properties.country,
          ]
            .filter(Boolean)
            .join(", "),
        },
      }));
    }
  } catch {}

  return [];
}

export async function geoapifyGeocode(
  query: string,
  apiKey?: string,
): Promise<[number, number] | null> {
  if (!query || !query.trim()) return null;

  const key =
    apiKey || process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || GEOAPIFY_API_KEY;

  if (key) {
    try {
      const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        query.trim(),
      )}&limit=1&apiKey=${key}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data?.features?.length > 0) {
          const [lon, lat] = data.features[0].geometry.coordinates;
          return [lat, lon];
        }
      }
    } catch {}
  }

  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(
        query.trim(),
      )}&limit=1`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.features?.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        return [lat, lon];
      }
    }
  } catch {}

  return null;
}
