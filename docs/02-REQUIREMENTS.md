# Requirements

Kata **MUST**, **SHOULD**, dan **MAY** digunakan sebagai tingkat kewajiban.

## 1. Functional requirements

### Account

- AUTH-FR-001 — Service MUST membuat global account dengan ID yang tidak dapat ditebak.
- AUTH-FR-002 — Service MUST mendukung status account.
- AUTH-FR-003 — Service MUST mencegah login untuk account suspended, disabled, atau deleted.
- AUTH-FR-004 — Service MUST menyimpan perubahan status beserta actor dan reason.
- AUTH-FR-005 — Service MUST mendukung forced password change.

### Identifier

- AUTH-FR-010 — Service MUST mendukung email.
- AUTH-FR-011 — Service MUST mendukung phone dalam format E.164.
- AUTH-FR-012 — Service MUST mendukung global username.
- AUTH-FR-013 — Service MUST mendukung tenant username.
- AUTH-FR-014 — Tenant username MUST unik di dalam tenant, bukan secara global.
- AUTH-FR-015 — Identifier MUST dinormalisasi sebelum pencarian.
- AUTH-FR-016 — Satu identifier terverifikasi MUST tidak boleh ditautkan ke dua account aktif.

### Password

- AUTH-FR-020 — Password MUST disimpan dengan Argon2id.
- AUTH-FR-021 — Password plaintext MUST hanya berada di memory selama proses verifikasi.
- AUTH-FR-022 — Service MUST mendukung password history untuk mencegah penggunaan ulang bila policy mengaktifkannya.
- AUTH-FR-023 — Temporary password MUST memiliki expiry.
- AUTH-FR-024 — Temporary password MUST memaksa perubahan pada login pertama.
- AUTH-FR-025 — Password policy MUST dapat dikonfigurasi dengan batas aman minimum platform.

### Login

- AUTH-FR-030 — Login MUST menerima identifier dan password.
- AUTH-FR-031 — Login tenant username MUST memerlukan tenant code.
- AUTH-FR-032 — Login MUST menghasilkan response generik untuk kredensial salah dan account tidak ditemukan.
- AUTH-FR-033 — Login MUST menerapkan rate limit per IP, account candidate, dan device signal.
- AUTH-FR-034 — Login MUST mencatat success/failure tanpa credential plaintext.
- AUTH-FR-035 — Login MUST meminta MFA apabila policy mewajibkan.
- AUTH-FR-036 — Login MUST mengembalikan tenant selector ketika user memiliki beberapa tenant aktif.
- AUTH-FR-037 — Login MUST tidak mengembalikan tenant suspended/revoked.

### Tenant selection

- AUTH-FR-040 — User MUST dapat memilih tenant aktif.
- AUTH-FR-041 — Service MUST memvalidasi tenant access projection.
- AUTH-FR-042 — Token tenant-scoped MUST memiliki `tid`.
- AUTH-FR-043 — Perubahan tenant MUST tidak memerlukan password ulang selama session masih valid.
- AUTH-FR-044 — High-risk tenant MAY meminta step-up authentication.

### Token dan session

- AUTH-FR-050 — Access token MUST menggunakan asymmetric signing.
- AUTH-FR-051 — Access token MUST memiliki `iss`, `aud`, `sub`, `sid`, `jti`, `iat`, `exp`, dan token type.
- AUTH-FR-052 — Tenant-scoped access token MUST memiliki `tid` dan `azv`.
- AUTH-FR-053 — Refresh token MUST opaque dan memiliki sekurangnya 256-bit entropy.
- AUTH-FR-054 — Refresh token MUST disimpan sebagai hash.
- AUTH-FR-055 — Refresh token MUST dirotasi pada setiap refresh.
- AUTH-FR-056 — Reuse token lama MUST mencabut seluruh token family.
- AUTH-FR-057 — User MUST dapat mencabut session.
- AUTH-FR-058 — Password reset MUST mencabut session sesuai policy.
- AUTH-FR-059 — Service MUST mendukung key rotation dan JWKS.

### Verification dan recovery

- AUTH-FR-060 — User MUST dapat meminta verifikasi email.
- AUTH-FR-061 — Verification token MUST sekali pakai.
- AUTH-FR-062 — Forgot password response MUST generik.
- AUTH-FR-063 — Reset token MUST memiliki expiry.
- AUTH-FR-064 — Token MUST disimpan sebagai hash.
- AUTH-FR-065 — Reset password MUST menghasilkan security event.

### MFA

- AUTH-FR-070 — Service MUST mendukung TOTP untuk fase pertama MFA.
- AUTH-FR-071 — TOTP secret MUST dienkripsi at rest.
- AUTH-FR-072 — Setup MUST dikonfirmasi sebelum factor aktif.
- AUTH-FR-073 — Recovery code MUST disimpan sebagai hash.
- AUTH-FR-074 — Recovery code MUST sekali pakai.
- AUTH-FR-075 — Disable MFA MUST meminta recent authentication.

### Internal integration

- AUTH-FR-080 — Service MUST menerima perubahan tenant access melalui event atau internal API idempotent.
- AUTH-FR-081 — Service MUST mempublikasikan account/session security events menggunakan outbox.
- AUTH-FR-082 — Internal endpoint MUST memakai service authentication.
- AUTH-FR-083 — API Gateway MUST memverifikasi JWT melalui JWKS.
- AUTH-FR-084 — Service consumer MUST tidak bergantung pada database Auth Service.

## 2. Non-functional requirements

### Performance

- AUTH-NFR-001 — P95 login tanpa MFA ≤ 500 ms, tidak termasuk provider email/SMS.
- AUTH-NFR-002 — P95 refresh ≤ 250 ms.
- AUTH-NFR-003 — P95 JWKS ≤ 100 ms dan cacheable.
- AUTH-NFR-004 — Database query penting MUST memiliki index terukur.

### Availability

- AUTH-NFR-010 — Target availability pilot 99.5%.
- AUTH-NFR-011 — Service MUST menyediakan liveness dan readiness probe.
- AUTH-NFR-012 — Signing key active MUST tersedia saat instance restart.
- AUTH-NFR-013 — Redis failure MUST tidak menyebabkan bypass security; service boleh menolak request berisiko.

### Security

- AUTH-NFR-020 — Semua komunikasi eksternal MUST memakai TLS.
- AUTH-NFR-021 — Secret MUST berasal dari secret manager atau environment injection.
- AUTH-NFR-022 — Log MUST melalui redaction.
- AUTH-NFR-023 — Service MUST memiliki dependency scanning dan secret scanning.
- AUTH-NFR-024 — Production database MUST tidak dapat diakses publik.
- AUTH-NFR-025 — Privileged operation MUST memiliki audit trail.

### Privacy

- AUTH-NFR-030 — Token MUST memuat data minimum.
- AUTH-NFR-031 — IP dan user agent retention MUST terdokumentasi.
- AUTH-NFR-032 — Deleted account MUST mengikuti retention policy.
- AUTH-NFR-033 — Data auth tidak boleh dipakai untuk pelacakan di luar tujuan keamanan.

### Maintainability

- AUTH-NFR-040 — API dan event MUST berversi.
- AUTH-NFR-041 — Migration MUST forward-compatible selama rolling deployment.
- AUTH-NFR-042 — Business logic MUST dipisah dari transport layer.
- AUTH-NFR-043 — Test coverage critical auth paths MUST tinggi dan mutation/security testing dianjurkan.
