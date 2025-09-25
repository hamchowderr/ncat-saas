import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { generateMeta } from "@/lib/utils";
import { createClient } from "@/lib/client";

export async function generateMetadata() {
  return generateMeta({
    title: "Jobs",
    description: "Track NCA job processing and monitor job status.",
    canonical: "/workspace/jobs"
  });
}

// Fetch jobs from Supabase
async function getJobs() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }

  return jobs || [];
}

export default async function JobPage() {
  const jobs = await getJobs();

  return <DataTable data={jobs} columns={columns} />;
}
