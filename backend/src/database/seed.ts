import * as bcrypt from 'bcryptjs';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Seed script: pre-populates the database with demo data
 * matching the frontend mock data.
 *
 * Usage: npx tsx src/database/seed.ts
 */
async function seed() {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log('🌱 Seeding database...');

  // 1. Create tenant
  const [tenant] = await db
    .insert(schema.tenants)
    .values({ name: 'Demo Restaurant' })
    .returning();
  console.log(`  ✅ Tenant: ${tenant.name} (${tenant.id})`);

  // 2. Create users
  const passwordHash = await bcrypt.hash('password123', 10);

  const [admin] = await db
    .insert(schema.users)
    .values({
      tenantId: tenant.id,
      role: 'ADMIN',
      email: 'admin@example.com',
      passwordHash,
    })
    .returning();
  console.log(`  ✅ Admin: ${admin.email}`);

  const [cashier] = await db
    .insert(schema.users)
    .values({
      tenantId: tenant.id,
      role: 'CASHIER',
      email: 'cashier@example.com',
      passwordHash,
    })
    .returning();
  console.log(`  ✅ Cashier: ${cashier.email}`);

  // 3. Create categories (matching frontend mock data)
  const categoryData = [
    { name: 'Main Courses', icon: '🍛', color: 'bg-green-100' },
    { name: 'Beverages', icon: '🥤', color: 'bg-orange-100' },
    { name: 'Desserts', icon: '🍰', color: 'bg-pink-100' },
    { name: 'Kids Menu', icon: '🧸', color: 'bg-yellow-100' },
    { name: 'Pasta & Noodles', icon: '🍝', color: 'bg-red-100' },
    { name: 'Pizza', icon: '🍕', color: 'bg-orange-100' },
    { name: 'Sushi', icon: '🍣', color: 'bg-purple-100' },
    { name: 'Seafood', icon: '🐙', color: 'bg-blue-100' },
  ];

  const categories = await db
    .insert(schema.categories)
    .values(categoryData.map((c) => ({ ...c, tenantId: tenant.id })))
    .returning();
  console.log(`  ✅ ${categories.length} categories created`);

  const mainCourseId = categories.find((c) => c.name === 'Main Courses')!.id;

  // 4. Create products (matching frontend mock data)
  const productData = [
    { name: 'Satay Wagyu', price: 35000, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b44b58e?auto=format&fit=crop&q=80&w=200&h=200', categoryId: mainCourseId },
    { name: 'Tenderloin Potato', price: 32000, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=200&h=200', categoryId: mainCourseId },
    { name: 'Briyani Chicken', price: 22000, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1633504581786-3bd6a0a09f87?auto=format&fit=crop&q=80&w=200&h=200', categoryId: mainCourseId },
    { name: 'Beef Curry Rice', price: 25000, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1582560418512-c51325cafa82?auto=format&fit=crop&q=80&w=200&h=200', categoryId: mainCourseId },
    { name: 'Bibimbap', price: 30000, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&q=80&w=200&h=200', categoryId: mainCourseId },
    { name: 'Tofu Mushroom', price: 35000, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200&h=200', categoryId: mainCourseId },
    { name: 'Sirloin Potato', price: 35000, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1544025162-8e31a9ac7aeb?auto=format&fit=crop&q=80&w=200&h=200', categoryId: mainCourseId },
  ];

  const products = await db
    .insert(schema.products)
    .values(productData.map((p) => ({ ...p, tenantId: tenant.id })))
    .returning();
  console.log(`  ✅ ${products.length} products created`);

  // 5. Create sample orders
  const orderData = [];
  for (let i = 0; i < 10; i++) {
    const numItems = (i % 3) + 1;
    const items = products.slice(0, numItems);
    const subtotal = items.reduce((sum, p) => sum + p.price * 2, 0);
    const taxAmount = Math.round(subtotal * 0.08);
    const totalAmount = subtotal + taxAmount;

    orderData.push({
      tenantId: tenant.id,
      cashierId: i % 2 === 0 ? cashier.id : admin.id,
      subtotal,
      taxAmount,
      totalAmount,
      paymentMethod: (i % 2 === 0 ? 'CASH' : 'CARD') as 'CASH' | 'CARD',
      status: 'COMPLETED' as const,
      createdAt: new Date(Date.now() - i * 3 * 60 * 1000), // Spread across recent timeline
    });
  }

  const orders = await db
    .insert(schema.orders)
    .values(orderData)
    .returning();

  // Create order items for each order
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const numItems = (i % 3) + 1;
    const items = products.slice(0, numItems);

    await db.insert(schema.orderItems).values(
      items.map((p) => ({
        orderId: order.id,
        productId: p.id,
        quantity: 2,
        priceAtTime: p.price,
      })),
    );
  }
  console.log(`  ✅ ${orders.length} orders with items created`);

  console.log('\n🎉 Seed complete!');
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
