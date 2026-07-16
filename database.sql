-- =====================================================================================
-- SISTEM INFORMASI STOK DARAH PMI KABUPATEN SOPPENG
-- SQL DATABASE SCHEMA & SEED DATA (POSTGRESQL & MYSQL COMPATIBLE)
-- Generated: 2026-07-13
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- 1. DROP EXISTING TABLES IF ANY (ORDER BY DEPENDENCY)
-- -------------------------------------------------------------------------------------
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS hospital_blood_requests CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS blood_stocks CASCADE;
DROP TABLE IF EXISTS admin CASCADE;

-- -------------------------------------------------------------------------------------
-- 2. CREATE TABLE SCHEMAS
-- -------------------------------------------------------------------------------------

-- Table: admin (Akun Kredensial Admin Utama)
CREATE TABLE admin (
    username VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: blood_stocks (Ketersediaan Stok Golongan Darah Saat Ini)
CREATE TABLE blood_stocks (
    blood_type VARCHAR(5) PRIMARY KEY,
    bags INT NOT NULL DEFAULT 0,
    volume INT NOT NULL DEFAULT 0, -- dalam mililiter (mL)
    status VARCHAR(20) NOT NULL CHECK (status IN ('Aman', 'Rendah', 'Kritis')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: donations (Catatan Historis Pendonoran Darah Selesai)
CREATE TABLE donations (
    id VARCHAR(20) PRIMARY KEY,
    donor_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    bags INT NOT NULL DEFAULT 1,
    volume INT NOT NULL DEFAULT 250, -- dalam mililiter (mL)
    donation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Selesai', 'Dibatalkan', 'Proses')),
    location VARCHAR(250) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: schedules (Kalender Booking Jadwal Agenda Donor Darah)
CREATE TABLE schedules (
    id VARCHAR(20) PRIMARY KEY,
    donor_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Menunggu', 'Selesai', 'Dibatalkan')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: hospitals (Daftar Rumah Sakit Kemitraan)
CREATE TABLE hospitals (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    distance VARCHAR(25) NOT NULL,
    last_sync TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Aktif', 'Terputus')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: hospital_blood_requests (Kebutuhan Darurat Darah Rumah Sakit Mitra)
CREATE TABLE hospital_blood_requests (
    id SERIAL PRIMARY KEY,
    hospital_id VARCHAR(20) REFERENCES hospitals(id) ON DELETE CASCADE,
    blood_type VARCHAR(5) NOT NULL,
    bags_needed INT NOT NULL DEFAULT 0
);

-- Table: notifications (Notifikasi Log Sistem Informasi)
CREATE TABLE notifications (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('danger', 'warning', 'success', 'info')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    blood_type_target VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_profiles (Profil Pengguna Pendonor Terdaftar)
CREATE TABLE user_profiles (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret VARCHAR(50),
    two_factor_verified BOOLEAN NOT NULL DEFAULT FALSE,
    total_donations INT NOT NULL DEFAULT 0,
    total_volume INT NOT NULL DEFAULT 0, -- dalam mililiter (mL)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: badges (Koleksi Lencana Gamifikasi Kepahlawanan)
CREATE TABLE badges (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(150) NOT NULL
);

-- Table: user_badges (Relasi Banyak-ke-Banyak Lencana dan Pendonor)
CREATE TABLE user_badges (
    user_id VARCHAR(20) REFERENCES user_profiles(id) ON DELETE CASCADE,
    badge_id VARCHAR(20) REFERENCES badges(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
);


-- -------------------------------------------------------------------------------------
-- 3. INSERT INITIAL SEED DATA
-- -------------------------------------------------------------------------------------

-- Seed: Akun Kredensial Default Admin
INSERT INTO admin (username, email, password) VALUES
('admin', 'admin@utd-soppeng.id', 'pmi2026');

-- Seed: Stok Golongan Darah Saat Ini (PMI Kab. Soppeng)
INSERT INTO blood_stocks (blood_type, bags, volume, status, updated_at) VALUES
('A+', 45, 11250, 'Aman', '2026-06-27 08:30:00+00'),
('A-', 8, 2000, 'Kritis', '2026-06-26 14:15:00+00'),
('B+', 38, 9500, 'Aman', '2026-06-27 09:00:00+00'),
('B-', 4, 1000, 'Kritis', '2026-06-25 11:20:00+00'),
('AB+', 15, 3750, 'Rendah', '2026-06-27 07:45:00+00'),
('AB-', 3, 750, 'Kritis', '2026-06-24 16:00:00+00'),
('O+', 62, 15500, 'Aman', '2026-06-27 10:30:00+00'),
('O-', 9, 2250, 'Kritis', '2026-06-26 13:45:00+00');

-- Seed: Historis Pendonoran Darah Selesai
INSERT INTO donations (id, donor_name, phone, email, blood_type, bags, volume, donation_date, status, location, notes) VALUES
('DON-001', 'Amiruddin Hasan', '0812-3001-4567', 'amiruddin@gmail.com', 'O+', 1, 250, '2026-06-27 08:30:00+00', 'Selesai', 'Gudang Utama UTD PMI Soppeng', 'Donor rutin 3 bulanan'),
('DON-002', 'Ahmad Fauzi', '0812-3456-7890', 'ahmadfauzi@yahoo.com', 'A+', 1, 250, '2026-06-27 09:00:00+00', 'Selesai', 'Gudang Utama UTD PMI Soppeng', 'Kondisi fisik sangat prima'),
('DON-003', 'Oki Pratama', '0852-9988-7766', 'okipratama@gmail.com', 'O+', 1, 250, '2026-06-27 10:30:00+00', 'Selesai', 'Gudang Utama UTD PMI Soppeng', 'Pertama kali donor tahun ini'),
('DON-004', 'Rudi Wijaya', '0821-4433-2211', 'rudiwijaya@gmail.com', 'O-', 1, 250, '2026-06-26 13:45:00+00', 'Selesai', 'Bus Donor Keliling - Lalabata', 'Donor darurat untuk pasien RSUD'),
('DON-005', 'Citra Kirana', '0878-1122-3344', 'citra@gmail.com', 'AB+', 1, 250, '2026-06-26 11:00:00+00', 'Selesai', 'Gudang Utama UTD PMI Soppeng', NULL),
('DON-006', 'Bambang Pamungkas', '0813-5566-7788', 'bambang@gmail.com', 'B+', 1, 250, '2026-06-25 08:00:00+00', 'Selesai', 'Gudang Utama UTD PMI Soppeng', NULL),
('DON-007', 'Mahesa Fauzul Irham', '0812-3456-2026', 'mahesafauzulirham@gmail.com', 'B+', 1, 250, '2026-06-15 10:00:00+00', 'Selesai', 'Gudang Utama UTD PMI Soppeng', 'Donor berkala'),
('DON-008', 'Mahesa Fauzul Irham', '0812-3456-2026', 'mahesafauzulirham@gmail.com', 'B+', 1, 250, '2026-04-10 09:30:00+00', 'Selesai', 'Gudang Utama UTD PMI Soppeng', 'Sesi donor sehat');

-- Seed: Booking Agenda Jadwal Donor Darah
INSERT INTO schedules (id, donor_name, phone, email, blood_type, appointment_date, appointment_time, status, notes) VALUES
('SCH-001', 'Amiruddin Hasan', '0812-3001-4567', 'amiruddin@gmail.com', 'O+', '2026-06-27', '08:30:00', 'Selesai', 'Pemeriksaan tensi normal'),
('SCH-002', 'Ahmad Fauzi', '0812-3456-7890', 'ahmadfauzi@yahoo.com', 'A+', '2026-06-28', '09:00:00', 'Selesai', 'Hemoglobin baik'),
('SCH-003', 'Oki Pratama', '0852-9988-7766', 'okipratama@gmail.com', 'O+', '2026-06-28', '10:30:00', 'Selesai', NULL),
('SCH-004', 'Bambang Sugiharto', '0813-5566-7788', 'bambang@gmail.com', 'B+', '2026-06-29', '08:00:00', 'Menunggu', NULL),
('SCH-005', 'Citra Kirana', '0878-1122-3344', 'citra@gmail.com', 'AB+', '2026-06-30', '11:00:00', 'Menunggu', NULL),
('SCH-006', 'Rudi Wijaya', '0821-4433-2211', 'rudiwijaya@gmail.com', 'O-', '2026-06-30', '14:00:00', 'Menunggu', NULL);

-- Seed: Rumah Sakit Kemitraan PMI
INSERT INTO hospitals (id, name, address, distance, last_sync, status) VALUES
('HSP-001', 'RSUD Latemmamala Soppeng', 'Jl. Malaka No. 6, Watansoppeng, Kec. Lalabata, Kabupaten Soppeng', '1.2 km', '2026-07-12 12:00:00+00', 'Aktif'),
('HSP-002', 'RS Stella Maris (Partner Klinik Soppeng)', 'Jl. Kemakmuran No. 12, Watansoppeng', '2.5 km', '2026-07-12 11:45:00+00', 'Aktif'),
('HSP-003', 'Puskesmas Lalabata', 'Jl. Pemuda No. 4, Watansoppeng', '0.8 km', '2026-07-12 10:30:00+00', 'Terputus');

-- Seed: Kebutuhan Darah Kemitraan RS
INSERT INTO hospital_blood_requests (hospital_id, blood_type, bags_needed) VALUES
('HSP-001', 'A-', 3),
('HSP-001', 'O-', 2),
('HSP-001', 'B-', 1),
('HSP-002', 'AB-', 2),
('HSP-002', 'A-', 1),
('HSP-003', 'O+', 5);

-- Seed: Notifikasi Sistem
INSERT INTO notifications (id, title, message, date, type, is_read) VALUES
('NTF-001', 'Stok Darah Kritis!', 'Golongan darah A-, B-, AB-, O- dalam kondisi kritis. Segera undang pendonor potensial.', '2026-06-27 10:30:00+00', 'danger', FALSE),
('NTF-002', 'Permintaan RSUD Latemmamala', 'RSUD Latemmamala membutuhkan 3 kantong darah A- untuk operasi darurat.', '2026-06-27 09:15:00+00', 'warning', FALSE),
('NTF-003', 'Sinkronisasi Sukses', 'Data stok disinkronkan dengan 2 rumah sakit terdekat secara real-time.', '2026-06-27 08:00:00+00', 'success', TRUE);

-- Seed: Profil Pengguna Pendonor Terdaftar (Mahesa Fauzul Irham)
INSERT INTO user_profiles (id, name, email, phone, blood_type, two_factor_enabled, two_factor_secret, two_factor_verified, total_donations, total_volume) VALUES
('USR-101', 'Mahesa Fauzul Irham', 'mahesafauzulirham@gmail.com', '0812-3456-2026', 'B+', FALSE, 'K4YTMNSVONSWG4TF', FALSE, 2, 500);

-- Seed: Master Data Lencana Gamifikasi
INSERT INTO badges (id, name, description, icon, color) VALUES
('BDG-001', 'Pendonor Pemula', 'Telah mendonorkan darah sebanyak 1 kali', 'Award', 'text-indigo-500 bg-indigo-50 border-indigo-200'),
('BDG-002', 'Ksatria Golongan B', 'Pendonor aktif golongan darah B', 'Shield', 'text-red-500 bg-red-50 border-red-200'),
('BDG-003', 'Pahlawan Kemanusiaan', 'Telah mendonorkan darah sebanyak 5 kali', 'Heart', 'text-rose-500 bg-rose-50 border-rose-200'),
('BDG-004', 'Pendonor Setia', 'Konsisten mendonorkan darah secara berkala dalam 1 tahun', 'Sparkles', 'text-amber-500 bg-amber-50 border-amber-200');

-- Seed: Lencana Pendonor Mahesa Fauzul Irham
INSERT INTO user_badges (user_id, badge_id) VALUES
('USR-101', 'BDG-001'),
('USR-101', 'BDG-002');
