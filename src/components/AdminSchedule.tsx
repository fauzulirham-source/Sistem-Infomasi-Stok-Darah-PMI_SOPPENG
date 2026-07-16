import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Phone, Check, Trash2 } from 'lucide-react';
import { DonorSchedule } from '../types.js';

interface AdminScheduleProps {
  schedules: DonorSchedule[];
  onDeleteSchedule?: (id: string) => void;
}

export default function AdminSchedule({ schedules = [], onDeleteSchedule }: AdminScheduleProps) {
  // Get current date or default to July 2026 (the active month of submissions)
  const [currentDate, setCurrentDate] = useState(() => {
    // Default to July 2026 (index 6) for demo consistency, or use current date if schedules are in July
    return new Date(2026, 6, 1);
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthName = `${monthNames[month]} ${year}`;

  // Get number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get first day of month offset
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-based start index (Monday=0, Tuesday=1 ... Sunday=6)
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Build grid blocks
  const calendarCells = [];
  
  // 1. Empty cells for leading offset
  for (let i = 0; i < startOffset; i++) {
    calendarCells.push({
      day: null,
      dateString: '',
      events: [] as DonorSchedule[]
    });
  }

  // 2. Days of the current month
  const safeSchedules = schedules || [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const daySchedules = safeSchedules.filter
      ? safeSchedules.filter(s => s && s.appointmentDate === dateStr && s.status !== 'Batal')
      : [];
    calendarCells.push({
      day: i,
      dateString: dateStr,
      events: daySchedules
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const upcomingSchedules = safeSchedules.filter ? safeSchedules.filter(s => s && s.status === 'Menunggu') : [];

  return (
    <div id="admin-schedule-view" className="space-y-6 font-sans">
      
      {/* Calendar card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">{monthName}</h3>
            <p className="text-xs text-slate-400">Jadwal donor darah bulan ini</p>
          </div>
          <div className="flex gap-1">
            <button 
              id="btn-cal-prev" 
              onClick={handlePrevMonth}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              id="btn-cal-next" 
              onClick={handleNextMonth}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1 border-b border-slate-50">
          <span>Sen</span>
          <span>Sel</span>
          <span>Rab</span>
          <span>Kam</span>
          <span>Jum</span>
          <span>Sab</span>
          <span>Min</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarCells.map((cell, idx) => {
            const hasEvents = cell.events.length > 0;
            if (cell.day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[72px] p-2 rounded-xl border border-transparent bg-slate-50/5 opacity-20"
                />
              );
            }
            return (
              <div
                key={`day-${cell.day}-${month}`}
                className={`min-h-[72px] p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                  hasEvents
                    ? 'border-red-100 bg-red-50/10'
                    : 'border-slate-100 bg-slate-50/30'
                }`}
              >
                <span className={`text-[10px] font-bold ${hasEvents ? 'text-[#C51A2E]' : 'text-slate-400'}`}>
                  {cell.day}
                </span>

                {/* Event mini logs */}
                {hasEvents && (
                  <div className="space-y-1">
                    {cell.events.map((evt) => (
                      <div
                        key={evt.id}
                        className="bg-[#C51A2E] text-white p-1 rounded text-[9px] font-bold leading-none truncate flex items-center justify-between animate-fade-in"
                        title={`${evt.donorName} (${evt.bloodType}) pada ${evt.appointmentTime}`}
                      >
                        <span className="truncate">{evt.bloodType} {evt.appointmentTime}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming List card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
        <h4 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">Jadwal Mendatang</h4>
        
        {upcomingSchedules.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6">Tidak ada jadwal donor mendatang.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {upcomingSchedules.map((sched) => (
              <div
                key={sched.id}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-[#C51A2E] border border-red-100 flex items-center justify-center font-bold text-sm shrink-0 font-display">
                    {sched.bloodType}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-800">{sched.donorName}</h5>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone size={12} className="text-slate-400" />
                      {sched.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Appointment datetime */}
                  <div className="text-right sm:text-right text-slate-500">
                    <span className="text-xs font-bold block text-slate-700">{sched.appointmentTime}</span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {new Date(sched.appointmentDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                    Menunggu
                  </span>

                  {/* Delete Button */}
                  {onDeleteSchedule && (
                    <button
                      id={`btn-delete-schedule-${sched.id}`}
                      onClick={() => onDeleteSchedule(sched.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      title="Hapus Jadwal"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
