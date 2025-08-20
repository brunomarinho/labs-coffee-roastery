# Inventory Management Setup Instructions

The inventory management system has been implemented! Here's how to set it up and test it.

## Prerequisites

1. **Create Upstash Redis Database**
   - Go to https://upstash.com and create a free account
   - Create a new Redis database (select the closest region)
   - Copy the `REDIS_URL` and `REDIS_TOKEN` from the dashboard

## Setup

1. **Environment Variables**
   Copy `.env.local.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with:
   ```bash
   # Stripe Configuration (existing)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_key_here

   # Upstash Redis Configuration
   UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token

   # Admin Configuration
   ADMIN_PASSWORD=your-secure-password-here

   # Stripe Webhook Secret (for local testing)
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

## Testing the System

### 1. Admin Interface Setup
1. Visit: http://localhost:3000/admin/inventory
2. Enter your admin password (from `ADMIN_PASSWORD` env var)
3. Click "Sincronizar Produtos" to initialize inventory for all products
4. Set inventory quantities for products (try setting some to 0, some to low numbers like 2-3)

### 2. Frontend Integration Test
1. Go to the products page: http://localhost:3000/produtos
2. Click on a product to view details
3. You should see:
   - "Esgotado" button if inventory is 0
   - "Apenas X unidades disponíveis" warning if inventory < 5
   - Normal "Comprar" button if inventory > 5

### 3. Checkout Flow Test
1. Try to buy a product with inventory > 0 (should work)
2. Try to buy a product with inventory = 0 (should show "Produto esgotado" error)

### 4. Stripe Webhook Test (Local)
For local webhook testing:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the webhook secret from CLI output to `.env.local` as `STRIPE_WEBHOOK_SECRET`
5. Complete a test purchase - inventory should automatically decrement

## API Endpoints

### Inventory Check
```bash
curl -X POST http://localhost:3000/api/inventory/check \\
  -H "Content-Type: application/json" \\
  -d '{"inventoryId":"inv_000"}'
```

### Admin - Get All Inventory
```bash
curl -X GET http://localhost:3000/api/admin/inventory \\
  -H "Authorization: your-admin-password"
```

### Admin - Update Inventory
```bash
curl -X POST http://localhost:3000/api/admin/inventory \\
  -H "Authorization: your-admin-password" \\
  -H "Content-Type: application/json" \\
  -d '{"inventoryId":"inv_000","quantity":10}'
```

### Admin - Increment/Decrement
```bash
# Add 5 units
curl -X POST http://localhost:3000/api/admin/inventory \\
  -H "Authorization: your-admin-password" \\
  -H "Content-Type: application/json" \\
  -d '{"inventoryId":"inv_000","quantity":5,"operation":"increment"}'

# Remove 1 unit
curl -X POST http://localhost:3000/api/admin/inventory \\
  -H "Authorization: your-admin-password" \\
  -H "Content-Type: application/json" \\
  -d '{"inventoryId":"inv_000","quantity":1,"operation":"decrement"}'
```

### Sync Products
```bash
curl -X POST http://localhost:3000/api/admin/inventory/sync \\
  -H "Authorization: your-admin-password"
```

## System Features

✅ **Real-time inventory tracking** with Upstash Redis  
✅ **Admin interface** for inventory management at `/admin/inventory`  
✅ **Automatic checkout prevention** when out of stock  
✅ **Low stock warnings** when inventory < 5 units  
✅ **Stripe webhook integration** for automatic inventory updates  
✅ **Inventory holds** during checkout process  
✅ **Product sync** to initialize inventory for new products  
✅ **Fallback handling** if Redis is unavailable  

## InventoryId Convention

Each product requires an `inventoryId` field in its YAML file:

- **Format**: `inv_{productId}`
- **Examples**: 
  - Product `id: "001"` → `inventoryId: "inv_001"`
  - Product `id: "blend"` → `inventoryId: "inv_blend"`
  - Product `id: "005"` → `inventoryId: "inv_005"`

This links each product to its Redis inventory record at key `inventory:inv_{productId}`.

## Production Deployment

1. **Vercel Integration**
   - Add Upstash integration through Vercel dashboard
   - Set all environment variables in Vercel project settings

2. **Stripe Webhook**
   - Configure webhook endpoint in Stripe dashboard: `https://yourdomain.com/api/webhooks/stripe`
   - Set webhook secret in production environment variables

3. **Security**
   - Use strong admin password
   - Keep Stripe and Redis credentials secure
   - Monitor webhook logs for issues

## Troubleshooting

- **Redis connection issues**: Check environment variables and Upstash dashboard
- **Webhook not working**: Verify `STRIPE_WEBHOOK_SECRET` and endpoint configuration
- **Admin access denied**: Check `ADMIN_PASSWORD` environment variable
- **Inventory not updating**: Check Redis connectivity and webhook logs

The system gracefully handles failures - if Redis is unavailable, it falls back to allowing purchases (fail-open approach).