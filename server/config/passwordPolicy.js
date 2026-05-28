/** Patient password policy (registration) — slightly lighter than admin */
function validatePatientPassword(password) {
  const errors = [];
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (password && password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  return { valid: errors.length === 0, errors };
}

module.exports = { validatePatientPassword };
