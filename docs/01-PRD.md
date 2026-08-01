# Product Requirements Document — Auth Service

## 1. Ringkasan

Auth Service menyediakan autentikasi terpadu untuk OrgSpace, platform multi-tenant yang digunakan perusahaan dan institusi pendidikan. Service harus melayani pengguna yang memiliki email maupun pengguna yang hanya memiliki nomor anggota internal seperti employee ID atau student ID.

## 2. Masalah

Platform memiliki beberapa karakter pengguna:

- Karyawan kantor biasanya memiliki email atau nomor telepon.
- Pekerja lapangan dapat memakai perangkat bersama atau jaringan tidak stabil.
- Siswa belum tentu memiliki email pribadi.
- Guru dan admin dapat tergabung di beberapa tenant.
- Owner atau HR membutuhkan keamanan lebih tinggi.
- Satu tenant dapat menonaktifkan akun tanpa menonaktifkan account global di tenant lain.
- Mobile App dan Web Dashboard membutuhkan pola penyimpanan token yang berbeda.

Tanpa service identitas yang terpisah, risiko yang muncul adalah duplikasi akun, token tidak dapat dicabut, kebocoran lintas tenant, role tidak sinkron, dan log keamanan tidak dapat ditelusuri.

## 3. Sasaran produk

### Sasaran utama

- Menyediakan login yang konsisten untuk mobile dan web.
- Menjaga pemisahan account global dan akses tenant.
- Memungkinkan satu account berpindah tenant tanpa login ulang.
- Mendukung identifier yang sesuai untuk pekerja dan siswa.
- Menyediakan session management yang dapat dicabut per perangkat.
- Menyediakan fondasi MFA untuk akun berisiko tinggi.
- Menghasilkan audit trail untuk aktivitas autentikasi.
- Meminimalkan ketergantungan sinkron kepada service lain.

### Sasaran pilot

- Email/password login.
- Tenant username/password login.
- Pemilihan tenant.
- Access token dan rotating refresh token.
- Logout perangkat aktif.
- Logout semua perangkat.
- Lupa dan reset password.
- Verifikasi email.
- Daftar sesi.
- Admin suspend account melalui internal API.
- Sinkronisasi tenant access melalui event/internal API.
- Audit login sukses/gagal.

## 4. Non-goals fase pilot

- Social login.
- SAML enterprise SSO.
- Passkey/WebAuthn.
- Login menggunakan wajah.
- Passwordless magic link sebagai metode utama.
- Risk engine berbasis machine learning.
- Guardian account.
- SCIM provisioning.
- Cross-region active-active.

Fitur tersebut boleh masuk roadmap, tetapi tidak boleh memperlambat pilot.

## 5. Persona

### Employee

Ingin login cepat dari mobile, tidak sering diminta memasukkan password, dan dapat keluar dari perangkat lama.

### Student

Mungkin tidak memiliki email. Login menggunakan kode sekolah, nomor siswa, dan password sementara yang wajib diganti.

### HR/Admin

Mengelola status account, memutus semua sesi saat perangkat hilang, dan memerlukan MFA.

### Platform operator

Menangani account bermasalah tanpa melihat password atau refresh token mentah.

### Service consumer

API Gateway dan backend service membutuhkan token yang dapat diverifikasi dengan public key dan claim yang jelas.

## 6. Use case utama

1. Login dengan email/phone/username.
2. Login dengan tenant code + member code.
3. First login menggunakan temporary password.
4. Memilih tenant ketika memiliki lebih dari satu membership.
5. Refresh access token.
6. Mendeteksi reuse refresh token.
7. Logout dari perangkat saat ini.
8. Menghapus sesi perangkat lain.
9. Lupa password tanpa membocorkan keberadaan akun.
10. Mengubah password dan mencabut sesi lain.
11. Verifikasi email.
12. Mengaktifkan TOTP MFA.
13. Menonaktifkan akun atau akses tenant.
14. Menampilkan riwayat perangkat aktif.
15. Mengganti tenant aktif.

## 7. Functional scope

### Account lifecycle

Status account:

```text
pending_activation
active
locked
suspended
disabled
deleted
```

Status tenant access:

```text
invited
active
suspended
revoked
```

Account global dapat tetap `active` walaupun akses ke satu tenant `suspended`.

### Login

Login harus:

- Menormalisasi identifier.
- Menghasilkan pesan error generik.
- Melakukan rate limiting.
- Memeriksa account status.
- Memeriksa password.
- Memeriksa MFA bila diwajibkan.
- Membuat session.
- Menawarkan tenant selection bila lebih dari satu tenant.
- Tidak menerbitkan tenant-scoped token untuk membership nonaktif.

### Token

Access token:

- JWT dengan asymmetric signature.
- Berumur pendek.
- Memiliki issuer dan audience yang divalidasi.
- Memiliki explicit token type.
- Tidak memuat PII yang tidak dibutuhkan.
- Tenant-scoped setelah tenant dipilih.

Refresh token:

- Opaque random secret.
- Disimpan hash-nya.
- Terikat pada session dan token family.
- Dirotasi setiap refresh.
- Reuse menyebabkan pencabutan token family.
- Tidak boleh dimasukkan ke URL atau log.

### Session management

User dapat:

- Melihat perangkat aktif.
- Melihat last activity dan perkiraan lokasi dari IP bila diaktifkan.
- Mencabut sesi tertentu.
- Mencabut semua sesi kecuali sesi saat ini.
- Mendapat peringatan login baru melalui event.

### Password recovery

- Response selalu generik.
- Token reset sekali pakai.
- Token reset memiliki kedaluwarsa pendek.
- Setelah reset, semua refresh token lama dicabut secara default.
- User menerima event/security notification.

### MFA

Pilot minimal mendukung TOTP untuk admin/HR:

- Setup dengan secret sementara.
- Confirm dengan OTP.
- Recovery codes.
- Disable memerlukan re-authentication.
- Tenant dapat mewajibkan MFA berdasarkan role melalui policy projection.

## 8. UX rules

- Jangan menampilkan apakah email tertentu terdaftar.
- Login failure menggunakan pesan: “Data login tidak valid atau akun tidak dapat digunakan.”
- Bila account memiliki beberapa tenant, tampilkan daftar tenant tanpa meminta password ulang.
- Bila temporary password digunakan, paksa penggantian password sebelum akses aplikasi.
- Mobile mempertahankan session melalui secure storage.
- Web menggunakan secure cookie untuk refresh token.
- Error keamanan tidak menjelaskan detail internal.

## 9. Success metrics

- Login success rate valid user ≥ 99%.
- P95 login API tanpa MFA ≤ 500 ms di kondisi normal.
- P95 refresh API ≤ 250 ms.
- Tidak ada cross-tenant token issuance pada automated security tests.
- 100% refresh token reuse test menyebabkan family revocation.
- 100% password dan refresh token tersimpan dalam bentuk non-reversible/hash.
- Audit event tersedia untuk seluruh state-changing auth operation.
- Tidak ada credential/token mentah di application logs.

## 10. Risiko

| Risiko | Mitigasi |
|---|---|
| Credential stuffing | Rate limit, progressive delay, MFA, monitoring |
| Refresh token dicuri | Rotation, hash storage, reuse detection |
| Cross-tenant access | Explicit tenant selection, authorization version, server-side validation |
| Stale role | Projection version dan token TTL pendek |
| Account enumeration | Response generik dan timing yang konsisten |
| Shared device | Session list, revoke, optional shorter idle timeout |
| Student lupa password | Admin-issued temporary credential dengan forced change |
| Service outage | Cached JWKS, token TTL pendek, health checks |
