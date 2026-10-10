# Portfolio CMS — Phase 0 + Phase 1 (Foundation + Authentication)

Phase 0 is the Spring Boot 3 + React/Vite foundation. Phase 1 adds real
authentication on top of it: registration, login, JWT issuance/validation,
protected routes, and logout. **No other feature module (Profile, Projects,
Dashboard, etc.) is implemented yet** — those start in Phase 2 onward.

This README gives exact setup and run steps for **Windows PowerShell**.

---

## 1. Prerequisites

Install these first and confirm versions in PowerShell:

| Tool | Required version | Check with |
|---|---|---|
| Java (JDK) | 21 | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 20+ | `node -v` |
| npm | 10+ | `npm -v` |
| MySQL Server | 8.0+ | `mysql --version` |

If any of these are missing, install them before continuing:
- JDK 21: https://adoptium.net/
- Maven: https://maven.apache.org/download.cgi
- Node.js (includes npm): https://nodejs.org/
- MySQL: https://dev.mysql.com/downloads/installer/

> **This project requires JDK 21 specifically — not just as a target,
> but as the JVM that runs Maven itself.** `java.version=21` in
> `backend/pom.xml` controls the compiled bytecode level, but `mvn`
> always runs on whatever JDK your `JAVA_HOME`/`PATH` currently resolve
> to. If a newer JDK (e.g. 24) is what actually launches Maven — common
> on machines with more than one JDK installed — Lombok's annotation
> processor (which hooks into `javac`'s internal, version-specific API)
> can fail with an opaque
> `ExceptionInInitializerError: com.sun.tools.javac.code.TypeTag ::
> UNKNOWN` deep in the compiler, not a helpful "wrong JDK" message. A
> `maven-enforcer-plugin` rule in `backend/pom.xml` now checks this at
> the start of every build and fails clearly instead, telling you to
> fix your JDK rather than leaving you to decode that error.
>
> On Windows PowerShell, before running any `mvn` command, point the
> current session at JDK 21 explicitly:
> ```powershell
> $env:JAVA_HOME="C:\Program Files\Java\jdk-21"
> $env:Path="$env:JAVA_HOME\bin;$env:Path"
> ```
> Then confirm both report 21 before continuing:
> ```powershell
> java -version
> mvn -version
> ```
> This only affects the current PowerShell session — if a new terminal
> reverts to a different JDK, re-run these two lines in it. To fix this
> permanently instead of per-session, set `JAVA_HOME` in Windows'
> System Environment Variables to your JDK 21 install path.

> **Note on this ZIP:** the Phase 1 backend source has been carefully
> hand-reviewed but, like Phase 0, **could not be compiled in the
> environment that generated it** (same Maven Central network restriction).
> Phase 0's build/health check were verified by you locally already — run
> `mvn clean install` again in Section 3.2 as your first real check on the
> new auth code, and see **Troubleshooting** if anything fails.

---

## 2. Create the MySQL database

Open PowerShell and log into MySQL:

```powershell
mysql -u root -p
```

Then, inside the `mysql>` prompt:

```sql
CREATE DATABASE portfolio_cms CHARACTER SET utf8mb4;
EXIT;
```

Phase 0 had no entities. Phase 1 adds `User`, and `spring.jpa.hibernate.ddl-auto=update`
(set in `application.yml`, documented there as an MVP trade-off) means the
`users` table is created automatically the first time the backend starts
against this database — no manual migration needed for Phase 1.

---

## 3. Backend setup and run

Open PowerShell in the `backend` folder:

```powershell
cd backend
```

### 3.1 Set environment variables (current PowerShell session)

```powershell
$env:SERVER_PORT="8080"
$env:DB_HOST="localhost"
$env:DB_PORT="3306"
$env:DB_NAME="portfolio_cms"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="a_long_random_string_at_least_32_characters_local_dev_only"
$env:JWT_EXPIRATION_MS="86400000"
$env:IP_HASH_SECRET="temporary_placeholder_unused_until_phase9"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173"
$env:UPLOAD_DIR="./uploads"
```

These only last for the current PowerShell window. See `.env.example`
for the full list of variables — copy it to `.env` for your own
reference (the app itself reads real environment variables, not the
`.env` file directly, in this Phase 0 setup).

### 3.2 Build

```powershell
mvn clean install
```

### 3.3 Run

```powershell
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**.

### 3.4 Verify the health endpoint

In a **new** PowerShell window:

```powershell
curl http://localhost:8080/api/v1/health
```

Expected response:

```json
{"status":"UP","service":"portfolio-cms-backend","timestamp":"..."}
```

---

## 4. Frontend setup and run

Open a **new** PowerShell window in the project root:

```powershell
cd frontend
```

### 4.1 Configure the API URL

```powershell
Copy-Item .env.example .env
```

The default value (`http://localhost:8080/api/v1`) matches the backend
defaults above — no edit needed unless you changed `SERVER_PORT`.

### 4.2 Install dependencies

```powershell
npm install
```

### 4.3 Run (development server)

```powershell
npm run dev
```

The frontend starts on **http://localhost:5173**. Open it in a browser —
the landing page pings the backend health endpoint and shows
"Backend reachable" once both apps are running.

### 4.4 Build (production build)

```powershell
npm run build
```

Output goes to `frontend/dist/`.

---

## 4.5 Phase 1 — Authentication

**Backend endpoints** (all under `/api/v1`):

| Method | Path | Auth required? | Purpose |
|---|---|---|---|
| POST | `/auth/register` | No | Create an account, returns a JWT + user |
| POST | `/auth/login` | No | Authenticate, returns a JWT + user |
| POST | `/auth/logout` | No | Client-symmetry endpoint only — see security note below |
| GET | `/auth/me` | **Yes** | Returns the caller's own user record, identified from the token |

Every other `/api/**` endpoint (including `/auth/me`) requires
`Authorization: Bearer <token>`. `/api/v1/health` stays public.

**Error response contract:** every error from the API — validation
failures, duplicate email, invalid credentials, an unhandled server
error, and Spring-Security-level 401s/403s alike — is the same shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { "email": "Email must be a valid address" }
}
```

`message` is always present. `errors` (a field → message map) is present
only for validation failures; every other error omits it. A request to a
protected endpoint with no token, an expired token, or a malformed token
gets `401` with `message: "Authentication required"` and no `errors` key
— this is wired via a custom `AuthenticationEntryPoint`
(`RestAuthEntryPoint`), since Spring Security rejects these before they
reach a controller and `@RestControllerAdvice` alone can't shape them. A
403 (nothing currently triggers one — no roles exist yet) would get the
same contract via `RestAccessDeniedHandler`.

**Frontend routes:**

| Path | Access | Notes |
|---|---|---|
| `/login` | Public | Redirects to `/welcome` if already logged in |
| `/register` | Public | Same redirect behavior |
| `/welcome` | Protected | Placeholder page proving the auth flow works end to end — replaced by the real Dashboard in Phase 7 |

**Security note — JWT storage:** the frontend keeps the token in memory
(React state) only, never in `localStorage` or a cookie. Trade-off: a hard
page refresh logs you out (no session-restore flow exists yet). This
avoids XSS-exposed storage and CSRF-prone cookies, which matters more for
an MVP than surviving a refresh — revisit if this becomes a real annoyance.

**Security note — logout:** JWT is stateless in this MVP, so there is no
server-side token revocation/blacklist. `/auth/logout` does not invalidate
the token; "logging out" is the frontend discarding it from memory. A
token issued before logout remains technically valid until it expires
(`JWT_EXPIRATION_MS`, default 24h) if somehow replayed elsewhere — this is
a known MVP trade-off, not an oversight.

**Security note — CORS:** the backend's CORS config does not set
`allowCredentials(true)`. This API is authenticated purely via an
`Authorization: Bearer <token>` header, never a cookie, so the browser
never needs to send cross-origin credentials — leaving it off matches the
actual auth architecture (and keeps `allowedHeaders("*")` valid, which
`allowCredentials(true)` would otherwise forbid).

**Frontend note — 401 handling:** the Axios response interceptor
(`client.js`) only triggers the global "log the user out" handler for a
`401` on a request that actually carried a bearer token. A `401` from
`/auth/login` or `/auth/register` (wrong password, etc.) is just that
request failing — there's no session to end — so it's returned normally
for the page to show inline, instead of also clearing an already-empty
auth state.

---

## 5. URLs summary

| App | URL |
|---|---|
| Backend health check | http://localhost:8080/api/v1/health |
| Frontend | http://localhost:5173 |

---

## 6. Stopping and restarting

**Stop:** in each PowerShell window running `mvn spring-boot:run` or
`npm run dev`, press `Ctrl + C`.

**Restart backend:**
```powershell
cd backend
mvn spring-boot:run
```
(re-set the environment variables from Section 3.1 first if you opened
a new PowerShell window)

**Restart frontend:**
```powershell
cd frontend
npm run dev
```

---

## 7. Troubleshooting

**`mvn` or `java` not recognized**
Java/Maven isn't on PATH. Reinstall and ensure "Add to PATH" is checked,
or add the install's `bin` folder to your PATH environment variable
manually, then open a new PowerShell window.

**Backend fails to connect to MySQL (`Communications link failure` /
`Access denied for user`)**
- Confirm MySQL is running (`services.msc` → look for "MySQL80" or similar).
- Confirm `DB_USERNAME`/`DB_PASSWORD` match a real MySQL account.
- Confirm the database exists: `mysql -u root -p -e "SHOW DATABASES;"`.

**Backend fails to start with "JWT_SECRET is not set" or a key-length error**
`JWT_SECRET` must be set and at least 32 characters (HS256 needs a 256-bit
key). The app fails fast at startup rather than silently signing tokens
with a weak or missing key — set a longer value in Section 3.1 and restart.

**Register/login returns 400 with field errors**
Check the JSON body matches the DTOs: `fullName` (≤100 chars), `email`
(valid format), `password` (8–72 chars). The response's `errors` object
names exactly which field failed and why.

**A previously-working protected page suddenly 401s**
Expected if the token expired (`JWT_EXPIRATION_MS`) or you refreshed the
page (token is memory-only, not persisted — see Phase 1 security note
above). Log in again.

**Compilation fails with dozens of "cannot find symbol" errors on getters/setters, or "constructor is not applicable" on `SecurityConfig`**
This is Lombok's annotation processor not running - nothing in the
committed `pom.xml` disables it (no `-proc:none`, no conflicting
`annotationProcessorPaths`), so if you hit this, it's local-environment:
1. Confirm `mvn -version` reports Java 21 and that it's the same JDK your
   IDE/PATH otherwise points to - a mismatched `JAVA_HOME` is the most
   common cause.
2. Delete `~/.m2/repository/org/projectlombok` and re-run `mvn clean test`
   to rule out a stale/partial cached Lombok jar.
3. Run `mvn dependency:tree | grep lombok` - there should be exactly one
   resolved version (whatever `spring-boot-starter-parent:3.3.4` manages,
   currently 1.18.32). Multiple versions means something else on your
   machine (a settings.xml, a different parent POM cached locally) is
   pulling in a second one.
`pom.xml`'s `maven-compiler-plugin` now pins an explicit
`annotationProcessorPaths` entry for Lombok as a defense against
environment-specific auto-discovery issues; it doesn't change which
Lombok version is used.

**Backend build fails resolving dependencies**
Maven needs internet access on first build to download dependencies
from Maven Central into your local `~/.m2` repository. Confirm you have
a working internet connection and no corporate proxy/firewall is
blocking `repo.maven.apache.org`.

**Port already in use (8080 or 5173)**
Something else is using the port. Either stop that process, or change
`SERVER_PORT` (backend) / pass `--port` to `npm run dev -- --port 5174`
(frontend) and update `VITE_API_BASE_URL` in `frontend/.env` to match.

**Frontend shows "Backend not reachable"**
- Confirm the backend is actually running (`curl http://localhost:8080/api/v1/health`).
- Confirm `frontend/.env` `VITE_API_BASE_URL` matches the backend's actual
  host/port.
- Confirm `CORS_ALLOWED_ORIGINS` (backend) includes the frontend's URL
  exactly (`http://localhost:5173`, no trailing slash).

**PowerShell `curl` behaves oddly / shows extra fields**
PowerShell aliases `curl` to `Invoke-WebRequest`. This is fine for a
quick check; if you want raw `curl.exe` behavior, run `curl.exe` instead.

---

## 8. Automated tests (Phase 1)

`backend/src/test/java/com/portfoliocms/app/controller/AuthControllerTest.java`
covers the auth surface end to end against an in-memory H2 database (no
MySQL needed): registration (success, BCrypt hash persisted, duplicate
email, invalid data), login (success, wrong password, unknown email), and
`/auth/me` (no token, valid token, malformed token, expired token). Run
with:

```powershell
cd backend
mvn test
```

The existing `PortfolioCmsApplicationTests.contextLoads()` smoke test is
unchanged.

---

## 9. Manual test checklist (Phase 1)

Run these in order against a fresh `users` table (or note you're reusing one):

1. `POST /auth/register` with a new email → `201`, response has `accessToken` + `user`.
2. Repeat the same registration → `409 Conflict`, body is `{success: false, message: "An account with this email already exists"}`.
3. `POST /auth/register` with a bad email / short password → `400`, body is `{success: false, message: "Validation failed", errors: {...}}` naming the bad field(s).
4. `POST /auth/login` with the registered email + correct password → `200`, `accessToken` + `user`.
5. `POST /auth/login` with wrong password → `401`, `message: "Invalid email or password"` (does not reveal whether the email exists).
6. `POST /auth/login` with an unregistered email → same `401` + same generic message as #5.
7. `GET /auth/me` with no token → `401`, body is `{success: false, message: "Authentication required"}` (not empty).
8. `GET /auth/me` with the token from #1/#4 in `Authorization: Bearer <token>` → `200`, body matches the registered/logged-in user (`id`, `email`, `fullName`, no `passwordHash`).
9. `GET /auth/me` with an expired or hand-edited/garbage token → `401`, same generic "Authentication required" body — doesn't reveal which failure mode it was.
10. Inspect a register/login `400`/`401`/`409` response and confirm it has no `timestamp` or bare `error`/`fieldErrors` keys anywhere — only `success`, `message`, and (for validation only) `errors`.
11. In the browser network tab, confirm no CORS preflight response includes `Access-Control-Allow-Credentials` (removed — this API doesn't use cookies).
12. Frontend: register a new account via `/register` → redirected to `/welcome`, name shown.
13. Frontend: log out from `/welcome` → redirected to `/login`; visiting `/welcome` directly afterward redirects back to `/login`.
14. Frontend: log in again via `/login` → reaches `/welcome`.
15. Frontend: on `/login`, submit a wrong password → the inline form error appears ("Invalid email or password") and you stay on the login page — this must NOT trigger the global logout handler or redirect (there's nothing to log out of).
16. Frontend: visit `/login` or `/register` while already logged in → redirected to `/welcome` instead of showing the form.
17. Frontend: submit the register/login forms with empty fields → inline validation errors appear, no request is sent.
18. Refresh the browser while on `/welcome` → logged out (expected — see the JWT storage trade-off note above), redirected to `/login`.
19. Frontend: while logged in on `/welcome`, let the token expire (or edit it to be invalid) then trigger any authenticated call — the global logout handler fires this time (token WAS present and got rejected), redirecting to `/login`.
20. Tab through the login/register forms with keyboard only → visible focus outlines on every field/button; screen reader announces field errors (`role="alert"`).

---

## 10. What's intentionally NOT in Phase 1

No Profile, Projects, Skills, Experience, Education, Resume, Dashboard,
Health Score, Public Portfolio, Recruiter Mode, Analytics, or Contact/Inbox.
No password reset, no email verification, no refresh tokens, no
role/permission system. These are scoped to Phase 2 onward per the
approved development plan. Phase 1's only job is: a person can register,
log in, reach a protected page, and log out — securely and end to end.
