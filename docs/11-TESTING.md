# Testing Strategy

## 1. Unit tests

Wajib mencakup:

- Identifier normalization.
- Password verify dan rehash.
- Account status policy.
- Tenant selection.
- Token claim builder.
- Refresh token hash.
- Rotation state machine.
- Reuse detection.
- Challenge expiry/consumption.
- MFA verification.
- Authorization version handling.
- Error mapping.
- Log redaction.

## 2. Integration tests

Dengan PostgreSQL dan Redis nyata melalui container:

- Create account transaction.
- Login sukses/gagal.
- Rate limit.
- Session creation.
- Concurrent refresh.
- Refresh reuse.
- Password reset atomicity.
- Outbox write.
- Idempotent internal command.
- Tenant projection event duplicate.
- Key rotation.

## 3. Contract tests

- OpenAPI lint.
- Response schema.
- Backward compatibility.
- Event JSON schema.
- Consumer-driven contract untuk gateway dan tenant service.

## 4. End-to-end scenarios

### Employee single tenant

Login → token → refresh → logout.

### Student tenant username

Tenant code + student ID → temporary password → forced change → session.

### Multi-tenant user

Login → tenant list → select tenant A → switch tenant B.

### Suspended membership

Account aktif, tenant A suspended, tenant B active → hanya tenant B tersedia.

### Lost device

Session A dan B → revoke A dari B → refresh A gagal.

### Token theft simulation

R1 digunakan → R2 diterbitkan → R1 digunakan lagi → seluruh family revoked.

### Password reset

Forgot response generic untuk existing/non-existing identifier → valid reset → sessions revoked.

### MFA admin

Password → MFA challenge → TOTP → token `amr` sesuai.

## 5. Security tests

- JWT `alg=none`.
- Algorithm confusion.
- Wrong issuer.
- Wrong audience.
- Expired token.
- Token type confusion.
- Modified `tid`.
- Cross-tenant resource access.
- Refresh brute force.
- OTP brute force.
- Account enumeration timing sampling.
- CSRF on cookie endpoints.
- CORS misconfiguration.
- SQL injection.
- Header/log injection.
- Sensitive data log scan.
- Concurrent refresh race.
- Replay event.
- Duplicate idempotency key dengan payload berbeda.

## 6. Performance tests

Workloads:

- Login burst.
- Refresh steady state.
- JWKS high-read.
- Tenant selection.
- Session list.
- Attack-like failed login traffic.

Acceptance:

- Tidak ada bypass saat Redis lambat.
- Database pool stabil.
- P95 sesuai NFR.
- Rate limiter tidak menjadi bottleneck tunggal.
- Outbox lag terukur.

## 7. CI gates

- Format/lint.
- Type check.
- Unit tests.
- Integration tests.
- OpenAPI lint.
- Migration verification.
- SAST.
- Dependency audit.
- Secret scan.
- Container scan.
- SBOM.
- Test coverage threshold untuk critical modules.
