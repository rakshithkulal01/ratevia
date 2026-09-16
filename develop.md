# Build the Complete SaaS Application — Master Development Prompt

You are working on a SaaS product for local businesses such as cafés, restaurants, and hotels.

The product helps businesses collect genuine customer feedback, make it easier for customers to write Google reviews based on their actual experience, and provides businesses with analytics and feedback insights.

The application should be built as a production-quality MVP suitable for demonstrating to real local businesses.

---

# 1. FIRST: READ THE PROJECT DOCUMENTATION

Before writing or modifying any code:

1. Inspect the entire existing project directory.
2. Read ALL `.md` files available in the project directory.
3. Treat the project documentation as the source of truth for:

   * Product requirements
   * Tech stack
   * Architecture
   * Existing decisions
   * UI requirements
   * Authentication
   * Database structure
   * Business logic
4. Inspect the existing source code and package files.
5. Determine what has already been implemented.
6. Do NOT recreate existing functionality unnecessarily.
7. Do NOT replace the existing project structure unless absolutely necessary.
8. Preserve working functionality.

If documentation and existing code conflict:

* Prefer the most recent explicit product requirement.
* Explain the conflict before making a destructive architectural change.
* Make the smallest safe change.

---

# 2. IMPORTANT DEVELOPMENT RULE

DO NOT attempt to build the entire application in one step.

Build the project in phases.

After completing each phase:

1. Run the appropriate build/lint/type checks.
2. Run the application.
3. Test the implemented functionality.
4. Fix errors.
5. Verify that previously working functionality still works.
6. Summarize exactly what was changed.
7. Stop and wait for the next phase instruction.

Do not automatically continue to the next major phase.

---

# 3. PRODUCT GOAL

The product has three major experiences:

## A. Marketing Website

Public-facing website for attracting business owners.

Routes:

/
/pricing
/faq
/login
/signup

The homepage should communicate:

* Customer feedback
* Review assistance
* QR-based customer experience
* Business analytics
* Reputation management
* Customer insights

The design must feel:

* Premium
* Modern
* Trustworthy
* Professional
* Minimal
* SaaS-quality
* Suitable for real business owners

Avoid generic template-like designs.

---

# 4. BUSINESS OWNER EXPERIENCE

After authentication:

LOGIN / SIGNUP
↓
BUSINESS ONBOARDING
↓
BUSINESS DETAILS
↓
GOOGLE REVIEW LINK
↓
GENERATE QR
↓
BUSINESS DASHBOARD

The business owner should be able to:

* Create a business profile
* Select business type
* Add Google review link
* Generate a QR code
* View QR code
* Download QR code
* View customer feedback
* View analytics
* View trial status
* Manage business information

Initial business types:

* CAFE
* RESTAURANT
* HOTEL

Do not add unnecessary business types yet.

---

# 5. CUSTOMER QR EXPERIENCE

The QR code must point to our own application.

Example:

/r/:businessSlug

DO NOT make the QR code directly point to Google.

This allows the application to track customer interactions and collect genuine feedback.

Customer flow:

SCAN QR
↓
BUSINESS EXPERIENCE PAGE
↓
"How was your experience?"
↓
SELECT 1–5 STARS
↓
SELECT WHAT THEY LIKED / WHAT COULD BE IMPROVED
↓
OPTIONAL WRITTEN FEEDBACK
↓
REVIEW ASSISTANCE
↓
CUSTOMER CAN EDIT REVIEW
↓
COPY REVIEW
↓
CONTINUE TO GOOGLE
↓
GOOGLE REVIEW PAGE

The customer must remain in control of the final review.

Do not automatically submit a Google review.

Do not request Google credentials.

Do not claim that a Google review was posted unless there is an actual reliable mechanism to verify it.

Track:

* QR scan
* Feedback started
* Rating selected
* Review assistance generated
* Review copied
* Google review link clicked

Do NOT call "Google review link clicked" a confirmed review.

---

# 6. NEGATIVE FEEDBACK EXPERIENCE

Do not hide or suppress negative feedback.

If the customer selects 1–3 stars:

Show a helpful experience such as:

"We're sorry your experience wasn't what you expected."

Ask what went wrong.

Possible categories:

* Food
* Service
* Waiting time
* Staff
* Cleanliness
* Pricing
* Order issue
* Other

Allow optional written feedback.

The customer can still choose to continue to Google.

The product must remain focused on genuine customer feedback rather than rating manipulation.

---

# 7. AUTHENTICATION

Use:

Supabase Auth

Primary authentication:

Google OAuth

Also support:

* Email/password
* Password reset

The frontend should use the Supabase client.

Never expose:

* Supabase service role key
* Supabase secret keys
* Database credentials
* Other backend secrets

Frontend environment variables should use the VITE_ prefix.

Backend secrets must remain server-side.

Authentication should include:

* Persistent sessions
* Auth state handling
* Protected routes
* Login
* Signup
* Logout
* Password reset
* Google OAuth callback handling
* Proper loading states
* Proper error states

---

# 8. TECHNOLOGY STACK

Use the documented stack.

Frontend:

* React
* Vite
* React Router
* Tailwind CSS
* shadcn/ui
* Lucide React
* Framer Motion
* Recharts
* qrcode.react

Backend:

* Node.js
* Express.js
* ES Modules
* Zod

Database:

* PostgreSQL
* Supabase

ORM:

* Prisma

Authentication:

* Supabase Auth
* Google OAuth

Deployment target:

* Vercel frontend
* Render backend
* Supabase database/auth

Do not introduce additional infrastructure unless there is a clear requirement.

Avoid:

* Microservices
* Redis
* Docker unless required
* Separate analytics database
* Firebase
* AWS
* Google Maps API
* unnecessary third-party services

Keep the MVP simple and maintainable.

---

# 9. DATABASE

Use Prisma with Supabase PostgreSQL.

Initial core models:

## User

Fields:

* id
* supabaseUserId
* name
* email
* role
* createdAt

Roles:

BUSINESS_OWNER
ADMIN

## Business

Fields:

* id
* ownerId
* name
* businessType
* googleReviewUrl
* slug
* isActive
* createdAt
* updatedAt

Business types:

CAFE
RESTAURANT
HOTEL

## Subscription

Fields:

* id
* businessId
* status
* trialStartsAt
* trialEndsAt
* subscriptionStartsAt
* subscriptionEndsAt
* createdAt
* updatedAt

Statuses:

TRIAL
ACTIVE
EXPIRED

## QRCode

Fields:

* id
* businessId
* active
* createdAt

## Feedback

Fields:

* id
* businessId
* rating
* selectedTopics
* customerMessage
* generatedReview
* reviewCopiedAt
* googleLinkClickedAt
* createdAt

## AnalyticsEvent

Fields:

* id
* businessId
* eventType
* sessionId
* metadata
* createdAt

Events:

QR_SCANNED
FEEDBACK_STARTED
RATING_SELECTED
REVIEW_GENERATED
REVIEW_COPIED
GOOGLE_LINK_CLICKED

Use appropriate PostgreSQL/Prisma types.

Do not duplicate analytics information unnecessarily if it can be derived from existing records.

---

# 10. TRIAL SYSTEM

There is NO payment integration in the current demo version.

The product is being demonstrated to real businesses.

For now, support manually managed trial access.

When onboarding is completed:

* Create a trial record.
* Store trial start date.
* Store trial end date.
* Activate the business.

For demo purposes, trial duration can be configurable by the admin.

Possible values:

* 7 days
* 14 days
* 30 days

The eventual commercial version will use:

20-day free trial
+
monthly subscription
+
30-day billing periods

Do not implement payment processing yet.

---

# 11. TRIAL EXPIRATION

The backend must enforce trial expiration.

Do NOT rely only on frontend checks.

When:

current date > trialEndsAt

the business should become unavailable.

The system should:

* Prevent protected business functionality.
* Deactivate the QR experience.
* Show an appropriate expired/trial-ended screen.
* Preserve all historical data.

NEVER delete the business's:

* feedback
* analytics
* QR configuration
* account
* historical data

When the admin extends or reactivates the trial, access should become available again.

---

# 12. ADMIN EXPERIENCE

Admin route:

/admin

Admin must have role-based authorization.

Admin dashboard should show:

* Total businesses
* Trial businesses
* Active businesses
* Expired businesses
* Days remaining
* Trial end date
* Subscription end date
* QR activity
* Feedback activity

Admin should be able to:

* View businesses
* View business details
* View owner details
* View trial status
* Extend trial
* Give 7 days
* Give 14 days
* Give 30 days
* Expire access
* Reactivate demo access

Do not expose admin functionality to normal business owners.

---

# 13. BUSINESS DASHBOARD

Main route:

/dashboard

Dashboard should include:

## Overview cards

* QR scans
* Feedback submissions
* Google review-link clicks
* Average feedback rating

## Analytics

Show:

* Rating distribution
* Feedback activity over time
* Most liked topics
* Common improvement areas

Use Recharts.

The dashboard should feel like a professional SaaS analytics product.

Do not overload the dashboard with unnecessary charts.

---

# 14. FEEDBACK HISTORY

Route:

/dashboard/feedback

Show historical customer feedback.

Each entry can contain:

* Date
* Rating
* Selected topics
* Customer feedback
* Generated review assistance
* Google link clicked status

Do not display unnecessary customer personal information.

Avoid collecting customer identity unless there is a clear product requirement.

---

# 15. QR MANAGEMENT

Route:

/dashboard/qr

Business owner should be able to:

* View generated QR
* See business name
* Preview customer URL
* Download QR
* Regenerate QR if necessary
* See whether QR is active

QR destination:

/r/:businessSlug

QR must respect trial/access status.

Expired businesses must not have an active customer experience.

---

# 16. BUSINESS SETTINGS

Route:

/dashboard/business

Allow business owners to manage:

* Business name
* Business type
* Google review URL
* Business slug where appropriate

Validate all inputs.

Do not allow users to modify ownership or role information.

---

# 17. MARKETING WEBSITE

Create a premium marketing experience.

Homepage sections:

## Hero

Headline:

"Turn customer experiences into better reviews."

Supporting copy:

"Make it easier for customers to share genuine feedback while giving your business valuable insights to improve."

CTA:

"Get Started"

Secondary CTA can be:

"See How It Works"

## Product preview

Show an interactive visual flow:

SCAN QR
→ RATE
→ SHARE EXPERIENCE
→ REVIEW ASSISTANCE
→ GOOGLE

This should look like a real product UI rather than a stock illustration.

## Features

Show:

* Review Assistance
* Customer Feedback
* Business Analytics
* Customer Insights

Avoid promising guaranteed rating increases.

Use language around:

"making it easier for satisfied customers to share genuine experiences."

## How it works

1. Customers scan
2. Customers rate
3. Customers share their experience
4. Customers customize their review
5. Customers continue to Google

## Testimonials

Do NOT fabricate customer testimonials.

Until real customers provide testimonials, use a trust/value section without pretending the statements are real customer quotes.

## Pricing

For the demo version:

Explain the trial/demo concept without implementing payments.

Do not build a payment checkout.

## FAQ

Answer common questions around:

* How the QR works
* How customer feedback works
* Google review flow
* Data privacy
* Trial
* Business types

---

# 18. UI / UX REQUIREMENTS

reffer fdesign.md and use the same template but alter it according to the design system.

# 19. RESPONSIVE DESIGN

Every page must work on:

* Desktop
* Laptop
* Tablet
* Mobile

Do not build desktop-only interfaces.

Customer QR pages especially need to be optimized for mobile because customers will access them from their phones.

---

# 20. API DESIGN

Backend routes should be organized cleanly.

Suggested routes:

Authentication:

* Supabase handles authentication

Business:

* POST /api/business
* GET /api/business
* PATCH /api/business

QR:

* POST /api/qr/generate
* GET /api/qr

Feedback:

* POST /api/feedback
* GET /api/feedback

Analytics:

* POST /api/events
* GET /api/analytics

Admin:

* GET /api/admin/customers
* GET /api/admin/businesses
* PATCH /api/admin/trials
* POST /api/admin/reactivate

These are starting points, not rigid requirements.

Reuse existing documented routes if they already exist.

Do not create duplicate routes.

---

# 21. BACKEND ARCHITECTURE

Keep the backend modular.

Suggested structure:

backend/
src/
config/
middleware/
modules/
auth/
business/
feedback/
analytics/
qr/
subscription/
admin/
routes/
utils/
app.js
server.js

Use:

* Controllers/services where appropriate
* Zod validation
* Centralized error handling
* Authentication middleware
* Admin middleware
* Trial/subscription middleware

Do not put all backend logic into one large file.

---

# 22. SECURITY

Follow secure development practices.

Never:

* Commit `.env`
* Expose service-role credentials
* Expose database passwords
* Trust role information directly from the frontend
* Allow normal users to access admin APIs
* Accept arbitrary business IDs without authorization checks

Always verify:

* Authenticated user
* Business ownership
* Admin role
* Trial/access status

Validate request bodies with Zod.

Use proper HTTP status codes.

---

# 23. ENVIRONMENT VARIABLES

Frontend:

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_URL

Backend:

PORT
FRONTEND_URL
DATABASE_URL
DIRECT_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

Do not hardcode credentials.

Do not generate fake credentials.

If a required environment variable is missing, provide a clear error message.

---

# 24. GOOGLE REVIEW INTEGRATION

Version 1 does NOT use Google Business Profile API.

The business owner provides their Google review URL.

Customer clicks:

"Continue to Google"

The application opens the supplied Google review URL.

The customer then manually pastes their review and submits it themselves.

Future versions may integrate Google Business Profile APIs for business-side reputation management.

Do not implement that API now.

---

# 25. PAYMENT

DO NOT IMPLEMENT PAYMENT PROCESSING YET.

No:

* Razorpay checkout
* Stripe checkout
* Subscription payment API
* Webhooks for payment

The application should be architected so payment can be added later without rewriting the subscription model.

---

# 26. CODE QUALITY

Write maintainable code.

Requirements:

* Meaningful component names
* Meaningful variable names
* No unnecessary duplication
* Small reusable components
* Clear separation of concerns
* No giant components where avoidable
* No dead code
* No unnecessary dependencies
* No console spam
* Proper error handling

Do not blindly rewrite working files.

Before modifying a file:

1. Read it.
2. Understand its role.
3. Make the smallest appropriate change.

---

# 27. FILE-SCOPE PROTECTION

This is extremely important.

When fixing or implementing a specific feature:

ONLY modify files necessary for that feature.

Example:

If fixing Google authentication:

Do not modify:

* Analytics
* QR generation
* Admin dashboard
* Feedback system
* Database models unrelated to auth

If modifying the dashboard:

Do not rewrite authentication.

If modifying QR generation:

Do not modify unrelated business settings.

Avoid broad refactoring unless explicitly requested.

---

# 28. ERROR / LOADING / EMPTY STATES

Every important asynchronous operation should have:

Loading state
Success state
Error state
Empty state where appropriate

Examples:

Login:

* Loading button
* Authentication error

Business onboarding:

* Saving state
* Validation errors
* API error

Dashboard:

* Loading skeleton
* Empty analytics state
* API error

QR:

* Generating state
* Download state
* Error state

Customer feedback:

* Submission state
* Success state
* Error state

---

# 29. DEVELOPMENT PHASES

Implement the project in this exact order.

## PHASE 1 — PROJECT AUDIT

* Inspect existing project
* Read all documentation
* Inspect package files
* Inspect current source
* Identify completed/incomplete functionality
* Confirm architecture
* Do not make unnecessary changes

STOP AFTER AUDIT.

---

## PHASE 2 — FOUNDATION

* Ensure frontend starts
* Ensure backend starts
* Configure environment handling
* Configure Supabase client
* Configure backend Supabase client
* Configure Prisma
* Configure routing
* Configure global UI structure
* Establish reusable UI components

Test everything.

STOP.

---

## PHASE 3 — AUTHENTICATION

Build:

* Login
* Signup
* Google OAuth
* Email/password
* Password reset
* Logout
* Session persistence
* Protected routes
* Auth state handling

Test Google login end-to-end.

STOP.

---

## PHASE 4 — BUSINESS ONBOARDING

Build:

* Business setup page
* Business name
* Business type
* Google review URL
* Validation
* Business creation
* Trial creation
* Redirect to dashboard

STOP.

---

## PHASE 5 — QR SYSTEM

Build:

* QR generation
* QR preview
* QR download
* Public customer route
* Business slug
* QR activation/deactivation

STOP.

---

## PHASE 6 — CUSTOMER EXPERIENCE

Build:

* Customer business page
* Rating selection
* Positive feedback flow
* Negative feedback flow
* Topic selection
* Written feedback
* Review assistance
* Editable review
* Copy review
* Continue to Google
* Event tracking

STOP.

---

## PHASE 7 — BUSINESS DASHBOARD

Build:

* Overview
* Analytics cards
* Rating distribution
* Feedback trends
* Topics
* Improvement areas
* Feedback history
* QR management
* Business settings

STOP.

---

## PHASE 8 — ADMIN

Build:

* Admin authentication/authorization
* Admin dashboard
* Customer/business list
* Trial status
* Days remaining
* Expired accounts
* Trial extension
* Demo access management

STOP.

---

## PHASE 9 — TRIAL ENFORCEMENT

Build:

* Trial middleware
* Expiration logic
* QR deactivation
* Dashboard access restrictions
* Expired screen
* Admin reactivation

Test date edge cases carefully.

STOP.

---

## PHASE 10 — POLISH

Perform:

* Responsive design audit
* Accessibility audit
* Loading-state audit
* Error-state audit
* Navigation audit
* Authentication audit
* Authorization audit
* Security audit
* Performance cleanup
* UI consistency pass

Do not redesign working features unnecessarily.

STOP.

---

# 30. FINAL ACCEPTANCE CRITERIA

The MVP is complete when this entire flow works:

BUSINESS OWNER:

Homepage
↓
Get Started
↓
Google Login
↓
Business Onboarding
↓
Enter Business Name
↓
Select Café / Restaurant / Hotel
↓
Enter Google Review Link
↓
Create Business
↓
Trial Starts
↓
QR Generated
↓
Dashboard
↓
Analytics / Feedback / QR

CUSTOMER:

Scan QR
↓
Business Page
↓
Select Rating
↓
Select Topics
↓
Write Optional Feedback
↓
Review Assistance
↓
Edit Review
↓
Copy Review
↓
Continue to Google
↓
Google Review Page

ADMIN:

Admin Login
↓
Admin Dashboard
↓
View Businesses
↓
See Trial / Active / Expired
↓
See Days Remaining
↓
Extend Trial
↓
Reactivate / Expire Demo Access

---

# 31. MOST IMPORTANT INSTRUCTION

Do not rush.

Do not generate a huge amount of code without verifying it.

Do not assume files exist.

Do not invent APIs.

Do not invent database fields that conflict with the documentation.

Do not introduce unnecessary dependencies.

Do not implement payment or Google Business Profile API.

Do not fabricate customer testimonials or business statistics.

Do not manipulate customer ratings.

Always inspect the existing project before changing it.

Build one phase at a time.

After every phase, test the application and report:

1. What was implemented
2. Files created
3. Files modified
4. Dependencies added
5. Tests performed
6. Any remaining issues

Then STOP and wait for the next instruction.
