# Error Catalog

## Prinsip

- HTTP status menunjukkan kategori protokol.
- `error.code` stabil untuk client.
- `message` aman ditampilkan.
- Detail internal hanya di log terproteksi dengan request ID.
- Error login tidak membocorkan apakah account ditemukan.

| HTTP | Code | Message publik |
|---:|---|---|
| 400 | AUTH_VALIDATION_FAILED | Data yang dikirim belum sesuai. |
| 400 | AUTH_TENANT_REQUIRED | Kode organisasi diperlukan. |
| 400 | AUTH_PASSWORD_POLICY_FAILED | Password belum memenuhi ketentuan keamanan. |
| 401 | AUTH_INVALID_CREDENTIALS | Data login tidak valid atau akun tidak dapat digunakan. |
| 401 | AUTH_TOKEN_INVALID | Sesi tidak valid. Silakan masuk kembali. |
| 401 | AUTH_TOKEN_EXPIRED | Sesi telah berakhir. Silakan masuk kembali. |
| 401 | AUTH_SESSION_REVOKED | Sesi telah dihentikan. Silakan masuk kembali. |
| 401 | AUTH_SESSION_COMPROMISED | Sesi dihentikan untuk keamanan. Silakan masuk kembali. |
| 401 | AUTH_MFA_REQUIRED | Verifikasi tambahan diperlukan. |
| 401 | AUTH_MFA_INVALID | Kode verifikasi tidak valid. |
| 403 | AUTH_TENANT_ACCESS_DENIED | Anda tidak memiliki akses ke organisasi ini. |
| 403 | AUTH_ACCOUNT_ACTION_REQUIRED | Tindakan keamanan akun diperlukan. |
| 409 | AUTH_IDENTIFIER_CONFLICT | Identifier tidak dapat digunakan. |
| 409 | AUTH_REFRESH_CONFLICT | Permintaan pembaruan sesi bertabrakan. Coba kembali. |
| 410 | AUTH_CHALLENGE_EXPIRED | Permintaan verifikasi telah berakhir. |
| 422 | AUTH_CHALLENGE_ALREADY_USED | Permintaan verifikasi sudah digunakan. |
| 429 | AUTH_RATE_LIMITED | Terlalu banyak percobaan. Coba kembali nanti. |
| 503 | AUTH_DEPENDENCY_UNAVAILABLE | Layanan autentikasi sementara tidak tersedia. |

Client tidak boleh membuat keputusan keamanan hanya dari message; gunakan code dan status flow.
