// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Button Click Animations
    const ctaButton = document.getElementById('ctaButton');
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    
    // Add bounce animation on CTA button click
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Remove bounce animation temporarily
            this.style.animation = 'none';
            
            // Trigger a more dramatic bounce
            this.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                this.style.animation = 'bounce 2s infinite';
            }, 100);
            
            // Show an alert (can be customized to navigate or show modal)
            setTimeout(() => {
                alert('Welcome! This is a demo animated landing page.');
            }, 200);
        });
    }
    
    // Add bounce effect on Learn More button
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
            
            // Scroll to cards section smoothly
            const cardsSection = document.querySelector('.cards-section');
            if (cardsSection) {
                cardsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Scroll-based Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    // Create intersection observer for scroll animations
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Add stagger effect for cards
                if (entry.target.classList.contains('card')) {
                    const cards = document.querySelectorAll('.card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe all cards for scroll animation
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        observer.observe(card);
    });
    
    // Observe content sections
    const contentSections = document.querySelectorAll('.content-text, .content-image');
    contentSections.forEach(section => {
        observer.observe(section);
    });
    
    // Parallax effect on hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-content');
        
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            hero.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });
    
    // Add hover effects to social icons
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2) rotate(10deg)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });
    
    // Card icon rotation on hover
    const cardIcons = document.querySelectorAll('.card-icon');
    cardIcons.forEach(icon => {
        const parentCard = icon.closest('.card');
        
        if (parentCard) {
            parentCard.addEventListener('mouseenter', function() {
                icon.style.transform = 'rotate(360deg) scale(1.1)';
            });
            
            parentCard.addEventListener('mouseleave', function() {
                icon.style.transform = 'rotate(0deg) scale(1)';
            });
        }
    });
    
    // Add floating animation to cards on scroll
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                const scrollDirection = scrollTop > lastScrollTop ? 1 : -1;
                const offset = Math.sin(Date.now() / 1000 + index) * 5;
                
                card.style.transform = `translateY(${offset}px)`;
            }
        });
        
        lastScrollTop = scrollTop;
    }, { passive: true });
    
    // Add ripple effect to buttons
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }
    
    // Add ripple effect styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .cta-button, .secondary-button {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Apply ripple effect to all buttons
    const buttons = document.querySelectorAll('.cta-button, .secondary-button');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Console welcome message
    console.log('%c🎨 Welcome to our Animated Landing Page!', 'font-size: 20px; color: #667eea; font-weight: bold;');
    console.log('%cBuilt with vanilla HTML, CSS, and JavaScript', 'font-size: 14px; color: #764ba2;');
    
});
