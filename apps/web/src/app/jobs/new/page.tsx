"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Settings, Clock, Plus, Trash2, Info, Link as LinkIcon, Rocket } from "lucide-react";

export default function NewJob() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    endpoint: "",
    method: "GET",
    cronSchedule: "",
    headers: [{ key: "", value: "" }],
    requestBody: "",
    retryLimit: 3,
    timeout: 30,
    initialRetryDelay: 2,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, we would process headers into an object and pass all fields.
      // For now, we are passing everything to the backend as it is.
      const payloadHeaders = formData.headers
        .filter(h => h.key.trim() !== "")
        .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

      await api.post("/jobs", {
        name: formData.name,
        endpoint: formData.endpoint,
        method: formData.method,
        cronSchedule: formData.cronSchedule || undefined,
        description: formData.description,
        headers: payloadHeaders,
        requestBody: formData.requestBody,
        retryLimit: formData.retryLimit,
        timeout: formData.timeout,
        initialRetryDelay: formData.initialRetryDelay,
      });
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to create job");
    }
  };

  const handleHeaderChange = (index: number, field: "key" | "value", val: string) => {
    const newHeaders = [...formData.headers];
    newHeaders[index][field] = val;
    setFormData({ ...formData, headers: newHeaders });
  };

  const addHeader = () => {
    setFormData({ ...formData, headers: [...formData.headers, { key: "", value: "" }] });
  };

  const removeHeader = (index: number) => {
    const newHeaders = [...formData.headers];
    newHeaders.splice(index, 1);
    setFormData({ ...formData, headers: newHeaders });
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button 
        onClick={() => router.push("/dashboard")} 
        className="flex items-center gap-2 text-green-600 font-medium hover:text-green-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
        <p className="text-gray-500 mt-2">Fill in the details below to create a new automation job.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <p className="text-sm text-gray-500">Provide the basic details about your job</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow bg-gray-50 focus:bg-white text-gray-900" 
                placeholder="e.g. GitHub Health Check"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input 
                type="text" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow bg-gray-50 focus:bg-white text-gray-900" 
                placeholder="Brief description about what this job does"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <LinkIcon size={16} />
                </div>
                <input 
                  type="url" 
                  value={formData.endpoint}
                  onChange={(e) => setFormData({...formData, endpoint: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow bg-gray-50 focus:bg-white text-gray-900" 
                  placeholder="https://api.example.com/webhook"
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTTP Method <span className="text-red-500">*</span>
              </label>
              <select 
                value={formData.method}
                onChange={(e) => setFormData({...formData, method: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow bg-gray-50 focus:bg-white text-gray-900"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cron Schedule (Optional)
              </label>
              <input 
                type="text" 
                value={formData.cronSchedule}
                onChange={(e) => setFormData({...formData, cronSchedule: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow bg-gray-50 focus:bg-white text-gray-900" 
                placeholder="*/5 * * * *"
              />
              <p className="text-xs text-gray-500 mt-2">Use cron expression to schedule your job. Leave empty for manual execution.</p>
            </div>
            
            <div className="bg-green-50/50 border border-green-100 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                <Info size={16} />
                Examples
              </div>
              <ul className="text-sm text-green-700 space-y-1.5 font-mono">
                <li><span className="font-bold">*/5 * * * *</span> &rarr; <span className="font-sans">Every 5 minutes</span></li>
                <li><span className="font-bold">0 * * * *</span> &nbsp;&rarr; <span className="font-sans">Every hour</span></li>
                <li><span className="font-bold">0 9 * * *</span> &nbsp;&rarr; <span className="font-sans">Every day at 9 AM</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                <Settings size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Request Configuration</h2>
                <p className="text-sm text-gray-500">Configure headers, body and other request settings</p>
              </div>
            </div>

            <div className="mb-6 flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Headers (Optional)</label>
                <button type="button" onClick={addHeader} className="text-xs flex items-center gap-1 text-green-600 font-medium hover:text-green-700 px-2 py-1 bg-green-50 rounded border border-green-100">
                  <Plus size={14} /> Add Header
                </button>
              </div>
              
              <div className="space-y-2 mb-2">
                {formData.headers.map((header, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Key" 
                      value={header.key}
                      onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50 focus:bg-white text-sm text-gray-900"
                    />
                    <input 
                      type="text" 
                      placeholder="Value" 
                      value={header.value}
                      onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50 focus:bg-white text-sm text-gray-900"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeHeader(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded border border-transparent transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {formData.headers.length === 0 && (
                <div className="text-sm text-gray-400 py-2 italic text-center border border-dashed border-gray-200 rounded">No headers configured.</div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Request Body (Optional)</label>
                <select className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-green-500 text-gray-700">
                  <option>JSON</option>
                  <option>Text</option>
                </select>
              </div>
              <textarea 
                value={formData.requestBody}
                onChange={(e) => setFormData({...formData, requestBody: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono text-sm min-h-[100px] bg-gray-50 focus:bg-white text-gray-900"
                placeholder={'{"key": "value"}'}
              />
              <p className="text-xs text-gray-500 mt-1">Request body will be sent with the selected content type.</p>
            </div>
          </div>

          {/* Execution Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                <Clock size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Execution Settings</h2>
                <p className="text-sm text-gray-500">Configure how the job should be executed</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    Retry Limit <Info size={14} className="text-gray-400" />
                  </label>
                  <input 
                    type="number" 
                    value={formData.retryLimit}
                    onChange={(e) => setFormData({...formData, retryLimit: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50 focus:bg-white text-gray-900" 
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of times to retry on failure</p>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    Timeout (seconds) <Info size={14} className="text-gray-400" />
                  </label>
                  <input 
                    type="number" 
                    value={formData.timeout}
                    onChange={(e) => setFormData({...formData, timeout: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50 focus:bg-white text-gray-900" 
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum time to wait for response</p>
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  Initial Retry Delay (seconds) <Info size={14} className="text-gray-400" />
                </label>
                <input 
                  type="number" 
                  value={formData.initialRetryDelay}
                  onChange={(e) => setFormData({...formData, initialRetryDelay: parseInt(e.target.value) || 0})}
                  className="w-full md:w-[calc(50%-12px)] px-3 py-2 border border-gray-200 rounded-md outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50 focus:bg-white text-gray-900" 
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Delay before the first retry attempt</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
          <button 
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-green-700 border border-transparent text-white font-medium rounded-md shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Rocket size={18} />
            Create Job
          </button>
        </div>
      </form>
    </div>
  );
}
