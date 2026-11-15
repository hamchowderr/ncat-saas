import { ShotsClient } from "./components/shots-client";
import { generateMeta } from "@/lib/utils";
import { createClient } from "@/lib/server";

export async function generateMetadata() {
  return generateMeta({
    title: "Shots",
    description: "Manage individual video shots and camera angles for your scenes.",
    canonical: "/workspace/video-generation/shots"
  });
}

// Fetch shots from Supabase
async function getShots() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: shots, error } = await supabase
    .from("shots")
    .select(`
      *,
      scenes!inner (
        id,
        title,
        sequence_number,
        approved,
        stories!inner (
          id,
          title,
          active_story,
          user_id,
          story_types (
            id,
            name,
            width,
            height,
            voice_id,
            captions_enabled,
            auto_approve_shots,
            auto_approve_scenes,
            auto_approve_story,
            auto_approve_source,
            auto_run_image_action,
            auto_run_audio_action,
            auto_run_video_action
          )
        )
      )
    `)
    .eq("scenes.stories.user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching shots:", error);
    return [];
  }

  return shots || [];
}

export default async function ShotsPage() {
  const shots = await getShots();

  return <ShotsClient initialData={shots} />;
}
