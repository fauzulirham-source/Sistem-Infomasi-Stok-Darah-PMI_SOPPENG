import React, { useState, useEffect } from 'react';
import {
  Bell, Check, AlertCircle, Calendar, PlusCircle, LayoutDashboard, Droplets, LogOut,
  ChevronRight, Lock, User, Smartphone, Sparkles, MapPin, Activity, Menu, X
} from 'lucide-react';
import { BloodStock, DonationRecord, DonorSchedule, Hospital, NotificationItem, UserProfile, BloodGroup, AdminProfile } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import AdminStockManagement from './components/AdminStockManagement.tsx';
import AdminAddStock from './components/AdminAddStock.tsx';
import AdminSchedule from './components/AdminSchedule.tsx';
import PublicStock from './components/PublicStock.tsx';
import AdminAccount from './components/AdminAccount.tsx';

export default function App() {
  // Global States synced with server
  const [stocks, setStocks] = useState<BloodStock[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [schedules, setSchedules] = useState<DonorSchedule[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<{ active: boolean; url: string | null; message: string }>({
    active: false,
    url: null,
    message: 'Memeriksa koneksi database...'
  });

  // Layout & Navigation States
  const [isPublicView, setIsPublicView] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard'); // dashboard, stok, tambah, jadwal
  const [editingStock, setEditingStock] = useState<BloodStock | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show2FAPrompt, setShow2FAPrompt] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // UI elements
  const [showNotificationTray, setShowNotificationTray] = useState(false);

  // Fetch initial data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stockRes, donationRes, scheduleRes, hospitalRes, notificationRes, userRes, adminRes, statusRes] = await Promise.all([
        fetch('/api/stock'),
        fetch('/api/donations'),
        fetch('/api/schedules'),
        fetch('/api/hospitals'),
        fetch('/api/notifications'),
        fetch('/api/user/profile'),
        fetch('/api/admin/profile'),
        fetch('/api/supabase/status')
      ]);

      const [stockData, donationData, scheduleData, hospitalData, notificationData, userData, adminData, statusData] = await Promise.all([
        stockRes.json(),
        donationRes.json(),
        scheduleRes.json(),
        hospitalRes.json(),
        notificationRes.json(),
        userRes.json(),
        adminRes.json(),
        statusRes.json()
      ]);

      setStocks(stockData);
      setDonations(donationData);
      setSchedules(scheduleData);
      setHospitals(hospitalData);
      setNotifications(notificationData);
      setUserProfile(userData);
      setAdminProfile(adminData);
      setSupabaseStatus(statusData);
    } catch (err) {
      console.error('Error fetching data from API backend:', err);
    }
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const targetUsername = adminProfile?.username || 'admin';
    const targetEmail = adminProfile?.email || 'admin@utd-soppeng.id';
    const targetPassword = adminProfile?.password || 'pmi2026';

    if ((username === targetUsername || username === targetEmail) && password === targetPassword) {
      // Credentials correct. Check if 2FA is active
      if (userProfile?.twoFactorEnabled) {
        setShow2FAPrompt(true);
      } else {
        setIsLoggedIn(true);
        setIsPublicView(false);
        setAdminTab('dashboard');
        // Clear login fields
        setUsername('');
        setPassword('');
      }
    } else {
      setLoginError(`Kredensial salah. Silakan periksa kembali username/email dan password Anda.`);
    }
  };

  // 2FA login verification
  const handleVerifyLogin2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginOtpCode.length === 6 && !isNaN(Number(loginOtpCode))) {
      setIsLoggedIn(true);
      setIsPublicView(false);
      setShow2FAPrompt(false);
      setAdminTab('dashboard');
      setUsername('');
      setPassword('');
      setLoginOtpCode('');
      setLoginError(null);
    } else {
      setLoginError('Kode OTP tidak valid. Harus 6 digit angka.');
    }
  };

  // Log out admin
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsPublicView(true);
    setShow2FAPrompt(false);
    setLoginOtpCode('');
  };

  // API operations called by subcomponents

  // 1. Add or Update blood stock
  const handleSaveStock = async (data: {
    bloodType: BloodGroup;
    bags: number;
    volume: number;
    notes?: string;
  }) => {
    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        // Refetch all to keep in sync
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Delete/reset stock
  const handleDeleteStock = async (bloodType: BloodGroup) => {
    if (confirm(`Apakah Anda yakin ingin menyetel ulang stok ${bloodType} ke 0?`)) {
      try {
        const response = await fetch(`/api/stock/${encodeURIComponent(bloodType)}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          await fetchData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 3. Register donor appointment schedule
  const handleAddSchedule = async (data: {
    donorName: string;
    phone: string;
    email: string;
    bloodType: BloodGroup;
    appointmentDate: string;
    appointmentTime: string;
    notes?: string;
  }) => {
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        await fetchData();
      } else {
        throw new Error(result.error || 'Gagal menyimpan jadwal donor ke database/Supabase');
      }
    } catch (err) {
      console.error('Error adding schedule:', err);
      throw err;
    }
  };

  // 3b. Delete/cancel donor appointment schedule
  const handleDeleteSchedule = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin membatalkan jadwal donor ini?')) {
      try {
        const response = await fetch(`/api/schedules/${id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (response.ok && result.success) {
          await fetchData();
        } else {
          throw new Error(result.error || 'Gagal membatalkan jadwal');
        }
      } catch (err) {
        console.error('Error cancelling schedule:', err);
      }
    }
  };

  // 4. Record new donation
  const handleAddDonation = async (data: {
    donorName: string;
    phone: string;
    email: string;
    bloodType: BloodGroup;
    bags: number;
    volume: number;
    location: string;
    notes?: string;
  }) => {
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        await fetchData();
      } else {
        throw new Error(result.error || 'Gagal merekam donasi baru');
      }
    } catch (err) {
      console.error('Error adding donation:', err);
      throw err;
    }
  };

  // 5. Trigger hospital sync simulation
  const handleSyncAllHospitals = async () => {
    try {
      const response = await fetch('/api/hospitals/sync', {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        // Immediately fetch to catch the updated log
        setTimeout(async () => {
          await fetchData();
        }, 1300);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Enable 2FA on profile
  const handleEnable2FA = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const result = await response.json();
      if (result.success) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // 7. Disable 2FA on profile
  const handleDisable2FA = async () => {
    try {
      const response = await fetch('/api/user/2fa/disable', {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Mark single notification as read
  const handleMarkNotificationRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/read/${id}`, {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        setNotifications(result.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 9. Mark all notifications as read
  const handleMarkAllNotificationsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        setNotifications(result.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stats for login page left card
  const totalBagsAvailable = stocks.reduce((sum, s) => sum + s.bags, 0);

  // Render Public Page if selected
  if (isPublicView && userProfile) {
    return (
      <PublicStock
        stocks={stocks}
        donations={donations}
        schedules={schedules}
        hospitals={hospitals}
        notifications={notifications}
        userProfile={userProfile}
        onAdminLoginClick={() => setIsPublicView(false)}
        onAddSchedule={handleAddSchedule}
        onAddDonation={handleAddDonation}
        onDeleteSchedule={handleDeleteSchedule}
        onSyncAllHospitals={handleSyncAllHospitals}
        onEnable2FA={handleEnable2FA}
        onDisable2FA={handleDisable2FA}
        isLoggedIn={isLoggedIn}
      />
    );
  }

  // Render Admin Workspace (if logged in)
  if (isLoggedIn) {
    const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

    return (
      <div id="admin-layout" className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={adminTab}
          setActiveTab={(tab) => {
            setAdminTab(tab);
            setEditingStock(null);
            setIsSidebarOpen(false);
          }}
          onLogout={handleLogout}
          adminEmail={adminProfile?.email}
          supabaseStatus={supabaseStatus}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Right Content Column */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Navbar */}
          <header className="bg-white border-b border-slate-100 px-4 md:px-6 py-4 shrink-0 flex items-center justify-between z-30">
            <div className="flex items-center gap-3">
              {/* Hamburger menu for mobile/tablet */}
              <button
                id="btn-sidebar-toggle"
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl md:hidden cursor-pointer shrink-0"
                title="Buka Menu"
              >
                <Menu size={20} />
              </button>

              <h2 className="font-display font-black text-slate-800 text-sm sm:text-base md:text-lg uppercase tracking-tight truncate">
                {adminTab === 'dashboard' && 'Dashboard'}
                {adminTab === 'stok' && 'Manajemen Stok Darah'}
                {adminTab === 'tambah' && (editingStock ? 'Edit Stok Darah' : 'Tambah Stok Darah')}
                {adminTab === 'jadwal' && 'Kalender Jadwal Donor'}
                {adminTab === 'akun' && 'Pengaturan Akun Admin'}
              </h2>
            </div>

            <div className="flex items-center gap-4 relative">
              {/* Back to public view button */}
              <button
                id="btn-nav-public"
                onClick={() => setIsPublicView(true)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                Halaman Publik
              </button>

              {/* Real-time date display */}
              <span className="text-xs font-semibold text-slate-400 font-mono hidden md:inline">
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>

              {/* Notification icon & bell */}
              <div className="relative">
                <button
                  id="btn-toggle-notifications"
                  onClick={() => setShowNotificationTray(!showNotificationTray)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 border border-slate-200/60 relative cursor-pointer"
                >
                  <Bell size={16} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C51A2E] text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Tray */}
                {showNotificationTray && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 animate-fade-in">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-50">
                      <span className="font-bold text-xs text-slate-800">Notifikasi</span>
                      {unreadNotificationsCount > 0 && (
                        <button
                          id="btn-read-all-notifications"
                          onClick={handleMarkAllNotificationsRead}
                          className="text-[10px] font-bold text-[#C51A2E] hover:underline cursor-pointer"
                        >
                          Tandai semua dibaca
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 text-xs transition-colors hover:bg-slate-50/50 flex items-start gap-2.5 ${
                            !notif.isRead ? 'bg-red-50/10' : ''
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            notif.type === 'danger' ? 'bg-red-500' : notif.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          <div className="flex-1 space-y-0.5">
                            <h5 className="font-bold text-slate-800">{notif.title}</h5>
                            <p className="text-slate-500 leading-normal">{notif.message}</p>
                            <span className="block text-[9px] text-slate-400">
                              {new Date(notif.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA
                            </span>
                          </div>
                          {!notif.isRead && (
                            <button
                              id={`btn-read-notif-${notif.id}`}
                              onClick={() => handleMarkNotificationRead(notif.id)}
                              className="text-[10px] text-slate-400 hover:text-slate-600 font-bold px-1"
                              title="Tandai dibaca"
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Tab Content Router */}
          <main className="flex-1 p-6 overflow-y-auto">
            {adminTab === 'dashboard' && (
              <AdminDashboard
                stocks={stocks}
                donations={donations}
                schedules={schedules}
                hospitals={hospitals}
                setActiveTab={setAdminTab}
              />
            )}

            {adminTab === 'stok' && (
              <AdminStockManagement
                stocks={stocks}
                onAddStockClick={() => {
                  setEditingStock(null);
                  setAdminTab('tambah');
                }}
                onEditStockClick={(stock) => {
                  setEditingStock(stock);
                  setAdminTab('tambah');
                }}
                onDeleteStockClick={handleDeleteStock}
              />
            )}

            {adminTab === 'tambah' && (
              <AdminAddStock
                editingStock={editingStock}
                onSave={handleSaveStock}
                onCancel={() => {
                  setEditingStock(null);
                  setAdminTab('stok');
                }}
              />
            )}

            {adminTab === 'jadwal' && (
              <AdminSchedule schedules={schedules} onDeleteSchedule={handleDeleteSchedule} />
            )}

            {adminTab === 'akun' && (
              <AdminAccount
                adminProfile={adminProfile}
                onRefresh={async () => {
                  await fetchData();
                }}
              />
            )}
          </main>
        </div>
      </div>
    );
  }

  // Render Login Welcome Screen (Screen 1)
  return (
    <div id="login-layout" className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Left Red Information Panel */}
      <div className="w-full md:w-5/12 bg-[#C51A2E] text-white flex flex-col justify-between p-8 md:p-12 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center p-1 shadow border border-white shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M45 5H75V45H115V75H75V115H45V75H5V45H45V5Z" fill="#C51A2E" />
            </svg>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl leading-none">PMI</h2>
            <span className="text-xs text-white/80">Kabupaten Soppeng</span>
          </div>
        </div>

        <div className="space-y-8 my-auto py-10">
          <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight uppercase">
            Sistem Informasi<br />Stok Darah
          </h1>
          <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-md">
            Pantau ketersediaan stok darah secara real-time. Setiap kantong darah berarti satu kehidupan yang terselamatkan.
          </p>

          <div className="w-24 h-1.5 bg-white/30 rounded-full"></div>

          {/* Mini Counter Stats from Screenshot 1 */}
          <div className="flex items-center justify-between gap-4 pt-4 max-w-md">
            <div>
              <span className="font-display font-black text-2xl md:text-3xl block">{totalBagsAvailable}</span>
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Kantong Tersedia</span>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <span className="font-display font-black text-2xl md:text-3xl block">12</span>
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Donor Hari Ini</span>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <span className="font-display font-black text-2xl md:text-3xl block">8</span>
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Golongan Darah</span>
            </div>
          </div>
        </div>

        {/* Footer address info from Screen 1 */}
        <div className="text-[10px] text-white/60 space-y-1">
          <p className="font-bold uppercase tracking-wider text-white">PMI Kabupaten Soppeng</p>
          <p>Jl. Kemakmuran No. 7, Watansoppeng, Sulawesi Selatan, Indonesia</p>
        </div>
      </div>

      {/* Right Login / 2FA Verification Form */}
      <div className="w-full md:w-7/12 bg-slate-50 flex flex-col justify-center items-center p-4 md:p-16 relative overflow-hidden">
        {/* Blurred Background Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/src/assets/images/pmi_bg_1783933548295.jpg"
            alt="PMI Volunteer Background"
            className="w-full h-full object-cover filter blur-lg scale-110 opacity-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white/50 to-slate-100/90"></div>
        </div>

        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl border border-white/80 space-y-8">
          
          {!show2FAPrompt ? (
            // Standard Admin Login Form
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-black text-2xl text-slate-800 tracking-tight">Masuk Admin</h2>
                <p className="text-xs text-slate-400 mt-1">Masukkan kredensial Anda untuk melanjutkan</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Username</label>
                  <input
                    id="login-username"
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#C51A2E]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#C51A2E]"
                    required
                  />
                </div>



                {loginError && (
                  <p className="text-xs text-[#C51A2E] font-semibold">{loginError}</p>
                )}

                <button
                  id="btn-login-submit"
                  type="submit"
                  className="w-full bg-[#C51A2E] hover:bg-red-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  Masuk
                  <ChevronRight size={14} />
                </button>
              </form>
            </div>
          ) : (
            // Two-Factor Authentication Verification code prompt
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-red-100 text-[#C51A2E] rounded-xl shrink-0 mt-1">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-slate-800 tracking-tight">Verifikasi Dua Faktor (2FA)</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">
                    Keamanan 2FA aktif untuk akun Anda. Masukkan kode 6-digit dari Google Authenticator untuk menyelesaikan login.
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyLogin2FA} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Kode Verifikasi OTP</label>
                  <input
                    id="login-otp-code"
                    type="text"
                    maxLength={6}
                    placeholder="Contoh: 123456"
                    value={loginOtpCode}
                    onChange={(e) => setLoginOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-mono font-bold tracking-widest text-center focus:outline-none focus:border-[#C51A2E]"
                    required
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-[#C51A2E] font-semibold">{loginError}</p>
                )}

                <p className="text-[10px] text-slate-400 leading-normal">
                  *Untuk kemudahan demo, Anda dapat memasukkan kombinasi angka 6-digit apa pun (misal: <strong className="text-slate-500 font-mono">123456</strong>).
                </p>

                <div className="flex gap-3">
                  <button
                    id="btn-login-2fa-cancel"
                    type="button"
                    onClick={() => {
                      setShow2FAPrompt(false);
                      setLoginOtpCode('');
                      setLoginError(null);
                    }}
                    className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-login-2fa-submit"
                    type="submit"
                    disabled={loginOtpCode.length !== 6}
                    className="flex-1 bg-[#C51A2E] hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer text-center"
                  >
                    Verifikasi
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Public Portal Link */}
          <div className="pt-6 border-t border-slate-100 text-center">
            <button
              id="btn-view-public"
              onClick={() => setIsPublicView(true)}
              className="text-xs text-slate-500 hover:text-slate-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Lihat informasi stok publik →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
