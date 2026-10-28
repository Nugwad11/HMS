"use client";

import { useState } from "react";
import { Check, Loader2, LocateFixed } from "lucide-react";

type Status = "idle" | "locating" | "success" | "error";

type LocationResponse = {
  location?: string;
  source?: "google" | "offline";
  approximate?: boolean;
  error?: string;
};

type LocateButtonProps = {
  onLocation: (location: string) => void;
  label?: string;
  className?: string;
};

export default function LocateButton({ onLocation, label = "Use my current location", className }: LocateButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const locate = async () => {
    setStatus("locating");
    setMessage("");

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("error");
      setMessage("This browser cannot share a location. Choose your city or state from the list.");
      return;
    }
    if (!window.isSecureContext) {
      setStatus("error");
      setMessage(
        "Location needs a secure connection. Open Covenant over HTTPS or localhost, or choose your city or state from the list.",
      );
      return;
    }

    const position = await new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          setStatus("error");
          setMessage(
            error.code === error.PERMISSION_DENIED
              ? "Location permission was denied. Allow location in your browser settings, or choose your city or state from the list."
              : error.code === error.TIMEOUT
                ? "Location took too long. Move somewhere with a clearer signal and try again, or choose your city or state."
                : "Your phone could not find a location. Check that location services are on, or choose your city or state.",
          );
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    });
    if (!position) return;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(
        `/api/location?lat=${encodeURIComponent(position.coords.latitude)}&lng=${encodeURIComponent(
          position.coords.longitude,
        )}`,
        { signal: controller.signal, cache: "no-store" },
      );
      const data = (await response.json().catch(() => ({}))) as LocationResponse;
      if (!response.ok || !data.location) {
        setStatus("error");
        setMessage(data.error ?? "We could not match that location. Choose your city or state from the list.");
        return;
      }
      onLocation(data.location);
      setStatus("success");
      setMessage(
        data.source === "offline" || data.approximate
          ? `Nearest location: ${data.location}. We save the state only, so adjust it if you prefer.`
          : `Location set to ${data.location}. You can change it below.`,
      );
    } catch {
      setStatus("error");
      setMessage("We could not reach the location service. Check your connection or choose your city or state.");
    } finally {
      clearTimeout(timer);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={locate}
        disabled={status === "locating"}
        aria-busy={status === "locating"}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary disabled:cursor-wait disabled:opacity-70"
      >
        {status === "locating" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : status === "success" ? (
          <Check className="h-4 w-4 text-ok" aria-hidden="true" />
        ) : (
          <LocateFixed className="h-4 w-4 text-primary" aria-hidden="true" />
        )}
        {status === "locating" ? "Finding your location…" : status === "success" ? "Location found" : label}
      </button>
      <p className="mt-2 text-xs text-muted">
        Uses your device location, which comes from Google location services on most Android phones. Only the city or
        state you keep is saved — coordinates are never stored.
      </p>
      <p aria-live="polite" role="status" className={status === "error" ? "mt-1 text-xs font-medium text-bad" : "mt-1 text-xs font-medium text-ok"}>
        {message}
      </p>
    </div>
  );
}
