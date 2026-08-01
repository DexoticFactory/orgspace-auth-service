# Implementation Backlog

## EPIC AUTH-001 — Repository foundation

- Bootstrap NestJS.
- Config validation.
- Structured logging + redaction.
- Request ID.
- PostgreSQL connection.
- Redis connection.
- NATS/outbox publisher.
- Health endpoints.
- OpenTelemetry.
- CI security gates.

## EPIC AUTH-002 — Account and identifier

- Account domain model.
- Identifier normalization.
- Email/phone/global username.
- Tenant username.
- Internal create account.
- Idempotency.
- Account status command.
- Audit/outbox.

## EPIC AUTH-003 — Password credential

- Argon2id adapter.
- Password policy.
- Temporary credential.
- Forced change.
- Password history.
- Rehash on login.

## EPIC AUTH-004 — Tenant access projection

- Inbound event consumer.
- Internal upsert endpoint.
- Version ordering.
- Duplicate handling.
- Reconciliation command.
- Tenant selector query.

## EPIC AUTH-005 — Login

- Rate limit.
- Generic errors.
- Password verify.
- Account policy.
- Single/multiple tenant flow.
- Pre-auth challenge.
- Login audit.
- Success/failure events.

## EPIC AUTH-006 — Token and session

- Signing key loader.
- JWKS.
- Access token issuer.
- Session model.
- Refresh token family.
- Rotation.
- Reuse detection.
- Session list/revoke.
- Logout-all.

## EPIC AUTH-007 — Recovery

- Forgot password.
- Reset challenge.
- Provider/event adapter.
- Reset password transaction.
- Email verification.
- Security notification events.

## EPIC AUTH-008 — MFA

- TOTP setup.
- TOTP confirm.
- Recovery codes.
- Login challenge.
- MFA required policy.
- Disable/recovery workflow.

## EPIC AUTH-009 — Security hardening

- CSRF controls.
- CORS validation.
- Abuse dashboard metrics.
- Key rotation.
- Log leak tests.
- Penetration test fixes.
- Runbooks.
