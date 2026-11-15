import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { generateMeta } from "@/lib/utils";
import { createClient } from "@/lib/server";

export async function generateMetadata() {
  return generateMeta({
    title: "Clips",
    description: "Manage your content clips extracted from source videos.",
    canonical: "/workspace/content-clips/clips"
  });
}

// Fetch clips from Supabase with video relationship
async function getClips() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: clips, error } = await supabase
    .from("clips")
    .select(
      `
      *,
      videos (
        id,
        description,
        active_video,
        video_width,
        video_height,
        clip_width,
        clip_height,
        video_url
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clips:", error);
    return [];
  }

  return clips || [];
}

export default async function ClipsPage() {
  const clips = await getClips();

  return <DataTable data={clips} columns={columns} />;
}
