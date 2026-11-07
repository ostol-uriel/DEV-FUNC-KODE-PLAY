document.addEventListener("DOMContentLoaded", () => {
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
    const cards = document.querySelectorAll(".section .card, .manual-card");

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

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // HOME: MIGRATION LOG — types the transformation log, a batch of CDC events, then settles on "listening"
    const logBody = document.querySelector("#heroLog .log-body");
    if (logBody) {
        const LOG = [
            ["19:55:50", "[Phase1b] Running transformation..."],
            ["19:55:50", "[Phase1b] Starting Transformation Phase..."],
            ["19:55:50", "[Phase1b] Pass 1 — Migrating tables to flat collections..."],
            ["19:55:52", "[Phase1b] [Pass 1] 100 inserts/reads → migrated_payments"],
            ["19:55:56", "[Phase1b] [Pass 1] 400 inserts/reads → migrated_order_items"],
            ["19:55:58", "[Phase1b] [Pass 1] 200 inserts/reads → migrated_orders"],
            ["19:55:59", "[Phase1b] [Pass 1] 20 inserts/reads → migrated_cdc_events"],
            ["19:56:01", "[Phase1b] [Pass 1] 25 inserts/reads → migrated_products"],
            ["19:56:03", "[Phase1b] [Pass 1] 50 inserts/reads → migrated_customers"],
            ["19:56:03", "[Phase1b] Pass 2 — Nesting and referencing..."],
            ["19:56:05", "[Phase1b] [Ref] payments_ref → migrated_orders (100 parents updated)"],
            ["19:56:09", "[Phase1b] [Nest] order_items → migrated_orders (200 parents updated)"],
            ["19:56:10", "[Phase1b] [Ref] order_items_ref → migrated_products (25 parents updated)"],
            ["19:56:11", "[Phase1b] [Ref] orders_ref → migrated_customers (50 parents updated)"],
            ["19:56:11", "[Phase1b] [Nest] cdc_events → migrated_customers (20 parents updated)"],
            ["19:56:11", "[Phase1b] Transformation Phase Complete.", "ok"],
            ["19:56:11", "[Phase1b] Transform phase complete.", "ok"],
            ["", "===== Phase2 =====", "divider"],
            ["19:56:12", "[Phase2] Starting live CDC consumer..."],
            ["19:56:12", "[Phase2] Starting CDC from snapshot handoff offsets on 6 partition(s)."],
            ["19:56:12", "[Phase2] CDC consumer running — listening for changes..."]
        ];
        const CDC_TABLES = ["products", "products", "products", "order_items", "order_items", "customer_profiles", "product_images", "orders", "payments", "customers"];
        const CDC_OPS = ["c", "c", "u", "u", "u", "d"];
        const CDC_COUNT = 10;
        const pick = list => list[Math.floor(Math.random() * list.length)];
        const hms = s => [Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60].map(n => String(n).padStart(2, "0")).join(":");
        let clock = 19 * 3600 + 56 * 60 + 12;

        const caret = document.createElement("span");
        caret.className = "caret";

        // Follow new lines unless the visitor has scrolled up to read earlier ones
        let follow = true;
        const updateMask = () => logBody.classList.toggle("scrolled", logBody.scrollTop > 4);
        logBody.addEventListener("scroll", () => {
            follow = logBody.scrollTop + logBody.clientHeight >= logBody.scrollHeight - 24;
            updateMask();
        });
        const stickToBottom = () => {
            if (follow) logBody.scrollTo({ top: logBody.scrollHeight, behavior: "instant" });
            updateMask();
        };

        const addLine = ([time, text, kind], charDelay, done) => {
            const line = document.createElement("p");
            line.className = "log-line" + (kind ? " " + kind : "");
            if (kind !== "divider") {
                const t = document.createElement("time");
                t.textContent = time;
                line.append(t);
            }
            const msg = document.createElement("span");
            line.append(msg);
            logBody.append(line);

            if (reduceMotion || !charDelay) { msg.textContent = text; msg.append(caret); stickToBottom(); if (done) done(); return; }
            let i = 0;
            const type = () => {
                i = Math.min(text.length, i + 2);
                msg.textContent = text.slice(0, i);
                msg.append(caret);
                stickToBottom();
                if (i < text.length) setTimeout(type, charDelay); else if (done) done();
            };
            type();
        };
        const cdcEvent = () => {
            clock += Math.random() < 0.6 ? 0 : 1;
            return [hms(clock), `[Phase2] CDC event: op=${pick(CDC_OPS)} table=${pick(CDC_TABLES)}`];
        };
        const listening = () => [hms(++clock), "[Phase2] CDC consumer running — listening for changes..."];

        if (reduceMotion) {
            LOG.forEach(l => addLine(l));
            for (let k = 0; k < CDC_COUNT; k++) addLine(cdcEvent());
            addLine(listening());
        } else {
            let sent = 0;
            const stream = () => {
                if (sent++ >= CDC_COUNT) { setTimeout(() => addLine(listening(), 10), 900); return; }
                addLine(cdcEvent(), 8, () => setTimeout(stream, 500 + Math.random() * 1100));
            };
            const next = k => {
                if (k >= LOG.length) { setTimeout(stream, 1400); return; }
                const pause = LOG[k + 1] && LOG[k + 1][2] === "divider" ? 700 : 220;
                addLine(LOG[k], 10, () => setTimeout(() => next(k + 1), pause));
            };
            setTimeout(() => next(0), 1100);
        }
    }

    // HOME: DOWNLOADS — one place to update each release
    const RELEASE_BASE = "https://github.com/ostol-uriel/DEV-FUNC-KODE-PLAY/releases/download/v1.0.0/";
    const DOWNLOADS = {
        version: "2.2.0",
        released: "May 2026",
        releasesUrl: "https://github.com/ostol-uriel/DEV-FUNC-KODE-PLAY/releases",
        builds: {
            installer: {
                os: "windows", title: "Windows Installer", label: "Installer", size: "507 MB",
                file: "GRASYA.Enterprise.Manager.Setup.2.2.0.exe",
                url: RELEASE_BASE + "GRASYA.Enterprise.Manager.Setup.2.2.0.exe",
                steps: [
                    "Open the downloaded <b>GRASYA Enterprise Manager Setup</b> file.",
                    "Follow the installation prompts.",
                    "Start GRASYA from the Start menu or the desktop shortcut."
                ],
                note: "If Windows shows a security prompt, check that the publisher and file source match what your organization supplied. If they don't, cancel and contact support."
            },
            portable: {
                os: "windows", title: "Windows Portable", label: "Portable", size: "507 MB",
                file: "GRASYA.Enterprise.Manager.2.2.0.exe",
                url: RELEASE_BASE + "GRASYA.Enterprise.Manager.2.2.0.exe",
                steps: [
                    "Move the downloaded <b>.exe</b> to a folder where you're allowed to run applications.",
                    "Double-click it to open GRASYA. Nothing is installed.",
                    "Keep the file in that folder. It is the whole application."
                ],
                note: "Your organization's endpoint-security system may still need to approve the app before it runs."
            },
            appimage: {
                os: "linux", title: "Linux AppImage", label: "AppImage", size: null,
                file: "GRASYA.Enterprise.Manager-2.2.0.AppImage",
                url: null, // TODO: set url and size once the AppImage is uploaded to the GitHub release
                steps: [
                    "Open the folder that contains the downloaded <b>.AppImage</b>.",
                    "Mark it as executable: <b>Properties → Permissions → Allow executing as program</b> (or <code>chmod +x</code>).",
                    "Double-click the AppImage to start GRASYA."
                ],
                note: "If your desktop asks for confirmation, check that the file came from the GRASYA release page before continuing."
            }
        },
        afterOpen: [
            "The status bar at the bottom shows <b>Disconnected</b> until you connect your databases.",
            "Select <b>Connect</b> on the toolbar to start the Migration Wizard. The status changes to <b>Ready</b>."
        ]
    };

    const heroDownload = document.getElementById("heroDownload");
    const installModal = document.getElementById("installModal");
    if (heroDownload && installModal) {
        const builds = DOWNLOADS.builds;
        const isReady = key => Boolean(builds[key] && builds[key].url);
        const metaText = key => ["v" + DOWNLOADS.version, builds[key].label, builds[key].size].filter(Boolean).join(" · ");
        const stepsHTML = key => `<ol class="dl-step-list">${builds[key].steps.map(s => `<li>${s}</li>`).join("")}</ol>` +
                                 `<div class="callout callout-warn">${builds[key].note}</div>`;

        const detectOS = () => {
            const ua = navigator.userAgent || "";
            const platform = (navigator.userAgentData && navigator.userAgentData.platform) || ua;
            if (/Android|iPhone|iPad|iPod|Mobi/i.test(ua)) return "other";
            if (/Win/i.test(platform)) return "windows";
            if (/Linux|X11/i.test(platform)) return "linux";
            return "other";
        };
        const os = detectOS();

        // Point a link at a build's file; unpublished builds become inert
        const wire = (a, key) => {
            a.dataset.install = key;
            if (isReady(key)) { a.href = builds[key].url; return; }
            a.removeAttribute("href");
            a.setAttribute("aria-disabled", "true");
            a.classList.add("is-pending");
        };

        // Hero: one button for the visitor's OS, other builds as small links
        const primary = os === "linux" ? "appimage" : os === "windows" ? "installer" : null;
        const heroLabel = heroDownload.querySelector("span");
        const heroMeta = document.getElementById("heroMeta");
        if (primary && isReady(primary)) {
            heroLabel.textContent = `Download for ${os === "linux" ? "Linux" : "Windows"}`;
            heroMeta.textContent = metaText(primary);
            wire(heroDownload, primary);
        } else {
            // macOS, phones, or a build that isn't published yet: send people to the cards
            heroLabel.textContent = primary ? "Linux version coming soon" : "See downloads";
            heroMeta.textContent = primary ? "The AppImage isn't published yet" : "GRASYA runs on Windows and Linux";
            delete heroDownload.dataset.install;
            heroDownload.href = "#downloads";
        }
        const heroAlt = document.getElementById("heroAlt");
        const altLinks = os === "linux"
            ? [["Windows", "installer"], ["All downloads ↓", null]]
            : os === "windows"
                ? [["Portable version", "portable"], ["Linux", null], ["All downloads ↓", null]]
                : [];
        heroAlt.hidden = altLinks.length === 0;
        heroAlt.textContent = "";
        altLinks.forEach(([text, key], i) => {
            if (i) heroAlt.append(" · ");
            const a = document.createElement("a");
            a.textContent = text;
            if (key) wire(a, key); else a.href = "#downloads";
            heroAlt.append(a);
        });

        // Downloads section: highlight the visitor's OS, fill buttons, sizes and steps
        document.querySelectorAll(".dl-card").forEach(c => c.classList.toggle("is-current", c.dataset.os === os));
        document.querySelectorAll("[data-build]").forEach(a => {
            wire(a, a.dataset.build);
            a.textContent = isReady(a.dataset.build) ? "Download" : "Coming soon";
        });
        document.querySelectorAll("[data-size]").forEach(el => {
            const size = builds[el.dataset.size].size;
            el.textContent = size ? `(${size})` : "";
        });
        document.querySelectorAll("[data-steps]").forEach(el => { el.innerHTML = stepsHTML(el.dataset.steps); });
        const dlFoot = document.getElementById("dlFoot");
        if (dlFoot) {
            dlFoot.innerHTML = `Version ${DOWNLOADS.version} · Released ${DOWNLOADS.released} · ` +
                `<a href="${DOWNLOADS.releasesUrl}">Release notes</a> · <a href="#before-install">Requirements ↑</a>`;
        }

        // Pop-up: the link still downloads as normal; the steps for that build open alongside it
        let lastFocus = null;
        document.addEventListener("click", e => {
            const a = e.target.closest("a[data-install]");
            if (!a || installModal.contains(a)) return;
            if (a.getAttribute("aria-disabled") === "true") { e.preventDefault(); return; }
            const key = a.dataset.install;
            const b = builds[key];
            document.getElementById("installTitle").textContent = `Installing the ${b.title}`;
            document.getElementById("modalFile").textContent = `${b.file} · ${metaText(key)}`;
            document.getElementById("modalRetry").href = b.url;
            document.getElementById("modalSteps").innerHTML = stepsHTML(key);
            document.getElementById("modalAfter").innerHTML =
                `<ul class="check-list">${DOWNLOADS.afterOpen.map(s => `<li>${s}</li>`).join("")}</ul>`;
            lastFocus = a;
            installModal.showModal();
        });
        installModal.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => installModal.close()));
        installModal.addEventListener("click", e => { if (e.target === installModal) installModal.close(); });
        installModal.addEventListener("close", () => { if (lastFocus) lastFocus.focus(); });
    }
});
