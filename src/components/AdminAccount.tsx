import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, ShieldAlert, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';
import { AdminProfile } from '../types.ts';

interface AdminAccountProps {
  adminProfile: AdminProfile | null;
  onRefresh: () => Promise<void>;
}

export default function AdminAccount({ adminProfile, onRefresh }: AdminAccountProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync state with prop
  useEffect(() => {
    if (adminProfile) {
      setEmail(adminProfile.email);
    }
  }, [adminProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic Validation
    if (!email.trim()) {
      setError('Email admin tidak boleh kosong.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Format email tidak valid.');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setError('Password baru harus minimal 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi password tidak cocok.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: password || undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Akun admin berhasil diperbarui!');
        setPassword('');
        setConfirmPassword('');
        await onRefresh();
      } else {
        setError(result.error || 'Terjadi kesalahan saat menyimpan perubahan.');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="admin-account-container" className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Banner header */}
        <div className="bg-gradient-to-r from-[#C51A2E] to-[#E52E43] p-6 text-white relative">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
            <User size={120} />
          </div>
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Sistem Kredensial</span>
            <h3 className="font-display font-black text-xl tracking-tight uppercase">Pengaturan Akun Admin</h3>
            <p className="text-xs text-white/80 max-w-md">
              Kelola alamat email operasional dan kata sandi untuk mengamankan akses ke Sistem Informasi Stok Darah PMI Kabupaten Soppeng.
            </p>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Info Banner */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-xs text-slate-600">
            <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-slate-800">Perhatian Privasi & Keamanan:</strong>
              <p className="leading-relaxed">
                Penggantian kredensial akan berdampak langsung pada sesi masuk berikutnya. Pastikan Anda mencatat email dan password baru sebelum menekan tombol simpan.
              </p>
            </div>
          </div>

          {/* Error and Success banners */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-xs text-red-700 animate-shake">
              <AlertTriangle size={16} className="text-red-500 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-700">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span className="font-semibold">{success}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Username display-only */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username Default</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-sm font-semibold select-none">
                <User size={16} className="text-slate-400" />
                <span>{adminProfile?.username || 'admin'}</span>
                <span className="ml-auto text-[9px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">Sistem</span>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alamat Email Baru</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#C51A2E]/50 rounded-xl py-3 pl-11 pr-4 text-slate-700 text-sm focus:outline-hidden transition-all font-semibold"
                />
              </div>
              <span className="text-[10px] text-slate-400 block pl-1">Email aktif untuk korespondensi sistem dan pemulihan darurat.</span>
            </div>

            {/* Password section divider */}
            <div className="border-t border-slate-100 my-4 pt-4">
              <h4 className="font-display font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <KeyRound size={14} className="text-[#C51A2E]" />
                Ubah Kata Sandi (Opsional)
              </h4>
            </div>

            {/* Password Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="admin-password" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password Baru</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak diubah"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#C51A2E]/50 rounded-xl py-3 pl-11 pr-4 text-slate-700 text-sm focus:outline-hidden transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-confirm-password" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Konfirmasi Password Baru</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="admin-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#C51A2E]/50 rounded-xl py-3 pl-11 pr-4 text-slate-700 text-sm focus:outline-hidden transition-all font-semibold"
                  />
                </div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block pl-1">Minimal 6 karakter dengan kombinasi angka dan huruf disarankan.</span>
          </div>

          {/* Submit buttons */}
          <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
            <button
              id="btn-save-account"
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#C51A2E] hover:bg-[#A61424] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm shadow-[#C51A2E]/20 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
