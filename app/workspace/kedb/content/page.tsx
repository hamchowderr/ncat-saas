import { createClient } from "@/lib/server";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { Database } from "@/lib/database.types";

type KEDBEntry = Database["public"]["Tables"]["kedb"]["Row"];

async function getKEDBEntries(): Promise<KEDBEntry[]> {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: entries, error } = await supabase
    .from("kedb")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching KEDB entries:", error);
    return [];
  }

  return entries || [];
}

export default async function KEDBContentPage() {
  const entries = await getKEDBEntries();

  return (
    <div className="flex h-full flex-1 flex-col gap-4 p-4">
      <DataTable data={entries} columns={columns} />
    </div>
  );
}
