# Project Alpha 🚀

Project Alpha is a robust backend application built with **NestJS**, designed following the principles of **Clean Architecture** (Hexagonal Architecture / Ports & Adapters). This ensures the business logic is decoupled from technical details like databases, frameworks, or external APIs.

## 🏛️ Architecture

The project is structured into three main layers to protect the **Domain** (the core of the application):

1.  **Domain Layer** (`src/domain`): Contains entities, ports (interfaces), and business logic. It has **zero** dependencies on external frameworks or libraries.
2.  **Application Layer** (`src/application`): Contains use cases that orchestrate the domain logic to perform specific tasks.
3.  **Infrastructure Layer** (`src/infrastructure`): Contains technical implementations like controllers, database repositories, and external adapters.

> [!IMPORTANT]
> For a detailed explanation of the rules and layer boundaries, please refer to the **[ARCHITECTURE.md](ARCHITECTURE.md)** file.

## 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** MongoDB (via Mongoose)
- **Containerization:** [Docker](https://www.docker.com/) & Docker Compose
- **API Specification:** [OpenAPI 3.0](docs/openapi.yaml)

## 📁 Project Structure

```bash
├── .cursorrules             # AI behavior instructions for this repo
├── ARCHITECTURE.md          # Architectural "Constitution"
├── docker-compose.yml       # Container orchestration (Mongo, App)
├── docs/
│   └── openapi.yaml         # API Contract (Source of Truth)
├── src/
│   ├── main.ts              # NestJS entry point
│   ├── app.module.ts        # Root module
│   ├── domain/              # Layer 1: The Core (0 dependencies)
│   ├── application/         # Layer 2: Use Cases (Depends on Domain)
│   └── infrastructure/      # Layer 3: Technical Details (Depends on all)
├── test/                    # Integration and E2E tests
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose

### Installation

```bash
# Install dependencies
npm install
```

### Running Locally

```bash
# Development mode
npm run start:dev
```

### Running with Docker

```bash
# Start the application and MongoDB
docker-compose up --build
```

## 📖 API Documentation

The API contract is defined using OpenAPI. You can find the specification in:
`docs/openapi.yaml`

It includes endpoints for:
- **General**: Health checks.
- **Admin**: Plan management.
- **Subscriptions**: Customer subscription management.
- **Orchestration**: Access validation.

## ⚖️ Critical Rules

- **Domain Isolation**: No imports from `@nestjs/common` or any other library inside `src/domain`.
- **Port usage**: Use cases in `src/application` must access data only through **Ports** (interfaces).
- **Test-Driven**: Every new Use Case **must** be accompanied by a `.spec.ts` unit test.

---
Developed with ❤️ following Clean Architecture principles.
