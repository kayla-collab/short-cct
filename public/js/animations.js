document.addEventListener('DOMContentLoaded', () => {
    // 1. Futuristic Particle System
    const createParticles = () => {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        hero.insertBefore(particlesContainer, hero.firstChild);

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random positioning
            const left = Math.random() * 100;
            const size = Math.random() * 5 + 2;
            const duration = Math.random() * 5 + 3;
            const delay = Math.random() * 2;
            
            particle.style.left = `${left}%`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            // Random colors from our palette
            const colors = ['var(--electric-blue)', 'var(--tech-green)', 'var(--cyber-purple)', 'var(--coral)'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            particlesContainer.appendChild(particle);
        }
    };
    createParticles();

    // 2. Scroll Reveal Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add specific animation classes based on element type
                if(entry.target.classList.contains('how-card')) {
                    entry.target.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Target elements to animate
    const animatedElements = document.querySelectorAll('.how-card, .stat-item, .feature-card, h2, .hero-content > *');
    
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        // Add stagger delay
        el.style.transitionDelay = `${index % 3 * 0.1}s`;
        observer.observe(el);
    });

    // 3. Parallax Effect for Hero Background (disabled - can cause scroll glitches)
    // window.addEventListener('scroll', () => {
    //     const scrolled = window.pageYOffset;
    //     const hero = document.querySelector('.hero');
    //     if (hero) {
    //         hero.style.backgroundPosition = `center ${scrolled * 0.5}px`;
    //     }
    // });
});