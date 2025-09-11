import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { jobSchema } from "./data/schema";
import { generateMeta } from "@/lib/utils";

export async function generateMetadata() {
  return generateMeta({
    title: "Jobs",
    description: "A job and issue tracker build using Tanstack Table.",
    canonical: "/apps/jobs"
  });
}

// Simulate a database read for jobs.
async function getJobs() {
  const data = await fs.readFile(
    path.join(process.cwd(), "app/workspace/jobs/data/jobs.json")
  );

  const jobs = JSON.parse(data.toString());

  return z.array(jobSchema).parse(jobs);
}

export default async function JobPage() {
  const jobs = await getJobs();

  return <DataTable data={jobs} columns={columns} />;
}
