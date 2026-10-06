import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/common/ThemeToggle";
import { supabase } from "../lib/supabase";
import{LuLayoutDashboard as LayoutDashboard,LuBookOpen as BookOpen,LuUsers as Users,LuClipboardList as ClipboardList,LuClipboardCheck as ClipboardCheck,LuGraduationCap as GraduationCap,LuCalendarCheck as CalendarCheck,LuVideo as Video,LuCirclePlay as PlayCircle,LuFolderOpen as FolderOpen,LuCalendarDays as CalendarDays,LuMegaphone as Megaphone,LuMessageSquare as MessageSquare,LuBell as Bell,LuFileText as FileBarChart,LuBriefcase as Briefcase,LuUser as User,LuSettings as Settings,LuLogOut as LogOut,LuMenu as Menu,LuX as X,LuSearch as Search,LuChevronDown as ChevronDown}from"react-icons/lu";

const sections=[
 ["Overview",[{label:"Dashboard",path:"/teacher/dashboard",icon:LayoutDashboard}]],
 ["Teaching",[
  ["My Courses","/teacher/courses",BookOpen],["My Students","/teacher/students",Users],
  ["Assignments","/teacher/assignments",ClipboardList],["Assignment Review","/teacher/assignments/review",ClipboardCheck],
  ["Grades","/teacher/grades",GraduationCap],["Attendance","/teacher/attendance",CalendarCheck]
 ]],
 ["Classes",[
  ["Live Classes","/teacher/live-classes",Video],["Recorded Lectures","/teacher/recorded-lectures",PlayCircle],
  ["Study Materials","/teacher/study-materials",FolderOpen],["Calendar","/teacher/calendar",CalendarDays]
 ]],
 ["Communication",[
  ["Announcements","/teacher/announcements",Megaphone],["Messages","/teacher/messages",MessageSquare],["Notifications","/teacher/notifications",Bell]
 ]],
 ["Reports",[
  ["Daily Report","/teacher/daily-report",FileBarChart],["Internship","/teacher/internship",Briefcase]
 ]],
 ["Account",[["Profile","/teacher/profile",User],["Settings","/teacher/settings",Settings]]]
];
const normalize=(x)=>Array.isArray(x)?{label:x[0],path:x[1],icon:x[2]}:x;

export default function TeacherLayout(){
 const [open,setOpen]=useState(false); const {user,profile,role,signOut}=useAuth(); const navigate=useNavigate();
 const name=profile?.full_name||user?.user_metadata?.full_name||"Teacher";
 const initials=name.split(" ").filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();
 const logout=async()=>{try{await signOut();}finally{navigate("/login",{replace:true});}};
 return <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
  {open&&<button aria-label="Close navigation" onClick={()=>setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"/>}
  <aside className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-white transition-transform lg:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`}>
   <div className="flex h-16 items-center justify-between border-b border-[var(--sidebar-border)] px-5">
    <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600"><GraduationCap size={20}/></div><div><p className="font-bold">EduVerse</p><p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">Teacher Portal</p></div></div>
    <button onClick={()=>setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"><X size={18}/></button>
   </div>
   <nav className="flex-1 overflow-y-auto px-3 py-5">{sections.map(([title,items])=><div key={title} className="mb-6"><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.15em] text-[var(--muted)]">{title}</p><div className="space-y-1">{items.map(raw=>{const item=normalize(raw),Icon=item.icon;return <NavLink key={item.path} to={item.path} onClick={()=>setOpen(false)} end={item.path==="/teacher/dashboard"} className={({isActive})=>`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive?"bg-blue-600 text-white":"text-slate-400 hover:bg-slate-900 hover:text-white"}`}><Icon size={18}/><span>{item.label}</span></NavLink>})}</div></div>)}</nav>
   <div className="border-t border-[var(--sidebar-border)] p-3"><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-300"><LogOut size={18}/>Logout</button></div>
  </aside>
  <div className="lg:pl-[270px]">
   <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/95 px-4 backdrop-blur sm:px-6">
    <div className="flex items-center gap-3"><button onClick={()=>setOpen(true)} className="rounded-xl p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)] lg:hidden"><Menu size={21}/></button><div className="relative hidden md:block"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input placeholder="Search students, courses..." className="h-10 w-72 rounded-xl border border-[var(--border)] bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white"/></div><span className="font-semibold text-[var(--foreground)] md:hidden">Teacher Portal</span></div>
    <div className="flex items-center gap-1 sm:gap-2"><ThemeToggle compact />
      <NavLink to="/teacher/messages" className="rounded-xl p-2.5 text-[var(--muted)] hover:bg-[var(--surface-hover)]"><MessageSquare size={19}/></NavLink>
      <NavLink to="/teacher/notifications" className="rounded-xl p-2.5 text-[var(--muted)] hover:bg-[var(--surface-hover)]"><Bell size={19}/></NavLink>
      <div className="ml-1 h-7 w-px bg-slate-200"/>
      <NavLink to="/teacher/profile" className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-50"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{initials||"T"}</div><div className="hidden text-left sm:block"><p className="max-w-[130px] truncate text-sm font-semibold">{name}</p><p className="text-[11px] text-[var(--muted)]">{role||"Teacher"}</p></div><ChevronDown size={15} className="hidden text-slate-400 sm:block"/></NavLink>
    </div>
   </header>
   <main className="min-h-[calc(100vh-64px)]"><div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><Outlet/></div></main>
  </div>
 </div>
}
