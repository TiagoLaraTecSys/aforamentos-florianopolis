# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development** (runs Laravel server + queue + logs + Vite concurrently):

```bash
composer run dev
```

**Run tests:**

```bash
composer run test
# or directly:
php artisan test
php artisan test --filter=TestClassName
```

**Frontend only:**

```bash
npm run dev    # development with HMR
npm run build  # production build
```

**Database:**

```bash
php artisan migrate
php artisan migrate:fresh --seed
```

**Deploy to production:**

```bash
./deploy.sh
```

## Architecture

**Aforamentos Web** is a cemetery (cemitério) management system for tracking burial records and regularizations. Built
with Laravel 12 backend API + React SPA frontend.

### Request Flow

All frontend routes (`/{any}`) serve the React SPA. The frontend communicates with the backend via `/api/*` endpoints.
Authentication is session-based (Laravel Breeze) with Sanctum support for API tokens.

### Backend Structure

- **Models**: `Cemiterio`, `Burial`, `User` (with Spatie RBAC roles/permissions)
- **API Controllers**: `app/Http/Controllers/Api/` — RESTful, return JSON
- **Form Requests**: `app/Http/Requests/` — validation with Portuguese error messages
- **Routes**: `routes/api.php` (API) + `routes/web.php` (SPA catch-all + auth endpoints)

The `Sepultamento` model is a legacy burial model; `Burial` is the current replacement linked to `Cemiterio` via
`cemetery_id`.

### Authorization

Spatie Laravel Permission handles RBAC. The current branch (`feature/add-user-roles`) is implementing role assignment.
Protected API routes use `auth` middleware (web session guard).

### Frontend Structure

React SPA in `resources/js/`. Uses:

- **Radix UI** for accessible components
- **React Hook Form** for form handling
- **TailwindCSS 4** for styling
- **Recharts** for data visualization

### Testing

Uses SQLite in-memory database. Tests live in `tests/Unit/` and `tests/Feature/`. Config auto-clears before each test
run (`php artisan config:clear`).

### Key Enums

`CemeteryType`: `Municipal`, `Particular`, `Paroquial`

Burial types (`burials.burial_type`): `INUMAÇÃO`, `TUMULAÇÃO`, `EXUMAÇÃO`, `TRANSLADAÇÃO`, `CREMAÇÃO`, `REINUMAÇÃO`,
`OSSÁRIO`

### Database Notes

- Soft deletes on `cemiterios` and `burials`
- `burials.cemetery_id` nullable FK → `cemiterios.id` (cascades on delete)
- Unique constraint on cemetery name

### Functionality requirements

- The frontend is a ready developed with mock examples, I start to migrate the mocks to models, controllers and etc to
  PHP Laravel.
- The Ideia is to migrate the mocked objects and behaviours on frontend to backend php. Currently the data save only in
  useState.
- Based on the frontend build all stuffs necessary in PHP Laravel Backend to frontend come to real and save data on
  database.
- Every Operation CRUD have to be logged with before and after object.
- If a update, create or delete operation was made by guest or operator user, the operation stay in "standby", waiting
  for Admin/Moderator aprove then the operation can be saved on database.
- A notification should be generated for all Admin/Moderator users when a guest or normal User Made some operation.
- The Burial has to have historical logs Two
- Remember all the frontend is like the functionality especifications
