# Short Circuit - Engineering Project Kits & Learning Platform

A full-stack e-commerce platform with a professional learning management system (LMS) for Short Circuit, built with Hono, TypeScript, and Cloudflare Pages.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Email System](#email-system)
- [Certificate System](#certificate-system)
- [Admin Dashboard](#admin-dashboard)
- [Troubleshooting](#troubleshooting)

---

## Overview

Short Circuit sells hands-on engineering project kits (Smartwatch, Ball and Beam) paired with professional online courses. The platform includes:

- **E-commerce**: Stripe checkout, inventory management, order tracking
- **LMS**: Video lessons, quizzes, project submissions, progress tracking
- **Certificates**: Auto-generated certificates with public verification
- **Email Notifications**: Transactional emails via Resend
- **Admin Dashboard**: User management, submission reviews, analytics

### Live URLs

- **Production**: https://shortcircuit-2t9.pages.dev
- **Admin Dashboard**: https://shortcircuit-2t9.pages.dev/admin/
- **Certificate Verification**: https://shortcircuit-2t9.pages.dev/verify/{certificate-number}

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend Framework | [Hono](https://hono.dev/) (lightweight, edge-optimized) |
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| File Storage | Cloudflare R2 (S3-compatible) |
| Payments | Stripe Checkout |
| Email | Resend API |
| Build Tool | Vite |
| Language | TypeScript |
| CSS | Tailwind CSS (CDN) |

---

## Project Structure

```
webapp/
├── src/
│   ├── index.tsx              # Main application (5,300+ lines)
│   │                          # - All API routes
│   │                          # - Email templates
│   │                          # - Stripe integration
│   │                          # - Authentication
│   │                          # - Course management
│   └── auth/
│       ├── middleware.ts      # Auth middleware, rate limiting
│       ├── password.ts        # PBKDF2 password hashing
│       └── session.ts         # Session management
│
├── public/                    # Static frontend files
│   ├── index.html             # Homepage
│   ├── shop.html              # Product catalog
│   ├── smartwatch.html        # Smartwatch product page
│   ├── ballbeam.html          # Ball & Beam product page
│   ├── cart.html              # Shopping cart
│   ├── checkout-success.html  # Post-purchase page
│   ├── checkout-cancel.html   # Cancelled checkout page
│   ├── login.html             # User login
│   ├── signup.html            # User registration
│   ├── forgot-password.html   # Password reset request
│   ├── reset-password.html    # Password reset form
│   ├── orders.html            # Order history
│   ├── contact.html           # Contact form
│   ├── challenge.html         # Design challenge page
│   ├── privacy.html           # Privacy policy
│   ├── terms.html             # Terms of service
│   ├── verify.html            # Certificate verification
│   │
│   ├── account/
│   │   └── index.html         # User dashboard
│   │
│   ├── admin/
│   │   └── index.html         # Admin dashboard
│   │
│   ├── course/
│   │   ├── smartwatch/
│   │   │   ├── index.html     # Smartwatch course player
│   │   │   ├── quiz.html      # Quiz interface
│   │   │   ├── submission.html # Demo submission
│   │   │   └── video-lesson.html
│   │   ├── ballbeam/
│   │   │   ├── index.html     # Ball & Beam course player
│   │   │   ├── quiz.html
│   │   │   └── submission.html
│   │   ├── certificate.html   # Certificate display
│   │   ├── course-api.js      # Course data fetching
│   │   ├── course-components.js # UI components
│   │   ├── course-enhanced.js # Enhanced features
│   │   └── course-enhanced.css
│   │
│   ├── js/
│   │   ├── main.js            # Homepage scripts
│   │   ├── cart-shared.js     # Cart functionality
│   │   ├── checkout.js        # Stripe checkout
│   │   ├── auth-header.js     # Auth header component
│   │   ├── animations.js      # UI animations
│   │   └── iframe-detect.js   # Iframe detection
│   │
│   ├── css/
│   │   ├── responsive.css     # Mobile responsive styles
│   │   └── auth-header.css    # Auth header styles
│   │
│   ├── images/                # Product images, logo
│   │
│   └── previews/              # Email template previews
│       ├── index.html         # Preview hub
│       ├── certificate.html   # Certificate preview
│       └── emails/            # All email templates as HTML
│
├── migrations/                # D1 database migrations
│   ├── 0001_initial_schema.sql
│   ├── 0002_security_progress_certificates.sql
│   ├── 0002_seed_data.sql
│   ├── 0003_courses.sql
│   ├── 0004_smartwatch_course_seed.sql
│   ├── 0005_full_smartwatch_course_content.sql
│   ├── 0006_complete_coursera_level_content.sql
│   ├── 0007_comments_and_reviews.sql
│   └── 0008_ballbeam_course.sql
│
├── wrangler.jsonc             # Cloudflare configuration
├── vite.config.ts             # Vite build config
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies & scripts
├── ecosystem.config.cjs       # PM2 process manager config
├── .dev.vars                  # Local environment variables (DO NOT COMMIT)
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Cloudflare account (for deployment)
- Stripe account (for payments)
- Resend account (for emails)

### Installation

```bash
# Clone the repository
git clone https://github.com/kayla-collab/short-cct.git
cd short-cct

# Install dependencies
npm install
```

---

## Configuration

### Environment Variables

Create a `.dev.vars` file for local development (never commit this file):

```bash
# Stripe API Keys (LIVE MODE)
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Resend Email API Key
RESEND_API_KEY=re_xxxxx
```

### Cloudflare Configuration

The `wrangler.jsonc` file contains all Cloudflare bindings:

```jsonc
{
  "name": "shortcircuits",
  "compatibility_date": "2026-02-01",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "vars": {
    "STRIPE_PUBLISHABLE_KEY": "pk_live_xxxxx",
    "STRIPE_SECRET_KEY": "sk_live_xxxxx",
    "STRIPE_WEBHOOK_SECRET": "whsec_xxxxx",
    "RESEND_API_KEY": "re_xxxxx",
    "ADMIN_EMAILS": "kayla@kaylasierra.com,support@shortcct.com"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "shortcircuits-db",
      "database_id": "9564b58f-4035-494a-8cfd-ed1dbcc96cbc"
    }
  ]
}
```

### Required Secrets

| Secret | Description | Where to Get |
|--------|-------------|--------------|
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | https://dashboard.stripe.com/apikeys |
| `STRIPE_SECRET_KEY` | Stripe secret key | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | https://dashboard.stripe.com/webhooks |
| `RESEND_API_KEY` | Email API key | https://resend.com/api-keys |

### Domain Verification (Required for Email)

Before emails will send to customers, you must verify the `shortcct.com` domain in Resend:

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter `shortcct.com`
4. Add the DNS records Resend provides to your domain registrar
5. Wait for verification (5-15 minutes)

---

## Database Setup

### Database Schema Overview

| Table | Purpose |
|-------|---------|
| `users` | User accounts (email, password hash, role) |
| `sessions` | Authentication sessions |
| `orders` | Purchase records |
| `order_items` | Order line items |
| `inventory` | Product stock levels |
| `courses` | Course metadata |
| `course_modules` | Module structure |
| `lessons` | Lesson content (JSON) |
| `lesson_progress` | User progress per lesson |
| `module_progress` | Module-level completion |
| `quiz_questions` | Quiz content |
| `quiz_attempts` | Quiz results |
| `submissions` | Project submissions |
| `certificates` | Issued certificates |
| `course_access` | Enrollment records |
| `access_logs` | Security audit trail |

### Applying Migrations

```bash
# Local development
npx wrangler d1 execute shortcircuits-db --local --file=./migrations/0001_initial_schema.sql
npx wrangler d1 execute shortcircuits-db --local --file=./migrations/0002_security_progress_certificates.sql
# ... apply all migrations in order

# Production
npx wrangler d1 execute shortcircuits-db --remote --file=./migrations/0001_initial_schema.sql
```

### Useful Database Commands

```bash
# Query local database
npx wrangler d1 execute shortcircuits-db --local --command="SELECT * FROM users LIMIT 10"

# Query production database
npx wrangler d1 execute shortcircuits-db --remote --command="SELECT COUNT(*) FROM users"

# Reset local database
rm -rf .wrangler/state/v3/d1
# Then reapply migrations
```

---

## Local Development

### Starting the Development Server

```bash
# Build the project first
npm run build

# Start with PM2 (recommended)
pm2 start ecosystem.config.cjs

# Or run directly with wrangler
npx wrangler pages dev dist --d1=shortcircuits-db --local --ip 0.0.0.0 --port 3000
```

### Available Scripts

```bash
npm run build          # Build for production
npm run dev            # Vite dev server (not for Cloudflare)
npm run deploy         # Build and deploy to Cloudflare
npm run db:migrate:local  # Apply migrations locally
npm run db:migrate:prod   # Apply migrations to production
```

### Testing Locally

1. Start the server: `pm2 start ecosystem.config.cjs`
2. Open http://localhost:3000
3. Check logs: `pm2 logs --nostream`
4. Stop server: `pm2 delete all`

---

## Deployment

### Deploy to Cloudflare Pages

```bash
# Build and deploy
npm run build
npx wrangler pages deploy dist --project-name shortcircuit

# Or use the shortcut
npm run deploy
```

### Setting Up Cloudflare Pages Project

1. Go to https://dash.cloudflare.com
2. Navigate to Workers & Pages > Create application > Pages
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Production branch: `main`

### Setting Secrets in Production

```bash
# Set secrets (prompts for value)
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name shortcircuit
npx wrangler pages secret put RESEND_API_KEY --project-name shortcircuit
```

---

## API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Create account |
| `/api/auth/login` | POST | Login |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/forgot-password` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password with token |

### Courses

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses` | GET | List enrolled courses |
| `/api/courses/:id` | GET | Course details with modules |
| `/api/courses/:id/lessons/:lessonId` | GET | Lesson content |
| `/api/course/progress` | POST | Save lesson progress |
| `/api/course/quiz` | POST | Submit quiz answers |
| `/api/course/submission` | POST | Submit project demo |

### User Dashboard

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/my/courses` | GET | User's courses with progress |
| `/api/my/stats` | GET | Learning statistics |
| `/api/my/certificates` | GET | User's certificates |
| `/api/my/activity` | GET | Activity feed |

### Admin (Requires admin role)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/analytics` | GET | Dashboard stats |
| `/api/admin/submissions` | GET | List submissions |
| `/api/admin/submissions/:id` | PATCH | Review submission |
| `/api/admin/users` | GET | List users |
| `/api/admin/users/:id` | GET | User details |
| `/api/admin/orders` | GET | List orders |
| `/api/admin/export/:type` | GET | Export data as CSV |

### Public

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/config` | GET | Public config (Stripe key) |
| `/api/inventory` | GET | Product availability |
| `/api/verify/:certificateNumber` | GET | Verify certificate |

---

## Email System

### Email Templates

All email templates are defined in `src/index.tsx`. The system sends:

| Trigger | Email |
|---------|-------|
| User signup | Welcome email |
| Newsletter signup | Subscription confirmation |
| Order placed | Order confirmation |
| Password reset request | Reset link |
| Password changed | Confirmation |
| Course access granted | Welcome to course |
| Module completed | Progress update |
| Submission received | Confirmation |
| Submission approved | Approval + feedback |
| Submission needs revision | Feedback |
| Certificate issued | Download link |
| New submission (admin) | Review notification |

### Email Preview

Preview all email templates at:
- https://shortcircuit-2t9.pages.dev/previews/

### Configuring Email Sender

The sender address is configured in `src/index.tsx`:

```typescript
const EMAIL_FROM = 'Short Circuit <hello@shortcct.com>'
```

**Important**: The domain must be verified in Resend before emails will send.

---

## Certificate System

### Certificate Generation

Certificates are auto-generated when:
1. User completes all modules
2. Final project submission is approved by admin

Certificate numbers follow the format: `SC-{COURSE}-{YEAR}-{SEQUENCE}`
- Example: `SC-SW-2026-00001` (Smartwatch)
- Example: `SC-BB-2026-00001` (Ball & Beam)

### Certificate Verification

Public verification page: `/verify/{certificate-number}`

API endpoint: `GET /api/verify/:certificateNumber`

Response:
```json
{
  "valid": true,
  "certificate": {
    "certificateNumber": "SC-SW-2026-00001",
    "recipientName": "John Doe",
    "courseTitle": "Smartwatch Development",
    "completionDate": "2026-03-15",
    "skills": ["Embedded C/C++", "FreeRTOS", "I2C"],
    "instructorName": "Anand Seetharaman"
  }
}
```

---

## Admin Dashboard

### Accessing Admin

1. Create account at `/signup.html`
2. Add email to `ADMIN_EMAILS` in `wrangler.jsonc`
3. Redeploy
4. Login and go to `/admin/`

### Admin Features

- **Dashboard**: Overview stats, pending submissions
- **Submissions**: Review queue with approve/revision/reject
- **Users**: Search, view details, manage roles
- **Orders**: View orders, update status
- **Analytics**: Course completion rates, engagement
- **Export**: CSV exports for reporting

---

## Troubleshooting

### Common Issues

**"Invalid request origin" error**
- CSRF protection blocking the request
- Ensure requests come from allowed origins in `csrfProtection` middleware

**Emails not sending**
- Verify domain in Resend dashboard
- Check `RESEND_API_KEY` is set correctly
- Check Resend dashboard for error logs

**Database errors**
- Ensure migrations are applied in order
- Check D1 binding in `wrangler.jsonc`
- For local: delete `.wrangler/state/v3/d1` and reapply migrations

**Build failures**
- Run `npm install` to ensure dependencies
- Check TypeScript errors: `npx tsc --noEmit`

**Static files not loading**
- Files must be in `public/` directory
- Check `pages_build_output_dir` in `wrangler.jsonc`

### Viewing Logs

```bash
# Local development
pm2 logs --nostream

# Production (Cloudflare dashboard)
# Go to Workers & Pages > shortcircuit > Logs
```

### Getting Help

- **Technical Issues**: Review this README and code comments
- **Cloudflare Issues**: https://developers.cloudflare.com/pages/
- **Stripe Issues**: https://stripe.com/docs
- **Resend Issues**: https://resend.com/docs

---

## Credentials Reference

**Cloudflare**
- Project: shortcircuit
- Database: shortcircuits-db
- Database ID: 9564b58f-4035-494a-8cfd-ed1dbcc96cbc

**Stripe (Live Mode)**
- Dashboard: https://dashboard.stripe.com
- Webhook endpoint: `/api/webhooks/stripe`

**Resend**
- Dashboard: https://resend.com
- Sending domain: shortcct.com (must be verified)
- From address: hello@shortcct.com

**Admin Access**
- Configured in `ADMIN_EMAILS` variable
- Current admins: kayla@kaylasierra.com, support@shortcct.com

---

## License

Proprietary - All rights reserved. Custom code ownership transfers to client upon final payment.

Third-party assets:
- Google Fonts (Montserrat, Open Sans) - SIL Open Font License
- Font Awesome 6.4.0 - Font Awesome Free License
- Tailwind CSS - MIT License
- Chart.js, Axios, Day.js, Lodash - MIT License
