document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Scroll Reveal Animations
    // ==========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.section, .hero-section, .stats-section');
    sections.forEach(section => {
        section.classList.add('reveal');
        revealOnScroll.observe(section);
    });

    // ==========================================
    // 2. Active Nav Link Highlighting
    // ==========================================
    const navLinks = document.querySelectorAll('.nav-links a:not(.btn-primary-nav)');
    const scrollSections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 150;

        scrollSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active-nav');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active-nav');
            }
        });
    });

    // ==========================================
    // 5. Portfolio Filter Tabs Logic
    // ==========================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const portfolioWrappers = document.querySelectorAll('.portfolio-item-wrapper');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const selectedCategory = button.getAttribute('data-tab');

            portfolioWrappers.forEach(wrapper => {
                const itemCategory = wrapper.getAttribute('data-category');
                
                // Start fade out transition
                wrapper.style.opacity = '0';
                
                setTimeout(() => {
                    if (selectedCategory === 'all' || itemCategory === selectedCategory) {
                        wrapper.classList.remove('hide-item');
                        setTimeout(() => {
                            wrapper.style.opacity = '1';
                        }, 50);
                    } else {
                        wrapper.classList.add('hide-item');
                    }
                }, 200); // Matches opacity transition speed
            });
        });
    });

    // ==========================================
    // ==========================================
    // 6. Manual Screenshot Page Switcher Logic & Carousel Arrows
    // ==========================================
    const switcherButtons = document.querySelectorAll('.switcher-btn');

    switcherButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering lightbox on clicking buttons
            
            const parentContainer = btn.parentElement;
            const targetId = btn.getAttribute('data-target');
            const targetImg = document.getElementById(targetId);
            
            // Toggle active state for switcher buttons in this project card only
            parentContainer.querySelectorAll('.switcher-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Swap address bar title in mockup
            const newTitle = btn.getAttribute('data-title');
            const browserTitleEl = parentContainer.closest('.project-visual').querySelector('.browser-title');
            if (browserTitleEl) {
                browserTitleEl.innerText = newTitle;
            }

            // Smooth image fade transition
            if (targetImg) {
                targetImg.style.opacity = '0.3';
                targetImg.style.transform = 'scale(0.99)';
                setTimeout(() => {
                    const newSrc = btn.getAttribute('data-src');
                    targetImg.setAttribute('src', newSrc);
                    targetImg.style.opacity = '1';
                    targetImg.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });

    // Carousel Arrows Logic
    const switcherWrappers = document.querySelectorAll('.switcher-wrapper');
    switcherWrappers.forEach(wrapper => {
        const switcher = wrapper.querySelector('.screenshot-switcher');
        const prevArrow = wrapper.querySelector('.switcher-arrow.prev');
        const nextArrow = wrapper.querySelector('.switcher-arrow.next');

        if (!switcher || !prevArrow || !nextArrow) return;

        // Function to update disabled states of arrow buttons
        function updateArrows() {
            const buttons = switcher.querySelectorAll('.switcher-btn');
            
            // If 4 or fewer tabs, hide both arrows
            if (buttons.length <= 4) {
                prevArrow.style.display = 'none';
                nextArrow.style.display = 'none';
                return;
            }

            const scrollLeft = switcher.scrollLeft;
            const scrollWidth = switcher.scrollWidth;
            const clientWidth = switcher.clientWidth;

            // If there's no overflow, hide both arrows
            if (scrollWidth <= clientWidth + 2) {
                prevArrow.style.display = 'none';
                nextArrow.style.display = 'none';
                return;
            } else {
                prevArrow.style.display = 'flex';
                nextArrow.style.display = 'flex';
            }

            // Disable prev if scrolled to start
            if (scrollLeft <= 5) {
                prevArrow.disabled = true;
            } else {
                prevArrow.disabled = false;
            }

            // Disable next if scrolled to end
            if (scrollLeft + clientWidth >= scrollWidth - 5) {
                nextArrow.disabled = true;
            } else {
                nextArrow.disabled = false;
            }
        }

        // Add scroll event listener to update arrows dynamically
        switcher.addEventListener('scroll', updateArrows);

        // ResizeObserver or load event to make sure widths are calculated
        window.addEventListener('resize', updateArrows);
        setTimeout(updateArrows, 100);

        // Click handlers for arrow scrolling
        prevArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            switcher.scrollBy({ left: -100, behavior: 'smooth' });
        });

        nextArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            switcher.scrollBy({ left: 100, behavior: 'smooth' });
        });
    });

    // ==========================================
    // 7. Full-Screen Scrollable Lightbox Logic with Carousel Controls
    // ==========================================
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxUrl = document.getElementById('lightbox-url');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const triggers = document.querySelectorAll('.scrollable-lightbox-trigger');

    let currentProjectSwitcherButtons = [];
    let currentActiveIndex = -1;

    // Open Lightbox
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const currentSrc = trigger.getAttribute('src');
            const urlTitle = trigger.getAttribute('data-url');
            
            lightboxImg.setAttribute('src', currentSrc);
            lightboxUrl.innerText = urlTitle;
            
            // Find sibling switcher buttons within the same project visual column
            const visualCol = trigger.closest('.project-visual');
            if (visualCol) {
                currentProjectSwitcherButtons = Array.from(visualCol.querySelectorAll('.switcher-btn'));
                // Find which button matches current active source
                currentActiveIndex = currentProjectSwitcherButtons.findIndex(btn => btn.getAttribute('data-src') === currentSrc);
            } else {
                currentProjectSwitcherButtons = [];
                currentActiveIndex = -1;
            }

            updateLightboxNavArrows();
            lightboxModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // lock background scrolling
        });
    });

    function updateLightboxNavArrows() {
        if (currentProjectSwitcherButtons.length <= 1) {
            lightboxPrev.style.display = 'none';
            lightboxNext.style.display = 'none';
            return;
        } else {
            lightboxPrev.style.display = 'flex';
            lightboxNext.style.display = 'flex';
        }

        // Prev Arrow State
        if (currentActiveIndex <= 0) {
            lightboxPrev.disabled = true;
        } else {
            lightboxPrev.disabled = false;
        }

        // Next Arrow State
        if (currentActiveIndex >= currentProjectSwitcherButtons.length - 1) {
            lightboxNext.disabled = true;
        } else {
            lightboxNext.disabled = false;
        }
    }

    function navigateLightbox(direction) {
        if (currentActiveIndex === -1 || currentProjectSwitcherButtons.length <= 1) return;

        if (direction === 'prev' && currentActiveIndex > 0) {
            currentActiveIndex--;
        } else if (direction === 'next' && currentActiveIndex < currentProjectSwitcherButtons.length - 1) {
            currentActiveIndex++;
        }

        const targetBtn = currentProjectSwitcherButtons[currentActiveIndex];
        if (targetBtn) {
            // Click the button in the main DOM to keep both previews in sync
            targetBtn.click();

            // Smooth transition for lightbox image swap
            lightboxImg.style.opacity = '0.3';
            setTimeout(() => {
                const newSrc = targetBtn.getAttribute('data-src');
                const newTitle = targetBtn.getAttribute('data-title');
                lightboxImg.setAttribute('src', newSrc);
                lightboxUrl.innerText = newTitle;
                lightboxImg.style.opacity = '1';
            }, 150);

            // Scroll the thumbnail switcher in parent page to keep active button in view
            const switcherContainer = targetBtn.parentElement;
            if (switcherContainer) {
                const buttonLeft = targetBtn.offsetLeft;
                const buttonWidth = targetBtn.offsetWidth;
                const containerWidth = switcherContainer.clientWidth;
                switcherContainer.scrollTo({
                    left: buttonLeft - (containerWidth / 2) + (buttonWidth / 2),
                    behavior: 'smooth'
                });
            }
        }
        updateLightboxNavArrows();
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateLightbox('prev');
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateLightbox('next');
        });
    }

    // Close Lightbox
    const closeLightbox = () => {
        lightboxModal.style.display = 'none';
        document.body.style.overflow = ''; // restore scrolling
    };

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            // Close if user clicked outside the browser frame and not on nav buttons
            if (!e.target.closest('.lightbox-browser') && !e.target.closest('.lightbox-nav-btn')) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation support for Lightbox
    document.addEventListener('keydown', (e) => {
        if (lightboxModal.style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                navigateLightbox('prev');
            } else if (e.key === 'ArrowRight') {
                navigateLightbox('next');
            } else if (e.key === 'Escape') {
                closeLightbox();
            }
        }
    });
});
