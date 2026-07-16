import React, { useState } from 'react';
import { Lock, Check, ShieldAlert, KeyRound, ArrowRight, Smartphone } from 'lucide-react';

interface TwoFactorAuthProps {
  twoFactorEnabled: boolean;
  onEnable: (code: string) => Promise<boolean>;
  onDisable: () => Promise<void>;
}

export default function TwoFactorAuth({ twoFactorEnabled, onEnable, onDisable }: TwoFactorAuthProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Simulated static 2FA secret and QR Code image
  const dummySecret = 'K4YTMNSVONSWG4TF';
  const dummyQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/PMISoppeng:admin@utd-soppeng.id?secret=${dummySecret}&issuer=PMI%20Kabupaten%20Soppeng`;

  const handleStartSetup = () => {
    setShowWizard(true);
    setErrorMsg(null);
    setOtpCode('');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6 || isNaN(Number(otpCode))) {
      setErrorMsg('Kode OTP harus terdiri dari 6 digit angka.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    const success = await onEnable(otpCode);
    setIsVerifying(false);

    if (success) {
      setShowWizard(false);
    } else {
      setErrorMsg('Kode OTP salah atau kedaluwarsa. Silakan coba lagi.');
    }
  };

  return (
    <div id="two-factor-card" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 font-sans">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-red-100 text-[#C51A2E] rounded-xl">
            <Lock size={22} />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">Autentikasi Dua Faktor (2FA)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Amankan data sensitif dan akses administratif Anda dengan lapisan perlindungan ekstra.
            </p>
          </div>
        </div>

        <div>
          {twoFactorEnabled ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Check size={12} />
              Aktif
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
              Tidak Aktif
            </span>
          )}
        </div>
      </div>

      {!showWizard ? (
        <div className="bg-slate-50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-100">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="text-slate-400 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-semibold text-xs text-slate-700">
                {twoFactorEnabled ? 'Perlindungan Akun Maksimal' : 'Akun Anda Kurang Terlindungi'}
              </p>
              <p className="text-[11px] text-slate-500 max-w-md">
                {twoFactorEnabled
                  ? 'Setiap kali masuk ke dasbor administrator, Anda wajib menginput kode OTP 6-digit dari aplikasi otentikator Anda (Google Authenticator).'
                  : 'Aktifkan 2FA untuk memastikan hanya Anda yang memiliki hak akses untuk memperbarui database stok darah Kabupaten Soppeng.'}
              </p>
            </div>
          </div>

          <button
            id="btn-toggle-2fa"
            onClick={twoFactorEnabled ? onDisable : handleStartSetup}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              twoFactorEnabled
                ? 'bg-red-50 text-[#C51A2E] hover:bg-red-100 border border-red-100'
                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-sm'
            }`}
          >
            {twoFactorEnabled ? 'Nonaktifkan 2FA' : 'Aktifkan Sekarang'}
          </button>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
              <KeyRound size={16} className="text-[#C51A2E]" />
              Setup Google Authenticator
            </h4>
            <button
              id="btn-cancel-2fa"
              onClick={() => setShowWizard(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Step 1: Scan QR */}
            <div className="md:col-span-4 flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-slate-200/50">
              <img
                src={dummyQrCode}
                alt="2FA QR Code"
                referrerPolicy="no-referrer"
                className="w-36 h-36 border border-slate-100 rounded"
              />
              <span className="text-[10px] text-slate-400 mt-2 text-center">Scan QR Code dengan Google Authenticator</span>
            </div>

            {/* Step 2: Instructions */}
            <div className="md:col-span-8 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">Langkah Konfigurasi:</p>
                <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-200/40">
                  <li>Unduh aplikasi <strong className="text-slate-800">Google Authenticator</strong> di App Store atau Play Store.</li>
                  <li>Pilih opsi <strong className="text-slate-800">Scan QR Code</strong> pada aplikasi otentikator Anda.</li>
                  <li>Jika tidak dapat memindai, masukkan kode rahasia manual di bawah ini:
                    <div className="mt-1.5 flex items-center justify-between bg-slate-50 p-1.5 rounded border border-slate-200/60 font-mono text-[11px] text-[#C51A2E]">
                      <span className="font-bold tracking-wider select-all">{dummySecret}</span>
                      <span className="text-[9px] text-slate-400 px-1">SECRET KEY</span>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Step 3: Verification form */}
              <form onSubmit={handleVerify} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Masukkan Kode OTP 6-Digit untuk memverifikasi:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Smartphone size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      id="input-otp"
                      type="text"
                      maxLength={6}
                      placeholder="Contoh: 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#C51A2E] focus:ring-1 focus:ring-[#C51A2E]"
                      required
                    />
                  </div>
                  <button
                    id="btn-verify-otp"
                    type="submit"
                    disabled={isVerifying || otpCode.length !== 6}
                    className="bg-[#C51A2E] hover:bg-red-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Verifikasi
                    <ArrowRight size={12} />
                  </button>
                </div>
                {errorMsg && (
                  <p className="text-[10px] text-[#C51A2E] font-semibold">{errorMsg}</p>
                )}
                <p className="text-[9px] text-slate-400">
                  *Untuk kemudahan demo, Anda dapat memasukkan kombinasi angka 6-digit apa pun (misal: <strong className="text-slate-500 font-mono">123456</strong>).
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
