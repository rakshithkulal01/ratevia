# Product Tech Stack

## Project Overview

A SaaS platform for local businesses such as cafés, restaurants, and
hotels that helps businesses collect genuine customer feedback, make it
easier for customers to write Google reviews based on their actual
experience, and understand customer feedback through analytics.

The initial version is focused on customer demos and trial users.
Payment integration will be added later.

------------------------------------------------------------------------

## Frontend

### Core

-   React
-   Vite
-   React Router

### UI / Design

-   Tailwind CSS
-   shadcn/ui
-   Lucide React
-   Framer Motion

### Data Visualization

-   Recharts

### QR Code

-   qrcode.react

### Frontend Responsibilities

-   Marketing/landing page
-   Login and signup
-   Business onboarding
-   Business dashboard
-   Analytics dashboard
-   QR management
-   Customer feedback/review experience
-   Admin dashboard
-   Responsive UI
-   Animations and micro-interactions

------------------------------------------------------------------------

## Backend

### Core

-   Node.js
-   Express.js
-   ES Modules

### Validation / Security

-   Zod
-   Supabase authentication token verification
-   Authentication middleware
-   Admin role middleware
-   Trial/subscription middleware
-   Centralized error handling

### Backend Responsibilities

-   Authentication and authorization
-   Business management
-   Business onboarding
-   QR destination management
-   Customer feedback collection
-   Review assistance workflow
-   Analytics event tracking
-   Dashboard data
-   Trial management
-   Admin functionality
-   Subscription status enforcement

------------------------------------------------------------------------

## Database

### Database

-   PostgreSQL
-   Supabase

### ORM

-   Prisma

### Initial Database Models

#### User

-   id
-   supabaseUserId
-   name
-   email
-   role
-   createdAt

#### Business

-   id
-   ownerId
-   name
-   businessType
-   googleReviewUrl
-   slug
-   isActive
-   createdAt
-   updatedAt

#### Subscription

-   id
-   businessId
-   status
-   trialStartsAt
-   trialEndsAt
-   subscriptionStartsAt
-   subscriptionEndsAt
-   createdAt
-   updatedAt

#### QRCode

-   id
-   businessId
-   active
-   createdAt

#### Feedback

-   id
-   businessId
-   rating
-   selectedTopics
-   customerMessage
-   generatedReview
-   reviewCopiedAt
-   googleLinkClickedAt
-   createdAt

#### AnalyticsEvent

-   id
-   businessId
-   eventType
-   sessionId
-   metadata
-   createdAt

### Business Types

-   CAFE
-   RESTAURANT
-   HOTEL

### User Roles

-   BUSINESS_OWNER
-   ADMIN

### Trial / Subscription Status

-   TRIAL
-   ACTIVE
-   EXPIRED

------------------------------------------------------------------------

## Authentication

### Supabase Auth

Authentication will be handled by Supabase Auth.

Primary authentication method: - Google OAuth

Additional authentication: - Email/password - Password reset

The application will not store user passwords directly.

------------------------------------------------------------------------

## QR Code System

QR codes will point to the application's customer-facing route rather
than directly to Google.

Example:

`https://yourdomain.com/r/business-slug`

Customer flow:

1.  Customer scans QR
2.  Customer lands on the business page
3.  Customer selects a rating
4.  Customer selects what they liked or what could be improved
5.  Customer optionally provides written feedback
6.  Application provides review-writing assistance based on the
    customer's actual input
7.  Customer can edit the suggested review
8.  Customer copies the review
9.  Customer clicks "Continue to Google"
10. Google review page opens
11. Customer pastes and submits the review themselves

The application will track Google review-link clicks, but it will not
claim that a Google review was successfully posted.

------------------------------------------------------------------------

## Analytics

### Visualization

-   Recharts

### Tracked Events

-   QR_SCANNED
-   FEEDBACK_STARTED
-   RATING_SELECTED
-   REVIEW_GENERATED
-   REVIEW_COPIED
-   GOOGLE_LINK_CLICKED

### Dashboard Metrics

-   QR scans
-   Feedback submissions
-   Google review-link clicks
-   Average feedback rating
-   Rating distribution
-   Most liked topics
-   Common improvement areas
-   Feedback activity over time

------------------------------------------------------------------------

## Trial System

Payment integration is intentionally excluded from the initial demo
version.

For demo customers:

1.  Business completes onboarding
2.  Trial record is created
3.  Trial start date is stored
4.  Trial end date is stored
5.  Business can use the platform while the trial is active
6.  Backend checks trial status before protected functionality
7.  When the trial expires, service access is stopped
8.  QR functionality is deactivated
9.  Existing business, feedback, and analytics data is retained

The admin dashboard will allow manual trial management during the demo
phase.

Possible admin actions: - Give 7 days - Give 14 days - Give 30 days -
Extend trial - Expire account - Reactivate demo access

------------------------------------------------------------------------

## Admin Dashboard

The admin interface will be part of the same React application.

Route:

`/admin`

Admin can view:

-   Total businesses
-   Businesses on trial
-   Active businesses
-   Expired businesses
-   Trial start date
-   Trial end date
-   Subscription period
-   Days remaining
-   QR usage
-   Feedback activity

Admin can also manage demo access and trial periods.

Admin routes must be protected using role-based authorization.

------------------------------------------------------------------------

## Google Integration

### V1

No Google Business Profile API is required.

Businesses provide their Google review URL during onboarding.

The platform uses this URL when the customer chooses:

`Continue to Google`

### Future

Google Business Profile API can be considered later for features such
as:

-   Review monitoring
-   Review retrieval
-   Business-side reputation management
-   Reply management
-   Performance data

------------------------------------------------------------------------

## Payment Integration

### Initial Demo

Not included.

The first version will use manually managed trial access so the product
can be demonstrated to local businesses.

### Future

A payment gateway can be integrated after validating the product with
real businesses.

Potential options: - Razorpay - Stripe

------------------------------------------------------------------------

## Deployment

### Frontend

-   Vercel

### Backend

-   Render

### Database

-   Supabase

### Authentication

-   Supabase Auth

### Domain

-   `.com` or `.in`

------------------------------------------------------------------------

## Environment Variables

### Frontend

-   `VITE_SUPABASE_URL`
-   `VITE_SUPABASE_ANON_KEY`
-   `VITE_API_URL`

### Backend

-   `DATABASE_URL`
-   `DIRECT_URL`
-   `SUPABASE_URL`
-   `SUPABASE_SERVICE_ROLE_KEY`
-   `FRONTEND_URL`

Secrets must never be committed to Git.

------------------------------------------------------------------------

## Architecture

``` text
                    ┌─────────────────────┐
                    │       React         │
                    │       Vite          │
                    │                     │
                    │ Tailwind + shadcn   │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │    Node.js /        │
                    │    Express.js       │
                    │                     │
                    │ Auth / Business     │
                    │ Feedback / Analytics│
                    │ Admin / Trial       │
                    └──────────┬──────────┘
                               │
                               │ Prisma
                               ▼
                    ┌─────────────────────┐
                    │      Supabase       │
                    │     PostgreSQL      │
                    └─────────────────────┘

                    ┌─────────────────────┐
                    │    Supabase Auth    │
                    │    Google OAuth     │
                    └─────────────────────┘
```

------------------------------------------------------------------------

