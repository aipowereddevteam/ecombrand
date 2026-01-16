E-Commerce Platform - Complete Project Documentation
Project Name: EcomBrand - Enterprise E-Commerce Solution
Tech Stack: MERN + Next.js 16 | TypeScript | Redis | Socket.IO
Architecture: Microservices-Ready Monolith with Real-Time Features

🎯 Executive Summary
EcomBrand is a full-stack enterprise-grade e-commerce platform built with modern technologies. It features real-time order tracking, advanced admin controls, multi-role RBAC, payment gateway integration, automated email workflows, and production-ready deployment with Docker.

Key Highlights:

✅ Complete E-Commerce Workflow - From product browsing to order fulfillment
✅ Multi-Role Admin Panel - Role-Based Access Control with 5 distinct roles
✅ Real-Time Updates - Socket.IO for live notifications and order tracking
✅ Production-Ready - Docker containerization, Redis caching, background job processing
✅ Payment Integration - Razorpay payment gateway with webhook support
✅ Automated Workflows - Email automation for order lifecycle events
✅ Advanced Analytics - Sales trends, revenue tracking, user behavior analytics
✅ Mobile-Responsive UI - Modern Next.js 16 with Tailwind CSS and Framer Motion
📋 Table of Contents
Functional Features
User Features
Admin Features
Non-Functional Features
Technical Architecture
Database Models
API Architecture
Frontend Architecture
DevOps & Deployment
Security Features
Performance Optimizations
Project Workflow
🎨 Functional Features
User Features
1. Authentication & Authorization
Multi-Method User Authentication:

Google OAuth 2.0 Integration

Implementation: passport-google-oauth20 strategy
File: 
server/config/passport.ts
Features: One-click social login, automatic user profile creation
Phone Number Authentication

Implementation: Firebase Authentication
File: client/lib/firebaseConfig.ts
Features: OTP verification, phone number validation
Flow: Send OTP → Verify OTP → Create/Login user
JWT-Based Session Management

Implementation: passport-jwt + jsonwebtoken
File: 
server/middleware/auth.ts
Features: HttpOnly cookies, token refresh, secure session handling
Role-Based Access Control (RBAC):

5 User Roles: user, admin, account_manager, warehouse, accountant

Permission System:

File: 
server/middleware/checkPermission.ts
Granular permissions (e.g., create_product, view_orders, manage_users)
Module-based assignment (e.g., warehouse staff only see inventory)
Frontend Hooks:

Hook: usePermission (checks user permissions client-side)
Conditional rendering based on roles
User Profile Management:

Complete profile with fields: name, email, avatar, phone, gender, DOB, location
Profile photo upload via Cloudinary
Alternate mobile number support
Password-less authentication flow
2. Product Browsing & Discovery
Product Catalog:

Category-Based Navigation

Categories: Men, Women, Kids, Home, GenZ
File: 
server/models/Product.ts
Multi-Media Support

Images + Video support for products
Cloudinary integration for media management
File: 
server/utils/cloudinary.ts
Multiple images per product with type field (image/video)
Size-Based Inventory

Stock tracking by size: S, M, L, XL, XXL
Real-time stock validation during checkout
File: 
server/controllers/orderController.ts
 - 
checkStock
 function
Product Status Management

isActive
 flag to enable/disable products
Prevents checkout of deactivated products
Admin can activate/deactivate from dashboard
Product Search & Filters:

Category-based filtering
Price range filtering
Stock availability filtering
Rating-based sorting
Product Reviews & Ratings:

Model: 
server/models/Review.ts
Features:
Star ratings (1-5)
Written reviews with verification
User profile linking
Admin moderation capability
Automatic numOfReviews and ratings calculation on Product model
Wishlist Management:

Redux-powered wishlist
File: 
client/redux/slices/wishlistSlice.ts
Features: Add/remove products, persist to user profile
API: /api/v1/user/wishlist
Database reference in User model (wishlist field)
3. Shopping Cart & Checkout
Shopping Cart:

Redux state management
File: 
client/redux/slices/cartSlice.ts
 (assumed based on structure)
Features: Add/remove items, quantity adjustment, size selection
Persistent cart (stored in user session)
Checkout Process:

Cart Review - File: 
client/app/cart/page.tsx
Shipping Details - File: 
client/app/shipping/page.tsx
Payment Processing - File: 
client/app/order/confirm/page.tsx
Order Confirmation - File: 
client/app/order/success/page.tsx
Stock Validation:

File: 
server/controllers/orderController.ts
 - 
checkStock
Validates:
Product active status (
isActive
)
Size-specific stock availability
Prevents overselling with concurrent order handling
Shipping Information:

Complete address capture:
Address, City, State, Country
PIN Code, Phone Number
Model: 
IShippingInfo
 in 
Order.ts
4. Payment Processing
Razorpay Integration:

Gateway: Razorpay
File: 
server/controllers/paymentController.ts
Features:
Order creation with Razorpay API
Payment verification via signature validation
Webhook support for payment status updates
Transaction Tracking:

Model: 
server/models/Transaction.ts
Fields:
razorpayOrderId, razorpayPaymentId, razorpaySignature
amount, status, type (payment/refund)
User reference, timestamp, performedBy (for refunds)
Payment Flow:

Create Razorpay order → Return orderId to frontend
User completes payment → Razorpay callback
Backend verifies signature → Creates order in database
Sends payment confirmation email
5. Order Management
Order Lifecycle:

Status Flow: Processing → Packing → Shipped → Delivered
Status History Tracking:
Field: orderHistory in Order model
Captures: status, timestamp, comment, updatedBy (admin user)
Provides complete audit trail
Order Features:

Order summary with itemized details
Tax and shipping price calculation
Courier tracking integration
Fields: courierName, trackingId
Required when status changes to "Shipped"
Order Tracking:

Real-time order status updates via Socket.IO
File: 
server/utils/orderWatcher.ts
MongoDB Change Streams monitor order updates
Emits events to user-specific rooms (user-${userId})
Email Notifications:

Automated emails for:
Order confirmation with invoice
Status updates (Packing, Shipped, Delivered)
Shipping notifications with tracking link
File: 
server/workers/emailWorker.ts
Queue: BullMQ (
server/queues/emailQueue.ts
)
User Order History:

Page: 
client/app/(account)/orders/page.tsx
Features:
View all past orders
Order details with status
Download invoice (future enhancement)
6. Returns & Refunds
Return Request Flow:

Model: 
server/models/ReturnRequest.ts
Fields:
order reference
reason, description
status: Pending → Approved → Rejected → Completed
qcImages (Quality Control photos)
refundAmount, refundStatus
Return Process:

User submits return request
Admin reviews in QC dashboard (
client/app/admin/qc/page.tsx
)
Admin approves/rejects with QC images
If approved, refund worker processes payment
Transaction created with type "refund"
Refund Automation:

Worker: 
server/workers/refundWorker.ts
Queue: 
server/queues/refundQueue.ts
Features:
Automatic Razorpay refund processing
Stock restoration (returns item to inventory)
Transaction logging
Email notification
7. Notifications System
Real-Time Notifications:

Model: 
server/models/Notification.ts
Types: order_update, return_approved, product_back_in_stock
Socket.IO integration for instant delivery
User-specific notification rooms
Notification Features:

Mark as read/unread
Notification history
API: 
server/routes/notificationRoutes.ts
Admin Features
8. Admin Dashboard
Dashboard Analytics:

File: 
client/app/admin/dashboard/page.tsx
Controller: 
server/controllers/analyticsController.ts
Metrics:
Total revenue, total orders, total users
Sales trends (daily, weekly, monthly)
Category-wise sales distribution
Top-selling products
Recent orders overview
Charts & Visualizations:

Library: recharts
Chart types:
Sales trend line chart
Category distribution pie chart
Revenue bar chart
File: 
client/components/admin/analytics/SalesTrendChart.tsx
9. Product Management
Admin Product CRUD:

Page: client/app/admin/product/page.tsx
Controller: 
server/controllers/productController.ts
Features:
Create new products with multi-image upload
Update product details (title, price, description, category)
Manage stock by size (S, M, L, XL, XXL)
Activate/deactivate products (
isActive
 toggle)
Delete products (soft delete recommended)
Media Management:

Cloudinary integration for:
Image optimization
Video uploads
CDN delivery
File: 
server/utils/cloudinary.ts
Stock Management:

Size-wise stock tracking
Low stock alerts (future enhancement)
Bulk stock updates
10. Order Fulfillment
Order Management Dashboard:

Page: 
client/app/admin/orders/page.tsx
Features:
View all orders with filters (status, date)
Order details modal
Status update interface
Order Status Updates:

API: PATCH /api/v1/admin/orders/:id/status
File: 
server/controllers/orderController.ts
Validations:
Requires courierName and trackingId when shipping
Records admin user who made the update (updatedBy)
Adds entry to orderHistory
Courier Integration:

Manual entry of courier details
Tracking link generation
Email automation triggers on status change
11. User Management
User Administration:

Page: 
client/app/admin/users/page.tsx
Controller: 
server/controllers/adminController.ts
Features:
View all users with search
Assign roles and permissions
Module assignment (restrict access to specific admin sections)
Block/unblock users
View user order history
Role & Permission Assignment:

Component: 
client/components/admin/UserManagement/ModuleSelector.tsx
Granular permission control
Module-based access (e.g., warehouse only sees inventory)
12. Quality Control (QC) Dashboard
Return Request Management:

Page: 
client/app/admin/qc/page.tsx
Features:
Review pending return requests
Upload QC inspection images
Approve/reject returns with comments
Trigger refund processing
QC Workflow:

View return request details
Inspect product (upload QC images)
Approve with refund amount or reject
System triggers refund worker if approved
13. Audit Logging
Comprehensive Audit Trails:

Model: 
server/models/AuditLog.ts
Utility: 
server/utils/auditLogger.ts
Tracked Actions:
User role changes
Permission modifications
Order status updates
Product activations/deactivations
Refund processing
Audit Log Features:

Fields: action, performedBy, targetUser, details, timestamp
Searchable logs in admin panel
Page: 
client/app/admin/logs/page.tsx
📊 Admin Reporting & Analytics Module
Overview
Enterprise-grade reporting and analytics system with 9 specialized reports covering all aspects of business operations.

Key Features:

✅ Executive Dashboard - Real-time business metrics at-a-glance
✅ 9 Specialized Reports - Sales, Products, Inventory, Customers, Marketing, Financial, Returns, Reviews
✅ Advanced Visualizations - 15+ chart types using Recharts
✅ MongoDB Aggregations - Complex data analytics at database level
✅ Date Range Filters - Last 7/30/90 days, monthly views
✅ Quick Navigation - One-click access between reports -✅ Export Ready - Infrastructure for PDF/Excel export (future)
14. Executive Dashboard
Purpose: Complete business overview combining all key metrics in single view.

Implementation:

File: 
client/app/admin/reports/dashboard/page.tsx
Controller: 
server/controllers/reportingController.ts
 - 
getExecutiveDashboard
Route: GET /api/v1/admin/reports/dashboard
Metrics Displayed:

Revenue Metrics:

Total Revenue with trend indicator
New Customers count
Average Order Value (AOV)
Operational Metrics:

Total Orders count
Returns count
Reviews count with average rating
Charts:

Sales Trend (LineChart) - Daily revenue for date range
Category Performance (PieChart) - Revenue by product category
Top Products - 5 best-selling products with revenue
Quick Alerts:

Low stock products (< 5 units)
Pending return requests
Stuck orders (> 48 hours in Processing)
Quick Navigation Grid:

8 clickable cards linking to specialized reports
Sales Reports, Product Analytics, Inventory Health, Customer Insights, Marketing ROI, Financial Reports, Returns & Refunds, Reviews & Ratings
Backend Logic:

// MongoDB aggregation for dashboard metrics
const metrics = await Order.aggregate([
    {
        $facet: {
            revenue: [{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }],
            orders: [{ $count: "count" }],
            customers: [{ $group: { _id: "$user" } }, { $count: "count" }]
        }
    }
]);
15. Sales Analytics Report
Purpose: Comprehensive sales performance tracking and trend analysis.

Implementation:

File: 
client/app/admin/reports/sales/page.tsx
Controller: 
server/controllers/reportingController.ts
 - 
getSalesReport
Route: GET /api/v1/admin/reports/sales
Sections:

Overview Cards:

Total Revenue
Total Orders
Average Order Value
Tax Collected
Sales by Month (BarChart):

Monthly revenue aggregation
Order count per month
Trend comparison
Payment Method Breakdown (PieChart):

Razorpay vs COD split
Payment success rate
Top Selling Products (Table):

Product ranking by revenue
Quantity sold
Average price
Hourly Sales Heatmap:

7 days x 24 hours grid
Color-coded by revenue volume
Interactive tooltips
Geographic Distribution (Table):

Sales by state/city
Order concentration analysis
Sales Goals & Targets:

Monthly revenue goal tracking
Progress indicators
Achievement percentage
MongoDB Aggregation Example:

const salesData = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, isPaid: true } },
    {
        $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 }
        }
    },
    { $sort: { _id: 1 } }
]);
16. Product Performance Report
Purpose: Track product rankings, sales velocity, and inventory turnover.

Implementation:

File: 
client/app/admin/reports/products/page.tsx
Controller: 
server/controllers/productAnalyticsController.ts
 - 
getProductPerformance
Route: GET /api/v1/admin/reports/products
Metrics:

Product Ranking Table:

Sortable by Revenue, Orders, Rating
Columns: Product Name, Revenue, Orders Sold, Stock Level, Rating, Sales Trend
Trend indicators (↑ +20%, ↓ -5%)
Sales Velocity:

Units sold per day
Trending products identification
Stock Turnover:

Days to sell current stock
Restock recommendations
Aggregation Pipeline:

await Order.aggregate([
    { $unwind: "$orderItems" },
    {
        $group: {
            _id: "$orderItems.product",
            revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
            quantitySold: { $sum: "$orderItems.quantity" }
        }
    },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
    { $sort: { revenue: -1 } }
]);
17. Inventory Health Report
Purpose: Monitor stock levels, identify dead stock, and optimize inventory.

Implementation:

File: 
client/app/admin/reports/inventory/page.tsx
Controller: 
server/controllers/productAnalyticsController.ts
 - 
getInventoryAnalytics
Route: GET /api/v1/admin/reports/inventory
Sections:

Summary Cards:

Total Stock Value (₹)
Low Stock Items (< 20 units)
Dead Stock Items (no sales in 60 days)
Critical Low Stock Items:

Products below 20 units
Reorder recommendations
Size-wise breakdown
Dead Stock Candidates:

Products with no sales in 60 days
Inventory value locked
Clearance recommendations
Category-wise Stock Distribution (BarChart):

Stock count by category
Value distribution
Business Logic:

// Dead stock identification
const deadStock = await Product.find({
    _id: { $nin: recentlySold },  // Not sold in last 60 days
    totalStock: { $gt: 0 }
});
18. Customer Analytics Report
Purpose: Understand customer behavior, segments, and lifetime value.

Implementation:

File: 
client/app/admin/reports/customers/page.tsx
Controller: 
server/controllers/customerAnalyticsController.ts
 - 
getCustomerAnalytics
Route: GET /api/v1/admin/reports/customers
Metrics:

Overview:

Total Customers
New Customers (last 30 days)
Growth Rate
Churn Rate (90-day inactive)
Customer Segmentation (PieChart):

VIP: 3+ orders, high spend
Loyal: 2+ orders
Active: 1 order recently
Occasional: 1 order, older
Top High-Value Customers:

Name, email
Total spent (LTV)
Order count
RFM Analysis (Recency, Frequency, Monetary):

const segments = await Order.aggregate([
    {
        $group: {
            _id: "$user",
            orderCount: { $sum: 1 },
            totalSpent: { $sum: "$totalPrice" },
            lastOrder: { $max: "$createdAt" }
        }
    },
    {
        $addFields: {
            segment: {
                $cond: [
                    { $and: [{ $gte: ["$orderCount", 3] }, { $gte: ["$totalSpent", 10000] }] },
                    "VIP",
                    "Active"
                ]
            }
        }
    }
]);
19. Marketing Performance Report
Purpose: Measure campaign effectiveness, discount impact, ROI.

Implementation:

File: 
client/app/admin/reports/marketing/page.tsx
Controller: 
server/controllers/customerAnalyticsController.ts
 - 
getMarketingAnalytics
Route: GET /api/v1/admin/reports/marketing
Sections:

Discount Impact Analysis:

Total discounts given
Discounted orders count
Average discount percentage
Revenue with/without discounts
Acquisition Channels (BarChart - Mocked):

Organic, Paid Ads, Social Media, Referral
Orders by channel
Campaign ROI (Table - Mocked):

Campaign name
Ad spend
Revenue generated
ROI percentage
Note: Acquisition channel and campaign data are currently mocked as tracking fields don't exist in Order schema. Ready for integration with UTM tracking.

20. Financial Reports
Purpose: Profit & Loss statement,payment analysis, tax tracking.

Implementation:

File: 
client/app/admin/reports/financial/page.tsx
Controller: 
server/controllers/financialAnalyticsController.ts
 - 
getFinancialReport
Route: GET /api/v1/admin/reports/financial
Profit & Loss Statement:

Revenue                     ₹10,765
- Cost of Goods Sold (60%)  -₹4,306
= Gross Profit              ₹6,459
- Operating Expenses (30%)  -₹3,230
= Operating Profit          ₹3,229
- Tax Collected (GST)       -₹420
= Net Profit                ₹2,809
Payment Gateway Analysis (BarChart):

Razorpay vs COD breakdown
Payment success rates
Gateway-wise revenue
Implementation Notes:

COGS estimated at 60% of item price (no purchase price field)
Expenses estimated at 30% of revenue
Payment method identified by paymentInfo.id pattern
21. Returns & Refunds Report
Purpose: Track return patterns, reasons, and refund processing.

Implementation:

File: 
client/app/admin/reports/returns/page.tsx
Controller: 
server/controllers/financialAnalyticsController.ts
 - 
getReturnAnalytics
Route: GET /api/v1/admin/reports/returns
Sections:

Return Request Status (PieChart):

Requested, QC_Pending, QC_Passed, Refunded, QC_Failed
Top Return Reasons (BarChart):

Defective, Wrong Item, Size Issue, etc.
Count by reason
Summary Cards:

Total Returns
Return Rate (%)
Total Refunded Amount
22. Reviews & Ratings Report
Purpose: Customer sentiment analysis, rating distribution, product feedback.

Implementation:

File: 
client/app/admin/reports/reviews/page.tsx
Controller: 
server/controllers/financialAnalyticsController.ts
 - 
getReviewAnalytics
Route: GET /api/v1/admin/reports/reviews
Metrics:

Average Rating:

Overall score (4.0⭐ from 4 reviews)
Based on all reviews in date range
Rating Distribution (BarChart):

5-star, 4-star, 3-star, 2-star, 1-star counts
Percentage breakdown
Recent Feedback:

Latest 5 reviews
Product name, rating, comment, date
User name
Analytics Module - Technical Implementation
Data Flow:

Frontend → Date range selection
API Call → Axios GET with query params (?range=30days)
Backend Middleware → 
isAuthenticated
, 
authorizeRoles('admin')
Controller → MongoDB aggregation pipeline
Response → JSON with structured data
Frontend Rendering → Recharts visualization
Performance Features:

MongoDB Aggregations → Database-level calculations (fast, scalable)
Date-based indexing → Quick filteringby createdAt
Cached analytics (future) → Redis caching for computed reports
Pagination (future) → For large datasets
Routes Protected:

router.get('/dashboard', isAuthenticated, authorizeRoles('admin'), getExecutiveDashboard);
router.get('/sales', isAuthenticated, authorizeRoles('admin'), getSalesReport);
router.get('/products', isAuthenticated, authorizeRoles('admin'), getProductPerformance);
router.get('/inventory', isAuthenticated, authorizeRoles('admin'), getInventoryAnalytics);
router.get('/customers', isAuthenticated, authorizeRoles('admin'), getCustomerAnalytics);
router.get('/marketing', isAuthenticated, authorizeRoles('admin'), getMarketingAnalytics);
router.get('/financial', isAuthenticated, authorizeRoles('admin'), getFinancialReport);
router.get('/returns', isAuthenticated, authorizeRoles('admin'), getReturnAnalytics);
router.get('/reviews', isAuthenticated, authorizeRoles('admin'), getReviewAnalytics);
Chart Library - Recharts:

Line charts for trends
Bar charts for comparisons
Pie charts for distributions
Responsive containers
Custom tooltips with currency formatting
⚙️ Non-Functional Features
14. Performance Optimizations
Caching Layer:

Technology: Redis (ioredis)
File: 
server/utils/redis.ts
Cached Data:
Product listings
User sessions
API responses for analytics
Cache invalidation on data updates
Rate Limiting:

Middleware: 
server/middleware/rateLimiter.ts
Library: express-rate-limit + rate-limit-redis
Limits:
API Limiter: 100 requests per 15 minutes
Strict Limiter (auth/payment): 10 requests per 15 minutes
Prevents DDoS and brute-force attacks
Circuit Breaker Pattern:

File: 
server/utils/circuitBreaker.ts
Protects external services (Razorpay, Cloudinary, Email)
Prevents cascading failures
Test file: 
server/test_circuitbreaker.ts
Database Optimizations:

MongoDB indexes on frequently queried fields
Aggregation pipelines for analytics
Pagination for large datasets
15. Security Features
Authentication Security:

JWT with HttpOnly cookies (prevents XSS)
Token expiration and refresh
Passport.js strategies for OAuth and JWT
Authorization:

Middleware: 
server/middleware/auth.ts
 and 
checkPermission.ts
Route-level protection
Role-based and permission-based access control
Input Validation:

Request validation in controllers
Mongoose schema validation
XSS and SQL injection prevention
Payment Security:

Razorpay signature verification
Webhook signature validation
Secure environment variable management
CORS Configuration:

Whitelist frontend URL
Credentials support for cookies
File: 
server/server.ts
16. Scalability Features
Background Job Processing:

Queue System: BullMQ
Workers:
Email Worker (
server/workers/emailWorker.ts
)
Refund Worker (
server/workers/refundWorker.ts
)
Benefits:
Asynchronous processing
Retry mechanisms
Job prioritization
Real-Time Communication:

Socket.IO with rooms
User-specific and admin broadcast rooms
MongoDB Change Streams for order watching
File: 
server/utils/orderWatcher.ts
Docker Containerization:

File: 
docker-compose.yml
Services:
MongoDB container
Redis container
API server container
Frontend container
Worker container (for background jobs)
Horizontal Scaling Ready:

Stateless API design
Redis for shared session storage
Separate worker processes
17. Monitoring & Logging
Application Logging:

Library: Winston
File: 
server/utils/logger.ts
Log Levels: error, warn, info, debug
Log storage: server/logs/ directory
Request Logging:

Middleware: server/middleware/requestLogger.ts
Logs all API requests with timing
Health Checks:

Endpoint: /health
File: server/routes/healthRoutes.ts
Controller: server/controllers/healthController.ts
Checks:
MongoDB connection
Redis connection
System uptime
18. API Documentation
Swagger/OpenAPI:

Library: swagger-jsdoc + swagger-ui-express
File: server/utils/swagger.ts
Endpoint: /api-docs
Features:
Interactive API documentation
Request/response schemas
Authentication examples
🏗️ Technical Architecture
Backend Architecture
Technology Stack:

Runtime: Node.js with TypeScript
Framework: Express.js (v5.2.1)
Database: MongoDB with Mongoose ODM
Caching: Redis (ioredis)
Queue: BullMQ
Authentication: Passport.js (Google OAuth, JWT)
Payment: Razorpay SDK
Media: Cloudinary
Email: Nodemailer
Real-time: Socket.IO
Logging: Winston
Project Structure:

server/
├── config/          # Database, Passport configuration
├── controllers/     # Business logic (10 controllers)
├── middleware/      # Auth, permissions, rate limiting, logging
├── models/          # Mongoose schemas (8 models)
├── routes/          # API endpoints (10 route files)
├── utils/           # Helpers (Redis, Email, Cloudinary, Logger, etc.)
├── workers/         # Background workers (Email, Refund)
├── queues/          # BullMQ queue definitions
├── scripts/         # Utility scripts
├── server.ts        # Application entry point
└── Dockerfile       # Container configuration
API Versioning:

Base path: /api/v1
Allows future API versions without breaking changes
Frontend Architecture
Technology Stack:

Framework: Next.js 16 (App Router)
Language: TypeScript
Styling: Tailwind CSS 4
State Management: Redux Toolkit
HTTP Client: Axios
UI Components: Custom components with Lucide React icons
Animations: Framer Motion
Real-time: Socket.IO Client
Charts: Recharts
Authentication: Firebase (Phone OTP)
Date Handling: date-fns
Project Structure:

client/
├── app/                  # Next.js pages (App Router)
│   ├── (account)/        # User account pages (orders, profile)
│   ├── admin/            # Admin dashboard pages
│   ├── cart/             # Shopping cart
│   ├── product/          # Product details
│   ├── shipping/         # Checkout shipping
│   ├── order/            # Order confirmation
│   ├── login/            # Authentication
│   └── page.tsx          # Homepage
├── components/           # Reusable UI components
│   ├── admin/            # Admin-specific components
│   └── [other]/          # Shared components
├── redux/                # Redux store and slices
│   ├── slices/           # State slices (wishlist, cart, etc.)
│   └── store.ts          # Redux store configuration
├── hooks/                # Custom React hooks (usePermission)
├── lib/                  # Libraries (Firebase config)
├── utils/                # Helper functions
├── public/               # Static assets
└── Dockerfile            # Container configuration
State Management:

Redux Toolkit for global state
Slices:
Wishlist slice (redux/slices/wishlistSlice.ts)
User/auth slice (assumed)
Cart slice (assumed)
Routing:

Next.js App Router with file-based routing
Dynamic routes: /product/[id], /admin/orders/[id]
Route groups: (account) for user pages
🗄️ Database Models
Model Overview:
User Model (server/models/User.ts)

Fields: name, email, avatar, googleId, phone, role, permissions, assignedModules, wishlist
Supports: Google OAuth, phone auth, RBAC
Product Model (server/models/Product.ts)

Fields: title, description, price, category, images (multi-media), stock (size-wise), isActive, ratings, numOfReviews, createdBy
Supports: Multi-category, size inventory, media management
Order Model (server/models/Order.ts)

Fields: shippingInfo, orderItems, user, paymentInfo, prices (items/tax/shipping/total), orderStatus, courierName, trackingId, orderHistory, deliveredAt
Supports: Complete order lifecycle, status tracking, courier integration
Transaction Model (server/models/Transaction.ts)

Fields: razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, status, type (payment/refund), performedBy
Supports: Payment tracking, refund processing
Review Model (server/models/Review.ts)

Fields: user, product, rating, comment, verified, createdAt
Supports: Product reviews, rating system
ReturnRequest Model (server/models/ReturnRequest.ts)

Fields: order, user, reason, description, status, qcImages, refundAmount, refundStatus, approvedBy, rejectedBy
Supports: Return management, QC workflow, refund tracking
Notification Model (server/models/Notification.ts)

Fields: user, type, message, read, data
Supports: Real-time notifications, notification history
AuditLog Model (server/models/AuditLog.ts)

Fields: action, performedBy, targetUser, details, timestamp
Supports: Security auditing, compliance
🔌 API Architecture
API Endpoints:
Authentication Routes (/api/v1/auth):

POST /google - Google OAuth callback
GET /google - Initiate Google login
POST /logout - User logout
Product Routes (/api/v1/products):

GET / - Get all products (with filters)
GET /:id - Get single product
POST / - Create product (Admin only)
PUT /:id - Update product (Admin only)
DELETE /:id - Delete product (Admin only)
Order Routes (/api/v1/orders):

POST /new - Create new order
GET /me - Get user orders
GET /:id - Get order details
PATCH /:id/status - Update order status (Admin only)
Payment Routes (/api/v1/payment):

POST /create-order - Create Razorpay order
POST /verify - Verify payment
User Routes (/api/v1/user):

GET /profile - Get user profile
PUT /profile - Update profile
POST /wishlist/add - Add to wishlist
DELETE /wishlist/:id - Remove from wishlist
Admin Analytics Routes (/api/v1/admin/analytics):

GET /dashboard - Dashboard metrics
GET /sales-trends - Sales trend data
GET /top-products - Top-selling products
Admin Routes (/api/v1/admin):

GET /users - Get all users
PUT /users/:id/role - Update user role
PUT /users/:id/permissions - Update permissions
GET /audit-logs - Get audit logs
Return Routes (/api/v1/returns):

POST /request - Submit return request
GET /user - Get user returns
PATCH /:id/approve - Approve return (Admin)
PATCH /:id/reject - Reject return (Admin)
Notification Routes (/api/v1/notifications):

GET / - Get user notifications
PUT /:id/read - Mark as read
Health Route (/health):

GET / - System health check
🎨 Frontend Architecture
Key Pages:
Public Pages:

/ - Homepage with featured products
/product/[id] - Product detail page
/login - Authentication page
/verify-phone - Phone OTP verification
User Pages:

/cart - Shopping cart
/shipping - Shipping details
/order/confirm - Order confirmation
/order/success - Order success page
/(account)/orders - Order history
/(account)/profile - User profile
/(account)/wishlist - User wishlist
Admin Pages:

/admin/dashboard - Analytics dashboard
/admin/product - Product management
/admin/orders - Order fulfillment
/admin/users - User management
/admin/qc - Quality control (returns)
/admin/logs - Audit logs
Key Components:
Admin Components:

UserManagement/ModuleSelector.tsx - Role/permission assignment
analytics/SalesTrendChart.tsx - Charts for dashboard
Shared Components:

Authentication components
Product cards
Cart items
Order summary
Notification bell
🚀 DevOps & Deployment
Docker Setup:
Docker Compose Services:

MongoDB (database)
Redis (caching/queues)
API Server (Express backend)
Worker (background job processing)
Frontend (Next.js)
Deployment Files:

docker-compose.yml - Multi-container orchestration
server/Dockerfile - Backend container
client/Dockerfile - Frontend container
scripts/deploy.ps1 - Deployment automation script
Environment Variables:

Server: MongoDB URI, Redis URL, JWT secrets, Razorpay keys, Cloudinary config
Client: API URL, Firebase config
🔐 Security Features
Implemented Security Measures:

Authentication: JWT with HttpOnly cookies
Authorization: RBAC with granular permissions
Rate Limiting: Redis-backed rate limiters
Input Validation: Mongoose schema validation
CORS: Whitelisted origins
Payment Security: Razorpay signature verification
Circuit Breaker: Fault tolerance for external services
Audit Logging: Tracks all sensitive actions
Environment Variables: Secure credential management
HTTPS Ready: Production deployment ready
⚡ Performance Optimizations
Implemented Optimizations:

Redis Caching: For products, sessions, analytics
Database Indexing: On User email, Product category, Order user
Background Jobs: Async email and refund processing
CDN: Cloudinary for media delivery
Connection Pooling: MongoDB connection reuse
Pagination: For large datasets
Code Splitting: Next.js automatic code splitting
Image Optimization: Next.js Image component
Lazy Loading: Components and routes
Performance Tests:

server/test_caching.js - Redis caching test
server/test_concurrency.js - Concurrent request handling
server/test_ratelimit.js - Rate limiter test
📊 Project Workflow
User Journey:
Discovery: Browse products by category
Engagement: View product details, add to wishlist
Purchase: Add to cart, checkout with shipping details
Payment: Razorpay payment processing
Confirmation: Email invoice, order tracking
Fulfillment: Real-time status updates (Packing → Shipped → Delivered)
Support: Request returns if needed
Repeat: Save wishlist, view order history
Admin Journey:
Login: Role-based dashboard access
Monitoring: View analytics, sales trends, revenue
Inventory: Manage products, update stock
Fulfillment: Update order status, assign courier
Quality Control: Review return requests, approve/reject
User Management: Assign roles, manage permissions
Audit: Review system logs for compliance
🎓 Technologies Used
Backend:
Node.js + TypeScript
Express.js
MongoDB + Mongoose
Redis (ioredis)
BullMQ
Passport.js
Razorpay
Cloudinary
Nodemailer
Socket.IO
Winston (logging)
Swagger (API docs)
Frontend:
Next.js 16
TypeScript
React 19
Redux Toolkit
Tailwind CSS 4
Framer Motion
Axios
Socket.IO Client
Recharts
Firebase Authentication
Lucide React Icons
DevOps:
Docker
Docker Compose
Git
Testing:
Custom test scripts for caching, rate limiting, circuit breaker, concurrency
📈 Scalability & Future Enhancements
Current Scalability:
Stateless API design
Horizontal scaling with Redis session storage
Background job processing with BullMQ
Dockerized microservices architecture
Future Enhancements:
Payment: Multi-gateway support (Stripe, PayPal)
Shipping: Integration with courier APIs (Shiprocket, Delhivery)
Analytics: Advanced business intelligence dashboards
Inventory: Automated low-stock alerts, supplier integration
Customer Support: Live chat, chatbot integration
Mobile App: React Native mobile application
Loyalty Program: Points, rewards, referral system
AI/ML: Product recommendations, demand forecasting
Multi-Tenant: Support for multiple vendors/sellers
Internationalization: Multi-language, multi-currency support
🏆 Project Achievements
✅ Full-Stack E-Commerce Platform - End-to-end implementation
✅ Production-Ready - Docker, Redis, background workers
✅ Real-Time Features - Socket.IO, MongoDB Change Streams
✅ Payment Integration - Razorpay with webhook support
✅ Multi-Role RBAC - 5 roles with granular permissions
✅ Automated Workflows - Email automation, refund processing
✅ Advanced Admin Panel - Analytics, user management, QC
✅ Security Hardened - JWT, rate limiting, audit logging
✅ Performance Optimized - Caching, circuit breaker, pagination
✅ Well Documented - Swagger API docs, code comments

📞 Contact & Support
Project Repository: c:\c\ecombrand
Documentation: This file + Swagger API docs at /api-docs
Tech Stack: MERN + Next.js + TypeScript + Redis + Socket.IO

Built with ❤️ using modern web technologies
Enterprise-grade architecture | Production-ready | Scalable | Secure

