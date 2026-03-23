-- Migration 0007: Comments and Reviews System
-- Adds tables for lesson comments and module reviews

-- =====================================================
-- LESSON COMMENTS TABLE
-- Users can comment on individual lessons
-- =====================================================
CREATE TABLE IF NOT EXISTS lesson_comments (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    parent_id TEXT DEFAULT NULL,           -- For reply threads
    content TEXT NOT NULL,
    is_pinned INTEGER DEFAULT 0,           -- Admin can pin important comments
    is_instructor_reply INTEGER DEFAULT 0, -- Mark instructor responses
    likes_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES lesson_comments(id)
);

-- =====================================================
-- COMMENT LIKES TABLE
-- Track which users liked which comments
-- =====================================================
CREATE TABLE IF NOT EXISTS comment_likes (
    id TEXT PRIMARY KEY,
    comment_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES lesson_comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- MODULE REVIEWS TABLE
-- Users can rate and review entire modules
-- =====================================================
CREATE TABLE IF NOT EXISTS module_reviews (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    is_verified_completion INTEGER DEFAULT 0, -- User completed the module
    helpful_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, user_id),               -- One review per user per module
    FOREIGN KEY (module_id) REFERENCES course_modules(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- REVIEW HELPFUL VOTES TABLE
-- Track which users found which reviews helpful
-- =====================================================
CREATE TABLE IF NOT EXISTS review_helpful_votes (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, user_id),
    FOREIGN KEY (review_id) REFERENCES module_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson ON lesson_comments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_user ON lesson_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_parent ON lesson_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_pinned ON lesson_comments(is_pinned);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_created ON lesson_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_module_reviews_module ON module_reviews(module_id);
CREATE INDEX IF NOT EXISTS idx_module_reviews_user ON module_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_module_reviews_rating ON module_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_module_reviews_created ON module_reviews(created_at);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_review ON review_helpful_votes(review_id);
