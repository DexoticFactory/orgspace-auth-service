# Authorization and Tenant Context

## 1. Pemisahan authentication dan authorization

Authentication menjawab “siapa account ini dan bagaimana ia login”.

Authorization menjawab “apa yang dapat dilakukan account pada tenant tertentu”.

Auth Service menerbitkan auth context, tetapi sumber kebenaran membership/role tetap Tenant Service.

## 2. Model akses

```text
Account
  └── Tenant Membership
        ├── Roles
        ├── Policies
        └── Authorization Version
```

Contoh role keys:

```text
platform_superadmin
tenant_owner
tenant_admin
hr_admin
finance_admin
supervisor
employee
teacher
student
```

Role key bukan izin final. Setiap service mendefinisikan permission domainnya, misalnya:

```text
attendance.read.self
attendance.read.team
attendance.correct.request
attendance.correct.approve
payroll.read.self
payroll.run
```

## 3. Claims

Access token memuat role keys ringkas dan authorization version, bukan seluruh permission matrix.

```json
{
  "sub": "acc_01",
  "tid": "ten_01",
  "roles": ["supervisor"],
  "azv": 12
}
```

Service:

1. Memverifikasi signature.
2. Memverifikasi issuer, audience, expiry, token type.
3. Memastikan `tid` sesuai resource tenant.
4. Memetakan role/policy menjadi permission domain.
5. Melakukan object-level authorization.

## 4. Perubahan role

1. Tenant Service memperbarui role assignment.
2. Tenant Service menaikkan `authorization_version`.
3. Event dikirim ke Auth Service dan consumer lain.
4. Auth projection diperbarui.
5. Token baru menggunakan version baru.
6. Token lama mati dalam TTL pendek.
7. Untuk operasi sangat sensitif, service dapat memeriksa cached current version dan menolak token stale.

## 5. Tenant switching

`POST /auth/tenant/select` menerbitkan token baru dengan `tid` berbeda setelah memvalidasi access projection.

Tidak boleh hanya mengganti tenant ID di frontend.

## 6. Platform admin

Platform admin token harus dibedakan:

- Audience atau scope berbeda.
- MFA wajib.
- Session lebih pendek.
- Audit lebih ketat.
- Tidak otomatis memiliki akses ke data tenant tanpa support access workflow.

## 7. Service-to-service auth

Internal call tidak menggunakan user access token sebagai satu-satunya bukti.

Pilihan:

- mTLS + signed service JWT.
- Workload identity dari platform.
- Private network saja tidak cukup.

Service token memuat:

```json
{
  "sub": "service:tenant-service",
  "aud": "service:auth-service",
  "scope": ["auth.tenant_access.write"]
}
```
