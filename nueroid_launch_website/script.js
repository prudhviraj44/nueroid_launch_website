document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentStepId = 'step_type';
    const wizardSteps = [
        'step_type', 'step_category', 'step_industry', 'step_use_case',
        'step_data_sources', 'step_compliance', 'step_collaboration',
        'step_details', 'step_personal_details', 'step_review'
    ];
    let currentStepIndex = 0;
    // Legacy waitlist form state
    let currentStep = 1;
    const totalSteps = 4;

    // Elements
    const landingPage = document.getElementById('landing-page');
    const applicationForm = document.getElementById('application-form');
    const waitlistForm = document.getElementById('waitlist-form');
    const confirmationPage = document.getElementById('confirmation-page');

    // Update total steps
    document.getElementById('total-steps-num').innerText = wizardSteps.length;

    // ---- Typewriter Hero Animation ----
    const typewriterEl1 = document.getElementById('hero-typewriter');
    const cursorEl1 = document.getElementById('cursor-1');
    const typewriterEl2 = document.getElementById('hero-typewriter-2');
    const cursorEl2 = document.getElementById('cursor-2');
    const heroAnimateEls = document.querySelectorAll('.hero-animate');

    // Line 1: plain + gradient
    const plainPart = 'Build Your ';
    const gradientPart = 'Digital Twin';
    const text1 = plainPart + gradientPart;

    let charIndex1 = 0;

    function typeLine1() {
        if (charIndex1 <= text1.length) {
            const typed = text1.slice(0, charIndex1);
            let html = '';
            html = typed;
            typewriterEl1.innerHTML = html;
            charIndex1++;
            setTimeout(typeLine1, 50);
        } else {
            cursorEl1.style.display = 'none';
            // Reveal rest of page directly
            heroAnimateEls.forEach((el, i) => {
                setTimeout(() => el.classList.add('revealed'), 200 + i * 150);
            });
        }
    }

    // Kick off (Moved to end of DOMContentLoaded to handle Deep Linking)
    // setTimeout(typeLine1, 300);
    // ----- end typewriter -----

    // Check for previous application - REMOVED AUTO-REDIRECT per user request
    const hasApplied = localStorage.getItem('hasApplied');
    /* 
    if (hasApplied === 'true') {
        landingPage.classList.remove('active');
        landingPage.classList.add('hidden');
        confirmationPage.classList.remove('hidden');
        confirmationPage.classList.add('active');
    } 
    */

    // Status Modal Functions
    window.showStatusModal = function () {
        document.getElementById('status-modal').classList.remove('hidden');
        // Pre-fill email if known
        const savedEmail = localStorage.getItem('applicantEmail');
        if (savedEmail) {
            document.getElementById('status-email').value = savedEmail;
        }
    };

    window.closeStatusModal = function () {
        document.getElementById('status-modal').classList.add('hidden');
    };

    window.checkStatus = async function () {
        const email = document.getElementById('status-email').value;
        const resultDiv = document.getElementById('status-result');

        if (!email) return;

        resultDiv.innerHTML = '<p>Checking...</p>';
        resultDiv.classList.remove('hidden');

        try {
            const response = await fetch(`/api/status?email=${encodeURIComponent(email)}`);
            if (response.ok) {
                const data = await response.json();
                resultDiv.innerHTML = `
                    <p><strong>Application Found</strong></p>
                    <p>Name: ${data.name}</p>
                    <div class="status-badge">${data.status}</div>
                    <p style="font-size:0.8rem; margin-top:0.5rem; color:var(--text-secondary)">${data.cohort}</p>
                `;
            } else {
                resultDiv.innerHTML = `<p style="color:var(--error-color)">No application found for this email.</p>`;
            }
        } catch (error) {
            resultDiv.innerHTML = `<p style="color:var(--error-color)">Error checking status.</p>`;
        }
    };

    // Close modal on click outside
    window.onclick = function (event) {
        const modal = document.getElementById('status-modal');
        if (event.target == modal) {
            modal.classList.add('hidden');
        }
    };

    // Application Counter Simulation
    const countElement = document.getElementById('applications-count');
    const spotsElement = document.getElementById('spots-remaining');

    // Simulate live updates
    if (countElement && spotsElement) {
        setInterval(() => {
            if (Math.random() > 0.7) {
                let currentCount = parseInt(countElement.innerText);
                countElement.innerText = currentCount + 1;

                // Occasionally drop a spot
                if (Math.random() > 0.8) {
                    let currentSpots = parseInt(spotsElement.innerText);
                    if (currentSpots > 1) {
                        spotsElement.innerText = currentSpots - 1;
                    }
                }
            }
        }, 5000);
    }

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    function setTheme(isLight) {
        if (isLight) {
            document.body.classList.add('light-mode');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
            localStorage.setItem('theme', 'dark');
        }
    }

    // Initialize Theme - Always start with Dark Mode on fresh load
    setTheme(false);

    themeToggleBtn.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-mode');
        setTheme(!isLight);
    });

    // Navigation Functions
    window.startApplication = function () {
        landingPage.classList.add('hidden');
        landingPage.classList.remove('active');
        applicationForm.classList.remove('hidden');
        applicationForm.classList.add('active');
        window.scrollTo(0, 0);
    };

    window.startWaitlist = function () {
        landingPage.classList.add('hidden');
        landingPage.classList.remove('active');
        if (waitlistForm) {
            waitlistForm.classList.remove('hidden');
            waitlistForm.classList.add('active');
        }
        window.scrollTo(0, 0);
    };

    window.startWizard = function () {
        landingPage.classList.add('hidden');
        landingPage.classList.remove('active');
        if (applicationForm) {
            applicationForm.classList.remove('hidden');
            applicationForm.classList.add('active');
        }
        window.scrollTo(0, 0);
    };

    window.scrollToSection = function (id) {
        document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
    };

    window.returnHome = function () {
        confirmationPage.classList.remove('active');
        confirmationPage.classList.add('hidden');
        // Hide both forms if visible
        if (applicationForm) {
            applicationForm.classList.add('hidden');
            applicationForm.classList.remove('active');
        }
        if (waitlistForm) {
            waitlistForm.classList.add('hidden');
            waitlistForm.classList.remove('active');
        }
        landingPage.classList.remove('hidden');
        landingPage.classList.add('active');
        window.scrollTo(0, 0);
    }

    // Wizard Navigation Functions
    window.wizardNextStep = function () {
        if (!validateWizardStep(currentStepIndex)) return;

        // Hide current step
        const currentStepEl = document.querySelector(`.form-step[data-step="${wizardSteps[currentStepIndex]}"]`);
        currentStepEl.classList.add('hidden');
        currentStepEl.classList.remove('active');

        currentStepIndex++;
        currentStepId = wizardSteps[currentStepIndex];

        // Show next step
        const nextStepEl = document.querySelector(`.form-step[data-step="${currentStepId}"]`);
        nextStepEl.classList.remove('hidden');
        nextStepEl.classList.add('active');

        // Generate review if on review step
        if (currentStepId === 'step_review') {
            generateReview();
        }

        updateWizardProgress();
        window.scrollTo(0, 0);
    };

    window.wizardPrevStep = function () {
        const currentStepEl = document.querySelector(`.form-step[data-step="${wizardSteps[currentStepIndex]}"]`);
        currentStepEl.classList.add('hidden');
        currentStepEl.classList.remove('active');

        currentStepIndex--;
        currentStepId = wizardSteps[currentStepIndex];

        const prevStepEl = document.querySelector(`.form-step[data-step="${currentStepId}"]`);
        prevStepEl.classList.remove('hidden');
        prevStepEl.classList.add('active');

        updateWizardProgress();
        window.scrollTo(0, 0);
    };

    // Wizard Logic Helpers
    window.selectRadio = function (element) {
        const input = element.querySelector('input[type="radio"]');
        if (input) {
            input.checked = true;
            const group = element.closest('.radio-block-group');
            group.querySelectorAll('.radio-block').forEach(block => {
                block.classList.remove('selected');
            });
            element.classList.add('selected');
            handleConditionalLogic(input.name, input.value);
        }
    };

    function handleConditionalLogic(name, value) {
        if (name === 'twin_type') {
            const categoryBlocks = document.querySelectorAll('[data-step="step_category"] .radio-block');
            categoryBlocks.forEach(block => {
                const cat = block.querySelector('input').value;
                let show = false;
                if (cat === 'company') show = (value === 'enterprise');
                else if (cat === 'product') show = (value === 'enterprise' || value === 'personal');
                else if (cat === 'project') show = true;
                else if (cat === 'system') show = (value === 'enterprise');
                else if (cat === 'process') show = (value === 'enterprise');
                else if (cat === 'asset') show = true;
                block.style.display = show ? 'flex' : 'none';
            });

            const collabBlocks = document.querySelectorAll('[data-step="step_collaboration"] .radio-block');
            collabBlocks.forEach(block => {
                const cond = block.getAttribute('data-condition');
                let show = true;
                if (cond === 'enterprise' && value !== 'enterprise') show = false;
                if (cond === 'open_source' && value !== 'open_source') show = false;
                block.style.display = show ? 'flex' : 'none';
            });
        }

        if (name === 'visibility') {
            const teamGroup = document.getElementById('team-members-group');
            if (value === 'team') {
                teamGroup.classList.remove('hidden');
            } else {
                teamGroup.classList.add('hidden');
            }
        }
    }

    document.addEventListener('change', (e) => {
        if (e.target.name === 'data_sources') {
            const dataSources = Array.from(document.querySelectorAll('input[name="data_sources"]:checked')).map(cb => cb.value);
            const realTimeGroup = document.getElementById('real-time-group');
            if (dataSources.includes('iot_sensors') || dataSources.includes('acoustic')) {
                realTimeGroup.classList.remove('hidden');
            } else {
                realTimeGroup.classList.add('hidden');
            }
        }
    });

    window.nextStep = function () {
        if (!validateStep(currentStep)) return;

        // Hide current step
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('hidden');
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');

        currentStep++;

        // Show next step
        const nextStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        nextStepEl.classList.remove('hidden');
        nextStepEl.classList.add('active');

        updateProgress();
    };

    window.prevStep = function () {
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('hidden');
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');

        currentStep--;

        const prevStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        prevStepEl.classList.remove('hidden');
        prevStepEl.classList.add('active');

        updateProgress();
    };

    // Wizard Validation
    function validateWizardStep(stepIndex) {
        try {
            const stepId = wizardSteps[stepIndex];
            const stepEl = document.querySelector(`.form-step[data-step="${stepId}"]`);

            if (!stepEl) {
                console.error(`Step element not found for: ${stepId}`);
                return false;
            }

            const requiredInputs = stepEl.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;

            requiredInputs.forEach(input => {
                let valid = false;

                if (input.type === 'checkbox') {
                    valid = input.checked;
                } else if (input.type === 'radio') {
                    // Check if any radio in group is checked
                    const radioGroup = stepEl.querySelectorAll(`input[name="${input.name}"]`);
                    valid = Array.from(radioGroup).some(r => r.checked);
                } else {
                    valid = input.value && input.value.trim() !== '';
                }

                if (!valid) {
                    isValid = false;
                    input.style.borderColor = 'var(--error-color)';
                    input.addEventListener('change', () => {
                        input.style.borderColor = 'var(--border-color)';
                    }, { once: true });
                }
            });

            // Validate multi-select checkboxes (those with multiple checkboxes with same name)
            const allCheckboxes = stepEl.querySelectorAll('input[type="checkbox"]');
            const checkboxNames = new Set();

            // Find all checkbox groups that are multi-select (have multiple checkboxes with same name)
            allCheckboxes.forEach(cb => {
                const groupCheckboxes = stepEl.querySelectorAll(`input[type="checkbox"][name="${cb.name}"]`);
                if (groupCheckboxes.length > 1) {
                    checkboxNames.add(cb.name);
                }
            });

            // Validate that at least one checkbox is selected in each multi-select group
            checkboxNames.forEach(name => {
                const checkboxes = stepEl.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
                const checked = Array.from(checkboxes).some(cb => cb.checked);
                if (!checked) {
                    isValid = false;
                    checkboxes.forEach(cb => {
                        cb.style.borderColor = 'var(--error-color)';
                        cb.addEventListener('change', () => {
                            cb.style.borderColor = 'var(--border-color)';
                        }, { once: true });
                    });
                }
            });

            return isValid;
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
    }

    function updateWizardProgress() {
        const progressFill = document.getElementById('progress-fill');
        const stepNum = document.getElementById('current-step-num');

        const percentage = ((currentStepIndex + 1) / wizardSteps.length) * 100;
        progressFill.style.width = `${percentage}%`;
        progressFill.style.backgroundColor = 'var(--text-primary)';
        stepNum.innerText = currentStepIndex + 1;
    }

    function generateReview() {
        const form = document.getElementById('wizard-form');
        if (!form) return;

        const formData = new FormData(form);
        const reviewDiv = document.getElementById('review-summary');

        const reviewObj = {};
        const fieldLabels = {
            'twin_type': 'Twin Type',
            'twin_category': 'Twin Category',
            'industry': 'Industry',
            'use_cases': 'Use Cases',
            'data_sources': 'Data Sources',
            'has_real_time': 'Real-time Data Streaming',
            'standards': 'Applicable Standards',
            'compliance_notes': 'Compliance Notes',
            'visibility': 'Visibility',
            'team_members': 'Team Members',
            'roles': 'Default Role',
            'twin_name': 'Twin Name',
            'twin_description': 'Description',
            'tags': 'Tags',
            'estimated_size': 'Data Volume (GB/month)',
            'full_name': 'Full Name',
            'email': 'Email Address',
            'company': 'Company/Organization',
            'contact_number': 'Contact Number',
            'country_code': 'Country Code'
        };

        // Group multi-value fields
        for (let [key, value] of formData.entries()) {
            if (key === 'use_cases' || key === 'data_sources' || key === 'standards') {
                if (!reviewObj[key]) reviewObj[key] = [];
                reviewObj[key].push(value);
            } else if (value && value !== '') {
                reviewObj[key] = value;
            }
        }

        let reviewHTML = '<div class="review-grid">';

        for (let [key, value] of Object.entries(reviewObj)) {
            if (value && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
                const label = fieldLabels[key] || key.replace(/_/g, ' ').toUpperCase();
                let displayValue = value;
                if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                } else if (value === 'on' || value === true) {
                    displayValue = 'Yes';
                }
                reviewHTML += `<div class="review-item"><strong>${label}:</strong> <span>${displayValue}</span></div>`;
            }
        }

        reviewHTML += '</div>';
        reviewDiv.innerHTML = reviewHTML;
    }

    window.submitWizardForm = async function () {
        if (!validateWizardStep(currentStepIndex)) return;

        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.innerText = "Submitting...";
        submitBtn.disabled = true;

        // Collect Form Data
        const form = document.getElementById('wizard-form');
        const formData = new FormData(form);
        const data = {};

        // Handle multi-select checkboxes
        formData.forEach((value, key) => {
            if (key === 'use_cases' || key === 'data_sources' || key === 'standards') {
                if (!data[key]) data[key] = [];
                data[key].push(value);
            } else {
                data[key] = value;
            }
        });

        // Convert checkbox to boolean
        data.terms_accepted = form.querySelector('input[name="terms_accepted"]').checked;
        data.confirm = form.querySelector('input[name="confirm"]').checked;
        data.has_real_time = form.querySelector('input[name="has_real_time"]')?.checked || false;

        try {
            const response = await fetch('/api/v2/digital-twin/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Save locally to remember state
                localStorage.setItem('hasApplied', 'true');
                localStorage.setItem('applicantEmail', data.email);

                setTimeout(() => {
                    // Hide the entire wizard form container and show confirmation
                    if (applicationForm) {
                        applicationForm.classList.add('hidden');
                        applicationForm.classList.remove('active');
                    }
                    if (waitlistForm) {
                        waitlistForm.classList.add('hidden');
                        waitlistForm.classList.remove('active');
                    }
                    confirmationPage.classList.remove('hidden');
                    confirmationPage.classList.add('active');
                    window.scrollTo(0, 0);
                }, 1000);
            } else {
                alert('Something went wrong. Please try again.');
                submitBtn.innerText = "Submit Application";
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please try again.');
            submitBtn.innerText = "Submit Application";
            submitBtn.disabled = false;
        }
    };

    window.submitApplication = async function () {
        if (!validateStep(currentStep)) return;

        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.innerText = "Submitting...";
        submitBtn.disabled = true;

        // Collect Form Data
        const formData = new FormData(document.getElementById('beta-form'));
        const data = Object.fromEntries(formData.entries());

        // Convert checkboxes to boolean
        data.feedback_commitment = formData.get('feedback_commitment') === 'on';
        data.time_commitment = formData.get('time_commitment') === 'on';

        try {
            const response = await fetch('/api/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log("Success:", await response.json());
                // Save locally to remember state
                localStorage.setItem('hasApplied', 'true');
                localStorage.setItem('applicantEmail', data.email);

                setTimeout(() => {
                    if (waitlistForm) {
                        waitlistForm.classList.add('hidden');
                        waitlistForm.classList.remove('active');
                    }
                    confirmationPage.classList.remove('hidden');
                    confirmationPage.classList.add('active');
                    window.scrollTo(0, 0);
                }, 1000);
            } else {
                console.error("Submission failed status:", response.status);
                const errorText = await response.text();
                console.error("Response body:", errorText);
                alert(`Something went wrong (Status ${response.status}). Please try again.`);
                submitBtn.innerText = "Submit Application";
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please try again.');
            submitBtn.innerText = "Submit Application";
            submitBtn.disabled = false;
        }
    };

    function updateProgress() {
        // Support waitlist progress bar (legacy) or default progress
        const progressFill = document.getElementById('progress-fill-waitlist') || document.getElementById('progress-fill');
        const stepNum = document.getElementById('current-step-num-waitlist') || document.getElementById('current-step-num');

        const percentage = (currentStep / totalSteps) * 100;
        if (progressFill) progressFill.style.width = `${percentage}%`;
        // Ensure progress bar color matches theme
        if (progressFill) progressFill.style.backgroundColor = 'var(--text-primary)';
        if (stepNum) stepNum.innerText = currentStep;
    }

    function validateStep(step) {
        const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
        const inputs = stepEl.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim() || (input.type === 'checkbox' && !input.checked)) {
                isValid = false;
                input.style.borderColor = 'var(--error-color)';

                // Reset border on input
                input.addEventListener('input', () => {
                    input.style.borderColor = 'var(--border-color)';
                }, { once: true });
            }
        });

        if (!isValid) {
            // Shake animation or toast could go here
            return false;
        }
        return true;
    }

    // ----- Particle Ambient Dots Animation -----
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const mouse = { x: null, y: null };

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                // Individual random drift speeds for each dot - slightly faster
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Subtle local mouse interaction - dots move away from cursor
                if (mouse.x !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 150) {
                        let force = (150 - distance) / 150;
                        this.x -= (dx / distance) * force * 2;
                        this.y -= (dy / distance) * force * 2;
                    }
                }

                // Smoothly return or wrap
                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                const color = getComputedStyle(document.body).getPropertyValue('--text-primary');
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.6; // Increased visibility
                ctx.shadowBlur = 2; // Subtle glow
                ctx.shadowColor = color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0; // Reset for next particles
            }
        }

        function createParticles() {
            particles = [];
            const count = Math.floor((canvas.width * canvas.height) / 5000); // More particles
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            createParticles();
        }

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener('resize', resize);

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }

        resize();
        animate();
    }

    console.log('---- NUEROID™ INITIALIZING ----');

    // ----- Deep Linking Support -----
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action) {
        console.log('Deep Link Detected - Action:', action);

        // Use a recursive check or a slightly longer delay to ensure functions are ready
        const performAction = () => {
            if (action === 'join' || action === 'waitlist') {
                console.log('Attempting to open Waitlist...');
                if (typeof window.startWaitlist === 'function') {
                    window.startWaitlist();
                    console.log('Waitlist opened.');
                } else {
                    console.log('Waiting for window.startWaitlist to be defined...');
                    setTimeout(performAction, 100);
                }
            } else if (action === 'wizard' || action === 'early-bird' || action === 'apply') {
                console.log('Attempting to open Wizard...');
                if (typeof window.startApplication === 'function') {
                    window.startApplication();
                    console.log('Wizard opened.');
                } else {
                    console.log('Waiting for window.startApplication to be defined...');
                    setTimeout(performAction, 100);
                }
            }
        };

        performAction();
    } else {
        // Only run typewriter if NO deep link is present
        setTimeout(typeLine1, 300);
    }
});
