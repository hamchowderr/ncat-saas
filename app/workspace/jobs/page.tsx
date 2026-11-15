import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { generateMeta } from "@/lib/utils";
import { createClient } from "@/lib/server";

export async function generateMetadata() {
  return generateMeta({
    title: "Jobs",
    description: "Track NCA job processing and monitor job status.",
    canonical: "/workspace/jobs"
  });
}

// Fetch jobs from Supabase with all files batched in one query
async function getJobs() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { jobs: [], jobFilesMap: {} };
  }

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching jobs:", error);
    return { jobs: [], jobFilesMap: {} };
  }

  if (!jobs || jobs.length === 0) {
    return { jobs: [], jobFilesMap: {} };
  }

  // Batch fetch all files for all jobs in one query
  const jobIds = jobs.map((job) => job.id);
  const { data: jobFiles, error: filesError } = await supabase
    .from("job_files")
    .select(
      `
      job_id,
      file_role,
      files (
        id,
        file_name,
        url,
        file_size,
        mime_type,
        created_at
      )
    `
    )
    .in("job_id", jobIds)
    .eq("file_role", "input")
    .order("created_at", { ascending: true });

  if (filesError) {
    console.error("Error fetching job files:", filesError);
  }

  // Group files by job_id
  const jobFilesMap: Record<string, any[]> = {};
  if (jobFiles) {
    for (const jf of jobFiles) {
      if (!jobFilesMap[jf.job_id]) {
        jobFilesMap[jf.job_id] = [];
      }
      if (jf.files) {
        jobFilesMap[jf.job_id].push(jf.files);
      }
    }
  }

  return { jobs: jobs || [], jobFilesMap };
}

export default async function JobPage() {
  const { jobs, jobFilesMap } = await getJobs();

  return <DataTable data={jobs} columns={columns} jobFilesMap={jobFilesMap} />;
}
