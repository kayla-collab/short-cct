-- Migration: Security, Progress Tracking, and Certificate System
-- Date: 2026-03-21
-- Description: Adds payment verification, module progress, email templates, and certificate enhancements

-- ============================================
-- PHASE 1: SECURITY ENHANCEMENTS
-- ============================================

-- Add payment verification fields to course_access
ALTER TABLE course_access ADD COLUMN stripe_payment_intent TEXT;
ALTER TABLE course_access ADD COLUMN payment_verified INTEGER DEFAULT 0;
ALTER TABLE course_access ADD COLUMN verification_date TEXT;

-- Create access_logs table for audit trail
CREATE TABLE IF NOT EXISTS access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id TEXT,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON access_logs(action);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON access_logs(created_at);

-- ============================================
-- PHASE 2: MODULE PROGRESS TRACKING
-- ============================================

-- Create module_progress table
CREATE TABLE IF NOT EXISTS module_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  module_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK(status IN ('not_started', 'in_progress', 'completed')),
  lessons_completed INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  completion_percentage REAL DEFAULT 0,
  started_at TEXT,
  completed_at TEXT,
  completion_email_sent INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_module_progress_user ON module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_course ON module_progress(course_id);

-- ============================================
-- PHASE 2: EMAIL TEMPLATES (Editable)
-- ============================================

CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  variables TEXT,
  category TEXT DEFAULT 'general',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  updated_by INTEGER,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default email templates
INSERT OR REPLACE INTO email_templates (id, name, subject, body_html, variables, category) VALUES
('access_granted', 'Course Access Granted', 'Welcome to {{course_name}} - Your Access is Confirmed!', 
'<h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Your Course Access is Confirmed!</h1>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey {{user_name}},</p>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Great news! Your payment has been verified and you now have full access to <strong>{{course_name}}</strong>.</p>

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

<a href="{{course_url}}" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Start Learning</a>',
'["user_name", "course_name", "course_url", "order_number"]', 'course'),

('module_complete', 'Module Completed', 'Congratulations! You completed {{module_name}}',
'<h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Module Complete!</h1>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey {{user_name}},</p>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Awesome work! You have successfully completed <strong>{{module_name}}</strong> in {{course_name}}.</p>

<div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
  <div style="font-size: 48px; margin-bottom: 10px;">{{progress_percentage}}%</div>
  <div style="color: #6c757d; font-size: 14px;">Overall Course Progress</div>
  <div style="background: #e9ecef; border-radius: 10px; height: 10px; margin-top: 15px; overflow: hidden;">
    <div style="background: linear-gradient(90deg, #00bfff, #00ff88); height: 100%; width: {{progress_percentage}}%;"></div>
  </div>
</div>

<div style="background: linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%); border-radius: 8px; padding: 20px; margin: 25px 0;">
  <h3 style="color: #1a2332; font-size: 18px; margin: 0 0 10px 0;">Up Next: {{next_module_name}}</h3>
  <p style="color: #495057; font-size: 14px; margin: 0;">Keep the momentum going! Your next module is ready and waiting.</p>
</div>

<a href="{{next_module_url}}" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Continue to Next Module</a>',
'["user_name", "module_name", "course_name", "progress_percentage", "next_module_name", "next_module_url", "modules_completed", "total_modules"]', 'progress'),

('ready_for_final', 'Ready for Final Project', 'You are ready for your Final Project Submission!',
'<h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">You are Ready for the Final Project!</h1>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey {{user_name}},</p>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Incredible achievement! You have completed all the modules in <strong>{{course_name}}</strong>. You are now ready to submit your final project.</p>

<div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%); border-radius: 8px; padding: 20px; margin: 25px 0;">
  <h3 style="color: #856404; font-size: 18px; margin: 0 0 15px 0;">Final Project Requirements:</h3>
  <ul style="color: #856404; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
    <li>A video demonstration of your working project (2-5 minutes)</li>
    <li>Photos of your completed build</li>
    <li>Brief description of any customizations you made</li>
  </ul>
</div>

<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Once your submission is reviewed and approved by Anand, you will receive your official Short Circuit certificate!</p>

<a href="{{submission_url}}" style="display: inline-block; background: #ff6b6b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Submit Final Project</a>',
'["user_name", "course_name", "submission_url", "modules_completed"]', 'progress'),

('final_submission_received', 'Final Submission Received', 'We received your Final Project Submission!',
'<h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Submission Received!</h1>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey {{user_name}},</p>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for submitting your final project for <strong>{{course_name}}</strong>. We are excited to review your work!</p>

<div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
  <p style="margin: 0 0 10px 0; color: #1a2332;"><strong>Submission ID:</strong> {{submission_id}}</p>
  <p style="margin: 0 0 10px 0; color: #1a2332;"><strong>Submitted:</strong> {{submission_date}}</p>
  <p style="margin: 0; color: #1a2332;"><strong>Expected Review:</strong> Within {{review_days}} business days</p>
</div>

<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Anand Seetharaman will personally review your project and provide feedback. You will receive an email once the review is complete.</p>

<p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 0;">If your submission is approved, your certificate will be issued automatically!</p>',
'["user_name", "course_name", "submission_id", "submission_date", "review_days"]', 'submission'),

('submission_approved', 'Submission Approved', 'Your Final Project has been Approved!',
'<h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Congratulations! Project Approved!</h1>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey {{user_name}},</p>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Fantastic news! Your final project for <strong>{{course_name}}</strong> has been reviewed and <strong style="color: #28a745;">APPROVED</strong>!</p>

<div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-radius: 8px; padding: 20px; margin: 25px 0;">
  <h3 style="color: #155724; font-size: 18px; margin: 0 0 15px 0;">Feedback from Anand:</h3>
  <p style="color: #155724; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">"{{admin_feedback}}"</p>
</div>

<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Your certificate is being generated and will be sent to you in a separate email shortly.</p>

<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Thank you for being part of the Short Circuit community. We cannot wait to see what you build next!</p>

<a href="{{account_url}}" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Your Progress</a>',
'["user_name", "course_name", "admin_feedback", "account_url"]', 'submission'),

('submission_needs_revision', 'Submission Needs Revision', 'Your Final Project needs some updates',
'<h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Almost There!</h1>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey {{user_name}},</p>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for submitting your final project for <strong>{{course_name}}</strong>. After review, we think it needs a few small updates before we can approve it.</p>

<div style="background: #fff3cd; border-radius: 8px; padding: 20px; margin: 25px 0;">
  <h3 style="color: #856404; font-size: 18px; margin: 0 0 15px 0;">Feedback from Anand:</h3>
  <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">"{{admin_feedback}}"</p>
</div>

<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Do not worry - you are so close! Make the suggested changes and resubmit when ready.</p>

<a href="{{submission_url}}" style="display: inline-block; background: #ff6b6b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Resubmit Project</a>

<p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">Questions? Reply to this email and Anand will help you out.</p>',
'["user_name", "course_name", "admin_feedback", "submission_url"]', 'submission'),

('certificate_issued', 'Certificate Issued', 'Your Short Circuit Certificate is Ready!',
'<h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">Your Certificate is Ready!</h1>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hey {{user_name}},</p>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Congratulations on completing <strong>{{course_name}}</strong>! Your official Short Circuit certificate is now available.</p>

<div style="background: linear-gradient(135deg, #1a2332 0%, #2a3444 100%); border-radius: 12px; padding: 30px; margin: 25px 0; text-align: center;">
  <div style="color: #00bfff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Certificate of Completion</div>
  <div style="color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px;">{{recipient_name}}</div>
  <div style="color: #adb5bd; font-size: 14px; margin-bottom: 15px;">{{course_name}}</div>
  <div style="color: #6c757d; font-size: 12px;">Certificate #{{certificate_number}}</div>
</div>

<div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
  <p style="margin: 0 0 15px 0; color: #1a2332;"><strong>Skills Demonstrated:</strong></p>
  <p style="margin: 0; color: #495057; font-size: 14px;">{{skills_list}}</p>
</div>

<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Share your achievement! Your certificate can be verified at:</p>

<p style="background: #e9ecef; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 14px; color: #495057; word-break: break-all;">{{verification_url}}</p>

<div style="margin-top: 25px;">
  <a href="{{certificate_url}}" style="display: inline-block; background: #ff6b6b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 10px;">Download Certificate</a>
  <a href="{{account_url}}" style="display: inline-block; background: #00bfff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">View in Account</a>
</div>',
'["user_name", "recipient_name", "course_name", "certificate_number", "completion_date", "skills_list", "verification_url", "certificate_url", "account_url"]', 'certificate'),

('admin_new_submission', 'New Final Submission', '[Admin] New Final Project Submission from {{user_name}}',
'<h1 style="color: #1a2332; font-size: 28px; margin: 0 0 20px 0;">New Submission Awaiting Review</h1>
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">A new final project submission has been received.</p>

<div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
  <p style="margin: 0 0 10px 0; color: #1a2332;"><strong>Student:</strong> {{user_name}} ({{user_email}})</p>
  <p style="margin: 0 0 10px 0; color: #1a2332;"><strong>Course:</strong> {{course_name}}</p>
  <p style="margin: 0 0 10px 0; color: #1a2332;"><strong>Submission ID:</strong> {{submission_id}}</p>
  <p style="margin: 0; color: #1a2332;"><strong>Submitted:</strong> {{submission_date}}</p>
</div>

<a href="{{admin_review_url}}" style="display: inline-block; background: #ff6b6b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Review Submission</a>',
'["user_name", "user_email", "course_name", "submission_id", "submission_date", "admin_review_url"]', 'admin');

-- ============================================
-- PHASE 3: CERTIFICATE ENHANCEMENTS
-- ============================================

-- Add fields to certificates table
ALTER TABLE certificates ADD COLUMN final_submission_id INTEGER;
ALTER TABLE certificates ADD COLUMN certificate_email_sent INTEGER DEFAULT 0;
ALTER TABLE certificates ADD COLUMN skills TEXT;
ALTER TABLE certificates ADD COLUMN instructor_name TEXT DEFAULT 'Anand Seetharaman';
ALTER TABLE certificates ADD COLUMN download_count INTEGER DEFAULT 0;
ALTER TABLE certificates ADD COLUMN last_downloaded_at TEXT;

-- ============================================
-- CONFIGURATION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  updated_by INTEGER
);

-- Insert default configuration
INSERT OR REPLACE INTO system_config (key, value, description) VALUES
('instructor_name', 'Anand Seetharaman', 'Name displayed on certificates and emails'),
('instructor_title', 'Founder, Short Circuit', 'Title displayed on certificates'),
('support_email', 'support@shortcct.com', 'Support email address'),
('from_email', 'Short Circuit <hello@shortcct.com>', 'From address for emails'),
('review_timeline_days', '3', 'Expected days to review submissions'),
('certificate_prefix', 'SC', 'Prefix for certificate numbers'),
('company_name', 'Short Circuit', 'Company name for certificates'),
('base_url', 'https://shortcircuit-2t9.pages.dev', 'Base URL for links in emails');
