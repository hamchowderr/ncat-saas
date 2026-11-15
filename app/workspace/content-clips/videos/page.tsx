import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { generateMeta } from "@/lib/utils";
import { createClient } from "@/lib/server";

export async function generateMetadata() {
  return generateMeta({
    title: "Videos",
    description: "Manage your content source videos for clip generation.",
    canonical: "/workspace/content-clips/videos"
  });
}

// Fetch videos from Supabase
async function getVideos() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: videos, error } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching videos:", error);
    return [];
  }

  return videos || [];
}

export default async function VideosPage() {
  const videos = await getVideos();

  return <DataTable data={videos} columns={columns} />;
}
