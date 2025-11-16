# AIGP Exam Simulation - Scaling Strategy

## 🎯 **Current Status**

### **Completed Papers**
- **Paper 1**: 100 complete questions from original DOCX (all 7 modules, 12 scenarios)
- **Paper 2**: 50 questions focused on EU AI Act and global frameworks
- **Paper 3**: 50 questions with scenario-based case studies
- **Papers 4-5**: Placeholder structure ready for content

### **Architecture Ready for Scale**
✅ **Modular Design**: Separated HTML, CSS, JS, and JSON content
✅ **Paper Picker**: Automatic detection of new papers
✅ **Namespaced Storage**: Independent progress tracking per paper
✅ **Manifest System**: Version control and paper management

## 🚀 **Scaling Approach**

### **Phase 1: Complete Paper 2 (30 → 100 questions)**
**Current**: 50 questions (EU AI Act focus + foundational topics)
**Target**: 100 questions in batches of ~25

**Batch Strategy**:
1. **Batch 1** (Questions 51-75): Add more EU AI Act scenarios
2. **Batch 2** (Questions 76-100): Global frameworks and cross-jurisdictional compliance

**Content Sources**:
- Remix existing scenarios with new angles
- Add more GPAI-specific questions
- Include more Canadian AIDA and U.S. state law questions
- Expand on enforcement and penalties

### **Phase 2: Replicate Balance for Papers 3-5**
Once Paper 2 reaches 100 questions, use it as a template:

**Paper 3**: **Scenario-Heavy Focus**
- 70% scenario-based questions
- 30% direct recall
- Emphasis on complex case studies

**Paper 4**: **Regulation-Heavy Focus**
- 60% EU AI Act, AIDA, U.S. laws
- 40% governance and frameworks
- Cross-jurisdictional compliance scenarios

**Paper 5**: **Comprehensive Review**
- Balanced mix across all modules
- Advanced scenarios combining multiple concepts
- Integration of all frameworks and regulations

## 🏗️ **Content Development Strategies**

### **Strategy 1: Scenario Shell Reuse**
**Core Scenario Types**:
1. **Healthcare AI** (MediScan, HealthAI, MediHelp)
2. **Financial Services** (FinTrust, SmartLoan, FinCheck)
3. **Employment/HR** (CareHire, TalentAI, recruitment tools)
4. **Public Sector** (CitySafe, Urbania surveillance, government AI)
5. **Education** (EduTutor, OpenBridge proctoring, adaptive learning)
6. **Critical Infrastructure** (SkyWay airlines, energy, transportation)

**Remix Approach**:
- **Same Domain, Different Angle**: Healthcare AI for different specialties
- **Same Technology, Different Sector**: Facial recognition in retail vs security
- **Same Risk, Different Jurisdiction**: Credit scoring in EU vs Canada vs U.S.

### **Strategy 2: Master Bank + Seeded Sampling**
**Alternative Approach**:
1. **Build Master Bank**: 300+ questions across all domains
2. **Seeded Sampling**: Each paper selects 100 questions using different seeds
3. **Consistent Difficulty**: Ensure balanced module coverage per paper

**Implementation**:
```javascript
// In app.js - add seeded sampling function
function sampleQuestions(masterBank, seed, count = 100) {
  const rng = mulberry32(seed);
  const shuffled = shuffle([...masterBank.items], rng);
  return shuffled.slice(0, count);
}

// Paper definition with sampling
{
  "paperId": "paper-02",
  "title": "AIGP Mock Paper 2",
  "samplingMode": true,
  "seed": 12345,
  "sourceBank": "master-bank.json"
}
```

## 📊 **Content Distribution Guidelines**

### **Module Balance per Paper**
- **Foundations**: 8-12 questions (8-12%)
- **Impacts & Principles**: 10-15 questions (10-15%)
- **Governance Models**: 12-18 questions (12-18%)
- **Transparency Artifacts**: 5-8 questions (5-8%)
- **Planning AI Projects**: 10-15 questions (10-15%)
- **Monitoring & Drift**: 8-12 questions (8-12%)
- **EU AI Act & Obligations**: 20-30 questions (20-30%)
- **Global Standards**: 15-25 questions (15-25%)

### **Question Type Mix**
- **Direct Recall**: 60-70% (definitions, classifications, requirements)
- **Scenario-Based**: 30-40% (case studies, application questions)
- **Multi-Part Scenarios**: 3-5 scenarios per paper (2-4 questions each)

## 🔄 **Efficient Content Creation Workflow**

### **Template-Based Question Creation**
```json
{
  "id": "P2-Q051",
  "module": "EU AI Act & Obligations",
  "scenarioId": "SCEN-HEALTHCARE-2",
  "stem": "Under the EU AI Act, which obligation applies to [HEALTHCARE_AI_SYSTEM]?",
  "options": [
    "Option A - Incorrect but plausible",
    "Option B - Correct answer",
    "Option C - Common misconception", 
    "Option D - Clearly wrong"
  ],
  "correctIndex": 1,
  "explanation": "Explanation linking to specific EU AI Act articles...",
  "refs": ["Module 6: EU AI Act Healthcare Requirements"]
}
```

### **Scenario Remixing Examples**
**Base**: CareHire employment screening
**Remixes**:
- **TalentAI**: Video interview analysis with accent bias
- **RecruitBot**: University admissions with demographic disparities
- **HireFlow**: Gig economy worker classification

**Base**: FinTrust credit scoring
**Remixes**:
- **LoanSmart**: Mortgage approval with geographic bias
- **CreditAI**: Insurance premium setting with health data
- **PayCheck**: Salary prediction with gender disparities

## 🎲 **Seeded Sampling Implementation**

### **Master Bank Structure**
```json
{
  "bankId": "master-bank",
  "version": "2025.09.13",
  "totalItems": 300,
  "items": [
    // All 300+ questions with tags for filtering
    {
      "id": "MB-Q001",
      "tags": ["foundations", "basic", "definitions"],
      "difficulty": "easy",
      "module": "Foundations",
      // ... rest of question structure
    }
  ]
}
```

### **Paper Generation Logic**
```javascript
function generatePaper(masterBank, config) {
  const { seed, moduleWeights, difficultyMix } = config;
  const rng = mulberry32(seed);
  
  // Filter and sample by module weights
  const selectedQuestions = [];
  Object.entries(moduleWeights).forEach(([module, count]) => {
    const moduleQuestions = masterBank.items.filter(q => q.module === module);
    const sampled = shuffle(moduleQuestions, rng).slice(0, count);
    selectedQuestions.push(...sampled);
  });
  
  return shuffle(selectedQuestions, rng);
}
```

## 📈 **Quality Assurance Process**

### **Content Review Checklist**
- [ ] **Accuracy**: All answers verified against AIGP materials
- [ ] **Balance**: Appropriate module distribution
- [ ] **Difficulty**: Mix of easy, medium, hard questions
- [ ] **Scenarios**: Realistic, relevant case studies
- [ ] **Explanations**: Clear, educational feedback
- [ ] **References**: Proper module citations

### **Testing Protocol**
1. **JSON Validation**: Ensure proper syntax and structure
2. **App Integration**: Test loading and display
3. **Scoring Verification**: Confirm correct answers and explanations
4. **Module Balance**: Verify distribution across AIGP domains
5. **User Experience**: Test navigation and functionality

## 🎯 **Next Steps**

### **Immediate (Paper 2 Completion)**
1. **Add 25 questions** focusing on GPAI obligations and timelines
2. **Add 25 questions** on cross-border compliance and enforcement
3. **Test complete 100-question Paper 2**
4. **Validate scoring and module distribution**

### **Medium Term (Papers 3-5)**
1. **Paper 3**: Scenario-heavy with complex case studies
2. **Paper 4**: Regulation-focused with enforcement emphasis  
3. **Paper 5**: Comprehensive review with advanced integration

### **Long Term (Master Bank Option)**
1. **Build 300+ question master bank**
2. **Implement seeded sampling logic**
3. **Add difficulty tagging and filtering**
4. **Create practice modes by module/topic**

## 💡 **Content Efficiency Tips**

### **Scenario Remixing Formula**
1. **Keep Core Context**: Same industry/domain
2. **Change Variables**: Different company, jurisdiction, or specific technology
3. **Vary Questions**: Different aspects of the same scenario
4. **Update Stakes**: Different risk levels or compliance requirements

### **Question Variation Techniques**
- **Positive → Negative**: "Which IS required" → "Which is NOT required"
- **Single → Multiple**: "Best answer" → "Two correct answers"
- **Direct → Applied**: "Definition of X" → "Example of X in practice"
- **Current → Future**: "Under current law" → "Under proposed regulations"

This scaling strategy will efficiently grow the question bank while maintaining quality and educational value across all practice papers.