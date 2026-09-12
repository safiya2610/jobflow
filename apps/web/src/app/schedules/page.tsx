"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Calendar, Play, Clock, Network, Globe, Mail, Database, Briefcase, Code, MoreVertical } from "lucide-react";
import clsx from "clsx";

export default function Schedules() {
  const { data: jobsData } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => api.get("/jobs").then((res) => res.data),
    refetchInterval: 3000,
  });

  const runJob = async (jobId: string) => {
    try {
      await api.post(`/jobs/${jobId}/run`, {}, {
        headers: { 'Idempotency-Key': crypto.randomUUID() }
      });
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to run job");
    }
  };

  const getJobIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("github")) return <Code size={20} className="text-gray-700" />;
    if (n.includes("user") || n.includes("sync")) return <Globe size={20} className="text-gray-700" />;
    if (n.includes("email")) return <Mail size={20} className="text-gray-700" />;
    if (n.includes("data") || n.includes("backup")) return <Database size={20} className="text-gray-700" />;
    if (n.includes("webhook")) return <Network size={20} className="text-gray-700" />;
    return <Briefcase size={20} className="text-gray-700" />;
  };

  if (!jobsData) {
    return <div className="p-10 flex items-center justify-center min-h-full">Loading schedules...</div>;
  }

  const scheduledJobs = jobsData.filter((job: any) => !!job.cronSchedule);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
        <p className="text-gray-500 mt-2">Manage and monitor your recurring automation jobs.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-green-600" />
            Active Schedules
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-medium">{scheduledJobs.length} Scheduled</span>
        </div>
        
        {scheduledJobs.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
               <Calendar size={32} />
             </div>
             <p className="text-gray-500 font-medium">No active schedules found.</p>
             <p className="text-sm text-gray-400 mt-1">Create a new job with a cron expression to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-semibold text-gray-900">Name</th>
                  <th className="px-5 py-3 font-semibold text-gray-900">Cron Schedule</th>
                  <th className="px-5 py-3 font-semibold text-gray-900">Next Expected Run</th>
                  <th className="px-5 py-3 font-semibold text-gray-900">Status</th>
                  <th className="px-5 py-3 font-semibold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scheduledJobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {getJobIcon(job.name)}
                        <div>
                          <p className="font-medium text-gray-900">{job.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 max-w-[180px] truncate">{job.description || "Recurring job"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">{job.cronSchedule}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <p className="text-sm font-medium">Coming soon</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={clsx("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", {
                        "bg-green-100 text-green-700": job.status === "ACTIVE",
                        "bg-gray-100 text-gray-700": job.status !== "ACTIVE"
                      })}>
                        {job.status === "ACTIVE" ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => runJob(job.id)}
                          className="p-1.5 text-gray-400 hover:text-green-600 border border-gray-200 rounded-md hover:bg-green-50 transition-colors"
                          title="Trigger Now"
                        >
                          <Play size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
