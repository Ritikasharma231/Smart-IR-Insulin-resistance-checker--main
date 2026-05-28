# Admin authentication (enterprise practice)

This app follows the same pattern as large corporate systems:

1. **No default passwords in code** — admin credentials exist only in environment variables or a secrets manager (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault, Kubernetes Secrets).
2. **Strong password policy** for `ADMIN_PASSWORD`:
   - Minimum 12 characters
   - Uppercase, lowercase, number, and special character
   - No common patterns (`password`, `admin`, `123456`, etc.)
3. **Rate limiting** on login and registration (20 attempts per 15 minutes per IP).
4. **Generic login errors** — "Invalid credentials" (no hint whether email or password failed).
5. **Admin email cannot be registered** as a patient account.
6. **bcrypt cost factor 12** for admin password hashing.

## Local development

1. Copy `.env.example` to `.env` (`.env` is gitignored).
2. Set `JWT_SECRET` using:
   ```bash
   openssl rand -base64 48
   ```
3. Set `ADMIN_EMAIL` to your clinic/IT admin mailbox (e.g. `admin@your-hospital.com`).
4. Set `ADMIN_PASSWORD` to a strong password (12+ chars, upper, lower, **number**, special). Example shape: `YourStrongPasswordFromPasswordManager!9`
5. Start the API: `npm run server`
6. Log in at `/login` with those credentials — the server creates the admin user **once** on first startup.

## Production

- Set `NODE_ENV=production`
- `JWT_SECRET` must be ≥ 32 characters and not a placeholder.
- Inject `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your secrets platform — never store them in the repository.
- Rotate `JWT_SECRET` and admin password on your organization's schedule.
- Remove or restrict access to any old SQLite DB if credentials rotate (re-seed admin via DB migration if needed).

## Rotating admin password

1. Update `ADMIN_PASSWORD` in your secrets manager.
2. Delete the admin row from `users` where `role = 'admin'` **or** use your DBA tool to update `password_hash` after hashing the new password with bcrypt.
3. Restart the API so `seedAdmin` can recreate the account if it was removed.

Do not display admin credentials on the login page or in documentation.
