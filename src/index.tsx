/// <reference path="../node_modules/@cloudflare/workers-types/index.d.ts" />

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-pages'
import Stripe from 'stripe'

// Auth imports
import { hashPassword, verifyPassword, isValidEmail, isValidPassword } from './auth/password'
import { 
  createSession, 
  getSessionWithUser, 
  deleteSession, 
  getSessionIdFromCookie,
  createSessionCookie,
  createClearSessionCookie,
  limitUserSessions,
  User
} from './auth/session'
import { authMiddleware, requireAuth, requireAdmin, rateLimit } from './auth/middleware'

// Type definitions for Cloudflare bindings
type Bindings = {
  DB: D1Database
  R2: R2Bucket
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  STRIPE_PUBLISHABLE_KEY: string
  ADMIN_EMAILS: string
  RESEND_API_KEY: string
}

type CheckoutSessionWithShippingDetails = Stripe.Checkout.Session & {
  shipping_details?: {
    name?: string | null
    address?: {
      line1?: string | null
      line2?: string | null
      city?: string | null
      state?: string | null
      postal_code?: string | null
      country?: string | null
    } | null
  } | null
}

// ============================================
// EMAIL SERVICE (Resend)
// ============================================

const EMAIL_FROM = 'Short Circuit <onboarding@resend.dev>'
const SUPPORT_EMAIL = 'support@shortcct.com'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail(apiKey: string, options: EmailOptions): Promise<boolean> {
  try {
    console.log('Sending email with API key:', apiKey ? 'Key present (length: ' + apiKey.length + ')' : 'NO KEY')
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error, 'Status:', response.status)
      return false
    }
    
    console.log(`Email sent successfully to ${options.to}`)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Email template wrapper
function emailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Short Circuit</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    
    /* Dark mode styles */
    @media (prefers-color-scheme: dark) {
      .email-body {
        background-color: #0f172a !important;
      }
      .email-container {
        background-color: #1e293b !important;
      }
      .email-content {
        background-color: #1e293b !important;
      }
      .email-footer {
        background-color: #0f172a !important;
        border-top-color: #334155 !important;
      }
      .text-heading {
        color: #ffffff !important;
      }
      .text-body {
        color: #e2e8f0 !important;
      }
      .text-muted {
        color: #94a3b8 !important;
      }
      .bg-highlight {
        background: linear-gradient(135deg, #1e3a5f 0%, #1e3a3f 100%) !important;
      }
      .bg-light {
        background-color: #334155 !important;
      }
      .border-light {
        border-color: #475569 !important;
      }
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .email-content {
        padding: 24px !important;
      }
      .email-header {
        padding: 20px 24px !important;
      }
      .email-footer {
        padding: 20px 24px !important;
      }
    }
  </style>
</head>
<body class="email-body" style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-body" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" class="email-container" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); max-width: 600px;">
          <!-- Header -->
          <tr>
            <td class="email-header" style="background: linear-gradient(135deg, #1a2332 0%, #2a3444 100%); padding: 28px 40px; border-radius: 16px 16px 0 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center;">
                    <img src="https://shortcircuit-2t9.pages.dev/images/logo.png" alt="Short Circuit" width="44" height="44" style="display: inline-block; vertical-align: middle; border-radius: 8px;">
                    <span style="color: #ffffff; font-size: 22px; font-weight: 700; margin-left: 14px; vertical-align: middle; letter-spacing: -0.5px;">SHORT CIRCUIT</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="email-content" style="padding: 40px; background-color: #ffffff;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="email-footer" style="background-color: #f8fafc; padding: 28px 40px; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center;">
                    <p class="text-muted" style="margin: 0 0 12px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                      Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #00bfff; text-decoration: none; font-weight: 500;">${SUPPORT_EMAIL}</a>
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                      &copy; 2026 Short Circuit. Made for engineers, by engineers.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Welcome email for new signups
function welcomeEmailContent(name: string): string {
  const firstName = name ? name.split(' ')[0] : 'there'
  return `
    <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Welcome to Short Circuit!</h1>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey ${firstName},</p>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for creating your Short Circuit account. You are now part of a community of engineers building real-world, portfolio-ready projects.</p>
    
    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%); border-radius: 8px; padding: 20px; margin: 25px 0;">
      <h3 style="color: #1a2332; font-size: 18px; margin: 0 0 15px 0;">What you can do now:</h3>
      <ul style="color: #495057; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>Browse our project kits in the <a href="https://shortcircuit-2t9.pages.dev/shop.html" style="color: #00bfff;">Shop</a></li>
        <li>Access your purchased courses anytime</li>
        <li>Track your learning progress</li>
        <li>Get support from our engineering team</li>
      </ul>
    </div>
    
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Ready to start building?</p>
    
    <a href="https://shortcircuit-2t9.pages.dev/shop.html" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Explore Projects</a>
  `
}

// Subscription confirmation email
function subscriptionEmailContent(name: string): string {
  const firstName = name ? name.split(' ')[0] : 'there'
  return `
    <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">You are In!</h1>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey ${firstName},</p>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Thanks for subscribing to Short Circuit updates. You will be the first to know about:</p>
    
    <div style="background: #f8f9fa; border-left: 4px solid #00bfff; padding: 15px 20px; margin: 25px 0;">
      <ul style="color: #495057; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>New project kit launches</li>
        <li>Engineering tutorials and tips</li>
        <li>Exclusive discounts and early access</li>
        <li>Community events and challenges</li>
      </ul>
    </div>
    
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">In the meantime, check out our current projects:</p>
    
    <a href="https://shortcircuit-2t9.pages.dev/shop.html" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Projects</a>
  `
}

// Order confirmation email
function orderConfirmationEmailContent(orderDetails: {
  orderNumber: string
  customerName: string
  items: Array<{ name: string; quantity: number; price: number }>
  subtotal: number
  shipping: number
  total: number
  shippingAddress?: {
    name?: string
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}): string {
  const firstName = orderDetails.customerName ? orderDetails.customerName.split(' ')[0] : 'there'
  
  const itemsHtml = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
        <span style="color: #1a2332; font-weight: 500;">${item.name}</span>
        <span style="color: #6c757d;"> x ${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right; color: #1a2332;">$${(item.price / 100).toFixed(2)}</td>
    </tr>
  `).join('')
  
  const addressHtml = orderDetails.shippingAddress ? `
    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <h3 style="color: #1a2332; font-size: 16px; margin: 0 0 10px 0;">Shipping To:</h3>
      <p style="color: #495057; font-size: 14px; line-height: 1.6; margin: 0;">
        ${orderDetails.shippingAddress.name || ''}<br>
        ${orderDetails.shippingAddress.line1 || ''}<br>
        ${orderDetails.shippingAddress.line2 ? orderDetails.shippingAddress.line2 + '<br>' : ''}
        ${orderDetails.shippingAddress.city || ''}, ${orderDetails.shippingAddress.state || ''} ${orderDetails.shippingAddress.postalCode || ''}<br>
        ${orderDetails.shippingAddress.country || 'US'}
      </p>
    </div>
  ` : ''
  
  return `
    <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Order Confirmed!</h1>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">Hey ${firstName},</p>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for your order. We are excited to help you build something amazing.</p>
    
    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%); border-radius: 8px; padding: 15px 20px; margin: 20px 0;">
      <p style="margin: 0; color: #1a2332; font-size: 14px;"><strong>Order Number:</strong> #${orderDetails.orderNumber}</p>
    </div>
    
    <h3 style="color: #1a2332; font-size: 18px; margin: 25px 0 15px 0;">Order Summary</h3>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${itemsHtml}
      <tr>
        <td style="padding: 12px 0; color: #6c757d;">Subtotal</td>
        <td style="padding: 12px 0; text-align: right; color: #495057;">$${(orderDetails.subtotal / 100).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; color: #6c757d;">Shipping</td>
        <td style="padding: 12px 0; text-align: right; color: #495057;">${orderDetails.shipping === 0 ? 'FREE' : '$' + (orderDetails.shipping / 100).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 15px 0; border-top: 2px solid #1a2332; color: #1a2332; font-weight: 700; font-size: 18px;">Total</td>
        <td style="padding: 15px 0; border-top: 2px solid #1a2332; text-align: right; color: #1a2332; font-weight: 700; font-size: 18px;">$${(orderDetails.total / 100).toFixed(2)}</td>
      </tr>
    </table>
    
    ${addressHtml}
    
    <div style="background: #fff3cd; border-radius: 8px; padding: 15px 20px; margin: 25px 0;">
      <p style="margin: 0; color: #856404; font-size: 14px;"><strong>What happens next?</strong> Your kit will ship within 2-3 business days. You will receive tracking information once it is on its way.</p>
    </div>
    
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Once your kit arrives, log in to access your course materials and start building.</p>
    
    <a href="https://shortcircuit-2t9.pages.dev/account/" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">View My Orders</a>
  `
}

// Password reset email
function passwordResetEmailContent(resetLink: string): string {
  return `
    <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Reset Your Password</h1>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">We received a request to reset your password for your Short Circuit account.</p>
    
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Click the button below to create a new password:</p>
    
    <a href="${resetLink}" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
    
    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
      <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">If the button does not work, copy and paste this link into your browser:</p>
      <p style="margin: 0; color: #00bfff; font-size: 12px; word-break: break-all;">${resetLink}</p>
    </div>
    
    <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 0;">This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
  `
}

// Password reset success email
function passwordResetSuccessEmailContent(): string {
  return `
    <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Password Changed Successfully</h1>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Your Short Circuit account password has been successfully updated.</p>
    
    <div style="background: #d4edda; border-radius: 8px; padding: 15px 20px; margin: 25px 0;">
      <p style="margin: 0; color: #155724; font-size: 14px;"><strong>Security Notice:</strong> If you did not make this change, please contact us immediately at ${SUPPORT_EMAIL}</p>
    </div>
    
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">You can now log in with your new password.</p>
    
    <a href="https://shortcircuit-2t9.pages.dev/login.html" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Login Now</a>
  `
}

// Generate secure random token
function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  const randomValues = new Uint8Array(48)
  crypto.getRandomValues(randomValues)
  for (let i = 0; i < 48; i++) {
    token += chars[randomValues[i] % chars.length]
  }
  return token
}

// ============================================
// COURSE ACCESS VERIFICATION EMAILS
// ============================================

// Course access granted email (after Stripe payment verification)
function courseAccessGrantedEmailContent(details: {
  userName: string
  courseName: string
  courseUrl: string
  orderNumber: string
}): string {
  return `
    <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Your Course Access is Confirmed!</h1>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey ${details.userName},</p>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Great news! Your payment has been verified and you now have full access to <strong>${details.courseName}</strong>.</p>

    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%); border-radius: 8px; padding: 20px; margin: 25px 0;">
      <h3 style="color: #1a2332; font-size: 18px; margin: 0 0 15px 0;">What is Next?</h3>
      <ol style="color: #495057; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>Wait for your kit to arrive (ships within 2-3 business days)</li>
        <li>Start with Module 1 to get familiar with the components</li>
        <li>Follow along with the video tutorials</li>
        <li>Submit your module demos for feedback</li>
      </ol>
    </div>

    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Your instructor, Anand Seetharaman, is here to help you succeed. Do not hesitate to reach out if you have questions!</p>

    <a href="${details.courseUrl}" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Start Learning</a>
    
    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px 20px; margin: 25px 0;">
      <p style="margin: 0; color: #6c757d; font-size: 12px;">Order Reference: #${details.orderNumber}</p>
    </div>
  `
}

// Module completion email
function moduleCompleteEmailContent(details: {
  userName: string
  moduleName: string
  courseName: string
  progressPercentage: number
  modulesCompleted: number
  totalModules: number
  nextModuleName?: string
  nextModuleUrl?: string
  isFinalModule: boolean
  submissionUrl?: string
}): string {
  const progressBar = `
    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px; color: #00bfff;">${details.progressPercentage}%</div>
      <div style="color: #6c757d; font-size: 14px;">Overall Course Progress (${details.modulesCompleted}/${details.totalModules} modules)</div>
      <div style="background: #e9ecef; border-radius: 10px; height: 10px; margin-top: 15px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #00bfff, #00ff88); height: 100%; width: ${details.progressPercentage}%;"></div>
      </div>
    </div>
  `

  if (details.isFinalModule) {
    return `
      <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">All Modules Complete!</h1>
      <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey ${details.userName},</p>
      <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Incredible achievement! You have completed all the modules in <strong>${details.courseName}</strong>. You are now ready to submit your final project!</p>

      ${progressBar}

      <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%); border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #856404; font-size: 18px; margin: 0 0 15px 0;">Final Project Requirements:</h3>
        <ul style="color: #856404; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>A video demonstration of your working project (2-5 minutes)</li>
          <li>Photos of your completed build</li>
          <li>Brief description of any customizations you made</li>
        </ul>
      </div>

      <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Once your submission is reviewed and approved by Anand, you will receive your official Short Circuit certificate!</p>

      <a href="${details.submissionUrl || 'https://shortcircuit-2t9.pages.dev/account/'}" style="display: inline-block; background: #ff6b6b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Submit Final Project</a>
    `
  }

  return `
    <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Module Complete!</h1>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey ${details.userName},</p>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Awesome work! You have successfully completed <strong>${details.moduleName}</strong> in ${details.courseName}.</p>

    ${progressBar}

    ${details.nextModuleName ? `
      <div style="background: linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%); border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #1a2332; font-size: 18px; margin: 0 0 10px 0;">Up Next: ${details.nextModuleName}</h3>
        <p style="color: #495057; font-size: 14px; margin: 0;">Keep the momentum going! Your next module is ready and waiting.</p>
      </div>

      <a href="${details.nextModuleUrl}" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Continue to Next Module</a>
    ` : ''}
  `
}

// Final submission received email
function submissionReceivedEmailContent(details: {
  userName: string
  courseName: string
  submissionId: string
  submissionDate: string
}): string {
  return `
    <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Submission Received!</h1>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey ${details.userName},</p>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for submitting your final project for <strong>${details.courseName}</strong>. We are excited to review your work!</p>

    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #1a2332;"><strong>Submission ID:</strong> ${details.submissionId}</p>
      <p style="margin: 0 0 10px 0; color: #1a2332;"><strong>Submitted:</strong> ${details.submissionDate}</p>
      <p style="margin: 0; color: #1a2332;"><strong>Expected Review:</strong> Within 3 business days</p>
    </div>

    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Anand Seetharaman will personally review your project and provide feedback. You will receive an email once the review is complete.</p>

    <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 0;">If your submission is approved, your certificate will be issued automatically!</p>
  `
}

// Submission approved email
function submissionApprovedEmailContent(details: {
  userName: string
  courseName: string
  feedback: string
}): string {
  return `
    <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Congratulations! Project Approved!</h1>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey ${details.userName},</p>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Fantastic news! Your final project for <strong>${details.courseName}</strong> has been reviewed and <strong style="color: #28a745;">APPROVED</strong>!</p>

    <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-radius: 8px; padding: 20px; margin: 25px 0;">
      <h3 style="color: #155724; font-size: 18px; margin: 0 0 15px 0;">Feedback from Anand:</h3>
      <p style="color: #155724; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">"${details.feedback}"</p>
    </div>

    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Your certificate is being generated and will be sent to you in a separate email shortly.</p>

    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Thank you for being part of the Short Circuit community. We cannot wait to see what you build next!</p>

    <a href="https://shortcircuit-2t9.pages.dev/account/" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Your Progress</a>
  `
}

// Submission needs revision email
function submissionNeedsRevisionEmailContent(details: {
  userName: string
  courseName: string
  feedback: string
  submissionUrl: string
}): string {
  return `
    <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Almost There!</h1>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey ${details.userName},</p>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for submitting your final project for <strong>${details.courseName}</strong>. After review, we think it needs a few small updates before we can approve it.</p>

    <div style="background: #fff3cd; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <h3 style="color: #856404; font-size: 18px; margin: 0 0 15px 0;">Feedback from Anand:</h3>
      <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">"${details.feedback}"</p>
    </div>

    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Do not worry - you are so close! Make the suggested changes and resubmit when ready.</p>

    <a href="${details.submissionUrl}" style="display: inline-block; background: #ff6b6b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Resubmit Project</a>

    <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">Questions? Reply to this email and Anand will help you out.</p>
  `
}

// Certificate issued email
function certificateIssuedEmailContent(details: {
  userName: string
  recipientName: string
  courseName: string
  certificateNumber: string
  completionDate: string
  skills: string[]
  verificationUrl: string
  certificateUrl: string
}): string {
  const skillsList = details.skills.join(', ')
  
  return `
    <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Your Certificate is Ready!</h1>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey ${details.userName},</p>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Congratulations on completing <strong>${details.courseName}</strong>! Your official Short Circuit certificate is now available.</p>

    <div style="background: linear-gradient(135deg, #1a2332 0%, #2a3444 100%); border-radius: 12px; padding: 30px; margin: 25px 0; text-align: center;">
      <div style="color: #00bfff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Certificate of Completion</div>
      <div style="color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px;">${details.recipientName}</div>
      <div style="color: #adb5bd; font-size: 14px; margin-bottom: 15px;">${details.courseName}</div>
      <div style="color: #6c757d; font-size: 12px;">Certificate #${details.certificateNumber}</div>
      <div style="color: #6c757d; font-size: 12px; margin-top: 5px;">Issued: ${details.completionDate}</div>
    </div>

    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <p style="margin: 0 0 15px 0; color: #1a2332;"><strong>Skills Demonstrated:</strong></p>
      <p style="margin: 0; color: #495057; font-size: 14px;">${skillsList}</p>
    </div>

    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Share your achievement! Your certificate can be verified at:</p>

    <p style="background: #e9ecef; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 14px; color: #495057; word-break: break-all;">${details.verificationUrl}</p>

    <div style="margin-top: 25px;">
      <a href="${details.certificateUrl}" style="display: inline-block; background: #ff6b6b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 10px;">Download Certificate</a>
      <a href="https://shortcircuit-2t9.pages.dev/account/" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">View in Account</a>
    </div>
  `
}

// Admin notification: New submission
function adminNewSubmissionEmailContent(details: {
  userName: string
  userEmail: string
  courseName: string
  submissionId: string
  submissionDate: string
  adminReviewUrl: string
}): string {
  return `
    <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">New Submission Awaiting Review</h1>
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">A new final project submission has been received.</p>

    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #1a2332;"><strong>Student:</strong> ${details.userName} (${details.userEmail})</p>
      <p style="margin: 0 0 10px 0; color: #1a2332;"><strong>Course:</strong> ${details.courseName}</p>
      <p style="margin: 0 0 10px 0; color: #1a2332;"><strong>Submission ID:</strong> ${details.submissionId}</p>
      <p style="margin: 0; color: #1a2332;"><strong>Submitted:</strong> ${details.submissionDate}</p>
    </div>

    <a href="${details.adminReviewUrl}" style="display: inline-block; background: #ff6b6b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Review Submission</a>
  `
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Helper: Log access action
async function logAccess(db: D1Database, userId: number, courseId: string | null, action: string, metadata?: Record<string, any>, request?: Request): Promise<void> {
  try {
    const ipAddress = request?.headers.get('cf-connecting-ip') || request?.headers.get('x-forwarded-for') || null
    const userAgent = request?.headers.get('user-agent') || null
    
    await db.prepare(`
      INSERT INTO access_logs (user_id, course_id, action, ip_address, user_agent, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(userId, courseId, action, ipAddress, userAgent, metadata ? JSON.stringify(metadata) : null).run()
  } catch (error) {
    console.error('Failed to log access:', error)
  }
}

// Helper: Generate certificate number
function generateCertificateNumber(courseId: string, year: number, sequence: number): string {
  const courseCode = courseId === 'smartwatch-course' ? 'SW' : 'BB'
  return `SC-${courseCode}-${year}-${String(sequence).padStart(5, '0')}`
}

// Helper: Get course skills
function getCourseSkills(courseId: string): string[] {
  if (courseId === 'smartwatch-course') {
    return ['Embedded C Programming', 'ESP32 Development', 'Hardware Integration', 'UI/UX Design', 'System Architecture']
  } else if (courseId === 'ballbeam-course') {
    return ['PID Control Systems', 'Python Programming', 'C++ Programming', 'Real-time Systems', 'Mechanical Design']
  }
  return ['Project Completion']
}

// Helper: Check and update module progress after lesson completion
async function checkModuleCompletion(
  db: D1Database, 
  resendApiKey: string,
  userId: number, 
  courseId: string, 
  lessonId: string
): Promise<{ moduleCompleted: boolean; allModulesCompleted: boolean }> {
  try {
    // Get the module for this lesson
    const lesson = await db.prepare(
      'SELECT module_id FROM lessons WHERE id = ?'
    ).bind(lessonId).first<{ module_id: string }>()
    
    if (!lesson?.module_id) {
      return { moduleCompleted: false, allModulesCompleted: false }
    }
    
    const moduleId = lesson.module_id
    
    // Get all lessons in this module
    const moduleLessons = await db.prepare(
      'SELECT id FROM lessons WHERE module_id = ? AND is_published = 1'
    ).bind(moduleId).all()
    
    const totalLessons = moduleLessons.results?.length || 0
    
    // Get completed lessons in this module
    const completedLessons = await db.prepare(`
      SELECT COUNT(*) as count FROM lesson_progress 
      WHERE user_id = ? AND status = 'completed' 
      AND lesson_id IN (SELECT id FROM lessons WHERE module_id = ?)
    `).bind(userId, moduleId).first<{ count: number }>()
    
    const completedCount = completedLessons?.count || 0
    const completionPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
    
    // Check if module is now completed
    const moduleCompleted = completedCount >= totalLessons && totalLessons > 0
    
    // Update module_progress table
    const existingProgress = await db.prepare(
      'SELECT id, completion_email_sent FROM module_progress WHERE user_id = ? AND module_id = ?'
    ).bind(userId, moduleId).first<{ id: number; completion_email_sent: number }>()
    
    if (existingProgress) {
      await db.prepare(`
        UPDATE module_progress SET 
          status = ?,
          lessons_completed = ?,
          total_lessons = ?,
          completion_percentage = ?,
          completed_at = CASE WHEN ? = 'completed' THEN datetime('now') ELSE completed_at END,
          updated_at = datetime('now')
        WHERE user_id = ? AND module_id = ?
      `).bind(
        moduleCompleted ? 'completed' : 'in_progress',
        completedCount,
        totalLessons,
        completionPercentage,
        moduleCompleted ? 'completed' : 'in_progress',
        userId,
        moduleId
      ).run()
    } else {
      await db.prepare(`
        INSERT INTO module_progress (user_id, module_id, course_id, status, lessons_completed, total_lessons, completion_percentage, started_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        userId,
        moduleId,
        courseId,
        moduleCompleted ? 'completed' : 'in_progress',
        completedCount,
        totalLessons,
        completionPercentage
      ).run()
    }
    
    // If module just completed and email not sent yet, send notification
    if (moduleCompleted && (!existingProgress || existingProgress.completion_email_sent === 0)) {
      // Mark email as sent first to prevent duplicates
      await db.prepare(
        'UPDATE module_progress SET completion_email_sent = 1 WHERE user_id = ? AND module_id = ?'
      ).bind(userId, moduleId).run()
      
      // Get user and module info
      const userInfo = await db.prepare(
        'SELECT name, email FROM users WHERE id = ?'
      ).bind(userId).first<{ name: string; email: string }>()
      
      const moduleInfo = await db.prepare(
        'SELECT title, order_index FROM course_modules WHERE id = ?'
      ).bind(moduleId).first<{ title: string; order_index: number }>()
      
      const courseInfo = await db.prepare(
        'SELECT title FROM courses WHERE id = ?'
      ).bind(courseId).first<{ title: string }>()
      
      // Get total modules and completed modules count
      const allModules = await db.prepare(
        'SELECT COUNT(*) as count FROM course_modules WHERE course_id = ?'
      ).bind(courseId).all()
      const totalModules = Number(allModules.results?.[0]?.count ?? 0)
      
      const completedModules = await db.prepare(`
        SELECT COUNT(*) as count FROM module_progress 
        WHERE user_id = ? AND course_id = ? AND status = 'completed'
      `).bind(userId, courseId).first<{ count: number }>()
      const modulesCompleted = Number(completedModules?.count ?? 0)
      
      const allModulesCompleted = modulesCompleted >= totalModules && totalModules > 0
      
      // Get next module
      const nextModule = await db.prepare(`
        SELECT id, title FROM course_modules 
        WHERE course_id = ? AND order_index > ?
        ORDER BY order_index LIMIT 1
      `).bind(courseId, moduleInfo?.order_index || 0).first<{ id: string; title: string }>()
      
      // Calculate overall progress
      const overallProgress = totalModules > 0 ? Math.round((modulesCompleted / totalModules) * 100) : 0
      
      if (userInfo?.email) {
        sendEmail(resendApiKey, {
          to: userInfo.email,
          subject: allModulesCompleted 
            ? `Congratulations! You completed all modules in ${courseInfo?.title || 'your course'}!`
            : `Module Complete: ${moduleInfo?.title || 'Module'} - ${courseInfo?.title || 'Course'}`,
          html: emailTemplate(moduleCompleteEmailContent({
            userName: userInfo.name?.split(' ')[0] || 'there',
            moduleName: moduleInfo?.title || 'Module',
            courseName: courseInfo?.title || 'Course',
            progressPercentage: overallProgress,
            modulesCompleted: modulesCompleted,
            totalModules: totalModules,
            nextModuleName: nextModule?.title,
            nextModuleUrl: nextModule ? `https://shortcircuit-2t9.pages.dev/course/${courseId.replace('-course', '')}/` : undefined,
            isFinalModule: allModulesCompleted,
            submissionUrl: allModulesCompleted ? `https://shortcircuit-2t9.pages.dev/course/${courseId.replace('-course', '')}/submission.html` : undefined,
          })),
        }).catch(err => console.error('Failed to send module completion email:', err))
      }
      
      return { moduleCompleted: true, allModulesCompleted }
    }
    
    // Check if all modules are completed
    const allModules = await db.prepare(
      'SELECT COUNT(*) as count FROM course_modules WHERE course_id = ?'
    ).bind(courseId).all()
    const totalModulesCount = Number(allModules.results?.[0]?.count ?? 0)
    
    const completedModulesCount = await db.prepare(`
      SELECT COUNT(*) as count FROM module_progress 
      WHERE user_id = ? AND course_id = ? AND status = 'completed'
    `).bind(userId, courseId).first<{ count: number }>()
    
    const completedModulesTotal = Number(completedModulesCount?.count ?? 0)
    const allModulesCompleted = completedModulesTotal >= totalModulesCount && totalModulesCount > 0
    
    return { moduleCompleted, allModulesCompleted }
  } catch (error) {
    console.error('Error checking module completion:', error)
    return { moduleCompleted: false, allModulesCompleted: false }
  }
}

// Extend Hono context
declare module 'hono' {
  interface ContextVariableMap {
    user: User | null
    sessionId: string | null
  }
}

// Product catalog with inventory
const PRODUCTS: Record<string, {
  id: string
  name: string
  description: string
  price: number
  image: string
  sku: string
  courseId: string  // Associated course ID
}> = {
  smartwatch: {
    id: 'smartwatch',
    name: 'Smartwatch Project Kit',
    description: 'Complete embedded systems project with LilyGo T-Watch. Skills: Embedded, Electronics, System Design. Includes instructional materials and 3 months virtual support.',
    price: 11500,
    image: 'images/smartwatch-screens.png',
    sku: '364215375135191',
    courseId: 'smartwatch-course',
  },
  ballbeam: {
    id: 'ballbeam',
    name: 'Ball and Beam Project Kit',
    description: 'Controls and mechanical engineering project kit. Skills: PID Control, Python, C++, Simulation. Learn real-world control systems.',
    price: 11500,
    image: 'images/ballbeam-side.png',
    sku: '364215376135191',
    courseId: 'ballbeam-course',
  },
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================
// SECURITY HEADERS MIDDLEWARE
// ============================================
app.use('*', async (c, next) => {
  await next()
  
  // Security headers for all responses
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'SAMEORIGIN')
  c.header('X-XSS-Protection', '1; mode=block')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Strict Transport Security (HSTS) - enforces HTTPS
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  // Content Security Policy - adjust as needed for your CDN resources
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://js.stripe.com https://www.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://api.stripe.com https://api.resend.com https://*.pages.dev https://shortcircuits.org https://shortcct.com wss:",
    "frame-src 'self' https://js.stripe.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join('; ')
  c.header('Content-Security-Policy', csp)
})

// Enable CORS for API routes - restricted to specific domains
app.use('/api/*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'https://shortcircuit-2t9.pages.dev',
      'https://shortcircuits.org',
      'https://www.shortcircuits.org',
      'https://shortcct.com',
      'https://www.shortcct.com',
      // Development origins
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ]
    // Allow requests with no origin (mobile apps, Postman, etc.) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      return origin || allowedOrigins[0]
    }
    // Also allow any *.pages.dev subdomain for preview deployments
    if (origin.endsWith('.pages.dev')) {
      return origin
    }
    // Also allow sandbox URLs for development
    if (origin.includes('.sandbox.novita.ai') || origin.includes('.e2b.dev')) {
      return origin
    }
    return allowedOrigins[0]
  },
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'stripe-signature', 'X-CSRF-Token'],
  credentials: true,
  maxAge: 86400, // Cache preflight for 24 hours
}))

// Apply auth middleware to all API routes
app.use('/api/*', authMiddleware)

// ============================================
// CSRF PROTECTION MIDDLEWARE
// ============================================
// Protects state-changing requests (POST, PATCH, DELETE) by verifying:
// 1. Origin/Referer header matches allowed domains
// 2. Request comes from same site (for cookie-based auth)
const csrfProtection = async (c: any, next: any) => {
  const method = c.req.method
  
  // Only check state-changing methods
  if (!['POST', 'PATCH', 'DELETE', 'PUT'].includes(method)) {
    return next()
  }
  
  // Skip CSRF for Stripe webhooks (they use signature verification)
  if (c.req.path.includes('/webhooks/stripe')) {
    return next()
  }
  
  // Skip CSRF for public endpoints that don't require auth
  const publicPaths = ['/api/auth/signup', '/api/auth/login', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/subscribe']
  if (publicPaths.some(path => c.req.path === path)) {
    return next()
  }
  
  const origin = c.req.header('Origin')
  const referer = c.req.header('Referer')
  
  const allowedOrigins = [
    'https://shortcircuit-2t9.pages.dev',
    'https://shortcircuits.org',
    'https://www.shortcircuits.org',
    'https://shortcct.com',
    'https://www.shortcct.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]
  
  // Check if origin or referer is from allowed domains
  const isValidOrigin = origin && (
    allowedOrigins.includes(origin) ||
    origin.endsWith('.pages.dev') ||
    origin.includes('.sandbox.novita.ai') ||
    origin.includes('.e2b.dev')
  )
  
  const isValidReferer = referer && (
    allowedOrigins.some(o => referer.startsWith(o)) ||
    referer.includes('.pages.dev') ||
    referer.includes('.sandbox.novita.ai') ||
    referer.includes('.e2b.dev')
  )
  
  if (!isValidOrigin && !isValidReferer) {
    console.warn('CSRF check failed - invalid origin/referer:', { origin, referer, path: c.req.path })
    return c.json({ error: 'Invalid request origin', code: 'CSRF_ERROR' }, 403)
  }
  
  return next()
}

// Apply CSRF protection to authenticated API routes
app.use('/api/*', csrfProtection)

// ============================================
// PUBLIC API ROUTES
// ============================================

// TEMPORARY: Public test email endpoint (remove after testing)
app.post('/api/public/send-test-emails', async (c) => {
  const { email, secret } = await c.req.json()
  
  // Simple secret to prevent abuse
  if (secret !== 'shortcircuit-test-2026') {
    return c.json({ error: 'Invalid secret' }, 403)
  }
  
  if (!email) {
    return c.json({ error: 'Email address required' }, 400)
  }
  
  // Debug: Check if API key is present
  const apiKey = c.env.RESEND_API_KEY
  if (!apiKey) {
    return c.json({ error: 'RESEND_API_KEY not configured', debug: { hasKey: false } }, 500)
  }
  
  const results: { template: string; success: boolean; error?: string }[] = []
  
  try {
    // Test single email first with detailed error
    const testResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: email,
        subject: '[TEST] Welcome to Short Circuit!',
        html: emailTemplate(welcomeEmailContent('Kayla')),
      }),
    })
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      return c.json({ 
        error: 'Resend API failed', 
        status: testResponse.status,
        details: errorText,
        debug: { 
          from: EMAIL_FROM, 
          to: email,
          keyLength: apiKey.length,
          keyPrefix: apiKey.substring(0, 10) + '...'
        }
      }, 500)
    }
    // 1. Welcome Email
    results.push({
      template: 'Welcome Email',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Welcome to Short Circuit!',
        html: emailTemplate(welcomeEmailContent('Kayla')),
      })
    })
    
    // 2. Subscription Email
    results.push({
      template: 'Subscription Confirmation',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] You are In! Welcome to Short Circuit Updates',
        html: emailTemplate(subscriptionEmailContent('Kayla')),
      })
    })
    
    // 3. Order Confirmation Email
    results.push({
      template: 'Order Confirmation',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Order Confirmed! #SC-TEST-001',
        html: emailTemplate(orderConfirmationEmailContent({
          orderNumber: 'SC-TEST-001',
          customerName: 'Kayla',
          items: [
            { name: 'LilyGo T-Watch 2020 V3 Smartwatch Kit', quantity: 1, price: 8625 },
            { name: 'Ball and Beam Control System Kit', quantity: 1, price: 8625 }
          ],
          subtotal: 17250,
          shipping: 0,
          total: 17250,
          shippingAddress: {
            name: 'Kayla Sierra',
            line1: '123 Test Street',
            city: 'Columbus',
            state: 'IN',
            postalCode: '47201',
            country: 'US'
          }
        })),
      })
    })
    
    // 4. Password Reset Email
    results.push({
      template: 'Password Reset',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Reset Your Short Circuit Password',
        html: emailTemplate(passwordResetEmailContent('https://shortcircuit-2t9.pages.dev/reset-password.html?token=TEST_TOKEN_123')),
      })
    })
    
    // 5. Password Reset Success Email
    results.push({
      template: 'Password Reset Success',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Password Changed Successfully',
        html: emailTemplate(passwordResetSuccessEmailContent()),
      })
    })
    
    // 6. Course Access Granted Email
    results.push({
      template: 'Course Access Granted',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Your Course Access is Confirmed!',
        html: emailTemplate(courseAccessGrantedEmailContent({
          userName: 'Kayla',
          courseName: 'Smartwatch Development: LilyGo T-Watch 2020 V3',
          courseUrl: 'https://shortcircuit-2t9.pages.dev/course/smartwatch/',
          orderNumber: 'SC-TEST-001'
        })),
      })
    })
    
    // 7. Module Complete Email
    results.push({
      template: 'Module Complete',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Module 1 Complete - Great Progress!',
        html: emailTemplate(moduleCompleteEmailContent({
          userName: 'Kayla',
          moduleName: 'System Boot',
          courseName: 'Smartwatch Development',
          progressPercentage: 20,
          modulesCompleted: 1,
          totalModules: 5,
          nextModuleName: 'Timekeeping',
          nextModuleUrl: 'https://shortcircuit-2t9.pages.dev/course/smartwatch/',
          isFinalModule: false,
        })),
      })
    })
    
    // 8. Submission Received Email
    results.push({
      template: 'Submission Received',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Submission Received - Under Review',
        html: emailTemplate(submissionReceivedEmailContent({
          userName: 'Kayla',
          courseName: 'Smartwatch Development',
          submissionId: 'SUB-TEST-001',
          submissionDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        })),
      })
    })
    
    // 9. Submission Approved Email
    results.push({
      template: 'Submission Approved',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Submission Approved!',
        html: emailTemplate(submissionApprovedEmailContent({
          userName: 'Kayla',
          courseName: 'Smartwatch Development',
          feedback: 'Excellent work on initializing the power management system! Your code is clean and well-documented.',
        })),
      })
    })
    
    // 10. Submission Needs Revision Email
    results.push({
      template: 'Submission Needs Revision',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Submission Feedback - Revision Requested',
        html: emailTemplate(submissionNeedsRevisionEmailContent({
          userName: 'Kayla',
          courseName: 'Smartwatch Development',
          feedback: 'Good progress! Please add error handling for the Wi-Fi connection timeout case.',
          submissionUrl: 'https://shortcircuit-2t9.pages.dev/course/smartwatch/submission.html',
        })),
      })
    })
    
    // 11. Certificate Issued Email
    results.push({
      template: 'Certificate Issued',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Congratulations! Your Certificate is Ready',
        html: emailTemplate(certificateIssuedEmailContent({
          userName: 'Kayla',
          recipientName: 'Kayla Sierra',
          courseName: 'Smartwatch Development: LilyGo T-Watch 2020 V3',
          certificateNumber: 'SC-CERT-TEST-001',
          completionDate: 'March 23, 2026',
          skills: ['Embedded C/C++', 'FreeRTOS', 'I2C Communication'],
          verificationUrl: 'https://shortcircuit-2t9.pages.dev/verify/SC-CERT-TEST-001',
          certificateUrl: 'https://shortcircuit-2t9.pages.dev/api/certificates/SC-CERT-TEST-001/download',
        })),
      })
    })
    
    // 12. Admin Notification Email
    results.push({
      template: 'Admin: New Submission',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] New Submission Requires Review',
        html: emailTemplate(adminNewSubmissionEmailContent({
          userName: 'Test Student',
          userEmail: 'student@example.com',
          courseName: 'Smartwatch Development',
          submissionId: 'SUB-TEST-ADMIN-001',
          submissionDate: new Date().toLocaleDateString('en-US'),
          adminReviewUrl: 'https://shortcircuit-2t9.pages.dev/admin/',
        })),
      })
    })
    
    const successCount = results.filter(r => r.success).length
    return c.json({ 
      message: `Sent ${successCount}/${results.length} test emails to ${email}`,
      results 
    })
    
  } catch (error) {
    console.error('Test email error:', error)
    return c.json({ error: 'Failed to send test emails', results }, 500)
  }
})

// API: Get configuration
app.get('/api/config', (c) => {
  return c.json({
    publishableKey: c.env.STRIPE_PUBLISHABLE_KEY,
  })
})

// ============================================
// EMAIL PREVIEW ENDPOINTS (Public - for review)
// ============================================

app.get('/api/preview/email/welcome', (c) => {
  return c.html(emailTemplate(welcomeEmailContent('Kayla')))
})

app.get('/api/preview/email/subscription', (c) => {
  return c.html(emailTemplate(subscriptionEmailContent('Kayla')))
})

app.get('/api/preview/email/order', (c) => {
  return c.html(emailTemplate(orderConfirmationEmailContent({
    orderNumber: 'SC-2026-001234',
    customerName: 'Kayla Sierra',
    items: [
      { name: 'Smartwatch Project Kit - LilyGo T-Watch 2020 V3', quantity: 1, price: 8625 },
      { name: 'Ball and Beam Control System Kit', quantity: 1, price: 8625 }
    ],
    subtotal: 17250,
    shipping: 0,
    total: 17250,
    shippingAddress: {
      name: 'Kayla Sierra',
      line1: '123 Engineering Way',
      city: 'Columbus',
      state: 'IN',
      postalCode: '47201',
      country: 'US'
    }
  })))
})

app.get('/api/preview/email/password-reset', (c) => {
  return c.html(emailTemplate(passwordResetEmailContent('https://shortcircuit-2t9.pages.dev/reset-password.html?token=example-reset-token-123')))
})

app.get('/api/preview/email/password-reset-success', (c) => {
  return c.html(emailTemplate(passwordResetSuccessEmailContent()))
})

app.get('/api/preview/email/course-access', (c) => {
  return c.html(emailTemplate(courseAccessGrantedEmailContent({
    userName: 'Kayla',
    courseName: 'Smartwatch Development: LilyGo T-Watch 2020 V3',
    courseUrl: 'https://shortcircuit-2t9.pages.dev/course/smartwatch/',
    orderNumber: 'SC-2026-001234'
  })))
})

app.get('/api/preview/email/module-complete', (c) => {
  return c.html(emailTemplate(moduleCompleteEmailContent({
    userName: 'Kayla',
    moduleName: 'System Boot',
    courseName: 'Smartwatch Development',
    progressPercentage: 20,
    modulesCompleted: 1,
    totalModules: 5,
    nextModuleName: 'Timekeeping',
    nextModuleUrl: 'https://shortcircuit-2t9.pages.dev/course/smartwatch/',
    isFinalModule: false,
  })))
})

app.get('/api/preview/email/submission-received', (c) => {
  return c.html(emailTemplate(submissionReceivedEmailContent({
    userName: 'Kayla',
    courseName: 'Smartwatch Development',
    submissionId: 'SUB-PREVIEW-001',
    submissionDate: 'March 23, 2026',
  })))
})

app.get('/api/preview/email/submission-approved', (c) => {
  return c.html(emailTemplate(submissionApprovedEmailContent({
    userName: 'Kayla',
    courseName: 'Smartwatch Development',
    feedback: 'Excellent work on your smartwatch project! Your implementation of the power management system shows great understanding of embedded systems concepts. The touch interface is responsive and well-designed. Keep up the great work!',
  })))
})

app.get('/api/preview/email/submission-revision', (c) => {
  return c.html(emailTemplate(submissionNeedsRevisionEmailContent({
    userName: 'Kayla',
    courseName: 'Smartwatch Development',
    feedback: 'Great progress on your project! There are just a few areas that need attention:\n\n1. The Wi-Fi connection seems to drop occasionally - please check the reconnection logic in your code.\n2. The battery percentage display could use some smoothing to avoid flickering values.\n\nOnce these are addressed, your project will be ready for approval!',
    submissionUrl: 'https://shortcircuit-2t9.pages.dev/course/smartwatch/submission.html',
  })))
})

app.get('/api/preview/email/certificate', (c) => {
  return c.html(emailTemplate(certificateIssuedEmailContent({
    userName: 'Kayla',
    recipientName: 'Kayla Sierra',
    courseName: 'Smartwatch Development: LilyGo T-Watch 2020 V3',
    certificateNumber: 'SC-SW-2026-001234',
    completionDate: 'March 23, 2026',
    skills: ['Embedded C/C++', 'FreeRTOS', 'I2C Communication'],
    verificationUrl: 'https://shortcircuit-2t9.pages.dev/verify/SC-SW-2026-001234',
    certificateUrl: 'https://shortcircuit-2t9.pages.dev/api/certificates/SC-SW-2026-001234/download',
  })))
})

app.get('/api/preview/email/admin-submission', (c) => {
  return c.html(emailTemplate(adminNewSubmissionEmailContent({
    userName: 'Kayla Sierra',
    userEmail: 'kayla@kaylasierra.com',
    courseName: 'Smartwatch Development',
    submissionId: 'SUB-PREVIEW-001',
    submissionDate: 'March 23, 2026',
    adminReviewUrl: 'https://shortcircuit-2t9.pages.dev/admin/',
  })))
})

// Certificate HTML Preview
app.get('/api/preview/certificate', (c) => {
  const certificateHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Completion | Short Circuit</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Open Sans', sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
        }
        
        .certificate {
            width: 900px;
            max-width: 100%;
            background: #ffffff;
            border: 3px solid #1a2332;
            border-radius: 8px;
            padding: 60px;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .certificate::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            pointer-events: none;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            border-radius: 8px;
        }
        
        .company-name {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-weight: 700;
            color: #1a2332;
            letter-spacing: 2px;
        }
        
        .certificate-title {
            font-family: 'Playfair Display', serif;
            font-size: 42px;
            font-weight: 600;
            color: #1a2332;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        
        .subtitle {
            font-size: 14px;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        
        .main-content {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .presented-to {
            font-size: 14px;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
        }
        
        .recipient-name {
            font-family: 'Playfair Display', serif;
            font-size: 48px;
            font-weight: 700;
            color: #00bfff;
            margin-bottom: 25px;
            border-bottom: 2px solid #00bfff;
            display: inline-block;
            padding-bottom: 10px;
        }
        
        .completion-text {
            font-size: 16px;
            color: #495057;
            line-height: 1.8;
            max-width: 600px;
            margin: 0 auto 25px;
        }
        
        .course-name {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            font-weight: 600;
            color: #1a2332;
            margin-bottom: 30px;
        }
        
        .skills-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 40px;
        }
        
        .skills-title {
            font-size: 12px;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
        }
        
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
        }
        
        .skill-tag {
            background: #1a2332;
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
        }
        
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 1px solid #e0e0e0;
            padding-top: 30px;
        }
        
        .signature-section {
            text-align: center;
        }
        
        .signature-line {
            width: 200px;
            border-bottom: 1px solid #1a2332;
            margin-bottom: 10px;
        }
        
        .signature-name {
            font-weight: 600;
            color: #1a2332;
            margin-bottom: 3px;
        }
        
        .signature-title {
            font-size: 12px;
            color: #6c757d;
        }
        
        .certificate-info {
            text-align: right;
        }
        
        .info-item {
            font-size: 12px;
            color: #6c757d;
            margin-bottom: 5px;
        }
        
        .info-value {
            font-weight: 600;
            color: #1a2332;
        }
        
        .verification-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #e8f5e9;
            padding: 8px 15px;
            border-radius: 20px;
            margin-top: 15px;
        }
        
        .verification-badge svg {
            width: 16px;
            height: 16px;
            color: #4caf50;
        }
        
        .verification-text {
            font-size: 11px;
            color: #2e7d32;
            font-weight: 500;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .certificate {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="logo-section">
                <img src="https://shortcircuit-2t9.pages.dev/images/logo.png" alt="Short Circuit" class="logo">
                <span class="company-name">SHORT CIRCUIT</span>
            </div>
            <h1 class="certificate-title">Certificate of Completion</h1>
            <p class="subtitle">Professional Engineering Achievement</p>
        </div>
        
        <div class="main-content">
            <p class="presented-to">This is to certify that</p>
            <h2 class="recipient-name">Kayla Sierra</h2>
            <p class="completion-text">
                has successfully completed all requirements and demonstrated proficiency in the following course:
            </p>
            <h3 class="course-name">Smartwatch Development: LilyGo T-Watch 2020 V3</h3>
            
            <div class="skills-section">
                <p class="skills-title">Skills Demonstrated</p>
                <div class="skills-list">
                    <span class="skill-tag">Embedded C/C++</span>
                    <span class="skill-tag">FreeRTOS</span>
                    <span class="skill-tag">I2C Communication</span>
                    <span class="skill-tag">Touch Interfaces</span>
                    <span class="skill-tag">Power Management</span>
                    <span class="skill-tag">State Machines</span>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="signature-section">
                <div class="signature-line"></div>
                <p class="signature-name">Anand Seetharaman</p>
                <p class="signature-title">Lead Instructor, Short Circuit</p>
            </div>
            
            <div class="certificate-info">
                <p class="info-item">Certificate Number: <span class="info-value">SC-SW-2026-001234</span></p>
                <p class="info-item">Issue Date: <span class="info-value">March 23, 2026</span></p>
                <p class="info-item">Completion Hours: <span class="info-value">45 Hours</span></p>
                <div class="verification-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                    </svg>
                    <span class="verification-text">Verified at shortcircuit-2t9.pages.dev/verify</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `
  return c.html(certificateHtml)
})

// API: Get product inventory status (from D1)
app.get('/api/inventory', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      'SELECT product_id, product_name, quantity FROM inventory'
    ).all()
    
    const products = result.results?.map((row: any) => ({
      id: row.product_id,
      name: row.product_name,
      inventory: row.quantity,
      inStock: row.quantity > 0,
    })) || []
    
    return c.json({ products })
  } catch (error) {
    console.error('Inventory fetch error:', error)
    // Fallback to static data if DB fails
    return c.json({ 
      products: [
        { id: 'smartwatch', name: 'Smartwatch Project Kit', inventory: 12, inStock: true },
        { id: 'ballbeam', name: 'Ball and Beam Project Kit', inventory: 0, inStock: false }
      ]
    })
  }
})

// API: Check inventory for specific items
app.post('/api/inventory/check', async (c) => {
  try {
    const body = await c.req.json()
    const { items } = body as { items: { id: string; quantity: number }[] }

    if (!items || !Array.isArray(items)) {
      return c.json({ error: 'Invalid items' }, 400)
    }

    const results = []
    for (const item of items) {
      const product = PRODUCTS[item.id]
      if (!product) {
        results.push({ id: item.id, available: false, reason: 'Product not found' })
        continue
      }
      
      // Check inventory from D1
      const inv = await c.env.DB.prepare(
        'SELECT quantity FROM inventory WHERE product_id = ?'
      ).bind(item.id).first<{ quantity: number }>()
      
      const stock = inv?.quantity || 0
      
      if (stock < item.quantity) {
        results.push({ 
          id: item.id, 
          available: false, 
          reason: stock === 0 ? 'Out of stock' : `Only ${stock} available`,
          currentStock: stock
        })
      } else {
        results.push({ id: item.id, available: true, currentStock: stock })
      }
    }

    const allAvailable = results.every(r => r.available)
    return c.json({ available: allAvailable, items: results })

  } catch (error) {
    console.error('Inventory check error:', error)
    return c.json({ error: 'Failed to check inventory' }, 500)
  }
})

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Rate limit auth routes: 10 requests per minute
app.use('/api/auth/*', rateLimit(10, 60000))

// Additional rate limiting for sensitive endpoints
// Checkout: 5 requests per minute (prevent abuse)
app.use('/api/checkout/*', rateLimit(5, 60000))
// File uploads: 10 per minute
app.use('/api/upload', rateLimit(10, 60000))
// Support tickets: 5 per minute
app.use('/api/support/*', rateLimit(5, 60000))
// Subscriptions: 3 per minute
app.use('/api/subscribe', rateLimit(3, 60000))
// Course submissions: 5 per minute
app.use('/api/course/submission', rateLimit(5, 60000))
app.use('/api/course/final-project', rateLimit(5, 60000))

// API: Sign up
app.post('/api/auth/signup', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password, name } = body as { email: string; password: string; name?: string }

    // Validate email
    if (!email || !isValidEmail(email)) {
      return c.json({ error: 'Valid email is required' }, 400)
    }

    // Validate password
    const passwordCheck = isValidPassword(password)
    if (!passwordCheck.valid) {
      return c.json({ error: passwordCheck.message }, 400)
    }

    // Check if email already exists
    const existing = await c.env.DB.prepare(
      'SELECT id, email, name FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first<{ id: number; email: string; name: string }>()

    if (existing) {
      // Don't reveal that the email exists - send a notification email instead
      // and return a message that looks like success
      console.log('Signup attempted for existing email:', email.toLowerCase())
      
      // Send notification to existing user (async, don't wait)
      sendEmail(c.env.RESEND_API_KEY, {
        to: existing.email,
        subject: 'Account Already Exists - Short Circuit',
        html: emailTemplate(`
          <h1 style="color: #1a2332; font-size: 24px; margin: 0 0 20px 0;">Someone tried to create an account</h1>
          <p style="color: #495057; margin: 0 0 20px 0;">Hi ${existing.name?.split(' ')[0] || 'there'},</p>
          <p style="color: #495057; margin: 0 0 20px 0;">Someone (maybe you?) tried to create a Short Circuit account with this email address, but you already have an account.</p>
          <p style="color: #495057; margin: 0 0 20px 0;">If this was you, you can log in to your existing account:</p>
          <a href="https://shortcircuit-2t9.pages.dev/login.html" style="display: inline-block; background: #00bfff; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Log In</a>
          <p style="color: #6c757d; font-size: 14px; margin: 25px 0 0 0;">If you forgot your password, you can <a href="https://shortcircuit-2t9.pages.dev/forgot-password.html" style="color: #00bfff;">reset it here</a>.</p>
          <p style="color: #6c757d; font-size: 14px; margin: 15px 0 0 0;">If you did not attempt to create an account, you can safely ignore this email.</p>
        `),
      }).catch(err => console.error('Failed to send existing account email:', err))
      
      // Return a generic error that doesn't reveal the email exists
      // Use a slightly delayed response to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
      return c.json({ error: 'Unable to create account. Please try again or contact support.' }, 400)
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Check if this email should be admin
    const adminEmails = (c.env.ADMIN_EMAILS || '').toLowerCase().split(',').map(e => e.trim())
    const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'customer'

    // Create user
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
    ).bind(email.toLowerCase(), passwordHash, name || null, role).run()

    const userId = result.meta.last_row_id as number

    // Check for previous guest orders and grant course access
    try {
      const guestOrders = await c.env.DB.prepare(`
        SELECT o.id as order_id, oi.product_id 
        FROM orders o
        INNER JOIN order_items oi ON o.id = oi.order_id
        WHERE o.guest_email = ? AND o.status IN ('paid', 'processing', 'shipped', 'delivered')
      `).bind(email.toLowerCase()).all()

      if (guestOrders.results && guestOrders.results.length > 0) {
        for (const order of guestOrders.results as any[]) {
          const product = PRODUCTS[order.product_id]
          if (product && product.courseId) {
            // Grant course access
            await c.env.DB.prepare(`
              INSERT OR REPLACE INTO course_access (user_id, course_id, order_id, access_type, granted_at)
              VALUES (?, ?, ?, 'purchase', datetime('now'))
            `).bind(userId, product.courseId, order.order_id).run()
            console.log(`Course access granted for previous order: user ${userId} -> ${product.courseId}`)
          }
        }

        // Link orders to the new user account
        await c.env.DB.prepare(`
          UPDATE orders SET user_id = ?, guest_email = NULL WHERE guest_email = ?
        `).bind(userId, email.toLowerCase()).run()
      }
    } catch (accessError) {
      console.error('Error processing guest orders:', accessError)
      // Don't fail signup if this fails
    }

    // Create session
    const sessionId = await createSession(c.env.DB, userId)

    // Set cookie
    const cookie = createSessionCookie(sessionId, true)

    // Send welcome email (async, don't wait)
    sendEmail(c.env.RESEND_API_KEY, {
      to: email.toLowerCase(),
      subject: 'Welcome to Short Circuit!',
      html: emailTemplate(welcomeEmailContent(name || '')),
    }).catch(err => console.error('Failed to send welcome email:', err))

    return c.json({ 
      success: true, 
      user: { id: userId, email: email.toLowerCase(), name, role }
    }, 201, {
      'Set-Cookie': cookie
    })

  } catch (error) {
    console.error('Signup error:', error)
    return c.json({ error: 'Failed to create account' }, 500)
  }
})

// API: Login
app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = body as { email: string; password: string }

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    // Find user
    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash, name, role FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first<{
      id: number
      email: string
      password_hash: string
      name: string | null
      role: string
    }>()

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Verify password
    const validPassword = await verifyPassword(password, user.password_hash)
    if (!validPassword) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Create session
    const sessionId = await createSession(c.env.DB, user.id)
    
    // Limit concurrent sessions to 5 per user (security measure)
    await limitUserSessions(c.env.DB, user.id, 5)

    // Set cookie
    const cookie = createSessionCookie(sessionId, true)

    return c.json({ 
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    }, 200, {
      'Set-Cookie': cookie
    })

  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Failed to login' }, 500)
  }
})

// API: Logout
app.post('/api/auth/logout', async (c) => {
  const sessionId = c.get('sessionId')
  
  if (sessionId) {
    await deleteSession(c.env.DB, sessionId)
  }

  return c.json({ success: true }, 200, {
    'Set-Cookie': createClearSessionCookie()
  })
})

// API: Request password reset
app.post('/api/auth/forgot-password', async (c) => {
  try {
    const body = await c.req.json()
    const { email } = body as { email: string }

    if (!email || !email.includes('@')) {
      return c.json({ error: 'Valid email is required' }, 400)
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const user = await c.env.DB.prepare(
      'SELECT id, email, name FROM users WHERE email = ?'
    ).bind(normalizedEmail).first<{ id: number; email: string; name: string }>()

    // Always return success to prevent email enumeration
    if (!user) {
      console.log('Password reset requested for non-existent email:', normalizedEmail)
      return c.json({ success: true, message: 'If an account exists with this email, you will receive a password reset link.' })
    }

    // Generate reset token
    const resetToken = generateResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

    // Store reset token in database (create table if needed)
    try {
      await c.env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS password_resets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expires_at TEXT NOT NULL,
          used INTEGER DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `).run()
    } catch (e) {
      // Table might already exist
    }

    // Invalidate any existing reset tokens for this user
    await c.env.DB.prepare(
      'UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0'
    ).bind(user.id).run()

    // Insert new reset token
    await c.env.DB.prepare(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)'
    ).bind(user.id, resetToken, expiresAt).run()

    // Generate reset link
    const baseUrl = new URL(c.req.url).origin
    const resetLink = `${baseUrl}/reset-password.html?token=${resetToken}`

    // Send reset email
    await sendEmail(c.env.RESEND_API_KEY, {
      to: user.email,
      subject: 'Reset Your Short Circuit Password',
      html: emailTemplate(passwordResetEmailContent(resetLink)),
    })

    console.log('Password reset email sent to:', user.email)

    return c.json({ success: true, message: 'If an account exists with this email, you will receive a password reset link.' })

  } catch (error) {
    console.error('Forgot password error:', error)
    return c.json({ error: 'Failed to process request' }, 500)
  }
})

// API: Reset password with token
app.post('/api/auth/reset-password', async (c) => {
  try {
    const body = await c.req.json()
    const { token, password } = body as { token: string; password: string }

    if (!token) {
      return c.json({ error: 'Reset token is required' }, 400)
    }

    // Validate password
    const passwordCheck = isValidPassword(password)
    if (!passwordCheck.valid) {
      return c.json({ error: passwordCheck.message }, 400)
    }

    // Find valid reset token
    const resetRecord = await c.env.DB.prepare(`
      SELECT pr.id, pr.user_id, pr.expires_at, u.email, u.name
      FROM password_resets pr
      INNER JOIN users u ON pr.user_id = u.id
      WHERE pr.token = ? AND pr.used = 0
    `).bind(token).first<{ id: number; user_id: number; expires_at: string; email: string; name: string }>()

    if (!resetRecord) {
      return c.json({ error: 'Invalid or expired reset link. Please request a new one.' }, 400)
    }

    // Check if token is expired
    if (new Date(resetRecord.expires_at) < new Date()) {
      await c.env.DB.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').bind(resetRecord.id).run()
      return c.json({ error: 'This reset link has expired. Please request a new one.' }, 400)
    }

    // Hash new password
    const passwordHash = await hashPassword(password)

    // Update user password
    await c.env.DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(passwordHash, resetRecord.user_id).run()

    // Mark token as used
    await c.env.DB.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').bind(resetRecord.id).run()

    // Invalidate all sessions for this user (security measure)
    await c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(resetRecord.user_id).run()

    // Send confirmation email
    sendEmail(c.env.RESEND_API_KEY, {
      to: resetRecord.email,
      subject: 'Your Short Circuit Password Has Been Changed',
      html: emailTemplate(passwordResetSuccessEmailContent()),
    }).catch(err => console.error('Failed to send password change confirmation:', err))

    console.log('Password reset successful for user:', resetRecord.email)

    return c.json({ success: true, message: 'Password has been reset successfully. You can now log in with your new password.' })

  } catch (error) {
    console.error('Reset password error:', error)
    return c.json({ error: 'Failed to reset password' }, 500)
  }
})

// API: Validate reset token (check if valid before showing form)
app.get('/api/auth/validate-reset-token', async (c) => {
  try {
    const token = c.req.query('token')

    if (!token) {
      return c.json({ valid: false, error: 'Token is required' }, 400)
    }

    const resetRecord = await c.env.DB.prepare(`
      SELECT id, expires_at FROM password_resets
      WHERE token = ? AND used = 0
    `).bind(token).first<{ id: number; expires_at: string }>()

    if (!resetRecord) {
      return c.json({ valid: false, error: 'Invalid or expired reset link' })
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return c.json({ valid: false, error: 'This reset link has expired' })
    }

    return c.json({ valid: true })

  } catch (error) {
    console.error('Validate token error:', error)
    return c.json({ valid: false, error: 'Failed to validate token' }, 500)
  }
})

// API: Get current user
app.get('/api/auth/me', (c) => {
  const user = c.get('user')
  
  if (!user) {
    return c.json({ user: null })
  }

  return c.json({ 
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  })
})

// ============================================
// PROTECTED CUSTOMER ROUTES
// ============================================

// API: Get customer's orders
app.get('/api/account/orders', requireAuth, async (c) => {
  const user = c.get('user')!
  
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        o.id, o.stripe_session_id, o.status, o.total_cents, o.subtotal_cents,
        o.discount_cents, o.shipping_cents, o.promo_code, o.shipping_name,
        o.shipping_address_line1, o.shipping_city, o.shipping_state,
        o.shipping_postal_code, o.tracking_number, o.created_at
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `).bind(user.id).all()

    const orders = result.results || []

    // Get order items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order: any) => {
      const items = await c.env.DB.prepare(
        'SELECT product_id, product_name, quantity, price_cents FROM order_items WHERE order_id = ?'
      ).bind(order.id).all()

      return {
        ...order,
        items: items.results || []
      }
    }))

    return c.json({ orders: ordersWithItems })

  } catch (error) {
    console.error('Orders fetch error:', error)
    return c.json({ error: 'Failed to fetch orders' }, 500)
  }
})

// API: Claim course access from orders (ensures all purchased courses are accessible)
app.post('/api/account/claim-courses', requireAuth, async (c) => {
  const user = c.get('user')!
  
  try {
    // Get all orders for this user
    const orders = await c.env.DB.prepare(`
      SELECT o.id as order_id, oi.product_id 
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ? AND o.status IN ('paid', 'processing', 'shipped', 'delivered')
    `).bind(user.id).all()

    const grantedCourses: string[] = []

    if (orders.results && orders.results.length > 0) {
      for (const order of orders.results as any[]) {
        const product = PRODUCTS[order.product_id]
        if (product && product.courseId) {
          // Check if access already exists
          const existing = await c.env.DB.prepare(
            'SELECT id FROM course_access WHERE user_id = ? AND course_id = ?'
          ).bind(user.id, product.courseId).first()

          if (!existing) {
            await c.env.DB.prepare(`
              INSERT INTO course_access (user_id, course_id, order_id, access_type, granted_at)
              VALUES (?, ?, ?, 'purchase', datetime('now'))
            `).bind(user.id, product.courseId, order.order_id).run()
            grantedCourses.push(product.courseId)
          }
        }
      }
    }

    return c.json({ 
      success: true, 
      message: grantedCourses.length > 0 
        ? `Access granted to ${grantedCourses.length} course(s)` 
        : 'All courses already accessible',
      courses: grantedCourses
    })

  } catch (error) {
    console.error('Claim courses error:', error)
    return c.json({ error: 'Failed to claim courses' }, 500)
  }
})

// ============================================
// ADMIN ROUTES
// ============================================

// API: Get all orders (admin)
app.get('/api/admin/orders', requireAdmin, async (c) => {
  try {
    const status = c.req.query('status')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')

    let query = `
      SELECT 
        o.*, u.email as user_email, u.name as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `
    const params: any[] = []

    if (status) {
      query += ' WHERE o.status = ?'
      params.push(status)
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const result = await c.env.DB.prepare(query).bind(...params).all()
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders'
    if (status) {
      countQuery += ' WHERE status = ?'
    }
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...(status ? [status] : []))
      .first<{ total: number }>()

    return c.json({ 
      orders: result.results || [],
      total: countResult?.total || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('Admin orders fetch error:', error)
    return c.json({ error: 'Failed to fetch orders' }, 500)
  }
})

// API: Get single order (admin)
app.get('/api/admin/orders/:id', requireAdmin, async (c) => {
  try {
    const orderId = c.req.param('id')

    const order = await c.env.DB.prepare(`
      SELECT o.*, u.email as user_email, u.name as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).bind(orderId).first()

    if (!order) {
      return c.json({ error: 'Order not found' }, 404)
    }

    const items = await c.env.DB.prepare(
      'SELECT * FROM order_items WHERE order_id = ?'
    ).bind(orderId).all()

    return c.json({ 
      order: { ...order, items: items.results || [] }
    })

  } catch (error) {
    console.error('Admin order fetch error:', error)
    return c.json({ error: 'Failed to fetch order' }, 500)
  }
})

// API: Update order status (admin)
app.patch('/api/admin/orders/:id', requireAdmin, async (c) => {
  try {
    const orderId = c.req.param('id')
    const body = await c.req.json()
    const { status, tracking_number, notes } = body as {
      status?: string
      tracking_number?: string
      notes?: string
    }

    const updates: string[] = []
    const params: any[] = []

    if (status) {
      updates.push('status = ?')
      params.push(status)
    }
    if (tracking_number !== undefined) {
      updates.push('tracking_number = ?')
      params.push(tracking_number)
    }
    if (notes !== undefined) {
      updates.push('notes = ?')
      params.push(notes)
    }

    if (updates.length === 0) {
      return c.json({ error: 'No updates provided' }, 400)
    }

    updates.push("updated_at = datetime('now')")
    params.push(orderId)

    await c.env.DB.prepare(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...params).run()

    return c.json({ success: true })

  } catch (error) {
    console.error('Admin order update error:', error)
    return c.json({ error: 'Failed to update order' }, 500)
  }
})

// API: Get all inventory (admin)
app.get('/api/admin/inventory', requireAdmin, async (c) => {
  try {
    const result = await c.env.DB.prepare(
      'SELECT * FROM inventory ORDER BY product_id'
    ).all()

    return c.json({ inventory: result.results || [] })

  } catch (error) {
    console.error('Admin inventory fetch error:', error)
    return c.json({ error: 'Failed to fetch inventory' }, 500)
  }
})

// API: Update inventory (admin)
app.patch('/api/admin/inventory/:productId', requireAdmin, async (c) => {
  try {
    const productId = c.req.param('productId')
    const body = await c.req.json()
    const { quantity, low_stock_threshold } = body as {
      quantity?: number
      low_stock_threshold?: number
    }

    const updates: string[] = []
    const params: any[] = []

    if (quantity !== undefined) {
      updates.push('quantity = ?')
      params.push(quantity)
    }
    if (low_stock_threshold !== undefined) {
      updates.push('low_stock_threshold = ?')
      params.push(low_stock_threshold)
    }

    if (updates.length === 0) {
      return c.json({ error: 'No updates provided' }, 400)
    }

    updates.push("updated_at = datetime('now')")
    params.push(productId)

    await c.env.DB.prepare(
      `UPDATE inventory SET ${updates.join(', ')} WHERE product_id = ?`
    ).bind(...params).run()

    return c.json({ success: true })

  } catch (error) {
    console.error('Admin inventory update error:', error)
    return c.json({ error: 'Failed to update inventory' }, 500)
  }
})

// API: Update user role (admin)
app.patch('/api/admin/users/:id', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('id')
    const body = await c.req.json()
    const { role } = body as { role: 'customer' | 'admin' }

    if (!role || !['customer', 'admin'].includes(role)) {
      return c.json({ error: 'Valid role is required (customer or admin)' }, 400)
    }

    await c.env.DB.prepare(
      "UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?"
    ).bind(role, userId).run()

    return c.json({ success: true })

  } catch (error) {
    console.error('Admin user update error:', error)
    return c.json({ error: 'Failed to update user' }, 500)
  }
})

// API: Get admin dashboard stats
app.get('/api/admin/stats', requireAdmin, async (c) => {
  try {
    // Get order stats
    const orderStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
        SUM(total_cents) as total_revenue
      FROM orders WHERE status != 'cancelled'
    `).first<any>()

    // Get user stats
    const userStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count
      FROM users
    `).first<any>()

    // Get low stock items
    const lowStock = await c.env.DB.prepare(
      'SELECT * FROM inventory WHERE quantity <= low_stock_threshold'
    ).all()

    return c.json({
      orders: orderStats || {},
      users: userStats || {},
      lowStockItems: lowStock.results || []
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return c.json({ error: 'Failed to fetch stats' }, 500)
  }
})

// ============================================
// CHECKOUT ROUTES (Updated to save orders to D1)
// ============================================

// API: Create Stripe Checkout Session
app.post('/api/checkout/create-session', async (c) => {
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
  })

  try {
    const body = await c.req.json()
    const { items, guestEmail } = body as { 
      items: { id: string; quantity: number }[]
      guestEmail?: string 
    }

    // Get current user if logged in
    const user = c.get('user')

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return c.json({ error: 'No items in cart' }, 400)
    }

    // Check inventory
    const inventoryIssues: string[] = []
    for (const item of items) {
      const product = PRODUCTS[item.id]
      if (!product) {
        inventoryIssues.push(`Product "${item.id}" not found`)
        continue
      }
      
      const inv = await c.env.DB.prepare(
        'SELECT quantity FROM inventory WHERE product_id = ?'
      ).bind(item.id).first<{ quantity: number }>()
      
      const stock = inv?.quantity || 0
      if (stock < item.quantity) {
        if (stock === 0) {
          inventoryIssues.push(`"${product.name}" is out of stock`)
        } else {
          inventoryIssues.push(`"${product.name}" only has ${stock} in stock`)
        }
      }
    }

    if (inventoryIssues.length > 0) {
      return c.json({ error: 'Inventory issues', details: inventoryIssues }, 400)
    }

    // Get base URL
    const url = new URL(c.req.url)
    const baseUrl = `${url.protocol}//${url.host}`

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => {
      const product = PRODUCTS[item.id]
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
            images: [`${baseUrl}/${product.image}`],
            metadata: { product_id: product.id, sku: product.sku },
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      }
    })

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout-cancel.html`,
      customer_email: user?.email || guestEmail || undefined,
      allow_promotion_codes: true,
      shipping_address_collection: { allowed_countries: ['US'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Free Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 10 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'usd' },
            display_name: 'Express Shipping (2-3 business days)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 3 },
            },
          },
        },
      ],
      metadata: {
        source: 'shortcircuit-website',
        items: JSON.stringify(items),
        user_id: user?.id?.toString() || '',
      },
      phone_number_collection: { enabled: true },
    })

    return c.json({ sessionId: session.id, url: session.url })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session'
    return c.json({ error: errorMessage }, 500)
  }
})

// API: Stripe Webhook Handler
app.post('/api/webhooks/stripe', async (c) => {
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
  })

  const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET
  
  try {
    const body = await c.req.text()
    let event: Stripe.Event

    if (webhookSecret && webhookSecret.startsWith('whsec_')) {
      const signature = c.req.header('stripe-signature')
      if (!signature) {
        return c.json({ error: 'Missing signature' }, 400)
      }
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return c.json({ error: 'Invalid signature' }, 400)
      }
    } else {
      event = JSON.parse(body) as Stripe.Event
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as CheckoutSessionWithShippingDetails
        console.log('Payment successful for session:', session.id)
        
        // Get items from metadata
        const items = session.metadata?.items ? JSON.parse(session.metadata.items) : []
        const userId = session.metadata?.user_id ? parseInt(session.metadata.user_id) : null

        // Calculate totals
        const subtotal = items.reduce((sum: number, item: any) => {
          const product = PRODUCTS[item.id]
          return sum + (product?.price || 0) * item.quantity
        }, 0)

        // Create order in database
        const orderResult = await c.env.DB.prepare(`
          INSERT INTO orders (
            user_id, guest_email, stripe_session_id, stripe_payment_intent,
            status, total_cents, subtotal_cents, shipping_name,
            shipping_address_line1, shipping_address_line2, shipping_city,
            shipping_state, shipping_postal_code, shipping_country
          ) VALUES (?, ?, ?, ?, 'paid', ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          userId,
          userId ? null : session.customer_details?.email,
          session.id,
          session.payment_intent,
          session.amount_total,
          subtotal,
          session.shipping_details?.name,
          session.shipping_details?.address?.line1,
          session.shipping_details?.address?.line2,
          session.shipping_details?.address?.city,
          session.shipping_details?.address?.state,
          session.shipping_details?.address?.postal_code,
          session.shipping_details?.address?.country || 'US'
        ).run()

        const orderId = orderResult.meta.last_row_id

        // Add order items and grant course access
        for (const item of items) {
          const product = PRODUCTS[item.id]
          if (product) {
            await c.env.DB.prepare(`
              INSERT INTO order_items (order_id, product_id, product_name, quantity, price_cents)
              VALUES (?, ?, ?, ?, ?)
            `).bind(orderId, item.id, product.name, item.quantity, product.price).run()

            // Decrement inventory
            await c.env.DB.prepare(
              'UPDATE inventory SET quantity = MAX(0, quantity - ?), updated_at = datetime(\'now\') WHERE product_id = ?'
            ).bind(item.quantity, item.id).run()

            // Grant course access if user is logged in (with Stripe payment verification)
            if (userId && product.courseId) {
              try {
                await c.env.DB.prepare(`
                  INSERT OR REPLACE INTO course_access (
                    user_id, course_id, order_id, access_type, granted_at,
                    stripe_payment_intent, payment_verified, verification_date
                  )
                  VALUES (?, ?, ?, 'purchase', datetime('now'), ?, 1, datetime('now'))
                `).bind(userId, product.courseId, orderId, session.payment_intent).run()
                console.log(`Course access granted with Stripe verification: user ${userId} -> ${product.courseId}`)
                
                // Log access grant
                await logAccess(c.env.DB, userId, product.courseId, 'access_granted', {
                  order_id: orderId,
                  payment_intent: session.payment_intent,
                  product_id: item.id
                })
                
                // Get user info for email
                const userInfo = await c.env.DB.prepare(
                  'SELECT name, email FROM users WHERE id = ?'
                ).bind(userId).first<{ name: string; email: string }>()
                
                // Get course info
                const courseInfo = await c.env.DB.prepare(
                  'SELECT title FROM courses WHERE id = ?'
                ).bind(product.courseId).first<{ title: string }>()
                
                // Send course access confirmation email
                if (userInfo?.email) {
                  sendEmail(c.env.RESEND_API_KEY, {
                    to: userInfo.email,
                    subject: `Welcome to ${courseInfo?.title || product.name} - Your Access is Confirmed!`,
                    html: emailTemplate(courseAccessGrantedEmailContent({
                      userName: userInfo.name?.split(' ')[0] || 'there',
                      courseName: courseInfo?.title || product.name,
                      courseUrl: `https://shortcircuit-2t9.pages.dev/course/${product.courseId.replace('-course', '')}/`,
                      orderNumber: session.id.slice(-8).toUpperCase(),
                    })),
                  }).catch(err => console.error('Failed to send course access email:', err))
                }
              } catch (accessError) {
                console.error('Failed to grant course access:', accessError)
              }
            }
            
            // For guest purchases, we'll grant access when they create an account
            // The order is linked to their email, so we can match it later
          }
        }

        console.log('Order created:', orderId)

        // Send order confirmation email
        const customerEmail = session.customer_details?.email
        if (customerEmail) {
          const orderItems = items.map((item: any) => {
            const product = PRODUCTS[item.id]
            return {
              name: product?.name || item.id,
              quantity: item.quantity,
              price: (product?.price || 0) * item.quantity,
            }
          })

          const shippingCost = (session.amount_total || 0) - subtotal

          sendEmail(c.env.RESEND_API_KEY, {
            to: customerEmail,
            subject: `Order Confirmed - #${session.id.slice(-8).toUpperCase()}`,
            html: emailTemplate(orderConfirmationEmailContent({
              orderNumber: session.id.slice(-8).toUpperCase(),
              customerName: session.customer_details?.name || '',
              items: orderItems,
              subtotal: subtotal,
              shipping: shippingCost,
              total: session.amount_total || 0,
              shippingAddress: session.shipping_details?.address ? {
                name: session.shipping_details?.name || '',
                line1: session.shipping_details?.address?.line1 || '',
                line2: session.shipping_details?.address?.line2 || '',
                city: session.shipping_details?.address?.city || '',
                state: session.shipping_details?.address?.state || '',
                postalCode: session.shipping_details?.address?.postal_code || '',
                country: session.shipping_details?.address?.country || 'US',
              } : undefined,
            })),
          }).catch(err => console.error('Failed to send order confirmation email:', err))
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        break
      }
    }

    return c.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return c.json({ error: 'Webhook processing failed' }, 400)
  }
})

// API: Get checkout session details
app.get('/api/checkout/session/:sessionId', async (c) => {
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
  })

  try {
    const sessionId = c.req.param('sessionId')
    
    if (!sessionId || !sessionId.startsWith('cs_')) {
      return c.json({ error: 'Invalid session ID' }, 400)
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer'],
    }) as CheckoutSessionWithShippingDetails

    return c.json({
      id: session.id,
      customerEmail: session.customer_details?.email,
      customerName: session.customer_details?.name,
      amountTotal: session.amount_total,
      amountSubtotal: session.amount_subtotal,
      currency: session.currency,
      paymentStatus: session.payment_status,
      shippingDetails: session.shipping_details,
      lineItems: session.line_items?.data.map(item => ({
        description: item.description,
        quantity: item.quantity,
        amountTotal: item.amount_total,
      })),
    })

  } catch (error) {
    console.error('Session retrieval error:', error)
    return c.json({ error: 'Session not found' }, 404)
  }
})

// ============================================
// EMAIL SUBSCRIPTION & ORDER LOOKUP
// ============================================

const WIX_WEBHOOK_URL = 'https://manage.wix.com/_api/webhook-trigger/report/ad0352bd-0009-4b3c-ac36-c5c62a1b6956/8998f106-04bf-4d78-8e40-74c62cdb8ec6'

app.post('/api/subscribe', async (c) => {
  try {
    const body = await c.req.json()
    const { name, email, productInterest, source } = body as {
      name?: string; email: string; productInterest?: string; source?: string
    }

    if (!email || !email.includes('@')) {
      return c.json({ error: 'Valid email is required' }, 400)
    }

    const fullName = (name || '').trim()
    const nameParts = fullName.split(/\s+/)

    await fetch(WIX_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: nameParts[0] || '',
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
        email: email.trim().toLowerCase(),
        productInterest: productInterest || 'General Updates',
        source: source || 'Website',
        timestamp: new Date().toISOString(),
      }),
    })

    // Send subscription confirmation email
    sendEmail(c.env.RESEND_API_KEY, {
      to: email.trim().toLowerCase(),
      subject: 'You are subscribed to Short Circuit!',
      html: emailTemplate(subscriptionEmailContent(fullName)),
    }).catch(err => console.error('Failed to send subscription email:', err))

    return c.json({ success: true, message: 'Thank you for subscribing!' })

  } catch (error) {
    console.error('Subscribe error:', error)
    return c.json({ error: 'Failed to subscribe' }, 500)
  }
})

app.post('/api/orders/lookup', async (c) => {
  try {
    const body = await c.req.json()
    const { email } = body as { email: string }

    if (!email || !email.includes('@')) {
      return c.json({ error: 'Valid email is required' }, 400)
    }

    // Look up in D1 first
    const result = await c.env.DB.prepare(`
      SELECT o.*, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE u.email = ? OR o.guest_email = ?
      ORDER BY o.created_at DESC
    `).bind(email.toLowerCase(), email.toLowerCase()).all()

    const orders = await Promise.all((result.results || []).map(async (order: any) => {
      const items = await c.env.DB.prepare(
        'SELECT * FROM order_items WHERE order_id = ?'
      ).bind(order.id).all()

      return {
        id: order.id,
        orderNumber: order.stripe_session_id?.slice(-8).toUpperCase() || order.id,
        date: order.created_at,
        status: order.status,
        total: (order.total_cents / 100).toFixed(2),
        items: items.results || []
      }
    }))

    return c.json({ orders, message: `Found ${orders.length} order(s)` })

  } catch (error) {
    console.error('Order lookup error:', error)
    return c.json({ error: 'Failed to look up orders' }, 500)
  }
})

// ============================================
// COURSE API ROUTES
// ============================================

// API: Get user's courses (with access)
app.get('/api/courses', requireAuth, async (c) => {
  const user = c.get('user')!
  
  try {
    const result = await c.env.DB.prepare(`
      SELECT c.*, ca.granted_at, ca.access_type,
        (SELECT COUNT(*) FROM lesson_progress lp 
         WHERE lp.user_id = ? AND lp.course_id = c.id AND lp.status = 'completed') as completed_lessons
      FROM courses c
      INNER JOIN course_access ca ON c.id = ca.course_id
      WHERE ca.user_id = ? AND c.is_published = 1
      ORDER BY ca.granted_at DESC
    `).bind(user.id, user.id).all()

    return c.json({ courses: result.results || [] })
  } catch (error) {
    console.error('Courses fetch error:', error)
    return c.json({ error: 'Failed to fetch courses' }, 500)
  }
})

// API: Get course details with modules and lessons
app.get('/api/courses/:courseId', requireAuth, async (c) => {
  const user = c.get('user')!
  const courseId = c.req.param('courseId')

  try {
    // Check access
    const access = await c.env.DB.prepare(
      'SELECT * FROM course_access WHERE user_id = ? AND course_id = ?'
    ).bind(user.id, courseId).first()

    if (!access && user.role !== 'admin') {
      return c.json({ error: 'You do not have access to this course' }, 403)
    }

    // Get course
    const course = await c.env.DB.prepare(
      'SELECT * FROM courses WHERE id = ? AND is_published = 1'
    ).bind(courseId).first()

    if (!course) {
      return c.json({ error: 'Course not found' }, 404)
    }

    // Get modules
    const modules = await c.env.DB.prepare(
      'SELECT * FROM course_modules WHERE course_id = ? AND is_published = 1 ORDER BY order_index'
    ).bind(courseId).all()

    // Get lessons with progress
    const modulesWithLessons = await Promise.all((modules.results || []).map(async (mod: any) => {
      const lessons = await c.env.DB.prepare(`
        SELECT l.*, 
          lp.status as progress_status, 
          lp.video_progress_seconds,
          lp.completed_at
        FROM lessons l
        LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = ?
        WHERE l.module_id = ? AND l.is_published = 1
        ORDER BY l.order_index
      `).bind(user.id, mod.id).all()

      return {
        ...mod,
        lessons: (lessons.results || []).map((lesson: any) => ({
          ...lesson,
          content_json: lesson.content_json ? JSON.parse(lesson.content_json) : null
        }))
      }
    }))

    return c.json({ 
      course,
      modules: modulesWithLessons
    })

  } catch (error) {
    console.error('Course fetch error:', error)
    return c.json({ error: 'Failed to fetch course' }, 500)
  }
})

// API: Get single lesson
app.get('/api/courses/:courseId/lessons/:lessonId', requireAuth, async (c) => {
  const user = c.get('user')!
  const courseId = c.req.param('courseId')
  const lessonId = c.req.param('lessonId')

  try {
    // Check access
    const access = await c.env.DB.prepare(
      'SELECT * FROM course_access WHERE user_id = ? AND course_id = ?'
    ).bind(user.id, courseId).first()

    if (!access && user.role !== 'admin') {
      return c.json({ error: 'You do not have access to this course' }, 403)
    }

    // Get lesson
    const lesson = await c.env.DB.prepare(`
      SELECT l.*, m.title as module_title, m.order_index as module_order,
        lp.status as progress_status, lp.video_progress_seconds, lp.completed_at
      FROM lessons l
      INNER JOIN course_modules m ON l.module_id = m.id
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = ?
      WHERE l.id = ? AND l.course_id = ?
    `).bind(user.id, lessonId, courseId).first<any>()

    if (!lesson) {
      return c.json({ error: 'Lesson not found' }, 404)
    }

    // Parse content JSON
    lesson.content_json = lesson.content_json ? JSON.parse(lesson.content_json) : null

    // Get quiz questions if quiz lesson
    if (lesson.content_type === 'quiz') {
      const questions = await c.env.DB.prepare(
        'SELECT * FROM quiz_questions WHERE lesson_id = ? ORDER BY order_index'
      ).bind(lessonId).all()

      lesson.questions = (questions.results || []).map((q: any) => ({
        ...q,
        options_json: JSON.parse(q.options_json),
        // Include correct_answer for instant feedback mode
        correct_answer: q.correct_answer
      }))
    }

    // Get next and previous lessons
    const adjacent = await c.env.DB.prepare(`
      SELECT id, title, content_type FROM lessons 
      WHERE course_id = ? AND is_published = 1
      ORDER BY (SELECT order_index FROM course_modules WHERE id = lessons.module_id), order_index
    `).bind(courseId).all()

    const lessonIds = (adjacent.results || []).map((l: any) => l.id)
    const currentIndex = lessonIds.indexOf(lessonId)

    lesson.previousLesson = currentIndex > 0 ? adjacent.results![currentIndex - 1] : null
    lesson.nextLesson = currentIndex < lessonIds.length - 1 ? adjacent.results![currentIndex + 1] : null

    return c.json({ lesson })

  } catch (error) {
    console.error('Lesson fetch error:', error)
    return c.json({ error: 'Failed to fetch lesson' }, 500)
  }
})

// API: Save lesson progress
app.post('/api/course/progress', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json()
    const { lessonId, courseId, status, videoProgressSeconds } = body as {
      lessonId: string
      courseId: string
      status: 'in_progress' | 'completed'
      videoProgressSeconds?: number
    }

    if (!lessonId || !courseId || !status) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Upsert progress
    const existing = await c.env.DB.prepare(
      'SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_id = ?'
    ).bind(user.id, lessonId).first()

    if (existing) {
      await c.env.DB.prepare(`
        UPDATE lesson_progress SET 
          status = ?,
          video_progress_seconds = COALESCE(?, video_progress_seconds),
          completed_at = CASE WHEN ? = 'completed' THEN datetime('now') ELSE completed_at END,
          last_accessed_at = datetime('now')
        WHERE user_id = ? AND lesson_id = ?
      `).bind(status, videoProgressSeconds || null, status, user.id, lessonId).run()
    } else {
      await c.env.DB.prepare(`
        INSERT INTO lesson_progress (user_id, lesson_id, course_id, status, video_progress_seconds, completed_at)
        VALUES (?, ?, ?, ?, ?, CASE WHEN ? = 'completed' THEN datetime('now') ELSE NULL END)
      `).bind(user.id, lessonId, courseId, status, videoProgressSeconds || 0, status).run()
    }

    return c.json({ success: true })

  } catch (error) {
    console.error('Progress save error:', error)
    return c.json({ error: 'Failed to save progress' }, 500)
  }
})

// API: Submit quiz answers
app.post('/api/course/quiz', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json()
    const { lessonId, courseId, answers } = body as {
      lessonId: string
      courseId: string
      answers: number[]
    }

    if (!lessonId || !courseId || !answers) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Get questions with correct answers
    const questions = await c.env.DB.prepare(
      'SELECT id, correct_answer, points, explanation FROM quiz_questions WHERE lesson_id = ? ORDER BY order_index'
    ).bind(lessonId).all()

    if (!questions.results || questions.results.length === 0) {
      return c.json({ error: 'Quiz not found' }, 404)
    }

    // Grade quiz
    let score = 0
    let maxScore = 0
    const results: any[] = []

    questions.results.forEach((q: any, index: number) => {
      const userAnswer = answers[index]
      const questionOptions = JSON.parse(q.options_json || '[]')
      const correctAnswerText = q.correct_answer
      const correctIndex = questionOptions.indexOf(correctAnswerText)
      const isCorrect = userAnswer === correctIndex

      if (isCorrect) {
        score += q.points || 1
      }
      maxScore += q.points || 1

      results.push({
        questionId: q.id,
        correct: isCorrect,
        userAnswer,
        correctAnswer: correctIndex,
        explanation: q.explanation
      })
    })

    const percentage = Math.round((score / maxScore) * 100)
    
    // Get passing score from lesson content
    const lesson = await c.env.DB.prepare(
      'SELECT content_json FROM lessons WHERE id = ?'
    ).bind(lessonId).first<{ content_json: string }>()
    
    const lessonContent = lesson?.content_json ? JSON.parse(lesson.content_json) : {}
    const passingScore = lessonContent.passing_score || 70
    const passed = percentage >= passingScore

    // Save attempt
    await c.env.DB.prepare(`
      INSERT INTO quiz_attempts (user_id, lesson_id, course_id, score, max_score, percentage, passed, answers_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(user.id, lessonId, courseId, score, maxScore, percentage, passed ? 1 : 0, JSON.stringify(answers)).run()

    // Mark lesson as completed if passed
    if (passed) {
      await c.env.DB.prepare(`
        INSERT OR REPLACE INTO lesson_progress (user_id, lesson_id, course_id, status, completed_at)
        VALUES (?, ?, ?, 'completed', datetime('now'))
      `).bind(user.id, lessonId, courseId).run()
      
      // Check for module completion and send email if needed
      await checkModuleCompletion(c.env.DB, c.env.RESEND_API_KEY, user.id, courseId, lessonId)
    }

    return c.json({
      score,
      maxScore,
      percentage,
      passed,
      passingScore,
      results
    })

  } catch (error) {
    console.error('Quiz submit error:', error)
    return c.json({ error: 'Failed to submit quiz' }, 500)
  }
})

// API: Get quiz attempts
app.get('/api/course/quiz/:lessonId/attempts', requireAuth, async (c) => {
  const user = c.get('user')!
  const lessonId = c.req.param('lessonId')

  try {
    const attempts = await c.env.DB.prepare(
      'SELECT * FROM quiz_attempts WHERE user_id = ? AND lesson_id = ? ORDER BY attempted_at DESC'
    ).bind(user.id, lessonId).all()

    return c.json({ attempts: attempts.results || [] })

  } catch (error) {
    console.error('Quiz attempts fetch error:', error)
    return c.json({ error: 'Failed to fetch attempts' }, 500)
  }
})

// API: Upload file to R2
app.post('/api/upload', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const formData = await c.req.formData()
    const fileEntry = formData.get('file')

    if (!fileEntry || typeof fileEntry === 'string') {
      return c.json({ error: 'No file provided' }, 400)
    }

    const file = fileEntry as unknown as File

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only images are allowed.' }, 400)
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'File too large. Maximum size is 10MB.' }, 400)
    }

    // Generate unique key
    const timestamp = Date.now()
    const randomId = crypto.randomUUID().slice(0, 8)
    const extension = file.name.split('.').pop() || 'jpg'
    const key = `submissions/${user.id}/${timestamp}-${randomId}.${extension}`

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer()
    await c.env.R2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    })

    // Return public URL (assuming R2 bucket has public access configured)
    const url = `/uploads/${key}`

    return c.json({ success: true, url, key })

  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Failed to upload file' }, 500)
  }
})

// API: Submit checkpoint/submission
app.post('/api/course/submission', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json()
    const { lessonId, courseId, photoUrls, videoUrl, description } = body as {
      lessonId: string
      courseId: string
      photoUrls?: string[]
      videoUrl?: string
      description: string
    }

    if (!lessonId || !courseId || !description) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Create submission
    await c.env.DB.prepare(`
      INSERT INTO submissions (user_id, lesson_id, course_id, photo_urls, video_url, description, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      user.id, 
      lessonId, 
      courseId, 
      photoUrls ? JSON.stringify(photoUrls) : null,
      videoUrl || null,
      description
    ).run()

    // Mark lesson as in_progress
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO lesson_progress (user_id, lesson_id, course_id, status, last_accessed_at)
      VALUES (?, ?, ?, 'in_progress', datetime('now'))
    `).bind(user.id, lessonId, courseId).run()

    return c.json({ success: true, message: 'Submission received' })

  } catch (error) {
    console.error('Submission error:', error)
    return c.json({ error: 'Failed to submit' }, 500)
  }
})

// API: Get user's submissions
app.get('/api/course/submissions', requireAuth, async (c) => {
  const user = c.get('user')!
  const lessonId = c.req.query('lessonId')
  const courseId = c.req.query('courseId')

  try {
    let query = 'SELECT * FROM submissions WHERE user_id = ?'
    const params: any[] = [user.id]

    if (lessonId) {
      query += ' AND lesson_id = ?'
      params.push(lessonId)
    }
    if (courseId) {
      query += ' AND course_id = ?'
      params.push(courseId)
    }

    query += ' ORDER BY submitted_at DESC'

    const submissions = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ submissions: submissions.results || [] })

  } catch (error) {
    console.error('Submissions fetch error:', error)
    return c.json({ error: 'Failed to fetch submissions' }, 500)
  }
})

// API: Submit Final Project (with email notification)
app.post('/api/course/final-project', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json()
    const { lessonId, courseId, fileUrls, videoUrl, description } = body as {
      lessonId: string
      courseId: string
      fileUrls?: string[]
      videoUrl: string
      description: string
    }

    if (!lessonId || !courseId || !videoUrl || !description) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    if (description.length < 100) {
      return c.json({ error: 'Description must be at least 100 characters' }, 400)
    }

    // Get course title
    const course = await c.env.DB.prepare('SELECT title FROM courses WHERE id = ?').bind(courseId).first<{title: string}>()
    const courseTitle = course?.title || courseId

    // Create submission
    const submissionResult = await c.env.DB.prepare(`
      INSERT INTO submissions (user_id, lesson_id, course_id, photo_urls, video_url, description, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      user.id, 
      lessonId, 
      courseId, 
      fileUrls ? JSON.stringify(fileUrls) : null,
      videoUrl,
      description
    ).run()
    
    const submissionId = submissionResult.meta.last_row_id

    // Mark lesson as in_progress
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO lesson_progress (user_id, lesson_id, course_id, status, last_accessed_at)
      VALUES (?, ?, ?, 'in_progress', datetime('now'))
    `).bind(user.id, lessonId, courseId).run()
    
    // Log submission
    await logAccess(c.env.DB, user.id, courseId, 'final_submission', {
      submission_id: submissionId,
      lesson_id: lessonId
    }, c.req.raw)
    
    const submissionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })

    // Send confirmation email to student
    sendEmail(c.env.RESEND_API_KEY, {
      to: user.email,
      subject: `We received your Final Project Submission! - ${courseTitle}`,
      html: emailTemplate(submissionReceivedEmailContent({
        userName: user.name?.split(' ')[0] || 'there',
        courseName: courseTitle,
        submissionId: String(submissionId),
        submissionDate: submissionDate,
      })),
    }).catch(err => console.error('Failed to send submission confirmation email:', err))

    // Send notification email to admin
    sendEmail(c.env.RESEND_API_KEY, {
      to: SUPPORT_EMAIL,
      subject: `[Admin] New Final Project Submission from ${user.name || user.email}`,
      html: emailTemplate(adminNewSubmissionEmailContent({
        userName: user.name || 'Unknown',
        userEmail: user.email,
        courseName: courseTitle,
        submissionId: String(submissionId),
        submissionDate: submissionDate,
        adminReviewUrl: 'https://shortcircuit-2t9.pages.dev/admin/',
      })),
    }).catch(err => console.error('Failed to send admin notification email:', err))

    return c.json({ success: true, message: 'Final project submitted successfully', submissionId })

  } catch (error) {
    console.error('Final project submission error:', error)
    return c.json({ error: 'Failed to submit final project' }, 500)
  }
})

// ============================================
// COURSE Q&A BOARD API ENDPOINTS
// ============================================

// API: Get Q&A questions for a course
app.get('/api/courses/:courseId/qa', requireAuth, async (c) => {
  const user = c.get('user')!
  const courseId = c.req.param('courseId')

  try {
    // Check access
    const access = await c.env.DB.prepare(
      'SELECT * FROM course_access WHERE user_id = ? AND course_id = ?'
    ).bind(user.id, courseId).first()

    if (!access && user.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403)
    }

    // Get questions with author info and answer count
    const questions = await c.env.DB.prepare(`
      SELECT 
        lc.id,
        lc.content as question,
        lc.created_at,
        u.name as author_name,
        u.email as author_email,
        cm.title as module_title,
        (SELECT COUNT(*) FROM lesson_comments WHERE parent_id = lc.id) as answer_count,
        (lc.user_id = ?) as is_author,
        (SELECT COUNT(*) > 0 FROM lesson_comments WHERE parent_id = lc.id AND user_id IN (SELECT id FROM users WHERE role = 'admin')) as is_answered
      FROM lesson_comments lc
      LEFT JOIN users u ON lc.user_id = u.id
      LEFT JOIN course_modules cm ON lc.lesson_id = cm.id
      WHERE lc.course_id = ? AND lc.parent_id IS NULL
      ORDER BY lc.is_pinned DESC, lc.created_at DESC
      LIMIT 100
    `).bind(user.id, courseId).all()

    return c.json({ questions: questions.results || [] })

  } catch (error) {
    console.error('Q&A fetch error:', error)
    return c.json({ error: 'Failed to fetch Q&A' }, 500)
  }
})

// API: Post a Q&A question
app.post('/api/courses/:courseId/qa', requireAuth, async (c) => {
  const user = c.get('user')!
  const courseId = c.req.param('courseId')

  try {
    const body = await c.req.json()
    const { question, moduleId } = body as {
      question: string
      moduleId?: string
    }

    if (!question || question.trim().length < 10) {
      return c.json({ error: 'Question must be at least 10 characters' }, 400)
    }

    // Check access
    const access = await c.env.DB.prepare(
      'SELECT * FROM course_access WHERE user_id = ? AND course_id = ?'
    ).bind(user.id, courseId).first()

    if (!access && user.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403)
    }

    // Insert question (using lesson_comments table with moduleId as lesson_id for Q&A)
    await c.env.DB.prepare(`
      INSERT INTO lesson_comments (user_id, lesson_id, course_id, content, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(user.id, moduleId || 'general', courseId, question.trim()).run()

    return c.json({ success: true, message: 'Question posted' })

  } catch (error) {
    console.error('Q&A post error:', error)
    return c.json({ error: 'Failed to post question' }, 500)
  }
})

// ============================================
// COMMENTS & REVIEWS API ENDPOINTS
// ============================================

// API: Get comments for a lesson
app.get('/api/courses/:courseId/lessons/:lessonId/comments', requireAuth, async (c) => {
  const user = c.get('user')!
  const courseId = c.req.param('courseId')
  const lessonId = c.req.param('lessonId')

  try {
    // Check access
    const access = await c.env.DB.prepare(
      'SELECT * FROM course_access WHERE user_id = ? AND course_id = ?'
    ).bind(user.id, courseId).first()

    if (!access && user.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403)
    }

    // Get top-level comments with user info and like status
    const comments = await c.env.DB.prepare(`
      SELECT 
        lc.*,
        u.name as user_name,
        u.email as user_email,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = lc.id) as likes_count,
        (SELECT COUNT(*) > 0 FROM comment_likes WHERE comment_id = lc.id AND user_id = ?) as user_liked,
        (lc.user_id = ?) as is_own_comment
      FROM lesson_comments lc
      LEFT JOIN users u ON lc.user_id = u.id
      WHERE lc.lesson_id = ? AND lc.course_id = ? AND lc.parent_id IS NULL
      ORDER BY lc.is_pinned DESC, lc.created_at DESC
      LIMIT 50
    `).bind(user.id, user.id, lessonId, courseId).all()

    // Get all replies for these comments
    const commentIds = (comments.results || []).map((c: any) => c.id)
    let repliesMap: Record<string, any[]> = {}
    
    if (commentIds.length > 0) {
      const replies = await c.env.DB.prepare(`
        SELECT 
          lc.*,
          u.name as user_name,
          u.email as user_email,
          (SELECT COUNT(*) FROM comment_likes WHERE comment_id = lc.id) as likes_count,
          (SELECT COUNT(*) > 0 FROM comment_likes WHERE comment_id = lc.id AND user_id = ?) as user_liked,
          (lc.user_id = ?) as is_own_comment
        FROM lesson_comments lc
        LEFT JOIN users u ON lc.user_id = u.id
        WHERE lc.lesson_id = ? AND lc.course_id = ? AND lc.parent_id IS NOT NULL
        ORDER BY lc.created_at ASC
      `).bind(user.id, user.id, lessonId, courseId).all()
      
      // Group replies by parent_id
      for (const reply of (replies.results || [])) {
        const parentId = (reply as any).parent_id
        if (!repliesMap[parentId]) {
          repliesMap[parentId] = []
        }
        repliesMap[parentId].push(reply)
      }
    }

    // Attach replies to their parent comments
    const commentsWithReplies = (comments.results || []).map((comment: any) => ({
      ...comment,
      replies: repliesMap[comment.id] || []
    }))

    return c.json({ comments: commentsWithReplies })

  } catch (error) {
    console.error('Comments fetch error:', error)
    return c.json({ error: 'Failed to fetch comments' }, 500)
  }
})

// API: Post a comment on a lesson
app.post('/api/courses/:courseId/lessons/:lessonId/comments', requireAuth, async (c) => {
  const user = c.get('user')!
  const courseId = c.req.param('courseId')
  const lessonId = c.req.param('lessonId')

  try {
    const body = await c.req.json()
    const { content, parentId } = body as { content: string; parentId?: string }

    if (!content || content.trim().length === 0) {
      return c.json({ error: 'Comment content is required' }, 400)
    }

    if (content.length > 2000) {
      return c.json({ error: 'Comment is too long (max 2000 characters)' }, 400)
    }

    // Check access
    const access = await c.env.DB.prepare(
      'SELECT * FROM course_access WHERE user_id = ? AND course_id = ?'
    ).bind(user.id, courseId).first()

    if (!access && user.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403)
    }

    // Check if user is an admin/instructor
    const adminEmails = (c.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
    const isInstructor = adminEmails.includes(user.email.toLowerCase())

    // Create comment
    const commentId = crypto.randomUUID()
    await c.env.DB.prepare(`
      INSERT INTO lesson_comments (id, lesson_id, course_id, user_id, parent_id, content, is_instructor_reply)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(commentId, lessonId, courseId, user.id, parentId || null, content.trim(), isInstructor ? 1 : 0).run()

    // Return the created comment with user info
    const comment = {
      id: commentId,
      lesson_id: lessonId,
      course_id: courseId,
      user_id: user.id,
      user_name: user.name || user.email.split('@')[0],
      parent_id: parentId || null,
      content: content.trim(),
      is_pinned: 0,
      is_instructor_reply: isInstructor ? 1 : 0,
      likes_count: 0,
      user_liked: false,
      is_own_comment: 1,  // User just created this comment, so it's their own
      created_at: new Date().toISOString()
    }

    return c.json({ comment })

  } catch (error) {
    console.error('Comment post error:', error)
    return c.json({ error: 'Failed to post comment' }, 500)
  }
})

// API: Toggle comment like
app.post('/api/comments/:commentId/like', requireAuth, async (c) => {
  const user = c.get('user')!
  const commentId = c.req.param('commentId')

  try {
    // Check if already liked
    const existing = await c.env.DB.prepare(
      'SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?'
    ).bind(commentId, user.id).first()

    if (existing) {
      // Unlike
      await c.env.DB.prepare(
        'DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?'
      ).bind(commentId, user.id).run()
    } else {
      // Like
      const likeId = crypto.randomUUID()
      await c.env.DB.prepare(
        'INSERT INTO comment_likes (id, comment_id, user_id) VALUES (?, ?, ?)'
      ).bind(likeId, commentId, user.id).run()
    }

    // Get updated count
    const count = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?'
    ).bind(commentId).first<{ count: number }>()

    return c.json({ 
      likes_count: count?.count || 0,
      user_liked: !existing
    })

  } catch (error) {
    console.error('Comment like error:', error)
    return c.json({ error: 'Failed to toggle like' }, 500)
  }
})

// API: Delete a comment
app.delete('/api/comments/:commentId', requireAuth, async (c) => {
  const user = c.get('user')!
  const commentId = c.req.param('commentId')

  try {
    // Check if user owns this comment or is admin
    const comment = await c.env.DB.prepare(
      'SELECT * FROM lesson_comments WHERE id = ?'
    ).bind(commentId).first<{ user_id: number }>()

    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404)
    }

    const adminEmails = (c.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
    const isAdmin = adminEmails.includes(user.email.toLowerCase())

    if (comment.user_id !== user.id && !isAdmin) {
      return c.json({ error: 'Not authorized to delete this comment' }, 403)
    }

    // Delete associated likes first
    await c.env.DB.prepare(
      'DELETE FROM comment_likes WHERE comment_id = ?'
    ).bind(commentId).run()

    // Delete the comment
    await c.env.DB.prepare(
      'DELETE FROM lesson_comments WHERE id = ?'
    ).bind(commentId).run()

    return c.json({ success: true })

  } catch (error) {
    console.error('Comment delete error:', error)
    return c.json({ error: 'Failed to delete comment' }, 500)
  }
})

// API: Get reviews for a module
app.get('/api/courses/:courseId/modules/:moduleId/reviews', requireAuth, async (c) => {
  const user = c.get('user')!
  const courseId = c.req.param('courseId')
  const moduleId = c.req.param('moduleId')

  try {
    // Check access
    const access = await c.env.DB.prepare(
      'SELECT * FROM course_access WHERE user_id = ? AND course_id = ?'
    ).bind(user.id, courseId).first()

    if (!access && user.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403)
    }

    // Get reviews with user info
    const reviews = await c.env.DB.prepare(`
      SELECT 
        mr.*,
        u.name as user_name,
        u.email as user_email,
        (SELECT COUNT(*) FROM review_helpful_votes WHERE review_id = mr.id) as helpful_count,
        (SELECT COUNT(*) > 0 FROM review_helpful_votes WHERE review_id = mr.id AND user_id = ?) as user_found_helpful
      FROM module_reviews mr
      LEFT JOIN users u ON mr.user_id = u.id
      WHERE mr.module_id = ? AND mr.course_id = ?
      ORDER BY mr.helpful_count DESC, mr.created_at DESC
      LIMIT 50
    `).bind(user.id, moduleId, courseId).all()

    return c.json({ reviews: reviews.results || [] })

  } catch (error) {
    console.error('Reviews fetch error:', error)
    return c.json({ error: 'Failed to fetch reviews' }, 500)
  }
})

// API: Post a review for a module
app.post('/api/courses/:courseId/modules/:moduleId/reviews', requireAuth, async (c) => {
  const user = c.get('user')!
  const courseId = c.req.param('courseId')
  const moduleId = c.req.param('moduleId')

  try {
    const body = await c.req.json()
    const { rating, title, content } = body as { rating: number; title?: string; content?: string }

    if (!rating || rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400)
    }

    // Check access
    const access = await c.env.DB.prepare(
      'SELECT * FROM course_access WHERE user_id = ? AND course_id = ?'
    ).bind(user.id, courseId).first()

    if (!access && user.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403)
    }

    // Check if user already reviewed this module
    const existingReview = await c.env.DB.prepare(
      'SELECT id FROM module_reviews WHERE module_id = ? AND user_id = ?'
    ).bind(moduleId, user.id).first()

    if (existingReview) {
      // Update existing review
      await c.env.DB.prepare(`
        UPDATE module_reviews 
        SET rating = ?, title = ?, content = ?, updated_at = datetime('now')
        WHERE module_id = ? AND user_id = ?
      `).bind(rating, title || null, content || null, moduleId, user.id).run()

      return c.json({ 
        review: {
          id: existingReview.id,
          module_id: moduleId,
          course_id: courseId,
          user_id: user.id,
          user_name: user.name || user.email.split('@')[0],
          rating,
          title: title || null,
          content: content || null,
          is_verified_completion: 0,
          helpful_count: 0,
          user_found_helpful: false,
          created_at: new Date().toISOString()
        },
        updated: true
      })
    }

    // Check if user has completed the module (for verified badge)
    const moduleProgress = await c.env.DB.prepare(`
      SELECT COUNT(*) as completed
      FROM lessons l
      INNER JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = ?
      WHERE l.module_id = ? AND lp.status = 'completed'
    `).bind(user.id, moduleId).first<{ completed: number }>()

    const totalLessons = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM lessons WHERE module_id = ? AND is_published = 1'
    ).bind(moduleId).first<{ total: number }>()

    const completedLessonCount = Number(moduleProgress?.completed ?? 0)
    const totalLessonCount = Number(totalLessons?.total ?? 0)
    const isVerified = totalLessonCount > 0 && completedLessonCount === totalLessonCount

    // Create new review
    const reviewId = crypto.randomUUID()
    await c.env.DB.prepare(`
      INSERT INTO module_reviews (id, module_id, course_id, user_id, rating, title, content, is_verified_completion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(reviewId, moduleId, courseId, user.id, rating, title || null, content || null, isVerified ? 1 : 0).run()

    return c.json({ 
      review: {
        id: reviewId,
        module_id: moduleId,
        course_id: courseId,
        user_id: user.id,
        user_name: user.name || user.email.split('@')[0],
        rating,
        title: title || null,
        content: content || null,
        is_verified_completion: isVerified ? 1 : 0,
        helpful_count: 0,
        user_found_helpful: false,
        created_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Review post error:', error)
    return c.json({ error: 'Failed to post review' }, 500)
  }
})

// API: Mark review as helpful
app.post('/api/reviews/:reviewId/helpful', requireAuth, async (c) => {
  const user = c.get('user')!
  const reviewId = c.req.param('reviewId')

  try {
    // Check if already marked
    const existing = await c.env.DB.prepare(
      'SELECT id FROM review_helpful_votes WHERE review_id = ? AND user_id = ?'
    ).bind(reviewId, user.id).first()

    if (existing) {
      // Remove vote
      await c.env.DB.prepare(
        'DELETE FROM review_helpful_votes WHERE review_id = ? AND user_id = ?'
      ).bind(reviewId, user.id).run()
    } else {
      // Add vote
      const voteId = crypto.randomUUID()
      await c.env.DB.prepare(
        'INSERT INTO review_helpful_votes (id, review_id, user_id) VALUES (?, ?, ?)'
      ).bind(voteId, reviewId, user.id).run()
    }

    // Get updated count
    const count = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM review_helpful_votes WHERE review_id = ?'
    ).bind(reviewId).first<{ count: number }>()

    return c.json({ 
      helpful_count: count?.count || 0,
      user_found_helpful: !existing
    })

  } catch (error) {
    console.error('Review helpful error:', error)
    return c.json({ error: 'Failed to toggle helpful' }, 500)
  }
})

// API: Get course progress summary
app.get('/api/courses/:courseId/progress', requireAuth, async (c) => {
  const user = c.get('user')!
  const courseId = c.req.param('courseId')

  try {
    // Get total lessons
    const totalLessons = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM lessons WHERE course_id = ? AND is_published = 1'
    ).bind(courseId).first<{ count: number }>()

    // Get completed lessons
    const completedLessons = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM lesson_progress WHERE user_id = ? AND course_id = ? AND status = \'completed\''
    ).bind(user.id, courseId).first<{ count: number }>()

    // Get quiz scores
    const quizScores = await c.env.DB.prepare(`
      SELECT lesson_id, MAX(percentage) as best_score, MAX(passed) as passed
      FROM quiz_attempts 
      WHERE user_id = ? AND course_id = ?
      GROUP BY lesson_id
    `).bind(user.id, courseId).all()

    // Get submissions
    const submissions = await c.env.DB.prepare(`
      SELECT lesson_id, status, submitted_at
      FROM submissions 
      WHERE user_id = ? AND course_id = ?
      ORDER BY submitted_at DESC
    `).bind(user.id, courseId).all()

    const total = totalLessons?.count || 1
    const completed = completedLessons?.count || 0
    const percentage = Math.round((completed / total) * 100)

    return c.json({
      totalLessons: total,
      completedLessons: completed,
      progressPercentage: percentage,
      quizScores: quizScores.results || [],
      submissions: submissions.results || []
    })

  } catch (error) {
    console.error('Progress fetch error:', error)
    return c.json({ error: 'Failed to fetch progress' }, 500)
  }
})

// API: Generate certificate
app.post('/api/courses/:courseId/certificate', requireAuth, async (c) => {
  const user = c.get('user')!
  const courseId = c.req.param('courseId')

  if (!courseId) {
    return c.json({ error: 'Course ID is required' }, 400)
  }

  try {
    // Check if course is completed
    const course = await c.env.DB.prepare(
      'SELECT * FROM courses WHERE id = ?'
    ).bind(courseId).first<any>()

    if (!course) {
      return c.json({ error: 'Course not found' }, 404)
    }

    // Get total and completed lessons
    const total = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM lessons WHERE course_id = ? AND is_published = 1'
    ).bind(courseId).first<{ count: number }>()

    const completed = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM lesson_progress WHERE user_id = ? AND course_id = ? AND status = \'completed\''
    ).bind(user.id, courseId).first<{ count: number }>()

    // Check all submissions are approved
    const pendingSubmissions = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM submissions 
      WHERE user_id = ? AND course_id = ? AND status != 'approved'
    `).bind(user.id, courseId).first<{ count: number }>()

    if ((completed?.count || 0) < (total?.count || 1) || (pendingSubmissions?.count || 0) > 0) {
      return c.json({ 
        error: 'Course not completed. Please complete all lessons and have all submissions approved.' 
      }, 400)
    }

    // Check if certificate already exists
    const existing = await c.env.DB.prepare(
      'SELECT * FROM certificates WHERE user_id = ? AND course_id = ?'
    ).bind(user.id, courseId).first()

    if (existing) {
      return c.json({ certificate: existing })
    }

    // Generate certificate number
    const certNumber = `SC-${courseId.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}-${user.id}`

    // Create certificate
    await c.env.DB.prepare(`
      INSERT INTO certificates (user_id, course_id, certificate_number, recipient_name, course_title, completion_date)
      VALUES (?, ?, ?, ?, ?, date('now'))
    `).bind(user.id, courseId, certNumber, user.name || user.email, course.title).run()

    const certificate = await c.env.DB.prepare(
      'SELECT * FROM certificates WHERE user_id = ? AND course_id = ?'
    ).bind(user.id, courseId).first()

    return c.json({ certificate })

  } catch (error) {
    console.error('Certificate generation error:', error)
    return c.json({ error: 'Failed to generate certificate' }, 500)
  }
})

// API: Get certificate
app.get('/api/certificates/:certNumber', async (c) => {
  const certNumber = c.req.param('certNumber')

  try {
    const certificate = await c.env.DB.prepare(
      'SELECT c.*, co.title as course_title FROM certificates c INNER JOIN courses co ON c.course_id = co.id WHERE c.certificate_number = ?'
    ).bind(certNumber).first()

    if (!certificate) {
      return c.json({ error: 'Certificate not found' }, 404)
    }

    return c.json({ certificate })

  } catch (error) {
    console.error('Certificate fetch error:', error)
    return c.json({ error: 'Failed to fetch certificate' }, 500)
  }
})

// ============================================
// ADMIN COURSE MANAGEMENT
// ============================================

// API: Admin - Get all submissions
app.get('/api/admin/submissions', requireAdmin, async (c) => {
  try {
    const status = c.req.query('status')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')

    let query = `
      SELECT s.*, u.email as user_email, u.name as user_name, 
        l.title as lesson_title, c.title as course_title
      FROM submissions s
      INNER JOIN users u ON s.user_id = u.id
      INNER JOIN lessons l ON s.lesson_id = l.id
      INNER JOIN courses c ON s.course_id = c.id
    `
    const params: any[] = []

    if (status) {
      query += ' WHERE s.status = ?'
      params.push(status)
    }

    query += ' ORDER BY s.submitted_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const result = await c.env.DB.prepare(query).bind(...params).all()

    // Get total
    let countQuery = 'SELECT COUNT(*) as total FROM submissions'
    if (status) {
      countQuery += ' WHERE status = ?'
    }
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...(status ? [status] : []))
      .first<{ total: number }>()

    return c.json({
      submissions: (result.results || []).map((s: any) => ({
        ...s,
        photo_urls: s.photo_urls ? JSON.parse(s.photo_urls) : []
      })),
      total: countResult?.total || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('Admin submissions fetch error:', error)
    return c.json({ error: 'Failed to fetch submissions' }, 500)
  }
})

// API: Admin - Review submission
app.patch('/api/admin/submissions/:id', requireAdmin, async (c) => {
  const adminUser = c.get('user')!

  try {
    const submissionId = c.req.param('id')
    const body = await c.req.json()
    const { status, admin_feedback } = body as {
      status: 'approved' | 'needs_revision' | 'rejected'
      admin_feedback?: string
    }

    if (!status || !['approved', 'needs_revision', 'rejected'].includes(status)) {
      return c.json({ error: 'Valid status is required' }, 400)
    }

    await c.env.DB.prepare(`
      UPDATE submissions SET 
        status = ?, 
        admin_feedback = ?,
        reviewed_by = ?,
        reviewed_at = datetime('now')
      WHERE id = ?
    `).bind(status, admin_feedback || null, adminUser.id, submissionId).run()

    // Get submission details for notifications
    const submission = await c.env.DB.prepare(`
      SELECT s.user_id, s.lesson_id, s.course_id, u.name as user_name, u.email as user_email, c.title as course_title
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN courses c ON s.course_id = c.id
      WHERE s.id = ?
    `).bind(submissionId).first<{ 
      user_id: number; 
      lesson_id: string; 
      course_id: string; 
      user_name: string;
      user_email: string;
      course_title: string;
    }>()

    if (submission) {
      if (status === 'approved') {
        // Mark lesson as completed
        await c.env.DB.prepare(`
          INSERT OR REPLACE INTO lesson_progress (user_id, lesson_id, course_id, status, completed_at)
          VALUES (?, ?, ?, 'completed', datetime('now'))
        `).bind(submission.user_id, submission.lesson_id, submission.course_id).run()
        
        // Check for module/course completion
        const { moduleCompleted, allModulesCompleted } = await checkModuleCompletion(
          c.env.DB, c.env.RESEND_API_KEY, submission.user_id, submission.course_id, submission.lesson_id
        )
        
        // Send approval email
        sendEmail(c.env.RESEND_API_KEY, {
          to: submission.user_email,
          subject: `Your Final Project has been Approved! - ${submission.course_title}`,
          html: emailTemplate(submissionApprovedEmailContent({
            userName: submission.user_name?.split(' ')[0] || 'there',
            courseName: submission.course_title,
            feedback: admin_feedback || 'Great work on your project!',
          })),
        }).catch(err => console.error('Failed to send approval email:', err))
        
        // If all modules completed, issue certificate
        if (allModulesCompleted) {
          // Check if certificate already exists
          const existingCert = await c.env.DB.prepare(
            'SELECT id FROM certificates WHERE user_id = ? AND course_id = ?'
          ).bind(submission.user_id, submission.course_id).first()
          
          if (!existingCert) {
            // Generate certificate number
            const year = new Date().getFullYear()
            const certCount = await c.env.DB.prepare(
              'SELECT COUNT(*) as count FROM certificates WHERE course_id = ?'
            ).bind(submission.course_id).first<{ count: number }>()
            const sequence = (certCount?.count || 0) + 1
            const certificateNumber = generateCertificateNumber(submission.course_id, year, sequence)
            
            const skills = getCourseSkills(submission.course_id)
            const completionDate = new Date().toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            })
            
            // Create certificate record
            await c.env.DB.prepare(`
              INSERT INTO certificates (
                user_id, course_id, certificate_number, recipient_name, course_title,
                completion_date, skills, instructor_name, final_submission_id
              )
              VALUES (?, ?, ?, ?, ?, datetime('now'), ?, 'Anand Seetharaman', ?)
            `).bind(
              submission.user_id,
              submission.course_id,
              certificateNumber,
              submission.user_name,
              submission.course_title,
              JSON.stringify(skills),
              submissionId
            ).run()
            
            // Log certificate issuance
            await logAccess(c.env.DB, submission.user_id, submission.course_id, 'certificate_issued', {
              certificate_number: certificateNumber,
              submission_id: submissionId
            })
            
            // Send certificate email
            const verificationUrl = `https://shortcircuit-2t9.pages.dev/verify/${certificateNumber}`
            const certificateUrl = `https://shortcircuit-2t9.pages.dev/course/${submission.course_id.replace('-course', '')}/certificate.html`
            
            sendEmail(c.env.RESEND_API_KEY, {
              to: submission.user_email,
              subject: `Your Short Circuit Certificate is Ready! - ${submission.course_title}`,
              html: emailTemplate(certificateIssuedEmailContent({
                userName: submission.user_name?.split(' ')[0] || 'there',
                recipientName: submission.user_name,
                courseName: submission.course_title,
                certificateNumber: certificateNumber,
                completionDate: completionDate,
                skills: skills,
                verificationUrl: verificationUrl,
                certificateUrl: certificateUrl,
              })),
            }).catch(err => console.error('Failed to send certificate email:', err))
            
            // Mark certificate email as sent
            await c.env.DB.prepare(
              'UPDATE certificates SET certificate_email_sent = 1 WHERE user_id = ? AND course_id = ?'
            ).bind(submission.user_id, submission.course_id).run()
          }
        }
      } else if (status === 'needs_revision') {
        // Send revision request email
        sendEmail(c.env.RESEND_API_KEY, {
          to: submission.user_email,
          subject: `Your Final Project needs some updates - ${submission.course_title}`,
          html: emailTemplate(submissionNeedsRevisionEmailContent({
            userName: submission.user_name?.split(' ')[0] || 'there',
            courseName: submission.course_title,
            feedback: admin_feedback || 'Please make some adjustments and resubmit.',
            submissionUrl: `https://shortcircuit-2t9.pages.dev/course/${submission.course_id.replace('-course', '')}/submission.html`,
          })),
        }).catch(err => console.error('Failed to send revision email:', err))
      }
    }

    return c.json({ success: true })

  } catch (error) {
    console.error('Admin submission review error:', error)
    return c.json({ error: 'Failed to review submission' }, 500)
  }
})

// API: Admin - Grant course access
app.post('/api/admin/course-access', requireAdmin, async (c) => {
  try {
    const body = await c.req.json()
    const { userId, courseId, accessType } = body as {
      userId: number
      courseId: string
      accessType?: 'purchase' | 'gift' | 'admin'
    }

    if (!userId || !courseId) {
      return c.json({ error: 'userId and courseId are required' }, 400)
    }

    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO course_access (user_id, course_id, access_type, granted_at)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(userId, courseId, accessType || 'admin').run()

    return c.json({ success: true })

  } catch (error) {
    console.error('Grant access error:', error)
    return c.json({ error: 'Failed to grant access' }, 500)
  }
})

// ============================================
// ADMIN ANALYTICS & MANAGEMENT APIs
// ============================================

// API: Admin - Dashboard Analytics
app.get('/api/admin/analytics', requireAdmin, async (c) => {
  try {
    // Get overview stats
    const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>()
    const ordersCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM orders').first<{ count: number }>()
    const revenueResult = await c.env.DB.prepare('SELECT SUM(total_cents) as total FROM orders WHERE status = \'completed\'').first<{ total: number }>()
    const enrollmentsCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM course_access').first<{ count: number }>()
    
    // Pending items
    const pendingSubmissions = await c.env.DB.prepare('SELECT COUNT(*) as count FROM submissions WHERE status = \'pending\'').first<{ count: number }>()
    const pendingOrders = await c.env.DB.prepare('SELECT COUNT(*) as count FROM orders WHERE status = \'pending\'').first<{ count: number }>()
    
    // Recent activity (last 7 days)
    const recentSignups = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= datetime(\'now\', \'-7 days\')'
    ).first<{ count: number }>()
    
    const recentCompletions = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM lesson_progress WHERE status = \'completed\' AND completed_at >= datetime(\'now\', \'-7 days\')'
    ).first<{ count: number }>()
    
    // Course stats
    const courseStats = await c.env.DB.prepare(`
      SELECT 
        c.id,
        c.title,
        COUNT(DISTINCT ca.user_id) as enrolled_count,
        COUNT(DISTINCT CASE WHEN cert.id IS NOT NULL THEN ca.user_id END) as completed_count
      FROM courses c
      LEFT JOIN course_access ca ON c.id = ca.course_id
      LEFT JOIN certificates cert ON c.id = cert.course_id AND ca.user_id = cert.user_id
      WHERE c.is_published = 1
      GROUP BY c.id
    `).all()

    // Recent submissions
    const recentSubmissions = await c.env.DB.prepare(`
      SELECT s.*, u.name as user_name, u.email as user_email, l.title as lesson_title
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN lessons l ON s.lesson_id = l.id
      ORDER BY s.submitted_at DESC
      LIMIT 5
    `).all()

    return c.json({
      overview: {
        totalUsers: usersCount?.count || 0,
        totalOrders: ordersCount?.count || 0,
        totalRevenue: (revenueResult?.total || 0) / 100,
        totalEnrollments: enrollmentsCount?.count || 0
      },
      pending: {
        submissions: pendingSubmissions?.count || 0,
        orders: pendingOrders?.count || 0
      },
      recent: {
        signups: recentSignups?.count || 0,
        completions: recentCompletions?.count || 0
      },
      courses: courseStats.results || [],
      recentSubmissions: (recentSubmissions.results || []).map((s: any) => ({
        ...s,
        photo_urls: s.photo_urls ? JSON.parse(s.photo_urls) : []
      }))
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return c.json({ error: 'Failed to fetch analytics' }, 500)
  }
})

// API: Admin - Get all users with pagination and filters
app.get('/api/admin/users', requireAdmin, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const search = c.req.query('search') || ''
    const role = c.req.query('role') || ''
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        u.*,
        COUNT(DISTINCT ca.course_id) as enrolled_courses,
        COUNT(DISTINCT lp.lesson_id) as completed_lessons,
        COUNT(DISTINCT o.id) as total_orders
      FROM users u
      LEFT JOIN course_access ca ON u.id = ca.user_id
      LEFT JOIN lesson_progress lp ON u.id = lp.user_id AND lp.status = 'completed'
      LEFT JOIN orders o ON u.id = o.user_id
    `
    
    const conditions: string[] = []
    const params: any[] = []

    if (search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    if (role) {
      conditions.push('u.role = ?')
      params.push(role)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const users = await c.env.DB.prepare(query).bind(...params).all()

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users'
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ')
    }
    const countParams = params.slice(0, -2) // Remove limit and offset
    const total = await c.env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>()

    return c.json({
      users: (users.results || []).map((u: any) => ({
        ...u,
        password_hash: undefined // Don't send password
      })),
      total: total?.total || 0,
      page,
      limit,
      totalPages: Math.ceil((total?.total || 0) / limit)
    })

  } catch (error) {
    console.error('Admin users error:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// API: Admin - Get single user details with full activity
app.get('/api/admin/users/:id', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('id')

    const user = await c.env.DB.prepare(`
      SELECT id, email, name, role, email_verified, created_at, updated_at
      FROM users WHERE id = ?
    `).bind(userId).first()

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Get course enrollments with progress
    const enrollments = await c.env.DB.prepare(`
      SELECT 
        ca.*,
        c.title as course_title,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id AND is_published = 1) as total_lessons,
        (SELECT COUNT(*) FROM lesson_progress WHERE user_id = ca.user_id AND course_id = c.id AND status = 'completed') as completed_lessons
      FROM course_access ca
      JOIN courses c ON ca.course_id = c.id
      WHERE ca.user_id = ?
    `).bind(userId).all()

    // Get orders
    const orders = await c.env.DB.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
    `).bind(userId).all()

    // Get submissions
    const submissions = await c.env.DB.prepare(`
      SELECT s.*, l.title as lesson_title, c.title as course_title
      FROM submissions s
      JOIN lessons l ON s.lesson_id = l.id
      JOIN courses c ON s.course_id = c.id
      WHERE s.user_id = ?
      ORDER BY s.submitted_at DESC
      LIMIT 10
    `).bind(userId).all()

    // Get quiz attempts
    const quizAttempts = await c.env.DB.prepare(`
      SELECT qa.*, l.title as lesson_title
      FROM quiz_attempts qa
      JOIN lessons l ON qa.lesson_id = l.id
      WHERE qa.user_id = ?
      ORDER BY qa.attempted_at DESC
      LIMIT 10
    `).bind(userId).all()

    // Get certificates
    const certificates = await c.env.DB.prepare(`
      SELECT * FROM certificates WHERE user_id = ?
    `).bind(userId).all()

    return c.json({
      user,
      enrollments: enrollments.results || [],
      orders: orders.results || [],
      submissions: (submissions.results || []).map((s: any) => ({
        ...s,
        photo_urls: s.photo_urls ? JSON.parse(s.photo_urls) : []
      })),
      quizAttempts: quizAttempts.results || [],
      certificates: certificates.results || []
    })

  } catch (error) {
    console.error('Admin user detail error:', error)
    return c.json({ error: 'Failed to fetch user details' }, 500)
  }
})

// API: Admin - Update user role
app.patch('/api/admin/users/:id/role', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('id')
    const body = await c.req.json()
    const { role } = body as { role: 'customer' | 'admin' }

    if (!role || !['customer', 'admin'].includes(role)) {
      return c.json({ error: 'Valid role is required' }, 400)
    }

    await c.env.DB.prepare(
      'UPDATE users SET role = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(role, userId).run()

    return c.json({ success: true })

  } catch (error) {
    console.error('Update role error:', error)
    return c.json({ error: 'Failed to update role' }, 500)
  }
})

// API: Admin - Revoke course access
app.delete('/api/admin/course-access/:userId/:courseId', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId')
    const courseId = c.req.param('courseId')

    await c.env.DB.prepare(
      'DELETE FROM course_access WHERE user_id = ? AND course_id = ?'
    ).bind(userId, courseId).run()

    return c.json({ success: true })

  } catch (error) {
    console.error('Revoke access error:', error)
    return c.json({ error: 'Failed to revoke access' }, 500)
  }
})

// API: Admin - Get all courses with stats
app.get('/api/admin/courses', requireAdmin, async (c) => {
  try {
    const courses = await c.env.DB.prepare(`
      SELECT 
        c.*,
        COUNT(DISTINCT ca.user_id) as enrolled_count,
        COUNT(DISTINCT cert.user_id) as completed_count,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count,
        (SELECT COUNT(*) FROM submissions WHERE course_id = c.id AND status = 'pending') as pending_submissions
      FROM courses c
      LEFT JOIN course_access ca ON c.id = ca.course_id
      LEFT JOIN certificates cert ON c.id = cert.course_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `).all()

    return c.json({ courses: courses.results || [] })

  } catch (error) {
    console.error('Admin courses error:', error)
    return c.json({ error: 'Failed to fetch courses' }, 500)
  }
})

// API: Admin - Get course enrollments
app.get('/api/admin/courses/:courseId/enrollments', requireAdmin, async (c) => {
  try {
    const courseId = c.req.param('courseId')
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = (page - 1) * limit

    const enrollments = await c.env.DB.prepare(`
      SELECT 
        ca.*,
        u.name as user_name,
        u.email as user_email,
        (SELECT COUNT(*) FROM lesson_progress WHERE user_id = ca.user_id AND course_id = ca.course_id AND status = 'completed') as completed_lessons,
        (SELECT COUNT(*) FROM lessons WHERE course_id = ca.course_id AND is_published = 1) as total_lessons,
        cert.certificate_number,
        cert.issued_at as certificate_issued_at
      FROM course_access ca
      JOIN users u ON ca.user_id = u.id
      LEFT JOIN certificates cert ON ca.user_id = cert.user_id AND ca.course_id = cert.course_id
      WHERE ca.course_id = ?
      ORDER BY ca.granted_at DESC
      LIMIT ? OFFSET ?
    `).bind(courseId, limit, offset).all()

    const total = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM course_access WHERE course_id = ?'
    ).bind(courseId).first<{ count: number }>()

    return c.json({
      enrollments: enrollments.results || [],
      total: total?.count || 0,
      page,
      limit
    })

  } catch (error) {
    console.error('Course enrollments error:', error)
    return c.json({ error: 'Failed to fetch enrollments' }, 500)
  }
})

// API: Admin - Export data (CSV format)
app.get('/api/admin/export/:type', requireAdmin, async (c) => {
  try {
    const type = c.req.param('type')
    let data: any[] = []
    let headers: string[] = []

    switch (type) {
      case 'users':
        const users = await c.env.DB.prepare(
          'SELECT id, email, name, role, email_verified, created_at FROM users ORDER BY created_at DESC'
        ).all()
        data = users.results || []
        headers = ['ID', 'Email', 'Name', 'Role', 'Email Verified', 'Created At']
        break

      case 'enrollments':
        const enrollments = await c.env.DB.prepare(`
          SELECT ca.user_id, u.email, u.name, ca.course_id, c.title as course_title, ca.access_type, ca.granted_at
          FROM course_access ca
          JOIN users u ON ca.user_id = u.id
          JOIN courses c ON ca.course_id = c.id
          ORDER BY ca.granted_at DESC
        `).all()
        data = enrollments.results || []
        headers = ['User ID', 'Email', 'Name', 'Course ID', 'Course Title', 'Access Type', 'Granted At']
        break

      case 'submissions':
        const submissions = await c.env.DB.prepare(`
          SELECT s.id, u.email, u.name, l.title as lesson_title, c.title as course_title, s.status, s.submitted_at, s.reviewed_at
          FROM submissions s
          JOIN users u ON s.user_id = u.id
          JOIN lessons l ON s.lesson_id = l.id
          JOIN courses c ON s.course_id = c.id
          ORDER BY s.submitted_at DESC
        `).all()
        data = submissions.results || []
        headers = ['ID', 'Email', 'Name', 'Lesson', 'Course', 'Status', 'Submitted At', 'Reviewed At']
        break

      default:
        return c.json({ error: 'Invalid export type' }, 400)
    }

    // Convert to CSV
    const csv = [
      headers.join(','),
      ...data.map(row => Object.values(row).map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}_export_${Date.now()}.csv"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return c.json({ error: 'Failed to export data' }, 500)
  }
})

// ============================================
// USER DASHBOARD APIs
// ============================================

// API: Get user's enrolled courses with detailed progress
app.get('/api/my/courses', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const courses = await c.env.DB.prepare(`
      SELECT 
        c.*,
        ca.granted_at,
        ca.access_type,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id AND is_published = 1) as total_lessons,
        (SELECT COUNT(*) FROM lesson_progress WHERE user_id = ? AND course_id = c.id AND status = 'completed') as completed_lessons,
        (SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = c.id ORDER BY last_accessed_at DESC LIMIT 1) as last_lesson_id,
        cert.certificate_number,
        cert.issued_at as certificate_issued_at
      FROM courses c
      JOIN course_access ca ON c.id = ca.course_id
      LEFT JOIN certificates cert ON c.id = cert.course_id AND cert.user_id = ?
      WHERE ca.user_id = ? AND c.is_published = 1
      ORDER BY ca.granted_at DESC
    `).bind(user.id, user.id, user.id, user.id).all()

    // Get last accessed lesson titles
    const coursesWithDetails = await Promise.all((courses.results || []).map(async (course: any) => {
      let lastLessonTitle = null
      let nextLessonId = null
      let nextLessonTitle = null

      if (course.last_lesson_id) {
        const lastLesson = await c.env.DB.prepare(
          'SELECT title FROM lessons WHERE id = ?'
        ).bind(course.last_lesson_id).first<{ title: string }>()
        lastLessonTitle = lastLesson?.title
      }

      // Find next uncompleted lesson
      const nextLesson = await c.env.DB.prepare(`
        SELECT l.id, l.title FROM lessons l
        LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = ?
        WHERE l.course_id = ? AND l.is_published = 1 AND (lp.status IS NULL OR lp.status != 'completed')
        ORDER BY (SELECT order_index FROM course_modules WHERE id = l.module_id), l.order_index
        LIMIT 1
      `).bind(user.id, course.id).first<{ id: string; title: string }>()

      if (nextLesson) {
        nextLessonId = nextLesson.id
        nextLessonTitle = nextLesson.title
      }

      return {
        ...course,
        lastLessonTitle,
        nextLessonId,
        nextLessonTitle,
        progressPercent: course.total_lessons > 0 
          ? Math.round((course.completed_lessons / course.total_lessons) * 100) 
          : 0
      }
    }))

    return c.json({ courses: coursesWithDetails })

  } catch (error) {
    console.error('My courses error:', error)
    return c.json({ error: 'Failed to fetch courses' }, 500)
  }
})

// API: Get user's activity feed
app.get('/api/my/activity', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    // Get recent lesson completions
    const completions = await c.env.DB.prepare(`
      SELECT 'lesson_completed' as type, lp.completed_at as timestamp, l.title as lesson_title, c.title as course_title, c.id as course_id
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      JOIN courses c ON lp.course_id = c.id
      WHERE lp.user_id = ? AND lp.status = 'completed' AND lp.completed_at IS NOT NULL
      ORDER BY lp.completed_at DESC
      LIMIT 10
    `).bind(user.id).all()

    // Get quiz attempts
    const quizzes = await c.env.DB.prepare(`
      SELECT 'quiz_completed' as type, qa.attempted_at as timestamp, l.title as lesson_title, c.title as course_title, c.id as course_id, qa.percentage, qa.passed
      FROM quiz_attempts qa
      JOIN lessons l ON qa.lesson_id = l.id
      JOIN courses c ON qa.course_id = c.id
      WHERE qa.user_id = ?
      ORDER BY qa.attempted_at DESC
      LIMIT 10
    `).bind(user.id).all()

    // Get submissions
    const submissions = await c.env.DB.prepare(`
      SELECT 'submission' as type, s.submitted_at as timestamp, l.title as lesson_title, c.title as course_title, c.id as course_id, s.status
      FROM submissions s
      JOIN lessons l ON s.lesson_id = l.id
      JOIN courses c ON s.course_id = c.id
      WHERE s.user_id = ?
      ORDER BY s.submitted_at DESC
      LIMIT 10
    `).bind(user.id).all()

    // Get certificates
    const certificates = await c.env.DB.prepare(`
      SELECT 'certificate_earned' as type, issued_at as timestamp, course_title, certificate_number
      FROM certificates
      WHERE user_id = ?
      ORDER BY issued_at DESC
    `).bind(user.id).all()

    // Combine and sort by timestamp
    const allActivity = [
      ...(completions.results || []),
      ...(quizzes.results || []),
      ...(submissions.results || []),
      ...(certificates.results || [])
    ].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)

    return c.json({ activity: allActivity })

  } catch (error) {
    console.error('Activity error:', error)
    return c.json({ error: 'Failed to fetch activity' }, 500)
  }
})

// API: Get user's stats summary
app.get('/api/my/stats', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const enrolledCourses = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM course_access WHERE user_id = ? AND payment_verified = 1'
    ).bind(user.id).first<{ count: number }>()

    const completedLessons = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM lesson_progress WHERE user_id = ? AND status = \'completed\''
    ).bind(user.id).first<{ count: number }>()

    const certificatesEarned = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM certificates WHERE user_id = ?'
    ).bind(user.id).first<{ count: number }>()

    const quizzesPassed = await c.env.DB.prepare(
      'SELECT COUNT(DISTINCT lesson_id) as count FROM quiz_attempts WHERE user_id = ? AND passed = 1'
    ).bind(user.id).first<{ count: number }>()

    const submissionsApproved = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM submissions WHERE user_id = ? AND status = \'approved\''
    ).bind(user.id).first<{ count: number }>()

    // Calculate streak (consecutive days with activity)
    // Fixed: If no activity today, start counting from yesterday
    const recentActivity = await c.env.DB.prepare(`
      SELECT DISTINCT date(last_accessed_at) as activity_date
      FROM lesson_progress
      WHERE user_id = ? AND last_accessed_at >= datetime('now', '-30 days')
      ORDER BY activity_date DESC
    `).bind(user.id).all()

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const activityDates = (recentActivity.results || []).map((r: any) => new Date(r.activity_date + 'T00:00:00'))
    
    // Check if there's activity today
    const hasActivityToday = activityDates.some(d => d.getTime() === today.getTime())
    
    // Start from today if there's activity, otherwise start from yesterday
    const startOffset = hasActivityToday ? 0 : 1
    
    for (let i = startOffset; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const hasActivity = activityDates.some(d => d.getTime() === checkDate.getTime())
      
      if (hasActivity) {
        streak++
      } else {
        // Break on first day without activity
        break
      }
    }

    return c.json({
      enrolledCourses: enrolledCourses?.count || 0,
      completedLessons: completedLessons?.count || 0,
      certificatesEarned: certificatesEarned?.count || 0,
      quizzesPassed: quizzesPassed?.count || 0,
      submissionsApproved: submissionsApproved?.count || 0,
      currentStreak: streak
    })

  } catch (error) {
    console.error('Stats error:', error)
    return c.json({ error: 'Failed to fetch stats' }, 500)
  }
})

// ============================================
// SUPPORT TICKET SYSTEM
// ============================================

// API: Submit a support ticket
app.post('/api/support/ticket', requireAuth, async (c) => {
  const user = c.get('user')!
  
  try {
    const formData = await c.req.formData()
    const category = formData.get('category') as string
    const lessonId = formData.get('lesson_id') as string
    const description = formData.get('description') as string
    const videoLink = formData.get('video_link') as string
    const courseId = formData.get('course_id') as string
    
    if (!category || !description) {
      return c.json({ error: 'Category and description are required' }, 400)
    }
    
    // Create support_tickets table if it doesn't exist
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id TEXT,
        lesson_id TEXT,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        video_link TEXT,
        status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
        admin_response TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        resolved_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `).run()
    
    // Insert ticket
    const result = await c.env.DB.prepare(`
      INSERT INTO support_tickets (user_id, course_id, lesson_id, category, description, video_link)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(user.id, courseId || null, lessonId || null, category, description, videoLink || null).run()
    
    const ticketId = result.meta.last_row_id
    
    // Get lesson and course titles for email
    let lessonTitle = ''
    let courseTitle = ''
    
    if (lessonId) {
      const lesson = await c.env.DB.prepare('SELECT title FROM lessons WHERE id = ?').bind(lessonId).first<{title: string}>()
      lessonTitle = lesson?.title || lessonId
    }
    
    if (courseId) {
      const course = await c.env.DB.prepare('SELECT title FROM courses WHERE id = ?').bind(courseId).first<{title: string}>()
      courseTitle = course?.title || courseId
    }
    
    // Send notification email via Resend
    try {
      const emailBody = `
New Support Ticket #${ticketId}

From: ${user.name || 'Unknown'} (${user.email})
Category: ${category}
Course: ${courseTitle || 'N/A'}
Lesson: ${lessonTitle || 'N/A'}
Video Link: ${videoLink || 'None provided'}

Description:
${description}

---
View and respond in the admin portal: https://shortcircuits.org/admin/
      `.trim()
      
      await sendEmail(c.env.RESEND_API_KEY, {
        to: 'support@shortcct.com',
        subject: `[Support Ticket #${ticketId}] ${category} - ${user.name || user.email}`,
        html: emailTemplate(`
          <h1 style="color: #1a2332; font-size: 24px; margin: 0 0 20px 0;">New Support Ticket #${ticketId}</h1>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0;"><strong>From:</strong> ${user.name || 'Unknown'} (${user.email})</p>
            <p style="margin: 0 0 8px 0;"><strong>Category:</strong> ${category}</p>
            <p style="margin: 0 0 8px 0;"><strong>Course:</strong> ${courseTitle || 'N/A'}</p>
            <p style="margin: 0;"><strong>Lesson:</strong> ${lessonTitle || 'N/A'}</p>
            ${videoLink ? `<p style="margin: 8px 0 0;"><strong>Video:</strong> <a href="${videoLink}">${videoLink}</a></p>` : ''}
          </div>
          <h3 style="color: #1a2332; margin: 0 0 12px 0;">Description:</h3>
          <p style="color: #495057; white-space: pre-wrap; margin: 0 0 20px 0;">${description}</p>
          <a href="https://shortcircuits.org/admin/" style="display: inline-block; background: #00bfff; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View in Admin Portal</a>
        `),
      })
    } catch (emailError) {
      console.error('Failed to send support email:', emailError)
      // Don't fail the request if email fails
    }
    
    return c.json({ 
      success: true, 
      ticketId,
      message: 'Support ticket submitted successfully'
    })
    
  } catch (error) {
    console.error('Support ticket error:', error)
    return c.json({ error: 'Failed to submit support ticket' }, 500)
  }
})

// API: Get user's support tickets
app.get('/api/support/tickets', requireAuth, async (c) => {
  const user = c.get('user')!
  
  try {
    const tickets = await c.env.DB.prepare(`
      SELECT 
        st.*,
        l.title as lesson_title,
        cr.title as course_title
      FROM support_tickets st
      LEFT JOIN lessons l ON st.lesson_id = l.id
      LEFT JOIN courses cr ON st.course_id = cr.id
      WHERE st.user_id = ?
      ORDER BY st.created_at DESC
    `).bind(user.id).all()
    
    return c.json({ tickets: tickets.results || [] })
  } catch (error) {
    console.error('Get tickets error:', error)
    return c.json({ error: 'Failed to fetch tickets' }, 500)
  }
})

// API: Admin - Get all support tickets
app.get('/api/admin/support/tickets', requireAdmin, async (c) => {
  try {
    const status = c.req.query('status')
    
    let query = `
      SELECT 
        st.*,
        u.email as user_email,
        u.name as user_name,
        l.title as lesson_title,
        cr.title as course_title
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      LEFT JOIN lessons l ON st.lesson_id = l.id
      LEFT JOIN courses cr ON st.course_id = cr.id
    `
    
    if (status) {
      query += ` WHERE st.status = '${status}'`
    }
    
    query += ' ORDER BY st.created_at DESC'
    
    const tickets = await c.env.DB.prepare(query).all()
    
    return c.json({ tickets: tickets.results || [] })
  } catch (error) {
    console.error('Admin get tickets error:', error)
    return c.json({ error: 'Failed to fetch tickets' }, 500)
  }
})

// API: Admin - Update support ticket
app.patch('/api/admin/support/tickets/:id', requireAdmin, async (c) => {
  const ticketId = c.req.param('id')
  
  try {
    const body = await c.req.json()
    const { status, admin_response } = body as { status?: string; admin_response?: string }
    
    const updates: string[] = []
    const values: any[] = []
    
    if (status) {
      updates.push('status = ?')
      values.push(status)
      if (status === 'resolved' || status === 'closed') {
        updates.push("resolved_at = datetime('now')")
      }
    }
    
    if (admin_response !== undefined) {
      updates.push('admin_response = ?')
      values.push(admin_response)
    }
    
    updates.push("updated_at = datetime('now')")
    values.push(ticketId)
    
    await c.env.DB.prepare(`
      UPDATE support_tickets 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...values).run()
    
    // Get ticket details for email notification
    const ticket = await c.env.DB.prepare(`
      SELECT st.*, u.email, u.name 
      FROM support_tickets st 
      JOIN users u ON st.user_id = u.id 
      WHERE st.id = ?
    `).bind(ticketId).first<any>()
    
    // Send response notification to user
    if (ticket && admin_response) {
      try {
        await sendEmail(c.env.RESEND_API_KEY, {
          to: ticket.email,
          subject: `Re: Your Support Ticket #${ticketId}`,
          html: emailTemplate(`
            <h1 style="color: #1a2332; font-size: 24px; margin: 0 0 20px 0;">Support Update</h1>
            <p style="color: #495057; margin: 0 0 20px 0;">Hi ${ticket.name?.split(' ')[0] || 'there'},</p>
            <p style="color: #495057; margin: 0 0 20px 0;">We have responded to your support ticket.</p>
            <div style="background: #e3f2fd; padding: 16px; border-radius: 8px; border-left: 3px solid #00bfff; margin: 20px 0;">
              <p style="margin: 0; color: #1a2332; white-space: pre-wrap;">${admin_response}</p>
            </div>
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; color: #6c757d; font-size: 14px;"><strong>Your original question:</strong></p>
              <p style="margin: 0; color: #495057; font-size: 13px;">${ticket.description}</p>
            </div>
            <p style="color: #6c757d; font-size: 14px;">Best regards,<br>Short Circuit Support Team</p>
          `),
        })
      } catch (emailError) {
        console.error('Failed to send response email:', emailError)
      }
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Update ticket error:', error)
    return c.json({ error: 'Failed to update ticket' }, 500)
  }
})

// API: Admin - Reply to support ticket (POST variant for frontend)
app.post('/api/admin/support/tickets/:id/reply', requireAdmin, async (c) => {
  const ticketId = c.req.param('id')
  
  try {
    const body = await c.req.json()
    const { response, status } = body as { response?: string; status?: string }
    
    const updates: string[] = []
    const values: any[] = []
    
    if (response) {
      updates.push('admin_response = ?')
      values.push(response)
    }
    
    if (status) {
      updates.push('status = ?')
      values.push(status)
      if (status === 'resolved' || status === 'closed') {
        updates.push("resolved_at = datetime('now')")
      }
    }
    
    updates.push("updated_at = datetime('now')")
    values.push(ticketId)
    
    await c.env.DB.prepare(`
      UPDATE support_tickets 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...values).run()
    
    // Get ticket details for email notification
    const ticket = await c.env.DB.prepare(`
      SELECT st.*, u.email, u.name 
      FROM support_tickets st 
      JOIN users u ON st.user_id = u.id 
      WHERE st.id = ?
    `).bind(ticketId).first<any>()
    
    // Send response notification to user
    if (ticket && response) {
      try {
        await sendEmail(c.env.RESEND_API_KEY, {
          to: ticket.email,
          subject: `Re: Your Support Ticket #${ticketId}`,
          html: emailTemplate(`
            <h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Support Update</h1>
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${ticket.name?.split(' ')[0] || 'there'},</p>
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">We have responded to your support ticket.</p>
            
            <div style="background: linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%); border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #1a2332; font-size: 16px; margin: 0 0 15px 0;">Response from Support:</h3>
              <p style="color: #495057; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${response}</p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 15px 20px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;"><strong>Your original question:</strong></p>
              <p style="margin: 0; color: #495057; font-size: 13px;">${ticket.description}</p>
            </div>
            
            <p style="color: #495057; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">If you have more questions, simply reply to this email or visit your dashboard.</p>
            
            <a href="https://shortcircuit-2t9.pages.dev/account/" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 20px;">View My Tickets</a>
          `),
        })
      } catch (emailError) {
        console.error('Failed to send response email:', emailError)
      }
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Reply to ticket error:', error)
    return c.json({ error: 'Failed to send reply' }, 500)
  }
})

// API: Admin - Send test email
app.post('/api/admin/test-email', requireAdmin, async (c) => {
  try {
    const body = await c.req.json()
    const { templateType, recipientEmail } = body as { templateType: string; recipientEmail: string }
    
    if (!templateType || !recipientEmail) {
      return c.json({ error: 'Template type and recipient email are required' }, 400)
    }
    
    // Validate email
    if (!recipientEmail.includes('@')) {
      return c.json({ error: 'Invalid email address' }, 400)
    }
    
    let subject = ''
    let htmlContent = ''
    
    // Generate test email content based on template type
    switch (templateType) {
      case 'welcome':
        subject = '[TEST] Welcome to Short Circuit!'
        htmlContent = welcomeEmailContent('Test User')
        break
        
      case 'subscription':
        subject = '[TEST] Thanks for Subscribing!'
        htmlContent = subscriptionEmailContent('Test User')
        break
        
      case 'order_confirmation':
        subject = '[TEST] Order Confirmed - #TEST1234'
        htmlContent = orderConfirmationEmailContent({
          orderNumber: 'TEST1234',
          customerName: 'Test User',
          items: [{ name: 'Smart Watch Kit', quantity: 1, price: 99 }],
          subtotal: 99,
          shipping: 0,
          total: 99,
          shippingAddress: {
            line1: '123 Test Street',
            city: 'Test City',
            state: 'TS',
            postalCode: '12345',
            country: 'US'
          }
        })
        break
        
      case 'course_access_granted':
        subject = '[TEST] Your Course Access is Confirmed!'
        htmlContent = courseAccessGrantedEmailContent({
          userName: 'Test User',
          courseName: 'Smart Watch Course',
          courseUrl: 'https://shortcircuit-2t9.pages.dev/course/smartwatch/',
          orderNumber: 'TEST1234'
        })
        break
        
      case 'module_complete':
        subject = '[TEST] Module Complete!'
        htmlContent = moduleCompleteEmailContent({
          userName: 'Test User',
          moduleName: 'Module 1: Getting Started',
          courseName: 'Smart Watch Course',
          progressPercentage: 33,
          modulesCompleted: 2,
          totalModules: 6,
          nextModuleName: 'Module 2: Building the Circuit',
          nextModuleUrl: 'https://shortcircuit-2t9.pages.dev/course/smartwatch/',
          isFinalModule: false
        })
        break
        
      case 'submission_received':
        subject = '[TEST] Submission Received!'
        htmlContent = submissionReceivedEmailContent({
          userName: 'Test User',
          courseName: 'Smart Watch Course',
          submissionId: 'TEST-SUB-001',
          submissionDate: new Date().toLocaleDateString()
        })
        break
        
      case 'submission_approved':
        subject = '[TEST] Congratulations! Project Approved!'
        htmlContent = submissionApprovedEmailContent({
          userName: 'Test User',
          courseName: 'Smart Watch Course',
          feedback: 'Great work on your project! Your attention to detail and creativity really shines through. Well done!'
        })
        break
        
      case 'submission_needs_revision':
        subject = '[TEST] Your Final Project needs some updates'
        htmlContent = submissionNeedsRevisionEmailContent({
          userName: 'Test User',
          courseName: 'Smart Watch Course',
          feedback: 'Good progress! Please add a video demonstration showing all the features working together.',
          submissionUrl: 'https://shortcircuit-2t9.pages.dev/course/smartwatch/submission.html'
        })
        break
        
      case 'certificate_issued':
        subject = '[TEST] Your Certificate is Ready!'
        htmlContent = certificateIssuedEmailContent({
          userName: 'Test User',
          recipientName: 'Test User',
          courseName: 'Smart Watch Course',
          certificateNumber: 'SC-SW-2026-TEST',
          completionDate: new Date().toLocaleDateString(),
          skills: ['ESP32 Programming', 'Circuit Design', 'Embedded Systems'],
          verificationUrl: 'https://shortcircuit-2t9.pages.dev/verify/SC-SW-2026-TEST',
          certificateUrl: 'https://shortcircuit-2t9.pages.dev/account/'
        })
        break
        
      case 'password_reset':
        subject = '[TEST] Reset Your Password'
        htmlContent = passwordResetEmailContent('https://shortcircuit-2t9.pages.dev/reset-password.html?token=TEST_TOKEN')
        break
        
      default:
        return c.json({ error: 'Unknown template type' }, 400)
    }
    
    const sent = await sendEmail(c.env.RESEND_API_KEY, {
      to: recipientEmail,
      subject,
      html: emailTemplate(htmlContent),
    })
    
    if (sent) {
      return c.json({ success: true, message: `Test email sent to ${recipientEmail}` })
    } else {
      return c.json({ error: 'Failed to send email' }, 500)
    }
    
  } catch (error) {
    console.error('Test email error:', error)
    return c.json({ error: 'Failed to send test email' }, 500)
  }
})

// ============================================
// CERTIFICATE VERIFICATION API
// ============================================

// Public endpoint to verify certificates
app.get('/api/verify/:certificateNumber', async (c) => {
  try {
    const certificateNumber = c.req.param('certificateNumber')
    
    if (!certificateNumber) {
      return c.json({ error: 'Certificate number is required' }, 400)
    }
    
    const certificate = await c.env.DB.prepare(`
      SELECT 
        cert.certificate_number,
        cert.recipient_name,
        cert.course_title,
        cert.completion_date,
        cert.skills,
        cert.instructor_name,
        cert.issued_at,
        c.id as course_id
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      WHERE cert.certificate_number = ?
    `).bind(certificateNumber).first<{
      certificate_number: string
      recipient_name: string
      course_title: string
      completion_date: string
      skills: string
      instructor_name: string
      issued_at: string
      course_id: string
    }>()
    
    if (!certificate) {
      return c.json({ 
        valid: false, 
        error: 'Certificate not found' 
      }, 404)
    }
    
    return c.json({
      valid: true,
      certificate: {
        certificateNumber: certificate.certificate_number,
        recipientName: certificate.recipient_name,
        courseTitle: certificate.course_title,
        completionDate: certificate.completion_date,
        skills: certificate.skills ? JSON.parse(certificate.skills) : [],
        instructorName: certificate.instructor_name,
        issuedAt: certificate.issued_at,
        issuer: 'Short Circuit',
        verificationUrl: `https://shortcircuit-2t9.pages.dev/verify/${certificate.certificate_number}`,
      }
    })
    
  } catch (error) {
    console.error('Certificate verification error:', error)
    return c.json({ error: 'Failed to verify certificate' }, 500)
  }
})

// Get user's certificates
app.get('/api/my/certificates', requireAuth, async (c) => {
  const user = c.get('user')!
  
  try {
    const certificates = await c.env.DB.prepare(`
      SELECT 
        certificate_number,
        recipient_name,
        course_title,
        completion_date,
        skills,
        instructor_name,
        issued_at,
        pdf_url,
        download_count
      FROM certificates
      WHERE user_id = ?
      ORDER BY issued_at DESC
    `).bind(user.id).all()
    
    return c.json({
      certificates: (certificates.results || []).map((cert: any) => ({
        certificateNumber: cert.certificate_number,
        recipientName: cert.recipient_name,
        courseTitle: cert.course_title,
        completionDate: cert.completion_date,
        skills: cert.skills ? JSON.parse(cert.skills) : [],
        instructorName: cert.instructor_name,
        issuedAt: cert.issued_at,
        pdfUrl: cert.pdf_url,
        downloadCount: cert.download_count,
        verificationUrl: `https://shortcircuit-2t9.pages.dev/verify/${cert.certificate_number}`,
      }))
    })
    
  } catch (error) {
    console.error('Certificates fetch error:', error)
    return c.json({ error: 'Failed to fetch certificates' }, 500)
  }
})

// Get certificate for a specific course
app.get('/api/my/certificates/:courseId', requireAuth, async (c) => {
  const user = c.get('user')!
  const courseId = c.req.param('courseId')
  
  try {
    const certificate = await c.env.DB.prepare(`
      SELECT 
        certificate_number,
        recipient_name,
        course_title,
        completion_date,
        skills,
        instructor_name,
        issued_at,
        pdf_url
      FROM certificates
      WHERE user_id = ? AND course_id = ?
    `).bind(user.id, courseId).first<any>()
    
    if (!certificate) {
      return c.json({ certificate: null })
    }
    
    // Increment download count
    await c.env.DB.prepare(
      'UPDATE certificates SET download_count = download_count + 1, last_downloaded_at = datetime(\'now\') WHERE user_id = ? AND course_id = ?'
    ).bind(user.id, courseId).run()
    
    return c.json({
      certificate: {
        certificateNumber: certificate.certificate_number,
        recipientName: certificate.recipient_name,
        courseTitle: certificate.course_title,
        completionDate: certificate.completion_date,
        skills: certificate.skills ? JSON.parse(certificate.skills) : [],
        instructorName: certificate.instructor_name,
        issuedAt: certificate.issued_at,
        pdfUrl: certificate.pdf_url,
        verificationUrl: `https://shortcircuit-2t9.pages.dev/verify/${certificate.certificate_number}`,
      }
    })
    
  } catch (error) {
    console.error('Certificate fetch error:', error)
    return c.json({ error: 'Failed to fetch certificate' }, 500)
  }
})

// ============================================
// ADMIN TEST EMAIL ENDPOINT
// ============================================

// Send all email templates for testing/preview (Admin only)
app.post('/api/admin/test-emails', requireAdmin, async (c) => {
  const { email } = await c.req.json()
  
  if (!email) {
    return c.json({ error: 'Email address required' }, 400)
  }
  
  const results: { template: string; success: boolean }[] = []
  
  try {
    // 1. Welcome Email
    results.push({
      template: 'Welcome Email',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Welcome to Short Circuit!',
        html: emailTemplate(welcomeEmailContent('Kayla')),
      })
    })
    
    // 2. Subscription Email
    results.push({
      template: 'Subscription Confirmation',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] You are In! Welcome to Short Circuit Updates',
        html: emailTemplate(subscriptionEmailContent('Kayla')),
      })
    })
    
    // 3. Order Confirmation Email
    results.push({
      template: 'Order Confirmation',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Order Confirmed! #SC-TEST-001',
        html: emailTemplate(orderConfirmationEmailContent({
          orderNumber: 'SC-TEST-001',
          customerName: 'Kayla',
          items: [
            { name: 'LilyGo T-Watch 2020 V3 Smartwatch Kit', quantity: 1, price: 14900 },
            { name: 'Ball and Beam Control System Kit', quantity: 1, price: 12900 }
          ],
          subtotal: 27800,
          shipping: 0,
          total: 27800,
          shippingAddress: {
            name: 'Kayla Sierra',
            line1: '123 Test Street',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'US'
          }
        })),
      })
    })
    
    // 4. Password Reset Email
    results.push({
      template: 'Password Reset',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Reset Your Short Circuit Password',
        html: emailTemplate(passwordResetEmailContent('https://shortcircuit-2t9.pages.dev/reset-password.html?token=TEST_TOKEN_123')),
      })
    })
    
    // 5. Password Reset Success Email
    results.push({
      template: 'Password Reset Success',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Password Changed Successfully',
        html: emailTemplate(passwordResetSuccessEmailContent()),
      })
    })
    
    // 6. Course Access Granted Email
    results.push({
      template: 'Course Access Granted',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Your Course Access is Confirmed!',
        html: emailTemplate(courseAccessGrantedEmailContent({
          userName: 'Kayla',
          courseName: 'Smartwatch Development: LilyGo T-Watch 2020 V3',
          courseUrl: 'https://shortcircuit-2t9.pages.dev/course/smartwatch/',
          orderNumber: 'SC-TEST-001'
        })),
      })
    })
    
    // 7. Module Complete Email (mid-course)
    results.push({
      template: 'Module Complete (Mid-Course)',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Module Complete! Keep Going!',
        html: emailTemplate(moduleCompleteEmailContent({
          userName: 'Kayla',
          moduleName: 'Module 2: Timekeeping',
          courseName: 'Smartwatch Development',
          progressPercentage: 50,
          modulesCompleted: 2,
          totalModules: 4,
          nextModuleName: 'Module 3: UI & Sensors',
          nextModuleUrl: 'https://shortcircuit-2t9.pages.dev/course/smartwatch/',
          isFinalModule: false
        })),
      })
    })
    
    // 8. All Modules Complete Email
    results.push({
      template: 'All Modules Complete',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] All Modules Complete! Submit Your Final Project',
        html: emailTemplate(moduleCompleteEmailContent({
          userName: 'Kayla',
          moduleName: 'Module 4: Integration',
          courseName: 'Smartwatch Development',
          progressPercentage: 100,
          modulesCompleted: 4,
          totalModules: 4,
          isFinalModule: true,
          submissionUrl: 'https://shortcircuit-2t9.pages.dev/course/smartwatch/submission.html'
        })),
      })
    })
    
    // 9. Submission Received Email
    results.push({
      template: 'Submission Received',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Submission Received! We Will Review Soon',
        html: emailTemplate(submissionReceivedEmailContent({
          userName: 'Kayla',
          courseName: 'Smartwatch Development',
          submissionId: 'SUB-TEST-001',
          submissionDate: new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        })),
      })
    })
    
    // 10. Submission Approved Email
    results.push({
      template: 'Submission Approved',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Congratulations! Your Project is Approved!',
        html: emailTemplate(submissionApprovedEmailContent({
          userName: 'Kayla',
          courseName: 'Smartwatch Development',
          feedback: 'Excellent work on your smartwatch project! Your implementation of the RTOS architecture shows great understanding of embedded systems concepts. The touch interface is responsive and the power management is well-optimized. Keep up the great work!'
        })),
      })
    })
    
    // 11. Submission Needs Revision Email
    results.push({
      template: 'Submission Needs Revision',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Almost There! A Few Revisions Needed',
        html: emailTemplate(submissionNeedsRevisionEmailContent({
          userName: 'Kayla',
          courseName: 'Smartwatch Development',
          feedback: 'Great progress on your project! There are just a few areas that need attention:\n\n1. The Wi-Fi connection seems to drop occasionally - please check the reconnection logic.\n2. The battery display could use some smoothing to avoid flickering.\n\nOnce these are addressed, your project will be ready for approval!',
          submissionUrl: 'https://shortcircuit-2t9.pages.dev/course/smartwatch/submission.html',
        })),
      })
    })
    
    // 12. Certificate Issued Email
    results.push({
      template: 'Certificate Issued',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] Your Short Circuit Certificate is Ready!',
        html: emailTemplate(certificateIssuedEmailContent({
          userName: 'Kayla',
          recipientName: 'Kayla Sierra',
          courseName: 'Smartwatch Development: LilyGo T-Watch 2020 V3',
          certificateNumber: 'SC-SW-2026-TEST001',
          completionDate: 'March 23, 2026',
          verificationUrl: 'https://shortcircuit-2t9.pages.dev/verify/SC-SW-2026-TEST001',
          certificateUrl: 'https://shortcircuit-2t9.pages.dev/api/certificates/SC-SW-2026-TEST001/download',
          skills: ['Embedded C/C++', 'FreeRTOS', 'I2C Communication', 'Touch Interfaces', 'Power Management']
        })),
      })
    })
    
    // 13. Admin New Submission Notification
    results.push({
      template: 'Admin: New Submission',
      success: await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: '[TEST] New Submission Requires Review',
        html: emailTemplate(adminNewSubmissionEmailContent({
          userName: 'Kayla Sierra',
          userEmail: email,
          courseName: 'Smartwatch Development',
          submissionId: 'SUB-TEST-001',
          submissionDate: new Date().toLocaleDateString('en-US'),
          adminReviewUrl: 'https://shortcircuit-2t9.pages.dev/admin/'
        })),
      })
    })
    
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length
    
    return c.json({
      message: `Sent ${successCount} of ${results.length} test emails to ${email}`,
      successCount,
      failCount,
      results
    })
    
  } catch (error) {
    console.error('Test emails error:', error)
    return c.json({ error: 'Failed to send test emails' }, 500)
  }
})

// ============================================
// STATIC FILES
// ============================================

// Serve certificate verification page for /verify/* routes
app.get('/verify/*', (c) => c.redirect('/verify.html'))
app.get('/verify', (c) => c.redirect('/verify.html'))

app.use('/*', serveStatic())
app.get('*', (c) => c.redirect('/index.html'))

export default app
