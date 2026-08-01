const REDACTED_FIELDS = new Set([
  'password',
  'password_hash',
  'token',
  'access_token',
  'refresh_token',
  'secret',
  'code',
  'otp',
  'recovery_code',
  'token_hash',
  'code_hash',
]);

export function redactSensitive(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (REDACTED_FIELDS.has(k)) {
      out[k] = '[REDACTED]';
    } else if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = redactSensitive(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}
