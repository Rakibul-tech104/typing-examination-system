document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sampleTextEl = document.getElementById('sample-text');
    const typingArea = document.getElementById('typing-area');
    const timerEl = document.getElementById('timer');
    const wpmEl = document.getElementById('wpm');
    const accuracyEl = document.getElementById('accuracy');
    const charsEl = document.getElementById('chars');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const topicSelect = document.getElementById('topic-select');
    const languageSelect = document.getElementById('language-select');
    const timeSelect = document.getElementById('time-select');
    const textSource = document.getElementById('text-source');
    const customTextContainer = document.getElementById('custom-text-container');
    const customText = document.getElementById('custom-text');
    const themeToggle = document.getElementById('theme-toggle');
    const timeAlert = document.getElementById('time-alert');
    const resultContainer = document.getElementById('result-container');
    const printBtn = document.getElementById('print-btn');
    
    // Institute info elements
    const instituteNameInput = document.getElementById('institute-name');
    const examNameInput = document.getElementById('exam-name');
    const instituteLogoInput = document.getElementById('institute-logo');
    const examineeNameInput = document.getElementById('examinee-name');
    const examineeRollInput = document.getElementById('examinee-roll');
    
    // Display elements
    const instituteNameDisplay = document.getElementById('institute-name-display');
    const examNameDisplay = document.getElementById('exam-name-display');
    const examineeNameDisplay = document.getElementById('examinee-name-display');
    const examineeRollDisplay = document.getElementById('examinee-roll-display');
    const instituteLogoPreview = document.getElementById('institute-logo-preview');
    
    // Result elements
    const resultInstitute = document.getElementById('result-institute');
    const resultExam = document.getElementById('result-exam');
    const resultName = document.getElementById('result-name');
    const resultRoll = document.getElementById('result-roll');
    const resultDate = document.getElementById('result-date');
    const resultWpm = document.getElementById('result-wpm');
    const resultAccuracy = document.getElementById('result-accuracy');
    const resultStatus = document.getElementById('result-status');
    const correctCount = document.getElementById('correct-count');
    const incorrectCount = document.getElementById('incorrect-count');
    const wordList = document.getElementById('word-list');
    
    // State variables
    let timer;
    let timerInterval;
    let isTyping = false;
    let startTime;
    let endTime;
    let originalText = '';
    let testDuration = 120;
    let currentPosition = 0;
    let incorrectWords = [];
    let correctWords = [];
    let warningShown = false;
    
    // Theme toggle
    themeToggle.addEventListener('click', function() {
        document.body.setAttribute('data-theme', 
            document.body.getAttribute('data-theme') === 'dark' ? '' : 'dark');
    });
    
    // Update displayed info
    function updateDisplayInfo() {
        instituteNameDisplay.textContent = instituteNameInput.value || 'Institute Name';
        examNameDisplay.textContent = examNameInput.value || 'Typing Examination';
        examineeNameDisplay.textContent = examineeNameInput.value || '-';
        examineeRollDisplay.textContent = examineeRollInput.value || '-';
    }
    
    // Handle logo upload
    instituteLogoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                instituteLogoPreview.src = event.target.result;
                instituteLogoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            // Upload to server (simulated)
            const formData = new FormData();
            formData.append('logo', file);
            
            fetch('/upload-logo', {
                method: 'POST',
                body: formData
            }).then(response => response.json())
              .then(data => {
                  console.log('Logo uploaded:', data.filename);
              });
        }
    });
    
    // Update info when inputs change
    instituteNameInput.addEventListener('input', updateDisplayInfo);
    examNameInput.addEventListener('input', updateDisplayInfo);
    examineeNameInput.addEventListener('input', updateDisplayInfo);
    examineeRollInput.addEventListener('input', updateDisplayInfo);
    
    // Text source toggle
    textSource.addEventListener('change', function() {
        customTextContainer.style.display = this.value === 'custom' ? 'block' : 'none';
    });
    
    // Highlight text and track current position
    function highlightText() {
        const typedText = typingArea.value;
        let highlightedText = '';
        currentPosition = typedText.length;
        
        for (let i = 0; i < originalText.length; i++) {
            let char = originalText[i];
            
            if (i < typedText.length) {
                if (typedText[i] === char) {
                    highlightedText += char; // No highlighting for correct characters
                } else {
                    highlightedText += `<span class="incorrect">${char}</span>`;
                }
            } else if (i === typedText.length) {
                highlightedText += `<span class="current">${char}</span>`;
            } else {
                highlightedText += char;
            }
        }
        
        sampleTextEl.innerHTML = highlightedText;
        charsEl.textContent = `${typedText.length}/${originalText.length}`;
    }
    
    // Get new text based on selections
    function getNewText() {
        const selectedTopic = topicSelect.value;
        const selectedLanguage = languageSelect.value;
        const source = textSource.value;
        
        if (source === 'custom' && customText.value.trim()) {
            originalText = customText.value.trim();
            sampleTextEl.textContent = originalText;
            resetTest();
            typingArea.disabled = false;
            typingArea.focus();
            return;
        }
        
        if (source === 'predefined') {
            fetch('/get-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: selectedTopic,
                    language: selectedLanguage
                })
            })
            .then(response => response.json())
            .then(data => {
                originalText = data.text;
                sampleTextEl.textContent = originalText;
                resetTest();
                typingArea.disabled = false;
                typingArea.focus();
            });
        }
    }
    
    // Start the test
    function startTest() {
        if (!isTyping && originalText && instituteNameInput.value && examNameInput.value 
            && examineeNameInput.value && examineeRollInput.value) {
            
            isTyping = true;
            startTime = new Date();
            testDuration = parseInt(timeSelect.value);
            timer = testDuration;
            timerEl.textContent = timer;
            warningShown = false;
            
            timerInterval = setInterval(updateTimer, 1000);
            typingArea.focus();
            
            startBtn.disabled = true;
            restartBtn.disabled = false;
            
            // Disable all input fields during test
            document.querySelectorAll('.exam-info input, .exam-info select').forEach(el => {
                el.disabled = true;
            });
        } else {
            alert('Please fill in all examination details before starting the test.');
        }
    }
    
    // Update timer
    function updateTimer() {
        timer--;
        timerEl.textContent = timer;
        
        // Show warning when 15 seconds left
        if (timer <= 15 && !warningShown) {
            timeAlert.style.display = 'block';
            setTimeout(() => {
                timeAlert.style.display = 'none';
            }, 3000);
            warningShown = true;
        }
        
        if (timer <= 0) {
            finishTest();
        }
    }
    
    // Analyze words for correctness
    function analyzeWords(text, original) {
        const typedWords = text.split(/\s+/);
        const originalWords = original.split(/\s+/);
        
        const incorrectWords = [];
        const correctWords = [];
        
        for (let i = 0; i < typedWords.length && i < originalWords.length; i++) {
            if (typedWords[i] === originalWords[i]) {
                correctWords.push(typedWords[i]);
            } else {
                incorrectWords.push({
                    typed: typedWords[i],
                    correct: originalWords[i]
                });
            }
        }
        
        // Handle extra words at the end
        if (typedWords.length > originalWords.length) {
            for (let i = originalWords.length; i < typedWords.length; i++) {
                incorrectWords.push({
                    typed: typedWords[i],
                    correct: ""
                });
            }
        }
        
        return {
            correct: correctWords,
            incorrect: incorrectWords,
            total: originalWords.length
        };
    }
    
    // Calculate statistics (5 characters = 1 word)
    function calculateStats(text, original) {
        // Calculate actual time taken (in seconds)
        endTime = new Date();
        const timeTaken = (endTime - startTime) / 1000;
        const elapsedMinutes = timeTaken / 60;
        
        // Calculate WPM (5 characters = 1 word)
        const wordCount = text.length / 5;
        const wpm = elapsedMinutes > 0 ? Math.round(wordCount / elapsedMinutes) : 0;
        
        // Calculate accuracy
        let correctChars = 0;
        const minLength = Math.min(text.length, original.length);
        
        for (let i = 0; i < minLength; i++) {
            if (text[i] === original[i]) {
                correctChars++;
            }
        }
        
        const accuracy = text.length > 0 
            ? Math.round((correctChars / text.length) * 100) 
            : 0;
        
        // Analyze words
        const wordAnalysis = analyzeWords(text, original);
        
        return { 
            wpm, 
            accuracy,
            correctWords: wordAnalysis.correct,
            incorrectWords: wordAnalysis.incorrect,
            totalWords: wordAnalysis.total,
            timeTaken: timeTaken
        };
    }
    
    // Finish the test
    function finishTest() {
        clearInterval(timerInterval);
        isTyping = false;
        typingArea.disabled = true;
        
        const stats = calculateStats(typingArea.value, originalText);
        wpmEl.textContent = stats.wpm;
        accuracyEl.textContent = `${stats.accuracy}%`;
        
        // Update accuracy class for pass/fail
        accuracyEl.className = stats.accuracy >= 90 ? 'stat-value accuracy pass' : 'stat-value accuracy fail';
        
        // Store words for display
        correctWords = stats.correctWords;
        incorrectWords = stats.incorrectWords;
        
        // Display results
        displayResults(stats);
        
        // Send results to server
        fetch('/save-result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                institute: instituteNameInput.value,
                exam: examNameInput.value,
                name: examineeNameInput.value,
                roll: examineeRollInput.value,
                wpm: stats.wpm,
                accuracy: stats.accuracy,
                correctWords: stats.correctWords.length,
                incorrectWords: stats.incorrectWords.length,
                status: stats.accuracy >= 90 ? 'pass' : 'fail',
                timestamp: new Date().toISOString(),
                timeTaken: stats.timeTaken
            })
        });
    }
    
    // Reset the test
    function resetTest() {
        clearInterval(timerInterval);
        timer = testDuration;
        timerEl.textContent = timer;
        typingArea.value = '';
        wpmEl.textContent = '0';
        accuracyEl.textContent = '0%';
        accuracyEl.className = 'stat-value accuracy';
        charsEl.textContent = '0/0';
        isTyping = false;
        currentPosition = 0;
        incorrectWords = [];
        correctWords = [];
        warningShown = false;
        
        startBtn.disabled = false;
        restartBtn.disabled = true;
        
        // Hide results
        resultContainer.style.display = 'none';
        printBtn.style.display = 'none';
        
        // Re-enable input fields
        document.querySelectorAll('.exam-info input, .exam-info select').forEach(el => {
            el.disabled = false;
        });
    }
    
    // Display results
    function displayResults(stats) {
        resultInstitute.textContent = instituteNameInput.value;
        resultExam.textContent = examNameInput.value;
        resultName.textContent = examineeNameInput.value;
        resultRoll.textContent = examineeRollInput.value;
        resultDate.textContent = new Date().toLocaleString();
        resultWpm.textContent = stats.wpm;
        resultAccuracy.textContent = `${stats.accuracy}%`;
        
        const isPass = stats.accuracy >= 90;
        resultStatus.textContent = isPass ? "PASS" : "FAIL";
        resultStatus.style.color = isPass ? "var(--correct)" : "var(--incorrect)";
        
        correctCount.textContent = stats.correctWords.length;
        incorrectCount.textContent = stats.incorrectWords.length;
        
        // Display word list
        wordList.innerHTML = '';
        
        // Add correct words
        stats.correctWords.forEach(word => {
            if (word.trim() !== '') {
                const wordEl = document.createElement('div');
                wordEl.className = 'word-item correct-word';
                wordEl.textContent = word;
                wordList.appendChild(wordEl);
            }
        });
        
        // Add incorrect words
        stats.incorrectWords.forEach(pair => {
            const wordEl = document.createElement('div');
            wordEl.className = 'word-item incorrect-word';
            if (pair.correct === "") {
                wordEl.innerHTML = `<del>${pair.typed}</del> <span>→</span> <em>(extra word)</em>`;
            } else {
                wordEl.innerHTML = `<del>${pair.typed}</del> <span>→</span> ${pair.correct}`;
            }
            wordList.appendChild(wordEl);
        });
        
        // Show result container and print button
        resultContainer.style.display = 'block';
        printBtn.style.display = 'block';
        
        // Scroll to results
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Event listeners
    typingArea.addEventListener('input', function() {
        if (!isTyping && this.value.length > 0) {
            startTest();
        }
        
        highlightText();
        
        // Check if text matches
        const typedText = typingArea.value;
        if (typedText === originalText) {
            finishTest();
        }
    });
    
    startBtn.addEventListener('click', function() {
        getNewText();
    });
    
    restartBtn.addEventListener('click', function() {
        getNewText();
    });
    
    // Allow tab key in textarea
    typingArea.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            this.value = this.value.substring(0, start) + '\t' + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 1;
            
            highlightText();
        }
    });
    
    // Initialize display
    updateDisplayInfo();
});
