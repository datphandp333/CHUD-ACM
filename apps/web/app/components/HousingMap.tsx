"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import mapboxgl, {
  Map as MapboxMap,
  Marker,
} from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

type HousingMapItem = {
  id: string;
  slug: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

type HousingMapProps = {
  buildings: HousingMapItem[];
  selectedSlug: string;
  onSelect: (
    slug: string
  ) => void;
  onUserLocationChange?: (
    location: UserLocation
  ) => void;
};

const mapboxToken =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function HousingMap({
  buildings,
  selectedSlug,
  onSelect,
  onUserLocationChange,
}: HousingMapProps) {
  const mapContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapRef =
    useRef<MapboxMap | null>(
      null
    );

  const markersRef =
    useRef<Marker[]>(
      []
    );

  const userMarkerRef =
    useRef<Marker | null>(
      null
    );

  const [
    locationError,
    setLocationError,
  ] =
    useState("");

  useEffect(() => {
    if (
      !mapContainerRef.current ||
      !mapboxToken
    ) {
      return;
    }

    mapboxgl.accessToken =
      mapboxToken;

    const validBuildings =
      buildings.filter(
        (building) =>
          Number.isFinite(
            building.latitude
          ) &&
          Number.isFinite(
            building.longitude
          )
      );

    const initialCenter:
      [number, number] =
      validBuildings.length > 0
        ? [
            validBuildings[0].longitude,
            validBuildings[0].latitude,
          ]
        : [
            -97.1081,
            32.729,
          ];

    const map =
      new mapboxgl.Map({
        container:
          mapContainerRef.current,

        style:
          "mapbox://styles/mapbox/streets-v12",

        center:
          initialCenter,

        zoom: 13.5,
      });

    mapRef.current =
      map;

    map.addControl(
      new mapboxgl.NavigationControl(),
      "top-right"
    );

    map.addControl(
      new mapboxgl.FullscreenControl(),
      "top-right"
    );

    markersRef.current.forEach(
      (marker) =>
        marker.remove()
    );

    markersRef.current = [];

    validBuildings.forEach(
      (building) => {
        const isSelected =
          building.slug ===
          selectedSlug;

        const element =
          createHousingMarker({
            category:
              building.category,

            selected:
              isSelected,
          });

        element.addEventListener(
          "click",
          () => {
            onSelect(
              building.slug
            );

            map.flyTo({
              center: [
                building.longitude,
                building.latitude,
              ],

              zoom: 15,

              essential: true,
            });
          }
        );

        const popup =
          new mapboxgl.Popup({
            offset: 28,
            closeButton: false,
          }).setHTML(`
            <div style="
              min-width: 210px;
              font-family: Arial, sans-serif;
              padding: 2px;
            ">
              <div style="
                font-size: 15px;
                font-weight: 800;
                color: #0f172a;
              ">
                ${escapeHtml(
                  building.name
                )}
              </div>

              <div style="
                margin-top: 6px;
                color: #64748b;
                font-size: 12px;
                line-height: 1.5;
              ">
                ${escapeHtml(
                  building.address
                )}
              </div>

              <div style="
                margin-top: 9px;
                font-size: 11px;
                font-weight: 700;
                color: #2563eb;
                text-transform: uppercase;
              ">
                ${
                  building.category ===
                  "apartment"
                    ? "Apartment"
                    : "Residence Hall"
                }
              </div>
            </div>
          `);

        const marker =
          new mapboxgl.Marker({
            element,
            anchor: "bottom",
          })
            .setLngLat([
              building.longitude,
              building.latitude,
            ])
            .setPopup(
              popup
            )
            .addTo(
              map
            );

        markersRef.current.push(
          marker
        );
      }
    );

    if (
      validBuildings.length >
      1
    ) {
      const bounds =
        new mapboxgl.LngLatBounds();

      validBuildings.forEach(
        (building) => {
          bounds.extend([
            building.longitude,
            building.latitude,
          ]);
        }
      );

      map.fitBounds(
        bounds,
        {
          padding: 70,
          maxZoom: 14.5,
        }
      );
    }

    return () => {
      markersRef.current.forEach(
        (marker) =>
          marker.remove()
      );

      markersRef.current = [];

      userMarkerRef.current?.remove();

      userMarkerRef.current =
        null;

      map.remove();

      mapRef.current =
        null;
    };
  }, [
    buildings,
    onSelect,
    selectedSlug,
  ]);

  useEffect(() => {
    const map =
      mapRef.current;

    if (!map) {
      return;
    }

    const selected =
      buildings.find(
        (building) =>
          building.slug ===
          selectedSlug
      );

    if (!selected) {
      return;
    }

    if (
      !Number.isFinite(
        selected.latitude
      ) ||
      !Number.isFinite(
        selected.longitude
      )
    ) {
      return;
    }

    map.flyTo({
      center: [
        selected.longitude,
        selected.latitude,
      ],

      zoom: 15.5,

      essential: true,
    });
  }, [
    buildings,
    selectedSlug,
  ]);

  function locateUser() {
    setLocationError("");

    if (
      !navigator.geolocation
    ) {
      setLocationError(
        "Your browser does not support geolocation."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const location = {
          latitude,
          longitude,
        };

        onUserLocationChange?.(
          location
        );

        const map =
          mapRef.current;

        if (!map) {
          return;
        }

        userMarkerRef.current?.remove();

        const element =
          createUserMarker();

        userMarkerRef.current =
          new mapboxgl.Marker({
            element,
          })
            .setLngLat([
              longitude,
              latitude,
            ])
            .setPopup(
              new mapboxgl.Popup({
                offset: 20,
              }).setHTML(`
                <div style="
                  font-family: Arial, sans-serif;
                  font-weight: 700;
                  color: #0f172a;
                ">
                  Your current location
                </div>
              `)
            )
            .addTo(
              map
            );

        map.flyTo({
          center: [
            longitude,
            latitude,
          ],

          zoom: 15,

          essential: true,
        });
      },
      (error) => {
        console.error(
          "Location error:",
          error
        );

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          setLocationError(
            "Location permission was denied. Allow location access in your browser settings."
          );

          return;
        }

        if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {
          setLocationError(
            "Your current location is unavailable."
          );

          return;
        }

        if (
          error.code ===
          error.TIMEOUT
        ) {
          setLocationError(
            "Location request timed out. Please try again."
          );

          return;
        }

        setLocationError(
          "Unable to determine your current location."
        );
      },
      {
        enableHighAccuracy:
          true,

        timeout:
          10000,

        maximumAge:
          30000,
      }
    );
  }

  if (!mapboxToken) {
    return (
      <div className="flex h-[650px] items-center justify-center rounded-3xl border border-red-200 bg-red-50 p-8 text-center">

        <div>

          <p className="font-bold text-red-900">
            Mapbox token missing
          </p>

          <p className="mt-2 text-sm text-red-700">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to apps/web/.env.local.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div
        ref={
          mapContainerRef
        }
        className="h-[650px] w-full"
      />

      {/* Location button */}
      <div className="absolute left-4 top-4 z-10">

        <button
          type="button"
          onClick={
            locateUser
          }
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:bg-blue-50"
        >
          <span className="text-lg">
            ◎
          </span>

          Use My Location
        </button>

        {locationError && (
          <div className="mt-2 max-w-xs rounded-xl border border-red-200 bg-white p-3 text-xs font-medium leading-5 text-red-700 shadow">
            {
              locationError
            }
          </div>
        )}

      </div>

      {/* Legend */}
      <div className="absolute bottom-5 left-5 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">

        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Map Legend
        </p>

        <div className="mt-3 space-y-2">

          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">

            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-sm text-white">
              🏢
            </span>

            Apartment

          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">

            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm text-white">
              🏠
            </span>

            Residence Hall

          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">

            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-sm text-white">
              📍
            </span>

            Selected Property

          </div>

        </div>

      </div>

    </div>
  );
}

function createHousingMarker({
  category,
  selected,
}: {
  category: string;
  selected: boolean;
}) {
  const wrapper =
    document.createElement(
      "button"
    );

  wrapper.type =
    "button";

  wrapper.setAttribute(
    "aria-label",
    "Housing location"
  );

  wrapper.style.width =
    selected
      ? "48px"
      : "42px";

  wrapper.style.height =
    selected
      ? "48px"
      : "42px";

  wrapper.style.borderRadius =
    "50% 50% 50% 0";

  wrapper.style.transform =
    "rotate(-45deg)";

  wrapper.style.border =
    selected
      ? "4px solid white"
      : "3px solid white";

  wrapper.style.background =
    selected
      ? "#0f172a"
      : category ===
        "apartment"
      ? "#2563eb"
      : "#f97316";

  wrapper.style.boxShadow =
    selected
      ? "0 8px 24px rgba(15, 23, 42, 0.40)"
      : "0 6px 18px rgba(15, 23, 42, 0.28)";

  wrapper.style.cursor =
    "pointer";

  wrapper.style.display =
    "flex";

  wrapper.style.alignItems =
    "center";

  wrapper.style.justifyContent =
    "center";

  wrapper.style.transition =
    "transform 0.15s ease, width 0.15s ease, height 0.15s ease";

  const icon =
    document.createElement(
      "span"
    );

  icon.style.transform =
    "rotate(45deg)";

  icon.style.fontSize =
    selected
      ? "20px"
      : "17px";

  icon.style.lineHeight =
    "1";

  icon.textContent =
    selected
      ? "📍"
      : category ===
        "apartment"
      ? "🏢"
      : "🏠";

  wrapper.appendChild(
    icon
  );

  wrapper.addEventListener(
    "mouseenter",
    () => {
      wrapper.style.filter =
        "brightness(1.08)";
    }
  );

  wrapper.addEventListener(
    "mouseleave",
    () => {
      wrapper.style.filter =
        "none";
    }
  );

  return wrapper;
}

function createUserMarker() {
  const outer =
    document.createElement(
      "div"
    );

  outer.style.width =
    "30px";

  outer.style.height =
    "30px";

  outer.style.borderRadius =
    "9999px";

  outer.style.background =
    "rgba(37, 99, 235, 0.25)";

  outer.style.display =
    "flex";

  outer.style.alignItems =
    "center";

  outer.style.justifyContent =
    "center";

  const inner =
    document.createElement(
      "div"
    );

  inner.style.width =
    "16px";

  inner.style.height =
    "16px";

  inner.style.borderRadius =
    "9999px";

  inner.style.background =
    "#2563eb";

  inner.style.border =
    "4px solid white";

  inner.style.boxShadow =
    "0 3px 12px rgba(37, 99, 235, 0.5)";

  outer.appendChild(
    inner
  );

  return outer;
}

function escapeHtml(
  value: string
) {
  return value
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}