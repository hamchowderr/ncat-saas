"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { createClient } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Logs, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

import { Database } from "@/lib/database.types";

// Use the database type directly
type JobItem = Database["public"]["Tables"]["jobs"]["Row"];

// Define status filter options
const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "error", label: "Error" }
];

export function LogsManager() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch jobs from our custom jobs table
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (!user) {
          setError("User not authenticated");
          return;
        }

        let query = supabase
          .from("jobs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (statusFilter !== "all") {
          query = query.eq("processing_status", statusFilter);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setJobs(data || []);
        }
      } catch (err) {
        setError("Failed to fetch jobs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [statusFilter, supabase]);

  const selectedStatus = statusOptions.find((status) => status.value === statusFilter);

  return (
    <>
      <div className="bg-background sticky top-0 z-10 mb-6 flex items-center justify-between border-b p-6 pt-4 lg:p-8 lg:pt-8">
        <div className="flex-1">
          <h1 className="text-base font-semibold lg:text-xl">Jobs</h1>
          <p className="text-muted-foreground mt-1 hidden text-sm lg:block lg:text-base">
            Track NCA job processing and monitor job status
          </p>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-48 justify-between"
            >
              {selectedStatus ? selectedStatus.label : "Filter by status..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="end">
            <Command>
              <CommandList>
                <CommandEmpty>No status found.</CommandEmpty>
                <CommandGroup>
                  {statusOptions.map((status) => (
                    <CommandItem
                      key={status.value}
                      value={status.label}
                      onSelect={() => {
                        setStatusFilter(status.value);
                        setOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <div className="flex-1">{status.label}</div>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          statusFilter === status.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {isLoading && (
        <div className="mx-8 mt-8 space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      )}
      {error && (
        <div className="mx-6 mt-8 lg:mx-8">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error fetching jobs</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      {jobs && jobs.length > 0 && (
        <div className="mt-4 w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="first:pl-6 lg:first:pl-8">Job ID</TableHead>
                <TableHead>Build Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Queue Time</TableHead>
                <TableHead>Run Time</TableHead>
                <TableHead>Total Time</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Error</TableHead>
                <TableHead className="last:pr-6 lg:last:pr-8">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} className="group hover:bg-muted/50 relative">
                  <TableCell className="font-mono text-xs first:pl-6 lg:first:pl-8">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="max-w-32 cursor-default truncate">
                          {job.nca_job_id || "N/A"}
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-96 p-3">
                        <div className="space-y-2 text-xs">
                          <div>
                            <strong>Job ID:</strong> {job.nca_job_id || "N/A"}
                          </div>
                          <div>
                            <strong>Custom ID:</strong> {job.custom_id || "N/A"}
                          </div>
                          <div>
                            <strong>Queue ID:</strong> {job.nca_queue_id || "N/A"}
                          </div>
                          <div>
                            <strong>PID:</strong> {job.nca_pid || "N/A"}
                          </div>
                          <div>
                            <strong>Code:</strong> {job.nca_code || "N/A"}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell className="text-xs">{job.nca_build_number || "N/A"}</TableCell>
                  <TableCell className="text-xs">
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        job.processing_status === "completed" && "bg-green-100 text-green-800",
                        job.processing_status === "failed" && "bg-red-100 text-red-800",
                        job.processing_status === "error" && "bg-red-100 text-red-800",
                        job.processing_status === "processing" && "bg-blue-100 text-blue-800",
                        job.processing_status === "pending" && "bg-yellow-100 text-yellow-800",
                        !job.processing_status && "bg-gray-100 text-gray-800"
                      )}
                    >
                      {job.processing_status || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {job.nca_queue_time ? `${job.nca_queue_time}ms` : "N/A"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {job.nca_run_time ? `${job.nca_run_time}ms` : "N/A"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {job.nca_total_time ? `${job.nca_total_time}ms` : "N/A"}
                  </TableCell>
                  <TableCell className="max-w-48 text-xs">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="cursor-default truncate">{job.nca_message || "N/A"}</div>
                      </HoverCardTrigger>
                      <HoverCardContent className="max-h-96 w-96 overflow-auto p-3">
                        <pre className="text-xs break-words whitespace-pre-wrap">
                          {job.nca_message || "No message"}
                        </pre>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell className="max-w-48 text-xs">
                    {job.error_message ? (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="cursor-default truncate text-red-600">
                            {job.error_message}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="max-h-96 w-96 overflow-auto p-3">
                          <pre className="text-xs break-words whitespace-pre-wrap text-red-600">
                            {job.error_message}
                          </pre>
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      <span className="text-muted-foreground">No errors</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs last:pr-6 lg:last:pr-8">
                    {new Date(job.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {jobs && jobs.length === 0 && (
        <div className="mx-8 mt-8">
          <Alert>
            <Logs className="h-4 w-4" />
            <AlertTitle>No jobs found</AlertTitle>
            <AlertDescription>
              {statusFilter === "all"
                ? "No jobs have been created yet. Jobs will appear here when your NCA processing starts."
                : `No jobs found with status "${selectedStatus?.label}". Try changing the filter or check back later.`}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}
