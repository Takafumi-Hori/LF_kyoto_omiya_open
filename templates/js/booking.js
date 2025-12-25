// ========================================
// Booking System Controller
// ========================================

class BookingController {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.pricePerNight = 35000; // Base price per night in JPY
        this.taxRate = 0.10; // 10% tax
        this.discount = 0;

        this.bookingData = {
            checkinDate: null,
            checkoutDate: null,
            nights: 0,
            guests: 2,
            guestInfo: {},
            couponCode: null,
            basePrice: 0,
            taxes: 0,
            total: 0
        };

        this.init();
    }

    init() {
        this.setupDateInputs();
        this.setupGuestCount();
        this.setupStepNavigation();
        this.setupCouponInput();
        this.setupFormValidation();
        this.setupSubmitButton();
        this.setMinDates();

        // Initialize AOS
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
                offset: 50
            });
        }
    }

    // ========================================
    // Date Input Handling
    // ========================================
    setupDateInputs() {
        const checkinInput = document.getElementById('checkin-date');
        const checkoutInput = document.getElementById('checkout-date');

        if (checkinInput) {
            checkinInput.addEventListener('change', () => {
                this.bookingData.checkinDate = checkinInput.value;

                // Set minimum checkout date to day after checkin
                if (checkinInput.value) {
                    const minCheckout = new Date(checkinInput.value);
                    minCheckout.setDate(minCheckout.getDate() + 1);
                    checkoutInput.min = this.formatDate(minCheckout);

                    // Clear checkout if it's before checkin
                    if (checkoutInput.value && new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
                        checkoutInput.value = '';
                        this.bookingData.checkoutDate = null;
                    }
                }

                this.updateBookingSummary();
            });
        }

        if (checkoutInput) {
            checkoutInput.addEventListener('change', () => {
                this.bookingData.checkoutDate = checkoutInput.value;
                this.updateBookingSummary();
            });
        }
    }

    setMinDates() {
        const checkinInput = document.getElementById('checkin-date');
        const checkoutInput = document.getElementById('checkout-date');

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (checkinInput) {
            checkinInput.min = this.formatDate(today);
        }
        if (checkoutInput) {
            checkoutInput.min = this.formatDate(tomorrow);
        }
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDisplayDate(dateString) {
        if (!dateString) return '—';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekday = weekdays[date.getDay()];
        return `${year}年${month}月${day}日(${weekday})`;
    }

    // ========================================
    // Guest Count
    // ========================================
    setupGuestCount() {
        const guestSelect = document.getElementById('guest-count');
        if (guestSelect) {
            guestSelect.addEventListener('change', () => {
                this.bookingData.guests = parseInt(guestSelect.value);
                this.updateBookingSummary();
            });
        }
    }

    // ========================================
    // Step Navigation
    // ========================================
    setupStepNavigation() {
        // Next buttons
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', () => {
                const nextStep = parseInt(btn.dataset.next);
                if (this.validateCurrentStep()) {
                    this.goToStep(nextStep);
                }
            });
        });

        // Previous buttons
        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', () => {
                const prevStep = parseInt(btn.dataset.prev);
                this.goToStep(prevStep);
            });
        });
    }

    goToStep(step) {
        // Update current step
        this.currentStep = step;

        // Update step visibility
        document.querySelectorAll('.booking-step').forEach(stepEl => {
            stepEl.classList.remove('active');
        });
        document.querySelector(`.step-${step}`).classList.add('active');

        // Update progress indicators
        document.querySelectorAll('.progress-step').forEach(progressStep => {
            const stepNum = parseInt(progressStep.dataset.step);
            progressStep.classList.remove('active', 'completed');

            if (stepNum === step) {
                progressStep.classList.add('active');
            } else if (stepNum < step) {
                progressStep.classList.add('completed');
            }
        });

        // Update progress lines
        document.querySelectorAll('.progress-line').forEach((line, index) => {
            if (index < step - 1) {
                line.classList.add('completed');
            } else {
                line.classList.remove('completed');
            }
        });

        // Scroll to top of form
        window.scrollTo({
            top: document.querySelector('.booking-content').offsetTop - 150,
            behavior: 'smooth'
        });
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validateDateSelection();
            case 2:
                return this.validateGuestForm();
            case 3:
                return this.validatePayment();
            default:
                return true;
        }
    }

    validateDateSelection() {
        const checkinInput = document.getElementById('checkin-date');
        const checkoutInput = document.getElementById('checkout-date');

        if (!checkinInput.value) {
            this.showError(checkinInput, 'チェックイン日を選択してください');
            return false;
        }

        if (!checkoutInput.value) {
            this.showError(checkoutInput, 'チェックアウト日を選択してください');
            return false;
        }

        if (new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
            this.showError(checkoutInput, 'チェックアウト日はチェックイン日より後にしてください');
            return false;
        }

        return true;
    }

    validateGuestForm() {
        const form = document.getElementById('guest-form');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showError(field, 'この項目は必須です');
                isValid = false;
            } else {
                this.clearError(field);
            }
        });

        // Email validation
        const emailField = document.getElementById('guest-email');
        if (emailField.value && !this.isValidEmail(emailField.value)) {
            this.showError(emailField, '有効なメールアドレスを入力してください');
            isValid = false;
        }

        if (isValid) {
            // Store guest info
            this.bookingData.guestInfo = {
                lastName: document.getElementById('guest-lastname').value,
                firstName: document.getElementById('guest-firstname').value,
                lastNameKana: document.getElementById('guest-lastname-kana').value,
                firstNameKana: document.getElementById('guest-firstname-kana').value,
                email: document.getElementById('guest-email').value,
                phone: document.getElementById('guest-phone').value,
                requests: document.getElementById('guest-requests').value
            };
        }

        return isValid;
    }

    validatePayment() {
        const termsCheckbox = document.getElementById('terms-agree');

        if (!termsCheckbox.checked) {
            this.showError(termsCheckbox.closest('.checkbox-wrapper'), '利用規約に同意してください');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(element, message) {
        this.clearError(element);
        element.classList.add('error');

        const errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        element.parentNode.appendChild(errorEl);
    }

    clearError(element) {
        element.classList.remove('error');
        const existingError = element.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    // ========================================
    // Coupon Handling
    // ========================================
    setupCouponInput() {
        const applyBtn = document.querySelector('.apply-coupon');
        const couponInput = document.getElementById('coupon-code');
        const couponMessage = document.getElementById('coupon-message');

        if (applyBtn && couponInput) {
            applyBtn.addEventListener('click', () => {
                const code = couponInput.value.trim().toUpperCase();

                if (!code) {
                    couponMessage.textContent = 'クーポンコードを入力してください';
                    couponMessage.className = 'coupon-message error';
                    return;
                }

                // Simulated coupon validation
                // In production, this would be an API call
                this.validateCoupon(code).then(result => {
                    if (result.valid) {
                        this.discount = result.discount;
                        this.bookingData.couponCode = code;
                        couponMessage.textContent = `クーポンが適用されました: ¥${result.discount.toLocaleString()}割引`;
                        couponMessage.className = 'coupon-message success';
                        document.getElementById('discount-row').style.display = 'flex';
                        this.updateBookingSummary();
                    } else {
                        couponMessage.textContent = result.message || '無効なクーポンコードです';
                        couponMessage.className = 'coupon-message error';
                        this.discount = 0;
                        document.getElementById('discount-row').style.display = 'none';
                        this.updateBookingSummary();
                    }
                });
            });
        }
    }

    async validateCoupon(code) {
        // Simulated coupon validation
        // Replace with actual API call
        return new Promise(resolve => {
            setTimeout(() => {
                // Demo coupons
                const validCoupons = {
                    'WELCOME10': { discount: 3500, message: '10%オフ' },
                    'KYOTO2024': { discount: 5000, message: '¥5,000オフ' },
                    'FIRST': { discount: 2000, message: '初回割引' }
                };

                if (validCoupons[code]) {
                    resolve({ valid: true, discount: validCoupons[code].discount });
                } else {
                    resolve({ valid: false, message: '無効なクーポンコードです' });
                }
            }, 500);
        });
    }

    // ========================================
    // Form Validation
    // ========================================
    setupFormValidation() {
        const form = document.getElementById('guest-form');
        if (form) {
            form.querySelectorAll('input, textarea').forEach(field => {
                field.addEventListener('blur', () => {
                    if (field.required && !field.value.trim()) {
                        this.showError(field, 'この項目は必須です');
                    } else {
                        this.clearError(field);
                    }
                });

                field.addEventListener('input', () => {
                    this.clearError(field);
                });
            });
        }
    }

    // ========================================
    // Booking Summary
    // ========================================
    updateBookingSummary() {
        const { checkinDate, checkoutDate, guests } = this.bookingData;

        // Update dates display
        document.getElementById('summary-checkin').textContent = this.formatDisplayDate(checkinDate);
        document.getElementById('summary-checkout').textContent = this.formatDisplayDate(checkoutDate);
        document.getElementById('summary-guests').textContent = `${guests}名`;

        // Calculate nights
        if (checkinDate && checkoutDate) {
            const start = new Date(checkinDate);
            const end = new Date(checkoutDate);
            const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            this.bookingData.nights = nights;
            document.getElementById('summary-nights').textContent = `${nights}泊`;

            // Calculate pricing
            const basePrice = this.pricePerNight * nights;
            const taxes = Math.floor(basePrice * this.taxRate);
            const total = basePrice - this.discount + taxes;

            this.bookingData.basePrice = basePrice;
            this.bookingData.taxes = taxes;
            this.bookingData.total = total;

            document.getElementById('summary-base-price').textContent = `¥${basePrice.toLocaleString()}`;
            document.getElementById('summary-discount').textContent = `-¥${this.discount.toLocaleString()}`;
            document.getElementById('summary-taxes').textContent = `¥${taxes.toLocaleString()}`;
            document.getElementById('summary-total').textContent = `¥${total.toLocaleString()}`;
        } else {
            document.getElementById('summary-nights').textContent = '—泊';
            document.getElementById('summary-base-price').textContent = '¥0';
            document.getElementById('summary-taxes').textContent = '¥0';
            document.getElementById('summary-total').textContent = '¥0';
        }
    }

    // ========================================
    // Submit Booking
    // ========================================
    setupSubmitButton() {
        const submitBtn = document.getElementById('submit-booking');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                if (this.validatePayment()) {
                    this.submitBooking();
                }
            });
        }
    }

    async submitBooking() {
        const submitBtn = document.getElementById('submit-booking');

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<i class="fas fa-spinner"></i> 処理中...';
        submitBtn.disabled = true;

        try {
            // In production, this would:
            // 1. Create reservation via API
            // 2. Create Stripe PaymentIntent
            // 3. Confirm payment with Stripe Elements

            // Simulated processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Redirect to processing page
            window.location.href = 'processing.html';

        } catch (error) {
            console.error('Booking error:', error);
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = '<i class="fas fa-lock"></i> 予約を確定する';
            submitBtn.disabled = false;

            // Show error message
            const cardErrors = document.getElementById('card-errors');
            if (cardErrors) {
                cardErrors.textContent = '決済処理中にエラーが発生しました。もう一度お試しください。';
            }
        }
    }
}

// ========================================
// Initialize on DOM Ready
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    new BookingController();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BookingController };
}
