# Short Circuit - Client Handoff Guide

## Overview

This document provides complete instructions for transferring the Short Circuit web application to a new owner for self-hosting.

---

## What You Are Receiving

### Codebase
- Full source code for the Short Circuit e-commerce and learning platform
- Hono (TypeScript) backend with Cloudflare Pages deployment
- Responsive HTML/CSS/JavaScript frontend
- Complete course content (Smartwatch and Ball & Beam projects)

### Services Required
| Service | Purpose | Current Provider |
|---------|---------|------------------|
| Hosting | Edge deployment | Cloudflare Pages (Free tier available) |
| Database | User data, orders, progress | Cloudflare D1 (SQLite) |
| File Storage | Submission uploads | Cloudflare R2 |
| Payments | Checkout, subscriptions | Stripe |
| Email | Transactional emails | Resend |
| Domain | shortcct.com | Transfer in progress |

---

## Option 1: Full Cloudflare Account Transfer (Easiest)

If you want to take over the existing deployment with minimal effort:

### Steps:
1. Create a Cloudflare account at https://dash.cloudflare.com/sign-up
2. Provide your Cloudflare account email to the current owner
3. Current owner will invite you as **Super Administrator**
4. Accept the invitation and verify access
5. Current owner removes themselves from the account

### What Transfers:
- Pages project (shortcircuit-2t9)
- D1 database with all data (users, orders, course progress)
- R2 bucket (if enabled)
- All environment variables and secrets

### Post-Transfer Tasks:
- Update Stripe webhook endpoint to your account
- Update Resend API key
- Transfer domain DNS to the account

---

## Option 2: Fresh Deployment with Code Transfer (Recommended)

For a clean start with full control:

### Step 1: Set Up Your Cloudflare Account

1. Create account at https://dash.cloudflare.com/sign-up
2. Generate an API token:
   - Go to **My Profile** > **API Tokens**
   - Click **Create Token**
   - Use template: **Edit Cloudflare Workers**
   - Add permissions: D1 (Edit), R2 (Edit), Pages (Edit)
   - Save the token securely

### Step 2: Set Up Stripe Account

1. Create/login at https://dashboard.stripe.com
2. Get your API keys from **Developers** > **API Keys**:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`
3. Set up webhook:
   - Go to **Developers** > **Webhooks**
   - Add endpoint: `https://YOUR-DOMAIN.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`
   - Copy the webhook signing secret: `whsec_...`

### Step 3: Set Up Resend Account

1. Create account at https://resend.com
2. Add and verify your domain (shortcct.com)
3. Get API key from **API Keys** section
4. Update sender addresses in code if needed

### Step 4: Deploy the Application

```bash
# Clone the repository (once transferred)
git clone https://github.com/YOUR-USERNAME/shortcircuit-webapp.git
cd shortcircuit-webapp

# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create shortcircuits-db
# Copy the database_id from output and update wrangler.jsonc

# Create R2 bucket (optional, for file uploads)
npx wrangler r2 bucket create shortcircuits-uploads

# Create Pages project
npx wrangler pages project create shortcircuit --production-branch main

# Apply database migrations
npx wrangler d1 migrations apply shortcircuits-db --local
npx wrangler d1 migrations apply shortcircuits-db

# Build and deploy
npm run build
npx wrangler pages deploy dist --project-name shortcircuit
```

### Step 5: Configure Environment Variables

In Cloudflare Dashboard > Pages > shortcircuit > Settings > Environment Variables:

| Variable | Description |
|----------|-------------|
| `STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (encrypt) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (encrypt) |
| `RESEND_API_KEY` | Your Resend API key (encrypt) |
| `ADMIN_EMAILS` | Comma-separated admin emails |

### Step 6: Connect Custom Domain

```bash
# Add custom domain
npx wrangler pages domains add shortcct.com --project-name shortcircuit
npx wrangler pages domains add www.shortcct.com --project-name shortcircuit
```

Or via Cloudflare Dashboard:
1. Go to Pages > shortcircuit > Custom domains
2. Click **Set up a custom domain**
3. Enter `shortcct.com` and `www.shortcct.com`
4. Follow DNS configuration instructions

---

## Option 3: Export Data + Fresh Start

If you want the code but prefer to start with a clean database:

### Export Current Data

```bash
# Export users (remove passwords for security)
npx wrangler d1 execute shortcircuits-db --command="SELECT id, email, name, role, created_at FROM users" --json > users_export.json

# Export orders
npx wrangler d1 execute shortcircuits-db --command="SELECT * FROM orders" --json > orders_export.json

# Export course progress
npx wrangler d1 execute shortcircuits-db --command="SELECT * FROM course_access" --json > enrollments_export.json
npx wrangler d1 execute shortcircuits-db --command="SELECT * FROM lesson_progress" --json > progress_export.json
npx wrangler d1 execute shortcircuits-db --command="SELECT * FROM certificates" --json > certificates_export.json
```

### Import to New Database

After creating new D1 database and applying migrations, import data using SQL INSERT statements or the Cloudflare D1 console.

---

## Configuration Reference

### wrangler.jsonc

Update these values for your account:

```jsonc
{
  "name": "shortcircuit",
  "compatibility_date": "2026-02-01",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "vars": {
    "STRIPE_PUBLISHABLE_KEY": "pk_live_YOUR_KEY",
    "STRIPE_SECRET_KEY": "sk_live_YOUR_KEY",
    "STRIPE_WEBHOOK_SECRET": "whsec_YOUR_SECRET",
    "ADMIN_EMAILS": "your-email@domain.com"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "shortcircuits-db",
      "database_id": "YOUR_DATABASE_ID"
    }
  ],
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "shortcircuits-uploads"
    }
  ]
}
```

### Environment Variables (Production Secrets)

Set these via Cloudflare Dashboard (encrypted):
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`

---

## Database Schema

The application uses Cloudflare D1 (SQLite). Key tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts and authentication |
| `sessions` | Login sessions |
| `orders` | Purchase records |
| `order_items` | Order line items |
| `inventory` | Product stock levels |
| `courses` | Course metadata |
| `course_modules` | Module structure |
| `lessons` | Lesson content (JSON) |
| `lesson_progress` | User lesson completion |
| `module_progress` | Module-level progress |
| `quiz_questions` | Quiz content |
| `quiz_attempts` | Quiz results |
| `submissions` | Project submissions |
| `certificates` | Issued certificates |
| `course_access` | Enrollments with payment verification |
| `support_tickets` | Customer support tickets |
| `access_logs` | Security audit trail |

Migrations are in the `/migrations` folder and should be applied in order.

---

## Key Files Reference

```
shortcircuit-webapp/
├── src/
│   ├── index.tsx          # Main application (all API routes)
│   └── auth/
│       ├── middleware.ts  # Auth middleware, rate limiting
│       ├── password.ts    # Password hashing
│       └── session.ts     # Session management
├── public/
│   ├── index.html         # Homepage
│   ├── shop.html          # Product catalog
│   ├── cart.html          # Shopping cart
│   ├── account/           # User dashboard
│   ├── admin/             # Admin dashboard
│   ├── course/            # Course player
│   └── images/            # Static images
├── migrations/            # Database migrations
├── wrangler.jsonc         # Cloudflare configuration
├── package.json           # Dependencies
├── vite.config.ts         # Build configuration
└── ecosystem.config.cjs   # PM2 config (development)
```

---

## Updating Content

### Course Content
Course content is stored in the D1 database in the `lessons` table as JSON. To update:

1. Query existing content: `SELECT * FROM lessons WHERE course_id = 'smartwatch-course'`
2. Update via SQL or create a migration file
3. Apply migration: `npx wrangler d1 migrations apply shortcircuits-db`

### Email Templates
Email templates are defined in `src/index.tsx` in the email template functions:
- `courseAccessGrantedEmailContent()`
- `moduleCompleteEmailContent()`
- `submissionReceivedEmailContent()`
- `submissionApprovedEmailContent()`
- `certificateIssuedEmailContent()`
- etc.

### Products/Pricing
Update Stripe Dashboard for pricing changes. Product IDs are referenced in the frontend files (shop.html, etc.).

---

## Support Contacts

### Current Development Team
- Email: [Your handoff contact email]

### Cloudflare Support
- https://support.cloudflare.com

### Stripe Support
- https://support.stripe.com

### Resend Support
- https://resend.com/docs

---

## Security Checklist

Before going live with your own deployment:

- [ ] Change all API keys (Stripe, Resend)
- [ ] Update webhook endpoints in Stripe
- [ ] Set strong admin email(s) in `ADMIN_EMAILS`
- [ ] Review and update CORS allowed origins in `src/index.tsx`
- [ ] Enable R2 bucket if file uploads are needed
- [ ] Test payment flow in Stripe test mode first
- [ ] Verify email delivery from your domain
- [ ] Set up domain verification (DKIM, SPF, DMARC)

---

## Estimated Costs (Monthly)

| Service | Free Tier | Paid Estimate |
|---------|-----------|---------------|
| Cloudflare Pages | 500 builds/month | $20/mo (Pro) |
| Cloudflare D1 | 5M rows read, 100K writes | $0.75/M reads |
| Cloudflare R2 | 10GB storage, 1M requests | $0.015/GB |
| Stripe | 2.9% + $0.30 per transaction | Same |
| Resend | 3,000 emails/month | $20/mo (5K emails) |
| Domain | N/A | ~$12/year |

**Total estimated cost for small-medium traffic: $20-50/month**

---

## Backup Recommendations

1. **Database**: Export D1 data weekly
   ```bash
   npx wrangler d1 export shortcircuits-db --output=backup.sql
   ```

2. **Code**: Keep GitHub repository updated with all changes

3. **R2 Files**: Use Cloudflare R2 lifecycle rules or sync to another storage

---

*Document created: March 2026*
*Last updated: March 22, 2026*
