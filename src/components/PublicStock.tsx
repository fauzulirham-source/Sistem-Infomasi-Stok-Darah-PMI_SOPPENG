import React, { useState } from 'react';
import {
  Droplets, Heart, Calendar, BookOpen, Lock, Shield, Award, Sparkles, Clock, AlertTriangle,
  Hospital as HospitalIcon, Smartphone, Check, ChevronRight, User, Phone, Mail, ArrowRight, Activity,
  MessageSquare, Send, Bell, ExternalLink
} from 'lucide-react';
import { BloodStock, DonationRecord, DonorSchedule, Hospital, NotificationItem, BloodGroup, UserProfile } from '../types.js';
import EduSection from './EduSection.tsx';
import HospitalSync from './HospitalSync.tsx';
import TwoFactorAuth from './TwoFactorAuth.tsx';
import DonorHistory from './DonorHistory.tsx';

interface PublicStockProps {
  stocks: BloodStock[];
  donations: DonationRecord[];
  schedules: DonorSchedule[];
  hospitals: Hospital[];
  notifications: NotificationItem[];
  userProfile: UserProfile;
  onAdminLoginClick: () => void;
  onAddSchedule: (data: {
    donorName: string;
    phone: string;
    email: string;
    bloodType: BloodGroup;
    appointmentDate: string;
    appointmentTime: string;
    notes?: string;
  }) => Promise<void>;
  onAddDonation: (data: any) => Promise<void>;
  onDeleteSchedule?: (id: string) => Promise<void>;
  onSyncAllHospitals: () => Promise<void>;
  onEnable2FA: (code: string) => Promise<boolean>;
  onDisable2FA: () => Promise<void>;
  isLoggedIn?: boolean;
}

export default function PublicStock({
  stocks = [],
  donations = [],
  schedules = [],
  hospitals = [],
  notifications = [],
  userProfile,
  onAdminLoginClick,
  onAddSchedule,
  onAddDonation,
  onDeleteSchedule,
  onSyncAllHospitals,
  onEnable2FA,
  onDisable2FA,
  isLoggedIn = false
}: PublicStockProps) {
  const [activeTab, setActiveTab] = useState<'stok' | 'riwayat' | 'edukasi' | 'keamanan'>('stok');

  // Form states for scheduler (handled with safe defaults if userProfile is null/undefined)
  const [schedName, setSchedName] = useState(userProfile?.name || '');
  const [schedPhone, setSchedPhone] = useState(userProfile?.phone || '');
  const [schedEmail, setSchedEmail] = useState(userProfile?.email || '');
  const [schedBlood, setSchedBlood] = useState<BloodGroup>(userProfile?.bloodType || 'B+');
  const [schedDate, setSchedDate] = useState('2026-07-20');
  const [schedTime, setSchedTime] = useState('09:00');
  const [schedNotes, setSchedNotes] = useState('');
  const [schedSubmitting, setSchedSubmitting] = useState(false);
  const [schedSuccessMsg, setSchedSuccessMsg] = useState<string | null>(null);
  const [schedErrorMsg, setSchedErrorMsg] = useState<string | null>(null);

  // Personalized notification reminder states for scheduling next session
  const [subName, setSubName] = useState(userProfile?.name || '');
  const [subPhone, setSubPhone] = useState(userProfile?.phone || '');
  const [subBlood, setSubBlood] = useState<BloodGroup>(userProfile?.bloodType || 'B+');
  const [subCritical, setSubCritical] = useState(true);
  const [subNextEligible, setSubNextEligible] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  // Simulated WhatsApp toast notification state
  const [waToast, setWaToast] = useState<{
    show: boolean;
    sender: string;
    message: string;
    time: string;
    type: 'critical' | 'eligibility';
  } | null>(null);

  // Dynamic calculation for the next recommended scheduling date
  const userDonations = (donations || []).filter(
    d => d && (d.email?.toLowerCase() === userProfile?.email?.toLowerCase() || d.donorName?.toLowerCase() === userProfile?.name?.toLowerCase())
  );
  const lastDonationDate = userDonations.length > 0 
    ? new Date(userDonations[0].donationDate)
    : new Date('2026-06-15');

  const formattedLastDonationDate = lastDonationDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const nextEligibleDate = new Date(lastDonationDate.getTime() + 12 * 7 * 24 * 60 * 60 * 1000);
  const formattedEligibleDate = nextEligibleDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const nextEligibleIsoDate = nextEligibleDate.toISOString().split('T')[0];

  // Helper to calculate stock metrics safely
  const safeStocks = stocks || [];
  const totalBags = safeStocks.reduce ? safeStocks.reduce((sum, s) => sum + (s.bags || 0), 0) : 0;
  const amanCount = safeStocks.filter ? safeStocks.filter(s => s && s.status === 'Aman').length : 0;
  const rendahCount = safeStocks.filter ? safeStocks.filter(s => s && s.status === 'Rendah').length : 0;
  const kritisCount = safeStocks.filter ? safeStocks.filter(s => s && s.status === 'Kritis').length : 0;

  // Filter out critical blood types
  const criticalTypes = safeStocks.filter ? safeStocks.filter(s => s && s.status === 'Kritis').map(s => s.bloodType).join(', ') : '';

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchedSubmitting(true);
    setSchedSuccessMsg(null);
    setSchedErrorMsg(null);

    try {
      await onAddSchedule({
        donorName: schedName,
        phone: schedPhone,
        email: schedEmail,
        bloodType: schedBlood,
        appointmentDate: schedDate,
        appointmentTime: schedTime,
        notes: schedNotes
      });

      setSchedSuccessMsg('Sesi donor Anda berhasil dijadwalkan! Notifikasi push pengingat dikirim.');
      setSchedNotes('');
      setTimeout(() => setSchedSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
      setSchedErrorMsg(err instanceof Error ? err.message : 'Gagal mengirim pendaftaran jadwal donor.');
    } finally {
      setSchedSubmitting(false);
    }
  };

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subPhone) return;
    setSubscribed(true);
  };

  const triggerCriticalSimulation = () => {
    const textMessage = `Halo *${subName}*, UTD PMI Kabupaten Soppeng menginformasikan bahwa stok golongan darah *${subBlood}* saat ini sedang *KRITIS* (terbatas). Bantuan Anda sangat dibutuhkan untuk menyelamatkan nyawa pasien! Jika Anda merasa fit dan sehat, silakan jadwalkan kunjungan donor Anda sekarang.`;
    
    setWaToast({
      show: true,
      sender: 'UTD PMI Kabupaten Soppeng (Official)',
      message: textMessage,
      time: 'Baru saja',
      type: 'critical'
    });
  };

  const triggerEligibilitySimulation = () => {
    const textMessage = `Halo *${subName}*, selamat! Batas waktu 12 minggu dari donor terakhir Anda (${formattedLastDonationDate}) sudah terpenuhi. Anda kini sudah *KEMBALI LAYAK* untuk mendonorkan darah secara aman di UTD PMI Soppeng. Silakan jadwalkan sesi kunjungan berikutnya setelah tanggal *${formattedEligibleDate}*.`;
    
    setWaToast({
      show: true,
      sender: 'UTD PMI Kabupaten Soppeng (Official)',
      message: textMessage,
      time: 'Baru saja',
      type: 'eligibility'
    });
  };

  const handleActionOnToast = () => {
    // Fill scheduler with calculated next date & donor info
    setSchedName(subName);
    setSchedPhone(subPhone);
    setSchedBlood(subBlood);
    setSchedDate(nextEligibleIsoDate);
    
    // Hide toast
    setWaToast(null);

    // Scroll to booking form
    const bookingElement = document.getElementById('jadwal-form-section');
    if (bookingElement) {
      bookingElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="public-view" className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Premium Public Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[95%] xl:max-w-[92%] 2xl:max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow border border-slate-100 shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M45 5H75V45H115V75H75V115H45V75H5V45H45V5Z" fill="#C51A2E" />
              </svg>
            </div>
            <div>
              <h1 className="font-display font-black text-slate-800 text-base md:text-lg lg:text-xl leading-tight tracking-tight uppercase">
                Sistem Informasi Stok Darah
              </h1>
              <p className="text-xs lg:text-sm text-slate-500 font-semibold uppercase tracking-wider">
                PMI Kabupaten Soppeng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Public Refresh Indicator */}
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-time Terkoneksi
            </span>
            <button
              id="btn-login-admin-public"
              onClick={onAdminLoginClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#C51A2E] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer hover:shadow"
            >
              <Lock size={12} />
              {isLoggedIn ? 'Dashboard Admin' : 'Login Admin'}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-b border-slate-100/80">
        <div className="max-w-[95%] xl:max-w-[92%] 2xl:max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-2 overflow-x-auto scrollbar-none md:justify-center">
            {[
              { id: 'stok', label: 'Ketersediaan Stok', icon: Droplets },
              { id: 'riwayat', label: 'Riwayat & Statistik', icon: Activity },
              { id: 'edukasi', label: 'Edukasi Donor', icon: BookOpen },
              { id: 'keamanan', label: 'Keamanan', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  id={`tab-public-${tab.id}`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[95%] xl:max-w-[92%] 2xl:max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Alerts Banner (Show on stock tab and if critical stocks exist) */}
        {activeTab === 'stok' && kritisCount > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-[#C51A2E] mt-0.5 shrink-0" size={18} />
              <div>
                <h4 className="font-bold text-sm text-slate-800">Stok Darah Kritis — Diperlukan Donor Segera</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Golongan darah <strong className="text-[#C51A2E]">{criticalTypes}</strong> dalam kondisi kritis. Jika Anda memiliki golongan darah tersebut, mohon kesediaannya menjadwalkan sesi donor.
                </p>
              </div>
            </div>
            <button
              id="btn-alert-schedule"
              onClick={() => {
                const element = document.getElementById('scheduler-form');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 bg-[#C51A2E] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
            >
              Jadwalkan Sekarang
            </button>
          </div>
        )}

        {/* Tab Content Router */}
        {activeTab === 'stok' && (
          <div className="space-y-6">
            
            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-wider">Total Stok</span>
                  <p className="font-display font-black text-2xl lg:text-3xl text-[#C51A2E] mt-1">{totalBags} <span className="text-xs text-slate-400 font-normal">kantong</span></p>
                </div>
                <div className="p-3 bg-red-50 text-[#C51A2E] rounded-xl border border-red-100">
                  <Droplets size={20} />
                </div>
              </div>

              <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-wider">Kondisi Aman</span>
                  <p className="font-display font-black text-2xl lg:text-3xl text-emerald-600 mt-1">{amanCount} <span className="text-xs text-slate-400 font-normal">golongan</span></p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <Check size={20} />
                </div>
              </div>

              <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-wider">Stok Rendah</span>
                  <p className="font-display font-black text-2xl lg:text-3xl text-amber-500 mt-1">{rendahCount} <span className="text-xs text-slate-400 font-normal">golongan</span></p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-500 rounded-xl border border-amber-100">
                  <AlertTriangle size={20} />
                </div>
              </div>

              <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-wider">Stok Kritis</span>
                  <p className="font-display font-black text-2xl lg:text-3xl text-[#C51A2E] mt-1">{kritisCount} <span className="text-xs text-slate-400 font-normal">golongan</span></p>
                </div>
                <div className="p-3 bg-red-50 text-[#C51A2E] rounded-xl border border-red-100">
                  <AlertTriangle size={20} />
                </div>
              </div>
            </div>

            {/* Grid of Blood Stocks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-slate-800">Ketersediaan Stok Darah Saat Ini</h3>
                <span className="text-[10px] text-slate-400 font-semibold">Diperbarui secara otomatis (Real-time)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-5">
                {stocks.map((stock) => {
                  const isAman = stock.status === 'Aman';
                  const isRendah = stock.status === 'Rendah';
                  return (
                    <div
                      key={stock.bloodType}
                      className={`p-4 lg:p-5 rounded-2xl border flex flex-col justify-between h-40 lg:h-44 transition-all ${
                        isAman
                          ? 'border-emerald-100 bg-emerald-50/20 hover:shadow-sm'
                          : isRendah
                          ? 'border-amber-100 bg-amber-50/20 hover:shadow-sm'
                          : 'border-red-100 bg-red-50/20 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-black text-xl lg:text-2xl text-slate-800">{stock.bloodType}</span>
                        {isAman ? (
                          <span className="w-5.5 h-5.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 text-xs">
                            ✓
                          </span>
                        ) : (
                          <span className="w-5.5 h-5.5 rounded-full bg-red-50 text-[#C51A2E] flex items-center justify-center border border-red-200 text-xs font-bold">
                            !
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <span className="block text-2xl lg:text-3xl font-display font-black text-slate-800">
                          {stock.bags}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">kantong</span>
                      </div>

                      <div className="border-t border-slate-200/40 pt-2 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-medium">{stock.volume} mL</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                          isAman
                            ? 'bg-emerald-100 text-emerald-800'
                            : isRendah
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-[#C51A2E]'
                        }`}>
                          {stock.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Split Section: Scheduler Form & Personalized Push Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Scheduler Form */}
              <div id="scheduler-form" className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-red-100 text-[#C51A2E] rounded-xl shrink-0">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-800">Jadwalkan Sesi Donor Anda</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Pilih waktu kunjungan untuk menghindari antrean. Sesi donor Anda akan disinkronkan langsung ke kalender PMI.
                    </p>
                  </div>
                </div>

                {schedSuccessMsg ? (
                  <div className="p-6 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-center space-y-2 py-10">
                    <Check size={36} className="text-emerald-500 mx-auto" />
                    <h4 className="font-bold text-sm">Jadwal Selesai Diregistrasi!</h4>
                    <p className="text-xs">{schedSuccessMsg}</p>
                    <p className="text-[10px] text-slate-400 mt-3">Silakan cek status sesi donor Anda di tab "Riwayat & Statistik".</p>
                  </div>
                ) : (
                  <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {schedErrorMsg && (
                      <div className="sm:col-span-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs font-semibold flex items-center gap-2">
                        <AlertTriangle size={14} className="text-red-500 shrink-0" />
                        <span>{schedErrorMsg}</span>
                      </div>
                    )}
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Nama Lengkap *</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          id="sched-name"
                          type="text"
                          value={schedName}
                          onChange={(e) => setSchedName(e.target.value)}
                          placeholder="Nama lengkap Anda"
                          className="w-full bg-white pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C51A2E]"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Nomor WhatsApp *</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          id="sched-phone"
                          type="tel"
                          value={schedPhone}
                          onChange={(e) => setSchedPhone(e.target.value)}
                          placeholder="Contoh: 0812345678"
                          className="w-full bg-white pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C51A2E]"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Alamat Email (Opsional)</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          id="sched-email"
                          type="email"
                          value={schedEmail}
                          onChange={(e) => setSchedEmail(e.target.value)}
                          placeholder="email@domain.com"
                          className="w-full bg-white pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C51A2E]"
                        />
                      </div>
                    </div>

                    {/* Blood Type */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Golongan Darah *</label>
                      <select
                        id="sched-blood"
                        value={schedBlood}
                        onChange={(e) => setSchedBlood(e.target.value as BloodGroup)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E]"
                        required
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    {/* Date */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Tanggal Sesi *</label>
                      <input
                        id="sched-date"
                        type="date"
                        value={schedDate}
                        onChange={(e) => setSchedDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E]"
                        required
                      />
                    </div>

                    {/* Time */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Jam Sesi *</label>
                      <input
                        id="sched-time"
                        type="text"
                        value={schedTime}
                        onChange={(e) => setSchedTime(e.target.value)}
                        placeholder="Contoh: 09:00 WITA atau 09:00"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E]"
                        required
                      />
                    </div>

                    {/* Notes */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Catatan Kondisi Fisik (Opsional)</label>
                      <textarea
                        id="sched-notes"
                        placeholder="Contoh: Terakhir donor 3 bulan lalu, tensi darah normal, Hb stabil."
                        value={schedNotes}
                        onChange={(e) => setSchedNotes(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E] h-20 resize-none"
                      ></textarea>
                    </div>

                    <div className="sm:col-span-2 pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        id="btn-sched-submit"
                        type="submit"
                        disabled={schedSubmitting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#C51A2E] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {schedSubmitting ? 'Mendaftarkan...' : 'Jadwalkan Kunjungan'}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Personalized Push Notifications Reminder card with WhatsApp preferences */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-gradient-to-br from-red-600 via-rose-600 to-[#C51A2E] text-white rounded-2xl p-6 shadow-md space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-white/10 rounded-xl shrink-0 border border-white/15">
                      <Smartphone size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base leading-snug">Notifikasi Pengingat Personalisasi</h3>
                      <p className="text-[11px] text-white/80 mt-1 leading-normal">
                        Dapatkan peringatan instan via WhatsApp saat golongan darah Anda sedang kritis, serta notifikasi khusus kapan Anda bisa menjadwalkan sesi berikutnya (minimal 12 minggu dari donor terakhir).
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-3.5 border border-white/20 text-xs">
                    <p className="font-bold flex items-center gap-1.5 text-yellow-300">
                      <Clock size={12} />
                      Rekomendasi Jadwal Selanjutnya Anda:
                    </p>
                    <p className="text-[11px] mt-1 text-white/95 leading-relaxed font-medium">
                      Berdasarkan riwayat donor terakhir ({formattedLastDonationDate}), Anda direkomendasikan menjadwalkan sesi donor berikutnya setelah tanggal:
                    </p>
                    <p className="text-xs font-black mt-1.5 text-yellow-300 bg-black/15 px-2.5 py-1 rounded-md inline-block">
                      {formattedEligibleDate} (12 Minggu dari Donor Terakhir)
                    </p>
                  </div>

                  {subscribed ? (
                    <div className="bg-white text-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs border-b border-slate-100 pb-2">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0"></span>
                        <span>✓ Pengingat WhatsApp Aktif</span>
                      </div>
                      
                      <div className="space-y-1.5 text-[11px] text-slate-600">
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span className="font-semibold text-slate-400">Nama Lengkap:</span>
                          <span className="font-bold text-slate-700">{subName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span className="font-semibold text-slate-400">Nomor WA:</span>
                          <span className="font-bold text-slate-700">{subPhone}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span className="font-semibold text-slate-400">Golongan Darah:</span>
                          <span className="font-bold text-red-600">{subBlood}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span className="font-semibold text-slate-400">Notif Stok Kritis:</span>
                          <span className={`font-bold ${subCritical ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {subCritical ? 'Aktif' : 'Non-aktif'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-400">Notif Sesi Kembali:</span>
                          <span className={`font-bold ${subNextEligible ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {subNextEligible ? 'Aktif' : 'Non-aktif'}
                          </span>
                        </div>
                      </div>

                      {/* Simulator Tools */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Activity size={10} className="text-[#C51A2E]" />
                          KONSOL SIMULASI NOTIFIKASI WA:
                        </p>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {subCritical && (
                            <button
                              id="btn-sim-critical"
                              onClick={triggerCriticalSimulation}
                              className="w-full bg-[#128C7E] hover:bg-[#075e54] text-white font-bold text-[10px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              <MessageSquare size={12} />
                              Simulasi WA: Stok Kritis {subBlood}
                            </button>
                          )}
                          {subNextEligible && (
                            <button
                              id="btn-sim-eligible"
                              onClick={triggerEligibilitySimulation}
                              className="w-full bg-[#128C7E] hover:bg-[#075e54] text-white font-bold text-[10px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              <MessageSquare size={12} />
                              Simulasi WA: Jadwal Kembali
                            </button>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setSubscribed(false)}
                        className="w-full text-center text-xs text-slate-500 hover:text-red-600 font-bold py-1 border-t border-slate-100 pt-2 transition-colors cursor-pointer"
                      >
                        Ubah Pengaturan Langganan
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribeSubmit} className="space-y-4">
                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-white/90">Nama Lengkap Anda</label>
                        <input
                          id="sub-name"
                          type="text"
                          placeholder="Masukkan nama lengkap"
                          value={subName}
                          onChange={(e) => setSubName(e.target.value)}
                          className="w-full bg-white/10 text-white placeholder-white/50 border border-white/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white/20"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Phone */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-white/90">Nomor WhatsApp *</label>
                          <input
                            id="sub-phone"
                            type="tel"
                            placeholder="Contoh: 08123456..."
                            value={subPhone}
                            onChange={(e) => setSubPhone(e.target.value)}
                            className="w-full bg-white/10 text-white placeholder-white/50 border border-white/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white/20"
                            required
                          />
                        </div>

                        {/* Blood Type */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-white/90">Golongan Darah</label>
                          <select
                            id="sub-blood"
                            value={subBlood}
                            onChange={(e) => setSubBlood(e.target.value as BloodGroup)}
                            className="w-full bg-white/10 text-white border border-white/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white/20 cursor-pointer"
                          >
                            <option value="A+" className="text-slate-800">A+</option>
                            <option value="A-" className="text-slate-800">A-</option>
                            <option value="B+" className="text-slate-800">B+</option>
                            <option value="B-" className="text-slate-800">B-</option>
                            <option value="AB+" className="text-slate-800">AB+</option>
                            <option value="AB-" className="text-slate-800">AB-</option>
                            <option value="O+" className="text-slate-800">O+</option>
                            <option value="O-" className="text-slate-800">O-</option>
                          </select>
                        </div>
                      </div>

                      {/* Custom preferences check list */}
                      <div className="space-y-2 border-t border-white/10 pt-3">
                        <label className="block text-[10px] font-bold text-white/80 uppercase tracking-wider mb-1">
                          Pilihan Jenis Notifikasi WhatsApp:
                        </label>
                        
                        <div className="flex items-start gap-2.5">
                          <input
                            id="sub-pref-critical"
                            type="checkbox"
                            checked={subCritical}
                            onChange={(e) => setSubCritical(e.target.checked)}
                            className="mt-0.5 rounded border-white/10 bg-white/10 focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <span className="block text-[11px] font-bold text-white">Notifikasi Stok Kritis (<span className="text-yellow-300">&lt; 10 kantong</span>)</span>
                            <span className="block text-[10px] text-white/70 leading-tight">Terima alert instan saat golongan darah Anda kritis agar Anda bisa segera membantu.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 pt-1">
                          <input
                            id="sub-pref-eligible"
                            type="checkbox"
                            checked={subNextEligible}
                            onChange={(e) => setSubNextEligible(e.target.checked)}
                            className="mt-0.5 rounded border-white/10 bg-white/10 focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <span className="block text-[11px] font-bold text-white">Pengingat Kelayakan Donor Kembali</span>
                            <span className="block text-[10px] text-white/70 leading-tight">Terima pengingat otomatis tepat 12 minggu setelah sesi donor darah terakhir Anda.</span>
                          </div>
                        </div>
                      </div>

                      <button
                        id="btn-sub-push"
                        type="submit"
                        className="w-full bg-white hover:bg-slate-50 text-[#C51A2E] font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                      >
                        <Bell size={13} />
                        Aktifkan Layanan Pengingat WA
                      </button>
                    </form>
                  )}
                </div>

                {/* Quick Info panel */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Kontak & Alamat Markas PMI</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>PMI Kabupaten Soppeng</strong><br />
                    Jl. Kemakmuran No. 50, Lalabata Rilau, Kecamatan Lalabata, Watansoppeng, Sulawesi Selatan, Indonesia<br />
                    Telepon/WA: 0812-8899-0011<br />
                    Jam Operasional: Senin - Minggu (24 Jam untuk Kebutuhan Darurat)
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'riwayat' && (
          <DonorHistory
            donations={donations}
            schedules={schedules}
            userEmail={userProfile.email}
            userName={userProfile.name}
            userBloodType={userProfile.bloodType}
            onAddDonation={onAddDonation}
            onDeleteSchedule={onDeleteSchedule}
          />
        )}

        {activeTab === 'edukasi' && <EduSection />}

        {activeTab === 'keamanan' && (
          <div className="space-y-6">
            <TwoFactorAuth
              twoFactorEnabled={userProfile.twoFactorEnabled}
              onEnable={onEnable2FA}
              onDisable={onDisable2FA}
            />
          </div>
        )}

      </main>

      {/* Footer credit */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-[95%] xl:max-w-[92%] 2xl:max-w-[1600px] w-full mx-auto px-4 text-center space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Sistem Informasi Stok Darah PMI Kabupaten Soppeng © 2026
          </p>
          <p className="text-[10px] text-slate-400">
            Terintegrasi API Rumah Sakit & Layanan SMS Push Real-time
          </p>
        </div>
      </footer>

      {/* Interactive Simulated WhatsApp Toast Notification */}
      {waToast?.show && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[90%] md:w-full bg-white rounded-2xl shadow-2xl border-l-4 border-[#25D366] overflow-hidden animate-slide-in font-sans">
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 leading-tight">Menerima Pesan</h4>
                <p className="text-[10px] text-[#128C7E] font-bold leading-none mt-0.5">WhatsApp Web • Live Simulator</p>
              </div>
            </div>
            <button 
              onClick={() => setWaToast(null)}
              className="text-slate-400 hover:text-slate-600 font-bold p-1 transition-colors text-sm cursor-pointer"
              title="Tutup Notifikasi"
            >
              ✕
            </button>
          </div>

          {/* Body content */}
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 border border-red-400 font-bold text-xs font-display shadow-xs">
                PMI
              </div>
              <div className="bg-[#DCF8C6] text-slate-800 rounded-2xl rounded-tl-none p-3 text-[11px] leading-relaxed shadow-xs relative max-w-[85%]">
                <p className="font-bold text-[#075e54] text-[10px] mb-1">{waToast.sender}</p>
                <p className="whitespace-pre-line text-slate-800 font-medium">{waToast.message}</p>
                <div className="flex items-center justify-end gap-1 mt-1.5">
                  <span className="text-[9px] text-slate-400 font-semibold">{waToast.time}</span>
                  <span className="text-[10px] text-blue-500">✓✓</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={handleActionOnToast}
                className="flex-1 bg-[#128C7E] hover:bg-[#075e54] text-white font-bold text-[10px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Calendar size={12} />
                Jadwalkan Sesi
              </button>
              <a
                href={`https://wa.me/6281288990011?text=${encodeURIComponent(waToast.message.replace(/\*/g, ''))}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[10px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
              >
                <ExternalLink size={11} />
                Buka WA Asli
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
