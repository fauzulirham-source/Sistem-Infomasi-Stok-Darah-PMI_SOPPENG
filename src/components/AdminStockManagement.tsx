import React, { useState } from 'react';
import { Search, Plus, Edit2 } from 'lucide-react';
import { BloodStock, BloodGroup } from '../types.js';

interface AdminStockManagementProps {
  stocks: BloodStock[];
  onAddStockClick: () => void;
  onEditStockClick: (stock: BloodStock) => void;
  onDeleteStockClick: (bloodType: BloodGroup) => void;
}

export default function AdminStockManagement({
  stocks = [],
  onAddStockClick,
  onEditStockClick,
  onDeleteStockClick
}: AdminStockManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  // Filter stocks based on query & selected status safely
  const safeStocks = stocks || [];
  const filteredStocks = safeStocks.filter ? safeStocks.filter((stock) => {
    if (!stock) return false;
    const matchesSearch = stock.bloodType ? stock.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const matchesStatus =
      statusFilter === 'Semua Status' || (stock.status ? stock.status.toLowerCase() === statusFilter.toLowerCase() : false);
    return matchesSearch && matchesStatus;
  }) : [];

  return (
    <div id="admin-stock-management" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6 font-sans">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:max-w-md">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              id="search-blood-groups"
              type="text"
              placeholder="Cari golongan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 pl-9 pr-4 py-2 text-xs border border-slate-200/60 rounded-xl focus:outline-none focus:border-[#C51A2E]"
            />
          </div>

          {/* Status filter */}
          <select
            id="filter-blood-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C51A2E]"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Aman">Aman</option>
            <option value="Rendah">Rendah</option>
            <option value="Kritis">Kritis</option>
          </select>
        </div>

        {/* Add Stock trigger */}
        <button
          id="btn-add-stock-admin"
          onClick={onAddStockClick}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#C51A2E] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Tambah Stok
        </button>
      </div>

      {/* Stocks Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              <th className="py-3 px-5">GOLONGAN</th>
              <th className="py-3 px-5">JUMLAH</th>
              <th className="py-3 px-5">VOLUME</th>
              <th className="py-3 px-5">STATUS</th>
              <th className="py-3 px-5">DIPERBARUI</th>
              <th className="py-3 px-5 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStocks.map((stock) => {
              const statusColors = {
                Aman: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
                Rendah: 'bg-amber-50 text-amber-600 border border-amber-100',
                Kritis: 'bg-red-50 text-[#C51A2E] border border-red-100'
              };

              return (
                <tr key={stock.bloodType} className="hover:bg-slate-50/50 transition-colors text-xs text-slate-700">
                  {/* Blood Type badge */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-[#C51A2E] flex items-center justify-center font-bold font-display border border-red-100">
                        {stock.bloodType}
                      </div>
                      <div>
                        <span className="font-bold block text-slate-800">{stock.bloodType}</span>
                        <span className="text-[10px] text-slate-400 font-mono">STK-00{stock.bloodType.charCodeAt(0) - 60}</span>
                      </div>
                    </div>
                  </td>

                  {/* Bags Count */}
                  <td className="py-4 px-5 font-semibold text-slate-800">
                    {stock.bags} kantong
                  </td>

                  {/* Volume */}
                  <td className="py-4 px-5 font-mono text-slate-500">
                    {stock.volume} mL
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColors[stock.status]}`}>
                      {stock.status}
                    </span>
                  </td>

                  {/* Updated At */}
                  <td className="py-4 px-5 text-slate-400">
                    {new Date(stock.updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                    {', '}
                    {new Date(stock.updatedAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        id={`btn-edit-${stock.bloodType}`}
                        onClick={() => onEditStockClick(stock)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Stok"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredStocks.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                  Tidak ada golongan darah yang cocok dengan kriteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
