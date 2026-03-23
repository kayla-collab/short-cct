/**
 * Short Circuit Course API Library
 * Handles all API communication for course functionality
 */

const CourseAPI = {
    // Current user and course state
    user: null,
    currentCourse: null,
    courseData: null,
    
    /**
     * Initialize the course system
     * @param {string} courseId - The course ID to load
     * @returns {Promise<Object>} Course data and user info
     */
    async init(courseId) {
        try {
            // Check authentication
            const authResponse = await fetch('/api/auth/me', {
                credentials: 'include'
            });
            const authData = await authResponse.json();
            
            if (!authData.user) {
                // Redirect to login with return URL
                const returnUrl = encodeURIComponent(window.location.pathname);
                window.location.href = `/login?redirect=${returnUrl}`;
                return null;
            }
            
            this.user = authData.user;
            this.currentCourse = courseId;
            
            // Load course data
            const courseResponse = await fetch(`/api/courses/${courseId}`, {
                credentials: 'include'
            });
            if (!courseResponse.ok) {
                if (courseResponse.status === 403) {
                    this.showAccessDenied();
                    return null;
                }
                throw new Error('Failed to load course');
            }
            
            this.courseData = await courseResponse.json();
            return {
                user: this.user,
                course: this.courseData
            };
            
        } catch (error) {
            console.error('Course init error:', error);
            this.showError('Failed to initialize course. Please try again.');
            return null;
        }
    },
    
    /**
     * Get course progress summary
     * @param {string} courseId - The course ID
     * @returns {Promise<Object>} Progress data
     */
    async getProgress(courseId = this.currentCourse) {
        try {
            const response = await fetch(`/api/courses/${courseId}/progress`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to load progress');
            return await response.json();
        } catch (error) {
            console.error('Progress fetch error:', error);
            return null;
        }
    },
    
    /**
     * Get a single lesson with content
     * @param {string} lessonId - The lesson ID
     * @param {string} courseId - The course ID
     * @returns {Promise<Object>} Lesson data
     */
    async getLesson(lessonId, courseId = this.currentCourse) {
        try {
            const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to load lesson');
            return await response.json();
        } catch (error) {
            console.error('Lesson fetch error:', error);
            return null;
        }
    },
    
    /**
     * Save lesson progress
     * @param {string} lessonId - The lesson ID
     * @param {string} status - Status: 'in_progress' or 'completed'
     * @param {number} videoProgressSeconds - Video playback position
     * @param {string} courseId - The course ID
     * @returns {Promise<boolean>} Success status
     */
    async saveProgress(lessonId, status, videoProgressSeconds = null, courseId = this.currentCourse) {
        try {
            const response = await fetch('/api/course/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    lessonId,
                    courseId,
                    status,
                    videoProgressSeconds
                })
            });
            return response.ok;
        } catch (error) {
            console.error('Progress save error:', error);
            return false;
        }
    },
    
    /**
     * Mark lesson as completed
     * @param {string} lessonId - The lesson ID
     * @returns {Promise<boolean>} Success status
     */
    async markComplete(lessonId) {
        return await this.saveProgress(lessonId, 'completed');
    },
    
    /**
     * Unmark lesson as completed (set back to in_progress)
     * @param {string} lessonId - The lesson ID
     * @returns {Promise<boolean>} Success status
     */
    async unmarkComplete(lessonId) {
        return await this.saveProgress(lessonId, 'in_progress');
    },
    
    /**
     * Submit quiz answers
     * @param {string} lessonId - The lesson ID (quiz)
     * @param {number[]} answers - Array of answer indices
     * @param {string} courseId - The course ID
     * @returns {Promise<Object>} Quiz results
     */
    async submitQuiz(lessonId, answers, courseId = this.currentCourse) {
        try {
            const response = await fetch('/api/course/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    lessonId,
                    courseId,
                    answers
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Quiz submission failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Quiz submit error:', error);
            throw error;
        }
    },
    
    /**
     * Get quiz attempts for a lesson
     * @param {string} lessonId - The lesson ID
     * @returns {Promise<Object>} Previous attempts
     */
    async getQuizAttempts(lessonId) {
        try {
            const response = await fetch(`/api/course/quiz/${lessonId}/attempts`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to load attempts');
            return await response.json();
        } catch (error) {
            console.error('Quiz attempts fetch error:', error);
            return { attempts: [] };
        }
    },
    
    /**
     * Upload file to R2 storage
     * @param {File} file - The file to upload
     * @returns {Promise<Object>} Upload result with URL
     */
    async uploadFile(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    },
    
    /**
     * Submit a project checkpoint
     * @param {string} lessonId - The lesson ID
     * @param {Object} data - Submission data
     * @param {string[]} data.photoUrls - Array of uploaded photo URLs
     * @param {string} data.videoUrl - YouTube/Vimeo video URL
     * @param {string} data.description - Project description
     * @param {string} courseId - The course ID
     * @returns {Promise<Object>} Submission result
     */
    async submitProject(lessonId, data, courseId = this.currentCourse) {
        try {
            const response = await fetch('/api/course/submission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    lessonId,
                    courseId,
                    photoUrls: data.photoUrls || [],
                    videoUrl: data.videoUrl || null,
                    description: data.description
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Submission failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Submission error:', error);
            throw error;
        }
    },
    
    /**
     * Get user's submissions for a lesson or course
     * @param {string} lessonId - Optional lesson ID filter
     * @param {string} courseId - Optional course ID filter
     * @returns {Promise<Object>} Submissions list
     */
    async getSubmissions(lessonId = null, courseId = this.currentCourse) {
        try {
            let url = '/api/course/submissions?';
            if (courseId) url += `courseId=${courseId}&`;
            if (lessonId) url += `lessonId=${lessonId}`;
            
            const response = await fetch(url, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to load submissions');
            return await response.json();
        } catch (error) {
            console.error('Submissions fetch error:', error);
            return { submissions: [] };
        }
    },
    
    /**
     * Request certificate generation
     * @param {string} courseId - The course ID
     * @returns {Promise<Object>} Certificate data
     */
    async generateCertificate(courseId = this.currentCourse) {
        try {
            const response = await fetch(`/api/courses/${courseId}/certificate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Certificate generation failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Certificate generation error:', error);
            throw error;
        }
    },
    
    /**
     * Get certificate by number (public)
     * @param {string} certNumber - The certificate number
     * @returns {Promise<Object>} Certificate data
     */
    async getCertificate(certNumber) {
        try {
            const response = await fetch(`/api/certificates/${certNumber}`);
            if (!response.ok) throw new Error('Certificate not found');
            return await response.json();
        } catch (error) {
            console.error('Certificate fetch error:', error);
            return null;
        }
    },
    
    /**
     * Show access denied message
     */
    showAccessDenied() {
        const container = document.querySelector('.course-main') || document.body;
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; padding: 40px;">
                <i class="fas fa-lock" style="font-size: 64px; color: #6c757d; margin-bottom: 24px;"></i>
                <h1 style="font-size: 28px; margin-bottom: 16px;">Course Access Required</h1>
                <p style="color: #6c757d; margin-bottom: 24px; max-width: 500px;">
                    You need to purchase this course to access the content. 
                    The course will be automatically unlocked after your order is confirmed.
                </p>
                <a href="/shop" class="btn-primary" style="padding: 14px 32px; background: #00bfff; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    <i class="fas fa-shopping-cart" style="margin-right: 8px;"></i>
                    View Available Kits
                </a>
            </div>
        `;
    },
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        const container = document.querySelector('.course-main') || document.body;
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #ff6b6b; margin-bottom: 24px;"></i>
                <h1 style="font-size: 28px; margin-bottom: 16px;">Something Went Wrong</h1>
                <p style="color: #6c757d; margin-bottom: 24px;">${message}</p>
                <button onclick="location.reload()" style="padding: 14px 32px; background: #1a2332; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-redo" style="margin-right: 8px;"></i>
                    Try Again
                </button>
            </div>
        `;
    },
    
    /**
     * Format duration in minutes to readable string
     * @param {number} minutes - Duration in minutes
     * @returns {string} Formatted duration
     */
    formatDuration(minutes) {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    },
    
    /**
     * Get content type icon
     * @param {string} type - Content type
     * @returns {string} Font Awesome icon class
     */
    getContentIcon(type) {
        const icons = {
            'video': 'fa-play-circle',
            'text': 'fa-file-alt',
            'quiz': 'fa-question-circle',
            'submission': 'fa-upload'
        };
        return icons[type] || 'fa-circle';
    },
    
    /**
     * Get status icon and color
     * @param {string} status - Progress status
     * @returns {Object} Icon class and color
     */
    getStatusStyle(status) {
        const styles = {
            'completed': { icon: 'fa-check-circle', color: '#28a745' },
            'in_progress': { icon: 'fa-clock', color: '#ffc107' },
            'not_started': { icon: 'fa-circle', color: '#6c757d' }
        };
        return styles[status] || styles['not_started'];
    }
};

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CourseAPI;
}
