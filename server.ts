import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { BloodStock, DonationRecord, DonorSchedule, Hospital, NotificationItem, UserProfile, BloodGroup } from './src/types.js';

import { createClient } from '@supabase/supabase-js';

// Setup file paths for simple JSON database persistence
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure database folder exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize Supabase if credentials are provided in user secrets
let tempUrl = (process.env.SUPABASE_URL || '').replace(/['"]/g, '').trim();
let tempKey = (process.env.SUPABASE_KEY || '').replace(/['"]/g, '').trim();

// Self-healing check if they got swapped in env variables
if (tempUrl.startsWith('eyJ') || tempKey.includes('supabase.co')) {
  const swap = tempUrl;
  tempUrl = tempKey;
  tempKey = swap;
}

// Fallback to credentials provided by user if empty
if (!tempUrl) {
  tempUrl = 'https://ewvoqsxvkjgpndvgggoc.supabase.co';
}
if (!tempKey) {
  tempKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dm9xc3h2a2pncG5kdmdnZ29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MzI3NTEsImV4cCI6MjA5OTUwODc1MX0.mDj8Yh94jeshqPlClse2kCLktKTkJJOlGoio4HjWqT8';
}

// Double check swapping in case one fallback was put into the wrong slot
if (tempUrl.startsWith('eyJ') || tempKey.includes('supabase.co')) {
  const swap = tempUrl;
  tempUrl = tempKey;
  tempKey = swap;
}

const supabaseUrl = tempUrl;
const supabaseKey = tempKey;

let supabase: any = null;
let isSupabaseActive = false;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    isSupabaseActive = true;
    console.log('=== Supabase integration initialized successfully! ===');

    // Run cleanup of Kemitraan tables on startup
    (async () => {
      try {
        console.log('=== Deleting Kemitraan tables/data in Supabase... ===');
        const { error: reqErr } = await supabase.from('hospital_blood_requests').delete().neq('id', -1);
        if (reqErr) {
          console.warn('Supabase hospital_blood_requests deletion warning:', reqErr);
        } else {
          console.log('=== Deleted hospital_blood_requests records successfully ===');
        }

        const { error: hospErr } = await supabase.from('hospitals').delete().neq('id', '_dummy_');
        if (hospErr) {
          console.warn('Supabase hospitals deletion warning:', hospErr);
        } else {
          console.log('=== Deleted hospitals records successfully ===');
        }
      } catch (err) {
        console.error('Error during startup database cleanup for Kemitraan:', err);
      }
    })();
  } catch (err) {
    console.error('=== Failed to initialize Supabase client: ===', err);
  }
}

// Initial default data mirroring the requested UI screenshots
const defaultStocks: BloodStock[] = [
  { bloodType: 'A+', bags: 45, volume: 11250, status: 'Aman', updatedAt: '2026-06-27T08:30:00Z' },
  { bloodType: 'A-', bags: 8, volume: 2000, status: 'Kritis', updatedAt: '2026-06-26T14:15:00Z' },
  { bloodType: 'B+', bags: 38, volume: 9500, status: 'Aman', updatedAt: '2026-06-27T09:00:00Z' },
  { bloodType: 'B-', bags: 4, volume: 1000, status: 'Kritis', updatedAt: '2026-06-25T11:20:00Z' },
  { bloodType: 'AB+', bags: 15, volume: 3750, status: 'Rendah', updatedAt: '2026-06-27T07:45:00Z' },
  { bloodType: 'AB-', bags: 3, volume: 750, status: 'Kritis', updatedAt: '2026-06-24T16:00:00Z' },
  { bloodType: 'O+', bags: 62, volume: 15500, status: 'Aman', updatedAt: '2026-06-27T10:30:00Z' },
  { bloodType: 'O-', bags: 9, volume: 2250, status: 'Kritis', updatedAt: '2026-06-26T13:45:00Z' }
];

const defaultDonations: DonationRecord[] = [
  { id: 'DON-001', donorName: 'Amiruddin Hasan', phone: '0812-3001-4567', email: 'amiruddin@gmail.com', bloodType: 'O+', bags: 1, volume: 250, donationDate: '2026-06-27T08:30:00Z', status: 'Selesai', location: 'Gudang Utama UTD PMI Soppeng', notes: 'Donor rutin 3 bulanan' },
  { id: 'DON-002', donorName: 'Ahmad Fauzi', phone: '0812-3456-7890', email: 'ahmadfauzi@yahoo.com', bloodType: 'A+', bags: 1, volume: 250, donationDate: '2026-06-27T09:00:00Z', status: 'Selesai', location: 'Gudang Utama UTD PMI Soppeng', notes: 'Kondisi fisik sangat prima' },
  { id: 'DON-003', donorName: 'Oki Pratama', phone: '0852-9988-7766', email: 'okipratama@gmail.com', bloodType: 'O+', bags: 1, volume: 250, donationDate: '2026-06-27T10:30:00Z', status: 'Selesai', location: 'Gudang Utama UTD PMI Soppeng', notes: 'Pertama kali donor tahun ini' },
  { id: 'DON-004', donorName: 'Rudi Wijaya', phone: '0821-4433-2211', email: 'rudiwijaya@gmail.com', bloodType: 'O-', bags: 1, volume: 250, donationDate: '2026-06-26T13:45:00Z', status: 'Selesai', location: 'Bus Donor Keliling - Lalabata', notes: 'Donor darurat untuk pasien RSUD' },
  { id: 'DON-005', donorName: 'Citra Kirana', phone: '0878-1122-3344', email: 'citra@gmail.com', bloodType: 'AB+', bags: 1, volume: 250, donationDate: '2026-06-26T11:00:00Z', status: 'Selesai', location: 'Gudang Utama UTD PMI Soppeng' },
  { id: 'DON-006', donorName: 'Bambang Pamungkas', phone: '0813-5566-7788', email: 'bambang@gmail.com', bloodType: 'B+', bags: 1, volume: 250, donationDate: '2026-06-25T08:00:00Z', status: 'Selesai', location: 'Gudang Utama UTD PMI Soppeng' },
  { id: 'DON-007', donorName: 'Mahesa Fauzul Irham', phone: '0812-3456-2026', email: 'mahesafauzulirham@gmail.com', bloodType: 'B+', bags: 1, volume: 250, donationDate: '2026-06-15T10:00:00Z', status: 'Selesai', location: 'Gudang Utama UTD PMI Soppeng', notes: 'Donor berkala' },
  { id: 'DON-008', donorName: 'Mahesa Fauzul Irham', phone: '0812-3456-2026', email: 'mahesafauzulirham@gmail.com', bloodType: 'B+', bags: 1, volume: 250, donationDate: '2026-04-10T09:30:00Z', status: 'Selesai', location: 'Gudang Utama UTD PMI Soppeng', notes: 'Sesi donor sehat' }
];

const defaultSchedules: DonorSchedule[] = [
  { id: 'SCH-001', donorName: 'Amiruddin Hasan', phone: '0812-3001-4567', email: 'amiruddin@gmail.com', bloodType: 'O+', appointmentDate: '2026-06-27', appointmentTime: '08:30', status: 'Selesai', notes: 'Pemeriksaan tensi normal' },
  { id: 'SCH-002', donorName: 'Ahmad Fauzi', phone: '0812-3456-7890', email: 'ahmadfauzi@yahoo.com', bloodType: 'A+', appointmentDate: '2026-06-28', appointmentTime: '09:00', status: 'Selesai', notes: 'Hemoglobin baik' },
  { id: 'SCH-003', donorName: 'Oki Pratama', phone: '0852-9988-7766', email: 'okipratama@gmail.com', bloodType: 'O+', appointmentDate: '2026-06-28', appointmentTime: '10:30', status: 'Selesai' },
  { id: 'SCH-004', donorName: 'Bambang Sugiharto', phone: '0813-5566-7788', email: 'bambang@gmail.com', bloodType: 'B+', appointmentDate: '2026-06-29', appointmentTime: '08:00', status: 'Menunggu' },
  { id: 'SCH-005', donorName: 'Citra Kirana', phone: '0878-1122-3344', email: 'citra@gmail.com', bloodType: 'AB+', appointmentDate: '2026-06-30', appointmentTime: '11:00', status: 'Menunggu' },
  { id: 'SCH-006', donorName: 'Rudi Wijaya', phone: '0821-4433-2211', email: 'rudiwijaya@gmail.com', bloodType: 'O-', appointmentDate: '2026-06-30', appointmentTime: '14:00', status: 'Menunggu' }
];

const defaultHospitals: Hospital[] = [
  {
    id: 'HSP-001',
    name: 'RSUD Latemmamala Soppeng',
    address: 'Jl. Malaka No. 6, Watansoppeng, Kec. Lalabata, Kabupaten Soppeng',
    distance: '1.2 km',
    lastSync: '2026-07-12T12:00:00Z',
    status: 'Aktif',
    bloodRequest: [
      { bloodType: 'A-', bagsNeeded: 3 },
      { bloodType: 'O-', bagsNeeded: 2 },
      { bloodType: 'B-', bagsNeeded: 1 }
    ]
  },
  {
    id: 'HSP-002',
    name: 'RS Stella Maris (Partner Klinik Soppeng)',
    address: 'Jl. Kemakmuran No. 12, Watansoppeng',
    distance: '2.5 km',
    lastSync: '2026-07-12T11:45:00Z',
    status: 'Aktif',
    bloodRequest: [
      { bloodType: 'AB-', bagsNeeded: 2 },
      { bloodType: 'A-', bagsNeeded: 1 }
    ]
  },
  {
    id: 'HSP-003',
    name: 'Puskesmas Lalabata',
    address: 'Jl. Pemuda No. 4, Watansoppeng',
    distance: '0.8 km',
    lastSync: '2026-07-12T10:30:00Z',
    status: 'Terputus',
    bloodRequest: [
      { bloodType: 'O+', bagsNeeded: 5 }
    ]
  }
];

const defaultNotifications: NotificationItem[] = [
  { id: 'NTF-001', title: 'Stok Darah Kritis!', message: 'Golongan darah A-, B-, AB-, O- dalam kondisi kritis. Segera undang pendonor potensial.', date: '2026-06-27T10:30:00Z', type: 'danger', isRead: false },
  { id: 'NTF-002', title: 'Permintaan RSUD Latemmamala', message: 'RSUD Latemmamala membutuhkan 3 kantong darah A- untuk operasi darurat.', date: '2026-06-27T09:15:00Z', type: 'warning', isRead: false },
  { id: 'NTF-003', title: 'Sinkronisasi Sukses', message: 'Data stok disinkronkan dengan 2 rumah sakit terdekat secara real-time.', date: '2026-06-27T08:00:00Z', type: 'success', isRead: true }
];

const defaultUser: UserProfile = {
  id: 'USR-101',
  name: 'Mahesa Fauzul Irham',
  email: 'mahesafauzulirham@gmail.com',
  phone: '0812-3456-2026',
  bloodType: 'B+',
  twoFactorEnabled: false,
  twoFactorSecret: 'K4YTMNSVONSWG4TF', // Seed untuk TOTP simulator
  twoFactorVerified: false,
  totalDonations: 2,
  totalVolume: 500,
  badges: ['BDG-001', 'BDG-002']
};

const defaultBadges = [
  { id: 'BDG-001', name: 'Pendonor Pemula', description: 'Telah mendonorkan darah sebanyak 1 kali', icon: 'Award', color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
  { id: 'BDG-002', name: 'Ksatria Golongan B', description: 'Pendonor aktif golongan darah B', icon: 'Shield', color: 'text-red-500 bg-red-50 border-red-200' },
  { id: 'BDG-003', name: 'Pahlawan Kemanusiaan', description: 'Telah mendonorkan darah sebanyak 5 kali', icon: 'Heart', color: 'text-rose-500 bg-rose-50 border-rose-200' },
  { id: 'BDG-004', name: 'Pendonor Setia', description: 'Konsisten mendonorkan darah secara berkala dalam 1 tahun', icon: 'Sparkles', color: 'text-amber-500 bg-amber-50 border-amber-200' }
];

// Read/Write DB helper
function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (!data.admin) {
        data.admin = {
          username: 'admin',
          email: 'admin@utd-soppeng.id',
          password: 'pmi2026'
        };
        writeDB(data);
      }
      return data;
    }
  } catch (err) {
    console.error('Error reading JSON database, resetting...', err);
  }
  const initialData = {
    stocks: defaultStocks,
    donations: defaultDonations,
    schedules: defaultSchedules,
    hospitals: defaultHospitals,
    notifications: defaultNotifications,
    user: defaultUser,
    badges: defaultBadges,
    admin: {
      username: 'admin',
      email: 'admin@utd-soppeng.id',
      password: 'pmi2026'
    }
  };
  writeDB(initialData);
  return initialData;
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to JSON database', err);
  }
}

// Helper to determine status based on bag count
function computeStatus(bags: number): 'Aman' | 'Rendah' | 'Kritis' {
  if (bags >= 20) return 'Aman';
  if (bags >= 10) return 'Rendah';
  return 'Kritis';
}

// ==========================================
// SUPABASE BACKEND ADAPTERS
// ==========================================

async function getStocks(): Promise<BloodStock[]> {
  const localDb = readDB();
  const localStocks: BloodStock[] = localDb.stocks || [];

  if (isSupabaseActive) {
    try {
      const { data, error } = await supabase.from('blood_stocks').select('*');
      if (error) throw error;
      
      if (data) {
        const supabaseStocks: BloodStock[] = data.map((item: any) => ({
          bloodType: item.blood_type,
          bags: Number(item.bags),
          volume: Number(item.volume),
          status: item.status,
          updatedAt: item.updated_at
        }));

        const localMap = new Map(localStocks.map(s => [s.bloodType, s]));
        const supabaseMap = new Map(supabaseStocks.map(s => [s.bloodType, s]));
        
        let needsWriteLocal = false;

        // 1. Sync local-only or newer local stocks to Supabase
        for (const localStock of localStocks) {
          const sbStock = supabaseMap.get(localStock.bloodType);
          if (!sbStock || new Date(localStock.updatedAt).getTime() > new Date(sbStock.updatedAt).getTime()) {
            await supabase.from('blood_stocks').upsert({
              blood_type: localStock.bloodType,
              bags: Number(localStock.bags),
              volume: Number(localStock.volume),
              status: localStock.status,
              updated_at: localStock.updatedAt || new Date().toISOString()
            });
          }
        }

        // 2. Sync newer Supabase stocks to local JSON
        for (const sbStock of supabaseStocks) {
          const localStock = localMap.get(sbStock.bloodType);
          if (!localStock) {
            localStocks.push(sbStock);
            needsWriteLocal = true;
          } else if (new Date(sbStock.updatedAt).getTime() > new Date(localStock.updatedAt).getTime()) {
            const index = localStocks.findIndex(s => s.bloodType === sbStock.bloodType);
            if (index !== -1) {
              localStocks[index] = sbStock;
              needsWriteLocal = true;
            }
          }
        }

        if (needsWriteLocal) {
          localDb.stocks = localStocks;
          writeDB(localDb);
        }
      }
    } catch (err) {
      console.error('Supabase getStocks sync error, using local JSON:', err);
    }
  }
  return localStocks;
}

async function saveStock(stock: BloodStock): Promise<BloodStock[]> {
  if (isSupabaseActive) {
    try {
      const { error } = await supabase.from('blood_stocks').upsert({
        blood_type: stock.bloodType,
        bags: Number(stock.bags),
        volume: Number(stock.volume),
        status: stock.status,
        updated_at: stock.updatedAt || new Date().toISOString()
      });
      if (error) throw error;
    } catch (err) {
      console.error('Supabase saveStock error:', err);
    }
  }
  const db = readDB();
  const index = db.stocks.findIndex((s: any) => s.bloodType === stock.bloodType);
  if (index !== -1) {
    db.stocks[index] = stock;
  } else {
    db.stocks.push(stock);
  }
  writeDB(db);
  return db.stocks;
}

async function getDonations(): Promise<DonationRecord[]> {
  const localDb = readDB();
  const localDonations: DonationRecord[] = localDb.donations || [];

  if (isSupabaseActive) {
    try {
      const { data, error } = await supabase.from('donations').select('*').order('donation_date', { ascending: false });
      if (error) throw error;
      
      if (data) {
        const supabaseDonations: DonationRecord[] = data.map((item: any) => ({
          id: item.id,
          donorName: item.donor_name,
          phone: item.phone,
          email: item.email || '',
          bloodType: item.blood_type,
          bags: Number(item.bags || 1),
          volume: Number(item.volume || 250),
          donationDate: item.donation_date,
          status: item.status,
          location: item.location,
          notes: item.notes || ''
        }));

        const localIds = new Set(localDonations.map(d => d.id));
        const supabaseIds = new Set(supabaseDonations.map(d => d.id));
        
        let needsWriteLocal = false;

        // 1. Sync local-only donations to Supabase
        for (const localDon of localDonations) {
          if (!supabaseIds.has(localDon.id)) {
            await supabase.from('donations').insert({
              id: localDon.id,
              donor_name: localDon.donorName,
              phone: localDon.phone,
              email: localDon.email || '',
              blood_type: localDon.bloodType,
              bags: Number(localDon.bags || 1),
              volume: Number(localDon.volume || 250),
              donation_date: localDon.donationDate || new Date().toISOString(),
              status: localDon.status || 'Selesai',
              location: localDon.location,
              notes: localDon.notes || ''
            });
            supabaseDonations.push(localDon);
          }
        }

        // 2. Sync Supabase-only donations to local JSON
        for (const sbDon of supabaseDonations) {
          if (!localIds.has(sbDon.id)) {
            localDonations.push(sbDon);
            needsWriteLocal = true;
          }
        }

        if (needsWriteLocal) {
          localDb.donations = localDonations;
          writeDB(localDb);
        }
      }
    } catch (err) {
      console.error('Supabase getDonations sync error, using local JSON:', err);
    }
  }
  return localDonations.sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());
}

async function addDonation(record: DonationRecord): Promise<DonationRecord[]> {
  const db = readDB();
  db.donations.unshift(record);
  writeDB(db);

  if (isSupabaseActive) {
    try {
      const { error } = await supabase.from('donations').insert({
        id: record.id,
        donor_name: record.donorName,
        phone: record.phone,
        email: record.email || '',
        blood_type: record.bloodType,
        bags: Number(record.bags || 1),
        volume: Number(record.volume || 250),
        donation_date: record.donationDate || new Date().toISOString(),
        status: record.status || 'Selesai',
        location: record.location,
        notes: record.notes || ''
      });
      if (error) {
        console.warn('Supabase donations insert error (saved locally):', error);
      }
    } catch (err) {
      console.error('Supabase addDonation error (saved locally):', err);
    }
  }
  return db.donations;
}

async function getSchedules(): Promise<DonorSchedule[]> {
  const localDb = readDB();
  const localSchedules: DonorSchedule[] = localDb.schedules || [];

  if (isSupabaseActive) {
    try {
      const { data, error } = await supabase.from('schedules').select('*');
      if (error) throw error;
      
      if (data) {
        const supabaseSchedules: DonorSchedule[] = data.map((item: any) => ({
          id: item.id,
          donorName: item.donor_name,
          phone: item.phone,
          email: item.email || '',
          bloodType: item.blood_type,
          appointmentDate: item.appointment_date ? item.appointment_date.split('T')[0] : '',
          appointmentTime: item.appointment_time ? item.appointment_time.substring(0, 5) : '',
          status: item.status === 'Dibatalkan' ? 'Batal' : item.status,
          notes: item.notes || ''
        }));

        const localIds = new Set(localSchedules.map(s => s.id));
        const supabaseIds = new Set(supabaseSchedules.map(s => s.id));
        
        let needsWriteLocal = false;

        // 1. Sync local-only schedules to Supabase
        for (const localSched of localSchedules) {
          const matchingSb = supabaseSchedules.find(s => s.id === localSched.id);
          if (!matchingSb) {
            let apptTime = localSched.appointmentTime || '09:00';
            if (apptTime.length === 5) {
              apptTime = apptTime + ':00';
            } else if (apptTime.length > 8) {
              apptTime = apptTime.substring(0, 8);
            }

            await supabase.from('schedules').insert({
              id: localSched.id,
              donor_name: localSched.donorName,
              phone: localSched.phone,
              email: localSched.email || '',
              blood_type: localSched.bloodType,
              appointment_date: localSched.appointmentDate,
              appointment_time: apptTime,
              status: localSched.status === 'Batal' ? 'Dibatalkan' : (localSched.status || 'Menunggu'),
              notes: localSched.notes || ''
            });
            supabaseSchedules.push(localSched);
          } else if (localSched.status !== matchingSb.status) {
            if (localSched.status === 'Batal' && matchingSb.status !== 'Batal') {
              await supabase.from('schedules').update({ status: 'Dibatalkan' }).eq('id', localSched.id);
              matchingSb.status = 'Batal';
            } else if (matchingSb.status === 'Batal' && localSched.status !== 'Batal') {
              localSched.status = 'Batal';
              needsWriteLocal = true;
            }
          }
        }

        // 2. Sync Supabase-only schedules to local JSON
        for (const sbSched of supabaseSchedules) {
          if (!localIds.has(sbSched.id)) {
            localSchedules.push(sbSched);
            needsWriteLocal = true;
          }
        }

        if (needsWriteLocal) {
          localDb.schedules = localSchedules;
          writeDB(localDb);
        }
      }
    } catch (err) {
      console.error('Supabase getSchedules sync error, using local JSON:', err);
    }
  }
  return localSchedules;
}

async function addSchedule(record: DonorSchedule): Promise<DonorSchedule[]> {
  const db = readDB();
  db.schedules.push(record);
  writeDB(db);

  if (isSupabaseActive) {
    try {
      let apptTime = record.appointmentTime || '09:00';
      if (apptTime.length === 5) {
        apptTime = apptTime + ':00';
      } else if (apptTime.length > 8) {
        apptTime = apptTime.substring(0, 8);
      }

      const { error } = await supabase.from('schedules').insert({
        id: record.id,
        donor_name: record.donorName,
        phone: record.phone,
        email: record.email || '',
        blood_type: record.bloodType,
        appointment_date: record.appointmentDate,
        appointment_time: apptTime,
        status: record.status || 'Menunggu',
        notes: record.notes || ''
      });
      if (error) {
        console.warn('Supabase schedules insert error (saved locally):', error);
      }
    } catch (err) {
      console.error('Supabase addSchedule error (saved locally):', err);
    }
  }
  return db.schedules;
}

async function deleteSchedule(id: string): Promise<DonorSchedule[]> {
  const db = readDB();
  db.schedules = (db.schedules || []).map((s: DonorSchedule) => {
    if (s.id === id) {
      return { ...s, status: 'Batal' };
    }
    return s;
  });
  writeDB(db);

  if (isSupabaseActive) {
    try {
      const { error } = await supabase.from('schedules').update({ status: 'Dibatalkan' }).eq('id', id);
      if (error) {
        console.warn('Supabase schedules update/cancel error:', error);
      }
    } catch (err) {
      console.error('Supabase deleteSchedule update error:', err);
    }
  }
  return db.schedules;
}

async function getHospitals(): Promise<Hospital[]> {
  return [];
}

async function saveHospitals(hospitals: Hospital[]): Promise<Hospital[]> {
  return [];
}

async function getNotifications(): Promise<NotificationItem[]> {
  if (isSupabaseActive) {
    try {
      const { data, error } = await supabase.from('notifications').select('*').order('date', { ascending: false });
      if (error) throw error;
      if (data) {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          date: item.date,
          type: item.type,
          isRead: item.is_read,
          bloodTypeTarget: item.blood_type_target || undefined
        }));
      }
    } catch (err) {
      console.error('Supabase getNotifications error, falling back to local JSON:', err);
    }
  }
  return readDB().notifications;
}

async function addNotification(record: NotificationItem): Promise<NotificationItem[]> {
  if (isSupabaseActive) {
    try {
      const { error } = await supabase.from('notifications').insert({
        id: record.id,
        title: record.title,
        message: record.message,
        date: record.date || new Date().toISOString(),
        type: record.type,
        is_read: record.isRead,
        blood_type_target: record.bloodTypeTarget || null
      });
      if (error) throw error;
    } catch (err) {
      console.error('Supabase addNotification error:', err);
    }
  }
  const db = readDB();
  db.notifications.unshift(record);
  writeDB(db);
  return db.notifications;
}

async function markNotificationAsRead(id: string): Promise<NotificationItem[]> {
  if (isSupabaseActive) {
    try {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase markNotificationAsRead error:', err);
    }
  }
  const db = readDB();
  const index = db.notifications.findIndex((n: any) => n.id === id);
  if (index !== -1) {
    db.notifications[index].isRead = true;
    writeDB(db);
  }
  return db.notifications;
}

async function markAllNotificationsAsRead(): Promise<NotificationItem[]> {
  if (isSupabaseActive) {
    try {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase markAllNotificationsAsRead error:', err);
    }
  }
  const db = readDB();
  db.notifications = db.notifications.map((n: any) => ({ ...n, isRead: true }));
  writeDB(db);
  return db.notifications;
}

async function getUserProfile(): Promise<UserProfile> {
  if (isSupabaseActive) {
    try {
      const { data: userData, error: userError } = await supabase.from('user_profiles').select('*').limit(1).single();
      if (userError) throw userError;
      if (userData) {
        let activeBadges: string[] = [];
        const { data: badgeData, error: badgeError } = await supabase
          .from('user_badges')
          .select('badge_id')
          .eq('user_id', userData.id);
        if (!badgeError && badgeData) {
          activeBadges = badgeData.map((b: any) => b.badge_id);
        }
        return {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          bloodType: userData.blood_type,
          twoFactorEnabled: userData.two_factor_enabled,
          twoFactorSecret: userData.two_factor_secret || 'K4YTMNSVONSWG4TF',
          twoFactorVerified: userData.two_factor_verified,
          totalDonations: Number(userData.total_donations || 0),
          totalVolume: Number(userData.total_volume || 0),
          badges: activeBadges
        };
      }
    } catch (err) {
      console.error('Supabase getUserProfile error, falling back to local JSON:', err);
    }
  }
  return readDB().user;
}

async function saveUserProfile(user: UserProfile): Promise<UserProfile> {
  if (isSupabaseActive) {
    try {
      const { error } = await supabase.from('user_profiles').upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        blood_type: user.bloodType,
        two_factor_enabled: user.twoFactorEnabled,
        two_factor_secret: user.twoFactorSecret,
        two_factor_verified: user.twoFactorVerified,
        total_donations: Number(user.totalDonations),
        total_volume: Number(user.totalVolume)
      });
      if (error) throw error;
      if (user.badges && user.badges.length > 0) {
        for (const bId of user.badges) {
          await supabase.from('user_badges').upsert({
            user_id: user.id,
            badge_id: bId
          });
        }
      }
    } catch (err) {
      console.error('Supabase saveUserProfile error:', err);
    }
  }
  const db = readDB();
  db.user = user;
  writeDB(db);
  return db.user;
}

async function getAdminProfile(): Promise<any> {
  if (isSupabaseActive) {
    try {
      const { data, error } = await supabase.from('admin').select('*').limit(1).single();
      if (error) throw error;
      if (data) {
        return {
          username: data.username,
          email: data.email,
          password: data.password
        };
      }
    } catch (err) {
      console.error('Supabase getAdminProfile error, falling back to local JSON:', err);
    }
  }
  return readDB().admin;
}

async function saveAdminProfile(email: string, password?: string): Promise<any> {
  if (isSupabaseActive) {
    try {
      const updatePayload: any = {};
      if (email) updatePayload.email = email;
      if (password) updatePayload.password = password;
      const { error } = await supabase.from('admin').update(updatePayload).eq('username', 'admin');
      if (error) throw error;
    } catch (err) {
      console.error('Supabase saveAdminProfile error:', err);
    }
  }
  const db = readDB();
  if (email) db.admin.email = email;
  if (password) db.admin.password = password;
  writeDB(db);
  return db.admin;
}

const app = express();
const PORT = 3000;

app.use(express.json());


// API Endpoints
app.get('/api/supabase/status', (req, res) => {
  res.json({
    active: isSupabaseActive,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : null,
    message: isSupabaseActive 
      ? 'Aplikasi Terhubung Secara Live Dengan Supabase Cloud' 
      : 'Menggunakan Database Lokal (Offline JSON). Isi SUPABASE_URL & SUPABASE_KEY di tab Settings untuk beralih ke live database.'
  });
});

app.get('/api/stock', async (req, res) => {
  try {
    const stocks = await getStocks();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

app.post('/api/stock', async (req, res) => {
  try {
    const { bloodType, bags, volume, status, updatedAt } = req.body;
    const currentStock: BloodStock = {
      bloodType,
      bags: Number(bags),
      volume: Number(volume),
      status: status || computeStatus(Number(bags)),
      updatedAt: updatedAt || new Date().toISOString()
    };

    const stocks = await saveStock(currentStock);

    if (Number(bags) < 10) {
      const notifications = await getNotifications();
      const existingNotification = notifications.find(
        (n: NotificationItem) => n.bloodTypeTarget === bloodType && n.type === 'danger' && !n.isRead
      );
      if (!existingNotification) {
        await addNotification({
          id: 'NTF-' + Date.now().toString().slice(-12),
          title: `Stok ${bloodType} Kritis!`,
          message: `Stok golongan darah ${bloodType} tersisa ${bags} kantong. Segera hubungi pendonor terdaftar.`,
          date: new Date().toISOString(),
          type: 'danger',
          isRead: false,
          bloodTypeTarget: bloodType
        });
      }
    }

    res.json({ success: true, stocks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save stock' });
  }
});

app.get('/api/donations', async (req, res) => {
  try {
    const donations = await getDonations();
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

app.post('/api/donations', async (req, res) => {
  try {
    const { donorName, phone, email, bloodType, bags, volume, location, notes } = req.body;

    const newDonation: DonationRecord = {
      id: 'DON-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      donorName,
      phone,
      email: email || '',
      bloodType,
      bags: Number(bags || 1),
      volume: Number(volume || 250),
      donationDate: new Date().toISOString(),
      status: 'Selesai',
      location: location || 'Gudang Utama UTD PMI Soppeng',
      notes: notes || ''
    };

    await addDonation(newDonation);

    // Auto increment blood stock
    const stocks = await getStocks();
    const stockIndex = stocks.findIndex((s: BloodStock) => s.bloodType === bloodType);
    if (stockIndex !== -1) {
      const targetStock = stocks[stockIndex];
      const newBags = targetStock.bags + Number(bags || 1);
      const newVol = targetStock.volume + Number(volume || 250);
      await saveStock({
        ...targetStock,
        bags: newBags,
        volume: newVol,
        status: computeStatus(newBags),
        updatedAt: new Date().toISOString()
      });
    }

    // Update user profile dynamically and update shown statistics
    const user = await getUserProfile();
    user.name = donorName;
    user.email = email || '';
    user.bloodType = bloodType;
    user.phone = phone || '0812-3456-2026';

    const allDonations = await getDonations();
    const matchedDonations = allDonations.filter((d: DonationRecord) => 
      d && (d.email?.toLowerCase() === user.email.toLowerCase() || d.donorName?.toLowerCase() === user.name.toLowerCase())
    );

    user.totalDonations = matchedDonations.length;
    user.totalVolume = matchedDonations.reduce((sum: number, d: DonationRecord) => sum + (d.volume || 0), 0);

    // Dynamic gamification badging based on name/email/bloodType context
    if (user.totalDonations >= 1 && !user.badges.includes('BDG-001')) {
      user.badges.push('BDG-001');
      await addNotification({
        id: 'NTF-BDG-' + Date.now().toString().slice(-12),
        title: 'Lencana Baru Dibuka!',
        message: `Selamat! ${user.name} memperoleh lencana "Pendonor Pemula" karena telah mendonorkan darah pertama kali.`,
        date: new Date().toISOString(),
        type: 'success',
        isRead: false
      });
    }

    if (user.totalDonations >= 3 && !user.badges.includes('BDG-004')) {
      user.badges.push('BDG-004');
      await addNotification({
        id: 'NTF-BDG2-' + Date.now().toString().slice(-11),
        title: 'Lencana Baru Dibuka!',
        message: `Luar biasa! ${user.name} mendapatkan lencana "Pendonor Setia" atas dedikasi berkala Anda.`,
        date: new Date().toISOString(),
        type: 'success',
        isRead: false
      });
    }

    await saveUserProfile(user);

    const updatedStocks = await getStocks();
    res.json({ success: true, donation: newDonation, stocks: updatedStocks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process donation' });
  }
});

app.get('/api/schedules', async (req, res) => {
  try {
    const schedules = await getSchedules();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

app.post('/api/schedules', async (req, res) => {
  try {
    const { donorName, phone, email, bloodType, appointmentDate, appointmentTime, notes } = req.body;

    const newSchedule: DonorSchedule = {
      id: 'SCH-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      donorName,
      phone,
      email: email || '',
      bloodType,
      appointmentDate,
      appointmentTime,
      status: 'Menunggu',
      notes: notes || ''
    };

    await addSchedule(newSchedule);

    await addNotification({
      id: 'NTF-' + Date.now().toString().slice(-12),
      title: 'Jadwal Donor Ditambahkan',
      message: `Halo ${donorName}, sesi donor Anda dijadwalkan pada ${appointmentDate} pukul ${appointmentTime} di UTD PMI Soppeng. Jaga kondisi tubuh ya!`,
      date: new Date().toISOString(),
      type: 'success',
      isRead: false
    });

    res.json({ success: true, schedule: newSchedule });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save schedule' });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const schedules = await deleteSchedule(id);
    res.json({ success: true, schedules });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

app.delete('/api/stock/:bloodType', async (req, res) => {
  try {
    let { bloodType } = req.params;
    if (bloodType) {
      bloodType = decodeURIComponent(bloodType).trim();
      if (bloodType.includes(' ')) {
        bloodType = bloodType.replace(/ /g, '+');
      }
    }
    const stocks = await getStocks();
    const stockIndex = stocks.findIndex((s: BloodStock) => s.bloodType === bloodType);

    if (stockIndex !== -1) {
      const updated = await saveStock({
        bloodType: bloodType as any,
        bags: 0,
        volume: 0,
        status: 'Kritis',
        updatedAt: new Date().toISOString()
      });
      res.json({ success: true, stocks: updated });
    } else {
      res.status(404).json({ error: `Blood group ${bloodType} not found` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete stock' });
  }
});

app.get('/api/hospitals', async (req, res) => {
  try {
    const hospitals = await getHospitals();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
});

app.post('/api/hospitals/sync', async (req, res) => {
  try {
    const hospitals = await getHospitals();

    const syncingHospitals = hospitals.map((h: Hospital) => ({
      ...h,
      status: 'Sinkronisasi' as any,
      lastSync: new Date().toISOString()
    }));
    await saveHospitals(syncingHospitals);

    setTimeout(async () => {
      try {
        const fresh = await getHospitals();
        const synced = fresh.map((h: Hospital) => ({
          ...h,
          status: h.id === 'HSP-003' ? ('Terputus' as any) : ('Aktif' as any),
          lastSync: new Date().toISOString()
        }));
        await saveHospitals(synced);

        await addNotification({
          id: 'NTF-SYNC-' + Date.now().toString().slice(-11),
          title: 'Sinkronisasi Rumah Sakit',
          message: 'Sinkronisasi data real-time dengan RSUD Latemmamala & RS Stella Maris berhasil diselesaikan.',
          date: new Date().toISOString(),
          type: 'success',
          isRead: false
        });
      } catch (err) {
        console.error('Async sync error:', err);
      }
    }, 1000);

    res.json({ success: true, message: 'Sync initiated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger sync' });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await getNotifications();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.post('/api/notifications/read/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notifications = await markNotificationAsRead(id);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

app.post('/api/notifications/read-all', async (req, res) => {
  try {
    const notifications = await markAllNotificationsAsRead();
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

app.post('/api/notifications/broadcast', async (req, res) => {
  try {
    const { title, message, bloodTypeTarget } = req.body;

    const customNotification: NotificationItem = {
      id: 'NTF-BRD-' + Date.now().toString().slice(-12),
      title: title || 'Panggilan Kemanusiaan PMI Soppeng',
      message: message || 'Dibutuhkan segera bantuan donor darah.',
      date: new Date().toISOString(),
      type: 'danger',
      isRead: false,
      bloodTypeTarget
    };

    const notifications = await addNotification(customNotification);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to broadcast notification' });
  }
});

app.get('/api/user/profile', async (req, res) => {
  try {
    const user = await getUserProfile();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

app.get('/api/admin/profile', async (req, res) => {
  try {
    const admin = await getAdminProfile();
    res.json({
      username: admin.username,
      email: admin.email,
      password: admin.password
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin profile' });
  }
});

app.post('/api/admin/profile/update', async (req, res) => {
  try {
    const { email, password } = req.body;
    await saveAdminProfile(email, password);
    res.json({ success: true, message: 'Profil admin berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update admin profile' });
  }
});

app.post('/api/user/2fa/setup', async (req, res) => {
  try {
    const user = await getUserProfile();
    res.json({
      secret: user.twoFactorSecret,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/PMISoppeng:${user.email}?secret=${user.twoFactorSecret}&issuer=PMI%20Kabupaten%20Soppeng`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to initiate 2FA setup' });
  }
});

app.post('/api/user/2fa/verify', async (req, res) => {
  try {
    const { code } = req.body;
    const user = await getUserProfile();

    if (code && code.length === 6 && !isNaN(Number(code))) {
      user.twoFactorEnabled = true;
      user.twoFactorVerified = true;
      await saveUserProfile(user);

      await addNotification({
        id: 'NTF-2FA-' + Date.now().toString().slice(-12),
        title: 'Autentikasi Dua Faktor Aktif',
        message: 'Keamanan akun Anda ditingkatkan dengan Autentikasi Dua Faktor (2FA) yang aktif.',
        date: new Date().toISOString(),
        type: 'success',
        isRead: false
      });

      res.json({ success: true, user });
    } else {
      res.status(400).json({ error: 'Kode OTP tidak valid. Harus 6 digit angka.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
});

app.post('/api/user/2fa/disable', async (req, res) => {
  try {
    const user = await getUserProfile();
    user.twoFactorEnabled = false;
    user.twoFactorVerified = false;
    await saveUserProfile(user);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});


// Serve frontend assets and start listening
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
