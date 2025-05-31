# View-Only Menu Testing Guide

## Overview
The La Strada restaurant menu system now has two distinct access modes:

### 1. **QR Code Access (Table/Room Access)**
- Uses specific tokens linked to tables/rooms
- Shows "Restaurant is closed" warning when accessed outside of working hours (before 12:00 PM)
- Working hours: 12:00 PM - 12:00 AM (midnight)
- Allows ordering when restaurant is open

### 2. **View-Only Menu Access**
- Accessible 24/7 without any time restrictions
- No ordering capability (view-only)
- Perfect for guests to browse menu and prices anytime

## How View-Only Mode is Activated

The system automatically enables view-only mode when:

1. **Production domain** (`menu.theplazahoteledirne.com`) is accessed without a token
2. **Localhost** is accessed without a token (for development)
3. **Any domain** with `?viewonly=true` parameter

## Current Implementation

### Access URLs
- **View-Only Menu**: `https://menu.theplazahoteledirne.com` (no token)
- **QR Code Access**: `https://menu.theplazahoteledirne.com?token=VALID_TOKEN`
- **Development View-Only**: `http://localhost:3000` (no token)
- **Force View-Only**: Any URL with `?viewonly=true`

### Restaurant Hours Logic
- **Restaurant Hours**: 12:00 PM - 12:00 AM (midnight) daily
- **Before 12:00 PM**: Restaurant is considered "closed"

### Behavior During Closed Hours

#### QR Code Access (with valid token):
```
✅ Home page: Accessible
❌ Menu page: Shows "Restaurant is closed" warning
❌ Cart: Not accessible (redirected)
❌ Checkout: Not accessible (redirected)
```

#### View-Only Access (no token):
```
✅ Home page: Accessible 24/7
✅ Menu page: Accessible 24/7 (NO closed warning)
❌ Cart: Not accessible (no valid token)
❌ Checkout: Not accessible (no valid token)
```

## Testing Scenarios

### Test 1: View-Only Menu During Closed Hours
**Time**: Before 12:00 PM or after 12:00 AM
**URL**: `https://menu.theplazahoteledirne.com`
**Expected**: 
- ✅ Can access menu and browse all items 24/7
- ✅ No "restaurant closed" warning
- ❌ Cannot add items to cart (view-only mode)

### Test 2: QR Code Access During Closed Hours
**Time**: Before 12:00 PM or after 12:00 AM
**URL**: `https://menu.theplazahoteledirne.com?token=VALID_TOKEN`
**Expected**:
- ✅ Can access home page
- ❌ Menu shows "Restaurant is closed" warning
- ❌ Cannot access cart/checkout

### Test 3: QR Code Access During Open Hours
**Time**: Between 12:00 PM - 12:00 AM
**URL**: `https://menu.theplazahoteledirne.com?token=VALID_TOKEN`
**Expected**:
- ✅ Full access to menu
- ✅ Can add items to cart
- ✅ Can place orders

### Test 4: Force View-Only Mode
**URL**: `https://menu.theplazahoteledirne.com?token=VALID_TOKEN&viewonly=true`
**Expected**:
- ✅ Bypasses token validation
- ✅ Accessible 24/7 regardless of restaurant hours
- ❌ Cannot add items to cart

## Key Files Modified

1. **`app/menu/page.tsx`**:
   - Added `useAccess` hook import
   - Modified AccessGuard: `requireValidToken={!isViewOnlyMode} requireOpenHours={!isViewOnlyMode}`

2. **`contexts/access-context.tsx`**:
   - View-only detection logic for domain-based access

3. **`components/access-guard.tsx`**:
   - Restaurant hours checking logic

## QR Code Generation

The view-only QR code points to: `https://menu.theplazahoteledirne.com`
- Generated using: `npm run generate-viewonly-qr`
- Located in: `qr-codes-output/view-only-menu-qr.html`

## Development Testing

For local development, you can test by:

1. **View-Only**: Visit `http://localhost:3000` (no token)
2. **QR Access**: Visit `http://localhost:3000?token=TABLE_1_A1B2C3D4E5F6` 
3. **Force View-Only**: Visit `http://localhost:3000?viewonly=true`

## Production Verification

To verify in production:
1. Visit `https://menu.theplazahoteledirne.com` → Should work 24/7
2. Scan a table QR code before 12:00 PM → Should show "closed" warning
3. Scan the view-only QR code before 12:00 PM → Should work normally

## Benefits

- ✅ Guests can check menu 24/7 for planning
- ✅ Reception can show menu to guests anytime
- ✅ QR codes on tables still respect restaurant hours
- ✅ Clear separation between browsing and ordering
- ✅ No confusion about ordering when restaurant is closed 