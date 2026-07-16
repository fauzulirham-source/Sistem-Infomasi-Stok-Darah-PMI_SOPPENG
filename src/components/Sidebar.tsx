import React from 'react';
import { LayoutDashboard, Droplets, PlusCircle, Calendar, LogOut, User, Database, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  adminEmail?: string;
  supabaseStatus?: { active: boolean; url: string | null; message: string };
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  adminEmail = 'admin@utd-soppeng.id',
  supabaseStatus,
  isOpen = false,
  onClose
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stok', label: 'Stok Darah', icon: Droplets },
    { id: 'tambah', label: 'Tambah Stok', icon: PlusCircle },
    { id: 'jadwal', label: 'Jadwal Donor', icon: Calendar },
    { id: 'akun', label: 'Akun Admin', icon: User },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          id="sidebar-backdrop"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <div 
        id="admin-sidebar" 
        className={`fixed inset-y-0 left-0 w-64 bg-[#C51A2E] text-white flex flex-col h-screen shrink-0 font-sans z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center p-1 shadow-md border border-white shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M45 5H75V45H115V75H75V115H45V75H5V45H45V5Z" fill="#C51A2E" />
              </svg>
            </div>
            <div>
              <h2 className="font-display font-bold tracking-tight text-lg leading-none">PMI</h2>
              <span className="text-xs text-white/80">Kabupaten Soppeng</span>
            </div>
          </div>
          
          {/* Close button for mobile */}
          {onClose && (
            <button
              id="btn-close-sidebar"
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white md:hidden cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

      {/* Database Connection Status */}
      <div id="db-status-bar" className="px-4 py-2.5 border-b border-white/10 bg-[#A61424]/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-white/90">
          <Database size={13} className="shrink-0 text-white/70" />
          <span>Database:</span>
        </div>
        {supabaseStatus?.active ? (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Supabase
          </span>
        ) : (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Offline JSON
          </span>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`sidebar-btn-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-[#C51A2E] font-semibold shadow-md translate-x-1'
                  : 'hover:bg-white/10 text-white/90 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#C51A2E]' : 'text-white/80'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Admin User Info */}
      <div className="p-4 border-t border-white/10 bg-[#A61424]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm text-white border border-white/30">
            AD
          </div>
          <div className="overflow-hidden">
            <h4 className="font-semibold text-sm leading-tight truncate">Admin</h4>
            <p className="text-xs text-white/70 truncate">{adminEmail}</p>
          </div>
        </div>
        <button
          id="btn-logout"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          Keluar
        </button>
      </div>
    </div>
    </>
  );
}
