import React from 'react';
import { Award, Shield, Heart, Sparkles, Droplet, CheckCircle, Lock } from 'lucide-react';
import { Badge } from '../types.js';

interface GamificationBadgesProps {
  userBadges: string[]; // List of unlocked badge IDs
  totalDonations: number;
  totalVolume: number;
}

export default function GamificationBadges({ userBadges, totalDonations, totalVolume }: GamificationBadgesProps) {
  const allBadges: Badge[] = [
    {
      id: 'BDG-001',
      name: 'Pendonor Pemula',
      description: 'Diberikan setelah Anda berhasil menyelesaikan donor pertama kali.',
      icon: 'Droplet',
      color: 'bg-red-50 text-red-600 border-red-200'
    },
    {
      id: 'BDG-002',
      name: 'Ksatria Golongan B',
      description: 'Lencana kebanggaan bagi pemilik golongan darah B yang aktif mendonor.',
      icon: 'Shield',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      id: 'BDG-003',
      name: 'Pahlawan Kemanusiaan',
      description: 'Telah mendonorkan darah sebanyak 5 kali di Kabupaten Soppeng.',
      icon: 'Heart',
      color: 'bg-rose-50 text-rose-600 border-rose-200'
    },
    {
      id: 'BDG-004',
      name: 'Pendonor Setia',
      description: 'Konsisten mendonorkan darah secara berkala minimal 3 kali.',
      icon: 'Sparkles',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    }
  ];

  // Helper to map icon name to Lucide components
  const getIconComponent = (name: string, size = 24) => {
    switch (name) {
      case 'Droplet': return <Droplet size={size} />;
      case 'Shield': return <Shield size={size} />;
      case 'Heart': return <Heart size={size} />;
      case 'Sparkles': return <Sparkles size={size} />;
      default: return <Award size={size} />;
    }
  };

  // Progress to next tier
  const nextTierTarget = 5;
  const progressPercent = Math.min((totalDonations / nextTierTarget) * 100, 100);

  return (
    <div id="gamification-card" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 font-sans">
      {/* Gamification header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-red-100 text-[#C51A2E] rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-800">Sistem Lencana Pendonor PMI</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kumpulkan lencana eksklusif sebagai wujud penghargaan atas aksi kemanusiaan Anda.
            </p>
          </div>
        </div>

        {/* Short Summary Stats */}
        <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 shrink-0">
          <div className="text-center px-2">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Donor</span>
            <span className="font-display font-bold text-base text-slate-800">{totalDonations} Sesi</span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="text-center px-2">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volume Darah</span>
            <span className="font-display font-bold text-base text-slate-800">{totalVolume} mL</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-700">
          <span>Menuju Lencana: Pahlawan Kemanusiaan</span>
          <span>{totalDonations} / {nextTierTarget} Donor</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#C51A2E] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-slate-400">
          Donasikan {nextTierTarget - totalDonations > 0 ? nextTierTarget - totalDonations : 0} kali lagi untuk membuka lencana bergengsi berikutnya.
        </p>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {allBadges.map((badge) => {
          const isUnlocked = userBadges.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-3 transition-all relative overflow-hidden ${
                isUnlocked
                  ? `${badge.color.split(' ')[2] || 'border-slate-100'} bg-white shadow-sm`
                  : 'bg-slate-50/50 border-slate-100 opacity-60'
              }`}
            >
              {/* Unlock Indicator Icon */}
              <div className="absolute top-2.5 right-2.5">
                {isUnlocked ? (
                  <CheckCircle size={14} className="text-emerald-500" />
                ) : (
                  <Lock size={12} className="text-slate-400" />
                )}
              </div>

              {/* Badge Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-sm border ${
                  isUnlocked ? badge.color.split(' ').slice(0, 2).join(' ') : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}
              >
                {getIconComponent(badge.icon, 20)}
              </div>

              {/* Text Info */}
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-800">{badge.name}</h4>
                <p className="text-[10px] text-slate-500 leading-normal line-clamp-2 px-1">{badge.description}</p>
              </div>

              {/* Unlocked Date Tag */}
              {isUnlocked ? (
                <span className="inline-block px-2 py-0.5 bg-slate-50 border border-slate-100 text-[9px] font-semibold text-slate-500 rounded">
                  Dibuka
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 bg-slate-100 text-[9px] font-semibold text-slate-400 rounded">
                  Terkunci
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
