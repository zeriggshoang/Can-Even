// =============================================================
// GLOBAL SETUP & SMOOTH SCROLL (LENIS)
// =============================================================
let lenis;

document.addEventListener("DOMContentLoaded", () => {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    gsap.registerPlugin(ScrollTrigger);

    initNewMenuSystem();
    initContactPopup();
    initCursorAndLightbox();

    document.fonts.ready.then(() => {
        prepareTextLayouts();
        initAnimations();
    });
});

// =============================================================
// 1. MENU & NAVIGATION SYSTEM
// =============================================================
function initNewMenuSystem() {
    const links = document.querySelectorAll(".menu-link");

    links.forEach(link => {
        const text = link.getAttribute("data-text");
        link.innerHTML = "";
        const wrapper = document.createElement("div"); wrapper.className = "words-wrapper";
        const topWord = document.createElement("div"); topWord.className = "word top-word";
        const bottomWord = document.createElement("div"); bottomWord.className = "word bottom-word";

        text.split("").forEach(char => {
            const topChar = document.createElement("span"); topChar.className = "char top-char"; topChar.innerHTML = char === " " ? "&nbsp;" : char;
            topWord.appendChild(topChar);
            const bottomChar = document.createElement("span"); bottomChar.className = "char bottom-char"; bottomChar.innerHTML = char === " " ? "&nbsp;" : char;
            bottomWord.appendChild(bottomChar);
        });

        wrapper.appendChild(topWord); wrapper.appendChild(bottomWord); link.appendChild(wrapper);

        const topChars = link.querySelectorAll(".top-char");
        const bottomChars = link.querySelectorAll(".bottom-char");
        gsap.set(bottomChars, { y: "100%" });

        link.addEventListener("mouseenter", () => {
            gsap.to(topChars, { y: "-100%", duration: 0.5, stagger: 0.02, ease: "back.out(1.2)" });
            gsap.to(bottomChars, { y: "0%", duration: 0.5, stagger: 0.02, ease: "back.out(1.2)" });
        });
        link.addEventListener("mouseleave", () => {
            gsap.to(topChars, { y: "0%", duration: 0.5, stagger: 0.02, ease: "back.out(1.2)" });
            gsap.to(bottomChars, { y: "100%", duration: 0.5, stagger: 0.02, ease: "back.out(1.2)" });
        });
    });

    const menuTl = gsap.timeline({ paused: true, reversed: true });
    menuTl.set(".menu-overlay", { visibility: "visible" })
        .to(".menu-overlay", { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1, ease: "power4.inOut" }, 0)
        .to(".top-line", { scaleX: 0, duration: 0.3 }, 0.1)
        .to(".bottom-line", { scaleX: 0, duration: 0.3 }, 0.1)
        .to(".middle-line", { scaleX: 0, duration: 0.3 }, 0.1)
        .to(".x-line-1", { scaleX: 1, rotation: 45, duration: 0.5, ease: "back.out(1.5)" }, 0.4)
        .to(".x-line-2", { scaleX: 1, rotation: -45, duration: 0.5, ease: "back.out(1.5)" }, 0.4)
        .to(".menu-hr", { scaleX: 1, duration: 0.8, stagger: 0.1, ease: "power4.out" }, 0.4)
        .fromTo(".words-wrapper", { y: "100%" }, { y: "0%", duration: 0.8, stagger: 0.1, ease: "expo.out" }, 0.5);

    const hamburger = document.querySelector(".hamburger");
    hamburger.addEventListener("click", () => {
        if (menuTl.reversed()) {
            menuTl.play();
            hamburger.classList.add("is-active");
            if (lenis) lenis.stop();
        } else {
            menuTl.reverse();
            hamburger.classList.remove("is-active");
            if (lenis) lenis.start();
        }
    });

    document.querySelectorAll('.menu-link').forEach(l => {
        if(l.id !== "menu-contact-btn") {
            l.addEventListener('click', (e) => {
                if(l.getAttribute("href") && l.getAttribute("href").includes("#location-anchor")) {
                    menuTl.reverse();
                    hamburger.classList.remove("is-active");
                    if (lenis) lenis.start();
                }
            });
        }
    });

    gsap.to(".header", { y: "0%", duration: 1.5, ease: "power4.out", delay: 0.2 });
}

// =============================================================
// 2. CONTACT BOARD
// =============================================================
function initContactPopup() {
    const contactBtns = document.querySelectorAll("#header-contact-btn, #menu-contact-btn");
    const contactBoard = document.getElementById("contact-board");
    const hamburger = document.querySelector(".hamburger");

    contactBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if(hamburger.classList.contains("is-active")) hamburger.click();
            document.body.classList.add("contact-open");
            contactBoard.classList.add("is-active");
            if (lenis) lenis.stop();
        });
    });

    contactBoard.addEventListener("click", (e) => {
        if (e.target === contactBoard) {
            document.body.classList.remove("contact-open");
            contactBoard.classList.remove("is-active");
            if (lenis) lenis.start();
        }
    });
}

// =============================================================
// 3. CURSOR & LIGHTBOX
// =============================================================
function initCursorAndLightbox() {
    const cursor = document.querySelector('.cursor-dot');
    const hoverTargets = document.querySelectorAll('.photo-wrapper, .hover-target');

    let xTo = gsap.quickTo(cursor, "left", { duration: 0.2, ease: "power3" });
    let yTo = gsap.quickTo(cursor, "top", { duration: 0.2, ease: "power3" });

    window.addEventListener('mousemove', (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
    });

    // Default Hover Text
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            cursor.setAttribute('data-text');
        });
        target.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            cursor.removeAttribute('data-text');
        });
    });

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    const lbImg = document.createElement("img");
    lightbox.appendChild(lbImg);
    document.body.appendChild(lightbox);

    document.querySelectorAll(".s3-img-inner").forEach(img => {
        img.addEventListener("click", () => {
            lbImg.src = img.src;
            lightbox.classList.add("active");
            if (lenis) lenis.stop();
        });
    });

    lightbox.addEventListener("click", () => {
        lightbox.classList.remove("active");
        if (lenis) lenis.start();
    });
}

// =============================================================
// 4. TEXT PREPARATION (SPLITTING & WRAPPING)
// =============================================================
function prepareTextLayouts() {
    const s4Container = document.getElementById("s4-text-wrap");
    const s4RawText = s4Container.getAttribute("data-s4-text") || "An error occurred fetching location text.";
    s4Container.innerHTML = s4RawText.split(" ").map(w => `<span class="word-wrap"><span class="s4-word">${w}</span></span>`).join("");

    const summaryText = document.getElementById("summary-text");
    const wordsArray = summaryText.innerText.trim().split(/\s+/);
    summaryText.innerHTML = "";

    wordsArray.forEach(word => {
        const span = document.createElement("span");
        span.innerText = word + " ";
        summaryText.appendChild(span);
    });

    let lines = [];
    let currentLine = [];
    let lastTop = -1;

    summaryText.querySelectorAll("span").forEach(span => {
        if (span.offsetTop !== lastTop) {
            if (currentLine.length > 0) lines.push(currentLine);
            currentLine = [];
            lastTop = span.offsetTop;
        }
        currentLine.push(span);
    });
    if (currentLine.length > 0) lines.push(currentLine);

    summaryText.innerHTML = "";
    lines.forEach(lineSpans => {
        const lineDiv = document.createElement("div");
        lineDiv.className = "summary-line";
        
        const content = document.createElement("div");
        content.className = "line-content";
        
        lineSpans.forEach(span => content.appendChild(span));
        lineDiv.appendChild(content);
        summaryText.appendChild(lineDiv);
    });
}

// =============================================================
// 5. MASTER GSAP SCROLL ANIMATIONS
// =============================================================
function initAnimations() {
    gsap.to(".hero-image-container", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
    });

    const introPara = document.getElementById("intro-para");
    const introWords = introPara.innerText.trim().split(/\s+/);
    introPara.innerHTML = introWords.map(w => `<span class="word-wrap"><span class="intro-word">${w}</span></span>`).join("");

    const introTl = gsap.timeline({
        scrollTrigger: { trigger: "#section-intro", start: "top top", end: "+=500%", scrub: 1, pin: true }
    });
    introTl.fromTo(".intro-word", { x: "100vw", opacity: 0 }, { x: "0vw", opacity: 1, stagger: 0.05, duration: 2, ease: "power2.out" });
    introTl.to(".intro-row", { x: () => -(document.querySelector('.intro-row').scrollWidth - window.innerWidth), duration: 6, ease: "none" }, "+=0.5");

    const s2Tl = gsap.timeline({
        scrollTrigger: { trigger: "#section-two", start: "top top", end: "+=600%", scrub: 1, pin: true }
    });

    const parts = gsap.utils.toArray(".s2-part");
    const leftImgs = gsap.utils.toArray(".left-col .photo-wrapper img");
    const rightImgs = gsap.utils.toArray(".right-col .photo-wrapper img");

    s2Tl.fromTo(".left-col", { y: "100vh" }, { y: "-350vh", ease: "none", duration: 10 }, 0);
    s2Tl.fromTo(".right-col", { y: "-350vh" }, { y: "100vh", ease: "none", duration: 10 }, 0);

    parts.forEach((part, i) => {
        let t = 0.5 + i * 1.8; 
        
        // Fades in cleanly inside the Grid
        s2Tl.fromTo(part, { y: "2vw", opacity: 0 }, { y: "0vw", opacity: 1, duration: 0.4, ease: "power2.out" }, t);
        
        s2Tl.to(leftImgs[i], { filter: "grayscale(0) brightness(1)", duration: 0.4 }, t);
        s2Tl.to(rightImgs[4 - i], { filter: "grayscale(0) brightness(1)", duration: 0.4 }, t);
        
        s2Tl.to(leftImgs[i], { filter: "grayscale(1) brightness(0.4)", duration: 0.4 }, t + 1.2);
        s2Tl.to(rightImgs[4 - i], { filter: "grayscale(1) brightness(0.4)", duration: 0.4 }, t + 1.2);
        
        // Fades out upward seamlessly
        s2Tl.to(part, { y: "-2vw", opacity: 0, duration: 0.4, ease: "power2.in" }, t + 1.2);
    });

    s2Tl.to(".s2-heading", { yPercent: -110, duration: 0.6, ease: "power2.inOut" }, 9.4);

    const s3Tl = gsap.timeline({
        scrollTrigger: { trigger: "#section-three", start: "top top", end: "+=800%", scrub: 1, pin: true }
    });

    const leftImgsS3 = gsap.utils.toArray(".left-img");
    const rightImgsS3 = gsap.utils.toArray(".right-img");

    leftImgsS3.forEach(img => gsap.set(img, { rotation: gsap.utils.random(-12, -4) }));
    rightImgsS3.forEach(img => gsap.set(img, { rotation: gsap.utils.random(4, 12) }));

    s3Tl.fromTo(".s3-phrases-wrapper", { y: "100vh" }, { y: "-60vh", duration: 10, ease: "none" }, 0);

    const s3Movers = gsap.utils.toArray(".s3-mover");
    s3Movers.forEach((mover, i) => {
        let hitTime = (45 + 12 * i) / 16; 
        s3Tl.to(mover, { y: "-50%", duration: 0.6, ease: "power2.inOut" }, hitTime);

        s3Tl.fromTo([leftImgsS3[i], rightImgsS3[i]], 
            { scale: 0, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" }, 
            hitTime
        );

        if (i > 0) {
            s3Tl.to([leftImgsS3[i-1], rightImgsS3[i-1]], 
                { scale: 0, opacity: 0, duration: 0.4, ease: "power2.in" }, 
                hitTime - 0.2
            );
        }
    });

    s3Tl.to([leftImgsS3[4], rightImgsS3[4]], { scale: 0, opacity: 0, duration: 0.4, ease: "power2.in" }, 8);

    const s4Tl = gsap.timeline({
        scrollTrigger: { trigger: "#s4-container", start: "top top", end: "+=400%", scrub: 1, pin: true }
    });

    s4Tl.fromTo(".s4-word", { x: "100vw", opacity: 0 }, { x: "0vw", opacity: 1, stagger: 0.05, duration: 2, ease: "power2.out" });
    s4Tl.to({}, { duration: 1 }); 

    s4Tl.to("#section-four", { z: -800, opacity: 0, duration: 1.5, ease: "power2.inOut" }, "transition");
    s4Tl.fromTo("#section-final", { y: "100vh" }, { y: "0vh", duration: 1.5, ease: "power2.inOut" }, "transition");

    const parsedLines = gsap.utils.toArray(".summary-line");
    parsedLines.forEach((line, i) => {
        let textStart = "transition+=" + (1.5 + (i * 0.5)); 
        s4Tl.fromTo(line.querySelector(".line-content"), 
            { clipPath: "inset(0 100% 0 0)" }, 
            { clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: "power2.inOut" }, 
            textStart
        );
    });
}