# Deployment and Operations

## 1. Pilot topology

Walaupun repo terpisah, pilot dapat berjalan pada satu VPS menggunakan container terpisah:

```text
API Gateway
Auth Service (2 replicas bila resource cukup)
PostgreSQL
Redis
NATS
Reverse Proxy
Monitoring
Backup Agent
```

Database Auth tetap schema/database khusus dan credential khusus.

## 2. Environment

- local
- development
- staging
- production

Jangan menggunakan key/token production di staging.

## 3. Configuration

Lihat `.env.example`.

Kategori:

- Runtime
- Database
- Redis
- Event broker
- JWT issuer/audience
- Signing key/KMS reference
- Session TTL
- Rate limit
- CORS/cookie
- Observability

## 4. Deployment flow

1. Build immutable image.
2. Generate SBOM dan scan.
3. Jalankan migration job.
4. Deploy canary/rolling.
5. Readiness menunggu database, key provider, dan dependency penting.
6. Verifikasi JWKS.
7. Smoke test login/refresh dummy account staging.
8. Pantau error, latency, dan refresh reuse.
9. Promote atau rollback.

## 5. Migration rules

- Expand/contract.
- Tambah kolom nullable dahulu.
- Deploy code yang kompatibel.
- Backfill.
- Enforce constraint pada release berikutnya.
- Jangan drop column dalam release yang sama dengan perubahan consumer.

## 6. Health

### Liveness

Hanya memastikan process hidup.

### Readiness

Memastikan:

- Database dapat menerima query.
- Active signing key tersedia.
- Redis tersedia bila mode fail-closed membutuhkan.
- Event outbox dapat ditulis.
- Migration version kompatibel.

## 7. Backup

- PostgreSQL automated backup.
- Encryption at rest.
- Retention sesuai environment.
- Restore drill berkala.
- Backup tidak memuat `.env` plaintext.
- Key material dikelola terpisah.

## 8. Scaling

Auth Service stateless kecuali state di PostgreSQL/Redis.

Scale berdasarkan:

- Login RPS.
- Refresh RPS.
- CPU Argon2.
- Database connections.
- Redis latency.

Password hashing perlu worker concurrency limit agar serangan login tidak menghabiskan CPU.

## 9. Failure behavior

### Redis gagal

- Jangan bypass rate limit secara diam-diam.
- Untuk login, pilih fail-closed atau degraded conservative limit.
- Untuk session last-seen, boleh async/best effort.
- Alert wajib.

### Event broker gagal

- State-changing transaction tetap menulis outbox.
- Publisher retry.
- Outbox lag alert.

### KMS/key provider gagal

- Existing key cache boleh dipakai sesuai secure policy.
- Jangan membuat key ad-hoc.
- Readiness dapat gagal bila tidak ada signing key yang valid.

### Database gagal

- Return 503.
- Jangan menerbitkan token tanpa session persistence.

## 10. Runbook minimum

- Suspected refresh token theft.
- Signing key rotation.
- Signing key compromise.
- Credential stuffing spike.
- Account recovery.
- Mass session revocation.
- Database restore.
- Event backlog.
- Redis outage.
