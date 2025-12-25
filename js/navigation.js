// ========================================
// Navigation Controller
// ========================================

class NavigationController {
    constructor() {
        this.header = document.getElementById('header');
        this.hamburger = document.getElementById('hamburger');
        this.nav = document.getElementById('nav');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.lastScroll = 0;
        this.scrollThreshold = 100;

        this.init();
    }

    init() {
        this.setupScrollEffect();
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupActiveNavLink();
        this.setupPersistentCTA();
    }

    // ========================================
    // Header Scroll Effect
    // ========================================
    setupScrollEffect() {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            // Add/remove scrolled class
            if (currentScroll > this.scrollThreshold) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }

            // Hide/show header on scroll direction (optional)
            if (currentScroll > this.lastScroll && currentScroll > 200) {
                this.header.classList.add('header-hidden');
            } else {
                this.header.classList.remove('header-hidden');
            }

            this.lastScroll = currentScroll;
        });
    }

    // ========================================
    // Mobile Menu Toggle
    // ========================================
    setupMobileMenu() {
        if (!this.hamburger || !this.nav) return;

        this.hamburger.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close menu when clicking on a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.nav.contains(e.target) && !this.hamburger.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.hamburger.classList.toggle('active');
        this.nav.classList.toggle('active');
        document.body.style.overflow = this.nav.classList.contains('active') ? 'hidden' : '';
    }

    closeMobileMenu() {
        this.hamburger.classList.remove('active');
        this.nav.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ========================================
    // Smooth Scroll for Navigation Links
    // ========================================
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');

                // Skip if it's just "#"
                if (href === '#') {
                    e.preventDefault();
                    return;
                }

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();
                    const headerHeight = this.header ? this.header.offsetHeight : 0;
                    const targetPosition = target.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ========================================
    // Active Navigation Link on Scroll
    // ========================================
    setupActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');

        if (sections.length === 0) return;

        const updateActiveNav = () => {
            const scrollY = window.pageYOffset;
            const headerHeight = this.header ? this.header.offsetHeight : 0;

            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - headerHeight - 100;
                const sectionId = section.getAttribute('id');
                const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

                if (navLink) {
                    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                        navLink.classList.add('active');
                    } else {
                        navLink.classList.remove('active');
                    }
                }
            });
        };

        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav(); // Initial call
    }

    // ========================================
    // Persistent CTA Button
    // ========================================
    setupPersistentCTA() {
        const persistentCTA = document.querySelector('.persistent-cta');

        if (!persistentCTA) return;

        // Hide on booking pages
        if (window.location.pathname.includes('booking')) {
            persistentCTA.style.display = 'none';
            return;
        }

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 500) {
                persistentCTA.classList.add('visible');
            } else {
                persistentCTA.classList.remove('visible');
            }
        });
    }
}

// ========================================
// Breadcrumb Generator
// ========================================
class BreadcrumbGenerator {
    constructor() {
        this.breadcrumbContainer = document.querySelector('.breadcrumb');
        if (this.breadcrumbContainer) {
            this.generateBreadcrumb();
        }
    }

    generateBreadcrumb() {
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(part => part !== '');

        const pageNames = {
            'index.html': 'HOME',
            'rooms.html': '客室',
            'activities.html': 'アクティビティ',
            'access.html': 'アクセス',
            'booking': 'ご予約',
            'checkout.html': '決済',
            'processing.html': '処理中',
            'confirmation.html': '予約確定'
        };

        let breadcrumbHTML = '<a href="index.html" class="breadcrumb-link">HOME</a>';
        let currentPath = '';

        pathParts.forEach((part, index) => {
            currentPath += '/' + part;
            const pageName = pageNames[part] || part.replace('.html', '');

            if (index < pathParts.length - 1) {
                breadcrumbHTML += ` <span class="breadcrumb-separator">&gt;</span> `;
                breadcrumbHTML += `<a href="${currentPath}" class="breadcrumb-link">${pageName}</a>`;
            } else {
                breadcrumbHTML += ` <span class="breadcrumb-separator">&gt;</span> `;
                breadcrumbHTML += `<span class="breadcrumb-current">${pageName}</span>`;
            }
        });

        this.breadcrumbContainer.innerHTML = breadcrumbHTML;
    }
}

// ========================================
// Scroll to Top Button
// ========================================
class ScrollToTop {
    constructor() {
        this.button = document.getElementById('scrollTop');
        if (this.button) {
            this.init();
        }
    }

    init() {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        });

        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ========================================
// Initialize on DOM Ready
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    new NavigationController();
    new BreadcrumbGenerator();
    new ScrollToTop();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NavigationController, BreadcrumbGenerator, ScrollToTop };
}
