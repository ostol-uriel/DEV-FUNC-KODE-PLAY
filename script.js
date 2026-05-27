document.addEventListener("DOMContentLoaded", () => {
const lines = document.querySelectorAll('.typewriter');
    
    lines.forEach((line, index) => {
        setTimeout(() => {
            // Add the class to trigger the CSS animation and the caret border
            line.classList.add('typing-active');
        }, index * 1500); // 1.5s delay per line
    });
    // UPDATE COPYRIGHT YEAR
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // NAV SCROLL EFFECT
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
    }, { passive: true });

    // HAMBURGER MENU & ACCESSIBILITY
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    const toggleMenu = () => {
        const isActive = navLinks.classList.toggle("active");
        hamburger.setAttribute("aria-expanded", isActive);
    };

    if(hamburger) {
        hamburger.addEventListener("click", toggleMenu);
    }

    // CLOSE MENU ON LINK CLICK
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            if (navLinks.classList.contains("active")) {
                toggleMenu();
            }
        });
    });

    // OPTIMIZED FADE-IN ANIMATION FOR SCROLLING CARDS
    const cards = document.querySelectorAll(".section .card");

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                obs.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
        observer.observe(card);
    });

    // SPOTLIGHT HOVER EFFECT FOR CARDS
    const hoverCards = document.querySelectorAll('.card');
    
    document.addEventListener('mousemove', (e) => {
        for(const card of hoverCards) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });
    

});