# Registro de Horas

Aplicación full-stack para registrar horas trabajadas por proyecto.

## Stack

- **Backend**: ASP.NET Core 9 Web API + Entity Framework Core 9 + SQLite
- **Frontend**: Angular 21 (standalone components, signals, control flow)

## Estructura

```
backend/HorasApi/      # Web API (.NET 9)
frontend/horas-app/    # SPA Angular 21
```

## Requisitos

- .NET SDK 9.0+
- Node.js 22+ y npm 11+
- Angular CLI 21+

## Cómo correr

### Backend

```bash
cd backend/HorasApi
dotnet run
```

API en `http://localhost:5000` — Swagger en `/swagger`. Al primer arranque crea `horas.db` (SQLite).

### Frontend

```bash
cd frontend/horas-app
npm install
npm start
```

App en `http://localhost:4200`.

## Funcionalidades

- CRUD de **Clientes** (vista tarjetas / tabla, filtro por cualquier campo).
- CRUD de **Proyectos** con código autogenerado (`PROJ-0001`, …).
- Registro de **Horas** por proyecto (2 decimales, 0.01 a 24).
- Menú rápido a carga de horas con selector de proyecto.
- Filtros en todos los listados.
- Botón de salida del sistema.
