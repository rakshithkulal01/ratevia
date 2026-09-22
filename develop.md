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

# Phase 11 — Ratevia One-Time Purchase + Data Retention Migration

## Objective

Convert Ratevia from the current trial/subscription SaaS model into a **₹1,000 one-time purchase product for small businesses**.

Ratevia will no longer operate as a public self-signup SaaS.

The new model is:

```text
Public Website
      ↓
Landing Page
      ↓
Pricing / Get Ratevia
      ↓
Business owner contacts Ratevia
      ↓
₹1,000 one-time payment
      ↓
ADMIN manually provisions the business
      ↓
Business owner receives access
      ↓
Business Dashboard
      ↓
Unlimited QR scans / feedback / analytics
```

There is currently **NO payment gateway**.

Do not implement Stripe, Razorpay, Cashfree, PayPal, or any other payment integration.

The public website should instead provide contact information / CTA so interested business owners can contact the Ratevia team.

---

# 1. Critical Implementation Rules

## DO NOT break existing working functionality

The following existing functionality must continue working:

* Customer QR flow
* `/r/:businessSlug`
* Rating selection
* Positive/constructive topics
* Customer message
* Review generation
* Review editing
* Regeneration
* Copy Review
* Continue to Google
* Thank-you flow
* Feedback API
* Analytics
* Feedback dashboard
* QR management
* Business settings
* Admin dashboard
* Supabase authentication
* Existing database relationships
* Existing Prisma setup

Do not rewrite working functionality unnecessarily.

Before modifying anything, inspect the existing implementation and understand the current architecture.

---

# 2. File-Scope Protection

Only modify files that are genuinely required for this phase.

Do NOT:

* rewrite unrelated components
* change the existing review-generation algorithm
* change the QR design unnecessarily
* change Socket/real-time functionality unless required
* change authentication architecture unnecessarily
* introduce a new frontend framework
* introduce a new backend framework
* replace Prisma
* replace Supabase
* introduce unnecessary dependencies

If a change can be implemented without touching an unrelated file, leave that file untouched.

---

# 3. New Business Model

Ratevia is now:

> **₹1,000 one-time payment for small businesses.**

There is:

* No monthly subscription
* No annual subscription
* No free trial
* No trial countdown
* No trial expiration
* No usage limits
* No monthly feedback limits
* No QR scan limits
* No public business registration

The product should be presented as a **one-time purchase**, not a subscription.

Do NOT claim "lifetime" service unless the existing business/legal terms explicitly support that wording.

Use wording such as:

> ₹1,000 one-time

instead of:

> ₹X/month

or:

> Free trial

---

# 4. Public Website Changes

Audit the existing public pages.

Remove public-facing trial/subscription messaging such as:

* "20-day free trial"
* "Start Free Trial"
* "No credit card required"
* trial countdown messaging
* subscription plans
* recurring monthly pricing

Replace the pricing experience with:

```text
Ratevia

₹1,000
One-time payment

✓ QR feedback system
✓ Customer feedback collection
✓ Review assistance
✓ Google review redirection
✓ Business dashboard
✓ Analytics
✓ Feedback history
✓ QR management
✓ Unlimited usage

[Get Ratevia]
```

The CTA should lead to the contact process rather than a payment gateway.

For example:

```text
Interested in Ratevia?

Contact us to get started.

[Contact Us]
```

Use the project's existing contact details if they already exist.

Do NOT invent a phone number, email address, WhatsApp number, or payment details.

---

# 5. Remove Public Business Registration

Business owners must NOT be able to freely create Ratevia businesses.

There must be no public:

```text
Create Business
Register Business
Start Trial
Create Account
```

flow that automatically provisions a business.

Only the ADMIN can provision a business.

The normal public user journey should be:

```text
Visitor
  ↓
Landing Page
  ↓
Pricing
  ↓
Contact
  ↓
Manual purchase/onboarding
  ↓
Admin creates business
  ↓
Owner gets access
```

---

# 6. Business Provisioning

The ADMIN should be the source of truth for creating businesses.

Admin should be able to:

* create a business
* create/assign the business owner
* assign business information
* generate/set the business slug
* activate the business
* suspend the business
* view business information
* view usage/analytics
* manage owner access where supported by the existing auth architecture

Do not expose these capabilities publicly.

If the existing authentication uses Supabase, reuse the existing Supabase authentication system rather than implementing another authentication system.

If owner invitation/provisioning is already supported, reuse it.

If it is not currently supported, implement the smallest clean solution that allows ADMIN-only provisioning.

---

# 7. Business Status

The current TRIAL / ACTIVE / EXPIRED subscription model should no longer control normal product access.

Introduce or migrate toward a simple business lifecycle such as:

```text
ACTIVE
SUSPENDED
```

### ACTIVE

Business can use:

* QR
* customer feedback
* dashboard
* analytics
* feedback history
* settings
* all existing features

### SUSPENDED

Business cannot use protected business functionality.

The ADMIN can suspend/reactivate businesses.

Do not delete existing subscription/trial database fields immediately if doing so could break migrations or existing records.

First migrate the application logic away from trial/subscription enforcement.

After the application is verified, obsolete fields/models can be removed in a separate cleanup migration if appropriate.

---

# 8. Remove Trial-Based Access Checks

Audit backend middleware/routes/services for logic such as:

```text
trialExpiresAt
subscriptionStatus
TRIAL
EXPIRED
ACTIVE subscription
daysRemaining
```

Do not blindly delete these fields.

Determine where they are currently used.

Normal business functionality should no longer depend on:

```text
trial not expired
subscription active
trial days remaining
```

Instead, access should depend on the business being active/provisioned.

For example:

```text
business.status === ACTIVE
```

Admin routes may still need to display legacy subscription/trial information temporarily during migration.

---

# 9. Customer QR Flow Must Remain Working

Do not change the fundamental customer flow.

Customer:

```text
Scan QR
 ↓
Business landing page
 ↓
Select rating
 ↓
Select topics
 ↓
Optional message
 ↓
Generate review
 ↓
Edit/regenerate if required
 ↓
Copy review
 ↓
Continue to Google
 ↓
Thank you
```

Keep the current behavior where 1–3 star customers are NOT blocked from generating/copying/continuing to Google.

Do not introduce review gating.

---

# 10. New Raw Review Storage Policy

This is a critical requirement.

Ratevia should NOT permanently store every customer's raw review.

### Rating policy

```text
5★ → Do NOT store raw feedback
4★ → Do NOT store raw feedback
3★ → Store raw feedback temporarily
2★ → Store raw feedback temporarily
1★ → Store raw feedback temporarily
```

Therefore:

```text
4–5 star
    ↓
Aggregate analytics only

1–3 star
    ↓
Temporary raw feedback storage
    ↓
30 days maximum
    ↓
Automatic deletion
```

---

# 11. What Counts as Raw Feedback

For 1–3 star feedback, the temporary raw record may contain:

* rating
* selected topics
* customer message
* generated review
* timestamps
* required business/session references

For 4–5 star feedback, do NOT persist unnecessary raw customer content.

The system should still record the necessary aggregate analytics/events so the business can see:

```text
Total feedback
1★ count
2★ count
3★ count
4★ count
5★ count
Average rating
Topic counts
Google clicks
Review copies
QR scans
Conversion metrics
```

Do not sacrifice analytics accuracy.

---

# 12. Analytics Must Work for All Ratings

Even though raw feedback is only retained for 1–3 star ratings, analytics must include all ratings.

Example:

```text
Total Feedback: 152

5★: 83
4★: 42
3★: 15
2★: 8
1★: 4

Average Rating: 4.26
```

The 4–5 star raw text does not need to remain stored for this information to work.

Use aggregated counters/data for long-term analytics.

---

# 13. 30-Day Raw Feedback Cleanup

All raw 1–3 star feedback must be automatically deleted after approximately 30 days.

Do NOT rely on the admin manually deleting records.

Implement an automated cleanup mechanism.

Preferred architecture:

```text
Scheduled Cleanup
       ↓
Find raw feedback older than 30 days
       ↓
Delete raw feedback
```

The cleanup should run at least once per day.

This means if the server misses one scheduled run, the next run can still remove all records older than the retention period.

Use the project's existing scheduling/deployment architecture if one exists.

Do not introduce an unnecessarily complicated infrastructure system.

---

# 14. Preserve Historical Analytics

Before deleting raw feedback/events, ensure the required information has already been aggregated.

Create or use an aggregate analytics model/table if the existing architecture does not already provide sufficient long-term aggregation.

Recommended model:

```text
DailyBusinessAnalytics
```

Suggested fields:

```text
id
businessId
date

qrScans
feedbackStarted
reviewsGenerated
reviewsCopied
googleClicks

rating1
rating2
rating3
rating4
rating5
```

Also preserve topic-level aggregate information if required by the existing Analytics UI.

For example:

```text
positiveTopicCounts
improvementTopicCounts
```

The exact Prisma representation should follow the existing project's database conventions.

Do not introduce JSON fields if a normalized structure is clearly better for the existing analytics implementation.

---

# 15. Analytics Architecture

The long-term architecture should become:

```text
                    Ratevia
                       │
        ┌──────────────┴──────────────┐
        │                             │
   Operational Data              Analytics
        │                             │
 Business / Account             Daily Analytics
 QR Configuration               Aggregated Ratings
 Owner Access                   Aggregated Topics
        │
        │
 Temporary Customer Data
        │
   1–3 Star Feedback
        │
      30 Days
        │
     AUTO DELETE
```

The dashboard should preferably use aggregated analytics for long-term historical information rather than depending entirely on raw event/feedback records.

---

# 16. Data Retention

Implement this retention policy:

### Long-term

Keep:

* Business
* Account/owner
* QR configuration
* Business settings
* Business status
* Daily aggregated analytics
* Required operational configuration

### Maximum 30 days

Keep:

* 1–3 star raw feedback
* customer message
* generated review associated with that raw feedback
* other unnecessary raw customer content

### Do not permanently retain

For 4–5 star customers:

* raw customer message
* raw generated review
* unnecessary customer-level review content

Only retain what is necessary for aggregated analytics and operational events.

---

# 17. Privacy-by-Design

Do not collect/store customer information that Ratevia does not need.

Do not add:

* customer name
* customer email
* customer phone
* customer address
* customer account
* unnecessary personal identifiers

The customer flow should remain anonymous.

The existing anonymous session ID may continue to be used where necessary for analytics/session tracking, but it should not be turned into a permanent customer identity.

---

# 18. Frontend Design Requirement — IMPORTANT

The frontend must NOT use pill-shaped buttons.

Avoid:

```css
border-radius: 9999px;
```

or equivalent fully rounded/pill button styles.

Buttons should use a **square/rectangular design** with subtle corner radius.

Preferred style:

```css
border-radius: 4px;
```

or:

```css
border-radius: 6px;
```

depending on the existing design system.

Do NOT redesign the entire UI.

Maintain the existing visual identity while making buttons rectangular.

This applies to:

* primary buttons
* secondary buttons
* CTA buttons
* dashboard action buttons
* admin action buttons
* modal buttons
* form submit buttons
* pricing CTA buttons

Do not turn tags, badges, status indicators, or rating controls into buttons unnecessarily.

The requirement specifically applies to interactive buttons/CTAs.

---

# 19. Public Navbar

Audit the navbar.

The public navigation should focus on:

```text
Home
How It Works
Pricing
FAQ
Contact
```

Remove public navigation items related to:

```text
Start Trial
Create Business
Register
Subscription
```

The existing Login entry can remain if it is used by provisioned business owners.

Do not expose business-owner dashboard links publicly unless the existing authentication flow requires them.

---

# 20. Pricing Page

Replace subscription pricing with the new offer.

Suggested content:

```text
Simple Pricing

₹1,000
One-time payment

Everything a small business needs to collect customer
feedback and improve its Google review flow.

✓ QR feedback system
✓ Customer feedback
✓ Review assistance
✓ Google review redirection
✓ Business dashboard
✓ Analytics
✓ Feedback history
✓ QR management
✓ Unlimited usage

No monthly subscription.

Interested?

Contact us to get Ratevia.
```

Do not add a fake payment checkout.

Do not claim payment was completed through the website.

---

# 21. Dashboard

The existing business dashboard should continue to provide:

* Overview
* Analytics
* Feedback
* QR Code
* Settings

Remove UI elements related to:

* trial countdown
* trial expiration
* subscription upgrade
* subscription renewal
* monthly plan
* payment status

Replace them with a simple business status indicator where appropriate:

```text
Account Status: Active
```

Do not display irrelevant subscription information to the business owner.

---

# 22. Admin Dashboard

The admin dashboard becomes even more important because it is now the provisioning system.

Admin should be able to see:

```text
Businesses
Active Businesses
Suspended Businesses
Total Feedback
```

and manage:

```text
Create Business
Activate
Suspend
Owner Access
Business Details
Analytics
```

Remove or de-emphasize:

```text
Extend Trial
Expire Trial
Reactivate Trial
Trial Days Remaining
```

Replace these actions with the new business lifecycle where appropriate.

Do not remove existing admin functionality until equivalent functionality has been implemented and verified.

---

# 23. Database Migration Safety

Before changing Prisma schema:

1. Inspect current schema.
2. Identify all subscription/trial fields.
3. Identify all routes/services/components using them.
4. Identify all foreign-key relationships.
5. Determine which fields can be deprecated.
6. Implement migration safely.
7. Run Prisma validation.
8. Run Prisma generation.
9. Test backend startup.
10. Test existing APIs.

Do not simply delete columns that are still referenced.

---

# 24. API Compatibility

Preserve existing API contracts wherever possible.

Do not rename existing endpoints without a strong reason.

Do not modify request/response formats unnecessarily.

If an endpoint needs to change because trial/subscription logic is removed, update all frontend consumers accordingly.

Search the entire project for every usage before changing an API.

---

# 25. Testing Requirements

After implementation, test the complete flow.

## Public

Test:

* Home page
* Pricing page
* FAQ
* Contact CTA
* No trial messaging
* No public business registration
* No fake payment gateway
* No subscription pricing

## Admin

Test:

* Admin login
* Create business
* Assign owner
* Activate business
* Suspend business
* Reactivate business
* View business
* View analytics

## Business Owner

Test:

* Login
* Dashboard access
* Overview
* Analytics
* Feedback
* QR
* Settings

## Customer

Test:

* Scan/open QR
* Select 5★
* Select 4★
* Select 3★
* Select 2★
* Select 1★
* Generate review
* Edit review
* Copy review
* Continue to Google
* Thank-you page

Verify that 1–3 star customers are NOT blocked from the Google flow.

---

# 26. Data Retention Testing

Explicitly test:

### 5-star

Create a 5-star feedback.

Verify:

```text
Analytics updated
Rating count updated
No unnecessary raw customer review persisted
```

### 4-star

Same verification.

### 3-star

Create 3-star feedback.

Verify:

```text
Raw feedback exists
Dashboard can display it
Analytics updated
```

### 2-star

Same.

### 1-star

Same.

### Cleanup

Create a test raw feedback record with a timestamp older than 30 days.

Run the cleanup process.

Verify:

```text
Raw feedback deleted
Aggregated analytics still exist
Dashboard historical analytics still work
```

Also test a record newer than 30 days and verify that it is NOT deleted.

---

# 27. Analytics Accuracy Test

After creating test feedback:

```text
5★ × 2
4★ × 3
3★ × 2
2★ × 1
1★ × 1
```

Verify that the analytics correctly show:

```text
5★ = 2
4★ = 3
3★ = 2
2★ = 1
1★ = 1
Total = 9
```

Verify the average rating calculation.

Verify Google clicks and review-copy events.

Verify QR scan counts.

Verify the dashboard remains functional after raw 1–3 star records are cleaned.

---

# 28. Frontend Build Verification

Run the existing frontend build command.

Requirements:

```text
0 build errors
0 import errors
0 unresolved modules
```

Check the entire UI for accidental pill-shaped buttons.

Search for:

```text
rounded-full
border-radius: 9999px
rounded-[9999px]
```

and equivalent styles.

Replace button-specific pill styles with subtle rectangular corner radii.

Do not unnecessarily change non-button UI elements.

---

# 29. Backend Verification

Verify:

```text
/api/health
```

returns successfully.

Run:

* Prisma validation
* Prisma generation
* backend startup
* relevant API tests

Verify there are no startup errors caused by the migration.

---

# 30. Final Architecture

The final Ratevia architecture should conceptually be:

```text
                    PUBLIC WEBSITE
                         │
              ┌──────────┴──────────┐
              │                     │
           Pricing                Contact
              │                     │
              └──────────┬──────────┘
                         │
                   Manual Purchase
                         │
                       ADMIN
                         │
                  Create Business
                         │
                    Create Owner
                         │
                    ACTIVE STATUS
                         │
              ┌──────────┴──────────┐
              │                     │
          BUSINESS OWNER         CUSTOMER
              │                     │
          Dashboard               QR
              │                     │
       ┌──────┼──────┐             │
       │      │      │             │
   Overview Analytics Feedback      │
                                Feedback
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                       4–5★                  1–3★
                         │                     │
                  Aggregate only          Raw feedback
                                               │
                                            30 days
                                               │
                                          AUTO DELETE
```

---

# 31. Success Criteria

Phase 11 is complete only when:

* Ratevia no longer presents itself as a subscription SaaS.
* Public trial messaging is removed.
* Public business registration is removed.
* Pricing is ₹1,000 one-time.
* No payment gateway is implemented.
* Interested businesses contact the Ratevia team.
* Only ADMIN can provision businesses.
* Provisioned businesses can access all existing features.
* There are no usage limits.
* Trial expiration no longer blocks normal business usage.
* ADMIN can activate/suspend businesses.
* 4–5 star raw review content is not permanently stored.
* 1–3 star raw feedback is retained for a maximum of 30 days.
* Automated cleanup removes expired raw feedback.
* Aggregated analytics survive raw-data deletion.
* Historical analytics remain usable.
* Customer QR flow remains intact.
* 1–3 star customers are not blocked from Google.
* Existing dashboard functionality remains intact.
* No unnecessary personal customer information is stored.
* Frontend buttons are rectangular/subtly rounded, NOT pill-shaped.
* Frontend build succeeds.
* Backend starts successfully.
* Prisma migration/validation succeeds.
* No unrelated functionality is broken.

## Final instruction

Before making changes, **audit the existing Ratevia codebase and produce a concise implementation plan based on the actual files and architecture**.

Then implement the changes with minimal scope.

Do not invent files, routes, models, or existing functionality.

Prefer modifying existing architecture over creating parallel systems.

After implementation, report:

1. Files changed
2. Database changes
3. Backend changes
4. Frontend changes
5. Data-retention implementation
6. Admin provisioning implementation
7. Tests performed
8. Build/test results
9. Any remaining issues
