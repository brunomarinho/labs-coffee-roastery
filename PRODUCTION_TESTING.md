# Production Testing Strategy

## Pre-Launch Checklist

### Environment Variables (Vercel)
- [ ] `STRIPE_SECRET_KEY` (live key)
- [ ] `STRIPE_WEBHOOK_SECRET` (production endpoint secret)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live key)
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`
- [ ] `ADMIN_PASSWORD` (strong password)
- [ ] `NEXT_PUBLIC_SITE_URL` (https://mamelucacafe.com.br)

### Stripe Configuration
- [ ] Create webhook endpoint in Stripe Dashboard pointing to: `https://mamelucacafe.com.br/api/webhooks/stripe`
- [ ] Enable events: `checkout.session.completed`, `checkout.session.expired`
- [ ] Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`
- [ ] Create test price in Stripe Dashboard (R$1.00) and note the price ID

### Hidden Test Product Setup
1. Create test product file: `/data/products/test-internal.yaml`
   ```yaml
   id: "test-internal"
   inventoryId: "inv_test_internal"
   slug: teste-interno-producao-2024
   name: "TESTE INTERNO - Não Comprar"
   featured: false
   visible: true  # Keep visible for testing, set all other products to false
   category: coffee
   
   description: >
     Produto de teste interno para validação do sistema.
     NÃO FINALIZAR COMPRA.
   notas: Teste do Sistema
   
   price: 1
   quantity: 100g
   stripePriceId: price_xxxxx  # Your test price ID from Stripe
   
   produtor: Teste
   fazenda: Sistema
   regiao: Teste
   variedade: Teste
   processo: Teste
   torra: Teste
   
   images:
     - /images/products/001a.jpg  # Reuse existing image
   ```
2. Deploy to Vercel
3. Access admin panel: `/admin/inventory`
4. Set test product inventory to 1 unit
5. Access directly via: `https://mamelucacafe.com.br/produtos/teste-interno-producao-2024`

## Testing Phases

### Phase 1: Dry Run (Stripe Test Mode)
1. Deploy with Stripe TEST keys
2. Complete full purchase flow with test card: `4242 4242 4242 4242`
3. Verify:
   - [ ] Checkout session creates successfully
   - [ ] Inventory reservation works
   - [ ] Webhook processes payment
   - [ ] Inventory decrements correctly
   - [ ] Email notifications sent

### Phase 2: Live Testing (Production Mode)
1. Switch to Stripe LIVE keys
2. Create hidden test product (R$1.00)
3. Make real purchase using test product URL
4. Monitor in real-time:

```bash
# Vercel Logs (Function logs)
vercel logs --follow

# Check webhook processing
curl https://mamelucacafe.com.br/api/admin/audit \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

### Phase 3: Monitoring Points

#### Immediate Checks (During Checkout)
- [ ] Stripe Dashboard → Payments shows new session
- [ ] Vercel Function logs show reservation created
- [ ] Admin panel shows inventory reserved

#### Post-Payment Checks
- [ ] Stripe Dashboard → Payment successful
- [ ] Webhook logs show: "Payment successful"
- [ ] Inventory decremented in admin panel
- [ ] Customer receives email confirmation
- [ ] Reservation released (not still held)

### Rollback Plan
If issues occur:
1. Set all inventory to 0 immediately via admin panel
2. Add maintenance message to homepage
3. Debug using Vercel logs and Stripe event logs
4. Fix issues and redeploy

## Production Monitoring Commands

```bash
# Check inventory levels
curl https://mamelucacafe.com.br/api/admin/inventory \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# View recent audit logs
curl "https://mamelucacafe.com.br/api/admin/audit?stats=true" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Test webhook manually (Stripe CLI)
stripe trigger checkout.session.completed \
  --stripe-account YOUR_ACCOUNT_ID
```

## Common Issues & Solutions

### Issue: Webhook not processing
- Check `STRIPE_WEBHOOK_SECRET` matches dashboard
- Verify webhook URL in Stripe Dashboard
- Check Vercel Function logs for signature errors

### Issue: Inventory not updating
- Verify Redis connection (`UPSTASH_REDIS_*` vars)
- Check reservation system in audit logs
- Ensure `inventoryId` in product YAML matches Redis

### Issue: Double inventory decrement
- Check for duplicate webhook events
- Verify reservation system is working
- Look for "fallback" messages in logs

## Visibility Control Strategy

The codebase now supports a `visible` field in product YAML files:
- `visible: true` or omitted = Product appears everywhere
- `visible: false` = Product hidden from all pages (returns 404)

### Testing Scenarios

#### Scenario 1: Test Site Without Real Products
1. Add `visible: false` to all real product YAML files
2. Keep test product with `visible: true`
3. Site will only show test product
4. Perfect for initial production testing

#### Scenario 2: Soft Launch With Limited Products
1. Set most products to `visible: false`
2. Keep 1-2 products with `visible: true`
3. Gradually make products visible as ready

#### Scenario 3: Hidden Test Product
1. All real products have `visible: true` (or omitted)
2. Test product has `visible: false`
3. Access test product directly via URL (will work even when hidden)

## Final Pre-Launch Checklist

### Stripe Dashboard
- [ ] All real products have live price IDs created
- [ ] Webhook endpoint configured and active
- [ ] Test mode toggled OFF (using live keys)
- [ ] Payment methods configured for Brazil
- [ ] Email receipts configured properly

### Product Catalog
- [ ] All product YAML files have correct `stripePriceId` (live prices)
- [ ] All products have unique `inventoryId` values
- [ ] Product images optimized and uploaded
- [ ] No test products in main categories
- [ ] Prices match Stripe Dashboard

### Inventory Setup
- [ ] Admin password set (strong, unique)
- [ ] All products synced in admin panel
- [ ] Initial inventory levels set correctly
- [ ] Test product has 1 unit for testing
- [ ] Real products set to 0 until ready

### Content & SEO
- [ ] About page content updated
- [ ] Contact information correct
- [ ] Site URL environment variable set
- [ ] robots.txt accessible
- [ ] Sitemap generates correctly

### Testing Verification
- [ ] Test purchase completed successfully
- [ ] Inventory decreased correctly
- [ ] Webhook processed (check logs)
- [ ] Customer email received
- [ ] CPF and phone collected in Stripe

### Stripe Payment Testing Strategies

#### Option 1: Test Mode in Production (Recommended)
1. Deploy to Vercel with Stripe TEST keys initially
2. Use test cards: `4242 4242 4242 4242` (Visa), `5555 5555 5555 4444` (Mastercard)
3. Complete full purchase flow including webhook processing
4. Verify inventory updates and email confirmations
5. Switch to LIVE keys only after full validation

#### Option 2: Real Payment Testing (Live Mode)
1. Use your own payment method
2. Purchase R$1.00 test product
3. Immediately refund in Stripe Dashboard → Payments
4. Net cost: ~R$0.05 in Stripe fees
5. Validates real payment processing end-to-end

#### Option 3: Stripe CLI Testing (Webhooks Only)
```bash
# Install Stripe CLI and test webhook processing
stripe listen --forward-to https://mamelucacafe.com.br/api/webhooks/stripe
stripe trigger checkout.session.completed
```

#### Test Cards for Different Scenarios
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **3D Secure**: `4000 0000 0000 3220`

### Go-Live Steps (In Order)
1. [ ] Deploy with TEST keys first
2. [ ] Complete test purchase with test cards
3. [ ] Verify webhook processing and inventory updates
4. [ ] Switch to LIVE keys in Vercel environment
5. [ ] Complete real test purchase (R$1.00, then refund)
6. [ ] Delete or set test product inventory to 0
7. [ ] Set real product inventory levels
8. [ ] Announce launch
9. [ ] Monitor first real orders closely

## Success Criteria
- [ ] Test purchase completes without errors
- [ ] Inventory updates correctly (reserved → sold)
- [ ] Webhook processes within 5 seconds
- [ ] Customer data (CPF, phone) stored in Stripe
- [ ] No error logs in Vercel Functions
- [ ] Admin panel shows correct audit trail
- [ ] Hidden test product not visible on /produtos page