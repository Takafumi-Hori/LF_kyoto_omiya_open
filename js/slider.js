// ========================================
// Hero Slider Functionality
// ========================================

class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.autoPlayDelay = 8000; // 8 seconds
        this.isTransitioning = false;

        this.init();
    }

    init() {
        if (this.slides.length === 0) {
            console.warn('No slides found');
            return;
        }

        // Set first slide as active
        this.slides[0].classList.add('active');

        // Setup navigation buttons
        this.setupNavigation();

        // Start autoplay
        this.startAutoPlay();

        // Pause on hover
        this.setupHoverPause();

        // Keyboard navigation
        this.setupKeyboardNav();

        // Touch/swipe support
        this.setupTouchSupport();
    }

    setupNavigation() {
        const prevBtn = document.getElementById('prevSlide');
        const nextBtn = document.getElementById('nextSlide');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }
    }

    goToSlide(index) {
        if (this.isTransitioning) return;

        this.isTransitioning = true;

        // Remove active class from current slide
        this.slides[this.currentSlide].classList.remove('active');

        // Update current slide index
        this.currentSlide = index;

        // Wrap around if necessary
        if (this.currentSlide >= this.slides.length) {
            this.currentSlide = 0;
        } else if (this.currentSlide < 0) {
            this.currentSlide = this.slides.length - 1;
        }

        // Add active class to new slide
        this.slides[this.currentSlide].classList.add('active');

        // Reset transition lock after animation
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1000);

        // Reset autoplay timer
        this.resetAutoPlay();
    }

    nextSlide() {
        this.goToSlide(this.currentSlide + 1);
    }

    previousSlide() {
        this.goToSlide(this.currentSlide - 1);
    }

    startAutoPlay() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }

    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }

    setupHoverPause() {
        const heroSection = document.querySelector('.hero');

        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                this.stopAutoPlay();
            });

            heroSection.addEventListener('mouseleave', () => {
                this.startAutoPlay();
            });
        }
    }

    setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            // Only activate if no input is focused
            if (document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }

            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });
    }

    setupTouchSupport() {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;

        let touchStartX = 0;
        let touchEndX = 0;
        const minSwipeDistance = 50;

        heroSection.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        heroSection.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX, minSwipeDistance);
        }, { passive: true });
    }

    handleSwipe(startX, endX, minDistance) {
        const distance = endX - startX;

        if (Math.abs(distance) < minDistance) {
            return; // Swipe too short
        }

        if (distance > 0) {
            // Swipe right - go to previous slide
            this.previousSlide();
        } else {
            // Swipe left - go to next slide
            this.nextSlide();
        }
    }

    destroy() {
        this.stopAutoPlay();
    }
}

// ========================================
// Slider Indicators (Optional Enhancement)
// ========================================

class SliderIndicators {
    constructor(slider) {
        this.slider = slider;
        this.indicators = [];
        this.createIndicators();
    }

    createIndicators() {
        const slides = document.querySelectorAll('.hero-slide');
        if (slides.length <= 1) return;

        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'slider-indicators';

        slides.forEach((slide, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'slider-indicator';
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);

            if (index === 0) {
                indicator.classList.add('active');
            }

            indicator.addEventListener('click', () => {
                this.slider.goToSlide(index);
                this.updateIndicators(index);
            });

            this.indicators.push(indicator);
            indicatorsContainer.appendChild(indicator);
        });

        document.querySelector('.hero').appendChild(indicatorsContainer);

        // Add CSS for indicators
        this.addIndicatorStyles();
    }

    updateIndicators(activeIndex) {
        this.indicators.forEach((indicator, index) => {
            if (index === activeIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    addIndicatorStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .slider-indicators {
                position: absolute;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 10px;
                z-index: 3;
            }

            .slider-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                border: 2px solid white;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .slider-indicator:hover {
                background: rgba(255, 255, 255, 0.8);
            }

            .slider-indicator.active {
                background: white;
                width: 30px;
                border-radius: 6px;
            }

            @media (max-width: 768px) {
                .slider-indicators {
                    bottom: 20px;
                }

                .slider-indicator {
                    width: 10px;
                    height: 10px;
                }

                .slider-indicator.active {
                    width: 25px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========================================
// Progress Bar (Optional Enhancement)
// ========================================

class SliderProgressBar {
    constructor(slider, duration = 8000) {
        this.slider = slider;
        this.duration = duration;
        this.progressBar = null;
        this.animationFrame = null;
        this.startTime = null;
        this.createProgressBar();
    }

    createProgressBar() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'slider-progress-container';

        this.progressBar = document.createElement('div');
        this.progressBar.className = 'slider-progress-bar';

        progressContainer.appendChild(this.progressBar);
        document.querySelector('.hero').appendChild(progressContainer);

        this.addProgressBarStyles();
        this.startProgress();
    }

    startProgress() {
        this.startTime = Date.now();
        this.animate();
    }

    animate() {
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min((elapsed / this.duration) * 100, 100);

        this.progressBar.style.width = `${progress}%`;

        if (progress < 100) {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        } else {
            this.resetProgress();
        }
    }

    resetProgress() {
        cancelAnimationFrame(this.animationFrame);
        this.progressBar.style.width = '0%';
        setTimeout(() => this.startProgress(), 100);
    }

    addProgressBarStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .slider-progress-container {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: rgba(255, 255, 255, 0.2);
                z-index: 3;
            }

            .slider-progress-bar {
                height: 100%;
                width: 0%;
                background: #d90000;
                transition: width 0.1s linear;
            }
        `;
        document.head.appendChild(style);
    }
}

// ========================================
// Initialize Slider
// ========================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlider);
} else {
    initSlider();
}

function initSlider() {
    const heroSlider = new HeroSlider();

    // Optional: Add indicators
    // const indicators = new SliderIndicators(heroSlider);

    // Optional: Add progress bar
    // const progressBar = new SliderProgressBar(heroSlider, 8000);

    // Make slider accessible globally for debugging
    window.heroSlider = heroSlider;
}

// ========================================
// Cleanup on page unload
// ========================================

window.addEventListener('beforeunload', () => {
    if (window.heroSlider) {
        window.heroSlider.destroy();
    }
});
