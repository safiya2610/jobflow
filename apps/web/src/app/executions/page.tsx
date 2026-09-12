"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Download, List, CheckCircle, XCircle, RefreshCw, PlayCircle, Clock, 
  Code, Globe, Mail, Database, Network, Briefcase, Eye, MoreVertical, Calendar, ChevronLeft, ChevronRight
} from "lucide-react";
import clsx from "clsx";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
export default function ExecutionsPage() {
  const router = useRouter();

  const { data: executionsData, isLoading } = useQuery({
    queryKey: ["executions"],
    queryFn: () => api.get("/executions").then((res) => res.data),
    refetchInterval: 3000,
  });

  const getJobIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("github")) return <Code size={20} className="text-gray-700" />;
    if (n.includes("user") || n.includes("sync")) return <Globe size={20} className="text-gray-700" />;
    if (n.includes("email")) return <Mail size={20} className="text-gray-700" />;
    if (n.includes("data") || n.includes("backup")) return <Database size={20} className="text-gray-700" />;
    if (n.includes("webhook")) return <Network size={20} className="text-gray-700" />;
    return <Briefcase size={20} className="text-gray-700" />;
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "SUCCESS": return <CheckCircle size={14} />;
      case "FAILED": return <XCircle size={14} />;
      case "RETRYING": return <RefreshCw size={14} />;
      case "RUNNING": return <PlayCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "SUCCESS": return "text-green-600 bg-green-50 border-green-200";
      case "FAILED": return "text-red-600 bg-red-50 border-red-200";
      case "RETRYING": return "text-orange-600 bg-orange-50 border-orange-200";
      case "RUNNING": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Executions</h1>
        <p className="text-gray-500 mt-2">View and monitor all job executions</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by job name or ID..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50"
            />
          </div>
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-green-500 bg-gray-50 text-gray-700 min-w-[120px]">
            <option>Status</option>
            <option>Success</option>
            <option>Failed</option>
            <option>Retrying</option>
            <option>Running</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-green-500 bg-gray-50 text-gray-700 min-w-[120px]">
            <option>Job</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-green-500 bg-gray-50 text-gray-700 min-w-[120px]">
            <option>Worker</option>
          </select>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
            <Calendar size={16} className="text-gray-400" />
            Sep 4, 2026 - Sep 11, 2026
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-green-200 rounded-md text-green-700 hover:bg-green-50 transition-colors">
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { title: "All Executions", value: 128, icon: <List size={20} className="text-green-600" />, bg: "bg-green-50" },
          { title: "Success", value: 89, icon: <CheckCircle size={20} className="text-green-600" />, bg: "bg-green-50" },
          { title: "Failed", value: 22, icon: <XCircle size={20} className="text-red-500" />, bg: "bg-red-50" },
          { title: "Retrying", value: 11, icon: <RefreshCw size={20} className="text-orange-500" />, bg: "bg-orange-50" },
          { title: "Running", value: 6, icon: <PlayCircle size={20} className="text-blue-500" />, bg: "bg-blue-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className={clsx("p-2.5 rounded-lg", stat.bg)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.title === "All Executions" && executionsData ? executionsData.length : (executionsData ? executionsData.filter((e: any) => e.status === stat.title.toUpperCase()).length : 0)}</p>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-gray-500">Loading executions...</div>
      ) : (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 font-semibold text-gray-900">Execution</th>
                <th className="px-5 py-3 font-semibold text-gray-900">Job</th>
                <th className="px-5 py-3 font-semibold text-gray-900">Status</th>
                <th className="px-5 py-3 font-semibold text-gray-900">Attempt</th>
                <th className="px-5 py-3 font-semibold text-gray-900">Worker</th>
                <th className="px-5 py-3 font-semibold text-gray-900">HTTP Code</th>
                <th className="px-5 py-3 font-semibold text-gray-900">Duration</th>
                <th className="px-5 py-3 font-semibold text-gray-900">Started At</th>
                <th className="px-5 py-3 font-semibold text-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {executionsData && executionsData.map((exec: any) => {
                const durationMs = exec.startedAt && exec.completedAt 
                  ? new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime() 
                  : null;
                const duration = durationMs ? (durationMs > 1000 ? (durationMs / 1000).toFixed(2) + "s" : durationMs + "ms") : "-";
                
                return (
                <tr 
                  key={exec.id} 
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                  onClick={() => router.push(`/executions/${exec.id}`)}
                >
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-gray-900 font-medium">#{exec.id.substring(0,8)}</span>
                      <span className="text-xs text-gray-500 mt-0.5">{exec.job.cronSchedule ? "Scheduled" : "Manual"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {getJobIcon(exec.job.name)}
                      <div>
                        <p className="font-medium text-gray-900">{exec.job.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">HTTP Request</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", getStatusColor(exec.status))}>
                      {getStatusIcon(exec.status)}
                      {exec.status.charAt(0) + exec.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-700 font-medium text-sm">
                    {exec.attemptNumber}
                  </td>
                  <td className="px-5 py-4">
                    {exec.workerId ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        {exec.workerId}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {exec.httpStatus ? (
                      <span className={clsx("font-mono font-medium", {
                        "text-green-600": exec.httpStatus < 400,
                        "text-red-500": exec.httpStatus >= 400
                      })}>
                        {exec.httpStatus}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {duration !== "-" ? (
                      <div className="flex items-center gap-1.5">
                        {duration}
                        {exec.status === "RUNNING" && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-sm">
                    {new Date(exec.queuedAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => router.push(`/executions/${exec.id}`)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 text-sm">
          <p className="text-gray-500">Showing {executionsData?.length || 0} executions</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 border border-gray-200 rounded-md text-gray-400 hover:bg-white transition-colors" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1.5 border border-green-600 bg-green-50 text-green-700 font-medium rounded-md">1</button>
            <button className="px-3 py-1.5 border border-gray-200 hover:bg-white text-gray-700 font-medium rounded-md transition-colors">2</button>
            <button className="px-3 py-1.5 border border-gray-200 hover:bg-white text-gray-700 font-medium rounded-md transition-colors">3</button>
            <span className="px-2 text-gray-400">...</span>
            <button className="px-3 py-1.5 border border-gray-200 hover:bg-white text-gray-700 font-medium rounded-md transition-colors">16</button>
            <button className="p-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
