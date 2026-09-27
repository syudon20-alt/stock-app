import { supabase } from "@/lib/supabaseClient";
import LocationManager from "@/components/LocationManager";
import type { Location } from "@/types/location";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600">
        場所の取得に失敗しました: {error.message}
      </div>
    );
  }

  return <LocationManager initialLocations={(data ?? []) as Location[]} />;
}
