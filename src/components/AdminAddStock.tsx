import React, { useState, useEffect } from 'react';
import { Calendar, HelpCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { BloodStock, BloodGroup } from '../types.js';

interface AdminAddStockProps {
  editingStock: BloodStock | null;
  onSave: (data: {
    bloodType: BloodGroup;
    bags: number;
    volume: number;
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function AdminAddStock({ editingStock, onSave, onCancel }: AdminAddStockProps) {
  // Parsing editingStock if it exists (e.g. A+ => base "A", rhesus "Rh+")
  const getInitialBaseType = (type: BloodGroup | null): string => {
    if (!type) return 'A';
    if (type.startsWith('AB')) return 'AB';
    return type[0];
  };

  const getInitialRh = (type: BloodGroup | null): 'Rh+' | 'Rh-' => {
    if (!type) return 'Rh+';
    return type.endsWith('-') ? 'Rh-' : 'Rh+';
  };

  const [baseType, setBaseType] = useState('A');
  const [rhesus, setRhesus] = useState<'Rh+' | 'Rh-'>('Rh+');
  const [bags, setBags] = useState(editingStock ? editingStock.bags.toString() : '');
  const [donorDate, setDonorDate] = useState('2026-06-27');
  const [expiryDate, setExpiryDate] = useState('2026-08-01');
  const [donorId, setDonorId] = useState('UTD-DNR-2026-XXXX');
  const [storageLoc, setStorageLoc] = useState('Gudang Utama UTD PMI Soppeng');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync state if editing stock changes
  useEffect(() => {
    if (editingStock) {
      const bType = getInitialBaseType(editingStock.bloodType);
      const rh = getInitialRh(editingStock.bloodType);
      setBaseType(bType);
      setRhesus(rh);
      setBags(editingStock.bags.toString());
    } else {
      setBaseType('A');
      setRhesus('Rh+');
      setBags('');
    }
  }, [editingStock]);

  // Handle donor date change to automatically calculate expiry date (+35 days)
  useEffect(() => {
    if (donorDate) {
      const dateObj = new Date(donorDate);
      dateObj.setDate(dateObj.getDate() + 35);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      setExpiryDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [donorDate]);

  // Compute final combined BloodGroup string
  const getCombinedGroup = (): BloodGroup => {
    const rhSuffix = rhesus === 'Rh+' ? '+' : '-';
    return `${baseType}${rhSuffix}` as BloodGroup;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      const finalGroup = getCombinedGroup();
      const bagsNum = Number(bags || 0);
      const volNum = bagsNum * 250; // standard 250 mL per bag

      await onSave({
        bloodType: finalGroup,
        bags: bagsNum,
        volume: volNum,
        notes: notes || undefined
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onCancel(); // return to stock table
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="admin-add-stock-view" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6 font-sans max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          id="btn-back-add-stock"
          onClick={onCancel}
          className="p-1.5 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h3 className="font-display font-bold text-lg text-slate-800">
            {editingStock ? 'Edit Stok Darah' : 'Tambah Stok Darah Baru'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Lengkapi semua informasi yang diperlukan</p>
        </div>
      </div>

      {success ? (
        <div className="p-6 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-center space-y-2 py-10">
          <CheckCircle size={36} className="text-emerald-500 mx-auto" />
          <h4 className="font-bold text-sm">Berhasil Disimpan!</h4>
          <p className="text-xs">Database stok darah PMI Kabupaten Soppeng telah diperbarui secara real-time.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Golongan Darah */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Golongan Darah *</label>
              <select
                id="select-add-base"
                value={baseType}
                onChange={(e) => setBaseType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#C51A2E]"
                required
              >
                <option value="A">Golongan A</option>
                <option value="B">Golongan B</option>
                <option value="AB">Golongan AB</option>
                <option value="O">Golongan O</option>
              </select>
            </div>

            {/* Rhesus */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Rhesus *</label>
              <div className="flex gap-2 h-[38px]">
                <button
                  id="btn-rh-pos"
                  type="button"
                  onClick={() => setRhesus('Rh+')}
                  className={`flex-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    rhesus === 'Rh+'
                      ? 'bg-[#C51A2E] text-white border-[#C51A2E]'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Rh+
                </button>
                <button
                  id="btn-rh-neg"
                  type="button"
                  onClick={() => setRhesus('Rh-')}
                  className={`flex-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    rhesus === 'Rh-'
                      ? 'bg-[#C51A2E] text-white border-[#C51A2E]'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Rh-
                </button>
              </div>
            </div>

            {/* Informational preview */}
            <div className="sm:col-span-2 p-3.5 bg-red-50/50 rounded-xl border border-red-100/40 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-red-100 text-[#C51A2E] flex items-center justify-center font-bold text-xs">
                {getCombinedGroup()}
              </span>
              <div>
                <span className="font-bold text-xs block text-slate-800">Golongan Darah {getCombinedGroup()}</span>
                <span className="text-[10px] text-slate-500">Pratinjau data yang akan disimpan</span>
              </div>
            </div>

            {/* Jumlah Kantong */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Jumlah Kantong *</label>
              <div className="flex gap-2">
                <input
                  id="input-add-bags"
                  type="number"
                  placeholder="Masukkan jumlah kantong"
                  value={bags}
                  onChange={(e) => setBags(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E]"
                  required
                />
                <div className="bg-slate-100 border border-slate-200/60 rounded-xl px-4 py-2 text-xs text-slate-500 flex items-center shrink-0">
                  = {Number(bags || 0) * 250} mL
                </div>
              </div>
            </div>

            {/* Storage Loc */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Lokasi Penyimpanan *</label>
              <select
                id="select-add-loc"
                value={storageLoc}
                onChange={(e) => setStorageLoc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#C51A2E]"
                required
              >
                <option value="Gudang Utama UTD PMI Soppeng">Gudang Utama UTD PMI Soppeng</option>
                <option value="Refrigerator Unit A - Lalabata">Refrigerator Unit A - Lalabata</option>
                <option value="Mobile Unit Bus - Soppeng">Mobile Unit Bus - Soppeng</option>
              </select>
            </div>

            {/* Tanggal Donor */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Tanggal Donor *</label>
              <input
                id="input-add-date"
                type="date"
                value={donorDate}
                onChange={(e) => setDonorDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E]"
                required
              />
            </div>

            {/* Tanggal Kadaluarsa */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Tanggal Kadaluarsa</label>
              <input
                id="input-add-expiry"
                type="date"
                value={expiryDate}
                disabled
                className="w-full bg-slate-100 border border-slate-200/40 rounded-xl px-3 py-2 text-xs text-slate-400 font-medium select-none"
              />
              <span className="block text-[9px] text-slate-400 mt-1">Otomatis +35 hari dari tanggal donor</span>
            </div>

            {/* Donor ID */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">ID Pendonor / Batch Code</label>
              <input
                id="input-add-donorid"
                type="text"
                placeholder="ID Pendonor"
                value={donorId}
                onChange={(e) => setDonorId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#C51A2E]"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Catatan</label>
              <textarea
                id="textarea-add-notes"
                placeholder="Catatan tambahan (opsional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E] h-20 resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              id="btn-add-cancel"
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-add-submit"
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#C51A2E] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
