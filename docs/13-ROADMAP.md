# Roadmap

## Phase A — Foundation

- Repo bootstrap.
- PostgreSQL migration.
- Account dan identifier.
- Password credential.
- Internal create account.
- OpenAPI dan error model.
- Audit/outbox.

## Phase B — Login dan session

- Login email/phone/global username.
- Tenant username login.
- Single-tenant session.
- Multiple-tenant selector.
- Access JWT.
- Refresh rotation.
- JWKS.
- Logout dan session list.

## Phase C — Recovery dan administration

- Forgot/reset password.
- Email verification.
- Temporary credential.
- Forced password change.
- Account suspend.
- Revoke sessions.
- Security events.

## Phase D — MFA dan hardening

- TOTP.
- Recovery codes.
- Admin MFA policy.
- Progressive rate limiting.
- Abuse monitoring.
- Key rotation automation.
- Penetration/security testing.

## Phase E — Future

- Passkeys/WebAuthn.
- Social login.
- SAML/OIDC enterprise SSO.
- SCIM.
- Guardian account.
- Risk-based step-up.
- Device attestation.
- Support impersonation workflow dengan approval dan audit ketat.

## Pilot cut line

Pilot dinyatakan cukup setelah Phase A–C selesai dan security baseline Phase D untuk rate limiting/key management diterapkan. MFA dapat diwajibkan sebelum dashboard admin dipakai production.
