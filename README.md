# orgspace-auth-service

Layanan identitas dan autentikasi untuk platform OrgSpace.

Repo ini hanya menangani **akun, kredensial, autentikasi, sesi, token, MFA, verifikasi kontak, dan proyeksi akses tenant**. Repo ini tidak menyimpan profil karyawan/siswa, konfigurasi perusahaan/sekolah, data biometrik, absensi, shift, tugas, payroll, atau berita.

## Tujuan

- Satu akun dapat masuk ke satu atau beberapa tenant.
- Karyawan, pekerja lapangan, guru, siswa, dan admin dapat menggunakan mekanisme login yang sesuai.
- Mobile App dan Web Dashboard menggunakan sesi yang aman tetapi tetap nyaman.
- Setiap akses memiliki tenant context yang eksplisit.
- Token dapat dicabut, dirotasi, diaudit, dan dipulihkan ketika terjadi penyalahgunaan.
- Service lain tidak membaca database Auth Service secara langsung.

## Stack yang disarankan

- Node.js LTS
- NestJS
- PostgreSQL
- Redis
- NATS JetStream atau broker event yang disepakati
- OpenAPI
- Docker
- OpenTelemetry

## Struktur dokumentasi

```text
docs/
├── 00-SCOPE-AND-BOUNDARIES.md
├── 01-PRD.md
├── 02-REQUIREMENTS.md
├── 03-USER-FLOWS.md
├── 04-DESIGN.md
├── 05-API.md
├── 06-DATA-MODEL.md
├── 07-AUTHORIZATION.md
├── 08-SECURITY.md
├── 09-EVENTS.md
├── 10-ERROR-CATALOG.md
├── 11-TESTING.md
├── 12-DEPLOYMENT.md
├── 13-ROADMAP.md
├── 14-ACCEPTANCE-CRITERIA.md
├── REFERENCES.md
└── adr/
    ├── ADR-001-TOKEN-STRATEGY.md
    ├── ADR-002-TENANT-CONTEXT.md
    └── ADR-003-PASSWORD-HASHING.md
```

## Keputusan inti

1. Access token berupa JWT berumur pendek.
2. Refresh token berupa nilai acak opaque, disimpan dalam bentuk hash, dan dirotasi setiap penggunaan.
3. Akun bersifat global; akses tenant bersifat tenant-scoped.
4. Tenant Service tetap menjadi sumber kebenaran membership dan role assignment.
5. Auth Service menyimpan proyeksi akses tenant untuk menerbitkan token tanpa membaca database service lain.
6. Private signing key tidak disimpan di source code atau image container.
7. Mobile menyimpan refresh token di secure storage; web menggunakan cookie `HttpOnly`, `Secure`, dan `SameSite`.
8. Biometric attendance tidak menjadi metode login utama pada versi awal dan tidak disimpan di Auth Service.

## Mulai dari sini

Urutan baca yang disarankan:

1. `docs/00-SCOPE-AND-BOUNDARIES.md`
2. `docs/01-PRD.md`
3. `docs/03-USER-FLOWS.md`
4. `docs/04-DESIGN.md`
5. `docs/05-API.md`
6. `docs/06-DATA-MODEL.md`
7. `docs/08-SECURITY.md`
8. `docs/14-ACCEPTANCE-CRITERIA.md`

Spesifikasi OpenAPI awal tersedia di `openapi/openapi.yaml`.
