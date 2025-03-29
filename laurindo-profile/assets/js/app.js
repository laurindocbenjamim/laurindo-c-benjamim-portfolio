
/*document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-2px)';
        });
        link.addEventListener('mouseout', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    const socialIcons = document.querySelectorAll('.social-icons a');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-3px)';
        });
        icon.addEventListener('mouseout', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    const skillBadges = document.querySelectorAll('.skill-badge');
    skillBadges.forEach(badge => {
        badge.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.1)';
        });
        badge.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
        });
    });
});*/

// Smooth scrolling for anchor links

        // Scroll Reveal Animation
        const revealElements = document.querySelectorAll('.reveal');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });

        // Smooth Scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
