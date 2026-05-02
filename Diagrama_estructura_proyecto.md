# Diagrama de Estructura de Proyecto

Aca se presenta la estructura del proyecto, el cual sigue principios de Arquitectura Limpia (Clean Architecture).

### project_alpha
```bash
├── .cursorrules             # Instrucciones específicas para el comportamiento de la IA en este repo
├── ARCHITECTURE.md          # Tu "Constitución" (Raíz del proyecto)
├── docker-compose.yml       # Orquestación de contenedores (Mongo, App)
├── docs/
│   └── openapi.yaml         # El contrato de tu API (Tu fuente de verdad)
├── src/
│   ├── main.ts              # Punto de entrada de NestJS
│   ├── app.module.ts        # Módulo raíz que orquesta los demás
│   │
│   ├── domain/              # CAPA 1: EL CORAZÓN (0 dependencias)
│   │   ├── entities/        # Modelos de negocio (Ej: User.ts)
│   │   ├── ports/           # Interfaces de Repositorios y Servicios externos
│   │   └── exceptions/      # Errores específicos de negocio
│   │
│   ├── application/         # CAPA 2: CASOS DE USO (Solo depende de Domain)
│   │   ├── use-cases/       # Lógica de aplicación (Ej: CreateUser.ts)
│   │   ├── services/        # Servicios de aplicación
│   │   └── dtos/            # Objetos de transferencia de datos
│   │
│   └── infrastructure/      # CAPA 3: DETALLES TÉCNICOS (Depende de todos)
│       ├── controllers/     # Entry points (NestJS Controllers)
│       ├── persistence/     # Implementación de puertos (Mongoose/Prisma)
│       ├── adapters/        # Clientes para APIs externas, logs, etc.
│       └── config/          # Variables de entorno y configuraciones
│
├── test/                    # Tests de integración y E2E
└── package.json
```