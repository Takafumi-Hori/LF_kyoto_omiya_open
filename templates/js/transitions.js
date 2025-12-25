// ========================================
// Page Transitions Controller
// ========================================

class PageTransitions {
    constructor() {
        this.overlay = null;
        this.isTransitioning = false;
        this.transitionDuration = 500; // ms

        this.init();
    }

    init() {
        this.createOverlay();
        this.setupLinkInterception();
        this.handlePageLoad();
        this.setupSectionReveal();
    }

    // ========================================
    // Create Transition Overlay
    // ========================================
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'page-transition-overlay';
        document.body.appendChild(this.overlay);
    }

    // ========================================
    // Intercept Internal Links
    // ========================================
    setupLinkInterception() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');

            if (!link) return;

            // Skip external links, anchors, and special links
            if (this.shouldSkipTransition(link)) return;

            e.preventDefault();
            this.navigateTo(link.href);
        });
    }

    shouldSkipTransition(link) {
        const href = link.getAttribute('href');

        // Skip if no href
        if (!href) return true;

        // Skip external links
        if (link.hostname !== window.location.hostname) return true;

        // Skip anchor links
        if (href.startsWith('#')) return true;

        // Skip if target is _blank
        if (link.target === '_blank') return true;

        // Skip if link has data-no-transition
        if (link.hasAttribute('data-no-transition')) return true;

        // Skip javascript: links
        if (href.startsWith('javascript:')) return true;

        // Skip mailto: and tel: links
        if (href.startsWith('mailto:') || href.startsWith('tel:')) return true;

        return false;
    }

    // ========================================
    // Navigate with Transition
    // ========================================
    navigateTo(url) {
        if (this.isTransitioning) return;

        this.isTransitioning = true;
        this.fadeOut(() => {
            window.location.href = url;
        });
    }

    fadeOut(callback) {
        this.overlay.classList.add('active');

        setTimeout(() => {
            if (callback) callback();
        }, this.transitionDuration);
    }

    fadeIn() {
        // Ensure overlay is visible initially
        this.overlay.classList.add('active');

        // Then fade out after a short delay
        requestAnimationFrame(() => {
            setTimeout(() => {
                this.overlay.classList.remove('active');
                this.isTransitioning = false;
            }, 100);
        });
    }

    // ========================================
    // Handle Page Load
    // ========================================
    handlePageLoad() {
        // Check if we're coming from a transition
        if (sessionStorage.getItem('pageTransition')) {
            sessionStorage.removeItem('pageTransition');
            this.fadeIn();
        }

        // Add page-enter animation to main content
        const mainContent = document.querySelector('main') || document.body;
        mainContent.classList.add('page-enter');

        // Mark transition for next page
        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem('pageTransition', 'true');
        });
    }

    // ========================================
    // Section Reveal on Scroll
    // ========================================
    setupSectionReveal() {
        const revealElements = document.querySelectorAll('.section-reveal, .stagger-children');

        if (revealElements.length === 0) return;

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }
}

// ========================================
// Parallax Effect Controller
// ========================================
class ParallaxController {
    constructor() {
        this.elements = document.querySelectorAll('.parallax-element');

        if (this.elements.length > 0) {
            this.init();
        }
    }

    init() {
        window.addEventListener('scroll', () => {
            this.updateParallax();
        });
    }

    updateParallax() {
        const scrolled = window.pageYOffset;

        this.elements.forEach(element => {
            const speed = element.dataset.parallaxSpeed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }
}

// ========================================
// Image Lazy Load with Reveal
// ========================================
class ImageRevealLoader {
    constructor() {
        this.images = document.querySelectorAll('.image-reveal img[data-src]');

        if (this.images.length > 0) {
            this.init();
        }
    }

    init() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        this.images.forEach(img => {
            imageObserver.observe(img);
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        img.src = src;
        img.removeAttribute('data-src');

        img.addEventListener('load', () => {
            const container = img.closest('.image-reveal');
            if (container) {
                container.classList.add('revealed');
            }
        });
    }
}

// ========================================
// Text Reveal Animation
// ========================================
class TextReveal {
    constructor() {
        this.elements = document.querySelectorAll('.text-reveal');

        if (this.elements.length > 0) {
            this.init();
        }
    }

    init() {
        // Wrap text content in spans
        this.elements.forEach(element => {
            if (!element.querySelector('span')) {
                element.innerHTML = `<span>${element.innerHTML}</span>`;
            }
        });

        // Observe for reveal
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        this.elements.forEach(element => {
            observer.observe(element);
        });
    }
}

// ========================================
// Stagger Animation Controller
// ========================================
class StaggerAnimation {
    constructor() {
        this.containers = document.querySelectorAll('[data-stagger]');

        if (this.containers.length > 0) {
            this.init();
        }
    }

    init() {
        this.containers.forEach(container => {
            const delay = parseInt(container.dataset.stagger) || 100;
            const children = container.children;

            Array.from(children).forEach((child, index) => {
                child.style.transitionDelay = `${index * delay}ms`;
            });
        });
    }
}

// ========================================
// Loading Screen Controller
// ========================================
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.querySelector('.loading-screen');

        if (this.loadingScreen) {
            this.init();
        }
    }

    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hide();
            }, 500);
        });
    }

    hide() {
        this.loadingScreen.classList.add('hidden');
        document.body.classList.add('loaded');

        setTimeout(() => {
            this.loadingScreen.remove();
        }, 500);
    }
}

// ========================================
// Initialize on DOM Ready
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    new PageTransitions();
    new ParallaxController();
    new ImageRevealLoader();
    new TextReveal();
    new StaggerAnimation();
    new LoadingScreen();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PageTransitions,
        ParallaxController,
        ImageRevealLoader,
        TextReveal,
        StaggerAnimation,
        LoadingScreen
    };
}
