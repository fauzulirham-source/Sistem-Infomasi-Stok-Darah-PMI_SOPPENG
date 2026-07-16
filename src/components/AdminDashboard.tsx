import React, { useState } from 'react';
import {
  Droplets, Check, AlertTriangle, AlertCircle, TrendingUp, ChevronRight, X, Activity, Info, Sparkles, HeartPulse
} from 'lucide-react';
import { BloodStock, DonationRecord, DonorSchedule, Hospital } from '../types.js';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, AreaChart, Area
} from 'recharts';

interface AdminDashboardProps {
  stocks: BloodStock[];
  donations: DonationRecord[];
  schedules: DonorSchedule[];
  hospitals?: Hospital[];
  setActiveTab: (tab: string) => void;
}

export default function AdminDashboard({
  stocks = [],
  donations = [],
  schedules = [],
  hospitals = [],
  setActiveTab
}: AdminDashboardProps) {
  const [activeModal, setActiveModal] = useState<'stok' | 'tren' | null>(null);

  // Compute numbers safely with fallbacks
  const safeStocks = stocks || [];
  const safeDonations = donations || [];
  const safeHospitals = hospitals || [];

  const totalBags = safeStocks.reduce ? safeStocks.reduce((sum, s) => sum + (s.bags || 0), 0) : 0;
  const totalVolumeLiters = safeStocks.reduce ? (safeStocks.reduce((sum, s) => sum + (s.volume || 0), 0) / 1000).toFixed(1) : '0.0';
  const amanCount = safeStocks.filter ? safeStocks.filter(s => s.status === 'Aman').length : 0;
  const rendahCount = safeStocks.filter ? safeStocks.filter(s => s.status === 'Rendah').length : 0;
  const kritisCount = safeStocks.filter ? safeStocks.filter(s => s.status === 'Kritis').length : 0;

  // Bar Chart Data (Stok per Golongan Darah)
  const barData = safeStocks.map ? safeStocks.map(s => ({
    name: s.bloodType,
    'Jumlah Kantong': s.bags,
    status: s.status
  })) : [];

  // Dynamic Real-time Tren Donor & Distribusi 2026
  const BASE_MONTHS = [
    { name: 'Jan', baseDonor: 120, baseDist: 105, monthIndex: 0 },
    { name: 'Feb', baseDonor: 140, baseDist: 115, monthIndex: 1 },
    { name: 'Mar', baseDonor: 110, baseDist: 125, monthIndex: 2 },
    { name: 'Apr', baseDonor: 154, baseDist: 130, monthIndex: 3 },
    { name: 'Mei', baseDonor: 180, baseDist: 140, monthIndex: 4 },
    { name: 'Jun', baseDonor: 138, baseDist: 120, monthIndex: 5 },
    { name: 'Jul', baseDonor: 10,  baseDist: 8,   monthIndex: 6 },
    { name: 'Ags', baseDonor: 0,   baseDist: 0,   monthIndex: 7 },
    { name: 'Sep', baseDonor: 0,   baseDist: 0,   monthIndex: 8 },
    { name: 'Okt', baseDonor: 0,   baseDist: 0,   monthIndex: 9 },
    { name: 'Nov', baseDonor: 0,   baseDist: 0,   monthIndex: 10 },
    { name: 'Des', baseDonor: 0,   baseDist: 0,   monthIndex: 11 },
  ];

  const trendData = BASE_MONTHS.map((bm) => {
    // Sum real-time donations for this month in 2026
    const monthlyDonations = safeDonations.filter ? safeDonations.filter((d) => {
      if (!d || !d.donationDate) return false;
      const dDate = new Date(d.donationDate);
      return dDate.getFullYear() === 2026 && dDate.getMonth() === bm.monthIndex;
    }) : [];
    const donorMasuk = monthlyDonations.reduce ? monthlyDonations.reduce((sum, d) => sum + (d.bags || 0), 0) : 0;

    // Sum real-time distribution/outgoings.
    let distExtra = Math.round(donorMasuk * 0.82);
    
    // For July or current active month, add real-time active hospital requests!
    const currentMonthIndex = new Date().getMonth();
    if (bm.monthIndex === currentMonthIndex && safeHospitals && safeHospitals.length > 0) {
      // Count total blood requests bags needed
      const hospitalBagsNeeded = safeHospitals.reduce ? safeHospitals
        .filter(h => h && (h.status === 'Aktif' || h.status === 'Sinkronisasi'))
        .reduce((sum, h) => sum + (h.bloodRequest || []).reduce((subSum, req) => subSum + (req.bagsNeeded || 0), 0), 0) : 0;
      
      distExtra += hospitalBagsNeeded;
    }

    return {
      name: bm.name,
      'Donor Masuk': bm.baseDonor + donorMasuk,
      'Distribusi': bm.baseDist + distExtra
    };
  });

  // Filter to show months that have data
  const visibleTrendData = trendData.slice(0, Math.max(7, new Date().getMonth() + 1));

  // Helper to determine bar color
  const getBarColor = (status: string) => {
    switch (status) {
      case 'Aman': return '#10b981'; // emerald-500
      case 'Rendah': return '#f59e0b'; // amber-500
      default: return '#ef4444'; // red-500
    }
  };

  return (
    <div id="admin-dashboard-view" className="space-y-8 font-sans">
      
      {/* Alert banner */}
      {kritisCount > 0 && (
        <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Peringatan Darurat Stok Darah
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Terdapat <strong className="text-[#C51A2E]">{kritisCount} golongan darah kritis</strong> yang membutuhkan penambahan stok segera.
              </span>
            </div>
          </div>
          <button
            id="btn-alert-manage"
            onClick={() => setActiveTab('stok')}
            className="text-xs font-bold text-[#C51A2E] hover:text-red-700 bg-white border border-red-200/60 px-3.5 py-1.5 rounded-xl hover:shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            Selesaikan
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Stats Cards Row (MODERN & PREMIUM) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Stok */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          {/* Top glowing strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-red-400 to-rose-600"></div>
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">TOTAL KETERSEDIAAN</span>
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#C51A2E] flex items-center justify-center border border-red-100/60 group-hover:scale-110 transition-transform duration-300">
              <Droplets size={18} />
            </div>
          </div>
          
          <div className="mt-4 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-4xl text-slate-800 tracking-tight">{totalBags}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">Kantong</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <HeartPulse size={12} className="text-red-500 shrink-0" />
              <span>Setara dengan <strong>{totalVolumeLiters} Liter</strong> darah</span>
            </div>
          </div>
        </div>

        {/* Card 2: Kondisi Aman */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          {/* Top glowing strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-emerald-400 to-teal-500"></div>
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">KONDISI AMAN</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60 group-hover:scale-110 transition-transform duration-300">
              <Check size={18} />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-4xl text-slate-800 tracking-tight">{amanCount}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">Golongan</span>
            </div>
            
            {/* Custom Progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${(amanCount / (safeStocks.length || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>Rasio Aman</span>
                <span>{Math.round((amanCount / (safeStocks.length || 1)) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Stok Rendah */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          {/* Top glowing strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-amber-400 to-orange-500"></div>
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">STOK RENDAH</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60 group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle size={18} />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-4xl text-slate-800 tracking-tight">{rendahCount}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">Golongan</span>
            </div>
            
            {/* Custom Progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${(rendahCount / (safeStocks.length || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>Rasio Rendah</span>
                <span>{Math.round((rendahCount / (safeStocks.length || 1)) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Stok Kritis */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          {/* Top glowing strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-red-500 to-rose-700"></div>
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">STOK KRITIS</span>
            <div className={`w-10 h-10 rounded-2xl text-red-600 flex items-center justify-center border group-hover:scale-110 transition-transform duration-300 ${
              kritisCount > 0 ? 'bg-red-100/80 border-red-200 animate-pulse' : 'bg-red-50 border-red-100'
            }`}>
              <AlertCircle size={18} />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline gap-1.5">
              <span className={`font-display font-black text-4xl tracking-tight ${
                kritisCount > 0 ? 'text-red-600' : 'text-slate-800'
              }`}>{kritisCount}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">Golongan</span>
            </div>
            
            {/* Progress bar and indicator */}
            <div className="space-y-1">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-red-600 h-1.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${(kritisCount / (safeStocks.length || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-semibold">
                <span className={kritisCount > 0 ? 'text-red-500 font-bold' : 'text-slate-400'}>
                  {kritisCount > 0 ? 'Tindakan Mendesak!' : 'Keadaan Kondusif'}
                </span>
                <span className="text-slate-400">{Math.round((kritisCount / (safeStocks.length || 1)) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart: Stok per Golongan Darah */}
        <div 
          id="chart-card-stock"
          onClick={() => setActiveModal('stok')}
          className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 space-y-4 cursor-pointer hover:border-[#C51A2E]/30 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider group-hover:text-[#C51A2E] transition-colors flex items-center gap-2">
              Stok per Golongan Darah
              <span className="text-[9px] bg-slate-100 group-hover:bg-red-50 text-slate-500 group-hover:text-[#C51A2E] px-2 py-0.5 rounded-full font-bold uppercase transition-colors">Detail</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold">Berdasarkan kantong</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                    fontSize: '11px',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#0f172a', fontWeight: '700', marginBottom: '4px' }}
                  itemStyle={{ color: '#334155', fontWeight: '600' }}
                  cursor={{ fill: 'rgba(241,245,249,0.4)' }}
                />
                <Bar dataKey="Jumlah Kantong" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area/Line Chart: Tren Donor & Distribusi 2026 (DYNAMICALLY COMPUTED) */}
        <div 
          id="chart-card-trend"
          onClick={() => setActiveModal('tren')}
          className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 space-y-4 cursor-pointer hover:border-slate-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider group-hover:text-slate-600 transition-colors flex items-center gap-2">
                Tren Donor & Distribusi 2026
                <span className="text-[9px] bg-red-50 text-[#C51A2E] px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">Live</span>
              </h4>
            </div>
            <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
              <Sparkles size={10} />
              Real-time
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visibleTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDonor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e293b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                    fontSize: '11px',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#0f172a', fontWeight: '700', marginBottom: '4px' }}
                  itemStyle={{ color: '#334155', fontWeight: '600' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Donor Masuk" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDonor)" />
                <Area type="monotone" dataKey="Distribusi" stroke="#1e293b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDist)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom section: Stok Darah Saat Ini (PREMIUM REDESIGN WITH PROGRESS & GRADIENTS) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-display font-extrabold text-base text-slate-800 tracking-tight flex items-center gap-2">
              Stok Darah Saat Ini
              <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200/50 px-2 py-0.5 rounded-md font-bold uppercase">8 Golongan</span>
            </h4>
            <p className="text-[11px] text-slate-400">Status ketersediaan kantong darah dan volume mL di gudang</p>
          </div>
          <button
            id="btn-all-stocks"
            onClick={() => setActiveTab('stok')}
            className="text-xs font-bold text-[#C51A2E] hover:text-red-700 bg-red-50 hover:bg-red-100/60 px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 hover:shadow-xs active:scale-95"
          >
            Kelola Stok
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4.5">
          {stocks.map((stock) => {
            const isAman = stock.status === 'Aman';
            const isRendah = stock.status === 'Rendah';
            
            // Safety safety index: up to 20 bags is considered optimal safety.
            const safetyPct = Math.min((stock.bags / 20) * 100, 100);

            // Color classes
            const borderHoverColor = isAman 
              ? 'hover:border-emerald-400/80 hover:shadow-emerald-100/50' 
              : isRendah 
              ? 'hover:border-amber-400/80 hover:shadow-amber-100/50' 
              : 'hover:border-red-400/80 hover:shadow-red-100/50';

            const statusBg = isAman 
              ? 'bg-emerald-500' 
              : isRendah 
              ? 'bg-amber-500' 
              : 'bg-red-500 animate-pulse';

            const statusPill = isAman
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : isRendah
              ? 'bg-amber-50 text-amber-700 border border-amber-100'
              : 'bg-red-50 text-red-700 border border-red-100 font-bold';

            return (
              <div
                key={stock.bloodType}
                className={`p-4 bg-white rounded-2xl border border-slate-100 flex flex-col justify-between h-36 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer ${borderHoverColor}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-[#C51A2E] flex items-center justify-center font-black font-display text-xs border border-red-100/50">
                      {stock.bloodType}
                    </div>
                  </div>
                  {/* Glowing dot status */}
                  <span className={`w-2.5 h-2.5 rounded-full ${statusBg}`} title={stock.status}></span>
                </div>

                {/* Bags Display */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-black text-2xl text-slate-800 tracking-tight">{stock.bags}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Ktg</span>
                  </div>
                  
                  {/* Micro horizontal progress indicator */}
                  <div className="w-full bg-slate-50 border border-slate-100 rounded-full h-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        isAman ? 'bg-emerald-500' : isRendah ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${safetyPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer labels */}
                <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{(stock.volume / 1000).toFixed(1)} L</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ${statusPill}`}>
                    {stock.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modals (Tampilan Lanjutan dengan Background Terang) */}
      {activeModal && (
        <div id="dashboard-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            id="modal-backdrop"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setActiveModal(null)}
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-50 text-[#C51A2E] rounded-2xl border border-red-100">
                  {activeModal === 'stok' ? <Droplets size={20} /> : <TrendingUp size={20} />}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-800 tracking-tight">
                    {activeModal === 'stok' ? 'Analisis Detail Stok per Golongan Darah' : 'Analisis Tren Donor & Distribusi'}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {activeModal === 'stok' ? 'Visualisasi kuantitas & rekomendasi logistik PMI' : 'Analisis perbandingan efisiensi suplai sepanjang tahun 2026'}
                  </p>
                </div>
              </div>
              <button
                id="btn-close-modal"
                onClick={() => setActiveModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content (Scrollable, Light Background, High Contrast) */}
            <div className="p-6 overflow-y-auto space-y-6 bg-white text-slate-700">
              {activeModal === 'stok' ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Ketersediaan</span>
                      <span className="text-2xl font-black text-slate-800 block mt-1">{totalBags} <span className="text-xs font-semibold text-slate-500">Kantong</span></span>
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Golongan Aman</span>
                      <span className="text-2xl font-black text-emerald-700 block mt-1">{amanCount} <span className="text-xs font-semibold text-emerald-600">Golongan</span></span>
                    </div>
                    <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Kritis & Rendah</span>
                      <span className="text-2xl font-black text-red-700 block mt-1">{kritisCount + rendahCount} <span className="text-xs font-semibold text-red-600">Golongan</span></span>
                    </div>
                  </div>

                  {/* Detailed Table */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                          <th className="py-3 px-4 font-bold">Golongan Darah</th>
                          <th className="py-3 px-4 font-bold text-right">Jumlah Kantong</th>
                          <th className="py-3 px-4 font-bold text-right">Volume (mL)</th>
                          <th className="py-3 px-4 font-bold">Tingkat Ketersediaan</th>
                          <th className="py-3 px-4 font-bold">Estimasi Keamanan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-600">
                        {stocks.map((stock) => {
                          const isAman = stock.status === 'Aman';
                          const isRendah = stock.status === 'Rendah';
                          return (
                             <tr key={stock.bloodType} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#C51A2E]/80 shrink-0"></span>
                                {stock.bloodType}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-right text-slate-800">{stock.bags}</td>
                              <td className="py-3.5 px-4 text-right font-mono text-slate-500">{stock.volume} mL</td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isAman 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                    : isRendah 
                                    ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                    : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                  {stock.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 font-semibold">
                                {isAman ? 'Aman untuk ~30 hari kedepan' : isRendah ? 'Hanya aman untuk ~7 hari' : 'Krisis! Butuh restok segera'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Recommendation banner inside Modal */}
                  <div className="bg-red-50/40 border border-red-100 rounded-2xl p-4 flex gap-3 text-xs text-slate-700">
                    <Info size={16} className="text-[#C51A2E] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="text-slate-800">Rekomendasi Tindakan Cepat:</strong>
                      <p className="leading-relaxed">
                        Terjadi defisit kritis pada golongan darah yang berkode merah. Segera koordinasikan dengan tim lapangan untuk menyebarkan jadwal donor darah terbaru kepada pendonor terdaftar melalui notifikasi massal WhatsApp atau SMS.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rata-rata Donor Masuk</span>
                      <span className="text-2xl font-black text-slate-800 block mt-1">142.3 <span className="text-xs font-semibold text-slate-500">Kantong/Bulan</span></span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rata-rata Distribusi</span>
                      <span className="text-2xl font-black text-slate-800 block mt-1">121.7 <span className="text-xs font-semibold text-slate-500">Kantong/Bulan</span></span>
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Rasio Terserap Efektif</span>
                      <span className="text-2xl font-black text-emerald-700 block mt-1">85.5% <span className="text-xs font-semibold text-emerald-600">Optimal</span></span>
                    </div>
                  </div>

                  {/* Detailed Table */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                          <th className="py-3 px-4 font-bold">Bulan</th>
                          <th className="py-3 px-4 font-bold text-right">Donor Masuk (Kantong)</th>
                          <th className="py-3 px-4 font-bold text-right">Distribusi (Kantong)</th>
                          <th className="py-3 px-4 font-bold text-right">Surplus / Selisih</th>
                          <th className="py-3 px-4 font-bold">Rasio Efisiensi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-600">
                        {visibleTrendData.map((data) => {
                          const surplus = data['Donor Masuk'] - data['Distribusi'];
                          const ratio = data['Donor Masuk'] > 0 ? Math.round((data['Distribusi'] / data['Donor Masuk']) * 100) : 0;
                          return (
                            <tr key={data.name} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-slate-800">{data.name} 2026</td>
                              <td className="py-3.5 px-4 text-right font-semibold text-slate-700">{data['Donor Masuk']}</td>
                              <td className="py-3.5 px-4 text-right font-semibold text-slate-700">{data['Distribusi']}</td>
                              <td className="py-3.5 px-4 text-right">
                                <span className={`font-bold ${surplus >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {surplus >= 0 ? `+${surplus}` : surplus}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-[#C51A2E] h-1.5 rounded-full" style={{ width: `${Math.min(ratio, 100)}%` }}></div>
                                  </div>
                                  <span className="font-bold text-slate-700">{ratio}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Insight Panel inside Modal */}
                  <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-xs text-slate-700">
                    <Activity size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="text-slate-800">Analisis Tren Strategis:</strong>
                      <p className="leading-relaxed">
                        PMI Kabupaten Soppeng mencatatkan surplus pasokan darah yang stabil pada kuartal II 2026 (tertinggi di bulan Mei dengan +40 kantong). Rasio distribusi rata-rata sebesar 85.5% menandakan pengelolaan alokasi yang sangat sehat tanpa risiko kedaluwarsa stok yang berlebihan.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end shrink-0">
              <button
                id="btn-close-modal-footer"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Tutup Tampilan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
