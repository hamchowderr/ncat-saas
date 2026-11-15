import { ScenesClient } from "./components/scenes-client";
import { generateMeta } from "@/lib/utils";
import { createClient } from "@/lib/server";

export async function generateMetadata() {
  return generateMeta({
    title: "Scenes",
    description: "Manage video generation scenes and scene breakdowns for your stories.",
    canonical: "/workspace/video-generation/scenes"
  });
}

// Fetch scenes from Supabase
async function getScenes() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: scenes, error } = await supabase
    .from("scenes")
    .select(`
      *,
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
    `)
    .eq("stories.user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching scenes:", error);
    return [];
  }

  return scenes || [];
}

export default async function ScenesPage() {
  const scenes = await getScenes();

  return <ScenesClient initialData={scenes} />;
}
