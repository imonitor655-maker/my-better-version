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

        var html = data.resume_html || data.html || JSON.stringify(data, null, 2);
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
