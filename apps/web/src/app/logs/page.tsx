"use client";

import { 
  Search, List, Info, AlertTriangle, XCircle, FileTerminal, Calendar, 
  ChevronRight, MoreVertical, Copy, RotateCcw, ChevronLeft 
} from "lucide-react";
import clsx from "clsx";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function LogsPage() {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "INFO": return "bg-green-100 text-green-700 border-green-200";
      case "WARN": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "ERROR": return "bg-red-100 text-red-700 border-red-200";
      case "DEBUG": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["logs"],
    queryFn: () => api.get("/logs").then((res) => res.data),
    refetchInterval: 3000,
  });

  const allCount = logsData ? logsData.length : 0;
  const infoCount = logsData ? logsData.filter((l: any) => l.level === "INFO").length : 0;
  const warnCount = logsData ? logsData.filter((l: any) => l.level === "WARN").length : 0;
  const errorCount = logsData ? logsData.filter((l: any) => l.level === "ERROR").length : 0;
  const debugCount = logsData ? logsData.filter((l: any) => l.level === "DEBUG").length : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Logs</h1>
        <p className="text-gray-500 mt-2">View system logs and events from all components</p>
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
              placeholder="Search logs..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50"
            />
          </div>
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-green-500 bg-gray-50 text-gray-700 min-w-[120px]">
            <option>Level</option>
            <option>INFO</option>
            <option>WARN</option>
            <option>ERROR</option>
            <option>DEBUG</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-green-500 bg-gray-50 text-gray-700 min-w-[120px]">
            <option>Service</option>
            <option>worker</option>
            <option>scheduler</option>
            <option>queue</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-green-500 bg-gray-50 text-gray-700 min-w-[120px]">
            <option>Worker</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-green-500 bg-gray-50 text-gray-700 min-w-[120px]">
            <option>All Events</option>
          </select>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
            <Calendar size={16} className="text-gray-400" />
            Sep 4, 2026 - Sep 11, 2026
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-green-200 rounded-md text-green-700 hover:bg-green-50 transition-colors">
          <RotateCcw size={16} />
          Clear Filters
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { title: "All Logs", value: allCount, sub: "Total logs", icon: <FileTerminal size={20} className="text-green-600" />, bg: "bg-green-50" },
          { title: "Info", value: infoCount, sub: allCount ? `${((infoCount/allCount)*100).toFixed(1)}%` : "0%", icon: <Info size={20} className="text-blue-500" />, bg: "bg-blue-50" },
          { title: "Warning", value: warnCount, sub: allCount ? `${((warnCount/allCount)*100).toFixed(1)}%` : "0%", icon: <AlertTriangle size={20} className="text-yellow-600" />, bg: "bg-yellow-50" },
          { title: "Error", value: errorCount, sub: allCount ? `${((errorCount/allCount)*100).toFixed(1)}%` : "0%", icon: <XCircle size={20} className="text-red-600" />, bg: "bg-red-50" },
          { title: "Debug", value: debugCount, sub: allCount ? `${((debugCount/allCount)*100).toFixed(1)}%` : "0%", icon: <List size={20} className="text-purple-600" />, bg: "bg-purple-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-start gap-4">
            <div className={clsx("p-2.5 rounded-lg mt-1", stat.bg)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 font-semibold text-gray-900 w-10"></th>
                <th className="px-2 py-3 font-semibold text-gray-900 flex items-center gap-1 cursor-pointer hover:text-gray-600">
                  Time <span className="text-[10px]">▼</span>
                </th>
                <th className="px-5 py-3 font-semibold text-gray-900">Level</th>
                <th className="px-5 py-3 font-semibold text-gray-900">Service</th>
                <th className="px-5 py-3 font-semibold text-gray-900">Worker</th>
                <th className="px-5 py-3 font-semibold text-gray-900">Event</th>
                <th className="px-5 py-3 font-semibold text-gray-900">Message</th>
                <th className="px-5 py-3 font-semibold text-gray-900">Context</th>
                <th className="px-5 py-3 font-semibold text-gray-900 text-right w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-gray-500">Loading logs...</td>
                </tr>
              ) : logsData && logsData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-gray-500">No logs found. Run a job to generate some logs.</td>
                </tr>
              ) : (
                logsData?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 text-gray-400">
                      <ChevronRight size={16} className="cursor-pointer hover:text-gray-900" />
                    </td>
                    <td className="px-2 py-4 text-gray-600 font-medium whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border", getLevelColor(log.level))}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 font-medium">
                      {log.service}
                    </td>
                    <td className="px-5 py-4">
                      {log.workerId ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          {log.workerId}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-mono text-xs">
                      {log.event}
                    </td>
                    <td className="px-5 py-4 text-gray-800 text-sm">
                      {log.message}
                    </td>
                    <td className="px-5 py-4">
                      {log.context && (
                        <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1 w-max">
                          <span className="text-xs text-gray-600">{log.context}</span>
                          <button className="text-gray-400 hover:text-gray-700 ml-1">
                            <Copy size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 text-sm">
          <p className="text-gray-500">Showing 1 to 10 of 12,345 logs</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 border border-gray-200 rounded-md text-gray-400 hover:bg-white transition-colors" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1.5 border border-green-600 bg-green-50 text-green-700 font-medium rounded-md">1</button>
            <button className="px-3 py-1.5 border border-gray-200 hover:bg-white text-gray-700 font-medium rounded-md transition-colors">2</button>
            <button className="px-3 py-1.5 border border-gray-200 hover:bg-white text-gray-700 font-medium rounded-md transition-colors">3</button>
            <button className="px-3 py-1.5 border border-gray-200 hover:bg-white text-gray-700 font-medium rounded-md transition-colors">4</button>
            <button className="px-3 py-1.5 border border-gray-200 hover:bg-white text-gray-700 font-medium rounded-md transition-colors">5</button>
            <span className="px-2 text-gray-400">...</span>
            <button className="px-3 py-1.5 border border-gray-200 hover:bg-white text-gray-700 font-medium rounded-md transition-colors">1235</button>
            <button className="p-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:border-green-500 bg-white text-gray-700">
              <option>10 / page</option>
              <option>20 / page</option>
              <option>50 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
