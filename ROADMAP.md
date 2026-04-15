# Kit Suite: Technical Mentorship Roadmap

This roadmap outlines the step-by-step construction of an enterprise-grade PM & QA system.

---

## Phase 1: Authentication & Security
**Objective:** Establish a secure, stateless identity provider.

### 🗄️ Database Changes
- Table: `users` (id, email, password_hash, role, full_name, is_active)
- Table: `refresh_tokens` (id, user_id, token, expiry_date)

### 🧩 Entities
- `User`: Implements `UserDetails`.
- `Role`: Enum (`PROJECT_MANAGER`, `DEVELOPER`, `QA`, `USER`).

### 🔌 APIs
- `POST /api/auth/register`: Public registration.
- `POST /api/auth/login`: Returns JWT + User metadata.
- `POST /api/auth/refresh`: Rotates JWT using refresh token.

### 🛡️ Security Rules
- Permit all on `/api/auth/**`.
- Authenticated only for all other routes.
- BCrypt password encoding (strength 10+).

### 🧪 Testing Strategy
- **Unit:** Test JWT generation and expiration logic.
- **Integration:** Mock MVC tests for login with valid/invalid credentials.

---

## Phase 2: Project Module
**Objective:** Create the top-level organizational structure.

### 🗄️ Database Changes
- Table: `projects` (id, name, code, description, manager_id, status, is_deleted)

### 🧩 Entities
- `Project`: Linked to `User` (Manager).
- Audit fields: `@CreatedDate`, `@LastModifiedDate`.

### 🔌 APIs
- `GET /api/projects`: Paginated list (Filter `is_deleted = false`).
- `POST /api/projects`: Create new project.
- `PUT /api/projects/{id}`: Update metadata.

### 🛡️ Security Rules
- `@PreAuthorize("hasRole('PROJECT_MANAGER')")` for Create/Update.
- All authenticated users can View.

### 🧪 Testing Strategy
- **Contract Testing:** Ensure DTOs match frontend expectations.
- **Security Testing:** Verify a `DEVELOPER` cannot POST a new project.

---

## Phase 3: Task Module
**Objective:** Implement the core workflow engine.

### 🗄️ Database Changes
- Table: `tasks` (id, project_id, title, status, priority, assignee_id, creator_id)

### 🧩 Entities
- `Task`: Many-to-One with `Project`.
- `TaskStatus`: Enum (`TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`).

### 🔌 APIs
- `GET /api/projects/{id}/tasks`: Kanban board data.
- `PATCH /api/tasks/{id}/status`: State machine transition.
- `POST /api/tasks/{id}/comments`: Add feedback.

### 🛡️ Security Rules
- Only `PROJECT_MANAGER` or `DEVELOPER` can create tasks.
- Only `Assignee` or `PM` can move status to `DONE`.

### 🧪 Testing Strategy
- **State Machine Test:** Ensure `TODO` cannot jump directly to `DONE` if business rules forbid it.

---

## Phase 4: Test Case Module
**Objective:** Define quality standards.

### 🗄️ Database Changes
- Table: `test_cases` (id, task_id, title, steps, expected_result, priority)

### 🧩 Entities
- `TestCase`: Linked to `Task`.

### 🔌 APIs
- `GET /api/tasks/{id}/test-cases`: View requirements.
- `POST /api/test-cases`: Define new test scenario.

### 🛡️ Security Rules
- `DEVELOPER` and `PM` can create/edit.
- `QA` can view and execute.

---

## Phase 5: QA Issue Module
**Objective:** Track defects and resolutions.

### 🗄️ Database Changes
- Table: `issues` (id, task_id, reporter_id, assignee_id, severity, status)

### 🔌 APIs
- `POST /api/issues`: Reported by QA.
- `PATCH /api/issues/{id}/status`: Resolve/Close flow.

### 🛡️ Security Rules
- `@PreAuthorize("hasRole('QA')")` for reporting issues.
- `DEVELOPER` can update status to `FIXED`.

---

## Phase 6: Angular Frontend
**Objective:** Provide a high-fidelity, reactive user interface.

### 🏗️ Architecture
- **Core Module:** Singleton services (Auth, Interceptors).
- **Shared Module:** Reusable UI (Buttons, Modals, Badges).
- **Feature Modules:** Lazy-loaded modules for Projects, Tasks, and Admin.

### 🛡️ Route Guards
- `AuthGuard`: Redirects to login if no token.
- `RoleGuard`: Checks `user.role` against required route permissions.

---

## Phase 7: Production Deployment
**Objective:** Ensure reliability and observability.

### 🚀 Strategy
- **Dockerization:** Multi-stage builds for JAR and Static assets.
- **Monitoring:** Actuator endpoints for health checks.
- **Rate Limiting:** Protect against DDoS/Brute force.
- **Database Migration:** Use Liquibase or Flyway for schema versioning.
