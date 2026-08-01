# ADR-003 — Password Hashing

## Status

Accepted.

## Decision

Gunakan Argon2id untuk password credential.

Baseline awal mengikuti panduan OWASP minimum, kemudian dibenchmark pada hardware production. Parameter disimpan dalam encoded hash dan dapat ditingkatkan melalui rehash saat login sukses.

## Rules

- Unique salt.
- Tidak ada plaintext storage.
- Tidak ada reversible encryption.
- Password tidak masuk log/event.
- Bcrypt hanya untuk migrasi credential legacy bila diperlukan.
- Migration dari hash lama dilakukan setelah verifikasi sukses.
