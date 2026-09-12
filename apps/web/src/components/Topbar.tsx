import { Bell, Menu, Plus, Search } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button className="p-1 text-gray-500 hover:text-gray-700 md:hidden">
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-xl font-semibold text-gray-900 leading-tight">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your automation jobs</p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end">
        <div className="relative hidden md:block max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
            placeholder="Search jobs, executions..."
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <span className="text-gray-400 text-xs border border-gray-200 rounded px-1.5 bg-white shadow-sm">/</span>
          </div>
        </div>

        <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="h-8 w-8 rounded-full bg-green-700 text-white flex items-center justify-center font-semibold text-sm">
            A
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
        </div>

        <button className="hidden sm:flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm ml-2">
          <Plus size={16} />
          Create Job
        </button>
      </div>
    </header>
  );
}
