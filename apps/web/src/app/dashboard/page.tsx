"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import StatCard from "@/components/StatCard";
import {
  Briefcase,
  Play,
  CheckCircle,
  XCircle,
  MoreVertical,
  Code,
  Globe,
  Mail,
  Database,
  Network,
  FileText,
  PlayCircle
} from "lucide-react";
import clsx from "clsx";

export default function Dashboard() {
  const router = useRouter();
  
  const { data: statsData, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/dashboard/stats").then((res) => res.data),
    refetchInterval: 3000,
  });

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
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to run job");
    }
  };

  if (!statsData || !jobsData) {
    return <div className="p-10 flex items-center justify-center min-h-full">Loading dashboard...</div>;
  }

  // Helper to pick an icon based on job name
  const getJobIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("github")) return <Code size={20} className="text-gray-700" />;
    if (n.includes("user") || n.includes("sync")) return <Globe size={20} className="text-gray-700" />;
    if (n.includes("email")) return <Mail size={20} className="text-gray-700" />;
    if (n.includes("data") || n.includes("backup")) return <Database size={20} className="text-gray-700" />;
    if (n.includes("webhook")) return <Network size={20} className="text-gray-700" />;
    return <Briefcase size={20} className="text-gray-700" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Jobs"
          value={statsData.stats.totalJobs}
          trend="2 this week"
          trendUp
          icon={<Briefcase size={24} className="text-green-600" />}
          iconBgClass="bg-green-50"
        />
        <StatCard
          title="Active Jobs"
          value={statsData.stats.activeJobs}
          trend="1 this week"
          trendUp
          icon={<Play size={24} className="text-green-600" />}
          iconBgClass="bg-green-50"
        />
        <StatCard
          title="Successes"
          value={statsData.stats.successfulExecutions}
          trend="3.4% this week"
          trendUp
          icon={<CheckCircle size={24} className="text-green-600" />}
          iconBgClass="bg-green-50"
        />
        <StatCard
          title="Failed Executions"
          value={statsData.stats.failedExecutions}
          trend="1 this week"
          trendDown
          icon={<XCircle size={24} className="text-red-500" />}
          iconBgClass="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Your Jobs Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Jobs</h2>
            <button className="text-sm text-green-600 font-medium hover:text-green-700">View all jobs &rarr;</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-semibold text-gray-900">Name</th>
                  <th className="px-5 py-3 font-semibold text-gray-900">Type</th>
                  <th className="px-5 py-3 font-semibold text-gray-900">Schedule</th>
                  <th className="px-5 py-3 font-semibold text-gray-900">Status</th>
                  <th className="px-5 py-3 font-semibold text-gray-900">Last Run</th>
                  <th className="px-5 py-3 font-semibold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobsData.map((job: any) => (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {getJobIcon(job.name)}
                        <div>
                          <p className="font-medium text-gray-900">{job.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 max-w-[180px] truncate">{job.description || "Job description"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        {job.type === "HTTP" ? "HTTP Request" : job.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <p className="text-sm">{job.cronSchedule ? "Scheduled" : "Manual"}</p>
                      {job.cronSchedule && <p className="text-xs font-mono text-gray-400 mt-0.5">{job.cronSchedule}</p>}
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
                      <p className="text-sm text-gray-900">-</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => runJob(job.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                          title="Run Job"
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
        </div>

        {/* Worker Health */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Worker Health</h2>
            <button className="text-sm text-green-600 font-medium hover:text-green-700">View all &rarr;</button>
          </div>
          <div className="p-5 flex-1 flex flex-col gap-4">
            {statsData.workers.map((w: any) => (
              <div key={w.id} className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-50"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{w.workerName || "worker-01"}</p>
                    <p className="text-xs text-gray-500 mt-1">Last heartbeat: 5s ago</p>
                    <p className="text-xs text-gray-500 mt-0.5">Jobs running: <span className="font-medium text-green-600">2</span></p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  {w.status}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <button className="w-full py-2 flex items-center justify-center gap-2 bg-green-50 text-green-700 font-medium text-sm rounded-lg hover:bg-green-100 transition-colors border border-green-100">
              <Network size={16} />
              Manage Workers
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Executions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Executions</h2>
            <button className="text-sm text-green-600 font-medium hover:text-green-700">View all executions &rarr;</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-semibold text-gray-900">Job</th>
                  <th className="px-5 py-3 font-semibold text-gray-900">Status</th>
                  <th className="px-5 py-3 font-semibold text-gray-900">Code</th>
                  <th className="px-5 py-3 font-semibold text-gray-900">Duration</th>
                  <th className="px-5 py-3 font-semibold text-gray-900">Started At</th>
                  <th className="px-5 py-3 font-semibold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {statsData.recentExecutions.map((exec: any) => (
                  <tr key={exec.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {getJobIcon(exec.job.name)}
                        <div>
                          <p className="font-medium text-gray-900">{exec.job.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">#{exec.id.substring(0,6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={clsx("w-2 h-2 rounded-full", {
                          "bg-green-500": exec.status === "SUCCESS",
                          "bg-red-500": exec.status === "FAILED",
                          "bg-blue-500": exec.status === "RUNNING",
                          "bg-yellow-500": !["SUCCESS", "FAILED", "RUNNING"].includes(exec.status)
                        })} />
                        <span className={clsx("font-medium", {
                          "text-green-700": exec.status === "SUCCESS",
                          "text-red-600": exec.status === "FAILED",
                          "text-blue-600": exec.status === "RUNNING",
                          "text-yellow-600": !["SUCCESS", "FAILED", "RUNNING"].includes(exec.status)
                        })}>
                          {exec.status.charAt(0).toUpperCase() + exec.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 font-mono text-xs">
                      {exec.httpStatus || 200}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {exec.startedAt && exec.completedAt ? (
                        (new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime() > 1000) 
                          ? ((new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000).toFixed(2) + "s" 
                          : (new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime()) + "ms"
                      ) : "-"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {new Date(exec.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button className="p-1.5 text-gray-400 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                          <FileText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Failures */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Failures</h2>
            <button className="text-sm text-green-600 font-medium hover:text-green-700">View all &rarr;</button>
          </div>
          <div className="p-5 flex-1 flex flex-col gap-5">
            {statsData.recentExecutions.filter((e:any) => e.status === "FAILED").slice(0, 3).map((exec: any) => (
              <div key={exec.id} className="flex items-start gap-4">
                <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                  {getJobIcon(exec.job.name)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-900 text-sm">{exec.job.name}</p>
                    <p className="text-xs text-gray-500">{new Date(exec.createdAt).toLocaleTimeString([], {timeStyle: 'short'})}</p>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <p className="text-xs text-gray-400">#{exec.id.substring(0, 6)}</p>
                    <p className="text-xs font-medium text-red-600 text-right max-w-[140px] truncate">
                      {exec.httpStatus === 503 ? "503 Service Unavailable" : exec.httpStatus === 500 ? "500 Internal Server Error" : "Timeout Error"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {statsData.recentExecutions.filter((e:any) => e.status === "FAILED").length === 0 && (
              <div className="text-sm text-gray-500 py-4 text-center">No recent failures found! 🎉</div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 text-center">
             <button className="text-sm text-green-600 font-medium hover:text-green-700">View all failures &rarr;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
