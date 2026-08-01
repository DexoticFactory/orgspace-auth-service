# Event Catalog

Event envelope:

```json
{
  "eventId": "evt_01...",
  "eventType": "auth.account.created.v1",
  "occurredAt": "2026-08-01T10:00:00Z",
  "producer": "orgspace-auth-service",
  "correlationId": "req_01...",
  "data": {}
}
```

## Outbound events

### `auth.account.created.v1`

```json
{
  "accountId": "acc_01...",
  "status": "pending_activation"
}
```

### `auth.account.activated.v1`

### `auth.account.status_changed.v1`

```json
{
  "accountId": "acc_01...",
  "previousStatus": "active",
  "newStatus": "suspended",
  "reason": "security_review"
}
```

### `auth.login.succeeded.v1`

Metadata harus minim dan tidak mengandung token.

### `auth.login.failed.v1`

Reason category aman:

```text
invalid_credentials
rate_limited
account_unavailable
mfa_failed
tenant_unavailable
```

Event eksternal tidak perlu membedakan account exists/tidak.

### `auth.session.created.v1`

### `auth.session.revoked.v1`

### `auth.session.compromised.v1`

Diterbitkan saat refresh reuse terdeteksi.

### `auth.password.changed.v1`

### `auth.password.reset_requested.v1`

Untuk Notification Service, payload harus berisi delivery reference/challenge reference yang aman sesuai contract; jangan menaruh token mentah di event broker bila dapat dihindari. Alternatif: Notification Service memanggil one-time internal retrieval endpoint.

### `auth.email.verification_requested.v1`

### `auth.email.verified.v1`

### `auth.mfa.enabled.v1`

### `auth.mfa.disabled.v1`

## Inbound events

### `tenant.membership.upserted.v1`

```json
{
  "accountId": "acc_01...",
  "tenantId": "ten_01...",
  "membershipId": "mem_01...",
  "status": "active",
  "roles": ["employee"],
  "authorizationVersion": 12,
  "policies": {
    "mfaRequired": false
  },
  "updatedAt": "2026-08-01T10:00:00Z"
}
```

### `tenant.membership.revoked.v1`

Auth:

- Update projection.
- Revoke session aktif pada tenant tersebut sesuai policy.
- Emit session revoked events.

### `tenant.authorization.changed.v1`

### `tenant.deleted.v1`

## Delivery rules

- Consumer harus idempotent berdasarkan `eventId`.
- Ordering hanya diasumsikan per aggregate/subject yang disepakati.
- Duplicate delivery harus aman.
- Poison message masuk DLQ.
- Schema compatibility diuji.
- Outbox publisher memiliki retry dan monitoring lag.
