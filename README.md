# Project Alpha — Backend

Backend del proyecto SaaS B2B  **Project Alpha**.  
Construido con **NestJS** siguiendo **Arquitectura Hexagonal** (Ports & Adapters): la lógica de negocio está completamente desacoplada de frameworks, bases de datos y APIs externas.

---

## Stack

| Tecnología | Rol |
|---|---|
| NestJS + TypeScript strict | Framework y lenguaje base |
| MongoDB + Mongoose | Base de datos |
| Docker + Docker Compose | Contenedorización |
| OpenAPI 3.0 | Contrato de APIs (definido en `alpha_spec`) |

---

## Prerequisitos

- **Node.js** v18 o superior
- **Docker** y Docker Compose (para levantar MongoDB)
- Los tres repositorios del ecosistema deben ser hermanos bajo el mismo directorio padre:

```
/[directorio-raíz]/
├── alpha_spec/      ← repo alpha_spec (fuente de verdad del contrato)
├── alpha_backend/   ← este repo
└── alpha_frontend/  ← repo alpha_frontend
```

> Esta estructura es obligatoria para que `sync-api` pueda copiar el `openapi.yaml` de forma local sin necesidad de red ni tokens.

---

## Instalación y arranque

```bash
# 1. Copiar variables de entorno y completar valores
cp .env.example .env

# 2. Instalar dependencias
npm install

# 3. Sincronizar el contrato OpenAPI desde alpha_spec/
npm run sync-api

# 4. Levantar MongoDB con Docker
docker compose up -d
```

El servidor quedará disponible en `http://localhost:3000`.

> **`sync-api`** copia `../alpha_spec/docs/openapi.yaml` a `docs/openapi.yaml` localmente.  
> `docs/openapi.yaml` está en `.gitignore` — es un artefacto local, no se versiona en este repo.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `MONGO_URI` | Cadena de conexión a MongoDB | `mongodb://localhost:27017/project-alpha` |
| `JWT_SECRET` | Secreto para firmar JWT | `cambia_este_valor` |

---

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run sync-api` | Copia el `openapi.yaml` desde `alpha_spec/` al repo local |
| `npm run start:dev` | Inicia el servidor en modo desarrollo (watch) |
| `npm run start:prod` | Inicia el servidor en modo producción |
| `npm run build` | Compila el proyecto |
| `npm run test` | Ejecuta tests unitarios |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:cov` | Reporte de cobertura |

---

## Arquitectura

El proyecto se organiza en tres capas:

```
src/
├── domain/          ← Capa 1: entidades, puertos e interfaces (0 dependencias externas)
├── application/     ← Capa 2: casos de uso (depende solo del dominio)
└── infrastructure/  ← Capa 3: controladores, repositorios, adaptadores
```

Para el detalle completo de convenciones, reglas y patrones de generación:  
→ [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## Contrato de APIs

El `openapi.yaml` se define en el repositorio `alpha_spec` y es la **fuente de verdad absoluta** del contrato. Ningún endpoint se implementa sin estar primero definido en ese contrato.

Antes de implementar o modificar endpoints, ejecutar:

```bash
npm run sync-api
```

---

## Convención de ramas

| Rama | Contenido |
|---|---|
| `main` | Solo features `✅ Implementado` |
| `feat/SPE-XXX` | Trabajo activo de una feature — misma rama en los tres repos |

---

## Flujo de trabajo

Este repo forma parte de un ecosistema de tres repositorios coordinados por el [`MASTER_PLAN`](../alpha_spec/MASTER_PLAN.md). El protocolo de implementación de cada feature está definido ahí.
