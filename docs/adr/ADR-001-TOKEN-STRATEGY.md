# ADR-001 — Token Strategy

## Status

Accepted.

## Context

Mobile dan web membutuhkan session nyaman, tetapi access token panjang sulit dicabut dan refresh JWT rentan dipakai seperti bearer token tanpa kontrol rotation yang kuat.

## Decision

- Access token: signed JWT, 10 menit.
- Refresh token: opaque random token, 30 hari idle, 90 hari absolute session.
- Refresh token disimpan sebagai hash.
- Refresh token dirotasi setiap penggunaan.
- Reuse detection mencabut seluruh family.
- JWT ditandatangani asymmetric dan diverifikasi dari JWKS.
- Web memakai HttpOnly secure cookie untuk refresh.
- Mobile memakai OS secure storage.

## Consequences

Positif:

- Service dapat memverifikasi access token tanpa memanggil Auth Service.
- Session tetap dapat dicabut melalui refresh/session state.
- Token theft lebih cepat terdeteksi.

Negatif:

- Access token yang sudah diterbitkan tetap valid sampai TTL habis.
- Rotation membutuhkan transaksi yang benar dan race handling.
- Key lifecycle perlu dikelola.
