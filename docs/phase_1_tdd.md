# Technical Design Document (TDD)

Project: POS SaaS Portfolio
Architecture: Modular Monolith (NestJS)

---

# 1️⃣ System Overview

Build a scalable, multi-tenant POS SaaS demonstrating:

* Backend ownership end-to-end
* Production-grade architecture
* Clean modular structure

# 2️⃣ Architecture Design

## 2.1 Architectural Style

**Modular Monolith (Module-Based)**

Reason:

* Faster MVP iteration
* Clear domain boundaries
* Easy future extraction to microservices

Each module:

* Has its own controller
* Has its own service
* Has its own repository layer
* No cross-module direct DB access

Inter-module communication:
→ via service layer only
→ never repository-to-repository

---

## 2.2 Modules Breakdown

### 1. Auth Module

* Login
* JWT issuance
* JWT validation
* Role guard

---

### 2. Tenant Module

* Store registration

---

### 3. User Module

* Role-based users (Admin, Cashier)
* Permission validation

---

### 4. Product Module

* CRUD
* Category
* Pagination
* Stock management

---

### 5. Order Module

* Cart
* Order

---

### 6. Reporting Module

* Daily revenue aggregation
* Best selling products
* Sales summary (range-based)

---

# 3️⃣ Database Design

DB: Supabase (PostgreSQL)
ORM: Drizzle ORM

---

## Core Tables

### tenants

* id
* name
* created_at

---

### users

* id
* tenant_id
* role (ADMIN | CASHIER)
* email
* password_hash

---

### products

* id
* tenant_id
* name
* price
* stock
* category_id
* created_at

INDEX:

* (tenant_id)
* (tenant_id, name)

---

### categories

* id
* tenant_id
* name

---

### orders

* id
* tenant_id
* cashier_id
* total_amount
* created_at

INDEX:

* (tenant_id, created_at)

---

### order_items

* id
* order_id
* product_id
* quantity
* price

---

## Query Strategy

* Always filter by `tenant_id`
* Use pagination (limit + offset or cursor-based)
* Avoid N+1 by:

  * Join query for order_items + product
  * Aggregation via SQL

---

# 4️⃣ Authentication & Authorization

## Strategy

* Stateless JWT
* Refresh token for longer access
* Stored in HTTP-only cookie (preferred) or Authorization header

## Claims

* user_id
* tenant_id
* role

---

## Guards

* JWT Auth Guard
* Role Guard

---

# 5️⃣ Validation Strategy

## Backend

* class-validator + DTO
* ValidationPipe (global)
* Transform enabled
* Whitelist true
* ForbidNonWhitelisted true

---

## Frontend

* Zod schema
* Shared validation logic (optional future improvement)

---

# 6️⃣ Error Handling

Follow NestJS best practice:

* Global Exception Filter
* Custom BusinessException
* Proper HTTP status codes
* Structured error response:

{
code: "INSUFFICIENT_STOCK",
message: "Product stock is not enough"
}

---

# 7️⃣ Failure Handling

## Database Timeout

* Set connection timeout
* Retry policy (max 2 attempts for read)
* Proper error logging

---

# 8️⃣ Logging & Monitoring

## Logging

* Use NestJS Logger abstraction
* Structured JSON logs
* Log:
  * request_id
  * tenant_id
  * user_id
  * latency

---

## Monitoring

* Sentry integration
* Capture:
  * Unhandled exceptions
  * Performance traces
  * Failed transactions

---

# 9️⃣ Frontend Architecture

Stack:

* React + TypeScript
* Tailwind
* React Query
* Zustand

---

## State Strategy

Server state:
→ React Query

Client state:
→ Zustand (cart, session state)

---

## Pages

* /login
* /dashboard
* /products
* /pos
* /reports

---

# 🔟 Performance Considerations

* Pagination everywhere
* Indexed columns
* No SELECT *
* Avoid N+1 via joins

---

# 11️⃣ Code Quality & Maintainability

* Nest.js Swagger documentation
* ESLint + Prettier
* Strict TypeScript
* Module-based folder structure
* No business logic inside controller
* Repository pattern via Drizzle abstraction

---

# 12️⃣ Deployment

Platform:

* Vercel (Frontend)
* Vercel Serverless / Node deployment for backend

CI:

* Lint before build
* Type check before deploy

---

# 13️⃣ Scalability Path (Future)

If needed:

* Extract Reporting module
* Extract Subscription module
* Introduce Redis for caching
* Introduce read replicas
* Horizontal scaling via stateless JWT

---
