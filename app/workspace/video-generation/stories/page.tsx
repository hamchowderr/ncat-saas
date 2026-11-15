import { StoriesClient } from "./components/stories-client";
import { generateMeta } from "@/lib/utils";
import { createClient } from "@/lib/server";

export async function generateMetadata() {
  return generateMeta({
    title: "Stories",
    description: "Manage your video generation stories and faceless video projects.",
    canonical: "/workspace/video-generation/stories"
  });
}

// Fetch stories from Supabase
async function getStories() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: stories, error} = await supabase
    .from("stories")
    .select(`
      *,
      story_types (
        id,
        name,
        description,
        width,
        height,
        voice_id,
        captions_enabled,
        auto_approve_shots,
        auto_approve_scenes,
        auto_approve_story,
        auto_approve_source,
        auto_approve_story_gen,
        auto_run_image_action,
        auto_run_audio_action,
        auto_run_video_action,
        story_prompt_system,
        story_prompt_user,
        scene_generation_prompt,
        shot_generation_system_prompt,
        shot_generation_user_prompt,
        image_prompt_generation_prompt,
        video_prompt_generation_prompt
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching stories:", error);
    return [];
  }

  return stories || [];
}

export default async function StoriesPage() {
  const stories = await getStories();

  return <StoriesClient initialData={stories} />;
}
