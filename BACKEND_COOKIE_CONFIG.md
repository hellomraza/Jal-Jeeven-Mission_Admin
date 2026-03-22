# Environment Variables - Cookie-Based Authentication Setup

## Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Jal Jeevan Mission Admin
```

## Backend Requirements for Cookie-Based Auth

Your backend MUST be configured to support HTTP-only cookies for web clients.

### Cookie Configuration

**On Login (POST /auth/login):**

```http
HTTP/1.1 200 OK
Set-Cookie: access_token=<JWT_TOKEN>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
Content-Type: application/json

{
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "..."
  },
  "access_token": "<JWT_TOKEN>"  // For mobile clients (optional)
}
```

**Cookie Attributes Explained:**

| Attribute         | Value                 | Reason                                              |
| ----------------- | --------------------- | --------------------------------------------------- |
| `HttpOnly`        | Required              | Prevents JavaScript from accessing token (XSS safe) |
| `Secure`          | Required (Production) | Only sent over HTTPS                                |
| `SameSite=Strict` | Required              | Prevents CSRF attacks                               |
| `Path=/`          | Recommended           | Sent with all requests                              |
| `Max-Age=86400`   | Optional              | Expires in 24 hours                                 |

### CORS Configuration

**Required Headers:**

```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: http://localhost:3001  // Specific domain, not *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

**Important:**

- ❌ `Access-Control-Allow-Origin: *` WILL NOT work with credentials
- ✅ Must be a specific domain (not wildcard)

### On Logout (POST /auth/logout)

```http
HTTP/1.1 200 OK
Set-Cookie: access_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
Content-Type: application/json

{
  "message": "Logged out successfully"
}
```

**Note:** Setting `Max-Age=0` or `Expires` to past date clears the cookie

### On Session Expiration

Any request with invalid/expired token should return:

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "message": "Unauthorized - session expired"
}
```

## Backend Example (Node.js/Express)

```javascript
// Enable cookies for specific domain
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true, // IMPORTANT: Allow credentials
  }),
);

// On login
res.cookie("access_token", token, {
  httpOnly: true, // Cannot access via JavaScript
  secure: process.env.NODE_ENV === "production", // Only HTTPS in production
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: "/",
});

// On logout
res.clearCookie("access_token", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
});
```

## Verification Checklist

After configuring backend, verify:

- [ ] `Set-Cookie` header present in login response
- [ ] Cookie has `HttpOnly` flag
- [ ] Cookie has `Secure` flag (HTTPS)
- [ ] Cookie has `SameSite=Strict`
- [ ] CORS headers include `Access-Control-Allow-Credentials: true`
- [ ] CORS origin is specific (not `*`)
- [ ] Browser DevTools: Network tab shows cookies being sent
- [ ] API requests work from frontend (include credentials)
- [ ] Logout clears cookie with `Max-Age=0`

## Testing Cookie Authentication

### Using cURL

```bash
# Login and save cookies
curl -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  http://localhost:3000/auth/login

# Use cookies in subsequent requests
curl -b cookies.txt \
  http://localhost:3000/auth/me

# Verify cookie is HttpOnly and Secure
curl -i http://localhost:3000/auth/login | grep -i set-cookie
```

### Using Browser DevTools

1. Open Network tab
2. Login
3. Check Response Headers for `Set-Cookie`
4. Check Application → Cookies for `access_token`
5. Verify `HttpOnly` is checked
6. Make API request
7. Check Request Headers for `Cookie: access_token=...`

## Troubleshooting

### Cookies not being sent with requests

**Problem:** `Cookie` header missing in API requests

**Solutions:**

1. Check `withCredentials: true` in axios (✅ Already set in new code)
2. Verify CORS `Access-Control-Allow-Credentials: true` on backend
3. Verify origin matches (not using wildcard)
4. Check `Secure` flag matches protocol (HTTP for dev, HTTPS for prod)

### CORS errors in console

**Problem:** `Access to XMLHttpRequest blocked by CORS`

**Solutions:**

1. Ensure backend has correct CORS headers
2. Use specific origin, not wildcard
3. Restart backend after CORS config changes

### Cookie not being set

**Problem:** No `Set-Cookie` header in login response

**Solutions:**

1. Verify backend sets cookie on login endpoint
2. Check response headers in Network tab
3. Verify cookie attributes are valid
4. Ensure response status is 2xx (not 3xx redirect)

### Session expires too quickly

**Problem:** User logged out after 5 minutes

**Solutions:**

1. Increase `Max-Age` (or `maxAge`) on backend
2. Implement token refresh if needed
3. Check server timezone issues

---

## Production Deployment

### Changes Needed for Production

```env
# .env.production

# Use HTTPS
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Ensure backend uses Secure cookies
# Set NODE_ENV=production on backend
```

### Security Checklist

- [ ] Frontend served over HTTPS
- [ ] Backend served over HTTPS
- [ ] Cookies have `Secure` flag
- [ ] Cookies have `SameSite=Strict`
- [ ] CORS origin is your domain (not localhost)
- [ ] No sensitive data in JWT (it's visible in mobile apps)
- [ ] Token expiration time is reasonable (24h recommended)
- [ ] Implement token refresh if longer sessions needed
- [ ] Backend validates token on every request

---

For more details, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
