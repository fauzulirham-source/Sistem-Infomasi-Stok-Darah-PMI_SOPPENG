export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface BloodStock {
  bloodType: BloodGroup;
  bags: number;
  volume: number; // in mL
  status: 'Aman' | 'Rendah' | 'Kritis';
  updatedAt: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  phone: string;
  email: string;
  bloodType: BloodGroup;
  bags: number;
  volume: number; // in mL
  donationDate: string;
  status: 'Selesai' | 'Dibatalkan' | 'Diproses';
  location: string;
  notes?: string;
}

export interface DonorSchedule {
  id: string;
  donorName: string;
  phone: string;
  email: string;
  bloodType: BloodGroup;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  status: 'Menunggu' | 'Selesai' | 'Batal';
  notes?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  distance: string;
  lastSync: string;
  status: 'Aktif' | 'Sinkronisasi' | 'Terputus';
  bloodRequest: {
    bloodType: BloodGroup;
    bagsNeeded: number;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  isRead: boolean;
  bloodTypeTarget?: BloodGroup;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: BloodGroup;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  twoFactorVerified: boolean;
  totalDonations: number;
  totalVolume: number; // in mL
  badges: string[]; // list of badge IDs
}

export interface SystemStats {
  totalBags: number;
  donorsToday: number;
  totalBloodGroups: number;
}

export interface AdminProfile {
  username: string;
  email: string;
  password?: string;
}
