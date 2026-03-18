document.addEventListener('DOMContentLoaded', () => {

    // --- Global Helpers ---
    function showError(msg) {
        const errorAlert = document.getElementById('error-message');
        if (errorAlert) {
            errorAlert.textContent = msg;
            errorAlert.style.display = 'block';
        }
    }

    function hideError() {
        const errorAlert = document.getElementById('error-message');
        if (errorAlert) {
            errorAlert.style.display = 'none';
        }
    }

    // --- Index Page Logic ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('resume-upload');
    const fileDisplay = document.getElementById('file-display');
    const fileNameText = document.getElementById('file-name');
    const removeFileBtn = document.getElementById('remove-file');
    const analyzeForm = document.getElementById('analyze-form');
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnText = document.querySelector('.btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    
    // Mode Toggle Logic
    const modeBtns = document.querySelectorAll('.mode-btn');
    const roleGroup = document.getElementById('role-group');
    const modeDesc = document.getElementById('mode-desc');
    const btnLabel = document.getElementById('btn-label');
    let currentMode = 'gap'; // 'gap' or 'detect'

    if (modeBtns.length > 0) {
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;

                if (currentMode === 'gap') {
                    roleGroup.style.display = 'block';
                    document.getElementById('role-select').required = true;
                    modeDesc.textContent = "Select your target career role and upload your resume to identify skill gaps.";
                    btnLabel.textContent = "Analyze Skills";
                } else {
                    roleGroup.style.display = 'none';
                    document.getElementById('role-select').required = false;
                    modeDesc.textContent = "Upload your resume and let AI predict the top 3 most suitable career roles for you.";
                    btnLabel.textContent = "Detect Career";
                }
            });
        });
    }

    if (dropZone && fileInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        });

        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });

        removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.value = '';
            fileDisplay.style.display = 'none';
            document.querySelector('.drop-text').style.display = 'block';
            document.querySelector('.drop-subtext').style.display = 'block';
            document.querySelector('.drop-icon').style.display = 'block';
        });

        function handleFiles(files) {
            if (files.length > 0) {
                const file = files[0];
                const ext = file.name.split('.').pop().toLowerCase();
                if (ext !== 'pdf' && ext !== 'docx') {
                    showError('Please upload a valid PDF or DOCX file.');
                    return;
                }
                
                if (fileInput.files !== files) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInput.files = dataTransfer.files;
                }

                fileNameText.textContent = file.name;
                fileDisplay.style.display = 'flex';
                document.querySelector('.drop-text').style.display = 'none';
                document.querySelector('.drop-subtext').style.display = 'none';
                document.querySelector('.drop-icon').style.display = 'none';
                hideError();
            }
        }

        // Form Submission
        analyzeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (currentMode === 'gap') {
                const roleSelect = document.getElementById('role-select');
                if (roleSelect.value === "") {
                    showError("Please select a Target Career Role.");
                    return;
                }
            }

            if (!fileInput.files || fileInput.files.length === 0) {
                showError("Please upload your resume.");
                return;
            }

            // Set loading state
            btnText.style.display = 'none';
            btnSpinner.style.display = 'inline-block';
            analyzeBtn.disabled = true;
            hideError();

            const formData = new FormData(analyzeForm);
            const endpoint = currentMode === 'gap' ? '/analyze' : '/detect_career';

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to process request.');
                }

                sessionStorage.setItem('analysisResult', JSON.stringify(result));
                
                // Redirect based on mode
                window.location.href = currentMode === 'gap' ? '/results' : '/career-detection';

            } catch (err) {
                showError(err.message);
            } finally {
                btnText.style.display = 'inline-block';
                btnSpinner.style.display = 'none';
                analyzeBtn.disabled = false;
            }
        });
    }

    // --- Results Page Logic (Skill Gap Mode) ---
    const resultsContainer = document.querySelector('.results-grid');
    if (resultsContainer) {
        const dataStr = sessionStorage.getItem('analysisResult');
        if (!dataStr) {
            window.location.href = '/';
            return;
        }

        const parsedData = JSON.parse(dataStr);
        const { target_role, data } = parsedData;

        document.getElementById('res-target-role').textContent = target_role;

        // Circular Progress Animation
        const scoreCircle = document.getElementById('score-circle');
        const scoreText = document.getElementById('res-score');
        
        if (scoreCircle && scoreText) {
            const radius = scoreCircle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;

            scoreCircle.style.strokeDasharray = `${circumference} ${circumference}`;
            scoreCircle.style.strokeDashoffset = circumference;

            const setProgress = (percent) => {
                const offset = circumference - (percent / 100) * circumference;
                setTimeout(() => {
                    scoreCircle.style.strokeDashoffset = offset;
                }, 300);
                
                let current = 0;
                const inc = percent > 0 ? (percent / 50) : 0;
                const interval = setInterval(() => {
                    current += inc;
                    if (current >= percent) {
                        current = percent;
                        clearInterval(interval);
                    }
                    scoreText.textContent = Math.round(current);
                }, 20);
            };
            setProgress(data.readiness_score);
        }

        // Populate Extracted Skills
        const extractedEl = document.getElementById('res-extracted-skills');
        if (extractedEl) {
            if (data.extracted_skills.length > 0) {
                data.extracted_skills.forEach(skill => {
                    const span = document.createElement('span');
                    span.className = 'tag';
                    span.textContent = skill;
                    extractedEl.appendChild(span);
                });
            } else {
                extractedEl.innerHTML = '<span class="text-muted">No specific technical skills matched.</span>';
            }
        }

        // Populate Skill Gaps
        const gapsEl = document.getElementById('res-skill-gaps');
        if (gapsEl) {
            if (data.skill_gaps.length > 0) {
                data.skill_gaps.forEach(gapObj => {
                    const span = document.createElement('span');
                    span.className = 'tag';
                    span.textContent = gapObj.skill_name;
                    gapsEl.appendChild(span);
                });
            } else {
                gapsEl.innerHTML = '<span class="text-success"><i class="fas fa-check"></i> Great job! No major gaps found for this role.</span>';
            }
        }

        const estWeeksEl = document.getElementById('res-est-weeks');
        if (estWeeksEl) {
            estWeeksEl.textContent = data.estimated_time_to_ready_weeks;
        }

        const gapTableBody = document.querySelector('#res-gap-table tbody');
        if (gapTableBody) {
            if (data.skill_gaps.length > 0) {
                data.skill_gaps.forEach(gapObj => {
                    const tr = document.createElement('tr');
                    let priorityBadgeClass = 'badge-low';
                    if (gapObj.priority === 'high') priorityBadgeClass = 'badge-high text-warning';
                    if (gapObj.priority === 'medium') priorityBadgeClass = 'badge-medium';
                    
                    tr.innerHTML = `
                        <td><strong>${gapObj.skill_name}</strong></td>
                        <td><span class="${priorityBadgeClass}" style="text-transform: capitalize;">${gapObj.priority}</span></td>
                        <td>${gapObj.weeks_to_master} weeks</td>
                    `;
                    gapTableBody.appendChild(tr);
                });
            } else {
                gapTableBody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No skill gaps found! You are ready to apply.</td></tr>';
            }
        }

        // Recommendations
        const populateList = (id, list) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (list && list.length > 0) {
                list.forEach(item => {
                    const li = document.createElement('li');
                    li.innerHTML = `<i class="fas fa-chevron-right" style="font-size: 0.7rem; margin-right: 8px; color: var(--accent-color);"></i> ` + item;
                    el.appendChild(li);
                });
            } else {
                el.innerHTML = '<li class="text-muted">No recommendations available.</li>';
            }
        };

        populateList('res-courses', data.recommendations.courses);
        populateList('res-assessments', data.recommendations.assessments);
        populateList('res-certifications', data.recommendations.certifications);
        populateList('res-projects', data.recommendations.projects);
        populateList('res-internships', data.recommendations.internships);
    }

    // --- Career Detection Results Page ---
    const cdCardsContainer = document.getElementById('career-cards-container');
    if (cdCardsContainer) {
        const dataStr = sessionStorage.getItem('analysisResult');
        if (!dataStr) {
            window.location.href = '/';
            return;
        }

        const parsedData = JSON.parse(dataStr);
        const { extracted_skills, career_matches } = parsedData;

        // Populate Extracted Skills
        const extractedEl = document.getElementById('cd-extracted-skills');
        if (extracted_skills.length > 0) {
            extracted_skills.forEach(skill => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = skill;
                extractedEl.appendChild(span);
            });
        }

        // Render Cards
        const template = document.getElementById('career-card-template');
        career_matches.forEach((match, index) => {
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.career-card-rank').textContent = index + 1;
            clone.querySelector('.career-card-title').textContent = match.role_title;
            clone.querySelector('.career-card-reason').textContent = match.ai_reason;
            clone.querySelector('.career-weeks').textContent = match.estimated_time_to_ready_weeks;
            
            // Fit Score Ring
            const ring = clone.querySelector('.fit-ring-fg');
            const scoreVal = clone.querySelector('.fit-score-val');
            const radius = ring.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            ring.style.strokeDasharray = `${circumference} ${circumference}`;
            ring.style.strokeDashoffset = circumference;
            
            setTimeout(() => {
                const offset = circumference - (match.readiness_score / 100) * circumference;
                ring.style.strokeDashoffset = offset;
                
                // Counter
                let current = 0;
                const inc = match.readiness_score / 40;
                const interval = setInterval(() => {
                    current += inc;
                    if (current >= match.readiness_score) {
                        current = match.readiness_score;
                        clearInterval(interval);
                    }
                    scoreVal.textContent = Math.round(current);
                }, 20);
            }, 500);

            // Gaps
            const gapsEl = clone.querySelector('.career-gaps');
            if (match.skill_gaps.length > 0) {
                match.skill_gaps.forEach(gap => {
                    const span = document.createElement('span');
                    span.className = 'tag';
                    span.textContent = gap.skill_name;
                    gapsEl.appendChild(span);
                });
            } else {
                gapsEl.innerHTML = '<span class="text-success">Perfect Match!</span>';
            }

            // Recommendations
            const recToggle = clone.querySelector('.rec-toggle-btn');
            const recContent = clone.querySelector('.career-recommendations');
            recToggle.addEventListener('click', () => {
                const isHidden = recContent.style.display === 'none';
                recContent.style.display = isHidden ? 'grid' : 'none';
                recToggle.innerHTML = isHidden ? 
                    '<i class="fas fa-eye-slash"></i> Hide Recommendations' : 
                    '<i class="fas fa-lightbulb"></i> View Recommendations';
            });

            const populateCDList = (selector, list) => {
                const el = clone.querySelector(selector);
                if (list && list.length > 0) {
                    list.forEach(item => {
                        const li = document.createElement('li');
                        li.innerHTML = `<i class="fas fa-chevron-right" style="font-size: 0.7rem; margin-right: 8px;"></i> ` + item;
                        el.appendChild(li);
                    });
                } else {
                    el.innerHTML = '<li class="text-muted">None.</li>';
                }
            };

            populateCDList('.career-courses', match.recommendations.courses);
            populateCDList('.career-certs', match.recommendations.certifications);
            populateCDList('.career-projects', match.recommendations.projects);
            populateCDList('.career-internships', match.recommendations.internships);

            cdCardsContainer.appendChild(clone);
        });
    }

    // --- AI Chatbot Logic ---
    const chatToggle = document.getElementById('chat-toggle-btn');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close-btn');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');

    if (chatToggle && chatWindow) {
        chatToggle.addEventListener('click', () => {
            chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
            if (chatWindow.style.display === 'flex') {
                chatInput.focus();
            }
        });

        chatClose.addEventListener('click', () => {
            chatWindow.style.display = 'none';
        });

        const appendMessage = (text, type) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-message ${type === 'user' ? 'user-msg' : 'bot-msg'}`;
            msgDiv.innerHTML = `<span>${text}</span>`;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const sendMessage = async () => {
            const message = chatInput.value.trim();
            if (!message) return;

            appendMessage(message, 'user');
            chatInput.value = '';

            // Get Context from session storage
            const dataStr = sessionStorage.getItem('analysisResult');
            const parsedData = dataStr ? JSON.parse(dataStr) : null;
            
            let context = {};
            if (parsedData) {
                if (parsedData.career_matches) {
                    // Career Detection mode
                    context = {
                        target_role: "Top 3 suggesting roles: " + parsedData.career_matches.map(m => m.role_title).join(", "),
                        detected_skills: parsedData.extracted_skills,
                        missing_skills: parsedData.career_matches.flatMap(m => m.skill_gaps.map(g => g.skill_name))
                    };
                } else {
                    // Gap Analysis mode
                    context = {
                        target_role: parsedData.target_role,
                        detected_skills: parsedData.data.extracted_skills,
                        missing_skills: parsedData.data.skill_gaps.map(g => g.skill_name)
                    };
                }
            }

            // Show typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.className = 'chat-message bot-msg';
            typingDiv.innerHTML = '<span class="typing">AI is thinking...</span>';
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_message: message,
                        ...context
                    })
                });

                const result = await response.json();
                chatMessages.removeChild(typingDiv);

                if (response.ok) {
                    appendMessage(result.reply, 'bot');
                } else {
                    appendMessage("Sorry, I encountered an error: " + (result.error || "Unknown error"), 'bot');
                }
            } catch (err) {
                if (chatMessages.contains(typingDiv)) chatMessages.removeChild(typingDiv);
                appendMessage("Failed to connect to the career mentor. Please check your connection.", 'bot');
            }
        };

        chatSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});
