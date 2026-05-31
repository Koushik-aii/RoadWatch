# RoadWatch Authentication & RBAC

## Architecture

```
Client (React)
  → Bearer access JWT (30 min)
  → Refresh token (7 days, rotated on refresh, stored hashed in DB)

FastAPI
  → SecurityHeadersMiddleware
  → HTTPBearer → get_current_user
  → require_roles() on admin/officer routes
  → Rate limits (in-memory; use Redis in production)
```

## Roles

| Role | Permissions |
|------|-------------|
| **Citizen** | Register, create complaints (rate-limited), view own complaints/status |
| **Road Authority Officer** | View/update complaints in assigned zones, manage zones |
| **Admin** | All officer permissions + user management + analytics + delete complaints |

## API routes

| Endpoint | Auth |
|----------|------|
| `POST /api/auth/register` | Public (citizen only) |
| `POST /api/auth/login` | Public |
| `POST /api/auth/refresh` | Refresh token body |
| `POST /api/auth/logout` | Revokes refresh token |
| `GET /api/auth/me` | Bearer |
| `POST /api/complaints/*` | Bearer + rate limit |
| `GET /api/complaints/*` | Bearer (scoped by role) |
| `PATCH /api/complaints/{id}` | Officer (limited) / Admin (full) |
| `DELETE /api/complaints/{id}` | Admin |
| `GET/PUT /api/officer/zones` | Officer, Admin |
| `PATCH /api/officer/complaints/{id}/status` | Officer, Admin |
| `GET /api/admin/*` | Admin |

## Security measures

- **Passwords:** bcrypt via passlib (min 8 chars, upper, lower, digit)
- **JWT:** HS256, secret from `JWT_SECRET_KEY` env
- **Refresh tokens:** SHA-256 hash stored server-side; rotation on refresh
- **Spam prevention:** 5 complaints/user/hour, 10/IP/hour (configurable)
- **Auth rate limits:** 10 login attempts/min/IP, 5 registrations/hour/IP

## Bootstrap admin

Set in `.env`:

```env
JWT_SECRET_KEY=<openssl rand -hex 32>
BOOTSTRAP_ADMIN_EMAIL=admin@roadwatch.local
BOOTSTRAP_ADMIN_PASSWORD=ChangeMeAdmin123!
```

Run migrations: `alembic upgrade head`

## Production checklist

- [ ] Strong `JWT_SECRET_KEY`
- [ ] HTTPS only
- [ ] Restrict `CORS_ORIGINS`
- [ ] Redis-backed rate limiting
- [ ] Disable bootstrap password after first login
- [ ] Audit logging for admin actions
