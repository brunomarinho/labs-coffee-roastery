# Official Inventory Management System

## Overview

This project uses a **dual-system approach** that separates product catalog information from inventory management:

- **YAML Files** → Product catalog (static product information)
- **Redis + Admin Panel** → Inventory management (dynamic stock levels)

## Architecture

### 📁 YAML Product Files (`/data/products/`)
**Purpose**: Store static product information only
**Location**: `/data/products/{product-id}.yaml`

**Required Fields:**
```yaml
id: "001"                           # Product ID
inventoryId: "inv_001"              # Inventory tracking ID (format: inv_XXX)
slug: "cafe-001"                    # URL slug
name: "001"                         # Product name
category: "coffee"                  # Product category
price: 60                          # Price in reais
stripePriceId: "price_1234..."     # Stripe price ID
description: "Coffee description"   # Product description
# ... other product fields
```

**❌ DO NOT Include:**
- `quantity` - Managed exclusively through admin panel
- `soldOut` - Calculated from Redis inventory
- `available` - Calculated from inventory - reservations

### 🏪 Redis Inventory System
**Purpose**: Real-time inventory tracking and reservations
**Storage**: Upstash Redis with atomic operations

**Key Structure:**
- `inventory:{inventoryId}` → Current stock quantity
- `reserved:{inventoryId}` → Reserved quantities (TTL: 10 minutes)  
- `reservation:{sessionId}` → Individual reservation details

### 🎛️ Admin Panel (`/admin/inventory`)
**Purpose**: Inventory management interface
**Features**: Auto-detects all YAML products, creates Redis entries on-demand

## Workflow

### Creating New Products

1. **Create YAML File** (`/data/products/new-id.yaml`):
   ```yaml
   id: "new-id"
   inventoryId: "inv_new-id"  # Standard format: inv_{product-id}
   name: "New Product"
   price: 50
   stripePriceId: "price_..."
   # ... other product info (NO quantity field)
   ```

2. **Deploy to Production** (automatic via Git)

3. **Set Initial Inventory**:
   - Visit `/admin/inventory`
   - Product appears with "Não configurado" status
   - Set desired quantity (Redis entry created automatically)
   - Product immediately available for sale

### Inventory Management

- **View Stock**: Admin panel shows total/reserved/available for all products
- **Update Stock**: Direct editing in admin panel
- **Reservations**: Automatic 10-minute reservations during checkout
- **Audit Trail**: All changes logged with timestamps and user info

## Inventory ID Convention

**Format**: `inv_{product-id}`

**Examples**:
- Product ID `001` → Inventory ID `inv_001`
- Product ID `blend` → Inventory ID `inv_blend`
- Product ID `special-edition` → Inventory ID `inv_special-edition`

**Benefits**:
- Predictable and consistent
- Easy to trace product ↔ inventory relationship
- Supports automated tooling

## Key Principles

### 1. Separation of Concerns
- **Product Catalog** (YAML) = What we sell
- **Inventory Management** (Redis) = How much we have

### 2. Single Source of Truth
- **Stock Quantities**: Redis only (never in YAML)
- **Product Information**: YAML only (never duplicated in Redis)

### 3. Zero Configuration
- New products start with 0 inventory (safe default)
- Admin panel auto-detects all products
- Redis entries created on-demand

### 4. Atomic Operations
- Inventory reservations use Lua scripts
- Prevents race conditions and overselling
- Automatic cleanup of expired reservations

## Admin Panel Features

### Product Status Indicators
- **🟨 Yellow highlight + "Novo!" badge**: Unconfigured products
- **🟩 Green "Disponível"**: Available for sale  
- **🟥 Red "Esgotado"**: Out of stock
- **⚪ Gray "Não configurado"**: No inventory set

### Inventory Columns
- **Estoque Atual**: Total inventory in Redis
- **Reservado**: Currently reserved quantities
- **Disponível**: Available for sale (Total - Reserved - Buffer)

### Auto-Creation
- Setting inventory for unconfigured products automatically creates Redis entries
- Logged as `create_inventory` action for audit trail

## Development Guidelines

### ✅ DO
- Use the admin panel for all inventory operations
- Include `inventoryId` in all product YAML files
- Follow the `inv_{product-id}` naming convention
- Test new products in admin panel before production

### ❌ DON'T  
- Add `quantity` fields to YAML files
- Manually edit Redis inventory data
- Mix inventory logic in product catalog code
- Assume inventory exists for new products

## Migration Notes

For existing products that may have `quantity` in YAML:
- The system ignores YAML quantity fields
- Redis takes precedence for all inventory decisions
- Admin panel shows true inventory status
- Safe to remove `quantity` from existing YAML files

## Error Handling

- **Redis Unavailable**: Inventory shows as unavailable (fail-safe)
- **Missing Inventory ID**: Auto-generated as `inv_{product-id}`
- **New Products**: Default to 0 inventory until configured
- **Reservation Failures**: Checkout prevented, user notified

## Security

- Admin panel requires authentication
- All inventory changes logged with IP and timestamp
- Rate limiting prevents inventory abuse
- Atomic operations prevent race conditions

---

**Last Updated**: August 2025
**System Version**: Auto-Detection v2.0