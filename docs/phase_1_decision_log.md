# Architecture Decision Log (ADR)

This log tracks the major technical decisions made during the development of the POS SaaS backend.

## ADR 1: Framework Selection (NestJS)
*   **Context**: Need a robust, scalable, and standardized framework for a multi-tenant SaaS.
*   **Decision**: Use **NestJS**.
*   **Consequences**: Provides architectural out-of-the-box (DI, Modules), strong TypeScript support, and a rich ecosystem for Auth and Swagger.

## ADR 2: Architecture Pattern (Modular Monolith)
*   **Context**: Building for eventual microservice migration but wanting low initial complexity.
*   **Decision**: **Modular Monolith**.
*   **Consequences**: Strict domain separation within a single codebase. Easier deployment while maintaining clear boundaries for future extraction.

## ADR 3: Cross-Module Interactions
*   **Context**: How to handle stock updates during order creation.
*   **Decision**: **Service-to-Service via coordination layer**. OrderService coordinates the transaction and calls ProductService.
*   **Consequences**: Respects modular boundaries. Modifying Product logic won't break Order repository.

## ADR 4: Reporting Strategy (CQRS-Lite)
*   **Context**: Complex analytics queries involving multiple tables.
*   **Decision**: **Read-only cross-module repository access**.
*   **Consequences**: High performance for reporting. Avoids "N+1 service calls" or complex memory joins by allowing the Reporting module to perform read-only JOINs across schemas.

## ADR 5: Error Tracking (Sentry)
*   **Context**: Need production monitoring.
*   **Decision**: **Sentry Integration**.
*   **Consequences**: Centralized error logging and performance metrics with minimal overhead.