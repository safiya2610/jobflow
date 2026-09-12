import Link from "next/link";
import {
  Home,
  Briefcase,
  Plus,
  Calendar,
  List,
  FileText,
  Zap
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-green-600 text-white p-1.5 rounded-md">
          <Zap size={20} className="fill-white" />
        </div>
        <span className="font-bold text-xl text-gray-900">JobFlow</span>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto space-y-6">
        <div>
          <Link
            href="/"
            className="flex items-center gap-3 bg-green-50 text-green-700 px-3 py-2 rounded-md font-medium"
          >
            <Home size={18} />
            Overview
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Jobs
          </h3>
          <div className="space-y-1">
            <Link
              href="/jobs"
              className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md font-medium transition-colors"
            >
              <Briefcase size={18} />
              All Jobs
            </Link>
            <Link
              href="/jobs/new"
              className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md font-medium transition-colors"
            >
              <Plus size={18} />
              Create Job
            </Link>
            <Link
              href="/schedules"
              className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md font-medium transition-colors"
            >
              <Calendar size={18} />
              Schedules
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Executions
          </h3>
          <div className="space-y-1">
            <Link
              href="/executions"
              className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md font-medium transition-colors"
            >
              <List size={18} />
              Executions
            </Link>
            <Link
              href="/logs"
              className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md font-medium transition-colors"
            >
              <FileText size={18} />
              Logs
            </Link>
          </div>
        </div>


      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2 text-green-800 font-semibold">
            <Zap size={16} className="fill-green-800" />
            Pro Plan
          </div>
          <p className="text-xs text-green-700 mb-3 leading-relaxed">
            You are using the Pro plan with 3 workers and <strong>advanced</strong> features.
          </p>
          <button className="w-full bg-white border border-green-200 text-green-700 font-medium py-1.5 rounded-lg text-sm hover:bg-green-50 transition-colors">
            Manage Plan
          </button>
        </div>
      </div>
    </aside>
  );
}
