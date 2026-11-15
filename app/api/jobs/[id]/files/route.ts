import { createClient } from "@/lib/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First verify the job belongs to this user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, user_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Verify user has access to this job
    if (job.user_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all files associated with this job (both input and output)
    const { data: jobFiles, error: filesError } = await supabase
      .from("job_files")
      .select(
        `
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
      .eq("job_id", jobId)
      .order("created_at", { ascending: true });

    if (filesError) {
      console.error("Error fetching job files:", filesError);
      return NextResponse.json({ error: "Failed to fetch job files" }, { status: 500 });
    }

    // Separate input (source) and output (result) files
    const sourceFiles = jobFiles
      ?.filter((jf) => jf.file_role === "input")
      .map((jf) => jf.files)
      .filter(Boolean) || [];

    const resultFiles = jobFiles
      ?.filter((jf) => jf.file_role === "output")
      .map((jf) => jf.files)
      .filter(Boolean) || [];

    return NextResponse.json({
      success: true,
      data: {
        job_id: jobId,
        source_files: sourceFiles,
        result_files: resultFiles,
        total_files: sourceFiles.length + resultFiles.length
      }
    });
  } catch (error) {
    console.error("Error in GET /api/jobs/[id]/files:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
