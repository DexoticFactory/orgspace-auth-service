# Security and Privacy

## 1. Threat model ringkas

Aset paling kritis:

- Password hash
- Refresh token
- Signing private key
- MFA secret
- Recovery code
- Reset/verification challenge
- Session metadata
- Tenant access projection

Ancaman:

- Credential stuffing
- Password spraying
- Account enumeration
- Session hijacking
- Refresh token replay
- JWT algorithm confusion
- Signing key leakage
- Cross-tenant privilege escalation
- Insider misuse
- Log leakage
- CSRF pada web
- Brute force OTP
- Race condition saat refresh
- Event replay atau duplicate delivery

## 2. Password

- Gunakan Argon2id.
- Unique salt disertakan oleh implementation.
- Parameter minimum harus mengikuti benchmark server dan baseline keamanan.
- Hash di-upgrade saat login sukses.
- Jangan mengenkripsi password agar dapat dibaca kembali.
- Jangan menyimpan password di log, analytics, error tracker, atau event.
- Tolak password umum bila tersedia breach password checking.
- Gunakan pesan generik.

## 3. JWT

Verifier wajib:

- Allowlist algorithm.
- Validasi signature.
- Validasi `iss`.
- Validasi `aud`.
- Validasi expiry/not-before.
- Validasi explicit token type.
- Tolak key/algorithm yang tidak sesuai.
- Tolak claim tenant yang tidak valid terhadap resource.
- Gunakan key ID hanya untuk memilih key dari trusted JWKS, bukan mengambil URL arbitrary dari token.

## 4. Refresh token

- Random minimum 256-bit.
- Stored hash only.
- Rotation setiap penggunaan.
- Transaksi dan row locking/compare-and-swap untuk mencegah double refresh.
- Reuse detection mencabut token family.
- Token tidak dikirim lewat query string.
- Token tidak masuk log.
- Web cookie: `HttpOnly`, `Secure`, `SameSite`.
- Mobile: OS secure storage.

## 5. Rate limiting dan anti-automation

Rate limit minimal:

- Per IP.
- Per normalized identifier fingerprint.
- Per account.
- Per installation/device signal.
- Per challenge.

Gunakan progressive delay dan alert. Jangan melakukan permanent lock hanya berdasarkan serangan eksternal karena dapat dipakai untuk DoS terhadap korban.

## 6. Account enumeration

- Forgot password selalu memberi response generik.
- Login error generik.
- Registration/invite conflict tidak membuka informasi sensitif.
- Pertahankan waktu response yang wajar dan tidak terlalu berbeda.
- Email/SMS hanya dikirim bila account eligible.

## 7. MFA

- TOTP secret dienkripsi menggunakan key terpisah.
- OTP memiliki attempt limit.
- Replay OTP dalam time step yang sama dapat dicegah untuk operasi kritis.
- Recovery code disimpan sebagai hash.
- Disable MFA memerlukan re-authentication.
- Reset MFA adalah privileged support workflow dengan audit.

## 8. CSRF

Untuk refresh/logout web berbasis cookie:

- SameSite sesuai use case.
- Validate Origin/Referer untuk state-changing endpoint.
- Gunakan CSRF token bila arsitektur membutuhkan cross-site flow.
- CORS menggunakan allowlist spesifik; jangan wildcard dengan credential.

## 9. Logging

Dilarang masuk log:

- Password
- Access token
- Refresh token
- Reset token
- Verification token
- OTP
- TOTP secret
- Recovery codes
- Cookie header
- Authorization header

Email/phone pada log dimasking atau difingerprint dengan keyed hash.

## 10. Secrets dan keys

- Secret tidak di-commit.
- `.env.example` hanya placeholder.
- Production memakai secret manager.
- Key rotation diuji.
- Akses KMS mengikuti least privilege.
- Backup private key mengikuti kontrol yang sama ketat.
- Emergency rotation memiliki prosedur.

## 11. Database

- Tidak public.
- TLS bila lintas host.
- User aplikasi bukan superuser.
- Migration role dipisah dari runtime role.
- Backup terenkripsi.
- Restore test berkala.
- Query menggunakan parameter binding.
- Sensitive column access dibatasi.

## 12. Tenant isolation

- `tid` dari token bukan satu-satunya validasi.
- Resource service memastikan tenant pada resource sama dengan `tid`.
- Auth tidak menerbitkan token untuk projection nonaktif.
- Internal upsert memakai source version/idempotency.
- Security test wajib mencakup tenant swapping.

## 13. Privacy

- Kumpulkan data minimum.
- IP/user agent hanya untuk keamanan dan session display.
- Informasikan penggunaan session metadata kepada user.
- Sediakan revoke session.
- Penuhi deletion/retention policy.
- Auth Service tidak menyimpan data biometrik.

## 14. Incident response

Indikator:

- Refresh reuse spike.
- Login failure spike.
- Unusual multi-tenant selection.
- Key access anomaly.
- Banyak reset password.
- MFA disable anomaly.

Tindakan:

1. Batasi endpoint terdampak.
2. Cabut token family/account session.
3. Rotate signing key bila perlu.
4. Preserve audit evidence.
5. Notify security owner.
6. Publish post-incident corrective action.
