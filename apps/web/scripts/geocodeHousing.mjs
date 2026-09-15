import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!supabaseUrl || !supabaseKey || !mapboxToken) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

async function geocodeAddress(address) {
  const query = encodeURIComponent(
    `${address}, USA`
  );

  const url =
    `https://api.mapbox.com/search/geocode/v6/forward` +
    `?q=${query}` +
    `&access_token=${mapboxToken}` +
    `&limit=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Mapbox request failed: ${response.status}`
    );
  }

  const data = await response.json();

  const feature =
    data.features?.[0];

  if (!feature) {
    return null;
  }

  const coordinates =
    feature.geometry?.coordinates;

  if (
    !Array.isArray(coordinates) ||
    coordinates.length < 2
  ) {
    return null;
  }

  return {
    longitude: coordinates[0],
    latitude: coordinates[1],
  };
}

async function main() {
  const {
    data: buildings,
    error,
  } = await supabase
    .from("buildings")
    .select(
      "id, slug, name, address, latitude, longitude"
    )
    .order("name");

  if (error) {
    console.error(
      "Could not load buildings:",
      error
    );

    process.exit(1);
  }

  for (const building of buildings ?? []) {
    if (
      building.latitude != null &&
      building.longitude != null
    ) {
      console.log(
        `Skipping ${building.name}: already geocoded`
      );

      continue;
    }

    if (!building.address) {
      console.log(
        `Skipping ${building.name}: no address`
      );

      continue;
    }

    console.log(
      `Geocoding ${building.name}...`
    );

    try {
      const location =
        await geocodeAddress(
          building.address
        );

      if (!location) {
        console.log(
          `No result for ${building.name}`
        );

        continue;
      }

      const {
        error: updateError,
      } = await supabase
        .from("buildings")
        .update({
          latitude:
            location.latitude,

          longitude:
            location.longitude,
        })
        .eq(
          "id",
          building.id
        );

      if (updateError) {
        console.error(
          `Update failed for ${building.name}:`,
          updateError
        );

        continue;
      }

      console.log(
        `${building.name}: ${location.latitude}, ${location.longitude}`
      );
    } catch (error) {
      console.error(
        `Failed to geocode ${building.name}:`,
        error
      );
    }
  }
}

main();