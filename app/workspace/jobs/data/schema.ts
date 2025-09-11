import { z } from "zod";

export const jobSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string()
});

export type Job = z.infer<typeof jobSchema>;
