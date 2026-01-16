# 📊 Complete Admin Reporting & Analytics Module
## Enterprise E-Commerce Platform - Comprehensive Reporting System

---

## 🎯 Executive Dashboard (Main Landing Page)

### Purpose
**5-Minute Overview** - Admin sees complete business health at a glance

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  📊 EXECUTIVE DASHBOARD                    [Last 30 Days ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ 💰 Revenue   │  │ 📦 Orders    │  │ 👥 Customers │       │
│  │ ₹12,45,678   │  │    2,456     │  │    1,234     │       │
│  │ +12.5% ↑     │  │ +8.3% ↑      │  │ +15.2% ↑     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ 📈 AOV       │  │ 🔄 Returns   │  │ ⭐ Reviews   │       │
│  │ ₹5,067       │  │    142       │  │    856       │       │
│  │ +3.2% ↑      │  │ -2.1% ↓      │  │ +22.4% ↑     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Sales Trend (Last 30 Days)                          │    │
│  │  [Line Chart: Daily Revenue with trend line]        │    │
│  │  Peak: Jan 12 (₹52,340) | Low: Jan 3 (₹18,450)      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────────┐     │
│  │ Category Performance │  │  Top 5 Products          │     │
│  │ [Donut Chart]        │  │  1. Product A - ₹45K     │     │
│  │ Men: 35%             │  │  2. Product B - ₹38K     │     │
│  │ Women: 28%           │  │  3. Product C - ₹32K     │     │
│  │ Kids: 20%            │  │  4. Product D - ₹28K     │     │
│  │ Home: 12%            │  │  5. Product E - ₹24K     │     │
│  │ GenZ: 5%             │  │                          │     │
│  └──────────────────────┘  └──────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🚨 Quick Alerts                                     │    │
│  │  • 12 products low stock (< 5 units)                │    │
│  │  • 8 pending return requests (> 24 hours)           │    │
│  │  • 3 orders stuck in "Processing" (> 48 hours)      │    │
│  │  • Payment reconciliation needed (₹12,340)          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Quick Navigation:                                            │
│  [Sales Reports] [Product Analytics] [Customer Reports]      │
│  [Financial Reports] [Inventory Reports] [Custom Reports]    │
└─────────────────────────────────────────────────────────────┘
```

### Key Metrics Cards

#### 1. **Total Revenue Card**
```javascript
{
  label: "Total Revenue",
  value: "₹12,45,678",
  change: "+12.5%",
  trend: "up",
  comparison: "vs last 30 days",
  sparkline: [120K, 125K, 118K, 135K, ...], // Mini line chart
  target: "₹15,00,000",
  targetProgress: 83%
}
```

#### 2. **Total Orders Card**
```javascript
{
  label: "Total Orders",
  value: "2,456",
  change: "+8.3%",
  breakdown: {
    Processing: 45,
    Packing: 23,
    Shipped: 156,
    Delivered: 2232
  },
  avgDailyOrders: 82
}
```

#### 3. **Total Customers Card**
```javascript
{
  label: "Total Customers",
  value: "1,234",
  newCustomers: 187, // This month
  returningRate: "68%",
  change: "+15.2%"
}
```

#### 4. **Average Order Value (AOV) Card**
```javascript
{
  label: "Avg Order Value",
  value: "₹5,067",
  change: "+3.2%",
  median: "₹4,850",
  highestOrder: "₹23,450"
}
```

#### 5. **Returns Rate Card**
```javascript
{
  label: "Returns",
  value: "142",
  rate: "5.8%", // of total orders
  change: "-2.1%", // Good: returns decreased
  pendingQC: 8,
  approvedThisWeek: 34
}
```

#### 6. **Reviews Card**
```javascript
{
  label: "Reviews",
  value: "856",
  avgRating: 4.3,
  change: "+22.4%",
  pending: 12, // Needs moderation
  distribution: {
    5: 512,
    4: 234,
    3: 78,
    2: 21,
    1: 11
  }
}
```

---

## 📈 REPORT 1: Sales Analytics Report

### Route
`/admin/reports/sales`

### Time Range Filters
- Last 7 days
- Last 30 days
- Last 90 days
- This Month
- Last Month
- This Quarter
- This Year
- Custom Range (Date Picker)

### Report Sections

#### Section 1: Sales Overview
```javascript
{
  totalRevenue: "₹45,67,890",
  totalOrders: 8234,
  avgOrderValue: "₹5,545",
  grossProfit: "₹18,27,156", // Revenue - COGS
  profitMargin: "40%",
  taxCollected: "₹8,22,220" // GST
}
```

**Visual**: Bar chart comparing Revenue vs Profit by month

#### Section 2: Sales Trend Analysis
**Chart Type**: Line Chart with Multiple Series

```javascript
data: [
  {
    date: "2026-01-01",
    revenue: 125000,
    orders: 234,
    avgOrderValue: 534
  },
  // ... daily data
]
```

**Features**:
- Zoom in/out
- Toggle series (revenue/orders/AOV)
- Moving average overlay (7-day, 30-day)
- Forecast line (next 7 days prediction)

#### Section 3: Category-wise Sales
**Chart Type**: Donut Chart + Table

| Category | Revenue | Orders | Avg Price | % of Total |
|----------|---------|--------|-----------|------------|
| Men      | ₹16.0L  | 3,245  | ₹4,932    | 35%        |
| Women    | ₹12.8L  | 2,876  | ₹4,450    | 28%        |
| Kids     | ₹9.1L   | 2,123  | ₹4,287    | 20%        |
| Home     | ₹5.5L   | 876    | ₹6,278    | 12%        |
| GenZ     | ₹2.3L   | 514    | ₹4,475    | 5%         |

**Interactive**: Click category → drill down to products in that category

#### Section 4: Hourly Sales Pattern (Heatmap)
```
        Mon    Tue    Wed    Thu    Fri    Sat    Sun
00-06   12K    10K    9K     11K    13K    8K     7K
06-12   45K    43K    47K    46K    52K    38K    35K
12-18   78K    82K    85K    80K    89K    95K    98K  ← Peak
18-24   56K    54K    58K    61K    67K    72K    75K
```

**Insight**: "Peak sales: Saturday & Sunday, 12 PM - 6 PM"

#### Section 5: Payment Method Breakdown
**Chart Type**: Stacked Bar Chart

```javascript
{
  online: {
    razorpay: "₹38.5L (84%)",
    cod: "₹7.2L (16%)"
  },
  status: {
    paid: "₹43.2L (94.6%)",
    pending: "₹2.5L (5.4%)"
  }
}
```

#### Section 6: Geographic Sales Distribution
**Chart Type**: Map + Table

| State       | Orders | Revenue  | Top City    |
|-------------|--------|----------|-------------|
| Gujarat     | 1,234  | ₹8.5L    | Ahmedabad   |
| Maharashtra | 2,345  | ₹15.2L   | Mumbai      |
| Delhi       | 1,876  | ₹12.8L   | New Delhi   |
| Karnataka   | 1,456  | ₹10.3L   | Bangalore   |
| Tamil Nadu  | 987    | ₹7.1L    | Chennai     |

**Visual**: India map with heat zones

#### Section 7: Sales Goals & Targets
```javascript
{
  monthlyTarget: "₹50,00,000",
  achieved: "₹45,67,890",
  progress: 91.4%,
  remaining: "₹4,32,110",
  daysLeft: 8,
  dailyRequiredRate: "₹54,014"
}
```

**Visual**: Gauge chart showing progress

### Export Options
- Export as PDF (formatted report)
- Export as Excel (raw data)
- Export as CSV
- Schedule Email Report (daily/weekly/monthly)

---

## 📦 REPORT 2: Product Performance Report

### Route
`/admin/reports/products`

### Report Sections

#### Section 1: Top Performing Products
**Table with Sorting**

| Rank | Product        | Revenue | Orders | Stock | Rating | Trend |
|------|----------------|---------|--------|-------|--------|-------|
| 1    | Product Alpha  | ₹4.5L   | 856    | 234   | 4.8    | 📈 +15%|
| 2    | Product Beta   | ₹3.8L   | 678    | 145   | 4.6    | 📈 +12%|
| 3    | Product Gamma  | ₹3.2L   | 543    | 89    | 4.7    | 📉 -3% |
| ...  | ...            | ...     | ...    | ...   | ...    | ...   |

**Features**:
- Sort by any column
- Filter by category
- Search product
- Click product → detailed view

#### Section 2: Low Stock Alerts
```javascript
criticalStock: [
  {
    product: "Product X",
    currentStock: 3,
    avgDailySales: 12,
    daysUntilStockout: 0.25, // Less than a day!
    status: "CRITICAL",
    lastRestockDate: "2026-01-05"
  }
]
```

**Visual**: Red/Yellow/Green color coding

#### Section 3: Slow-Moving Products
**Products with low sales in last 30 days**

| Product      | Stock | Last Sale | Days Since Sale | Action       |
|--------------|-------|-----------|-----------------|--------------|
| Product Old  | 456   | Jan 2     | 13 days         | Discount 20% |
| Product Slow | 234   | Jan 8     | 7 days          | Promote      |

**Suggested Actions**:
- Apply discount
- Bundle with popular product
- Mark as clearance
- Remove from catalog

#### Section 4: Product Lifecycle Analysis
**Chart**: Line chart showing product sales over time

```javascript
stages: {
  introduction: "New launches (0-30 days)",
  growth: "Rising sales (31-90 days)",
  maturity: "Stable sales (91-180 days)",
  decline: "Decreasing sales (180+ days)"
}
```

#### Section 5: Size/Variant Performance
**For each product, show size breakdown**

Product: Premium T-Shirt
| Size | Stock | Sold | Revenue | % of Total |
|------|-------|------|---------|------------|
| S    | 45    | 234  | ₹70,200 | 15%        |
| M    | 23    | 456  | ₹136,800| 30%        |
| L    | 67    | 387  | ₹116,100| 25%        |
| XL   | 89    | 298  | ₹89,400 | 19%        |
| XXL  | 156   | 123  | ₹36,900 | 8%         |

**Insight**: "Stock more M & L, reduce XXL orders"

#### Section 6: Product Profitability
| Product     | Selling Price | Cost  | Margin | Profit/Unit | Total Profit |
|-------------|---------------|-------|--------|-------------|--------------|
| Product A   | ₹1,200        | ₹600  | 50%    | ₹600        | ₹2,34,000    |
| Product B   | ₹2,500        | ₹1,800| 28%    | ₹700        | ₹1,75,000    |

#### Section 7: Product Return Analysis
| Product     | Total Sold | Returns | Return Rate | Top Reason           |
|-------------|------------|---------|-------------|----------------------|
| Product X   | 456        | 34      | 7.5%        | Size issue           |
| Product Y   | 789        | 12      | 1.5%        | Color different      |

**Action**: Add size guide for Product X

---

## 👥 REPORT 3: Customer Analytics Report

### Route
`/admin/reports/customers`

### Report Sections

#### Section 1: Customer Acquisition
```javascript
{
  totalCustomers: 12456,
  newThisMonth: 1234,
  growthRate: "+11.2%",
  acquisitionChannels: {
    organic: "45%",
    googleAds: "25%",
    facebook: "15%",
    referral: "10%",
    others: "5%"
  }
}
```

**Chart**: Funnel chart showing acquisition flow

#### Section 2: Customer Segmentation
**RFM Analysis (Recency, Frequency, Monetary)**

| Segment           | Count | Avg Purchase | Total Revenue | Strategy        |
|-------------------|-------|--------------|---------------|-----------------|
| VIP Customers     | 234   | ₹15,678      | ₹36.7L        | Loyalty rewards |
| Loyal Customers   | 1,456 | ₹8,234       | ₹119.9L       | Cross-sell      |
| At-Risk           | 789   | ₹3,456       | ₹27.3L        | Win-back email  |
| New Customers     | 1,234 | ₹2,345       | ₹28.9L        | Welcome offer   |
| Lost Customers    | 456   | ₹0           | ₹0            | Reactivation    |

**Chart**: Scatter plot (Frequency vs Monetary value)

#### Section 3: Customer Lifetime Value (CLV)
```javascript
{
  avgCLV: "₹23,456",
  topCustomer: {
    name: "Customer ABC",
    totalSpent: "₹1,23,456",
    orders: 23,
    avgOrderValue: "₹5,367"
  }
}
```

**Table**: Top 100 Customers by CLV

#### Section 4: Repeat Purchase Rate
```javascript
{
  totalCustomers: 12456,
  oneTimeBuyers: 7834, // 62.9%
  repeatCustomers: 4622, // 37.1%
  avgRepeatPurchases: 3.2,
  repeatRate: "37.1%"
}
```

**Chart**: Bar chart showing purchase frequency distribution

#### Section 5: Customer Churn Analysis
```javascript
{
  churnRate: "8.5%", // Haven't purchased in 90 days
  churnedLastMonth: 234,
  reactivatedLastMonth: 67,
  atRiskCustomers: 789 // 60+ days since last purchase
}
```

**Action List**: Auto-send win-back email to at-risk customers

#### Section 6: Geographic Distribution
**Same as Sales Report but customer-focused**

| State       | Customers | Avg CLV  | Repeat Rate |
|-------------|-----------|----------|-------------|
| Maharashtra | 3,456     | ₹28,900  | 42%         |
| Gujarat     | 2,345     | ₹24,567  | 38%         |

#### Section 7: Customer Demographics
```javascript
{
  age: {
    "18-25": "25%",
    "26-35": "45%",
    "36-45": "20%",
    "46+": "10%"
  },
  gender: {
    male: "48%",
    female: "50%",
    other: "2%"
  }
}
```

---

## 💰 REPORT 4: Financial Report

### Route
`/admin/reports/financial`

### Report Sections

#### Section 1: Profit & Loss Statement
```javascript
{
  revenue: "₹45,67,890",
  cogs: "₹27,40,734", // Cost of Goods Sold
  grossProfit: "₹18,27,156",
  
  operatingExpenses: {
    shipping: "₹2,34,567",
    marketing: "₹3,45,678",
    platform: "₹1,23,456",
    total: "₹7,03,701"
  },
  
  operatingProfit: "₹11,23,455",
  
  otherExpenses: {
    taxes: "₹2,24,691",
    refunds: "₹1,12,345"
  },
  
  netProfit: "₹7,86,419",
  profitMargin: "17.2%"
}
```

**Chart**: Waterfall chart showing profit breakdown

#### Section 2: Revenue Breakdown
```javascript
{
  productSales: "₹42,34,567 (92.7%)",
  shippingCharges: "₹2,34,567 (5.1%)",
  taxRecovered: "₹98,756 (2.2%)"
}
```

#### Section 3: Payment Gateway Analysis
| Gateway  | Transactions | Volume    | Success Rate | Avg Fee |
|----------|--------------|-----------|--------------|---------|
| Razorpay | 8,234        | ₹45.6L    | 97.8%        | 2.1%    |
| COD      | 1,456        | ₹7.2L     | 92.3%        | ₹25/ord |

**Total Fees Paid**: ₹1,02,345

#### Section 4: Tax Report (GST Breakdown)
```javascript
{
  gstCollected: "₹8,22,220",
  gstPaid: "₹4,93,332",
  gstPayable: "₹3,28,888",
  breakdown: {
    cgst: "₹1,64,444",
    sgst: "₹1,64,444",
    igst: "₹4,93,332"
  }
}
```

#### Section 5: Refund & Return Financial Impact
```javascript
{
  totalRefunds: "₹1,12,345",
  refundRate: "2.5%",
  avgRefundValue: "₹791",
  processingTime: "4.2 days avg"
}
```

#### Section 6: Outstanding Payments
| Order ID  | Customer     | Amount  | Due Date   | Overdue |
|-----------|--------------|---------|------------|---------|
| #ORD-1234 | Customer ABC | ₹12,345 | Jan 10     | 5 days  |
| #ORD-5678 | Customer XYZ | ₹8,900  | Jan 12     | 3 days  |

**Total Outstanding**: ₹2,34,567

---

## 📊 REPORT 5: Inventory Report

### Route
`/admin/reports/inventory`

### Report Sections

#### Section 1: Stock Overview
```javascript
{
  totalProducts: 1,234,
  totalStock: 45,678, // All units across all products
  stockValue: "₹1,23,45,678",
  lowStockItems: 23,
  outOfStock: 8,
  avgStockTurnover: "45 days"
}
```

#### Section 2: Stock Movement
**Table showing stock changes**

| Product     | Opening | Added | Sold | Returns | Closing | Turnover |
|-------------|---------|-------|------|---------|---------|----------|
| Product A   | 500     | 200   | 456  | 12      | 256     | 32 days  |
| Product B   | 300     | 100   | 234  | 5       | 171     | 28 days  |

#### Section 3: Reorder Alerts
**Products that need restocking**

| Product     | Current | Reorder Level | Daily Sales | Action      |
|-------------|---------|---------------|-------------|-------------|
| Product X   | 8       | 50            | 12/day      | Order 500   |
| Product Y   | 23      | 30            | 8/day       | Order 200   |

**Auto-generate Purchase Orders**

#### Section 4: Dead Stock Analysis
**Products with no sales in last 60 days**

| Product     | Stock | Last Sale | Age    | Value   | Action       |
|-------------|-------|-----------|--------|---------|--------------|
| Product Old | 456   | Nov 15    | 61 days| ₹45,600 | Clearance    |

**Total Dead Stock Value**: ₹2,34,567

#### Section 5: Size-wise Stock Summary
For apparel category:

| Size | Total Stock | Value     | Avg Turnover |
|------|-------------|-----------|--------------|
| S    | 2,345       | ₹5.6L     | 25 days      |
| M    | 4,567       | ₹10.9L    | 18 days      |
| L    | 3,456       | ₹8.3L     | 22 days      |
| XL   | 2,234       | ₹5.3L     | 30 days      |
| XXL  | 1,234       | ₹3.0L     | 45 days      |

**Insight**: "Stock more M & L sizes, reduce XXL"

#### Section 6: Stock Accuracy Report
**Audit trail for inventory discrepancies**

| Date    | Product   | System Stock | Physical Count | Variance | Reason      |
|---------|-----------|--------------|----------------|----------|-------------|
| Jan 10  | Product A | 250          | 248            | -2       | Damaged     |
| Jan 12  | Product B | 150          | 152            | +2       | Count error |

---

## 📈 REPORT 6: Marketing Performance Report

### Route
`/admin/reports/marketing`

### Report Sections

#### Section 1: Campaign Performance
**If you have marketing campaigns**

| Campaign        | Budget  | Spent   | Orders | Revenue | ROI   |
|-----------------|---------|---------|--------|---------|-------|
| New Year Sale   | ₹50,000 | ₹48,500 | 234    | ₹12.3L  | 254%  |
| Women's Day     | ₹30,000 | ₹28,900 | 156    | ₹7.8L   | 270%  |

#### Section 2: Discount Impact Analysis
```javascript
{
  ordersWithDiscount: 2,345, // 28.5%
  ordersWithoutDiscount: 5,889, // 71.5%
  avgDiscountPercent: "12.3%",
  revenueImpact: "-₹5,67,890",
  volumeIncrease: "+45%"
}
```

**Chart**: Compare discounted vs non-discounted order values

#### Section 3: Coupon Code Performance
| Coupon Code  | Uses | Revenue   | Avg Discount | Status |
|--------------|------|-----------|--------------|--------|
| WELCOME20    | 456  | ₹4.5L     | 20%          | Active |
| FLAT500      | 234  | ₹2.3L     | ₹500         | Active |
| EXPIRED10    | 0    | ₹0        | 10%          | Expired|

#### Section 4: Referral Program
```javascript
{
  referrals: 234,
  newCustomersViaReferral: 178,
  conversionRate: "76%",
  revenueFromReferrals: "₹8,90,123",
  costPerAcquisition: "₹234"
}
```

---

## 🔄 REPORT 7: Returns & Refunds Report

### Route
`/admin/reports/returns`

### Report Sections

#### Section 1: Returns Overview
```javascript
{
  totalReturns: 234,
  returnRate: "2.8%",
  totalRefundAmount: "₹11,23,456",
  avgProcessingTime: "4.2 days",
  pendingQC: 8,
  approved: 178,
  rejected: 48
}
```

#### Section 2: Return Reasons Analysis
**Chart**: Pie chart of return reasons

| Reason              | Count | % of Total | Avg Refund |
|---------------------|-------|------------|------------|
| Size issue          | 89    | 38%        | ₹4,567     |
| Damaged product     | 45    | 19%        | ₹5,234     |
| Color different     | 34    | 15%        | ₹3,890     |
| Quality issue       | 28    | 12%        | ₹4,123     |
| Wrong item          | 23    | 10%        | ₹4,890     |
| Changed mind        | 15    | 6%         | ₹3,456     |

**Action Items**:
- Add size guide for high-return products
- Improve product photography
- Better quality control

#### Section 3: Product-wise Return Rate
| Product      | Sold | Returns | Rate | Action Needed          |
|--------------|------|---------|------|------------------------|
| Product High | 456  | 67      | 14.7%| Investigate quality    |
| Product OK   | 789  | 23      | 2.9% | Good                   |

**High Return Products** (>10% return rate): Need immediate attention

#### Section 4: QC Performance
```javascript
qcMetrics: {
  avgQCTime: "2.3 days",
  approvalRate: "76%",
  rejectionRate: "24%",
  qcBacklog: 8 // Pending QC
}
```

| QC Manager   | Requests Handled | Avg Time | Approval Rate |
|--------------|------------------|----------|---------------|
| Manager A    | 123              | 2.1 days | 78%           |
| Manager B    | 111              | 2.5 days | 74%           |

#### Section 5: Refund Processing Times
**Chart**: Histogram of refund processing times

```javascript
{
  within24hrs: 45, // 19%
  within48hrs: 89, // 38%
  within72hrs: 67, // 29%
  moreThan72hrs: 33 // 14%
}
```

**Target**: 95% within 48 hours (Currently at 57%)

---

## ⭐ REPORT 8: Review & Rating Report

### Route
`/admin/reports/reviews`

### Report Sections

#### Section 1: Review Overview
```javascript
{
  totalReviews: 8,234,
  avgRating: 4.3,
  newReviewsThisMonth: 456,
  pending: 23,
  distribution: {
    5: 4,920, // 60%
    4: 1,976, // 24%
    3: 823,   // 10%
    2: 329,   // 4%
    1: 164    // 2%
  }
}
```

**Chart**: Horizontal bar chart of rating distribution

#### Section 2: Products Needing Reviews
| Product      | Orders | Reviews | Review Rate | Avg Rating |
|--------------|--------|---------|-------------|------------|
| New Product  | 234    | 12      | 5.1%        | 4.2        |
| Product B    | 456    | 189     | 41.4%       | 4.5        |

**Action**: Send review request emails to recent buyers

#### Section 3: Review Sentiment Analysis
**If using AI (future enhancement)**

```javascript
sentimentAnalysis: {
  positive: "78%",
  neutral: "15%",
  negative: "7%",
  topPositiveKeywords: ["quality", "comfortable", "fast delivery"],
  topNegativeKeywords: ["size", "color", "damaged"]
}
```

#### Section 4: Low-Rated Products (Needs Attention)
| Product   | Avg Rating | Reviews | Top Complaint       | Action       |
|-----------|------------|---------|---------------------|--------------|
| Product X | 2.8        | 45      | Size runs small     | Update guide |
| Product Y | 3.1        | 67      | Color inconsistent  | Better photos|

---

## 🎯 REPORT 9: Custom Report Builder

### Route
`/admin/reports/custom`

### Features
**Drag-and-drop report builder**

#### Builder Interface
```
1. Select Metrics:
   ☑ Revenue
   ☑ Orders
   ☑ Customers
   ☐ Returns
   ☐ Reviews

2. Group By:
   • Day / Week / Month
   • Category
   • Customer Segment
   • Location

3. Filters:
   • Date Range
   • Category
   • Price Range
   • Customer Type

4. Visualization:
   • Table
   • Line Chart
   • Bar Chart
   • Pie Chart

[Generate Report] [Save Template] [Schedule]
```

### Saved Report Templates
- Weekly Sales Summary
- Monthly Product Performance
- Quarterly Financial Report
- Custom Template 1, 2, 3...

---

## 📊 Technical Implementation Guide

### Backend API Endpoints

#### 1. Dashboard API
```javascript
GET /api/v1/admin/analytics/dashboard?period=30d

Response: {
  metrics: {
    revenue: { value: 1245678, change: 12.5 },
    orders: { value: 2456, change: 8.3 },
    customers: { value: 1234, change: 15.2 },
    aov: { value: 5067, change: 3.2 },
    returns: { value: 142, change: -2.1 },
    reviews: { value: 856, change: 22.4 }
  },
  salesTrend: [...],
  categoryBreakdown: [...],
  topProducts: [...],
  alerts: [...]
}
```

#### 2. Sales Report API
```javascript
GET /api/v1/admin/reports/sales?
    startDate=2026-01-01&
    endDate=2026-01-31&
    groupBy=day&
    category=men

Response: {
  overview: {...},
  trend: [...],
  categoryBreakdown: [...],
  hourlyPattern: [...],
  paymentMethods: {...},
  geographic: [...],
  targets: {...}
}
```

#### 3. Product Report API
```javascript
GET /api/v1/admin/reports/products?sortBy=revenue&limit=100

Response: {
  topProducts: [...],
  lowStock: [...],
  slowMoving: [...],
  lifecycle: {...},
  sizePerformance: [...],
  profitability: [...],
  returns: [...]
}
```

#### 4. Customer Report API
```javascript
GET /api/v1/admin/reports/customers

Response: {
  acquisition: {...},
  segmentation: [...],
  clv: {...},
  repeatRate: {...},
  churn: {...},
  geographic: [...],
  demographics: {...}
}
```

### MongoDB Aggregation Pipelines

#### Sales Trend Aggregation
```javascript
const salesTrend = await Order.aggregate([
  {
    $match: {
      createdAt: { $gte: startDate, $lte: endDate },
      isPaid: true
    }
  },
  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
      },
      revenue: { $sum: "$totalPrice" },
      orders: { $sum: 1 },
      avgOrderValue: { $avg: "$totalPrice" }
    }
  },
  { $sort: { _id: 1 } }
]);
```

#### Category Performance Aggregation
```javascript
const categoryBreakdown = await Order.aggregate([
  { $match: { isPaid: true } },
  { $unwind: "$orderItems" },
  {
    $lookup: {
      from: "products",
      localField: "orderItems.product",
      foreignField: "_id",
      as: "productInfo"
    }
  },
  { $unwind: "$productInfo" },
  {
    $group: {
      _id: "$productInfo.category",
      revenue: {
        $sum: {
          $multiply: ["$orderItems.price", "$orderItems.quantity"]
        }
      },
      orders: { $sum: 1 },
      avgPrice: { $avg: "$orderItems.price" }
    }
  },
  {
    $project: {
      category: "$_id",
      revenue: 1,
      orders: 1,
      avgPrice: 1,
      percentOfTotal: {
        $multiply: [
          { $divide: ["$revenue", totalRevenue] },
          100
        ]
      }
    }
  }
]);
```

#### Customer Segmentation (RFM) Aggregation
```javascript
const customerSegments = await Order.aggregate([
  {
    $group: {
      _id: "$user",
      recency: { $max: "$createdAt" }, // Most recent order
      frequency: { $sum: 1 }, // Number of orders
      monetary: { $sum: "$totalPrice" } // Total spent
    }
  },
  {
    $addFields: {
      daysSinceLastOrder: {
        $divide: [
          { $subtract: [new Date(), "$recency"] },
          1000 * 60 * 60 * 24
        ]
      }
    }
  },
  {
    $addFields: {
      segment: {
        $switch: {
          branches: [
            {
              case: {
                $and: [
                  { $lte: ["$daysSinceLastOrder", 30] },
                  { $gte: ["$frequency", 5] },
                  { $gte: ["$monetary", 50000] }
                ]
              },
              then: "VIP"
            },
            {
              case: {
                $and: [
                  { $lte: ["$daysSinceLastOrder", 60] },
                  { $gte: ["$frequency", 3] }
                ]
              },
              then: "Loyal"
            },
            {
              case: {
                $and: [
                  { $gt: ["$daysSinceLastOrder", 60] },
                  { $lt: ["$daysSinceLastOrder", 90] }
                ]
              },
              then: "At-Risk"
            },
            {
              case: { $eq: ["$frequency", 1] },
              then: "New"
            }
          ],
          default: "Lost"
        }
      }
    }
  },
  {
    $group: {
      _id: "$segment",
      count: { $sum: 1 },
      avgPurchase: { $avg: "$monetary" },
      totalRevenue: { $sum: "$monetary" }
    }
  }
]);
```

#### Product Return Rate Aggregation
```javascript
const productReturns = await ReturnRequest.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "order",
      foreignField: "_id",
      as: "orderInfo"
    }
  },
  { $unwind: "$orderInfo" },
  { $unwind: "$orderInfo.orderItems" },
  {
    $group: {
      _id: "$orderInfo.orderItems.product",
      returnCount: { $sum: 1 },
      reasons: { $push: "$reason" }
    }
  },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    // Get total sales for each product
    $lookup: {
      from: "orders",
      pipeline: [
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.product",
            totalSold: { $sum: "$orderItems.quantity" }
          }
        }
      ],
      as: "salesData"
    }
  },
  {
    $project: {
      productName: "$product.title",
      returnCount: 1,
      totalSold: {
        $arrayElemAt: [
          "$salesData.totalSold",
          {
            $indexOfArray: ["$salesData._id", "$_id"]
          }
        ]
      },
      returnRate: {
        $multiply: [
          {
            $divide: [
              "$returnCount",
              {
                $arrayElemAt: [
                  "$salesData.totalSold",
                  { $indexOfArray: ["$salesData._id", "$_id"] }
                ]
              }
            ]
          },
          100
        ]
      },
      topReason: {
        $arrayElemAt: [
          "$reasons",
          0
        ]
      }
    }
  },
  { $sort: { returnRate: -1 } }
]);
```

### Frontend Components

#### Dashboard Component Structure
```jsx
// app/admin/dashboard/page.tsx
'use client';

import MetricsCards from '@/components/admin/dashboard/MetricsCards';
import SalesTrendChart from '@/components/admin/dashboard/SalesTrendChart';
import CategoryChart from '@/components/admin/dashboard/CategoryChart';
import TopProductsTable from '@/components/admin/dashboard/TopProductsTable';
import AlertsPanel from '@/components/admin/dashboard/AlertsPanel';

export default function AdminDashboard() {
  const [period, setPeriod] = useState('30d');
  const { data, loading } = useDashboard(period);

  return (
    <div className="dashboard">
      <header>
        <h1>Executive Dashboard</h1>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </header>

      <MetricsCards metrics={data.metrics} />
      
      <div className="grid grid-cols-2 gap-6">
        <SalesTrendChart data={data.salesTrend} />
        <CategoryChart data={data.categoryBreakdown} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <TopProductsTable products={data.topProducts} />
        <AlertsPanel alerts={data.alerts} />
      </div>
    </div>
  );
}
```

#### Recharts Implementation
```jsx
// components/admin/dashboard/SalesTrendChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function SalesTrendChart({ data }) {
  return (
    <div className="chart-container">
      <h3>Sales Trend (Last 30 Days)</h3>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#8884d8" 
          name="Revenue (₹)"
        />
        <Line 
          type="monotone" 
          dataKey="orders" 
          stroke="#82ca9d" 
          name="Orders"
        />
      </LineChart>
    </div>
  );
}
```

### Data Export Functionality

#### PDF Export (using jsPDF)
```javascript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (reportData, reportName) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(reportName, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  // Summary metrics
  doc.autoTable({
    startY: 40,
    head: [['Metric', 'Value']],
    body: [
      ['Total Revenue', `₹${reportData.revenue}`],
      ['Total Orders', reportData.orders],
      ['Avg Order Value', `₹${reportData.aov}`]
    ]
  });
  
  // Detailed table
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Product', 'Revenue', 'Orders', 'Rating']],
    body: reportData.products.map(p => [
      p.name,
      `₹${p.revenue}`,
      p.orders,
      p.rating
    ])
  });
  
  doc.save(`${reportName}-${Date.now()}.pdf`);
};
```

#### Excel Export (using xlsx)
```javascript
import * as XLSX from 'xlsx';

export const exportToExcel = (reportData, reportName) => {
  const worksheet = XLSX.utils.json_to_sheet(reportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  
  // Auto-size columns
  const max_width = reportData.reduce((w, r) => Math.max(w, r.name.length), 10);
  worksheet['!cols'] = [{ wch: max_width }];
  
  XLSX.writeFile(workbook, `${reportName}-${Date.now()}.xlsx`);
};
```

### Scheduled Reports (using node-cron)

#### Email Report Scheduler
```javascript
// server/schedulers/reportScheduler.ts
import cron from 'node-cron';
import { generateDailySalesReport } from '../utils/reportGenerator';
import { sendEmail } from '../utils/sendEmail';

// Daily report at 8 AM
cron.schedule('0 8 * * *', async () => {
  const report = await generateDailySalesReport();
  
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: 'Daily Sales Report',
    html: report.html,
    attachments: [
      {
        filename: 'daily-sales.pdf',
        content: report.pdf
      }
    ]
  });
});

// Weekly report every Monday at 9 AM
cron.schedule('0 9 * * 1', async () => {
  const report = await generateWeeklySalesReport();
  // Send email...
});

// Monthly report on 1st at 9 AM
cron.schedule('0 9 1 * *', async () => {
  const report = await generateMonthlySalesReport();
  // Send email...
});
```

---

## 🎨 UI/UX Best Practices

### Color Coding for Metrics
```javascript
const getChangeColor = (change) => {
  if (change > 0) return 'text-green-600'; // Growth
  if (change < 0) return 'text-red-600';   // Decline
  return 'text-gray-600';                  // No change
};

const getStockStatusColor = (stock) => {
  if (stock < 5) return 'bg-red-100 text-red-800';      // Critical
  if (stock < 20) return 'bg-yellow-100 text-yellow-800'; // Low
  return 'bg-green-100 text-green-800';                  // Healthy
};
```

### Loading States
```jsx
{loading ? (
  <Skeleton count={6} height={100} />
) : (
  <MetricsCards data={data} />
)}
```

### Empty States
```jsx
{products.length === 0 ? (
  <div className="empty-state">
    <Icon name="inbox" size={64} />
    <h3>No products found</h3>
    <p>Try adjusting your filters</p>
  </div>
) : (
  <ProductTable products={products} />
)}
```

### Responsive Charts
```jsx
import { ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    {/* Chart content */}
  </LineChart>
</ResponsiveContainer>
```

---

## 📱 Mobile Responsiveness

### Dashboard Mobile View
```jsx
<div className="dashboard">
  {/* Desktop: Grid 3 columns */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <MetricCard {...} />
  </div>
  
  {/* Mobile: Stack charts vertically */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <SalesTrendChart />
    <CategoryChart />
  </div>
</div>
```

---

## ✅ Implementation Checklist

### Phase 1: Core Dashboard (Week 1)
- [ ] Executive dashboard with 6 metric cards
- [ ] Sales trend line chart
- [ ] Category performance donut chart
- [ ] Top products table
- [ ] Alerts panel
- [ ] Date range selector

### Phase 2: Sales Reports (Week 2)
- [ ] Sales overview section
- [ ] Sales trend analysis
- [ ] Category-wise sales
- [ ] Hourly heatmap
- [ ] Payment method breakdown
- [ ] Geographic distribution
- [ ] Export to PDF/Excel

### Phase 3: Product & Customer Reports (Week 3)
- [ ] Product performance report
- [ ] Low stock alerts
- [ ] Slow-moving products
- [ ] Customer acquisition report
- [ ] RFM segmentation
- [ ] CLV calculation
- [ ] Churn analysis

### Phase 4: Financial & Inventory (Week 4)
- [ ] P&L statement
- [ ] Tax report (GST)
- [ ] Payment gateway analysis
- [ ] Stock overview
- [ ] Reorder alerts
- [ ] Dead stock analysis

### Phase 5: Advanced Features (Week 5-6)
- [ ] Returns & refunds report
- [ ] Review analysis
- [ ] Custom report builder
- [ ] Scheduled email reports
- [ ] Real-time dashboard updates (Socket.IO)
- [ ] Report caching with Redis

---

## 🚀 Performance Optimization

### Caching Strategy
```javascript
// Cache dashboard data for 5 minutes
const cacheKey = `dashboard:${period}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const data = await generateDashboardData(period);
await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min TTL

return data;
```

### Database Indexing
```javascript
// Create indexes for faster reporting queries
Order.collection.createIndex({ createdAt: -1, isPaid: 1 });
Order.collection.createIndex({ user: 1, createdAt: -1 });
Product.collection.createIndex({ category: 1, isActive: 1 });
ReturnRequest.collection.createIndex({ status: 1, createdAt: -1 });
```

### Pagination for Large Reports
```javascript
GET /api/v1/admin/reports/products?
    page=1&
    limit=100&
    sortBy=revenue&
    order=desc

Response: {
  products: [...],
  pagination: {
    page: 1,
    limit: 100,
    total: 1234,
    pages: 13
  }
}
```

---

## 🎯 Interview Talking Points

When discussing your reporting module:

✅ **"Built comprehensive admin analytics with 9 report types covering sales, products, customers, finances, and inventory"**

✅ **"Implemented complex MongoDB aggregation pipelines with $facet, $lookup, and $unwind for multi-metric analysis in single queries"**

✅ **"Used Recharts for interactive data visualization with responsive charts that work on all devices"**

✅ **"Added Redis caching for dashboard - reduced load time from 2.5s to 150ms"**

✅ **"Implemented PDF/Excel export functionality with jsPDF and xlsx libraries"**

✅ **"Created automated email reports using node-cron for daily/weekly/monthly business insights"**

✅ **"Built RFM customer segmentation (Recency, Frequency, Monetary) for targeted marketing"**

✅ **"Geographic distribution reports with heatmaps showing sales by state/city"**

✅ **"Real-time dashboard updates using Socket.IO when new orders arrive"**

---

This reporting module is **ESSENTIAL** for even basic e-commerce platforms and demonstrates strong data analysis and visualization skills that are valuable at any level (25-50 LPA)