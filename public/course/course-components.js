/**
 * Short Circuit Course Components
 * Reusable UI components for the course experience
 */

// ============================================
// PROGRESS RING COMPONENT
// ============================================
const ProgressRing = {
    /**
     * Create an SVG progress ring
     * @param {number} percent - Progress percentage (0-100)
     * @param {number} size - Ring size in pixels
     * @param {string} color - Progress color
     * @returns {string} SVG HTML
     */
    create(percent, size = 32, color = '#00ff88') {
        const strokeWidth = size > 40 ? 4 : 3;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percent / 100) * circumference;
        
        return `
            <svg class="progress-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <circle 
                    class="progress-ring-bg"
                    stroke="#e0e0e0"
                    stroke-width="${strokeWidth}"
                    fill="transparent"
                    r="${radius}"
                    cx="${size/2}"
                    cy="${size/2}"
                />
                <circle 
                    class="progress-ring-progress"
                    stroke="${color}"
                    stroke-width="${strokeWidth}"
                    stroke-linecap="round"
                    fill="transparent"
                    r="${radius}"
                    cx="${size/2}"
                    cy="${size/2}"
                    style="
                        stroke-dasharray: ${circumference} ${circumference};
                        stroke-dashoffset: ${offset};
                        transform: rotate(-90deg);
                        transform-origin: 50% 50%;
                        transition: stroke-dashoffset 0.5s ease;
                    "
                />
                ${percent === 100 ? `
                    <path 
                        d="M${size/2 - 4} ${size/2} l3 3 l5 -6" 
                        stroke="${color}" 
                        stroke-width="2" 
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                ` : `
                    <text 
                        x="50%" 
                        y="50%" 
                        text-anchor="middle" 
                        dy=".35em" 
                        font-size="${size > 40 ? 12 : 10}"
                        font-weight="600"
                        fill="#1a2332"
                    >${percent}%</text>
                `}
            </svg>
        `;
    }
};

// ============================================
// MARKDOWN RENDERER
// ============================================
const MarkdownRenderer = {
    /**
     * Convert markdown-like content to HTML
     * @param {string} text - Markdown text
     * @returns {string} HTML string
     */
    render(text) {
        if (!text) return '';
        
        let html = text;
        
        // Escape HTML first (but preserve our special markers)
        html = this.escapeHtml(html);
        
        // Code blocks (```code```)
        html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'text';
            return `<pre class="code-block" data-language="${language}"><code class="language-${language}">${code.trim()}</code><button class="copy-btn" onclick="copyCode(this)" title="Copy code"><i class="fas fa-copy"></i></button></pre>`;
        });
        
        // Inline code (`code`)
        html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        
        // Headers (## Header)
        html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');
        
        // Bold (**text**)
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Italic (*text*)
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Callout boxes
        html = html.replace(/:::tip\n?([\s\S]*?):::/g, '<div class="callout callout-tip"><div class="callout-icon"><i class="fas fa-lightbulb"></i></div><div class="callout-content"><strong>Tip</strong>$1</div></div>');
        html = html.replace(/:::warning\n?([\s\S]*?):::/g, '<div class="callout callout-warning"><div class="callout-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="callout-content"><strong>Warning</strong>$1</div></div>');
        html = html.replace(/:::note\n?([\s\S]*?):::/g, '<div class="callout callout-note"><div class="callout-icon"><i class="fas fa-info-circle"></i></div><div class="callout-content"><strong>Note</strong>$1</div></div>');
        html = html.replace(/:::important\n?([\s\S]*?):::/g, '<div class="callout callout-important"><div class="callout-icon"><i class="fas fa-exclamation-circle"></i></div><div class="callout-content"><strong>Important</strong>$1</div></div>');
        
        // Lists (- item or * item)
        html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
        
        // Numbered lists (1. item)
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        
        // Links [text](url)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        
        // Images ![alt](url)
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="content-image" onclick="openLightbox(this)" />');
        
        // Horizontal rule (---)
        html = html.replace(/^---$/gm, '<hr>');
        
        // Paragraphs (double newline)
        html = html.replace(/\n\n+/g, '</p><p>');
        
        // Single newlines to <br> (but not inside code blocks)
        html = html.replace(/(?<!<\/code>)\n(?!<)/g, '<br>');
        
        // Wrap in paragraph if not already wrapped
        if (!html.startsWith('<')) {
            html = '<p>' + html + '</p>';
        }
        
        return html;
    },
    
    escapeHtml(text) {
        // Don't escape inside code blocks
        const codeBlocks = [];
        text = text.replace(/```[\s\S]*?```/g, (match) => {
            codeBlocks.push(match);
            return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
        });
        
        // Escape HTML
        text = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Restore code blocks
        codeBlocks.forEach((block, i) => {
            text = text.replace(`__CODE_BLOCK_${i}__`, block);
        });
        
        return text;
    }
};

// ============================================
// LESSON RENDERER
// ============================================
const LessonRenderer = {
    /**
     * Render lesson content based on type and content_json
     * @param {Object} lesson - Lesson data from API
     * @returns {string} HTML string
     */
    render(lesson) {
        if (!lesson) return '<p>No lesson data available.</p>';
        
        const contentJson = lesson.content_json;
        
        // Handle different content types
        switch (lesson.content_type) {
            case 'video':
                return this.renderVideoLesson(lesson, contentJson);
            case 'quiz':
                return QuizComponent.render(lesson);
            case 'submission':
                // Check if this is a final project submission
                if (contentJson?.is_final_project || lesson.id?.includes('final-project')) {
                    return FinalProjectComponent.render(lesson);
                }
                return SubmissionComponent.render(lesson);
            case 'text':
            default:
                return this.renderTextLesson(lesson, contentJson);
        }
    },
    
    /**
     * Render a text/reading lesson
     */
    renderTextLesson(lesson, contentJson) {
        if (!contentJson || !contentJson.sections) {
            return `
                <div class="lesson-card">
                    <p>${lesson.description || 'This lesson content is being prepared.'}</p>
                </div>
            `;
        }
        
        const sections = contentJson.sections.map(section => {
            const content = MarkdownRenderer.render(section.content || '');
            return `
                <div class="lesson-section">
                    <h3>${section.title}</h3>
                    ${content}
                </div>
            `;
        }).join('');
        
        // Key Takeaways section removed per user request - content preserved in data
        let keyPoints = '';
        
        // Add resources if available
        let resources = '';
        if (contentJson.resources && contentJson.resources.length > 0) {
            resources = `
                <div class="resources-box">
                    <h4><i class="fas fa-download"></i> Resources</h4>
                    <div class="resources-grid">
                        ${contentJson.resources.map(res => `
                            <a href="${res.url}" target="_blank" class="resource-item">
                                <i class="fas ${this.getResourceIcon(res.type)}"></i>
                                <span>${res.title || res.name || 'Resource'}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="lesson-card">
                ${sections}
                ${keyPoints}
                ${resources}
            </div>
        `;
    },
    
    /**
     * Render a video lesson
     */
    renderVideoLesson(lesson, contentJson) {
        const videoUrl = contentJson?.video_url || '';
        const videoId = this.extractVideoId(videoUrl);
        
        let videoPlayer = '';
        if (videoId) {
            videoPlayer = `
                <div class="video-container">
                    <iframe 
                        src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
            `;
        } else {
            videoPlayer = `
                <div class="video-placeholder">
                    <i class="fas fa-video"></i>
                    <p>Video content coming soon</p>
                </div>
            `;
        }
        
        // Add transcript or description
        let description = '';
        if (contentJson?.sections) {
            description = contentJson.sections.map(section => `
                <div class="lesson-section">
                    <h3>${section.title}</h3>
                    ${MarkdownRenderer.render(section.content || '')}
                </div>
            `).join('');
        } else if (lesson.description) {
            description = `<p>${lesson.description}</p>`;
        }
        
        return `
            <div class="lesson-card">
                ${videoPlayer}
                ${description}
            </div>
        `;
    },
    
    extractVideoId(url) {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
        return match ? match[1] : null;
    },
    
    getResourceIcon(type) {
        const icons = {
            'pdf': 'fa-file-pdf',
            'code': 'fa-file-code',
            'zip': 'fa-file-archive',
            'link': 'fa-external-link-alt',
            'github': 'fa-github'
        };
        return icons[type] || 'fa-file';
    }
};

// ============================================
// QUIZ COMPONENT
// ============================================
const QuizComponent = {
    currentQuiz: null,
    currentQuestion: 0,
    answers: [],
    answeredQuestions: [], // Track which questions have been answered (for instant feedback)
    correctAnswers: [], // Track correct/incorrect for each question
    submitted: false,
    
    /**
     * Render quiz interface
     * @param {Object} lesson - Lesson data with questions
     * @returns {string} HTML string
     */
    render(lesson) {
        if (!lesson.questions || lesson.questions.length === 0) {
            return `
                <div class="lesson-card">
                    <div class="quiz-empty">
                        <i class="fas fa-question-circle"></i>
                        <p>Quiz questions are being prepared for this lesson.</p>
                    </div>
                </div>
            `;
        }
        
        this.currentQuiz = lesson;
        this.currentQuestion = 0;
        this.answers = new Array(lesson.questions.length).fill(null);
        this.answeredQuestions = new Array(lesson.questions.length).fill(false);
        this.correctAnswers = new Array(lesson.questions.length).fill(null);
        this.submitted = false;
        
        return `
            <div class="lesson-card quiz-container" id="quizContainer">
                <div class="quiz-header">
                    <div class="quiz-title">
                        <i class="fas fa-clipboard-check"></i>
                        <span>Knowledge Check</span>
                    </div>
                    <div class="quiz-progress-info">
                        <span id="quizProgressText">Question 1 of ${lesson.questions.length}</span>
                        <div class="quiz-progress-dots" id="quizProgressDots">
                            ${this.renderProgressDots(lesson.questions.length)}
                        </div>
                    </div>
                </div>
                
                <!-- Streak Indicator - Cognitive Reward -->
                <div class="quiz-streak" id="quizStreak" style="display: none;">
                    <i class="fas fa-fire"></i>
                    <span id="streakCount">0</span> correct in a row
                </div>
                
                <div class="quiz-questions" id="quizQuestions">
                    ${this.renderQuestions(lesson.questions)}
                </div>
                
                <div class="quiz-navigation">
                    <button class="quiz-nav-btn" id="quizPrevBtn" onclick="QuizComponent.prevQuestion()" disabled>
                        <i class="fas fa-arrow-left"></i> Previous
                    </button>
                    <button class="quiz-nav-btn primary" id="quizNextBtn" onclick="QuizComponent.nextQuestion()">
                        Next <i class="fas fa-arrow-right"></i>
                    </button>
                    <button class="quiz-nav-btn success" id="quizSubmitBtn" onclick="QuizComponent.submit()" style="display: none;">
                        <i class="fas fa-check"></i> Submit Quiz
                    </button>
                </div>
                
                <div class="quiz-results" id="quizResults" style="display: none;"></div>
            </div>
        `;
    },
    
    /**
     * Render clickable progress dots
     */
    renderProgressDots(count) {
        return Array.from({length: count}, (_, i) => `
            <button class="progress-dot ${i === 0 ? 'current' : ''}" 
                    data-question="${i}" 
                    onclick="QuizComponent.goToQuestion(${i})"
                    title="Question ${i + 1}"
                    aria-label="Go to question ${i + 1}"></button>
        `).join('');
    },
    
    /**
     * Navigate to specific question
     */
    goToQuestion(index) {
        if (index >= 0 && index < this.currentQuiz.questions.length) {
            this.showQuestion(index);
        }
    },
    
    /**
     * Update progress dots visual state
     */
    updateProgressDots() {
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('current', 'answered', 'correct', 'incorrect');
            
            if (i === this.currentQuestion) {
                dot.classList.add('current');
            }
            
            if (this.answeredQuestions[i]) {
                dot.classList.add('answered');
                if (this.correctAnswers[i] === true) {
                    dot.classList.add('correct');
                } else if (this.correctAnswers[i] === false) {
                    dot.classList.add('incorrect');
                }
            }
        });
    },
    
    /**
     * Calculate and update streak
     */
    updateStreak() {
        let streak = 0;
        // Count consecutive correct answers from the end
        for (let i = this.correctAnswers.length - 1; i >= 0; i--) {
            if (this.correctAnswers[i] === true) {
                streak++;
            } else if (this.correctAnswers[i] === false) {
                break;
            }
        }
        
        // Also check from beginning for continuous streak
        let frontStreak = 0;
        for (let i = 0; i < this.correctAnswers.length; i++) {
            if (this.correctAnswers[i] === true) {
                frontStreak++;
            } else {
                break;
            }
        }
        
        streak = Math.max(streak, frontStreak);
        
        const streakEl = document.getElementById('quizStreak');
        const streakCount = document.getElementById('streakCount');
        
        if (streak >= 2) {
            streakEl.style.display = 'flex';
            streakCount.textContent = streak;
            // Add animation
            streakEl.classList.remove('streak-pulse');
            void streakEl.offsetWidth; // Trigger reflow
            streakEl.classList.add('streak-pulse');
        } else {
            streakEl.style.display = 'none';
        }
    },
    
    renderQuestions(questions) {
        return questions.map((q, index) => `
            <div class="quiz-question ${index === 0 ? 'active' : ''}" data-question="${index}">
                <div class="question-text">
                    <span class="question-number">Q${index + 1}.</span>
                    ${q.question_text}
                </div>
                ${q.image_url ? `<img src="${q.image_url}" alt="Question image" class="question-image">` : ''}
                
                <!-- Confidence Indicator - Before answering -->
                <div class="confidence-indicator" id="confidence_${index}">
                    <span class="confidence-label">How confident are you?</span>
                    <div class="confidence-buttons">
                        <button class="confidence-btn" data-level="low" onclick="QuizComponent.setConfidence(${index}, 'low')">
                            <i class="fas fa-meh"></i> Guessing
                        </button>
                        <button class="confidence-btn" data-level="medium" onclick="QuizComponent.setConfidence(${index}, 'medium')">
                            <i class="fas fa-smile"></i> Mostly Sure
                        </button>
                        <button class="confidence-btn" data-level="high" onclick="QuizComponent.setConfidence(${index}, 'high')">
                            <i class="fas fa-grin-stars"></i> Confident
                        </button>
                    </div>
                </div>
                
                <div class="question-options">
                    ${this.renderOptions(q.options_json, index, q.correct_answer)}
                </div>
                <div class="question-feedback" id="feedback_${index}" style="display: none;">
                    <div class="feedback-content"></div>
                </div>
                
                <!-- Explanation Reveal - After answering -->
                ${q.explanation ? `
                    <div class="explanation-reveal" id="explanation_${index}" style="display: none;">
                        <button class="explanation-toggle" onclick="QuizComponent.toggleExplanation(${index})">
                            <i class="fas fa-lightbulb" id="explanationIcon_${index}"></i>
                            <span id="explanationLabel_${index}">Why this is the answer</span>
                            <i class="fas fa-chevron-down explanation-arrow"></i>
                        </button>
                        <div class="explanation-content" id="explanationContent_${index}">
                            <p>${q.explanation}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `).join('');
    },
    
    /**
     * Set confidence level before answering
     */
    confidenceLevels: [],
    
    setConfidence(questionIndex, level) {
        this.confidenceLevels[questionIndex] = level;
        
        // Update UI
        const buttons = document.querySelectorAll(`#confidence_${questionIndex} .confidence-btn`);
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === level) {
                btn.classList.add('active');
            }
        });
    },
    
    /**
     * Toggle explanation visibility
     */
    toggleExplanation(questionIndex) {
        const content = document.getElementById(`explanationContent_${questionIndex}`);
        const reveal = document.getElementById(`explanation_${questionIndex}`);
        
        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            reveal.classList.remove('expanded');
        } else {
            content.classList.add('expanded');
            reveal.classList.add('expanded');
        }
    },
    
    renderOptions(options, questionIndex, correctAnswer) {
        if (!Array.isArray(options)) {
            try {
                options = JSON.parse(options);
            } catch {
                options = [];
            }
        }
        
        // correctAnswer can be either an index (number) or the text of the correct option (string)
        let correctAnswerIndex;
        if (typeof correctAnswer === 'number') {
            correctAnswerIndex = correctAnswer;
        } else {
            // correctAnswer is the text - find its index
            correctAnswerIndex = options.findIndex(opt => opt === correctAnswer);
            if (correctAnswerIndex === -1) {
                // Fallback: try case-insensitive match
                correctAnswerIndex = options.findIndex(opt => 
                    opt.toLowerCase().trim() === String(correctAnswer).toLowerCase().trim()
                );
            }
        }
        
        return options.map((option, optIndex) => `
            <label class="quiz-option" data-question="${questionIndex}" data-option="${optIndex}" data-correct="${optIndex === correctAnswerIndex}">
                <input type="radio" name="question_${questionIndex}" value="${optIndex}" 
                       onchange="QuizComponent.selectAnswer(${questionIndex}, ${optIndex})">
                <span class="option-indicator">${String.fromCharCode(65 + optIndex)}</span>
                <span class="option-text">${option}</span>
                <span class="option-feedback-icon"></span>
            </label>
        `).join('');
    },
    
    selectAnswer(questionIndex, optionIndex) {
        // If already correctly answered this question, don't allow changing
        if (this.answeredQuestions[questionIndex] && this.correctAnswers[questionIndex]) {
            return;
        }
        
        this.answers[questionIndex] = optionIndex;
        
        const question = this.currentQuiz.questions[questionIndex];
        
        // Parse options if it's a string
        let options = question.options_json;
        if (typeof options === 'string') {
            try {
                options = JSON.parse(options);
            } catch {
                options = [];
            }
        }
        
        // correct_answer can be either an index (number) or the text of the correct option (string)
        // Find the correct answer index
        let correctAnswerIndex;
        if (typeof question.correct_answer === 'number') {
            correctAnswerIndex = question.correct_answer;
        } else {
            // correct_answer is the text of the correct option - find its index
            correctAnswerIndex = options.findIndex(opt => opt === question.correct_answer);
            if (correctAnswerIndex === -1) {
                // Fallback: try case-insensitive match
                correctAnswerIndex = options.findIndex(opt => 
                    opt.toLowerCase().trim() === String(question.correct_answer).toLowerCase().trim()
                );
            }
        }
        
        const isCorrect = optionIndex === correctAnswerIndex;
        
        // Hide confidence indicator after answering
        const confidenceEl = document.getElementById(`confidence_${questionIndex}`);
        if (confidenceEl) {
            confidenceEl.style.display = 'none';
        }
        
        // Get confidence for feedback
        const confidence = this.confidenceLevels[questionIndex] || 'medium';
        let confidenceText = '';
        if (isCorrect && confidence === 'low') {
            confidenceText = ' Lucky guess became knowledge.';
        } else if (!isCorrect && confidence === 'high') {
            confidenceText = ' Overconfidence can mislead - review this topic.';
        }
        
        // Show feedback message
        const feedbackEl = document.getElementById(`feedback_${questionIndex}`);
        const feedbackContent = feedbackEl.querySelector('.feedback-content');
        
        if (isCorrect) {
            // Mark as answered only when correct
            this.answeredQuestions[questionIndex] = true;
            this.correctAnswers[questionIndex] = true;
            
            // Update option styling - disable all options
            const optionEls = document.querySelectorAll(`.quiz-option[data-question="${questionIndex}"]`);
            optionEls.forEach((opt, i) => {
                const input = opt.querySelector('input');
                input.disabled = true;
                opt.classList.remove('selected', 'incorrect');
                
                if (i === optionIndex) {
                    opt.classList.add('selected', 'correct');
                }
                if (i === correctAnswerIndex) {
                    opt.classList.add('correct-answer');
                }
            });
            
            feedbackContent.innerHTML = `
                <div class="feedback-correct">
                    <i class="fas fa-check-circle"></i>
                    <span>Correct! Well done.${confidenceText}</span>
                </div>
            `;
            
            // Show explanation with "Why this is the answer" label (correct mode)
            const explanationEl = document.getElementById(`explanation_${questionIndex}`);
            if (explanationEl) {
                explanationEl.style.display = 'block';
                explanationEl.classList.remove('incorrect-mode');
                explanationEl.classList.add('correct-mode');
                // Update the label text
                const labelEl = document.getElementById(`explanationLabel_${questionIndex}`);
                if (labelEl) {
                    labelEl.textContent = 'Why this is the answer';
                }
                // Change icon to success
                const iconEl = document.getElementById(`explanationIcon_${questionIndex}`);
                if (iconEl) {
                    iconEl.className = 'fas fa-lightbulb';
                }
            }
            
            // Update progress dots and streak
            this.updateProgressDots();
            this.updateStreak();
            
        } else {
            // Wrong answer - allow retry
            this.correctAnswers[questionIndex] = false;
            
            // Mark the selected option as incorrect but don't disable others
            const optionEls = document.querySelectorAll(`.quiz-option[data-question="${questionIndex}"]`);
            optionEls.forEach((opt, i) => {
                opt.classList.remove('selected', 'incorrect', 'correct', 'correct-answer');
                const input = opt.querySelector('input');
                
                if (i === optionIndex) {
                    opt.classList.add('selected', 'incorrect');
                    input.disabled = true; // Only disable the wrong choice
                }
            });
            
            const correctOptionText = options[correctAnswerIndex] || 'the highlighted option';
            feedbackContent.innerHTML = `
                <div class="feedback-incorrect">
                    <i class="fas fa-times-circle"></i>
                    <span>Incorrect.${confidenceText} Try again!</span>
                </div>
            `;
            
            // Show explanation with "Why this is incorrect" label
            const explanationEl = document.getElementById(`explanation_${questionIndex}`);
            if (explanationEl) {
                explanationEl.style.display = 'block';
                explanationEl.classList.add('incorrect-mode');
                // Update the label text
                const labelEl = document.getElementById(`explanationLabel_${questionIndex}`);
                if (labelEl) {
                    labelEl.textContent = 'Why this is incorrect';
                }
                // Change icon to indicate error/learning
                const iconEl = document.getElementById(`explanationIcon_${questionIndex}`);
                if (iconEl) {
                    iconEl.className = 'fas fa-exclamation-circle';
                }
            }
            
            // Update progress dots
            this.updateProgressDots();
        }
        
        feedbackEl.style.display = 'block';
        
        // NO auto-advance - user controls navigation
        // Enable submit if all answered correctly
        this.updateNavigation();
    },
    
    nextQuestion() {
        if (this.currentQuestion < this.currentQuiz.questions.length - 1) {
            this.showQuestion(this.currentQuestion + 1);
        }
    },
    
    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.showQuestion(this.currentQuestion - 1);
        }
    },
    
    showQuestion(index) {
        this.currentQuestion = index;
        
        // Update question visibility with smooth transition
        document.querySelectorAll('.quiz-question').forEach((q, i) => {
            q.classList.toggle('active', i === index);
        });
        
        // Update progress text
        const total = this.currentQuiz.questions.length;
        document.getElementById('quizProgressText').textContent = `Question ${index + 1} of ${total}`;
        
        // Update progress dots
        this.updateProgressDots();
        
        this.updateNavigation();
    },
    
    updateNavigation() {
        const prevBtn = document.getElementById('quizPrevBtn');
        const nextBtn = document.getElementById('quizNextBtn');
        const submitBtn = document.getElementById('quizSubmitBtn');
        const total = this.currentQuiz.questions.length;
        const isLast = this.currentQuestion === total - 1;
        const allAnsweredCorrectly = this.correctAnswers.every(a => a === true);
        
        // Check if current question is answered correctly
        const currentQuestionCorrect = this.correctAnswers[this.currentQuestion] === true;
        
        prevBtn.disabled = this.currentQuestion === 0;
        
        // Next button: only enabled if current question is answered correctly
        nextBtn.style.display = isLast ? 'none' : 'flex';
        nextBtn.disabled = !currentQuestionCorrect;
        
        // Submit button: only on last question and only if ALL questions answered correctly
        submitBtn.style.display = isLast ? 'flex' : 'none';
        submitBtn.disabled = !allAnsweredCorrectly;
    },
    
    async submit() {
        if (this.submitted) return;
        this.submitted = true;
        
        const submitBtn = document.getElementById('quizSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        try {
            const result = await CourseAPI.submitQuiz(
                this.currentQuiz.id,
                this.answers,
                CourseAPI.currentCourse
            );
            
            this.showResults(result);
        } catch (error) {
            console.error('Quiz submit error:', error);
            submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error - Try Again';
            submitBtn.disabled = false;
            this.submitted = false;
        }
    },
    
    showResults(result) {
        const container = document.getElementById('quizContainer');
        const questionsEl = document.getElementById('quizQuestions');
        const navEl = document.querySelector('.quiz-navigation');
        const resultsEl = document.getElementById('quizResults');
        
        // Hide questions and nav
        questionsEl.style.display = 'none';
        navEl.style.display = 'none';
        
        // Calculate score from instant feedback results
        const correctCount = this.currentQuiz.questions.reduce((count, q, i) => {
            return count + (this.answers[i] === q.correct_answer ? 1 : 0);
        }, 0);
        const total = this.currentQuiz.questions.length;
        const percent = Math.round((correctCount / total) * 100);
        const passed = percent >= 70;
        
        resultsEl.innerHTML = `
            <div class="results-content ${passed ? 'passed' : 'failed'}">
                <div class="results-icon">
                    <i class="fas ${passed ? 'fa-trophy' : 'fa-redo'}"></i>
                </div>
                <div class="results-score">${percent}%</div>
                <div class="results-text">
                    ${passed 
                        ? 'Great job! You passed the quiz.' 
                        : 'Keep practicing! You need 70% to pass.'}
                </div>
                <div class="results-details">
                    <span><i class="fas fa-check-circle"></i> ${correctCount} correct</span>
                    <span><i class="fas fa-times-circle"></i> ${total - correctCount} incorrect</span>
                </div>
                <div class="results-actions">
                    ${passed 
                        ? `<button class="quiz-nav-btn success" onclick="completeAndNext('${this.currentQuiz.id}', '${this.currentQuiz.nextLesson?.id || ''}')">
                               Continue to Next Lesson <i class="fas fa-arrow-right"></i>
                           </button>`
                        : `<button class="quiz-nav-btn primary" onclick="QuizComponent.retry()">
                               <i class="fas fa-redo"></i> Try Again
                           </button>`
                    }
                    <button class="quiz-nav-btn" onclick="QuizComponent.reviewAnswers()">
                        <i class="fas fa-search"></i> Review Answers
                    </button>
                </div>
            </div>
        `;
        resultsEl.style.display = 'block';
    },
    
    retry() {
        this.answers = new Array(this.currentQuiz.questions.length).fill(null);
        this.answeredQuestions = new Array(this.currentQuiz.questions.length).fill(false);
        this.correctAnswers = new Array(this.currentQuiz.questions.length).fill(null);
        this.confidenceLevels = [];
        this.submitted = false;
        this.currentQuestion = 0;
        
        // Reset UI
        document.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect', 'correct-answer');
            const input = opt.querySelector('input');
            input.checked = false;
            input.disabled = false;
        });
        
        // Hide all feedback and explanations
        document.querySelectorAll('.question-feedback').forEach(fb => {
            fb.style.display = 'none';
        });
        document.querySelectorAll('.explanation-reveal').forEach(exp => {
            exp.style.display = 'none';
            exp.classList.remove('expanded');
            const content = exp.querySelector('.explanation-content');
            if (content) content.classList.remove('expanded');
        });
        
        // Show confidence indicators again
        document.querySelectorAll('.confidence-indicator').forEach(ci => {
            ci.style.display = 'flex';
            ci.querySelectorAll('.confidence-btn').forEach(btn => btn.classList.remove('active'));
        });
        
        // Hide streak
        document.getElementById('quizStreak').style.display = 'none';
        
        // Reset progress dots
        document.querySelectorAll('.progress-dot').forEach(dot => {
            dot.classList.remove('answered', 'correct', 'incorrect');
        });
        
        document.getElementById('quizQuestions').style.display = 'block';
        document.querySelector('.quiz-navigation').style.display = 'flex';
        document.getElementById('quizResults').style.display = 'none';
        
        this.showQuestion(0);
    },
    
    reviewAnswers() {
        // Show all questions with their feedback
        document.getElementById('quizResults').style.display = 'none';
        document.getElementById('quizQuestions').style.display = 'block';
        document.querySelector('.quiz-navigation').style.display = 'flex';
        
        // Show all questions expanded (remove active toggling)
        document.querySelectorAll('.quiz-question').forEach(q => {
            q.classList.add('active');
        });
        
        // Update navigation for review mode
        document.getElementById('quizPrevBtn').style.display = 'none';
        document.getElementById('quizNextBtn').style.display = 'none';
        
        const submitBtn = document.getElementById('quizSubmitBtn');
        submitBtn.innerHTML = '<i class="fas fa-redo"></i> Try Again';
        submitBtn.style.display = 'flex';
        submitBtn.disabled = false;
        submitBtn.onclick = () => QuizComponent.retry();
    }
};

// ============================================
// SUBMISSION COMPONENT
// ============================================
const SubmissionComponent = {
    files: [],
    
    render(lesson) {
        const contentJson = lesson.content_json || {};
        const requirements = contentJson.requirements || [];
        
        return `
            <div class="lesson-card submission-container">
                <div class="submission-header">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <h3>Project Checkpoint</h3>
                    <p>Submit your work to verify your progress and get feedback.</p>
                </div>
                
                ${requirements.length > 0 ? `
                    <div class="submission-requirements">
                        <h4><i class="fas fa-clipboard-list"></i> Requirements</h4>
                        <ul>
                            ${requirements.map(req => `<li><i class="far fa-square"></i> ${req}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="upload-zone" id="uploadZone" 
                     ondrop="SubmissionComponent.handleDrop(event)" 
                     ondragover="SubmissionComponent.handleDragOver(event)"
                     ondragleave="SubmissionComponent.handleDragLeave(event)"
                     onclick="document.getElementById('fileInput').click()">
                    <input type="file" id="fileInput" multiple accept="image/*,.zip,.pdf" 
                           onchange="SubmissionComponent.handleFiles(this.files)" style="display:none">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p><strong>Drop files here</strong> or click to browse</p>
                    <span class="upload-hint">Images, ZIP files, or PDFs up to 10MB each</span>
                </div>
                
                <div class="upload-preview" id="uploadPreview"></div>
                
                <div class="submission-form">
                    <div class="form-group">
                        <label for="submissionNotes">Notes (optional)</label>
                        <textarea id="submissionNotes" placeholder="Describe your implementation, any challenges faced, or questions..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="videoUrl">Demo Video URL (optional)</label>
                        <input type="url" id="videoUrl" placeholder="https://youtube.com/watch?v=...">
                    </div>
                </div>
                
                <button class="submit-btn" id="submitProjectBtn" onclick="SubmissionComponent.submit('${lesson.id}')" disabled>
                    <i class="fas fa-paper-plane"></i> Submit for Review
                </button>
                
                <div class="submission-status" id="submissionStatus"></div>
            </div>
        `;
    },
    
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    },
    
    handleDragLeave(e) {
        e.currentTarget.classList.remove('dragover');
    },
    
    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        this.handleFiles(e.dataTransfer.files);
    },
    
    handleFiles(fileList) {
        const preview = document.getElementById('uploadPreview');
        
        Array.from(fileList).forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                alert(`File ${file.name} is too large. Max 10MB.`);
                return;
            }
            
            this.files.push(file);
            
            const item = document.createElement('div');
            item.className = 'preview-item';
            
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    item.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}">
                        <button class="remove-btn" onclick="SubmissionComponent.removeFile(${this.files.length - 1})">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                item.innerHTML = `
                    <div class="file-icon">
                        <i class="fas ${file.name.endsWith('.zip') ? 'fa-file-archive' : 'fa-file-pdf'}"></i>
                    </div>
                    <span class="file-name">${file.name}</span>
                    <button class="remove-btn" onclick="SubmissionComponent.removeFile(${this.files.length - 1})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }
            
            preview.appendChild(item);
        });
        
        this.updateSubmitButton();
    },
    
    removeFile(index) {
        this.files.splice(index, 1);
        this.refreshPreview();
        this.updateSubmitButton();
    },
    
    refreshPreview() {
        const preview = document.getElementById('uploadPreview');
        preview.innerHTML = '';
        
        this.files.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'preview-item';
            
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    item.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}">
                        <button class="remove-btn" onclick="SubmissionComponent.removeFile(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                item.innerHTML = `
                    <div class="file-icon">
                        <i class="fas ${file.name.endsWith('.zip') ? 'fa-file-archive' : 'fa-file-pdf'}"></i>
                    </div>
                    <span class="file-name">${file.name}</span>
                    <button class="remove-btn" onclick="SubmissionComponent.removeFile(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }
            
            preview.appendChild(item);
        });
    },
    
    updateSubmitButton() {
        const btn = document.getElementById('submitProjectBtn');
        btn.disabled = this.files.length === 0;
    },
    
    async submit(lessonId) {
        const btn = document.getElementById('submitProjectBtn');
        const status = document.getElementById('submissionStatus');
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        try {
            // Upload files first
            const uploadedUrls = [];
            for (const file of this.files) {
                const result = await CourseAPI.uploadFile(file);
                uploadedUrls.push(result.url);
            }
            
            // Submit project
            const notes = document.getElementById('submissionNotes').value;
            const videoUrl = document.getElementById('videoUrl').value;
            
            await CourseAPI.submitProject(lessonId, {
                photoUrls: uploadedUrls,
                videoUrl: videoUrl || null,
                description: notes
            });
            
            status.innerHTML = `
                <div class="status-success">
                    <i class="fas fa-check-circle"></i>
                    <span>Submitted successfully! Your work is pending review.</span>
                </div>
            `;
            
            btn.innerHTML = '<i class="fas fa-check"></i> Submitted';
            
        } catch (error) {
            console.error('Submission error:', error);
            status.innerHTML = `
                <div class="status-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Submission failed. Please try again.</span>
                </div>
            `;
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit for Review';
        }
    }
};

// ============================================
// FINAL PROJECT SUBMISSION COMPONENT
// ============================================
const FinalProjectComponent = {
    files: [],
    
    render(lesson) {
        const contentJson = lesson.content_json || {};
        const requirements = contentJson.requirements || [
            'Complete working project code in a ZIP file',
            'Video demonstration showing your project working',
            'Brief description of your implementation approach'
        ];
        
        return `
            <div class="lesson-card final-project-container">
                <div class="final-project-header">
                    <i class="fas fa-trophy"></i>
                    <h3>Final Project Submission</h3>
                    <p>Congratulations on reaching the end of the course! Submit your completed project for review and certification.</p>
                </div>
                
                <div class="submission-requirements">
                    <h4><i class="fas fa-clipboard-list"></i> Submission Requirements</h4>
                    <ul>
                        ${requirements.map(req => `<li><i class="far fa-check-circle"></i> ${req}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="upload-zone final-upload-zone" id="finalUploadZone" 
                     ondrop="FinalProjectComponent.handleDrop(event)" 
                     ondragover="FinalProjectComponent.handleDragOver(event)"
                     ondragleave="FinalProjectComponent.handleDragLeave(event)"
                     onclick="document.getElementById('finalFileInput').click()">
                    <input type="file" id="finalFileInput" accept=".zip,.rar,.7z,.tar.gz" 
                           onchange="FinalProjectComponent.handleFiles(this.files)" style="display:none">
                    <i class="fas fa-file-archive"></i>
                    <p><strong>Upload Project ZIP</strong></p>
                    <span class="upload-hint">ZIP, RAR, or 7z up to 50MB</span>
                </div>
                
                <div class="upload-preview" id="finalUploadPreview"></div>
                
                <div class="submission-form">
                    <div class="form-group">
                        <label for="finalVideoUrl"><i class="fas fa-video"></i> Demo Video Link (Required)</label>
                        <input type="url" id="finalVideoUrl" placeholder="https://youtube.com/watch?v=... or https://drive.google.com/..."
                               onchange="FinalProjectComponent.updateSubmitButton()">
                        <small class="form-hint">YouTube, Google Drive, Vimeo, or Loom link showing your project in action</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="finalDescription"><i class="fas fa-align-left"></i> Project Description (Required)</label>
                        <textarea id="finalDescription" rows="6" placeholder="Describe your implementation:
- What approach did you take?
- Any modifications or improvements from the base project?
- Challenges you faced and how you solved them
- What you learned from this project"
                                  onchange="FinalProjectComponent.updateSubmitButton()"></textarea>
                        <small class="form-hint">Minimum 100 characters</small>
                    </div>
                </div>
                
                <button class="submit-btn final-submit-btn" id="finalSubmitBtn" onclick="FinalProjectComponent.submit('${lesson.id}')" disabled>
                    <i class="fas fa-award"></i> Submit Final Project
                </button>
                
                <div class="submission-status" id="finalSubmissionStatus"></div>
            </div>
        `;
    },
    
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    },
    
    handleDragLeave(e) {
        e.currentTarget.classList.remove('dragover');
    },
    
    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        this.handleFiles(e.dataTransfer.files);
    },
    
    handleFiles(fileList) {
        const preview = document.getElementById('finalUploadPreview');
        // Clear previous files - only allow one ZIP for final project
        this.files = [];
        preview.innerHTML = '';
        
        const file = fileList[0];
        if (!file) return;
        
        if (file.size > 50 * 1024 * 1024) {
            alert('File is too large. Maximum size is 50MB.');
            return;
        }
        
        const validExtensions = ['.zip', '.rar', '.7z', '.tar.gz'];
        const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        if (!hasValidExt) {
            alert('Please upload a ZIP, RAR, 7z, or tar.gz archive.');
            return;
        }
        
        this.files.push(file);
        
        const item = document.createElement('div');
        item.className = 'preview-item final-preview-item';
        item.innerHTML = `
            <div class="file-icon large">
                <i class="fas fa-file-archive"></i>
            </div>
            <div class="file-details">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <button class="remove-btn" onclick="FinalProjectComponent.removeFile()">
                <i class="fas fa-times"></i>
            </button>
        `;
        preview.appendChild(item);
        
        this.updateSubmitButton();
    },
    
    removeFile() {
        this.files = [];
        document.getElementById('finalUploadPreview').innerHTML = '';
        this.updateSubmitButton();
    },
    
    updateSubmitButton() {
        const videoUrl = document.getElementById('finalVideoUrl')?.value.trim() || '';
        const description = document.getElementById('finalDescription')?.value.trim() || '';
        const btn = document.getElementById('finalSubmitBtn');
        
        // Require: file, video URL, and description (min 100 chars)
        const isValid = this.files.length > 0 && 
                       videoUrl.length > 0 && 
                       description.length >= 100;
        
        if (btn) {
            btn.disabled = !isValid;
            btn.classList.toggle('ready', isValid);
        }
    },
    
    async submit(lessonId) {
        const btn = document.getElementById('finalSubmitBtn');
        const status = document.getElementById('finalSubmissionStatus');
        const videoUrl = document.getElementById('finalVideoUrl').value.trim();
        const description = document.getElementById('finalDescription').value.trim();
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        try {
            // Upload files first
            const uploadedUrls = [];
            for (const file of this.files) {
                const formData = new FormData();
                formData.append('file', file);
                
                const uploadRes = await fetch('/api/course/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadRes.ok) {
                    throw new Error('File upload failed');
                }
                
                const uploadData = await uploadRes.json();
                uploadedUrls.push(uploadData.url);
            }
            
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            
            // Submit the final project
            const res = await fetch('/api/course/final-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    courseId: typeof COURSE_ID !== 'undefined' ? COURSE_ID : '',
                    fileUrls: uploadedUrls,
                    videoUrl,
                    description
                })
            });
            
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Submission failed');
            }
            
            status.innerHTML = `
                <div class="status-success final-status-success">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <strong>Final Project Submitted!</strong>
                        <p>Your project has been received and our team has been notified. You will receive feedback within 3-5 business days.</p>
                    </div>
                </div>
            `;
            
            btn.innerHTML = '<i class="fas fa-check"></i> Submitted Successfully';
            btn.classList.add('submitted');
            
        } catch (error) {
            console.error('Final project submission error:', error);
            status.innerHTML = `
                <div class="status-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Submission failed: ${error.message}. Please try again.</span>
                </div>
            `;
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-award"></i> Submit Final Project';
        }
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function copyCode(button) {
    const pre = button.closest('pre');
    const code = pre.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        button.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    });
}

function openLightbox(img) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="${img.src}" alt="${img.alt}">
            <button class="lightbox-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    lightbox.onclick = (e) => {
        if (e.target === lightbox) lightbox.remove();
    };
    document.body.appendChild(lightbox);
}

// Export components
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProgressRing, MarkdownRenderer, LessonRenderer, QuizComponent, SubmissionComponent, FinalProjectComponent };
}
