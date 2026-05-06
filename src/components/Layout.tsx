/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Bell, 
  User, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: BookOpen, label: 'Courses', path: '/courses' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: User, label: 'Profile', path: '/profile' },
];

interface LayoutProps {
  customNavItems?: { icon: any, label: string, path: string }[];
  onSignOut?: () => void;
}

export default function Layout({ customNavItems, onSignOut }: LayoutProps) {
  const location = useLocation();
  const activeNavItems = customNavItems || NAV_ITEMS;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-primary text-white h-screen sticky top-0 p-6 shadow-2xl relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-10 px-2 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner">
            E
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase">ELP Portal</span>
        </div>

        <nav className="flex-1 space-y-1 relative z-10">
          {activeNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-white/10 text-white font-bold" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn("transition-transform group-hover:scale-110", location.pathname === item.path ? "text-warning" : "")} />
              <span className="text-sm tracking-wide">{item.label}</span>
              {location.pathname === item.path && (
                <motion.div 
                  layoutId="active-highlight"
                  className="ml-auto w-1 h-4 rounded-full bg-warning shadow-[0_0_10px_rgba(230,160,23,0.5)]"
                />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/10 mt-auto relative z-10">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-warning border-2 border-white/20 flex items-center justify-center font-black text-xs text-white shadow-lg overflow-hidden">
               AL
            </div>
            <div className="overflow-hidden">
               <div className="text-xs font-black truncate leading-none uppercase tracking-tighter">Alex Johnson</div>
               <div className="text-[9px] text-white/40 mt-1 uppercase font-bold tracking-widest truncate">Student ID: 202688</div>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white transition-colors rounded-xl hover:bg-white/5 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto h-screen bg-surface">
        <header className="h-20 bg-white/40 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30 flex items-center justify-between px-6 md:px-10">
          <div className="md:hidden flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-lg">
                E
              </div>
              <span className="font-black text-lg tracking-tighter text-primary uppercase">ELP</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              {activeNavItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            <span className="text-[10px] bg-slate-200/50 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest mt-1">
              Spring 2026
            </span>
          </div>
          
          <div className="flex items-center gap-6">
              <div className="hidden lg:flex relative items-center">
                <input 
                  type="text" 
                  placeholder="Search materials..." 
                  className="bg-slate-100/50 border border-slate-200/50 rounded-full pl-10 pr-4 py-2 text-xs w-64 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold placeholder:text-slate-400"
                />
                <div className="absolute left-3.5 text-slate-400 group">
                   <ChevronRight size={14} className="rotate-90 group-hover:text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 bg-white rounded-full border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <Bell size={18} className="text-slate-600" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white animate-bounce"></span>
                </button>
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-sm p-0.5">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" className="w-full h-full rounded-full object-cover" />
                </div>
              </div>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 px-6 flex items-center justify-between z-40">
        {activeNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 transition-colors relative",
              isActive ? "text-primary" : "text-slate-400"
            )}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            {location.pathname === item.path && (
              <motion.div 
                layoutId="active-dot"
                className="absolute -top-1 w-1 h-1 rounded-full bg-primary"
              />
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
