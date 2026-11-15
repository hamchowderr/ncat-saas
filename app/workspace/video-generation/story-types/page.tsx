import { StoryTypesClient } from "./components/story-types-client";
import { generateMeta } from "@/lib/utils";
import { createClient } from "@/lib/server";

export async function generateMetadata() {
  return generateMeta({
    title: "Story Types",
    description: "Browse video story templates and presets for different platforms and styles.",
    canonical: "/workspace/video-generation/story-types"
  });
}

// Fetch story types from Supabase (all story types, not just active)
async function getStoryTypes() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get user's workspace
  const { data: workspaceMember } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("workspace_member_id", user.id)
    .single();

  if (!workspaceMember) {
    return [];
  }

  // Get all story types (system defaults + workspace's custom types)
  const { data: storyTypes, error } = await supabase
    .from("story_types")
    .select("*")
    .or(`is_system_default.eq.true,workspace_id.eq.${workspaceMember.workspace_id}`)
    .order("is_system_default", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching story types:", error);
    return [];
  }

  return storyTypes || [];
}

export default async function StoryTypesPage() {
  const storyTypes = await getStoryTypes();

  return <StoryTypesClient initialData={storyTypes} />;
}
