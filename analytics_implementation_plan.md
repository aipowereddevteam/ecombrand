# Implementation Plan: Admin Reporting & Analytics Module

## Overview
Implement a comprehensive enterprise-grade reporting system with Executive Dashboard and detailed Sales Analytics featuring interactive charts, real-time metrics, and export capabilities.

## User Review Required

> [!IMPORTANT]
> **Data Aggregation Performance**: This module will use MongoDB aggregation pipelines extensively. With large datasets (100K+ orders), some reports may take 2-3 seconds. Should we implement:
> 1. **Background job pre-calculation** (updates every hour, instant reports)
> 2. **Real-time calculation** (slower but always current)
> 3. **Hybrid** (critical metrics real-time, heavy reports cached)

> [!WARNING]
> **Export to PDF**: Requires additional library (`react-pdf` or server-side PDF generation with `puppeteer`). This adds ~15MB to bundle size. Alternative: Export charts as images + CSV data.

> [!IMPORTANT]
> **Date Range Storage**: Should we store historical daily snapshots in a separate collection for faster reporting? Trade-off: Extra storage vs query performance.

## Proposed Changes

### Backend Implementation

#### [NEW] `server/controllers/reportingController.ts`
**Purpose**: Handle all analytics and reporting endpoints

**Key Functions**:
- `getExecutiveDashboard()` - 6 metric cards with MongoDB aggregations
- `getSalesReport()` - Sales analytics with date range filtering
- `getCategoryPerformance()` - Category-wise breakdown
- `getHourlySalesPattern()` - Time-based heatmap data
- `getGeographicDistribution()` - State-wise sales
- `getTopProducts()` - Top 5 performing products
- `exportReport()` - Generate CSV/Excel exports

**MongoDB Aggregations Used**:
- `$facet` for multi-metric dashboard (parallel calculations)
- `$dateToString` for time-based grouping
- `$group` with `$sum`, `$avg` for aggregations
- `$lookup` for joining product data
- `$match` for date range filtering
- `$sort` and `$limit` for top products

#### [NEW] `server/routes/reportingRoutes.ts`
```typescript
router.get('/dashboard', isAuthenticated, authorizeRoles('admin'), getExecutiveDashboard);
router.get('/sales', isAuthenticated, authorizeRoles('admin'), getSalesReport);
router.get('/category-performance', isAuthenticated, authorizeRoles('admin'), getCategoryPerformance);
router.get('/hourly-pattern', isAuthenticated, authorizeRoles('admin'), getHourlySalesPattern);
router.get('/geographic', isAuthenticated, authorizeRoles('admin'), getGeographicDistribution);
router.post('/export', isAuthenticated, authorizeRoles('admin'), exportReport);
```

#### [MODIFY] `server/server.ts`
Add reporting routes:
```typescript
import reportingRoutes from './routes/reportingRoutes';
app.use('/api/v1/admin/reports', reportingRoutes);
```

---

### Frontend Implementation

#### [NEW] `client/app/admin/reports/dashboard/page.tsx`
**Purpose**: Executive Dashboard - Main landing page

**Components**:
- 6 Metric Cards (Revenue, Orders, Customers, AOV, Returns, Reviews)
- Sales Trend Chart (Line chart with Recharts)
- Category Performance (Donut chart)
- Top Products List
- Quick Alerts Section
- Date Range Selector

**Data Fetching**:
- `useEffect` to fetch dashboard data on mount
- `useState` for date range selection
- Auto-refresh every 5 minutes
- Loading states with skeleton UI

**Libraries**:
- `recharts` for charts
- `date-fns` for date handling
- `lucide-react` for icons

#### [NEW] `client/app/admin/reports/sales/page.tsx`
**Purpose**: Detailed Sales Analytics Report

**Sections** (7 total):
1. Sales Overview Cards
2. Sales Trend Line Chart (with zoom)
3. Category-wise Table + Donut Chart
4. Hourly Heatmap (custom component)
5. Payment Method Breakdown
6. Geographic Distribution (table + potential map)
7. Sales Goals Progress Gauge

**Features**:
- Date range filter (preset + custom)
- Export buttons (CSV, Excel, PDF)
- Drill-down functionality (click category → see products)

#### [NEW] `client/components/admin/reports/MetricCard.tsx`
**Purpose**: Reusable metric card with trend indicator

**Props**:
```typescript
interface MetricCardProps {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  sparklineData?: number[];
}
```

**Visual**: 
- Large value display
- Percentage change with colored arrow
- Mini sparkline chart (optional)
- Comparison text

#### [NEW] `client/components/admin/reports/SalesTrendChart.tsx`
**Purpose**: Interactive line chart for sales trends

**Features**:
- Multiple series (revenue, orders, AOV)
- Toggle series visibility
- Tooltip with detailed info
- Moving average overlay
- Responsive design

**Library**: Recharts `LineChart`

#### [NEW] `client/components/admin/reports/HourlyHeatmap.tsx`
**Purpose**: Custom heatmap showing hourly sales patterns

**Implementation**:
- 7 columns (days of week)
- 4 rows (time slots: 00-06, 06-12, 12-18, 18-24)
- Color intensity based on sales value
- Hover tooltip with exact figures

**Styling**: CSS Grid + dynamic background colors

#### [NEW] `client/components/admin/reports/DateRangePicker.tsx`
**Purpose**: Reusable date range selector

**Presets**:
- Last 7 days
- Last 30 days
- Last 90 days
- This Month
- Last Month
- This Quarter
- Custom Range

**State Management**: 
- Controlled component
- Callback to parent with `{ startDate, endDate }`

#### [NEW] `client/components/admin/reports/ExportButton.tsx`
**Purpose**: Handle report export functionality

**Options**:
- CSV: Use `json2csv` library
- Excel: Use `xlsx` library
- PDF: Use `react-to-pdf` or server-side generation

**Implementation**:
- CSV/Excel: Client-side generation from data
- PDF: API call to backend for formatted PDF

#### [NEW] `client/hooks/useReportData.ts`
**Purpose**: Custom hook for fetching report data

```typescript
export function useReportData(
  endpoint: string, 
  dateRange: { start: Date; end: Date }
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data with date range params
    // Handle loading and error states
  }, [endpoint, dateRange]);

  return { data, loading, error, refetch };
}
```

---

### Data Models

#### [MODIFY] `server/models/Order.ts`
Add index for reporting queries:
```typescript
orderSchema.index({ createdAt: -1 }); // For date range queries
orderSchema.index({ createdAt: 1, orderStatus: 1 }); // Compound index
orderSchema.index({ 'shippingInfo.state': 1 }); // For geographic reports
```

#### [NEW] `server/models/DailySnapshot.ts` (Optional - for performance)
**Purpose**: Store pre-calculated daily metrics

```typescript
{
  date: Date,
  metrics: {
    totalRevenue: Number,
    totalOrders: Number,
    avgOrderValue: Number,
    newCustomers: Number,
    categoryBreakdown: Object,
    topProducts: Array
  },
  createdAt: Date
}
```

**Benefits**: Instant historical reports
**Trade-off**: Requires daily cron job to calculate

---

### Styling & UI

#### Component Library Consistency
- Use existing Tailwind CSS utility classes
- Match admin dashboard design patterns
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`
- Dark/Light mode ready (if applicable)

#### Color Palette for Charts
```typescript
const CHART_COLORS = {
  primary: '#3B82F6',    // Blue
  success: '#10B981',    // Green
  warning: '#F59E0B',    // Orange
  danger: '#EF4444',     // Red
  purple: '#8B5CF6',
  teal: '#14B8A6'
};
```

#### Card Shadows
```css
.metric-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  hover: 0 4px 6px rgba(0, 0, 0, 0.15);
}
```

---

## Verification Plan

### Backend Testing
1. Test aggregation queries with sample data (1K, 10K, 100K orders)
2. Verify date range filtering accuracy
3. Test export generation (CSV/Excel)
4. Check query performance (should be < 3 seconds)

### Frontend Testing
1. Verify all charts render correctly with data
2. Test date range selector updates charts
3. Check responsive design on mobile/tablet/desktop
4. Verify export buttons download files
5. Test loading states and error handling

### Integration Testing
1. Full dashboard load with all widgets
2. Drill-down from category to product list
3. Export full sales report
4. Verify metric calculations match manual calculations

### Performance Testing
1. Dashboard load time < 2 seconds
2. Chart interactivity smooth (60 FPS)
3. Export generation < 5 seconds
4. Memory usage acceptable (< 100MB)

---

## Implementation Order

### Phase 1: Backend Foundation (Week 1)
1. Create `reportingController.ts` with basic endpoints
2. Implement MongoDB aggregations for dashboard metrics
3. Add reporting routes to server
4. Test with Postman/cURL

### Phase 2: Executive Dashboard UI (Week 1)
1. Create dashboard page layout
2. Implement 6 metric cards
3. Add date range picker
4. Integrate with backend API
5. Add loading states

### Phase 3: Charts & Visualizations (Week 2)
1. Sales Trend Line Chart
2. Category Donut Chart
3. Hourly Heatmap
4. Top Products List
5. Quick Alerts Section

### Phase 4: Sales Analytics Report (Week 2)
1. Create sales report page
2. Implement all 7 sections
3. Add interactive features (drill-down, toggles)
4. Geographic distribution table

### Phase 5: Export Functionality (Week 3)
1. CSV export (client-side)
2. Excel export (client-side)
3. PDF export (server-side with Puppeteer)
4. Schedule email reports (stretch goal)

### Phase 6: Testing & Refinement (Week 3)
1. Performance optimization
2. Edge case handling
3. UI polish
4. Documentation

---

## Dependencies to Install

### Backend
```bash
npm install --save puppeteer  # For PDF generation (optional)
```

### Frontend
```bash
npm install --save recharts xlsx json2csv date-fns
npm install --save-dev @types/recharts
```

---

## Estimated Effort
- **Backend**: 15-20 hours
- **Frontend**: 25-30 hours
- **Testing**: 10 hours
- **Total**: ~50-60 hours (1.5-2 weeks for 1 developer)

---

## Future Enhancements
1. **Real-time Updates**: WebSocket for live dashboard
2. **Custom Report Builder**: Drag-and-drop report creation
3. **Scheduled Reports**: Email daily/weekly summaries
4. **Comparison Mode**: Compare two date ranges side-by-side
5. **Forecasting**: ML-based sales predictions
6. **Custom Alerts**: Notify when metrics hit thresholds
