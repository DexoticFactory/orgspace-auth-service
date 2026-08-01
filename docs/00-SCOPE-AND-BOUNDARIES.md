# Scope and Boundaries

## Tanggung jawab Auth Service

Auth Service adalah sumber kebenaran untuk:

- Global account
- Login identifier
- Password credential
- Email dan nomor telepon terverifikasi
- Account status
- Login attempt
- Session dan device session
- Access token
- Refresh token family
- Password reset
- Contact verification challenge
- MFA factor
- Recovery code
- Signing key metadata
- Auth audit event
- Tenant access projection untuk penerbitan token

## Bukan tanggung jawab Auth Service

| Data/Proses | Pemilik |
|---|---|
| Nama, foto profil, tanggal lahir, jabatan | People Service |
| Employee ID/student ID sebagai data organisasi | People Service |
| Tenant, logo, branding, fitur aktif | Tenant Service |
| Membership dan role assignment sumber utama | Tenant Service |
| Menu hide/show dan custom layout | Tenant Service |
| Face embedding dan liveness | Biometric Service |
| Check-in/check-out | Attendance Service |
| Shift, jadwal, dan task | Workforce Service |
| Payroll | Payroll Service |
| Berita/pengumuman | Content Service |
| Push/email/WhatsApp delivery | Notification Service |

## Aturan keras antar-service

- Tidak ada shared database.
- Service lain tidak boleh query tabel Auth Service.
- Auth Service tidak boleh query database Tenant atau People Service.
- Sinkronisasi lintas domain menggunakan API internal dan event yang berversi.
- Semua internal command wajib memakai service authentication.
- Semua perubahan state penting wajib menghasilkan audit log dan outbox event.
- `tenant_id` harus eksplisit pada operasi tenant-scoped.
- Permission tidak boleh ditentukan hanya dari menu yang terlihat di frontend.

## Model identitas

### Global account

Satu manusia idealnya memiliki satu `account_id` global. Account dapat digunakan pada lebih dari satu perusahaan/sekolah.

### Tenant membership

Hubungan account dengan organisasi tidak dimiliki Auth Service. Tenant Service mengirim proyeksi:

```json
{
  "accountId": "acc_01...",
  "tenantId": "ten_01...",
  "membershipId": "mem_01...",
  "status": "active",
  "roles": ["employee"],
  "authorizationVersion": 12
}
```

Auth Service menggunakan proyeksi tersebut ketika user memilih tenant dan saat refresh token.

### Identifier

Jenis identifier yang didukung:

- `email`
- `phone`
- `global_username`
- `tenant_username`

`tenant_username` cocok untuk siswa atau karyawan yang tidak memiliki email pribadi. Login jenis ini wajib disertai `tenantCode`.

Contoh:

```json
{
  "tenantCode": "SOLID",
  "identifier": "EMP-0021",
  "password": "..."
}
```

## Batas face recognition

Face enrollment untuk absensi tidak masuk Auth Service. Auth Service hanya dapat menerbitkan informasi autentikasi account kepada Biometric Service melalui token internal.

Apabila kelak face login dibutuhkan, fitur tersebut harus melalui ADR dan threat modeling terpisah. Jangan memakai face verification attendance sebagai pengganti login tanpa evaluasi keamanan.
