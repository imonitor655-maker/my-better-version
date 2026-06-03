/* ========================================
   My Better Version — Complete Frontend JS
   Landing | Builder | Pricing | Success
   ======================================== */

(function () {
    'use strict';

    // ==========================================
    // UTILITIES
    // ==========================================
    function $(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function $$(selector, parent) {
        return Array.from((parent || document).querySelectorAll(selector));
    }

    function showToast(message, type) {
        type = type || 'success';
        var toast = $('#toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = 'toast toast-' + type + ' show';
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(function () {
            toast.classList.remove('show');
        }, 4000);
    }

    function showLoading(text) {
        var overlay = $('#loadingOverlay');
        if (!overlay) return;
        if (text) {
            var p = $('p', overlay);
            if (p) p.textContent = text;
        }
        overlay.style.display = 'flex';
    }

    function hideLoading() {
        var overlay = $('#loadingOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    // ==========================================
    // LANDING PAGE
    // ==========================================
    function initLandingPage() {
        // Mobile menu toggle
        var menuBtn = $('#mobileMenuBtn');
        var navLinks = $('#navLinks');
        if (menuBtn && navLinks) {
            menuBtn.addEventListener('click', function () {
                menuBtn.classList.toggle('active');
                navLinks.classList.toggle('open');
            });

            // Close mobile menu when clicking a link
            $$('.nav-links a', navLinks).forEach(function (link) {
                link.addEventListener('click', function () {
                    menuBtn.classList.remove('active');
                    navLinks.classList.remove('open');
                });
            });
        }

        // Scroll animations with Intersection Observer
        var observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        $$('.animate-fade-up').forEach(function (el) {
            observer.observe(el);
        });
    }

    // ==========================================
    // BUILDER PAGE
    // ==========================================
    var currentStep = 1;
    var totalSteps = 6;
    var selectedTemplate = 'modern';
    var generatedResumeData = null;

    function initBuilderPage() {
        // Initialize step indicator
        updateStepIndicator();

        // Initialize tag input for skills
        initSkillInput();

        // Initialize template selection
        var firstTemplate = $('.template-card[data-template="modern"]');
        if (firstTemplate) firstTemplate.classList.add('selected');

        // Set up entry remove button visibility
        updateRemoveButtons();

        // Initialize PDF upload handler
        initPdfUpload();
    }

    function updateStepIndicator() {
        var items = $$('.step-ind-item');
        items.forEach(function (item) {
            var step = parseInt(item.getAttribute('data-step'));
            item.classList.remove('active', 'completed');
            if (step === currentStep) {
                item.classList.add('active');
            } else if (step < currentStep) {
                item.classList.add('completed');
            }
        });
    }

    window.nextStep = function () {
        // Validate current step
        if (!validateStep(currentStep)) return;

        if (currentStep < totalSteps) {
            var current = $('#step-' + currentStep);
            var next = $('#step-' + (currentStep + 1));
            if (current) current.classList.remove('active');
            if (next) next.classList.add('active');
            currentStep++;
            updateStepIndicator();

            // Scroll form panel to top
            var panel = $('.builder-form-panel');
            if (panel) panel.scrollTop = 0;
        }
    };

    window.prevStep = function () {
        if (currentStep > 1) {
            var current = $('#step-' + currentStep);
            var prev = $('#step-' + (currentStep - 1));
            if (current) current.classList.remove('active');
            if (prev) prev.classList.add('active');
            currentStep--;
            updateStepIndicator();

            var panel = $('.builder-form-panel');
            if (panel) panel.scrollTop = 0;
        }
    };

    function validateStep(step) {
        if (step === 1) {
            var name = $('#fullName');
            var email = $('#email');
            var valid = true;

            if (name && !name.value.trim()) {
                name.classList.add('error');
                valid = false;
            } else if (name) {
                name.classList.remove('error');
            }

            if (email && !email.value.trim()) {
                email.classList.add('error');
                valid = false;
            } else if (email) {
                email.classList.remove('error');
            }

            if (!valid) {
                showToast('Please fill in required fields.', 'error');
            }
            return valid;
        }

        if (step === 5) {
            var targetJob = $('#targetJob');
            if (targetJob && !targetJob.value.trim()) {
                targetJob.classList.add('error');
                showToast('Please enter a target job title.', 'error');
                return false;
            }
            if (targetJob) targetJob.classList.remove('error');
        }

        return true;
    }

    // --- Work Experience ---
    var experienceCount = 1;

    window.addExperience = function () {
        experienceCount++;
        var container = $('#experienceEntries');
        if (!container) return;

        var card = document.createElement('div');
        card.className = 'entry-card';
        card.setAttribute('data-entry', 'experience-' + (experienceCount - 1));
        card.innerHTML =
            '<div class="entry-header">' +
            '  <span class="entry-title">Position ' + experienceCount + '</span>' +
            '  <button class="btn-icon btn-remove-entry" onclick="removeEntry(this)" title="Remove">' +
            '    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>' +
            '  </button>' +
            '</div>' +
            '<div class="form-row">' +
            '  <div class="form-group"><label>Company</label><input type="text" name="company" placeholder="Acme Inc."></div>' +
            '  <div class="form-group"><label>Job Title</label><input type="text" name="jobTitle" placeholder="Software Engineer"></div>' +
            '</div>' +
            '<div class="form-row">' +
            '  <div class="form-group"><label>Start Date</label><input type="text" name="startDate" placeholder="Jan 2022"></div>' +
            '  <div class="form-group"><label>End Date</label><input type="text" name="endDate" placeholder="Present"></div>' +
            '</div>' +
            '<div class="form-group"><label>Description</label><textarea name="description" rows="4" placeholder="Describe your key responsibilities and achievements..."></textarea></div>';

        container.appendChild(card);
        updateRemoveButtons();
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    // --- Education ---
    var educationCount = 1;

    window.addEducation = function () {
        educationCount++;
        var container = $('#educationEntries');
        if (!container) return;

        var card = document.createElement('div');
        card.className = 'entry-card';
        card.setAttribute('data-entry', 'education-' + (educationCount - 1));
        card.innerHTML =
            '<div class="entry-header">' +
            '  <span class="entry-title">Education ' + educationCount + '</span>' +
            '  <button class="btn-icon btn-remove-entry" onclick="removeEntry(this)" title="Remove">' +
            '    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>' +
            '  </button>' +
            '</div>' +
            '<div class="form-row">' +
            '  <div class="form-group"><label>School / University</label><input type="text" name="school" placeholder="Stanford University"></div>' +
            '  <div class="form-group"><label>Degree</label><input type="text" name="degree" placeholder="B.S. Computer Science"></div>' +
            '</div>' +
            '<div class="form-row">' +
            '  <div class="form-group"><label>Start Date</label><input type="text" name="startDate" placeholder="Sep 2018"></div>' +
            '  <div class="form-group"><label>End Date</label><input type="text" name="endDate" placeholder="Jun 2022"></div>' +
            '</div>' +
            '<div class="form-group"><label>GPA (optional)</label><input type="text" name="gpa" placeholder="3.8 / 4.0"></div>';

        container.appendChild(card);
        updateRemoveButtons();
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    window.removeEntry = function (btn) {
        var card = btn.closest('.entry-card');
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(-10px)';
            card.style.transition = 'all 0.2s ease';
            setTimeout(function () {
                card.remove();
                updateRemoveButtons();
            }, 200);
        }
    };

    function updateRemoveButtons() {
        // Update experience remove buttons
        var expEntries = $$('#experienceEntries .entry-card');
        expEntries.forEach(function (entry, i) {
            var btn = $('.btn-remove-entry', entry);
            var title = $('.entry-title', entry);
            if (btn) btn.style.visibility = expEntries.length > 1 ? 'visible' : 'hidden';
            if (title) title.textContent = 'Position ' + (i + 1);
        });

        // Update education remove buttons
        var eduEntries = $$('#educationEntries .entry-card');
        eduEntries.forEach(function (entry, i) {
            var btn = $('.btn-remove-entry', entry);
            var title = $('.entry-title', entry);
            if (btn) btn.style.visibility = eduEntries.length > 1 ? 'visible' : 'hidden';
            if (title) title.textContent = 'Education ' + (i + 1);
        });
    }

    // --- Skills Tag Input ---
    var skills = [];

    function initSkillInput() {
        var input = $('#skillInput');
        if (!input) return;

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                var value = input.value.trim();
                if (value && skills.indexOf(value) === -1) {
                    addSkill(value);
                    input.value = '';
                }
            }
            if (e.key === 'Backspace' && input.value === '' && skills.length > 0) {
                removeSkill(skills.length - 1);
            }
        });

        // Focus the tag wrapper when clicking
        var wrapper = input.closest('.tag-input-wrapper');
        if (wrapper) {
            wrapper.addEventListener('click', function () {
                input.focus();
            });
        }
    }

    function addSkill(name) {
        skills.push(name);
        renderSkillTags();
    }

    function removeSkill(index) {
        skills.splice(index, 1);
        renderSkillTags();
    }

    function renderSkillTags() {
        var container = $('#skillTags');
        if (!container) return;
        container.innerHTML = '';
        skills.forEach(function (skill, i) {
            var tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.innerHTML =
                skill +
                '<button onclick="removeSkillByIndex(' + i + ')" type="button">' +
                '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>' +
                '</button>';
            container.appendChild(tag);
        });
    }

    window.removeSkillByIndex = function (index) {
        removeSkill(index);
    };

    window.addSuggestion = function (btn) {
        var value = btn.textContent.trim();
        if (skills.indexOf(value) === -1) {
            addSkill(value);
            btn.style.opacity = '0.3';
            btn.style.pointerEvents = 'none';
        }
    };

    // --- Template Selection ---
    window.selectTemplate = function (template) {
        selectedTemplate = template;
        $$('.template-card').forEach(function (card) {
            card.classList.remove('selected');
            if (card.getAttribute('data-template') === template) {
                card.classList.add('selected');
                var radio = $('input[name="template"]', card);
                if (radio) radio.checked = true;
            }
        });
    };

    // --- Collect Form Data ---
    function collectFormData() {
        var fullName = $('#fullName') ? $('#fullName').value.trim() : '';
        var email = $('#email') ? $('#email').value.trim() : '';
        var phone = $('#phone') ? $('#phone').value.trim() : '';
        var location = $('#location') ? $('#location').value.trim() : '';
        var linkedin = $('#linkedin') ? $('#linkedin').value.trim() : '';

        var experience = [];
        $$('#experienceEntries .entry-card').forEach(function (card) {
            var company = $('input[name="company"]', card);
            var jobTitle = $('input[name="jobTitle"]', card);
            var startDate = $('input[name="startDate"]', card);
            var endDate = $('input[name="endDate"]', card);
            var description = $('textarea[name="description"]', card);
            experience.push({
                company: company ? company.value.trim() : '',
                title: jobTitle ? jobTitle.value.trim() : '',
                startDate: startDate ? startDate.value.trim() : '',
                endDate: endDate ? endDate.value.trim() : '',
                description: description ? description.value.trim() : ''
            });
        });

        var education = [];
        $$('#educationEntries .entry-card').forEach(function (card) {
            var school = $('input[name="school"]', card);
            var degree = $('input[name="degree"]', card);
            var startDate = $('input[name="startDate"]', card);
            var endDate = $('input[name="endDate"]', card);
            var gpa = $('input[name="gpa"]', card);
            education.push({
                school: school ? school.value.trim() : '',
                degree: degree ? degree.value.trim() : '',
                startDate: startDate ? startDate.value.trim() : '',
                endDate: endDate ? endDate.value.trim() : '',
                gpa: gpa ? gpa.value.trim() : ''
            });
        });

        var targetJob = $('#targetJob') ? $('#targetJob').value.trim() : '';
        var industry = $('#industry') ? $('#industry').value.trim() : '';
        var yearsExperience = $('#yearsExperience') ? $('#yearsExperience').value.trim() : '';
        var jobDescription = $('#jobDescription') ? $('#jobDescription').value.trim() : '';

        var template = selectedTemplate;

        return {
            personal_info: {
                full_name: fullName,
                email: email,
                phone: phone,
                location: location,
                linkedin: linkedin
            },
            experience: experience,
            education: education,
            skills: skills,
            target: {
                job_title: targetJob,
                industry: industry,
                years_experience: yearsExperience,
                job_description: jobDescription
            },
            template: template
        };
    }

    // --- Generate Resume ---
    window.generateResume = function () {
        var formData = collectFormData();
        var btn = $('#generateBtn');
        var originalHTML = btn.innerHTML;

        // Show loading
        btn.disabled = true;
        btn.innerHTML =
            '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0"></div> Generating...';
        showLoading('Our AI is crafting your perfect resume...');

        fetch('/api/generate-resume-free', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Server error: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                generatedResumeData = data;
                displayGeneratedResume(data);
                showToast('Resume generated successfully!', 'success');

                // Show download button
                var actions = $('#previewActions');
                if (actions) actions.style.display = 'flex';

                // Switch to preview panel on mobile
                var preview = $('.builder-preview-panel');
                if (preview && window.innerWidth <= 1024) {
                    preview.scrollIntoView({ behavior: 'smooth' });
                }
            })
            .catch(function (err) {
                console.error('Generate error:', err);
                showToast('Failed to generate resume. Please try again.', 'error');
                // Fallback: display a basic preview from form data
                displayFallbackResume(formData);
            })
            .finally(function () {
                hideLoading();
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            });
    };

    function displayGeneratedResume(data) {
        var preview = $('#resumePreview');
        if (!preview) return;

        // API returns {success: true, resume: {...}} — the resume is a JSON object
        var resume = data.resume || data;
        generatedResumeData = resume;

        var html = '';

        // Name & Contact
        html += '<h1>' + escapeHTML(resume.full_name || 'Your Name') + '</h1>';
        var contactParts = [];
        if (resume.email) contactParts.push(escapeHTML(resume.email));
        if (resume.phone) contactParts.push(escapeHTML(resume.phone));
        if (resume.location) contactParts.push(escapeHTML(resume.location));
        if (resume.linkedin) contactParts.push(escapeHTML(resume.linkedin));
        if (contactParts.length > 0) {
            html += '<div class="resume-contact">' + contactParts.join(' <span style="color:#6c5ce7">•</span> ') + '</div>';
        }

        // Professional Summary
        if (resume.professional_summary) {
            html += '<h2>Professional Summary</h2>';
            html += '<p class="resume-summary">' + escapeHTML(resume.professional_summary) + '</p>';
        }

        // Experience
        if (resume.experience && resume.experience.length > 0) {
            html += '<h2>Professional Experience</h2>';
            resume.experience.forEach(function (exp) {
                html += '<div class="resume-entry">';
                html += '<div class="resume-entry-header">';
                html += '<span class="resume-entry-title">' + escapeHTML(exp.title || '') + '</span>';
                if (exp.company) {
                    html += ' <span style="color:#a29bfe">at</span> <span class="resume-entry-company">' + escapeHTML(exp.company) + '</span>';
                }
                html += '</div>';
                if (exp.dates) {
                    html += '<div class="resume-entry-dates">' + escapeHTML(exp.dates) + '</div>';
                }
                if (exp.bullets && exp.bullets.length > 0) {
                    html += '<ul class="resume-bullets">';
                    exp.bullets.forEach(function (b) {
                        html += '<li>' + escapeHTML(b) + '</li>';
                    });
                    html += '</ul>';
                } else if (exp.description) {
                    html += '<p>' + escapeHTML(exp.description) + '</p>';
                }
                html += '</div>';
            });
        }

        // Education
        if (resume.education && resume.education.length > 0) {
            html += '<h2>Education</h2>';
            resume.education.forEach(function (edu) {
                html += '<div class="resume-entry">';
                html += '<div class="resume-entry-header">';
                html += '<span class="resume-entry-title">' + escapeHTML(edu.degree || '') + '</span>';
                if (edu.school) {
                    html += ' <span style="color:#a29bfe">—</span> ' + escapeHTML(edu.school);
                }
                html += '</div>';
                var eduDetails = [];
                if (edu.dates) eduDetails.push(escapeHTML(edu.dates));
                if (edu.gpa) eduDetails.push('GPA: ' + escapeHTML(edu.gpa));
                if (eduDetails.length > 0) {
                    html += '<div class="resume-entry-dates">' + eduDetails.join(' | ') + '</div>';
                }
                html += '</div>';
            });
        }

        // Skills
        if (resume.skills && resume.skills.length > 0) {
            html += '<h2>Skills</h2>';
            html += '<div class="resume-skills-list">';
            resume.skills.forEach(function (skill) {
                html += '<span class="resume-skill">' + escapeHTML(skill) + '</span>';
            });
            html += '</div>';
        }

        preview.innerHTML = '<div class="resume-preview-content">' + html + '</div>';
    }

    function displayFallbackResume(formData) {
        var preview = $('#resumePreview');
        if (!preview) return;

        var pi = formData.personal_info;
        var contactParts = [];
        if (pi.email) contactParts.push(pi.email);
        if (pi.phone) contactParts.push(pi.phone);
        if (pi.location) contactParts.push(pi.location);
        if (pi.linkedin) contactParts.push(pi.linkedin);

        var html = '';
        html += '<h1>' + escapeHTML(pi.full_name || 'Your Name') + '</h1>';
        html += '<div class="resume-contact">' + contactParts.map(function (c) { return '<span>' + escapeHTML(c) + '</span>'; }).join('') + '</div>';

        // Experience
        if (formData.experience.length > 0) {
            html += '<h2>Professional Experience</h2>';
            formData.experience.forEach(function (exp) {
                if (!exp.company && !exp.title) return;
                html += '<div class="resume-entry">';
                html += '<div class="resume-entry-header"><span class="resume-entry-title">' + escapeHTML(exp.title || 'Position') + ' at ' + escapeHTML(exp.company || 'Company') + '</span>';
                if (exp.startDate || exp.endDate) {
                    html += '<span class="resume-entry-dates">' + escapeHTML(exp.startDate || '') + ' — ' + escapeHTML(exp.endDate || 'Present') + '</span>';
                }
                html += '</div>';
                if (exp.description) {
                    html += '<div class="resume-entry-body"><ul>';
                    exp.description.split('\n').forEach(function (line) {
                        if (line.trim()) html += '<li>' + escapeHTML(line.trim()) + '</li>';
                    });
                    html += '</ul></div>';
                }
                html += '</div>';
            });
        }

        // Education
        if (formData.education.length > 0) {
            html += '<h2>Education</h2>';
            formData.education.forEach(function (edu) {
                if (!edu.school && !edu.degree) return;
                html += '<div class="resume-entry">';
                html += '<div class="resume-entry-header"><span class="resume-entry-title">' + escapeHTML(edu.degree || 'Degree') + '</span>';
                if (edu.startDate || edu.endDate) {
                    html += '<span class="resume-entry-dates">' + escapeHTML(edu.startDate || '') + ' — ' + escapeHTML(edu.endDate || '') + '</span>';
                }
                html += '</div>';
                html += '<div class="resume-entry-subtitle">' + escapeHTML(edu.school || 'University');
                if (edu.gpa) html += ' | GPA: ' + escapeHTML(edu.gpa);
                html += '</div>';
                html += '</div>';
            });
        }

        // Skills
        if (formData.skills.length > 0) {
            html += '<h2>Skills</h2>';
            html += '<div class="resume-skills-list">';
            formData.skills.forEach(function (skill) {
                html += '<span class="resume-skill">' + escapeHTML(skill) + '</span>';
            });
            html += '</div>';
        }

        preview.innerHTML = '<div class="resume-preview-content">' + html + '</div>';

        // Show download button
        var actions = $('#previewActions');
        if (actions) actions.style.display = 'flex';
    }

    function escapeHTML(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // --- Download PDF ---
    window.downloadPDF = function () {
        var btn = $('#downloadPdfBtn');
        if (!btn) return;

        var originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Exporting...';

        fetch('/api/export-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(generatedResumeData || collectFormData())
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Export failed: ' + res.status);
                return res.blob();
            })
            .then(function (blob) {
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'resume.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('PDF downloaded!', 'success');
            })
            .catch(function (err) {
                console.error('PDF export error:', err);
                showToast('Failed to export PDF. Please try again.', 'error');
            })
            .finally(function () {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            });
    };

    // ==========================================
    // PRICING PAGE
    // ==========================================
    window.createCheckout = function (plan) {
        var btn = event.currentTarget;
        var originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;margin:0"></div> Redirecting...';

        fetch('/api/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: plan })
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Checkout error: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error('No checkout URL returned');
                }
            })
            .catch(function (err) {
                console.error('Checkout error:', err);
                showToast('Something went wrong. Please try again.', 'error');
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            });
    };

    // --- FAQ Toggle ---
    window.toggleFaq = function (btn) {
        var item = btn.closest('.faq-item');
        if (item) {
            var isOpen = item.classList.contains('open');
            // Close all
            $$('.faq-item').forEach(function (faq) {
                faq.classList.remove('open');
            });
            // Open clicked if it was closed
            if (!isOpen) {
                item.classList.add('open');
            }
        }
    };

    // ==========================================
    // SUCCESS PAGE
    // ==========================================
    function initSuccessPage() {
        // Nothing special needed — CSS animations handle it
    }

    // ==========================================
    // AI TOOLS — PDF Upload, Scoring, Vacancy, Walkthrough
    // ==========================================
    var storedRawText = '';

    // --- Toggle AI Tools Panel ---
    window.toggleAiTools = function () {
        var body = $('#aiToolsBody');
        if (!body) return;
        body.classList.toggle('collapsed');
    };

    // --- PDF Upload ---
    function initPdfUpload() {
        var fileInput = $('#pdfFileInput');
        if (!fileInput) return;
        fileInput.addEventListener('change', function () {
            var file = fileInput.files[0];
            if (!file) return;
            if (file.type !== 'application/pdf') {
                showToast('Please select a PDF file.', 'error');
                return;
            }
            handlePdfUpload(file);
        });
    }

    function handlePdfUpload(file) {
        var uploadBtn = $('#pdfUploadBtn');
        var spinner = $('#pdfSpinner');
        if (uploadBtn) uploadBtn.style.display = 'none';
        if (spinner) spinner.style.display = 'flex';

        var formData = new FormData();
        formData.append('file', file);

        fetch('/api/upload-pdf', {
            method: 'POST',
            body: formData
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Upload failed: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (data.success && data.resume) {
                    autoFillFormFromPdf(data.resume);
                    storedRawText = data.resume.raw_text || '';
                    showToast('Resume imported! Review and edit below.', 'success');
                } else {
                    throw new Error('Unexpected response format');
                }
            })
            .catch(function (err) {
                console.error('PDF upload error:', err);
                showToast('Failed to import PDF. Please try again.', 'error');
            })
            .finally(function () {
                if (uploadBtn) uploadBtn.style.display = 'inline-flex';
                if (spinner) spinner.style.display = 'none';
                // Reset file input
                if (fileInput) fileInput.value = '';
            });
    }

    function autoFillFormFromPdf(resume) {
        // Name & Email
        if (resume.full_name) {
            var nameEl = $('#fullName');
            if (nameEl) nameEl.value = resume.full_name;
        }
        if (resume.email) {
            var emailEl = $('#email');
            if (emailEl) emailEl.value = resume.email;
        }
        if (resume.phone) {
            var phoneEl = $('#phone');
            if (phoneEl) phoneEl.value = resume.phone;
        }
        if (resume.location) {
            var locEl = $('#location');
            if (locEl) locEl.value = resume.location;
        }
        if (resume.linkedin) {
            var liEl = $('#linkedin');
            if (liEl) liEl.value = resume.linkedin;
        }

        // Experience
        if (resume.experience && resume.experience.length > 0) {
            var expContainer = $('#experienceEntries');
            if (expContainer) {
                expContainer.innerHTML = '';
                experienceCount = 0;
                resume.experience.forEach(function (exp, idx) {
                    if (idx === 0) {
                        // Populate first existing entry
                        var firstCard = expContainer.querySelector('.entry-card');
                        if (firstCard) {
                            var company = $('input[name="company"]', firstCard);
                            var jobTitle = $('input[name="jobTitle"]', firstCard);
                            var startDate = $('input[name="startDate"]', firstCard);
                            var endDate = $('input[name="endDate"]', firstCard);
                            var desc = $('textarea[name="description"]', firstCard);
                            if (company) company.value = exp.company || exp.employer || '';
                            if (jobTitle) jobTitle.value = exp.title || exp.role || exp.job_title || '';
                            if (startDate) startDate.value = exp.startDate || exp.start_date || exp.start || '';
                            if (endDate) endDate.value = exp.endDate || exp.end_date || exp.end || '';
                            if (desc) desc.value = exp.description || exp.description || '';
                        }
                        experienceCount = 1;
                    } else {
                        // Add new entries
                        addExperience();
                        var cards = $$('.entry-card', expContainer);
                        var card = cards[cards.length - 1];
                        if (card) {
                            var c = $('input[name="company"]', card);
                            var t = $('input[name="jobTitle"]', card);
                            var s = $('input[name="startDate"]', card);
                            var e = $('input[name="endDate"]', card);
                            var d = $('textarea[name="description"]', card);
                            if (c) c.value = exp.company || exp.employer || '';
                            if (t) t.value = exp.title || exp.role || exp.job_title || '';
                            if (s) s.value = exp.startDate || exp.start_date || exp.start || '';
                            if (e) e.value = exp.endDate || exp.end_date || exp.end || '';
                            if (d) d.value = exp.description || '';
                        }
                    }
                });
                updateRemoveButtons();
            }
        }

        // Education
        if (resume.education && resume.education.length > 0) {
            var eduContainer = $('#educationEntries');
            if (eduContainer) {
                eduContainer.innerHTML = '';
                educationCount = 0;
                resume.education.forEach(function (edu, idx) {
                    if (idx === 0) {
                        var firstCard = eduContainer.querySelector('.entry-card');
                        if (firstCard) {
                            var school = $('input[name="school"]', firstCard);
                            var degree = $('input[name="degree"]', firstCard);
                            var startDate = $('input[name="startDate"]', firstCard);
                            var endDate = $('input[name="endDate"]', firstCard);
                            var gpa = $('input[name="gpa"]', firstCard);
                            if (school) school.value = edu.school || edu.university || edu.institution || '';
                            if (degree) degree.value = edu.degree || edu.qualification || '';
                            if (startDate) startDate.value = edu.startDate || edu.start_date || '';
                            if (endDate) endDate.value = edu.endDate || edu.end_date || edu.graduation_date || '';
                            if (gpa) gpa.value = edu.gpa || '';
                        }
                        educationCount = 1;
                    } else {
                        addEducation();
                        var cards = $$('.entry-card', eduContainer);
                        var card = cards[cards.length - 1];
                        if (card) {
                            var sc = $('input[name="school"]', card);
                            var dg = $('input[name="degree"]', card);
                            var sd = $('input[name="startDate"]', card);
                            var ed = $('input[name="endDate"]', card);
                            var gp = $('input[name="gpa"]', card);
                            if (sc) sc.value = edu.school || edu.university || edu.institution || '';
                            if (dg) dg.value = edu.degree || edu.qualification || '';
                            if (sd) sd.value = edu.startDate || edu.start_date || '';
                            if (ed) ed.value = edu.endDate || edu.end_date || edu.graduation_date || '';
                            if (gp) gp.value = edu.gpa || '';
                        }
                    }
                });
                updateRemoveButtons();
            }
        }

        // Skills
        if (resume.skills && Array.isArray(resume.skills)) {
            skills = [];
            resume.skills.forEach(function (skill) {
                var s = typeof skill === 'string' ? skill.trim() : (skill.name || skill.skill || '').trim();
                if (s && skills.indexOf(s) === -1) skills.push(s);
            });
            renderSkillTags();
        }

        // Target Job (if available)
        if (resume.target_job || resume.job_title) {
            var targetEl = $('#targetJob');
            if (targetEl && !targetEl.value.trim()) targetEl.value = resume.target_job || resume.job_title || '';
        }
    }

    // --- Resume Text Extraction ---
    function extractResumeText() {
        // If we have raw text from PDF, use that
        if (storedRawText) return storedRawText;

        // Otherwise, collect from form
        var parts = [];
        var name = $('#fullName');
        if (name) parts.push(name.value.trim());
        var email = $('#email');
        if (email) parts.push(email.value.trim());
        var phone = $('#phone');
        if (phone) parts.push(phone.value.trim());
        var loc = $('#location');
        if (loc) parts.push(loc.value.trim());

        // Experience
        $$('#experienceEntries .entry-card').forEach(function (card) {
            var company = $('input[name="company"]', card);
            var jobTitle = $('input[name="jobTitle"]', card);
            var desc = $('textarea[name="description"]', card);
            if (jobTitle && jobTitle.value) parts.push(jobTitle.value + ' at ' + (company ? company.value : ''));
            if (desc && desc.value) parts.push(desc.value);
        });

        // Education
        $$('#educationEntries .entry-card').forEach(function (card) {
            var degree = $('input[name="degree"]', card);
            var school = $('input[name="school"]', card);
            if (degree && degree.value) parts.push(degree.value + ' from ' + (school ? school.value : ''));
        });

        // Skills
        if (skills.length > 0) parts.push('Skills: ' + skills.join(', '));

        // Target
        var target = $('#targetJob');
        if (target && target.value) parts.push('Target: ' + target.value);
        var jd = $('#jobDescription');
        if (jd && jd.value) parts.push(jd.value);

        return parts.filter(function (p) { return p.length > 0; }).join('\n\n');
    }

    // --- Score Resume ---
    window.scoreResume = function () {
        var btn = $('#scoreResumeBtn');
        var spinner = $('#scoreSpinner');
        if (btn) btn.style.display = 'none';
        if (spinner) spinner.style.display = 'flex';

        var resumeText = extractResumeText();
        if (!resumeText || resumeText.length < 20) {
            showToast('Please fill in more resume details before scoring.', 'error');
            if (btn) btn.style.display = 'flex';
            if (spinner) spinner.style.display = 'none';
            return;
        }

        fetch('/api/score-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_text: resumeText })
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Score error: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (data.success && data.score) {
                    renderScorePanel(data.score);
                } else {
                    throw new Error('Unexpected score response');
                }
            })
            .catch(function (err) {
                console.error('Score error:', err);
                showToast('Failed to score resume. Please try again.', 'error');
            })
            .finally(function () {
                if (btn) btn.style.display = 'flex';
                if (spinner) spinner.style.display = 'none';
            });
    };

    function getScoreColorClass(score) {
        if (score >= 90) return 'score-color-bright-green';
        if (score >= 75) return 'score-color-green';
        if (score >= 60) return 'score-color-yellow';
        if (score >= 40) return 'score-color-orange';
        return 'score-color-red';
    }

    function animateNumber(element, target, duration) {
        duration = duration || 1500;
        var start = 0;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(start + (target - start) * eased);
            element.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }

    // Helper: extract numeric score from API response (handles both number and {score: N} object)
    function extractScore(val) {
        if (typeof val === 'number') return val;
        if (val && typeof val === 'object' && typeof val.score === 'number') return val.score;
        if (val && typeof val.score === 'string') return parseInt(val.score, 10) || 0;
        return 0;
    }

    function renderScorePanel(score) {
        var panel = $('#scorePanel');
        if (!panel) return;
        panel.style.display = 'block';
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Overall score circle
        var circle = $('#scoreCircle');
        var numberEl = $('#scoreNumber');
        var ringProgress = $('#scoreRingProgress');
        var overall = extractScore(score.overall_score);

        // Remove old color classes
        circle.className = 'score-circle';
        circle.classList.add(getScoreColorClass(overall));

        // Animate ring
        var circumference = 339.29;
        var offset = circumference - (circumference * overall / 100);
        setTimeout(function () {
            if (ringProgress) ringProgress.setAttribute('stroke-dashoffset', offset);
        }, 100);

        // Animate number
        if (numberEl) animateNumber(numberEl, overall);

        // Sub-scores — API returns objects like {score: N, issues: [...], passes: [...]}
        var barsContainer = $('#scoreBars');
        if (barsContainer) {
            var subScores = [
                { label: 'ATS Compatibility', key: 'ats_compatibility' },
                { label: 'Content Quality', key: 'content_quality' },
                { label: 'Completeness', key: 'completeness' },
                { label: 'Keyword Power', key: 'keyword_power' },
                { label: 'Impact Score', key: 'impact_score' }
            ];

            barsContainer.innerHTML = '';
            subScores.forEach(function (sub) {
                var raw = score[sub.key];
                var numVal = extractScore(raw);
                var bar = document.createElement('div');
                bar.className = 'score-bar';
                bar.setAttribute('data-label', sub.label);
                var colorClass = getScoreColorClass(numVal);
                bar.innerHTML =
                    '<div class="score-bar-header">' +
                    '  <span class="score-bar-label">' + escapeHTML(sub.label) + '</span>' +
                    '  <span class="score-bar-value ' + colorClass + '">' + numVal + '%</span>' +
                    '</div>' +
                    '<div class="score-bar-track">' +
                    '  <div class="score-bar-fill ' + colorClass + '" style="width: 0%"></div>' +
                    '</div>';
                bar.addEventListener('click', function () {
                    toggleScoreDetails(sub.label, sub.key, score);
                });
                barsContainer.appendChild(bar);

                // Animate bar fill
                setTimeout(function () {
                    var fill = bar.querySelector('.score-bar-fill');
                    if (fill) fill.style.width = numVal + '%';
                }, 200);
            });
        }

        // Quick wins
        var quickWinsList = $('#quickWinsList');
        if (quickWinsList && score.quick_wins) {
            quickWinsList.innerHTML = '';
            score.quick_wins.forEach(function (win) {
                var li = document.createElement('li');
                li.textContent = typeof win === 'string' ? win : (win.text || win.tip || JSON.stringify(win));
                quickWinsList.appendChild(li);
            });
        }
    }

    function toggleScoreDetails(label, key, score) {
        var details = $('#scoreDetails');
        var title = $('#scoreDetailsTitle');
        var list = $('#scoreDetailsList');
        if (!details || !list) return;

        if (details.style.display === 'block' && title.textContent === label) {
            details.style.display = 'none';
            return;
        }

        if (title) title.textContent = label;
        list.innerHTML = '';

        // Get the raw data — it's an object like {score: N, issues: [...], passes: [...]}
        var raw = score[key];

        if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
            // Show issues
            if (raw.issues && Array.isArray(raw.issues)) {
                raw.issues.forEach(function (item) {
                    var li = document.createElement('li');
                    li.className = 'fail';
                    li.textContent = '✗ ' + (typeof item === 'string' ? item : (item.text || item.message || JSON.stringify(item)));
                    list.appendChild(li);
                });
            }
            // Show passes
            if (raw.passes && Array.isArray(raw.passes)) {
                raw.passes.forEach(function (item) {
                    var li = document.createElement('li');
                    li.className = 'pass';
                    li.textContent = '✓ ' + (typeof item === 'string' ? item : (item.text || item.message || JSON.stringify(item)));
                    list.appendChild(li);
                });
            }
            // Show strengths if present
            if (raw.strengths && Array.isArray(raw.strengths)) {
                raw.strengths.forEach(function (item) {
                    var li = document.createElement('li');
                    li.className = 'pass';
                    li.textContent = '✓ ' + (typeof item === 'string' ? item : (item.text || item.message || JSON.stringify(item)));
                    list.appendChild(li);
                });
            }
            // Show weaknesses if present
            if (raw.weaknesses && Array.isArray(raw.weaknesses)) {
                raw.weaknesses.forEach(function (item) {
                    var li = document.createElement('li');
                    li.className = 'fail';
                    li.textContent = '✗ ' + (typeof item === 'string' ? item : (item.text || item.message || JSON.stringify(item)));
                    list.appendChild(li);
                });
            }
            // Show missing/present sections
            if (raw.missing_sections && Array.isArray(raw.missing_sections)) {
                raw.missing_sections.forEach(function (item) {
                    var li = document.createElement('li');
                    li.className = 'fail';
                    li.textContent = '✗ Missing: ' + (typeof item === 'string' ? item : JSON.stringify(item));
                    list.appendChild(li);
                });
            }
            if (raw.present_sections && Array.isArray(raw.present_sections)) {
                raw.present_sections.forEach(function (item) {
                    var li = document.createElement('li');
                    li.className = 'pass';
                    li.textContent = '✓ ' + (typeof item === 'string' ? item : JSON.stringify(item));
                    list.appendChild(li);
                });
            }
            // Show keyword lists
            if (raw.strong_keywords && Array.isArray(raw.strong_keywords)) {
                raw.strong_keywords.forEach(function (item) {
                    var li = document.createElement('li');
                    li.className = 'pass';
                    li.textContent = '✓ ' + item;
                    list.appendChild(li);
                });
            }
            if (raw.suggested_keywords && Array.isArray(raw.suggested_keywords)) {
                raw.suggested_keywords.forEach(function (item) {
                    var li = document.createElement('li');
                    li.className = 'fail';
                    li.textContent = '+ Suggest adding: ' + item;
                    list.appendChild(li);
                });
            }
            if (raw.quantified && Array.isArray(raw.quantified)) {
                raw.quantified.forEach(function (item) {
                    var li = document.createElement('li');
                    li.className = 'pass';
                    li.textContent = '✓ ' + (typeof item === 'string' ? item : JSON.stringify(item));
                    list.appendChild(li);
                });
            }
            if (raw.needs_quantification && Array.isArray(raw.needs_quantification)) {
                raw.needs_quantification.forEach(function (item) {
                    var li = document.createElement('li');
                    li.className = 'fail';
                    li.textContent = '+ Add numbers: ' + (typeof item === 'string' ? item : JSON.stringify(item));
                    list.appendChild(li);
                });
            }
            // If nothing was rendered
            if (list.children.length === 0) {
                var li = document.createElement('li');
                li.textContent = 'Score: ' + extractScore(raw) + '/100';
                list.appendChild(li);
            }
        } else {
            var li = document.createElement('li');
            li.textContent = 'Score: ' + (typeof raw === 'number' ? raw : 'N/A') + '/100';
            list.appendChild(li);
        }

        details.style.display = 'block';
    }

    // --- Vacancy Comparison ---
    window.toggleVacancyPanel = function () {
        var panel = $('#vacancyPanel');
        var btn = $('.vacancy-toggle');
        if (!panel) return;
        if (panel.style.display === 'none') {
            panel.style.display = 'flex';
            if (btn) btn.classList.add('active');
        } else {
            panel.style.display = 'none';
            if (btn) btn.classList.remove('active');
        }
    };

    window.compareVacancy = function () {
        var vacancyText = $('#vacancyText');
        var vacancy = vacancyText ? vacancyText.value.trim() : '';
        var resumeText = extractResumeText();

        if (!resumeText || resumeText.length < 20) {
            showToast('Please fill in more resume details first.', 'error');
            return;
        }
        if (!vacancy || vacancy.length < 20) {
            showToast('Please paste a job description to compare.', 'error');
            return;
        }

        var compareBtn = $('#compareBtn');
        var spinner = $('#compareSpinner');
        var result = $('#matchResult');
        var walkthroughResult = $('#walkthroughResult');
        if (compareBtn) compareBtn.disabled = true;
        if (spinner) spinner.style.display = 'flex';
        if (result) result.style.display = 'none';
        if (walkthroughResult) walkthroughResult.style.display = 'none';

        fetch('/api/compare-vacancy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_text: resumeText, vacancy_text: vacancy })
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Compare error: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (data.success && data.analysis) {
                    renderMatchResult(data.analysis);
                } else {
                    throw new Error('Unexpected compare response');
                }
            })
            .catch(function (err) {
                console.error('Compare error:', err);
                showToast('Failed to compare. Please try again.', 'error');
            })
            .finally(function () {
                if (compareBtn) compareBtn.disabled = false;
                if (spinner) spinner.style.display = 'none';
            });
    };

    function renderMatchResult(analysis) {
        var result = $('#matchResult');
        if (!result) return;
        result.style.display = 'flex';

        // Match score
        var matchScore = extractScore(analysis.match_score);
        var matchCircle = $('#matchScoreCircle');
        var matchNumber = $('#matchScoreNumber');
        var matchRing = $('#matchRingProgress');
        if (matchCircle) {
            matchCircle.className = 'match-score-circle ' + getScoreColorClass(matchScore);
        }
        if (matchNumber) animateNumber(matchNumber, matchScore);
        // Animate match score ring
        if (matchRing) {
            var circumference = 339.29;
            var offset = circumference - (circumference * matchScore / 100);
            setTimeout(function () {
                matchRing.setAttribute('stroke-dashoffset', offset);
            }, 100);
        }

        // ATS Pass Probability
        var atsValue = $('#matchAtsValue');
        if (atsValue) atsValue.textContent = extractScore(analysis.ats_pass_probability) + '%';

        // Keyword analysis
        renderKeywordTags('keywordsMatching', analysis.keyword_analysis && analysis.keyword_analysis.matching, 'matching');
        renderKeywordTags('keywordsMissing', analysis.keyword_analysis && analysis.keyword_analysis.missing, 'missing');
        renderKeywordTags('keywordsOptional', analysis.keyword_analysis && analysis.keyword_analysis.optional, 'optional');

        // Skills match — handle both arrays and objects
        var skillsMatch = analysis.skills_match;
        if (skillsMatch && typeof skillsMatch === 'object' && !Array.isArray(skillsMatch)) {
            renderKeywordTags('skillsMatched', skillsMatch.matched, 'matching');
            renderKeywordTags('skillsMissing', skillsMatch.missing, 'missing');
            renderKeywordTags('skillsTransferable', skillsMatch.transferable, 'optional');
        }

        // Priority improvements
        var impList = $('#improvementList');
        if (impList && analysis.improvement_priority) {
            impList.innerHTML = '';
            analysis.improvement_priority.forEach(function (imp) {
                var li = document.createElement('li');
                if (typeof imp === 'string') {
                    li.textContent = imp;
                } else {
                    var priority = (imp.priority || imp.level || 'MEDIUM').toUpperCase();
                    var issue = imp.issue || imp.description || imp.text || imp.item || '';
                    var suggestion = imp.suggestion || '';
                    var category = imp.category || '';
                    var text = issue;
                    if (suggestion) text += ' → ' + suggestion;
                    li.innerHTML = '<span class="priority-badge ' + priority + '">' + priority + '</span> ' + escapeHTML(text);
                }
                impList.appendChild(li);
            });
        }
    }

    function renderKeywordTags(containerId, items, type) {
        var container = $('#' + containerId);
        if (!container) return;
        container.innerHTML = '';
        if (!items || !Array.isArray(items)) return;
        items.forEach(function (item) {
            var tag = document.createElement('span');
            var text = typeof item === 'string' ? item : (item.name || item.text || item.keyword || String(item));
            tag.className = 'keyword-tag ' + type;
            tag.textContent = text;
            container.appendChild(tag);
        });
    }

    // --- Optimization Walkthrough ---
    window.generateWalkthrough = function () {
        var vacancyText = $('#vacancyText');
        var vacancy = vacancyText ? vacancyText.value.trim() : '';
        var resumeText = extractResumeText();

        if (!resumeText || !vacancy) {
            showToast('Need both resume data and job vacancy for walkthrough.', 'error');
            return;
        }

        var wtBtn = $('#walkthroughBtn');
        var wtSpinner = $('#walkthroughSpinner');
        var wtResult = $('#walkthroughResult');
        if (wtBtn) wtBtn.disabled = true;
        if (wtSpinner) wtSpinner.style.display = 'flex';
        if (wtResult) wtResult.style.display = 'none';

        fetch('/api/generate-walkthrough', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_text: resumeText, vacancy_text: vacancy })
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Walkthrough error: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (data.success && data.walkthrough) {
                    renderWalkthrough(data.walkthrough);
                } else {
                    throw new Error('Unexpected walkthrough response');
                }
            })
            .catch(function (err) {
                console.error('Walkthrough error:', err);
                showToast('Failed to generate walkthrough. Please try again.', 'error');
            })
            .finally(function () {
                if (wtBtn) wtBtn.disabled = false;
                if (wtSpinner) wtSpinner.style.display = 'none';
            });
    };

    function renderWalkthrough(walkthrough) {
        var wtResult = $('#walkthroughResult');
        if (!wtResult) return;
        wtResult.style.display = 'flex';

        // Score flow
        var currentScoreEl = $('#wsCurrentScore');
        var projectedScoreEl = $('#wsProjectedScore');
        var currentScore = extractScore(walkthrough.current_score);
        var projectedScore = extractScore(walkthrough.projected_score);

        if (currentScoreEl) {
            currentScoreEl.className = 'ws-score-value ' + getScoreColorClass(currentScore);
            animateNumber(currentScoreEl, currentScore, 1000);
        }
        if (projectedScoreEl) {
            projectedScoreEl.className = 'ws-score-value ' + getScoreColorClass(projectedScore);
            animateNumber(projectedScoreEl, projectedScore, 1500);
        }

        // Steps
        var stepsContainer = $('#walkthroughSteps');
        if (stepsContainer && walkthrough.steps) {
            stepsContainer.innerHTML = '';
            walkthrough.steps.forEach(function (step, idx) {
                var card = document.createElement('div');
                card.className = 'walkthrough-step';
                card.style.animationDelay = (idx * 0.08) + 's';

                var actionType = (step.action || 'modify').toUpperCase();
                var impact = (step.impact || 'medium').toUpperCase();
                var section = step.section || 'General';
                var stepNum = step.step || (idx + 1);

                card.innerHTML =
                    '<div class="wt-step-header">' +
                    '  <span class="wt-step-number">' + stepNum + '</span>' +
                    '  <span class="wt-step-title">' + escapeHTML(step.title || 'Step ' + stepNum) + '</span>' +
                    '  <span class="section-badge-tag">' + escapeHTML(section) + '</span>' +
                    '  <span class="action-badge ' + actionType + '">' + actionType + '</span>' +
                    '  <span class="impact-badge ' + impact + '">' + impact + '</span>' +
                    '</div>';

                // Diff view (if we have both current and new content)
                if (step.current_content || step.new_content) {
                    var diffHtml = '<div class="diff-view">';
                    if (step.current_content) {
                        diffHtml += '<div class="diff-current">' + escapeHTML(step.current_content) + '</div>';
                    }
                    if (step.new_content) {
                        diffHtml += '<div class="diff-new">' + escapeHTML(step.new_content) + '</div>';
                    }
                    diffHtml += '</div>';
                    card.innerHTML += diffHtml;
                }

                // Reason
                if (step.reason) {
                    card.innerHTML += '<div class="wt-step-reason">' + escapeHTML(step.reason) + '</div>';
                }

                // Apply button
                if (step.new_content) {
                    card.innerHTML +=
                        '<div class="wt-step-actions">' +
                        '  <button class="wt-apply-btn" data-content="' + encodeURIComponent(step.new_content) + '" onclick="applyStepContent(this)">📋 Copy New Content</button>' +
                        '</div>';
                }

                stepsContainer.appendChild(card);

                // Trigger visibility animation
                setTimeout(function () {
                    card.classList.add('visible');
                }, 50);
            });
        }

        // Key phrases
        renderKeywordTags('keyPhrases', walkthrough.key_phrases_to_use, 'accent');

        // Power words
        var powerWordsContainer = $('#powerWords');
        if (powerWordsContainer && walkthrough.power_words) {
            powerWordsContainer.innerHTML = '';
            walkthrough.power_words.forEach(function (word) {
                var tag = document.createElement('span');
                var text = typeof word === 'string' ? word : (word.name || word.text || String(word));
                tag.className = 'keyword-tag matching';
                tag.textContent = text;
                powerWordsContainer.appendChild(tag);
            });
        }
    }

    window.applyStepContent = function (btn) {
        try {
            var content = decodeURIComponent(btn.getAttribute('data-content'));
            navigator.clipboard.writeText(content).then(function () {
                showToast('Content copied to clipboard!', 'success');
            }).catch(function () {
                // Fallback: select text area
                var textarea = document.createElement('textarea');
                textarea.value = content;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showToast('Content copied to clipboard!', 'success');
            });
        } catch (err) {
            showToast('Failed to copy content.', 'error');
        }
    };

    // --- Optimize Section (on-demand) ---
    window.optimizeSection = function (currentContent, instruction, vacancyContext) {
        if (!currentContent || !instruction) return;

        fetch('/api/optimize-section', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current_content: currentContent,
                instruction: instruction,
                vacancy_context: vacancyContext || ''
            })
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Optimize error: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (data.success && data.optimized) {
                    navigator.clipboard.writeText(data.optimized).then(function () {
                        showToast('Optimized text copied to clipboard!', 'success');
                    });
                } else {
                    showToast('Optimization returned empty result.', 'error');
                }
            })
            .catch(function (err) {
                console.error('Optimize error:', err);
                showToast('Failed to optimize. Please try again.', 'error');
            });
    };

    // ==========================================
    // INITIALIZATION
    // ==========================================
    document.addEventListener('DOMContentLoaded', function () {
        // Detect page type and init accordingly
        if ($('.landing-page') || $('.hero')) {
            initLandingPage();
        }

        if ($('.builder-page') || $('#step-1')) {
            initBuilderPage();
        }

        if ($('.success-page') || $('.success-section')) {
            initSuccessPage();
        }

        // Smooth scroll for anchor links
        $$('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;
                var target = $(targetId);
                if (target) {
                    e.preventDefault();
                    var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 64;
                    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            });
        });

        // Clear input errors on focus
        $$('input, textarea').forEach(function (input) {
            input.addEventListener('focus', function () {
                this.classList.remove('error');
            });
        });
    });
})();
