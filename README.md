# Portfolio CMS

### Build, manage, and showcase your developer portfolio from one workspace.

Portfolio CMS is a full-stack web application that helps developers create and manage a professional portfolio through a centralized dashboard. It brings profile management, project showcasing, skills, experience, education, resume management, and recruiter-focused features together in one place.

Instead of manually maintaining a portfolio website, developers can manage their content through a dedicated workspace and publish it as a public portfolio.

**Repository:** [shifana0105/Portfolio_cms](https://github.com/shifana0105/Portfolio_cms)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Application Routes](#application-routes)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Security](#security)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [Author](#author)

---

## Features

### Authentication and Account Security
- User registration and login
- JWT-based authentication
- Protected dashboard routes
- Password hashing using BCrypt
- Ownership checks for protected resources

### Portfolio Management
- **Profile Management:** Maintain your name, professional headline, biography, location, and social links.
- **Projects:** Showcase projects with descriptions, technology stacks, GitHub links, live demos, and featured-project ordering.
- **Skills:** Organize technical skills by category and proficiency level.
- **Experience:** Manage professional experience and employment timelines.
- **Education:** Maintain academic qualifications and relevant details.
- **Resume Management:** Upload, view, download, replace, and delete your resume, subject to validation rules.

### Dashboard and Portfolio Health
- Centralized portfolio management workspace
- Portfolio completion tracking
- Portfolio health score and improvement suggestions
- Project, skill, experience, and education summaries
- Recent activity based on portfolio data

### Public Portfolio
- Shareable portfolio URL using a username
- Public presentation of profile and portfolio information
- Featured projects and professional background
- Multiple portfolio presentation themes
- Responsive layout for different screen sizes

### Recruiter Experience and Analytics
- Recruiter Mode for a focused professional presentation
- Portfolio view tracking
- Analytics dashboard for viewing activity
- QR code for sharing the public portfolio

### Contact and Inbox
- Public portfolio contact form
- Contact message validation
- Rate limiting to reduce abuse
- Dashboard inbox for viewing received messages

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Styling and UI | Tailwind CSS, responsive CSS |
| Animations | Framer Motion |
| Routing | React Router |
| HTTP Client | Axios |
| Backend | Java 21, Spring Boot 3 |
| Security | Spring Security, JWT, BCrypt |
| Persistence | Spring Data JPA, Hibernate |
| Database | MySQL 8 |
| Build Tools | Maven, npm |
| Testing | JUnit, Spring Boot Test, H2 for isolated tests |
| Version Control | Git and GitHub |

---

## Architecture

The application follows a frontend–backend architecture.

```text
React + Vite Frontend
        |
        | REST API / HTTP
        v
Spring Boot Backend
        |
        | Spring Data JPA
        v
     MySQL Database
```

- **Frontend:** Renders the user interface, manages navigation, and communicates with the backend.
- **Backend:** Handles authentication, business logic, validation, authorization, and API requests.
- **Database:** Stores user accounts and portfolio information persistently.
- **Resume storage:** Uses local file storage for the current development setup, with validation and access controls.

The frontend and backend are maintained in the same repository.

---

## Getting Started

Follow these instructions to run the application locally on Windows.

### Prerequisites

Install the following tools before starting:

| Tool | Version |
|---|---|
| Java JDK | 21 |
| Apache Maven | 3.8+ |
| Node.js | 20+ |
| npm | 10+ |
| MySQL Server | 8.0+ |
| Git | Latest stable version |

Verify your installations:

```powershell
java -version
mvn -version
node -v
npm -v
git --version
```

**Important:** Maven must run using JDK 21. If your system has multiple Java versions installed, ensure `JAVA_HOME` and the Maven runtime point to JDK 21.

### 1. Clone the repository

```powershell
git clone https://github.com/shifana0105/Portfolio_cms.git
cd Portfolio_cms
```

### 2. Create the MySQL database

Start MySQL and connect using an account with database creation privileges.

```sql
CREATE DATABASE portfolio_cms
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

The application uses MySQL for persistent development data. Hibernate's `update` configuration can create or update the schema during startup; it is not a replacement for managed production database migrations.

---

## Environment Configuration

Configure your local environment before starting the backend.

### Backend configuration

Open PowerShell in the project root and set the required environment variables for the current terminal session:

```powershell
$env:JAVA_HOME="C:\Program Files\Java\jdk-21"
$env:Path="$env:JAVA_HOME\bin;$env:Path"

$env:SERVER_PORT="8080"
$env:DB_HOST="localhost"
$env:DB_PORT="3306"
$env:DB_NAME="portfolio_cms"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"

$env:JWT_SECRET="REPLACE_WITH_A_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS"
$env:JWT_EXPIRATION_MS="86400000"

$env:IP_HASH_SECRET="REPLACE_WITH_A_SEPARATE_RANDOM_SECRET"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173"
$env:UPLOAD_DIR="./uploads"
```

Replace the example passwords and secrets with your own values. Do not commit real credentials to GitHub.

These environment variables apply to the current PowerShell session. Configure them in your IDE's run configuration or your local environment if needed across sessions.

See `backend/.env.example` for the project's environment-variable reference. Spring Boot does not automatically load a plain `.env` file unless additional support is configured.

### Frontend configuration

Open a separate PowerShell terminal:

```powershell
cd frontend
Copy-Item .env.example .env
```

Check that `frontend/.env` contains the correct API base URL:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Keep local `.env` files out of version control.

---

## Running the Application

### 1. Start the backend

Open a terminal in the repository root:

```powershell
cd backend
mvn clean test
mvn spring-boot:run
```

The backend should be available at:

`http://localhost:8080`

Check the health endpoint:

`http://localhost:8080/api/v1/health`

### 2. Start the frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend should be available at:

`http://localhost:5173`

The Vite development server is configured to use port `5173` strictly. If that port is already occupied, stop the process using it before restarting Vite.

### 3. Build the frontend

From the `frontend` directory:

```powershell
npm run lint
npm run build
```

The production build is generated in `frontend/dist/`.

---

## Application Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/login` | User login |
| `/register` | Account registration |
| `/dashboard` | Main workspace |
| `/profile` | Profile management |
| `/projects` | Project management |
| `/skills` | Skills management |
| `/experience` | Experience management |
| `/education` | Education management |
| `/resume` | Resume management |
| `/inbox` | Contact messages |
| `/analytics` | Portfolio analytics |
| `/p/:username` | Public portfolio |

Routes requiring authentication are protected by the frontend, with authorization enforced by the backend for protected resources.

---

## API Overview

The REST API uses the `/api/v1` prefix.

| Area | Example endpoint | Purpose |
|---|---|---|
| Health | `GET /api/v1/health` | Check backend availability |
| Authentication | `POST /api/v1/auth/register` | Register a user |
| Authentication | `POST /api/v1/auth/login` | Authenticate a user |
| Profile | `/api/v1/profile` | Manage profile information |
| Projects | `/api/v1/projects` | Manage projects |
| Skills | `/api/v1/skills` | Manage skills |
| Experience | `/api/v1/experience` | Manage experience |
| Education | `/api/v1/education` | Manage education |
| Dashboard | `/api/v1/dashboard` | Retrieve dashboard information |
| Public portfolio | `/api/v1/public/{username}` | Retrieve a public portfolio |
| Contact | `/api/v1/public/{username}/contact` | Submit a contact message |
| Analytics | `/api/v1/analytics` | Retrieve analytics information |

Protected endpoints require a valid JWT in the request header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

For exact request fields, response formats, and supported operations, refer to the corresponding controller and DTO classes in `backend/src/main/java/com/portfoliocms/app/`.

---

## Testing

### Backend tests

From the `backend` directory:

```powershell
mvn clean test
```

The test suite uses an isolated H2 database where configured, so automated tests do not need to modify the normal development database.

### Frontend checks

From the `frontend` directory:

```powershell
npm run lint
npm run build
```

These commands check code quality and verify that the frontend can be compiled for production.

---

## Security

The project incorporates several security measures:

- Password hashing with BCrypt.
- JWT-based authentication and protected backend endpoints.
- Server-side resource ownership checks.
- Request validation and centralized error handling.
- Resume file type and size validation.
- Filename sanitization and protection against path traversal.
- Restrictions on public access to private resume files.
- HMAC-SHA256-based IP hashing for recruiter analytics rather than storing raw IP addresses.
- Rate limiting for public contact submissions.
- Environment-based configuration for credentials and secrets.

**Deployment note:** The current application is designed as a full-stack project with a local development configuration. Before production deployment, review secret management, database migrations, HTTPS, persistent file storage, rate limiting across multiple instances, monitoring, backups, and deployment-specific CORS settings.

---

## Future Improvements

Potential areas for continued development include:

- Cloud-based resume and asset storage.
- Production deployment with CI/CD.
- Email notifications for incoming contact messages.
- Password reset and email verification.
- More portfolio themes and customization options.
- Expanded automated integration and end-to-end tests.
- More detailed analytics and portfolio performance insights.

---

## Contributing

Suggestions and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Submit a pull request with a clear description.

For larger changes, consider discussing the proposed approach before implementation.

---

## Author

**Shifana Sherin S**

B.Tech Information Technology

- GitHub: [@shifana0105](https://github.com/shifana0105)
- Portfolio CMS Repository: [Portfolio_cms](https://github.com/shifana0105/Portfolio_cms)

---

*Built to make creating and maintaining a professional developer portfolio simpler and more manageable.*