// AIGP Exam Simulation Application
// Modular architecture with JSON-based question banks

class AIGPExamApp {
    constructor() {
        this.LS_PREFIX = 'aigp-sim:v1';
        this.manifest = null;
        this.currentPaper = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.examStartTime = null;
        this.examEndTime = null;
        this.timerInterval = null;
        this.timeRemaining = 0;
        this.selectedPaperId = null;
        
        this.init();
    }

    // Initialization
    async init() {
        try {
            await this.loadManifest();
            this.renderPaperPicker();
            this.setupEventListeners();
            await this.checkForSavedState();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load exam data. Please refresh the page.');
        }
    }

    // Manifest and Paper Loading
    async loadManifest() {
        try {
            const response = await fetch('./banks/index.json', { cache: 'no-store' });
            if (!response.ok) throw new Error('Failed to load manifest');
            this.manifest = await response.json();
        } catch (error) {
            throw new Error('Could not load exam manifest: ' + error.message);
        }
    }

    async loadPaper(paperId) {
        try {
            const response = await fetch(`./banks/${paperId}.json`, { cache: 'no-store' });
            if (!response.ok) throw new Error('Failed to load paper');
            const paper = await response.json();
            
            // Add scenario context to questions
            paper.items.forEach(item => {
                if (item.scenarioId && paper.scenarios && paper.scenarios[item.scenarioId]) {
                    item.scenarioContext = paper.scenarios[item.scenarioId];
                }
            });
            
            return paper;
        } catch (error) {
            throw new Error(`Could not load paper ${paperId}: ${error.message}`);
        }
    }

    // Paper Picker UI
    renderPaperPicker() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const existingPicker = welcomeScreen.querySelector('.paper-picker');
        if (existingPicker) existingPicker.remove();

        const pickerHTML = `
            <div class="paper-picker">
                <h3>Select Practice Paper</h3>
                <div id="paper-options">
                    ${this.manifest.papers.map(paper => `
                        <div class="paper-option" data-paper-id="${paper.id}">
                            <input type="radio" name="paper-selection" value="${paper.id}" id="${paper.id}">
                            <div class="paper-details">
                                <div class="paper-title">${paper.title}</div>
                                <div class="paper-description">${paper.description || 'Complete AIGP certification practice exam'}</div>
                                <div class="paper-meta">${paper.questions} questions • ${paper.minutes} minutes</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const examInfo = welcomeScreen.querySelector('.exam-info');
        examInfo.insertAdjacentHTML('beforebegin', pickerHTML);

        // Add click handlers for paper selection
        document.querySelectorAll('.paper-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const paperId = option.dataset.paperId;
                this.selectPaper(paperId);
            });
        });
    }

    selectPaper(paperId) {
        this.selectedPaperId = paperId;
        
        // Update UI
        document.querySelectorAll('.paper-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector(`[data-paper-id="${paperId}"]`).classList.add('selected');
        document.querySelector(`#${paperId}`).checked = true;
        
        // Update exam info
        const selectedPaper = this.manifest.papers.find(p => p.id === paperId);
        this.updateExamInfo(selectedPaper);
        
        // Enable start button
        const startBtn = document.querySelector('.btn[onclick="startExam()"]');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = `Start ${selectedPaper.title}`;
        }
    }

    updateExamInfo(paper) {
        const examInfo = document.querySelector('.exam-info');
        const list = examInfo.querySelector('ul');
        list.innerHTML = `
            <li><strong>Duration:</strong> ${Math.floor(paper.minutes / 60)} hours ${paper.minutes % 60} minutes (${paper.minutes} minutes)</li>
            <li><strong>Questions:</strong> ${paper.questions} multiple-choice questions</li>
            <li><strong>Format:</strong> 4-option multiple choice (A, B, C, D)</li>
            <li><strong>Passing Score:</strong> 300 out of 500 (scaled scoring)</li>
            <li><strong>Question Types:</strong> Direct recall and scenario-based case studies</li>
            <li><strong>Coverage:</strong> All 7 AIGP modules</li>
        `;
    }

    // Event Listeners
    setupEventListeners() {
        // Make functions globally available for onclick handlers
        window.startExam = () => this.startExam();
        window.previousQuestion = () => this.previousQuestion();
        window.nextQuestion = () => this.nextQuestion();
        window.jumpToQuestion = (index) => this.jumpToQuestion(index);
        window.selectOption = (index) => this.selectOption(index);
        window.submitExam = () => this.submitExam();
        window.restartExam = () => this.restartExam();
        window.showWelcome = () => this.showWelcome();
        window.showQuestionPalette = () => this.showQuestionPalette();
    }

    // Namespaced Local Storage
    ns(paperId, key) {
        return `${this.LS_PREFIX}:${paperId}:${key}`;
    }

    saveState(paperId, state) {
        try {
            localStorage.setItem(this.ns(paperId, 'state'), JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save state:', error);
        }
    }

    loadState(paperId) {
        try {
            const saved = localStorage.getItem(this.ns(paperId, 'state'));
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.warn('Failed to load state:', error);
            return null;
        }
    }

    clearState(paperId) {
        try {
            localStorage.removeItem(this.ns(paperId, 'state'));
        } catch (error) {
            console.warn('Failed to clear state:', error);
        }
    }

    async checkForSavedState() {
        // Check if there's a saved state for any paper
        for (const paper of this.manifest.papers) {
            const state = this.loadState(paper.id);
            if (state && state.examStartTime) {
                const shouldResume = confirm(
                    `You have an unfinished exam for "${paper.title}". Would you like to resume it?`
                );
                if (shouldResume) {
                    this.selectedPaperId = paper.id;
                    await this.resumeExam(state);
                    return;
                }
            }
        }
    }

    async resumeExam(state) {
        try {
            this.currentPaper = await this.loadPaper(this.selectedPaperId);
            this.currentQuestionIndex = state.currentQuestionIndex || 0;
            this.userAnswers = state.userAnswers || {};
            this.examStartTime = new Date(state.examStartTime);
            this.timeRemaining = state.timeRemaining || this.currentPaper.minutes * 60;
            
            this.showScreen('exam-screen');
            this.generateQuestionPalette();
            this.displayQuestion();
            this.startTimer();
        } catch (error) {
            console.error('Failed to resume exam:', error);
            this.showError('Failed to resume exam. Starting fresh.');
            this.clearState(this.selectedPaperId);
        }
    }

    // Exam Control
    async startExam() {
        if (!this.selectedPaperId) {
            alert('Please select a practice paper first.');
            return;
        }

        try {
            this.currentPaper = await this.loadPaper(this.selectedPaperId);
            this.examStartTime = new Date();
            this.currentQuestionIndex = 0;
            this.userAnswers = {};
            this.timeRemaining = this.currentPaper.minutes * 60;
            
            this.saveExamState();
            this.showScreen('exam-screen');
            this.generateQuestionPalette();
            this.displayQuestion();
            this.startTimer();
        } catch (error) {
            console.error('Failed to start exam:', error);
            this.showError('Failed to start exam. Please try again.');
        }
    }

    restartExam() {
        if (this.selectedPaperId) {
            this.clearState(this.selectedPaperId);
        }
        this.clearTimer();
        this.startExam();
    }

    showWelcome() {
        this.clearTimer();
        if (this.selectedPaperId) {
            this.clearState(this.selectedPaperId);
        }
        this.showScreen('welcome-screen');
        this.resetExamState();
    }

    resetExamState() {
        this.currentPaper = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.examStartTime = null;
        this.examEndTime = null;
        this.timeRemaining = 0;
    }

    // Timer Functions
    startTimer() {
        this.clearTimer();
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.clearTimer();
                this.submitExam();
                return;
            }
            
            this.saveExamState();
        }, 1000);
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const hours = Math.floor(this.timeRemaining / 3600);
        const minutes = Math.floor((this.timeRemaining % 3600) / 60);
        const seconds = this.timeRemaining % 60;
        
        const timerElement = document.getElementById('timer');
        if (!timerElement) return;
        
        const timeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerElement.textContent = timeString;
        
        // Update timer styling
        timerElement.classList.remove('warning', 'danger');
        if (this.timeRemaining <= 300) { // 5 minutes
            timerElement.classList.add('danger');
        } else if (this.timeRemaining <= 1800) { // 30 minutes
            timerElement.classList.add('warning');
        }
    }

    // Question Display
    displayQuestion() {
        if (!this.currentPaper || !this.currentPaper.items) return;
        
        const question = this.currentPaper.items[this.currentQuestionIndex];
        if (!question) return;
        
        // Update question header
        const questionNumber = document.getElementById('question-number');
        const questionModule = document.getElementById('question-module');
        const progressText = document.getElementById('progress-text');
        
        if (questionNumber) questionNumber.textContent = `Question ${this.currentQuestionIndex + 1}`;
        if (questionModule) questionModule.textContent = `Module: ${question.module}`;
        if (progressText) progressText.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.currentPaper.items.length}`;
        
        // Handle scenario display
        const scenarioContainer = document.getElementById('scenario-container');
        if (scenarioContainer) {
            if (question.scenarioContext) {
                scenarioContainer.innerHTML = `
                    <div class="scenario-box">
                        <h4>📚 Scenario: ${question.scenarioContext.title}</h4>
                        <p>${question.scenarioContext.description}</p>
                    </div>
                `;
            } else {
                scenarioContainer.innerHTML = '';
            }
        }
        
        // Display question text
        const questionText = document.getElementById('question-text');
        if (questionText) questionText.textContent = question.stem;
        
        // Generate options
        this.renderOptions(question);
        
        // Update navigation buttons
        this.updateNavigationButtons();
        
        // Update submit button
        this.updateSubmitButton();
        
        // Update question palette
        this.updateQuestionPalette();
    }

    renderOptions(question) {
        const optionsContainer = document.getElementById('options-container');
        if (!optionsContainer) return;
        
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.onclick = () => this.selectOption(index);
            
            const isSelected = this.userAnswers[question.id] === index;
            if (isSelected) {
                optionDiv.classList.add('selected');
            }
            
            optionDiv.innerHTML = `
                <input type="radio" name="question-${question.id}" value="${index}" ${isSelected ? 'checked' : ''}>
                <div class="option-text">${option}</div>
            `;
            
            optionsContainer.appendChild(optionDiv);
        });
    }

    selectOption(optionIndex) {
        if (!this.currentPaper || !this.currentPaper.items) return;
        
        const question = this.currentPaper.items[this.currentQuestionIndex];
        this.userAnswers[question.id] = optionIndex;
        this.saveExamState();
        this.displayQuestion();
    }

    // Navigation
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
            this.saveExamState();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentPaper.items.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.saveExamState();
        }
    }

    jumpToQuestion(questionIndex) {
        if (questionIndex >= 0 && questionIndex < this.currentPaper.items.length) {
            this.currentQuestionIndex = questionIndex;
            this.displayQuestion();
            this.saveExamState();
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) prevBtn.disabled = this.currentQuestionIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentQuestionIndex === this.currentPaper.items.length - 1;
    }

    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-btn');
        if (!submitBtn) return;
        
        const answeredCount = Object.keys(this.userAnswers).length;
        const totalQuestions = this.currentPaper.items.length;
        
        submitBtn.disabled = answeredCount < totalQuestions;
        submitBtn.textContent = answeredCount < totalQuestions ? 
            `Submit Exam (${answeredCount}/${totalQuestions} answered)` : 'Submit Exam';
    }

    // Question Palette
    generateQuestionPalette() {
        const palette = document.getElementById('question-palette');
        if (!palette || !this.currentPaper) return;
        
        palette.innerHTML = '';
        
        for (let i = 0; i < this.currentPaper.items.length; i++) {
            const btn = document.createElement('button');
            btn.className = 'palette-btn';
            btn.textContent = i + 1;
            btn.onclick = () => this.jumpToQuestion(i);
            palette.appendChild(btn);
        }
    }

    updateQuestionPalette() {
        const buttons = document.querySelectorAll('.palette-btn');
        buttons.forEach((btn, index) => {
            btn.classList.remove('answered', 'current');
            
            if (index === this.currentQuestionIndex) {
                btn.classList.add('current');
            }
            
            const questionId = this.currentPaper.items[index].id;
            if (this.userAnswers.hasOwnProperty(questionId)) {
                btn.classList.add('answered');
            }
        });
    }

    showQuestionPalette() {
        alert('Use the question grid above to navigate to specific questions. Green = answered, Blue = current question.');
    }

    // Exam Submission and Results
    submitExam() {
        const answeredCount = Object.keys(this.userAnswers).length;
        const totalQuestions = this.currentPaper.items.length;
        
        if (answeredCount < totalQuestions) {
            if (!confirm(`You have not answered all questions (${answeredCount}/${totalQuestions}). Are you sure you want to submit?`)) {
                return;
            }
        }
        
        this.examEndTime = new Date();
        this.clearTimer();
        
        this.showScreen('loading-screen');
        
        // Simulate processing time
        setTimeout(() => {
            this.calculateResults();
            this.displayResults();
            this.showScreen('results-screen');
            this.clearState(this.selectedPaperId);
        }, 3000);
    }

    calculateResults() {
        let correctAnswers = 0;
        const moduleScores = {};
        
        // Initialize module scores
        const modules = [...new Set(this.currentPaper.items.map(item => item.module))];
        modules.forEach(module => {
            moduleScores[module] = { correct: 0, total: 0 };
        });
        
        // Calculate scores
        this.currentPaper.items.forEach(question => {
            const userAnswerIndex = this.userAnswers[question.id];
            const correctAnswerIndex = question.correctIndex;
            
            moduleScores[question.module].total++;
            
            if (userAnswerIndex === correctAnswerIndex) {
                correctAnswers++;
                moduleScores[question.module].correct++;
            }
        });
        
        // Store results
        const timeUsed = this.examStartTime && this.examEndTime ? 
            Math.floor((this.examEndTime - this.examStartTime) / 1000) : 
            (this.currentPaper.minutes * 60 - this.timeRemaining);
            
        window.examResults = {
            paperId: this.selectedPaperId,
            paperTitle: this.currentPaper.title,
            rawScore: correctAnswers,
            totalQuestions: this.currentPaper.items.length,
            percentage: Math.round((correctAnswers / this.currentPaper.items.length) * 100),
            scaledScore: Math.round(200 + (correctAnswers / this.currentPaper.items.length) * 300),
            moduleScores: moduleScores,
            timeUsed: timeUsed,
            passed: (200 + (correctAnswers / this.currentPaper.items.length) * 300) >= 300
        };
        
        // Save to history
        this.appendHistory(this.selectedPaperId, window.examResults);
    }

    appendHistory(paperId, summary) {
        try {
            const key = this.ns(paperId, 'history');
            const hist = JSON.parse(localStorage.getItem(key) || '[]');
            hist.push({ ts: Date.now(), ...summary });
            localStorage.setItem(key, JSON.stringify(hist));
        } catch (error) {
            console.warn('Failed to save history:', error);
        }
    }

    displayResults() {
        const results = window.examResults;
        
        // Update score summary
        const finalScore = document.getElementById('final-score');
        const passStatus = document.getElementById('pass-status');
        
        if (finalScore) finalScore.textContent = results.scaledScore;
        if (passStatus) {
            passStatus.textContent = results.passed ? 'PASS' : 'FAIL';
            passStatus.className = `pass-status ${results.passed ? 'pass' : 'fail'}`;
        }
        
        // Update score details
        const rawScore = document.getElementById('raw-score');
        const percentage = document.getElementById('percentage');
        const scaledScore = document.getElementById('scaled-score');
        const timeUsed = document.getElementById('time-used');
        
        if (rawScore) rawScore.textContent = `${results.rawScore}/${results.totalQuestions}`;
        if (percentage) percentage.textContent = `${results.percentage}%`;
        if (scaledScore) scaledScore.textContent = `${results.scaledScore}/500`;
        
        if (timeUsed) {
            const hours = Math.floor(results.timeUsed / 3600);
            const minutes = Math.floor((results.timeUsed % 3600) / 60);
            const seconds = results.timeUsed % 60;
            timeUsed.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Display module performance
        this.displayModulePerformance(results.moduleScores);
        
        // Display question review
        this.displayQuestionReview();
    }

    displayModulePerformance(moduleScores) {
        const container = document.getElementById('module-results');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.entries(moduleScores).forEach(([module, scores]) => {
            const percentage = Math.round((scores.correct / scores.total) * 100);
            const moduleDiv = document.createElement('div');
            moduleDiv.className = 'module-item';
            
            let scoreClass = 'poor';
            if (percentage >= 90) scoreClass = 'excellent';
            else if (percentage >= 80) scoreClass = 'good';
            else if (percentage >= 70) scoreClass = 'fair';
            
            moduleDiv.innerHTML = `
                <div>
                    <div class="module-name">${module}</div>
                    <div style="font-size: 0.9rem; color: #6c757d;">
                        ${scores.total} questions in this module
                    </div>
                </div>
                <div class="module-score ${scoreClass}">
                    ${scores.correct}/${scores.total} (${percentage}%)
                </div>
            `;
            
            container.appendChild(moduleDiv);
        });
    }

    displayQuestionReview() {
        const container = document.getElementById('question-review-content');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.currentPaper.items.forEach((question, index) => {
            const userAnswerIndex = this.userAnswers[question.id];
            const correctAnswerIndex = question.correctIndex;
            const isCorrect = userAnswerIndex === correctAnswerIndex;
            
            const reviewDiv = document.createElement('div');
            reviewDiv.className = 'review-item';
            
            const userAnswerText = userAnswerIndex !== undefined ? 
                question.options[userAnswerIndex] : 'No answer selected';
            const correctAnswerText = question.options[correctAnswerIndex];
            
            let scenarioHTML = '';
            if (question.scenarioContext) {
                scenarioHTML = `
                    <div style="background: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0; font-size: 0.9rem;">
                        <strong>Scenario:</strong> ${question.scenarioContext.description}
                    </div>
                `;
            }
            
            reviewDiv.innerHTML = `
                <div class="review-header">
                    <strong>Question ${index + 1} - ${question.module}</strong>
                    <span class="review-status ${isCorrect ? 'correct' : 'incorrect'}">
                        ${isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                    </span>
                </div>
                
                ${scenarioHTML}
                
                <div class="review-question">${question.stem}</div>
                
                <div class="review-answers">
                    <div class="review-answer ${isCorrect ? 'user-answer' : 'incorrect-answer'}">
                        <strong>Your Answer:</strong> ${userAnswerText}
                    </div>
                    ${!isCorrect ? `
                        <div class="review-answer correct-answer">
                            <strong>Correct Answer:</strong> ${correctAnswerText}
                        </div>
                    ` : ''}
                </div>
                
                <div class="explanation">
                    <strong>Explanation:</strong> ${question.explanation}
                </div>
            `;
            
            container.appendChild(reviewDiv);
        });
    }

    // State Management
    saveExamState() {
        if (!this.selectedPaperId) return;
        
        const state = {
            currentQuestionIndex: this.currentQuestionIndex,
            userAnswers: this.userAnswers,
            examStartTime: this.examStartTime ? this.examStartTime.toISOString() : null,
            timeRemaining: this.timeRemaining
        };
        
        this.saveState(this.selectedPaperId, state);
    }

    // UI Utilities
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    showError(message) {
        alert(message); // Could be enhanced with a proper error modal
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIGPExamApp();
});