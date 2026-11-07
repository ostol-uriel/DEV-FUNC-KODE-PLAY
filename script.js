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

    // MANUAL PAGE: TOC SCROLL-SPY + COLLAPSED TOC ON SMALL SCREENS
    const toc = document.getElementById("manualToc");
    if (toc) {
        const tocLinks = [...toc.querySelectorAll("a")];
        const sections = tocLinks.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
        const setActive = id => tocLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));

        const spy = new IntersectionObserver(entries => {
            entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
        }, { rootMargin: "-30% 0px -60% 0px" });
        sections.forEach(s => spy.observe(s));

        const tocDetails = document.getElementById("tocDetails");
        if (tocDetails && window.matchMedia("(max-width: 900px)").matches) {
            tocDetails.open = false;
            tocLinks.forEach(a => a.addEventListener("click", () => { tocDetails.open = false; }));
        }
    }

    // MANUAL PAGE: CLICK A SCREENSHOT TO VIEW IT FULL SIZE
    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
        const boxImg = lightbox.querySelector("img");
        const boxCaption = lightbox.querySelector("p");
        let lastFocus = null;

        const closeLightbox = () => {
            lightbox.classList.remove("open");
            document.body.style.overflow = "";
            if (lastFocus) lastFocus.focus();
        };

        document.querySelectorAll(".manual-figure").forEach(fig => {
            fig.addEventListener("click", e => {
                e.preventDefault();
                boxImg.src = fig.getAttribute("href");
                boxImg.alt = fig.querySelector("img").alt;
                const caption = fig.querySelector("span");
                boxCaption.textContent = caption ? caption.firstChild.textContent.trim() : "";
                lastFocus = fig;
                lightbox.classList.add("open");
                document.body.style.overflow = "hidden";
                lightbox.querySelector(".lightbox-close").focus();
            });
        });

        lightbox.addEventListener("click", closeLightbox);
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
        });
    }

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