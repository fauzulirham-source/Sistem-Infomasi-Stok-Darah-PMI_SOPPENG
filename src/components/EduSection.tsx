import React, { useState } from 'react';
import { BookOpen, CheckCircle, Info, Heart, Award, HelpCircle } from 'lucide-react';

export default function EduSection() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const benefits = [
    {
      title: 'Kesehatan Jantung',
      description: 'Membantu menurunkan risiko penyakit jantung dan memelihara kelenturan pembuluh darah.',
      color: 'bg-red-50 border-red-100 text-red-600',
    },
    {
      title: 'Pemberontakan Sel Darah Baru',
      description: 'Merangsang produksi sel darah merah baru, menjaga tubuh Anda tetap bugar dan aktif.',
      color: 'bg-rose-50 border-rose-100 text-rose-600',
    },
    {
      title: 'Deteksi Penyakit Dini',
      description: 'Setiap donor mendapatkan pemeriksaan gratis untuk tekanan darah, hemoglobin, dan penyakit menular.',
      color: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    },
    {
      title: 'Keseimbangan Zat Besi',
      description: 'Mengurangi kelebihan zat besi berlebih dalam tubuh yang dapat merusak hati dan pankreas.',
      color: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    }
  ];

  const requirements = [
    'Sehat jasmani dan rohani',
    'Usia 17 sampai dengan 65 Tahun',
    'Berat Minimal 45 Kg',
    'Tidur minimal 4 jam sebelum berdonor',
    'Makan sebelum menyumbangkan darah, Disarankan tidak menyumbangkan darah dalam keadaan perut kosong',
    'Minum lebih banyak air dari biasanya pada hari mendonorkan darah',
    'Interval donor 2 Bulan untuk pria, dan 3 Bulan untuk wanita'
  ];

  const faqs = [
    {
      q: 'Apakah donor darah sakit?',
      a: 'Rasa sakit yang dirasakan hanya sekejap seperti cubitan kecil saat jarum dimasukkan. Setelah itu, proses berjalan nyaman dan dikawal oleh tenaga medis PMI yang sangat berpengalaman.'
    },
    {
      q: 'Berapa banyak darah yang diambil sekali donor?',
      a: 'Umumnya berkisar antara 350 mL hingga 450 mL, tergantung pada berat badan dan kondisi kesehatan pendonor. Volume ini sekitar 8-10% dari total darah di dalam tubuh Anda, dan cairan tubuh akan pulih kembali dalam waktu 24-48 jam.'
    },
    {
      q: 'Apakah penderita hipertensi boleh donor?',
      a: 'Penderita hipertensi boleh mendonorkan darah asalkan tekanan darah mereka saat pemeriksaan memenuhi kriteria aman (di bawah 160/100 mmHg) dan tidak sedang mengonsumsi obat-obatan tertentu yang dilarang.'
    },
    {
      q: 'Apa yang harus dilakukan setelah donor darah?',
      a: 'Istirahat sejenak selama 10-15 menit, minum banyak air putih, konsumsi biskuit atau vitamin penambah darah yang disediakan petugas PMI, dan hindari aktivitas fisik yang sangat berat selama 24 jam.'
    }
  ];

  return (
    <div id="edu-section" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8 font-sans">
      {/* Educational Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-100 text-[#C51A2E] rounded-xl">
          <BookOpen size={24} />
        </div>
        <div>
          <h3 className="font-display font-bold text-xl text-slate-800">Edukasi Donor Darah</h3>
          <p className="text-sm text-slate-500 mt-1">
            Mendonorkan darah secara teratur adalah tindakan kepedulian yang luar biasa dan menyehatkan tubuh Anda sendiri.
          </p>
        </div>
      </div>

      {/* Grid: Benefits & Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Benefits of Blood Donation */}
        <div className="space-y-4">
          <h4 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
            <Heart size={18} className="text-[#C51A2E]" />
            Manfaat Kesehatan Bagi Pendonor
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${b.color.split(' ')[1]} ${b.color.split(' ')[0]} space-y-1`}>
                <h5 className="font-bold text-sm text-slate-800">{b.title}</h5>
                <p className="text-xs text-slate-600 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-4">
          <h4 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            Syarat Kelayakan Pendonor Darah
          </h4>
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3">
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-600 font-medium leading-normal">{req}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Accordion FAQs */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h4 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
          <HelpCircle size={18} className="text-indigo-500" />
          Mitos vs Fakta & Pertanyaan Umum
        </h4>
        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-100 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  id={`faq-btn-${idx}`}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100/50 flex items-center justify-between transition-colors focus:outline-none"
                >
                  <span className="font-semibold text-sm text-slate-700">{faq.q}</span>
                  <span className="text-xs text-slate-400 font-bold">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action Quote */}
      <div className="bg-red-50/50 border border-red-100/60 rounded-xl p-4 flex items-start gap-3">
        <Info size={16} className="text-[#C51A2E] mt-0.5 shrink-0" />
        <p className="text-xs text-slate-600 italic">
          "Satu kantong darah dari Anda dapat menyelamatkan hingga tiga nyawa sekaligus. Jadilah bagian dari pahlawan kemanusiaan di Kabupaten Soppeng."
        </p>
      </div>
    </div>
  );
}
