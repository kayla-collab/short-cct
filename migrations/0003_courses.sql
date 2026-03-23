-- Course System Schema
-- Courses, lessons, quizzes, submissions, certificates

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  product_id TEXT NOT NULL,
  thumbnail_url TEXT,
  total_lessons INTEGER DEFAULT 0,
  total_quizzes INTEGER DEFAULT 0,
  estimated_hours INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Course modules (chapters)
CREATE TABLE IF NOT EXISTS course_modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_published INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Lessons within modules
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK(content_type IN ('video', 'text', 'quiz', 'submission')),
  content_json TEXT, -- JSON blob for lesson content (video URL, text, images, etc.)
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Course access (links purchases to course access)
CREATE TABLE IF NOT EXISTS course_access (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id TEXT NOT NULL,
  order_id INTEGER,
  access_type TEXT DEFAULT 'purchase' CHECK(access_type IN ('purchase', 'gift', 'admin')),
  granted_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  UNIQUE(user_id, course_id)
);

-- Lesson progress tracking
CREATE TABLE IF NOT EXISTS lesson_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK(status IN ('not_started', 'in_progress', 'completed')),
  video_progress_seconds INTEGER DEFAULT 0,
  video_duration_seconds INTEGER DEFAULT 0,
  completed_at TEXT,
  last_accessed_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(user_id, lesson_id)
);

-- Quiz questions (stored separately for reuse and analytics)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK(question_type IN ('multiple_choice', 'true_false', 'image_choice')),
  options_json TEXT NOT NULL, -- JSON array of options
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  image_url TEXT,
  order_index INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage REAL NOT NULL,
  passed INTEGER NOT NULL,
  answers_json TEXT NOT NULL, -- JSON of user's answers
  time_taken_seconds INTEGER,
  attempted_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Project submissions (checkpoints)
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  photo_urls TEXT, -- JSON array of R2 URLs
  video_url TEXT, -- YouTube/Vimeo link
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'needs_revision', 'rejected')),
  admin_feedback TEXT,
  reviewed_by INTEGER,
  submitted_at TEXT DEFAULT (datetime('now')),
  reviewed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id TEXT NOT NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  recipient_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  completion_date TEXT NOT NULL,
  issued_at TEXT DEFAULT (datetime('now')),
  pdf_url TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(user_id, course_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_access_user ON course_access(user_id);
CREATE INDEX IF NOT EXISTS idx_course_access_course ON course_access(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course ON lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_course ON course_modules(course_id);
