# Fullstack Technical Test – Backend Template

This repository provides a NestJS template aligned with professional backend practices for the Fullstack Developer technical test. It implements a simple shopping cart domain and leaves clear extension points so you can focus on the product-specific requirements.

## Tech stack

- [NestJS 10](https://nestjs.com/) with TypeScript
- REST API with automatic OpenAPI (Swagger) documentation
- Class-validator and class-transformer for DTO validation
- [TypeORM](https://typeorm.io/) integration with MySQL (SQL.js is used transparently in tests)
- Jest for unit and e2e testing
- ESLint + Prettier configuration for consistent code style

## Getting started

```bash
cp .env.example .env
npm install
npm run start:dev
```

The API is served on `http://localhost:3000/api` by default and the automatically generated documentation lives at `http://localhost:3000/docs`.

### Database configuration

Update the values in `.env` with the credentials of your MySQL instance. When the service runs with `DATABASE_TYPE=mysql`, TypeORM connects to the configured host. During automated tests `DATABASE_TYPE=sqljs` is used so no external dependency is required.

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
database/
└── mysql/             # SQL scripts for provisioning the MySQL schema in Workbench
```

## Cart domain overview

The example `CartModule` demonstrates pragmatic architectural boundaries:

- `CartController` exposes REST endpoints to manage cart items, discounts, and summaries.
- `CartService` encapsulates the domain logic, including subtotal and discount calculations, and persists state through TypeORM repositories.
- DTOs enforce input validation and provide OpenAPI metadata.
- Entities wrap domain objects to centralize invariants. ORM entity classes (`CartOrmEntity`, `CartItemOrmEntity`) map those invariants to the database schema.

Use this implementation as a starting point and extend the database schema or introduce new modules as required by the challenge.

## Database schema in MySQL Workbench

1. Open the `database/mysql/schema.sql` script in MySQL Workbench.
2. Execute the script against your MySQL server. It creates the `cart_service` database plus the `carts` and `cart_items` tables with the required foreign keys and indexes.
3. Optionally seed the `carts` table with a default record (`00000000-0000-0000-0000-000000000001`) if you want to keep a single shared cart for testing purposes. The application auto-creates it on first use, so this step is not mandatory.

### Recommended deployment target

For a production-ready deployment, provision a managed MySQL instance (for example, AWS RDS, Azure Database for MySQL, or Google Cloud SQL). Managed services handle automated backups, monitoring, and scaling while remaining compatible with the SQL schema provided. For development or staging environments you can use a smaller managed instance or a containerised MySQL database.

### Connecting NestJS to the database

1. Configure the environment variables in `.env` with the credentials of the selected MySQL instance. Ensure the database security group/firewall allows traffic from the NestJS server or VPC.
2. The `DatabaseModule` reads these values through `@nestjs/config` and initialises TypeORM. No additional wiring is required—`CartModule` injects repositories via `TypeOrmModule.forFeature`.
3. When deploying, provide the same environment variables to your process manager (e.g. Docker Compose, Kubernetes secrets, or a CI/CD pipeline). The service will automatically connect on startup and run using MySQL.

## Extending the template

- Add persistence by introducing a repository (e.g., Prisma, TypeORM) in the service layer.
- Secure the API using Nest guards and interceptors.
- Configure deployment scripts or Dockerfiles following your hosting provider.

Feel free to adapt the structure to match your team's conventions while keeping these quality gates (tests, linting, formatting) in place.
