// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add fade-in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all content cards for animation
    const cards = document.querySelectorAll('.content-card, .tip-card, .remedy-card, .treatment-card, .resource-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });

    // Highlight active navigation link on scroll
    function highlightNavLink() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-menu a');

        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);

    // Add active class styling for navigation
    const style = document.createElement('style');
    style.textContent = `
        .nav-menu a.active {
            opacity: 1;
            border-bottom: 2px solid white;
            padding-bottom: 5px;
        }
    `;
    document.head.appendChild(style);

    // Mobile menu toggle (if needed for very small screens)
    function createMobileMenu() {
        const nav = document.querySelector('.nav-menu');
        const navContainer = document.querySelector('.nav-container');

        if (window.innerWidth <= 768) {
            // Create hamburger menu for very small screens
            const hamburger = document.createElement('div');
            hamburger.className = 'hamburger';
            hamburger.innerHTML = '☰';
            hamburger.style.cssText = `
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                display: none;
            `;

            navContainer.insertBefore(hamburger, nav);

            hamburger.addEventListener('click', function() {
                nav.classList.toggle('mobile-menu-open');
            });

            // Add mobile menu styles
            const mobileStyle = document.createElement('style');
            mobileStyle.textContent = `
                @media (max-width: 768px) {
                    .hamburger {
                        display: block !important;
                    }
                    .nav-menu {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        flex-direction: column;
                        padding: 20px;
                        transform: translateY(-100%);
                        opacity: 0;
                        transition: all 0.3s;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    }
                    .nav-menu.mobile-menu-open {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    .nav-menu a {
                        padding: 10px 0;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                    }
                }
            `;
            document.head.appendChild(mobileStyle);
        }
    }

    createMobileMenu();

    // Handle window resize for mobile menu
    window.addEventListener('resize', function() {
        const hamburger = document.querySelector('.hamburger');
        const nav = document.querySelector('.nav-menu');

        if (window.innerWidth > 768 && hamburger) {
            hamburger.style.display = 'none';
            nav.classList.remove('mobile-menu-open');
        } else if (window.innerWidth <= 768 && hamburger) {
            hamburger.style.display = 'block';
        }
    });

    // Add loading animation for hero stats
    function animateStats() {
        const stats = document.querySelectorAll('.stat .number');

        stats.forEach((stat, index) => {
            setTimeout(() => {
                stat.style.animation = 'countUp 2s ease-out forwards';
            }, index * 200);
        });
    }

    // Add count up animation
    const countUpStyle = document.createElement('style');
    countUpStyle.textContent = `
        @keyframes countUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(countUpStyle);

    // Trigger animations after page load
    setTimeout(animateStats, 500);
});
