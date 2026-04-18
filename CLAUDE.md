# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Backend**: ASP.NET Core 9 Web API + Entity Framework Core 9 + SQLite (`backend/HorasApi/`)
- **Frontend**: Angular 21 SPA with standalone components, signals and new control flow (`frontend/horas-app/`)
- Domain language is **Spanish** (Clientes, Proyectos, RegistrosHoras). Keep names/strings consistent with that convention.

## Commands

### Backend (from `backend/HorasApi/`)
- `dotnet run` — start API at `http://localhost:5000`, Swagger at `/swagger`
- `dotnet build` — compile
- `dotnet watch run` — hot reload

### Frontend (from `frontend/horas-app/`)
- `npm start` — serve at `http://localhost:4200`
- `npm run build` — production build to `dist/`
- `npm test` — Karma/Jasmine (no spec files yet)
- `npx ng generate component features/<feature>/<name>` for new components

Both servers must run together: Angular calls the API via `API_URL` in `src/app/core/api.config.ts` (hardcoded to `http://localhost:5000/api`) and the backend whitelists `http://localhost:4200` through the `AllowAngular` CORS policy in `Program.cs`.

## Architecture notes

### Database lifecycle
- `Program.cs` calls `db.Database.EnsureCreated()` on startup — **there are no EF migrations**. Schema changes to entities require deleting `horas.db` (and `.db-shm`/`.db-wal`) or introducing migrations deliberately. Do not assume `dotnet ef migrations add` is wired up.
- Connection string lives in `appsettings.json` → `ConnectionStrings:DefaultConnection` (`Data Source=horas.db`, relative to the run directory).

### Domain relationships (see `Data/AppDbContext.cs`)
- `Proyecto.Codigo` is unique-indexed and auto-generated as `PROJ-{Id:D4}`. `ProyectosController.Create` uses a **two-phase save**: insert with a `TMP-{guid}` placeholder to get an identity, then overwrite `Codigo` and save again. Preserve this pattern if you touch project creation — `Codigo` is not user-supplied.
- `Proyecto → Cliente`: `DeleteBehavior.Restrict` (cannot delete a client with projects).
- `RegistroHoras → Proyecto`: `DeleteBehavior.Cascade` (deleting a project removes its hour records).
- `RegistroHoras.Horas` is `decimal(5,2)`, validated to 0.01–24 range in the DTOs/UI.

### API shape
- Routes: `api/clientes`, `api/proyectos`, `api/registros-horas` (kebab-case).
- Controllers return **DTOs** from `Dtos/` (records), never entities — keep Cliente/Proyecto navigation properties out of responses.
- `GET /api/registros-horas?proyectoId=<n>` filters by project; the frontend relies on this for the per-project hours page.

### Frontend structure
- Routes are lazy-loaded via `loadComponent` in `src/app/app.routes.ts`. Default redirects to `/proyectos`; unknown paths also redirect there.
- Feature folders under `src/app/features/` (`clientes/`, `proyectos/`, `registros-horas/`, `salir/`) own their components + templates + styles.
- Services in `src/app/core/services/` wrap `HttpClient` calls. Typed models live in `src/app/models/`.
- Use standalone components, `signal()` / `computed()` for state, and the new `@if` / `@for` control flow — don't reach for `NgIf`/`NgFor` or `NgModule`.
- Prettier config is inline in `package.json`: 100-char width, single quotes, Angular parser for HTML.

## Conventions worth preserving

- Entity `Descripcion` fields are `.Trim()`ed in controllers before save; mirror that when adding new writable string fields.
- The `salir` route is a UX "exit" screen, not auth logout — there is no authentication in this project.
- All user-facing text, routes, and DB identifiers are Spanish; don't translate them to English when adding features.
