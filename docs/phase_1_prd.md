# PRD — POS SaaS Portfolio

## 1) Features

### A. Core POS Engine

* Multi-tenant architecture (multiple merchants)
* Product management (CRUD, categories, stock)
* Order creation (cart)

---

### B. Reporting & Analytics

* Daily revenue summary
* Top-selling products
* Sales by time range
* Inventory low-stock alert

---

### C. Role-Based Access

* Admin (owner)
* Cashier
* JWT-based authentication
* Permission middleware

---

# 2) UI Flow / User Journey

### 🔹 Merchant Onboarding

1. Admin registers store
2. Create products & categories
3. View dashboard analytics
4. Filter by date range

---

### 🔹 Cashier Sales Flow

1. Login
2. Open POS products
3. Search / select product
4. Add to cart
5. Submit order

---

### 🔹 Inventory Flow

1. System auto-reduces stock after order submitted
3. Low-stock alert appears in dashboard

---

# 3) MVP Scope (Ship Fast)

* Multi-tenant structure
* Product CRUD
* Order + Cart
* Automatic stock deduction
* Daily sales report
* JWT auth (Admin + Cashier)

### Out of Scope (Phase 2+)

* Payment handling (cash, transfer, QR-ready abstraction)
* Receipt generation (PDF/print-ready API)
* Inventory auto-deduction
* Mobile app
* Multi-branch inventory sync
* AI sales prediction
* Accounting integration
* CRM module
* Loyalty points system
* Refund workflow automation
* Real-time websocket dashboard

---
