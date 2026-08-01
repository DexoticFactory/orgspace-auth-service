# ADR-002 — Tenant Context

## Status

Accepted.

## Context

Satu account dapat tergabung di beberapa perusahaan/sekolah. Menaruh seluruh akses tenant dalam satu token menghasilkan token besar dan meningkatkan risiko confused-deputy.

## Decision

- Token bisnis selalu memiliki satu tenant aktif.
- Tenant dipilih setelah autentikasi bila account memiliki lebih dari satu akses.
- Claim `tid` wajib untuk API tenant-scoped.
- Auth menyimpan projection dari Tenant Service.
- Claim `azv` menunjukkan authorization version.
- Pergantian tenant menghasilkan token baru.

## Consequences

- Client harus memiliki tenant switch flow.
- Semua service wajib mencocokkan tenant resource dengan `tid`.
- Role change tidak langsung mengubah token lama; TTL pendek dan version check dipakai sesuai risiko.
