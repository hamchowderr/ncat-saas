import { z } from "zod";

export const jobSchema = z.object({
  id: z.string(),
  nca_build_number: z.string().nullable(),
  nca_job_id: z.string().nullable(),
  custom_id: z.string().nullable(),
  nca_queue_length: z.number().nullable(),
  nca_queue_id: z.string().nullable(),
  nca_total_time: z.number().nullable(),
  nca_queue_time: z.number().nullable(),
  nca_run_time: z.number().nullable(),
  nca_pid: z.number().nullable(),
  nca_code: z.string().nullable(),
  processing_status: z.string().nullable(),
  nca_message: z.string().nullable(),
  error_message: z.string().nullable(),
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string()
});

export type Job = z.infer<typeof jobSchema>;
