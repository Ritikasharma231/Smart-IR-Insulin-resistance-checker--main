/**
 * Enterprise-style security policy for admin bootstrap and secrets.
 * Credentials are never hardcoded — only supplied via environment / secrets manager.
 */

const INSECURE_JWT_PLACEHOLDERS = new Set([
  'smart-ir-dev-secret-change-in-production',
  'smart-ir-dev-secret',
  'your-secret-key',
  'change-this-in-production',
]);

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Corporate-grade admin password rules (aligned with common IAM policies):
 * - Minimum 12 characters
 * - Uppercase, lowercase, digit, special character
 * - No whitespace
 */
function validateAdminPassword(password) {
  const errors = [];
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  if (/\s/.test(password)) {
    errors.push('Password must not contain spaces');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must include a lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include an uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must include a number');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must include a special character (!@#$%^&* etc.)');
  }
  const blocked = new Set([
    'password',
    'password123',
    'admin',
    'admin123',
    '123456789012',
    'qwertyuiop12',
  ]);
  if (blocked.has(password.toLowerCase())) {
    errors.push('Password is too common or predictable');
  }
  return { valid: errors.length === 0, errors };
}

function validateJwtSecret(secret) {
  if (!secret || secret.length < 32) {
    return {
      valid: false,
      message: 'JWT_SECRET must be at least 32 characters. Generate with: openssl rand -base64 48',
    };
  }
  if (INSECURE_JWT_PLACEHOLDERS.has(secret)) {
    return { valid: false, message: 'JWT_SECRET must not use a default placeholder value' };
  }
  return { valid: true };
}

/**
 * Load admin bootstrap config from environment only (like AWS Secrets Manager / Azure Key Vault injection).
 */
function loadAdminConfig() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email && !password) {
    return { configured: false, email: null, password: null };
  }

  if (!email || !password) {
    throw new Error(
      'Both ADMIN_EMAIL and ADMIN_PASSWORD must be set together in environment variables (never in source code).'
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('ADMIN_EMAIL must be a valid corporate email address');
  }

  const passwordCheck = validateAdminPassword(password);
  if (!passwordCheck.valid) {
    throw new Error(`ADMIN_PASSWORD policy: ${passwordCheck.errors.join('; ')}`);
  }

  return { configured: true, email, password };
}

function assertProductionSecrets(jwtSecret) {
  const jwtCheck = validateJwtSecret(jwtSecret);
  if (!jwtCheck.valid) {
    throw new Error(jwtCheck.message);
  }
}

module.exports = {
  isProduction,
  validateAdminPassword,
  validateJwtSecret,
  loadAdminConfig,
  assertProductionSecrets,
};
