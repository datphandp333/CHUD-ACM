import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";
import { mapBuildingRow, type BuildingRow } from "@/app/lib/mapBuilding";

export async function GET() {
  const { data, error } = await supabase
    .from("buildings")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const housing = ((data ?? []) as BuildingRow[]).map((row) =>
    mapBuildingRow(row)
  );

  return NextResponse.json(housing);
}