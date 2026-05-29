# Commission System Guide

## Current Implementation

### How It Works Now
1. **Fixed Commission Rate**: Currently hardcoded at **10% for all plans**
2. **Same Split Across Plans**:
   - 1 Month Plan (₹99) → Commission: ₹9.90
   - 1 Year Plan (₹499) → Commission: ₹49.90
   - 5 Years Plan (₹1999) → Commission: ₹199.90

3. **Commission Flow**:
   - User subscribes to a plan
   - Commission = `plan_price × 0.10`
   - Referrer gets pending commission (admin must approve)
   - Admin can manually "give" commission to referrer
   - Amount credited to referrer's `mainWalletBalance`

### Files Involved
- [server/routes/streaming.js](server/routes/streaming.js#L90) - Hardcoded 10% calculation
- [server/models/Commission.js](server/models/Commission.js) - Commission record structure
- [server/routes/admin.js](server/routes/admin.js#L265) - Admin commission management
- [client/src/pages/admin/CommissionManagement.jsx](client/src/pages/admin/CommissionManagement.jsx) - Admin UI (view & approve only)

---

## Proposed Enhancement: Per-Plan Commission Configuration

### New Features Needed

#### 1. **Commission Configuration Model**
Store admin-set commission rates per plan:
```javascript
const commissionConfigSchema = {
  plan: String,           // '1_month', '1_year', '5_years'
  commissionPercentage: Number,  // e.g., 10, 15, 20
  level: Number,          // For multi-level MLM (if needed)
  isActive: Boolean,
  updatedBy: ObjectId,
  updatedAt: Date
}
```

#### 2. **Admin UI for Commission Settings**
Add a new section in Admin Dashboard:
- View all plans with current commission percentages
- Edit commission % for each plan
- See preview of actual rupee amounts
- Save changes

#### 3. **API Endpoints**
```
GET    /api/admin/commission-config      - Get all plan commission rates
POST   /api/admin/commission-config      - Create new config
PUT    /api/admin/commission-config/:id  - Update commission rate
DELETE /api/admin/commission-config/:id  - Delete config
```

#### 4. **Dynamic Calculation**
Replace hardcoded 10% in streaming.js:
```javascript
// Current (hardcoded):
const commissionAmount = price * 0.10;

// Proposed (dynamic):
const config = await CommissionConfig.findOne({ plan: pkg.key, level: 1 });
const commissionPercent = config?.commissionPercentage || 10;
const commissionAmount = price * (commissionPercent / 100);
```

---

## Example: Multi-Plan Commission Structure

### Scenario 1: Same Commission Across All Plans
```
1 Month   (₹99)  → 10% → ₹9.90
1 Year    (₹499) → 10% → ₹49.90
5 Years   (₹1999)→ 10% → ₹199.90
```

### Scenario 2: Tiered Commission (Higher value = Higher %)
```
1 Month   (₹99)  → 5%  → ₹4.95
1 Year    (₹499) → 10% → ₹49.90
5 Years   (₹1999)→ 15% → ₹299.85
```

### Scenario 3: Volume-Based Commission
```
1 Month   (₹99)  → 15% → ₹14.85
1 Year    (₹499) → 12% → ₹59.88
5 Years   (₹1999)→ 8%  → ₹159.92
```

---

## Implementation Steps

### Step 1: Create CommissionConfig Model
File: `server/models/CommissionConfig.js`

### Step 2: Create Admin Routes
Update: `server/routes/admin.js`
- Add GET /commission-config
- Add POST /commission-config
- Add PUT /commission-config/:id
- Add DELETE /commission-config/:id

### Step 3: Update Subscription Logic
Update: `server/routes/streaming.js`
- Fetch commission config by plan
- Use dynamic percentage instead of hardcoded 0.10

### Step 4: Create Admin UI Component
Create: `client/src/pages/admin/CommissionSettings.jsx`
- Display table of plans with commission rates
- Inline edit form
- Save/cancel buttons
- Real-time preview of commission amounts

### Step 5: Add to Admin Navigation
Update: `client/src/pages/admin/AdminPage.jsx`
- Add "Commission Settings" tab/section
- Link to new component

---

## Current Commission Payment Flow

```
User subscribes
    ↓
System calculates commission (₹X)
    ↓
Creates pending Commission record
    ↓
Admin sees in "Commission Requests" table
    ↓
Admin clicks "Give Commission" button
    ↓
Commission marked as "paid"
    ↓
Amount added to referrer's mainWalletBalance
    ↓
Referrer can withdraw from wallet
```

---

## Data Flow Diagram

```
Admin Dashboard
    ↓
[Set Commission: 15% for 1-year plan]
    ↓
CommissionConfig database updated
    ↓
User subscribes to 1-year (₹499)
    ↓
Subscription route fetches CommissionConfig
    ↓
Commission calculated: ₹499 × 0.15 = ₹74.85
    ↓
Commission record created (pending)
    ↓
Admin approves
    ↓
Referrer's wallet credited with ₹74.85
```

---

## Summary

**Current State:**
- 10% commission hardcoded for all plans
- No admin control over rates
- Same percentage for every subscription

**Needed:**
- Per-plan commission configuration
- Admin UI to set/edit percentages
- Dynamic calculation based on config
- Clear visibility of commission splits across plans
