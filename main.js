// Main JavaScript for Website Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initializeAnimations();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize scroll animations
    initializeScrollAnimations();
    
    // Initialize skill bars
    initializeSkillBars();
    
    // Initialize project filters
    initializeProjectFilters();
    
    // Initialize contact form
    initializeContactForm();
});

// Initialize all animations
function initializeAnimations() {
    // Neural Network Animation for Hero Section
    if (document.getElementById('neural-network-animation')) {
        new NeuralNetworkAnimation('neural-network-animation', {
            nodeCount: 120,
            connectionDistance: 150,
            colors: {
                nodes: '#4CAF50',
                connections: 'rgba(42, 59, 143, 0.5)',
                pulse: '#FFC107'
            }
        });
    }
    
    // Molecular Particles Animation for About Section
    if (document.getElementById('molecular-particles-animation')) {
        new MolecularParticlesAnimation('molecular-particles-animation', {
            particleCount: 50,
            colors: ['#673AB7', '#4CAF50', '#2A3B8F'],
            opacity: 0.5
        });
    }
    
    // Brain Connectivity Animation for Education Section
    if (document.getElementById('brain-connectivity-animation')) {
        new BrainConnectivityAnimation('brain-connectivity-animation', {
            nodeCount: 30,
            colors: {
                nodes: ['#2A3B8F', '#4CAF50', '#673AB7', '#FFC107'],
                connections: 'rgba(96, 125, 139, 0.3)'
            }
        });
    }
    
    // DNA Helix Animation for Projects Section
    if (document.getElementById('dna-helix-animation')) {
        new DNAHelixAnimation('dna-helix-animation', {
            colors: {
                strand1: '#2A3B8F',
                strand2: '#4CAF50',
                basePair1: '#FFC107',
                basePair2: '#673AB7'
            }
        });
    }
    
    // Initialize Skill Bar Animations
    new SkillBarAnimation('.skill-item', {
        colors: {
            bar: '#4CAF50',
            background: '#f0f0f0',
            pulse: '#FFC107'
        }
    });
    
    // Initialize Scroll Trigger Animations
    new ScrollTriggerAnimations();
}

// Initialize navigation functionality
function initializeNavigation() {
    const header = document.getElementById('header');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    // Sticky header on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Toggle icon
            const icon = mobileMenuBtn.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
            }
            
            // Get target section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Scroll to target section
                window.scrollTo({
                    top: targetSection.offsetTop - 70,
                    behavior: 'smooth'
                });
                
                // Update active link
                navLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Update active link on scroll
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize scroll animations
function initializeScrollAnimations() {
    // Find all elements with data-animate attribute
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    // Observe each animated element
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Initialize skill bars
function initializeSkillBars() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(item => {
        const value = item.getAttribute('data-value');
        const progressBar = item.querySelector('.skill-bar-progress');
        
        if (progressBar) {
            // Create intersection observer for skill bars
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        progressBar.style.width = value + '%';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            
            observer.observe(item);
        }
    });
}

// Initialize project filters
function initializeProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Get filter value
            const filter = this.getAttribute('data-filter');
            
            // Filter projects
            projectCards.forEach(card => {
                const categories = card.getAttribute('data-category');
                
                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = 'block';
                    
                    // Add animation
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    // Hide after animation
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Initialize contact form
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Validate form
            if (!name || !email || !subject || !message) {
                alert('Please fill in all fields');
                return;
            }
            
            // Simulate form submission
            const submitBtn = contactForm.querySelector('.form-submit');
            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Reset form
                contactForm.reset();
                
                // Show success message
                alert('Your message has been sent successfully!');
                
                // Reset button
                submitBtn.innerHTML = 'Send Message';
                submitBtn.disabled = false;
            }, 1500);
        });
    }
}

// Helper function to create neural pulse effect
function createNeuralPulse(x, y, container) {
    const pulse = document.createElement('div');
    pulse.className = 'neural-pulse';
    pulse.style.left = x + 'px';
    pulse.style.top = y + 'px';
    
    container.appendChild(pulse);
    
    // Remove pulse after animation
    setTimeout(() => {
        pulse.remove();
    }, 2000);
}

// Helper function for parallax effect
function parallaxEffect(element, speed) {
    const scrollY = window.scrollY;
    element.style.transform = `translateY(${scrollY * speed}px)`;
}

// Helper function to create typewriter effect
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Helper function to create count-up animation
function countUp(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCount() {
        start += increment;
        
        if (start >= target) {
            element.textContent = target;
        } else {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCount);
        }
    }
    
    updateCount();
}
