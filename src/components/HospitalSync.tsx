import React, { useState } from 'react';
import { Activity, RefreshCw, AlertCircle, CheckCircle, MapPin, Hospital as HospitalIcon } from 'lucide-react';
import { Hospital, BloodGroup } from '../types.js';

interface HospitalSyncProps {
  hospitals: Hospital[];
  onSyncAll: () => Promise<void>;
}

export default function HospitalSync({ hospitals, onSyncAll }: HospitalSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Menghubungkan ke API RSUD & Puskesmas...');
    await onSyncAll();
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMsg('Sinkronisasi data real-time berhasil diselesaikan!');
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }, 1200);
  };

  const getStatusBadge = (status: Hospital['status']) => {
    switch (status) {
      case 'Aktif':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Terhubung (Real-time)
          </span>
        );
      case 'Sinkronisasi':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
            <RefreshCw size={12} className="animate-spin" />
            Sinkronisasi...
          </span>
        );
      case 'Terputus':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-100">
            Terputus
          </span>
        );
    }
  };

  return (
    <div id="hospital-sync-card" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-red-100 text-[#C51A2E] rounded-xl">
            <HospitalIcon size={24} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-800">Integrasi API Rumah Sakit</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sinkronisasi stok real-time untuk menyuplai kebutuhan darurat di Kabupaten Soppeng.
            </p>
          </div>
        </div>

        <button
          id="btn-sync-hospitals"
          onClick={handleSyncClick}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isSyncing
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow active:scale-95 cursor-pointer'
          }`}
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Menghubungkan...' : 'Sinkronisasi Sekarang'}
        </button>
      </div>

      {syncStatusMsg && (
        <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-100 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
          {syncStatusMsg}
        </div>
      )}

      {/* Hospital List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {hospitals.map((hospital) => (
          <div
            key={hospital.id}
            className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${
              hospital.status === 'Terputus'
                ? 'border-slate-100 bg-slate-50/50 opacity-75'
                : 'border-slate-100 bg-white hover:border-red-100 hover:shadow-sm'
            }`}
          >
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-sm text-slate-800 leading-snug line-clamp-1">{hospital.name}</h4>
                {getStatusBadge(hospital.status)}
              </div>
              <p className="text-[11px] text-slate-500 flex items-start gap-1 leading-normal">
                <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                {hospital.address} ({hospital.distance})
              </p>
            </div>

            {/* Blood needs status */}
            <div className="bg-slate-50/80 rounded-lg p-3 space-y-2 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Permintaan Darah Aktif</span>
              {(hospital.bloodRequest || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(hospital.bloodRequest || []).map((req, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-50 text-red-600 border border-red-100 text-xs font-semibold"
                    >
                      <span className="font-bold">{req.bloodType}</span>
                      <span className="text-[10px] text-red-400 font-normal">|</span>
                      <span>{req.bagsNeeded} Kantong</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">Tidak ada permintaan aktif.</p>
              )}
            </div>

            {/* Footer sync time */}
            <div className="text-[10px] text-slate-400 border-t border-slate-50 pt-2.5 flex justify-between">
              <span>Sistem API v1.2</span>
              <span>Terakhir Sinkron: {new Date(hospital.lastSync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
