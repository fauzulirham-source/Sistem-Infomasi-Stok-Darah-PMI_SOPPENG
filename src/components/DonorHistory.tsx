import React, { useState } from 'react';
import { BookOpen, Check, Award, Heart, Smartphone, Calendar, MapPin, Plus, List, BarChart3, Clock, HelpCircle, User } from 'lucide-react';
import { DonationRecord, DonorSchedule, BloodGroup } from '../types.js';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DonorHistoryProps {
  donations: DonationRecord[];
  schedules?: DonorSchedule[];
  userEmail: string;
  userName: string;
  userBloodType: string;
  onAddDonation: (data: {
    donorName: string;
    phone: string;
    email: string;
    bloodType: BloodGroup;
    bags: number;
    volume: number;
    location: string;
    notes?: string;
  }) => Promise<void>;
  onDeleteSchedule?: (id: string) => Promise<void>;
}

export default function DonorHistory({
  donations = [],
  schedules = [],
  userEmail = '',
  userName = '',
  userBloodType = '',
  onAddDonation,
  onDeleteSchedule
}: DonorHistoryProps) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [bagsCount, setBagsCount] = useState('1');
  const [locationStr, setLocationStr] = useState('Gudang Utama UTD PMI Soppeng');
  const [notesStr, setNotesStr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for donor details
  const [inputDonorName, setInputDonorName] = useState(userName || '');
  const [inputDonorEmail, setInputDonorEmail] = useState(userEmail || '');
  const [inputDonorBloodType, setInputDonorBloodType] = useState<BloodGroup>((userBloodType as BloodGroup) || 'A+');
  const [inputDonorPhone, setInputDonorPhone] = useState('0812-3456-2026');

  // Synchronize with props when profile loads or changes
  React.useEffect(() => {
    if (userName) setInputDonorName(userName);
    if (userEmail) setInputDonorEmail(userEmail);
    if (userBloodType) setInputDonorBloodType((userBloodType as BloodGroup) || 'A+');
  }, [userName, userEmail, userBloodType]);

  // Filter donations belonging to this user safely
  const safeDonations = donations || [];
  const userDonations = safeDonations.filter ? safeDonations.filter(
    (d) => d && (d.email?.toLowerCase() === userEmail?.toLowerCase() || d.donorName?.toLowerCase() === userName?.toLowerCase())
  ) : [];

  const safeSchedules = schedules || [];
  const userSchedules = safeSchedules.filter ? safeSchedules.filter(
    (s) => s && (s.email?.toLowerCase() === userEmail?.toLowerCase() || s.donorName?.toLowerCase() === userName?.toLowerCase())
  ) : [];

  const totalBags = userDonations.reduce ? userDonations.reduce((sum, d) => sum + (d.bags || 0), 0) : 0;
  const totalVolume = userDonations.reduce ? userDonations.reduce((sum, d) => sum + (d.volume || 0), 0) : 0;

  // Group by month to build dynamic Recharts charts
  const monthlyDataMap: { [key: string]: number } = {
    'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'Mei': 0, 'Jun': 0, 'Jul': 0
  };

  userDonations.forEach(d => {
    const date = new Date(d.donationDate);
    const monthIndex = date.getMonth(); // 0-11
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const mName = months[monthIndex];
    if (mName in monthlyDataMap) {
      monthlyDataMap[mName] += d.volume;
    }
  });

  const chartData = Object.keys(monthlyDataMap).map(key => ({
    name: key,
    'Volume (mL)': monthlyDataMap[key]
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);

    try {
      await onAddDonation({
        donorName: inputDonorName,
        phone: inputDonorPhone,
        email: inputDonorEmail,
        bloodType: inputDonorBloodType,
        bags: Number(bagsCount),
        volume: Number(bagsCount) * 250,
        location: locationStr,
        notes: notesStr
      });

      setSuccessMsg('Riwayat donor Anda berhasil dicatat! Lencana Anda diperbarui.');
      setBagsCount('1');
      setNotesStr('');
      setTimeout(() => {
        setShowLogModal(false);
        setSuccessMsg(null);
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="donor-history-container" className="space-y-6 font-sans">
      {/* Overview Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* User Card */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 text-[#C51A2E] rounded-full flex items-center justify-center font-display font-black text-xl border border-red-200">
              {userBloodType}
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-800 leading-snug">{userName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{userEmail}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-red-50 text-red-600 font-bold text-[10px] rounded border border-red-100">
                GOLONGAN DARAH {userBloodType}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Pendonor</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Aktif & Memenuhi Syarat
              </span>
            </div>
            <button
              id="btn-log-donation"
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-1 px-3.5 py-2 bg-[#C51A2E] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer hover:shadow"
            >
              <Plus size={14} />
              Catat Sesi Donor
            </button>
          </div>
        </div>

        {/* Analytic Chart */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
              <BarChart3 size={16} className="text-[#C51A2E]" />
              Analisis Tren Partisipasi Pribadi
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold">Total Volume: {totalVolume} mL</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C51A2E" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#C51A2E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="Volume (mL)" stroke="#C51A2E" strokeWidth={2} fillOpacity={1} fill="url(#userVolumeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Agenda Jadwal Donor Anda */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h4 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
          <Calendar size={18} className="text-[#C51A2E]" />
          Agenda Jadwal Sesi Donor Anda (Koneksi Supabase Cloud Live)
        </h4>

        {userSchedules.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl space-y-2">
            <Calendar size={24} className="text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Belum ada agenda jadwal donor mendatang yang tercatat.</p>
            <p className="text-[10px] text-slate-400">Silakan buat jadwal kunjungan baru pada halaman utama!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userSchedules.map((s) => (
              <div key={s.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-slate-50/50 -mx-4 px-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-red-50 text-[#C51A2E] rounded-xl border border-red-100 shrink-0 mt-0.5">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">{s.appointmentDate} • Pukul {s.appointmentTime}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-semibold">Golongan Darah {s.bloodType}</span>
                    </div>
                    {s.notes && <p className="text-xs text-slate-500 mt-1 italic">"{s.notes}"</p>}
                    <span className="text-[10px] text-slate-400 font-medium block mt-1 flex items-center gap-1">
                      ID Jadwal: {s.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    s.status === 'Selesai'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : s.status === 'Batal'
                      ? 'bg-red-50 text-red-600 border-red-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {s.status === 'Menunggu' ? 'Menunggu Persetujuan' : s.status}
                  </span>
                  {s.status === 'Menunggu' && onDeleteSchedule && (
                    <button
                      id={`btn-cancel-sched-${s.id}`}
                      onClick={() => onDeleteSchedule(s.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline transition-colors cursor-pointer"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donation History List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h4 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
          <List size={18} className="text-slate-500" />
          Histori Riwayat Donasi Anda
        </h4>

        {userDonations.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl space-y-2">
            <Heart size={28} className="text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Belum ada riwayat donor tercatat atas email Anda.</p>
            <p className="text-[10px] text-slate-400">Silakan catat donor pertama Anda di tombol kanan atas!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userDonations.map((d) => (
              <div key={d.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-slate-50/50 -mx-4 px-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-red-50 text-[#C51A2E] rounded-xl border border-red-100 shrink-0 mt-0.5">
                    <Heart size={16} />
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{d.bags} Kantong ({d.volume} mL)</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold">
                          Gol. {d.bloodType}
                        </span>
                      </div>
                      <span className="hidden sm:inline text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        {d.location}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-700 font-sans">Pendonor:</span> {d.donorName} <span className="text-slate-400">•</span> <span className="italic text-slate-400">{d.email || 'Tanpa Email'}</span>
                    </div>
                    {d.notes && <p className="text-xs text-slate-500 mt-1 italic">"{d.notes}"</p>}
                    <span className="text-[10px] text-slate-400 font-medium block mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(d.donationDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WITA
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Check size={10} />
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Donation Modal Popup */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-base text-slate-800">Catat Riwayat Donor Baru</h3>
              <button
                id="btn-close-log-modal"
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {successMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl space-y-2 text-center py-8">
                <Check size={32} className="text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm">Berhasil Disimpan!</h4>
                <p className="text-xs">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Donor Name & Blood Type in 2-column layout */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Nama Pendonor *</label>
                    <input
                      id="input-log-name"
                      type="text"
                      required
                      placeholder="Nama lengkap"
                      value={inputDonorName}
                      onChange={(e) => setInputDonorName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Golongan Darah *</label>
                    <select
                      id="select-log-bloodtype"
                      value={inputDonorBloodType}
                      onChange={(e) => setInputDonorBloodType(e.target.value as BloodGroup)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E]"
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
                </div>

                {/* Email & Phone in 2-column layout */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Email Pendonor *</label>
                    <input
                      id="input-log-email"
                      type="email"
                      required
                      placeholder="nama@domain.com"
                      value={inputDonorEmail}
                      onChange={(e) => setInputDonorEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Nomor Telepon *</label>
                    <input
                      id="input-log-phone"
                      type="text"
                      required
                      placeholder="0812-xxxx-xxxx"
                      value={inputDonorPhone}
                      onChange={(e) => setInputDonorPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E]"
                    />
                  </div>
                </div>

                {/* Bags count */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Jumlah Kantong (250 mL per kantong) *</label>
                  <select
                    id="select-log-bags"
                    value={bagsCount}
                    onChange={(e) => setBagsCount(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E]"
                  >
                    <option value="1">1 Kantong (250 mL)</option>
                    <option value="2">2 Kantong (500 mL)</option>
                  </select>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Lokasi Pelaksanaan *</label>
                  <input
                    id="input-log-location"
                    type="text"
                    required
                    placeholder="Contoh: UTD PMI Kabupaten Soppeng"
                    value={locationStr}
                    onChange={(e) => setLocationStr(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E]"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Catatan Tambahan (Opsional)</label>
                  <textarea
                    id="textarea-log-notes"
                    placeholder="Contoh: Kondisi sehat, donor rutin, tensi darah normal."
                    value={notesStr}
                    onChange={(e) => setNotesStr(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E] h-14 resize-none"
                  ></textarea>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    id="btn-log-cancel"
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-log-submit"
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#C51A2E] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Sesi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
