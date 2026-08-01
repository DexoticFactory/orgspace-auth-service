# API Specification

Base path eksternal:

```text
/v1/auth
```

Semua response memakai envelope konsisten:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_01..."
  }
}
```

Error:

```json
{
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Data login tidak valid atau akun tidak dapat digunakan.",
    "requestId": "req_01..."
  }
}
```

## 1. Public/client endpoints

### POST `/v1/auth/login`

Request:

```json
{
  "tenantCode": "SOLID",
  "identifier": "EMP-0001",
  "password": "example",
  "client": {
    "platform": "mobile",
    "installationId": "ins_01...",
    "deviceName": "Samsung A15",
    "appVersion": "1.0.0"
  }
}
```

Kemungkinan response:

#### Authenticated

```json
{
  "data": {
    "status": "authenticated",
    "accessToken": "<jwt>",
    "expiresIn": 600,
    "account": {
      "id": "acc_01..."
    },
    "activeTenant": {
      "id": "ten_01...",
      "roles": ["employee"]
    }
  }
}
```

Refresh token dikirim melalui cookie untuk web atau body-encrypted transport contract untuk mobile melalui gateway policy. Implementasi final harus memastikan token tidak terekspos ke log.

#### Tenant selection required

```json
{
  "data": {
    "status": "tenant_selection_required",
    "challengeId": "chl_01...",
    "tenants": [
      {
        "id": "ten_01...",
        "displayName": "CV Solid Design",
        "roles": ["employee"]
      }
    ],
    "expiresIn": 300
  }
}
```

#### MFA required

```json
{
  "data": {
    "status": "mfa_required",
    "challengeId": "chl_01...",
    "methods": ["totp", "recovery_code"],
    "expiresIn": 300
  }
}
```

#### Password change required

```json
{
  "data": {
    "status": "password_change_required",
    "challengeId": "chl_01...",
    "expiresIn": 300
  }
}
```

### POST `/v1/auth/tenant/select`

```json
{
  "challengeId": "chl_01...",
  "tenantId": "ten_01..."
}
```

### POST `/v1/auth/mfa/verify`

```json
{
  "challengeId": "chl_01...",
  "method": "totp",
  "code": "123456"
}
```

### POST `/v1/auth/refresh`

Web: refresh token dari cookie.  
Mobile: gateway menerima token dari secure client transport.

Response:

```json
{
  "data": {
    "accessToken": "<jwt>",
    "expiresIn": 600
  }
}
```

### POST `/v1/auth/logout`

Mencabut current session/token family.

### POST `/v1/auth/logout-all`

```json
{
  "keepCurrentSession": true
}
```

### GET `/v1/auth/sessions`

Response:

```json
{
  "data": [
    {
      "id": "ses_01...",
      "current": true,
      "platform": "mobile",
      "deviceName": "Samsung A15",
      "createdAt": "2026-08-01T10:00:00Z",
      "lastSeenAt": "2026-08-01T10:30:00Z"
    }
  ]
}
```

### DELETE `/v1/auth/sessions/{sessionId}`

Mencabut session tertentu.

### POST `/v1/auth/password/forgot`

```json
{
  "identifier": "user@example.com"
}
```

Response selalu generik:

```json
{
  "data": {
    "accepted": true
  }
}
```

### POST `/v1/auth/password/reset`

```json
{
  "token": "<reset-token>",
  "newPassword": "new passphrase"
}
```

### POST `/v1/auth/password/change`

Requires access token dan recent authentication bila policy mengharuskan.

```json
{
  "currentPassword": "old",
  "newPassword": "new"
}
```

### POST `/v1/auth/password/complete-first-login`

```json
{
  "challengeId": "chl_01...",
  "newPassword": "new passphrase"
}
```

### POST `/v1/auth/email/verification/request`

Requires authenticated account atau restricted activation challenge.

### POST `/v1/auth/email/verification/confirm`

```json
{
  "token": "<verification-token>"
}
```

### POST `/v1/auth/mfa/totp/setup`

Menghasilkan setup challenge dan otpauth URI. Requires recent authentication.

### POST `/v1/auth/mfa/totp/confirm`

```json
{
  "setupChallengeId": "chl_01...",
  "code": "123456"
}
```

### POST `/v1/auth/mfa/disable`

Requires recent authentication dan valid MFA/recovery verification.

### POST `/v1/auth/mfa/recovery-codes/regenerate`

Recovery code hanya dikembalikan sekali.

### GET `/v1/auth/context`

Mengembalikan auth context minimum:

```json
{
  "data": {
    "accountId": "acc_01...",
    "sessionId": "ses_01...",
    "tenantId": "ten_01...",
    "roles": ["employee"],
    "amr": ["pwd"],
    "authorizationVersion": 12
  }
}
```

## 2. Discovery endpoints

### GET `/.well-known/jwks.json`

Public, cacheable, tidak melalui auth.

### GET `/health/live`

### GET `/health/ready`

## 3. Internal endpoints

Base:

```text
/internal/v1
```

Wajib service authentication.

### POST `/internal/v1/accounts`

Digunakan oleh onboarding workflow yang berwenang.

Headers:

```text
Idempotency-Key: <uuid>
```

Request:

```json
{
  "primaryIdentifier": {
    "type": "email",
    "value": "user@example.com",
    "verified": false
  },
  "temporaryPassword": {
    "enabled": true,
    "expiresAt": "2026-08-03T00:00:00Z"
  }
}
```

### PATCH `/internal/v1/accounts/{accountId}/status`

```json
{
  "status": "suspended",
  "reason": "security_review"
}
```

### POST `/internal/v1/tenant-access/upsert`

```json
{
  "sourceEventId": "evt_01...",
  "accountId": "acc_01...",
  "tenantId": "ten_01...",
  "membershipId": "mem_01...",
  "status": "active",
  "roles": ["employee"],
  "authorizationVersion": 12,
  "policies": {
    "mfaRequired": false
  }
}
```

### POST `/internal/v1/tenant-access/revoke`

### POST `/internal/v1/accounts/{accountId}/temporary-credential`

### POST `/internal/v1/sessions/revoke-by-account`

### GET `/internal/v1/accounts/{accountId}/auth-summary`

Tidak mengembalikan hash atau secret.

## 4. Idempotency

Wajib untuk:

- Create account.
- Upsert tenant access.
- Create temporary credential.
- Suspend/activate account dari workflow.
- Revoke sessions melalui command eksternal.

Idempotency record menyimpan request hash dan hasil aman untuk jangka waktu tertentu.

## 5. Pagination

Endpoint list menggunakan cursor:

```text
?limit=20&cursor=<opaque>
```

## 6. API versioning

- Breaking change menggunakan `/v2`.
- Penambahan field optional bukan breaking.
- Error code yang sudah dipublikasikan tidak boleh diubah maknanya.
- OpenAPI menjadi contract yang diuji pada CI.
