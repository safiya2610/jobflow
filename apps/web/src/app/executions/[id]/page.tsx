"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, PlayCircle, Clock, Server, FileText, Globe, AlertCircle } from "lucide-react";
import clsx from "clsx";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ExecutionDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  const { data: execution, isLoading } = useQuery({
    queryKey: ["execution", params.id],
    queryFn: () => api.get(`/executions/${params.id}`).then((res) => res.data),
    refetchInterval: 3000,
  });

  if (isLoading) {
    return <div className="p-10 text-center text-gray-500">Loading execution details...</div>;
  }

  if (!execution) {
    return <div className="p-10 text-center text-red-500">Execution not found</div>;
  }

  const isFailed = execution.status === "FAILED";
  const durationMs = execution.startedAt && execution.completedAt 
    ? new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime() 
    : null;
  const duration = durationMs ? (durationMs > 1000 ? (durationMs / 1000).toFixed(2) + "s" : durationMs + "ms") : "-";

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "SUCCESS": return <CheckCircle size={16} />;
      case "FAILED": return <XCircle size={16} />;
      case "RETRYING": return <RefreshCw size={16} />;
      case "RUNNING": return <PlayCircle size={16} />;
      default: return <Clock size={16} />;
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
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/executions")} 
            className="p-2 border border-gray-200 rounded-md bg-white text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Execution #{execution.id.substring(0, 8)}
              <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", getStatusColor(execution.status))}>
                {getStatusIcon(execution.status)}
                {execution.status}
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Summary Card */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-x divide-gray-100">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Job</p>
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <FileText size={16} className="text-gray-400" />
                {execution.job?.name}
              </div>
            </div>
            <div className="px-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Worker</p>
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Server size={16} className="text-gray-400" />
                {execution.workerId || "-"}
              </div>
            </div>
            <div className="px-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Attempts</p>
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <RefreshCw size={16} className="text-gray-400" />
                {execution.attemptNumber} / {execution.job?.retryLimit || 0}
              </div>
            </div>
            <div className="px-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Duration</p>
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Clock size={16} className="text-gray-400" />
                {duration}
              </div>
            </div>
            <div className="pl-4">
              <p className="text-sm font-medium text-gray-500 mb-1">HTTP Status</p>
              <div className="flex items-center gap-2 font-semibold">
                <Globe size={16} className="text-gray-400" />
                <span className={execution.httpStatus && execution.httpStatus >= 400 ? "text-red-600" : "text-green-600"}>
                  {execution.httpStatus || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Execution Timeline</h2>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="relative border-l border-gray-200 ml-3 space-y-6">
              {[
                { time: new Date(execution.queuedAt).toLocaleTimeString(), desc: "Queued", color: "bg-gray-300" },
                ...(execution.lockedAt ? [{ time: new Date(execution.lockedAt).toLocaleTimeString(), desc: `Claimed by ${execution.workerId}`, color: "bg-blue-400" }] : []),
                ...(execution.startedAt ? [{ time: new Date(execution.startedAt).toLocaleTimeString(), desc: `Attempt ${execution.attemptNumber} started`, color: "bg-blue-500" }] : []),
                ...(execution.completedAt ? [{ time: new Date(execution.completedAt).toLocaleTimeString(), desc: `Execution ${execution.status.toLowerCase()} with status ${execution.httpStatus || 'unknown'}`, color: execution.status === "SUCCESS" ? "bg-green-600" : "bg-red-600" }] : []),
              ].map((step, i) => (
                <div key={i} className="relative pl-6">
                  <div className={clsx("absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white", step.color)}></div>
                  <p className="font-mono text-xs text-gray-500 mb-1">{step.time}</p>
                  <p className="text-sm font-medium text-gray-900">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payload / Request Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Request Configuration</h2>
              <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">GET</span>
            </div>
            <div className="p-0">
              <div className="bg-zinc-900 p-4 text-zinc-300 font-mono text-sm overflow-x-auto">
                <p><span className="text-blue-400">{execution.job?.method}</span> {execution.job?.endpoint}</p>
                <br/>
                <p className="text-zinc-500">// Headers</p>
                {execution.job?.headers ? (
                  <pre>{JSON.stringify(execution.job.headers, null, 2)}</pre>
                ) : (
                  <p>None</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">{isFailed ? "Error Details" : "Response"}</h2>
            </div>
            <div className="p-0">
              {isFailed ? (
                <div className="bg-red-50 p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-red-800">Request failed with status 503</p>
                      <p className="text-sm text-red-600 mt-1">Service Unavailable. The upstream API is currently unable to handle the request.</p>
                      
                      <div className="mt-4 p-4 bg-white/50 rounded border border-red-200 text-sm font-mono text-red-900">
                        {execution.errorDetails || "No error details available."}
                      </div>

                      <div className="mt-6 border-t border-red-200 pt-4">
                        <p className="font-semibold text-red-800 text-sm">Retry Policy</p>
                        <p className="text-sm text-red-600 mt-1">Attempt {execution.attemptNumber} of {execution.job?.retryLimit}</p>
                        <p className="text-sm font-medium text-red-700 mt-0.5">{execution.attemptNumber >= (execution.job?.retryLimit || 0) ? "No more retries remaining." : "Will retry soon."}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900 p-4 text-zinc-300 font-mono text-sm overflow-x-auto h-[220px]">
                  <p className="text-green-400 mb-2">Status: {execution.httpStatus} OK</p>
                  <p className="text-zinc-500">// Body</p>
                  <pre className="text-zinc-300 mt-2">
{execution.responseData || "No response body recorded."}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
