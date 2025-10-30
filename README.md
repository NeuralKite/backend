# Fullstack Technical Test – Backend Template

This repository provides a NestJS template aligned with professional backend practices for the Fullstack Developer technical test. It implements a simple shopping cart domain and leaves clear extension points so you can focus on the product-specific requirements.

## Tech stack

- [NestJS 10](https://nestjs.com/) with TypeScript
- REST API with automatic OpenAPI (Swagger) documentation
- Class-validator and class-transformer for DTO validation
- Jest for unit and e2e testing
- ESLint + Prettier configuration for consistent code style

## Getting started

```bash
npm install
npm run start:dev
```

The API is served on `http://localhost:3000/api` by default and the automatically generated documentation lives at `http://localhost:3000/docs`.

## Available scripts

| Command | Description |
| ------- | ----------- |
| `npm run start:dev` | Starts the API with file watching and hot reload. |
| `npm run build` | Compiles the TypeScript sources to `dist/`. |
| `npm run lint` | Runs ESLint using the included configuration. |
| `npm run test` | Executes the unit test suite. |
| `npm run test:e2e` | Executes the end-to-end tests. |

## Project structure

```
src
├── common/            # Space for cross-cutting concerns (filters, interceptors, pipes)
├── config/            # Application configuration files
├── main.ts            # Application bootstrap
├── app.module.ts      # Root module
└── modules/
    └── cart/          # Example cart module with controller, service, DTOs, and entities
```

## Cart domain overview

The example `CartModule` demonstrates pragmatic architectural boundaries:


## Extending the template

- Add persistence by introducing a repository (e.g., Prisma, TypeORM) in the service layer.
- Secure the API using Nest guards and interceptors.
- Configure deployment scripts or Dockerfiles following your hosting provider.

Feel free to adapt the structure to match your team's conventions while keeping these quality gates (tests, linting, formatting) in place.
