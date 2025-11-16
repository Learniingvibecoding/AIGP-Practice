# AIGP Exam Simulation - Modular Architecture

A comprehensive web-based simulation for the Artificial Intelligence Governance Professional (AIGP) certification exam, featuring multiple practice papers and modular architecture.

## 🏗️ Architecture Overview

The application has been refactored into a clean, modular architecture that separates content from code:

```
/aigp-sim/
├── index.html          # Main HTML structure
├── app.js             # Application logic and functionality
├── styles.css         # All styling and responsive design
├── README.md          # This documentation
├── /banks/            # Question banks directory
│   ├── index.json     # Manifest of all available papers
│   ├── paper-01.json  # Complete AIGP Mock Paper 1 (100 questions)
│   ├── paper-02.json  # AIGP Mock Paper 2 (placeholder)
│   ├── paper-03.json  # AIGP Mock Paper 3 (placeholder)
│   ├── paper-04.json  # AIGP Mock Paper 4 (placeholder)
│   └── paper-05.json  # AIGP Mock Paper 5 (placeholder)
└── AIGP EXAM GPT.docx # Original source document
```

## 📋 Features

### ✅ **Core Functionality**
- **Multiple Practice Papers**: 5 different exam papers with paper picker interface
- **Authentic Exam Experience**: 150-minute timer, 100 questions, 4-option multiple choice
- **Comprehensive Question Types**: Direct recall and scenario-based case studies
- **Module Coverage**: All 7 AIGP modules with performance tracking
- **Scaled Scoring**: 200-500 scale with 300 passing threshold

### ✅ **Advanced Features**
- **Namespaced Persistence**: Separate saved states per paper
- **Resume Functionality**: Continue interrupted exams
- **Question Navigation**: Previous/Next buttons + question palette
- **Progress Tracking**: Real-time answered/unanswered status
- **Detailed Results**: Module breakdown + question review with explanations
- **Responsive Design**: Works on desktop, tablet, and mobile

### ✅ **Technical Features**
- **Modular Architecture**: Separated HTML, CSS, and JavaScript
- **JSON-Based Content**: Easy to add new papers without code changes
- **Version Management**: Manifest versioning for cache invalidation
- **Error Handling**: Graceful fallbacks and user feedback
- **Local Storage**: Automatic state persistence and recovery

## 🚀 Getting Started

### **Quick Start**
1. Double-click `index.html` to open in your web browser
2. Select a practice paper from the available options
3. Click "Start [Paper Name]" to begin the timed exam
4. Answer all 100 questions within 150 minutes
5. Review detailed results and explanations

### **System Requirements**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Local file access (for JSON loading)
- No internet connection required

## 📊 Paper Structure

### **Manifest Format** (`banks/index.json`)
```json
{
  "version": "2025.09.12",
  "papers": [
    {
      "id": "paper-01",
      "title": "AIGP Mock Paper 1",
      "minutes": 150,
      "questions": 100,
      "description": "Complete AIGP certification practice exam"
    }
  ]
}
```

### **Question Bank Format** (`banks/paper-XX.json`)
```json
{
  "paperId": "paper-01",
  "title": "AIGP Mock Paper 1",
  "minutes": 150,
  "items": [
    {
      "id": "P1-Q001",
      "module": "Foundations",
      "scenarioId": null,
      "stem": "Which of the following is NOT typically considered...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 3,
      "explanation": "Detailed explanation of the correct answer...",
      "refs": ["Module 1: AI Foundations"]
    }
  ],
  "scenarios": {
    "SCEN-A": {
      "title": "Scenario Title",
      "description": "Detailed scenario description..."
    }
  }
}
```

## 🔧 Adding New Papers

### **Step 1: Create Question Bank**
1. Duplicate `banks/paper-01.json` → `banks/paper-06.json`
2. Update `paperId`, `title`, and all question content
3. Follow the same JSON structure for consistency

### **Step 2: Update Manifest**
Add new paper entry to `banks/index.json`:
```json
{
  "id": "paper-06",
  "title": "AIGP Mock Paper 6",
  "minutes": 150,
  "questions": 100,
  "description": "Advanced scenarios and case studies"
}
```

### **Step 3: Version Update (Optional)**
Update the `version` field in `index.json` to clear old cached states:
```json
{
  "version": "2025.09.13"
}
```

The paper picker will automatically detect and display the new paper!

## 📈 Scoring System

### **Raw Score Calculation**
- 1 point per correct answer
- 0 points for incorrect/unanswered questions
- Maximum: 100 points

### **Scaled Score Conversion**
```javascript
scaledScore = 200 + (rawScore / totalQuestions) * 300
```
- Range: 200-500
- Passing: 300+ (equivalent to 33.3% raw score)
- Perfect: 500 (equivalent to 100% raw score)

### **Module Performance**
- **Excellent**: 90%+ (Green)
- **Good**: 80-89% (Blue)
- **Fair**: 70-79% (Yellow)
- **Poor**: <70% (Red)

## 💾 Data Persistence

### **Namespaced Storage**
Each paper maintains separate localStorage entries:
```
aigp-sim:v1:paper-01:state     # Exam state
aigp-sim:v1:paper-01:history   # Results history
aigp-sim:v1:paper-02:state     # Separate state
```

### **Automatic Recovery**
- Detects interrupted exams on app load
- Prompts user to resume or start fresh
- Preserves answers, timer, and current question

## 🎯 Module Coverage

The exam covers all 7 AIGP certification modules:

1. **Foundations** (8 questions) - AI definitions, technology stack, learning paradigms
2. **Impacts & Principles** (10 questions) - Harms taxonomy, bias types, environmental impacts
3. **Governance Models** (15 questions) - Organizational structures, roles, responsibilities
4. **Transparency Artifacts** (3 questions) - Model cards, documentation, transparency requirements
5. **Planning AI Projects** (11 questions) - Risk assessments, development planning, project management
6. **Monitoring & Drift** (9 questions) - Deployment models, monitoring, vendor management
7. **EU AI Act & Obligations** (25 questions) - Risk classifications, compliance requirements
8. **Global Standards & Frameworks** (19 questions) - NIST AI RMF, ISO standards, international frameworks

## 🔍 Question Types

### **Direct Recall Questions** (~60%)
Test knowledge of definitions, classifications, and requirements:
- "Which of the following is NOT typically considered..."
- "Under the EU AI Act, which systems are classified as..."
- "Which ISO standard establishes a framework for..."

### **Scenario-Based Case Studies** (~40%)
Multi-question scenarios testing application of knowledge:
- **CareHire Employment Screening** (Questions 7-9)
- **FinTrust Credit Scoring** (Questions 16-18)
- **Urbania Smart City Surveillance** (Questions 25-27)
- **MediScan Healthcare Diagnostics** (Question 30)
- And 8 more comprehensive scenarios...

## 🛠️ Technical Implementation

### **Class-Based Architecture**
```javascript
class AIGPExamApp {
  // Manifest and paper loading
  async loadManifest()
  async loadPaper(paperId)
  
  // Paper selection and UI
  renderPaperPicker()
  selectPaper(paperId)
  
  // Exam control
  async startExam()
  submitExam()
  restartExam()
  
  // Question display and navigation
  displayQuestion()
  selectOption(optionIndex)
  jumpToQuestion(index)
  
  // Results and scoring
  calculateResults()
  displayResults()
  displayModulePerformance()
  
  // State management
  saveState(paperId, state)
  loadState(paperId)
  clearState(paperId)
}
```

### **Error Handling**
- Graceful fallbacks for missing files
- User-friendly error messages
- Console logging for debugging
- Automatic state recovery

### **Performance Optimizations**
- Lazy loading of question banks
- Efficient DOM updates
- Minimal memory footprint
- Fast question navigation

## 📱 Responsive Design

### **Desktop** (1200px+)
- Full question palette grid
- Side-by-side score cards
- Expanded navigation controls

### **Tablet** (768px-1199px)
- Condensed question palette
- Stacked score cards
- Touch-friendly buttons

### **Mobile** (<768px)
- 10-column question grid
- Single-column layouts
- Optimized touch targets
- Simplified navigation

## 🔒 Security & Privacy

- **No External Dependencies**: Runs completely offline
- **Local Storage Only**: No data transmitted to servers
- **Client-Side Processing**: All calculations performed locally
- **No Personal Data**: Only exam answers and timing stored

## 🚀 Future Enhancements

### **Planned Features**
- **PWA Support**: Offline caching with service worker
- **Export/Import**: Download results as CSV/JSON
- **Practice Modes**: By module, mixed drill, custom question sets
- **Item Tagging**: Filter questions by tags (e.g., "EU-AI-ACT", "high-risk")
- **Analytics Dashboard**: Historical performance tracking
- **Question Shuffling**: Randomized question and option order

### **Easy Extensions**
- **More Papers**: Simply add JSON files to `/banks/`
- **Custom Scoring**: Modify calculation in `calculateResults()`
- **New Question Types**: Extend JSON schema
- **Themes**: Add CSS variables for customization
- **Languages**: Internationalization support

## 📄 License & Usage

This AIGP exam simulation is designed for educational and certification preparation purposes. The question content is based on publicly available AIGP certification materials and study guides.

**Usage Guidelines:**
- ✅ Personal study and exam preparation
- ✅ Educational institutions and training programs
- ✅ Modification and customization for learning
- ❌ Commercial redistribution without permission
- ❌ Claiming ownership of question content

## 🤝 Contributing

To contribute new question banks or improvements:

1. **Fork the project**
2. **Create new paper JSON files** following the established schema
3. **Test thoroughly** with the existing application
4. **Update documentation** as needed
5. **Submit pull request** with clear description

## 📞 Support

For issues, questions, or contributions:
- Check the browser console for error messages
- Verify JSON syntax in question bank files
- Ensure all required files are present
- Test with different browsers if issues persist
- 

---

**Built with ❤️ for AIGP certification candidates**

*Last updated: September 2025*
