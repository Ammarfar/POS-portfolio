# API Contract Document (Phase 1 MVP)

This document outlines the RESTful API endpoints required by the frontend application for the POS SaaS Portfolio.

## Base URL
All requests will be prefixed with `/api/v1`.

## Authentication Flow

Authentication uses JWT tokens passed in the `Authorization: Bearer <token>` header.

### 1. Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and return JWT token along with user entity details (role, merchant).
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI...",
    "user": {
      "id": "user_123",
      "email": "admin@example.com",
      "role": "ADMIN", // or "CASHIER"
      "merchant_id": "merch_123"
    }
  }
  ```

---

## Products & Categories

### 1. List Categories
- **Endpoint**: `GET /categories`
- **Description**: Retrieve list of categories for the active merchant.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "cat_1",
      "name": "Main Courses",
      "icon": "🍛",
      "color": "bg-green-100",
      "product_count": 20
    }
  ]
  ```

### 2. List Products
- **Endpoint**: `GET /products`
- **Query Params**:
  - `category_id` (optional): Filter products by category.
  - `search` (optional): Text search query for filtering by name.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "prod_1",
      "name": "Beef Curry Rice",
      "price": 25000,
      "image_url": "https://url.com/image.jpg",
      "stock": 45,
      "category_id": "cat_1"
    }
  ]
  ```

### 3. Create Product (Admin Only)
- **Endpoint**: `POST /products`
- **Request Body**:
  ```json
  {
    "name": "Spicy Noodles",
    "price": 20000,
    "image_url": "https://url.com/image.jpg",
    "category_id": "cat_2",
    "stock": 100
  }
  ```
- **Response (201 Created)**: Returns the created Product object.

### 4. Update/Delete Product (Admin Only)
- **Endpoints**: `PUT /products/:id` and `DELETE /products/:id`

---

## Orders / POS Checkout

### 1. Submit Order
- **Endpoint**: `POST /orders`
- **Description**: Submit a new order from the cashier POS interface.
- **Request Body**:
  ```json
  {
    "items": [
      { "product_id": "prod_1", "quantity": 2, "price_at_time": 25000 }
    ],
    "subtotal": 50000,
    "tax_amount": 4000,
    "total_amount": 54000,
    "payment_method": "CASH" // or "CARD"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": "ord_8821",
    "status": "COMPLETED",
    "created_at": "2024-03-24T14:59:00Z",
    "total_amount": 54000
    // ... complete order representation
  }
  ```

### 2. List Recent Orders
- **Endpoint**: `GET /orders`
- **Query Params**:
  - `limit` (default: 10)
- **Response (200 OK)**: Returns a list of recently completed Order objects.

---

## Analytics & Reports (Dashboard & Reports Page)

### 1. Dashboard Summary
- **Endpoint**: `GET /analytics/summary`
- **Description**: Returns top-level metrics for the Dashboard header cards.
- **Response (200 OK)**:
  ```json
  {
    "today_revenue": 12450000,
    "orders_today": 45,
    "average_order_value": 276600,
    "low_stock_count": 3
  }
  ```

### 2. Top Selling Products
- **Endpoint**: `GET /analytics/top-products`
- **Description**: Returns rankings of top-selling items.
- **Response (200 OK)**:
  ```json
  [
    {
      "product_name": "Beef Curry Rice",
      "sales_count": 120,
      "total_revenue": 3000000
    }
  ]
  ```

### 3. Detailed Sales Report
- **Endpoint**: `GET /reports/sales`
- **Description**: Returns tabular order data formatted for the Reports page.
- **Query Params**:
  - `date_range` (e.g. `today`, `7D`, `30D`, `YTD`)
  - `search` (Order ID or Cashier Name)
  - `page` / `limit` (Pagination configs)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "order_id": "ORD-10045",
        "date_time": "2024-03-24T14:59:00Z",
        "cashier_name": "Cashier A",
        "total_items": 3,
        "total_amount": 150000,
        "status": "COMPLETED"
      }
    ],
    "meta": {
      "total_results": 100,
      "page": 1,
      "limit": 10
    }
  }
  ```
