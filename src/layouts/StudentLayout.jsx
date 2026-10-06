import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import StudentAdmissionGate from "../components/student/StudentAdmissionGate";

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <StudentAdmissionGate>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex min-h-screen">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="min-w-0 flex-1 lg:ml-0">
            <Topbar onMenuClick={() => setSidebarOpen(true)} />
            <main className="min-h-[calc(100vh-64px)] overflow-y-auto">
              <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </StudentAdmissionGate>
  );
}
