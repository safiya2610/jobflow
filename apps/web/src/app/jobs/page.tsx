"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Plus, Briefcase, Play, Pause, MoreVertical, 
  Clock, Globe, CheckCircle, Code, Activity
} from "lucide-react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function JobsPage() {
  const router = useRouter();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => api.get("/jobs").then((res) => res.data),
    refetchInterval: 5000,
  });

  const getMethodColor = (method: string) => {
    switch(method) {
      case 'GET': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'POST': return 'text-green-700 bg-green-50 border-green-200';
      case 'PUT': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'DELETE': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Jobs</h1>
          <p className="text-gray-500 mt-2">Manage your HTTP request jobs and webhooks</p>
        </div>
        <button 
          onClick={() => router.push('/jobs/new')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Job
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search jobs..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50"
            />
          </div>
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-green-500 bg-gray-50 text-gray-700 min-w-[120px]">
            <option>Status: All</option>
            <option>Active</option>
            <option>Paused</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-green-500 bg-gray-50 text-gray-700 min-w-[120px]">
            <option>Type: All</option>
            <option>Scheduled</option>
            <option>Manual</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Loading jobs...</div>
      ) : jobs && jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Briefcase size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs created yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Create your first job to start making automated HTTP requests and executing background tasks.
          </p>
          <button 
            onClick={() => router.push('/jobs/new')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Create Job
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 font-semibold text-gray-900">Name</th>
                  <th className="px-5 py-4 font-semibold text-gray-900">Endpoint</th>
                  <th className="px-5 py-4 font-semibold text-gray-900">Schedule</th>
                  <th className="px-5 py-4 font-semibold text-gray-900">Status</th>
                  <th className="px-5 py-4 font-semibold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs && jobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-md border border-gray-100">
                          <Code size={18} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{job.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{job.description || "HTTP Request"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded border tracking-wide", getMethodColor(job.method))}>
                          {job.method}
                        </span>
                        <span className="text-gray-600 truncate font-mono text-xs" title={job.endpoint}>
                          {job.endpoint}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {job.cronSchedule ? (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock size={14} className="text-gray-400" />
                          <span className="font-mono text-xs bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                            {job.cronSchedule}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Manual only</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={clsx(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                        job.status === 'ACTIVE' ? "text-green-700 bg-green-50 border-green-200" : "text-gray-600 bg-gray-50 border-gray-200"
                      )}>
                        {job.status === 'ACTIVE' ? <CheckCircle size={14} /> : <Pause size={14} />}
                        {job.status === 'ACTIVE' ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-1.5 text-gray-400 hover:text-green-600 border border-gray-200 rounded-md hover:bg-green-50 transition-colors"
                          title="Run now"
                        >
                          <Play size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
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
      )}
    </div>
  );
}
