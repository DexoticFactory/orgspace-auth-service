# Acceptance Criteria

## Epic 1 — Account

- Account dapat dibuat melalui internal API dengan idempotency key.
- Duplicate request tidak membuat account kedua.
- Password tidak pernah dikembalikan.
- Account suspended tidak dapat login.
- Audit log mencatat actor, reason, request ID.

## Epic 2 — Identifier

- Email dinormalisasi.
- Phone disimpan E.164.
- Tenant username unik per tenant.
- Tenant username yang sama dapat digunakan pada tenant berbeda.
- Response conflict tidak membocorkan data account lain.

## Epic 3 — Login

- Kredensial valid menghasilkan flow yang tepat.
- Kredensial salah menghasilkan error generik.
- Multiple tenant menghasilkan selector.
- Tenant suspended tidak muncul.
- Temporary password menghasilkan forced change.
- Rate limit aktif dan diuji.

## Epic 4 — Token

- Access token diverifikasi oleh JWKS.
- Wrong issuer/audience/algorithm ditolak.
- Token memuat minimum claims.
- Refresh token dirotasi.
- Refresh token hash saja yang tersimpan.
- Reuse token lama mencabut family.
- Logout mencabut refresh session.

## Epic 5 — Session

- User melihat semua session aktif.
- User dapat revoke session lain.
- Logout-all bekerja sesuai flag.
- Session absolute expiry tidak dapat diperpanjang lewat refresh.
- Device name disanitasi.

## Epic 6 — Recovery

- Forgot password response sama untuk identifier ada/tidak.
- Reset token sekali pakai.
- Expired token ditolak.
- Password baru disimpan Argon2id.
- Session lama dicabut sesuai policy.
- Security event diterbitkan.

## Epic 7 — Tenant projection

- Duplicate event tidak menggandakan data.
- Event lama tidak menimpa version lebih baru.
- Revoked membership tidak dapat dipilih.
- Authorization version masuk token.
- Tidak ada query database lintas service.

## Epic 8 — Security

- Tidak ada secret/token di log test.
- JWT confusion tests gagal dengan aman.
- CSRF control diterapkan untuk cookie endpoint.
- CORS tidak wildcard dengan credentials.
- Key rotation tidak memutus token valid sebelum expiry.
- Secret scan dan dependency scan menjadi CI gate.

## Definition of done

Sebuah fitur selesai bila:

- Requirement dan API contract diperbarui.
- Unit dan integration test lulus.
- Audit event tersedia.
- Error code terdokumentasi.
- Metrics tersedia.
- Migration aman.
- Security review untuk perubahan auth-sensitive selesai.
- Runbook diperbarui bila menambah failure mode.
