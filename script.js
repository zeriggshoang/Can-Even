if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

let lenis;

document.addEventListener("DOMContentLoaded", async () => {
    const page = document.body.dataset.page;
    const urlParams = new URLSearchParams(window.location.search);
    const skipPreload = urlParams.get('skip');

    initNewMenuSystem();
    initContactPopup();
    initLogoNavigation();

    // Disable Lenis ENTIRELY on About & Gallery to perfectly respect their fixed native scroll/drag tracking
    if (page === "home") {
        lenis = new Lenis({ duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }

    if (page === "home") {
        init3D();
        if (skipPreload) {
            document.getElementById("preload").style.display = 'none';
            document.getElementById("main-content").style.display = "block";

            const rCan = document.querySelectorAll(".giant-text")[0];
            const rEven = document.querySelectorAll(".giant-text")[1];
            rCan.style.display = "block"; rEven.style.display = "block";
            gsap.set(rCan, { opacity: 1 }); gsap.set(rEven, { opacity: 1 });

            gsap.to(".header", { y: "0%", duration: 1.5, ease: "power4.out", delay: 0.2 });

            initHeaderScrollHiding();
            initMassiveSequence();
            initLocationSection();
        } else {
            await runPreloadSequence();
        }
    } else if (page === "gallery") {
        document.getElementById("main-content").style.display = "block";
        gsap.to(".header", { y: "0%", duration: 1.5, ease: "power4.out", delay: 0.2 });
        initGalleryGrid();
    } else if (page === "about") {
        document.getElementById("main-content").style.display = "block";
        gsap.to(".header", { y: "0%", duration: 1.5, ease: "power4.out", delay: 0.2 });
        initAboutPage();
    }
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function initLogoNavigation() {
    const logo = document.querySelector(".logo");
    logo.addEventListener("click", (e) => {
        e.preventDefault();
        const hamburger = document.querySelector(".hamburger");
        if (hamburger.classList.contains("is-active")) { hamburger.click(); }

        if (document.body.dataset.page === "home") {
            if (lenis) lenis.scrollTo(0, { duration: 1.5 });
        } else {
            window.location.href = "index.html?skip=1";
        }
    });
}

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
        .to(".logo", { color: "#FFF", duration: 0.4, ease: "power2.inOut" }, 0)
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
        if (l.id !== "menu-contact-btn") {
            l.addEventListener('click', (e) => {
                if (l.getAttribute("href") && l.getAttribute("href").includes("#location-anchor")) {
                    menuTl.reverse();
                    hamburger.classList.remove("is-active");
                    if (lenis) lenis.start();
                }
            });
        }
    });
}

function initHeaderScrollHiding() {
    let isHeaderNavVisible = true;
    window.addEventListener("scroll", () => {
        const isMenuOpen = document.querySelector('.hamburger').classList.contains('is-active');
        if (isMenuOpen) return;
        const scrollY = window.scrollY;

        if (scrollY > 150 && isHeaderNavVisible) {
            gsap.to(".header-nav", { opacity: 0, x: 20, duration: 0.5, ease: "power3.inOut", pointerEvents: "none" });
            gsap.to(".hamburger", { x: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" });
            isHeaderNavVisible = false;
        } else if (scrollY <= 150 && !isHeaderNavVisible) {
            gsap.to(".header-nav", { opacity: 1, x: 0, duration: 0.5, ease: "power3.inOut", pointerEvents: "auto" });
            gsap.to(".hamburger", { x: 100, opacity: 0, scale: 0.8, duration: 0.5, ease: "power3.in" });
            isHeaderNavVisible = true;
        }
    });
}

function initContactPopup() {
    const contactBtns = document.querySelectorAll("#header-contact-btn, #menu-contact-btn");
    const contactBoard = document.getElementById("contact-board");
    const hamburger = document.querySelector(".hamburger");

    contactBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (hamburger.classList.contains("is-active")) hamburger.click();
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

async function runPreloadSequence() {
    const wordCan = document.getElementById("word-can"); const evenWrapper = document.getElementById("even-wrapper"); const wordEven = document.getElementById("word-even");
    const hintMsg = document.getElementById("hint-msg"); const leftSlider = document.getElementById("left-slider"); const rightSlider = document.getElementById("right-slider");
    const blocks07 = document.querySelectorAll("#preload .block-07"); const blocksF5 = document.querySelectorAll("#preload .block-f5");
    const leftBlocks = document.querySelectorAll(".left-wrap .block-layer"); const rightBlocks = document.querySelectorAll(".right-wrap .block-layer");

    await delay(1000); wordCan.style.opacity = 1; wordCan.classList.add('clickable');
    await delay(1500); hintMsg.classList.add("pulse"); hintMsg.style.opacity = 1;

    await new Promise(resolve => {
        wordCan.addEventListener("click", () => {
            wordCan.classList.remove('clickable'); hintMsg.style.opacity = 0; hintMsg.classList.remove("pulse");
            resolve();
        }, { once: true });
    });

    blocks07.forEach(block => block.style.transform = 'scaleX(0)'); await delay(500); blocksF5.forEach(block => block.style.transform = 'scaleX(0)');
    await delay(2000); leftSlider.style.transform = `translateY(-50px)`; rightSlider.style.transform = `translateY(-50px)`;
    await delay(2000); leftSlider.style.transform = `translateY(-100px)`; rightSlider.style.transform = `translateY(-100px)`;
    await delay(2000); leftSlider.style.transform = `translateY(-150px)`; rightSlider.style.transform = `translateY(-150px)`;

    await delay(1000); wordEven.style.opacity = 1; gsap.to(evenWrapper, { width: wordEven.scrollWidth, marginLeft: 12, duration: 1, ease: "power2.out" });
    await delay(2000);

    leftBlocks.forEach(b => b.style.transformOrigin = 'right'); rightBlocks.forEach(b => b.style.transformOrigin = 'left');
    blocksF5.forEach(block => block.style.transform = 'scaleX(1)'); await delay(500); blocks07.forEach(block => block.style.transform = 'scaleX(1)');

    await delay(1000);
    const preloadNode = document.getElementById("preload");
    const heroNode = document.getElementById("main-content");
    const rCan = document.querySelectorAll(".giant-text")[0];
    const rEven = document.querySelectorAll(".giant-text")[1];

    heroNode.style.display = "block";
    rCan.style.display = "block"; rEven.style.display = "block";
    gsap.set(rCan, { opacity: 1 }); gsap.set(rEven, { opacity: 1 });

    gsap.to(".header", { y: "0%", duration: 1.5, ease: "power4.out", delay: 0.2 });

    gsap.to(preloadNode, {
        clipPath: "circle(0% at 50% 50%)", duration: 1.5, ease: "power3.inOut",
        onComplete: () => {
            preloadNode.remove();
            initHeaderScrollHiding();
            initMassiveSequence();
            initLocationSection();
        }
    });

    gsap.fromTo(document.getElementById("model-container"), { y: "100vh" }, { y: "0", duration: 1.5, ease: "power3.out" });
}

function init3D() {
    const container = document.getElementById("model-container");
    if (!container) return;
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); camera.position.z = 10;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); renderer.setSize(window.innerWidth, window.innerHeight); container.appendChild(renderer.domElement);
    const geometry = new THREE.IcosahedronGeometry(4.5, 1);
    const material = new THREE.MeshPhysicalMaterial({ color: 0x071E3F, wireframe: true, roughness: 0.1, metalness: 0.5 });
    const model = new THREE.Mesh(geometry, material);
    model.position.y = 0; model.position.x = 5.5; scene.add(model);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5)); const dirLight = new THREE.DirectionalLight(0xffffff, 1); dirLight.position.set(2, 2, 5); scene.add(dirLight);

    let targetRotX = 0; let targetRotY = 0;
    document.addEventListener('mousemove', (event) => { targetRotY = ((event.clientX / window.innerWidth) * 2 - 1) * Math.PI * 0.15; targetRotX = ((event.clientY / window.innerHeight) * 2 - 1) * Math.PI * 0.15; });
    function animate() { requestAnimationFrame(animate); model.rotation.x += (targetRotX - model.rotation.x) * 0.05 + 0.001; model.rotation.y += (targetRotY - model.rotation.y) * 0.05 + 0.002; renderer.render(scene, camera); }
    animate();
}

function initMassiveSequence() {
    const massiveText = document.querySelector('.massive-text');
    if (!massiveText) return;
    function updateFontSizeInPx() { massiveText.style.fontSize = `${window.innerHeight * 0.25}px`; }
    updateFontSizeInPx(); window.addEventListener('resize', updateFontSizeInPx);

    function splitTextIntoWords(selector) {
        document.querySelectorAll(selector).forEach(el => {
            const html = el.innerHTML; const lines = html.split('<br>'); el.innerHTML = '';
            gsap.set(el, { opacity: 1 });
            lines.forEach((line, index) => {
                const words = line.split(' ');
                words.forEach(word => {
                    if (word.trim() !== '') {
                        const span = document.createElement('span'); span.className = 'word-scrub'; span.innerHTML = word;
                        gsap.set(span, { color: "#F5F2F2" });
                        el.appendChild(span); el.appendChild(document.createTextNode(' '));
                    }
                });
                if (index < lines.length - 1) el.appendChild(document.createElement('br'));
            });
        });
    }

    splitTextIntoWords('.intro-heading');
    splitTextIntoWords('.intro-body');

    const tl = gsap.timeline({
        scrollTrigger: { trigger: ".pin-container", start: "top top", end: "+=1500%", scrub: 1, pin: true, pinSpacing: true, invalidateOnRefresh: true }
    });

    tl.to({}, { duration: 150 });
    tl.fromTo(".intro-panel", { y: "15vh" }, { y: "-25vh", duration: 100, ease: "none" }, 0);

    const words = document.querySelectorAll('.word-scrub'); const staggerTime = 40 / words.length;
    tl.to(words, { color: "#071E3F", stagger: staggerTime, duration: 10, ease: "none" }, 0);

    function animatePhoto(selector, startTime) {
        const duration = 25; const halfDur = duration / 2;
        tl.fromTo(selector, { y: '100vh' }, { y: '-80vh', duration: duration, ease: "power1.inOut" }, startTime);
        tl.fromTo(selector, { clipPath: "inset(25% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: halfDur, ease: "power2.out" }, startTime);
        tl.to(selector, { clipPath: "inset(0% 0% 25% 0%)", duration: halfDur, ease: "power2.in" }, startTime + halfDur);
        tl.fromTo(`${selector} img`, { yPercent: 15, scale: 1.3 }, { yPercent: -15, duration: duration, ease: "none" }, startTime);
    }

    animatePhoto('.photo-1', 45); animatePhoto('.photo-2', 52); animatePhoto('.photo-3', 64); animatePhoto('.photo-4', 67); animatePhoto('.photo-5', 78);

    tl.fromTo('.photo-6', { y: '100vh' }, { y: '30vh', duration: 8, ease: "power1.out" }, 86);
    tl.fromTo('.photo-6', { clipPath: "inset(25% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 8, ease: "power2.out" }, 86);
    tl.fromTo('.photo-6 img', { yPercent: 15, scale: 1.3 }, { yPercent: 0, scale: 1, duration: 14, ease: "power2.inOut" }, 86);
    tl.to('.photo-6', { y: '0vh', right: '0%', width: '100vw', height: '100vh', aspectRatio: "auto", clipPath: "inset(0% 0% 0% 0%)", duration: 6, ease: "power2.inOut" }, 94);

    tl.fromTo(massiveText, { x: '100vw' }, { x: () => -(massiveText.scrollWidth), duration: 100, ease: "none" }, 100);
}

function initLocationSection() {
    const barsWrapper = document.querySelector('.bars-wrapper');
    const panels = gsap.utils.toArray('.panel');

    const masterTl = gsap.timeline({
        scrollTrigger: { trigger: document.getElementById("fixed-viewport"), start: "top top", end: "+=300%", pin: true, scrub: 1.5 }
    });

    masterTl.fromTo(".loc-intro-title", { y: "100vh", opacity: 0 }, { y: "0vh", opacity: 1, duration: 2, ease: "power2.out" })
        .to(".loc-intro-title", { y: "-100vh", opacity: 0, duration: 2, ease: "power2.in" }, "+=0.5")
        .fromTo(panels,
            { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)", x: -40, opacity: 0 },
            { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", x: 0, opacity: 1, stagger: 0.2, duration: 2, ease: "power3.out" }
        );

    document.addEventListener('click', (e) => {
        const hasActive = barsWrapper.classList.contains('has-active');
        if (!hasActive) return;
        const clickedInsideActivePanel = e.target.closest('.panel.active');
        const clickedHeader = e.target.closest('.bar-header');
        if (!clickedInsideActivePanel || (clickedHeader && clickedInsideActivePanel)) { closeAllPanels(); }
    });

    panels.forEach((panel) => {
        const header = panel.querySelector('.bar-header');
        header.addEventListener('click', (e) => {
            const hasActive = barsWrapper.classList.contains('has-active');
            if (!hasActive) { e.stopPropagation(); openPanel(panel); }
        });
    });

    function openPanel(targetPanel) {
        if (lenis) lenis.stop();
        barsWrapper.classList.add('has-active');
        panels.forEach((p) => {
            if (p === targetPanel) p.classList.add('active');
            else p.classList.add('disabled');
        });
        setTimeout(() => ScrollTrigger.refresh(), 800);
    }

    function closeAllPanels() {
        if (lenis) lenis.start();
        barsWrapper.classList.remove('has-active');
        panels.forEach((p) => {
            p.classList.remove('active', 'disabled');
            const scroller = p.querySelector('.scroll-area');
            if (scroller) scroller.scrollTo(0, 0);
        });
        setTimeout(() => ScrollTrigger.refresh(), 800);
    }

    panels.forEach((panel) => {
        const scroller = panel.querySelector('.scroll-area');
        const stickySection = panel.querySelector('.sticky-section');
        const cropPhotos = panel.querySelectorAll('.crop-photo');
        if (!scroller || !stickySection) return;

        const tl = gsap.timeline({
            scrollTrigger: { trigger: stickySection, scroller: scroller, start: "top top", end: "bottom bottom", scrub: 0.5 }
        });
        cropPhotos.forEach((photo) => {
            tl.to(photo, { clipPath: "inset(0 0 100% 0)", ease: "none" });
        });
    });
}

// =========================================
// GALLERY PAGE SCRIPT
// =========================================
function initGalleryGrid() {
    const collections = [
        { id: 'hcmc', name: 'Ho Chi Minh city', startSeed: 101, empty: false },
        { id: 'vungtau', name: 'Vung Tau', startSeed: 0, empty: true },
        { id: 'dalat', name: 'Da Lat', startSeed: 201, empty: false },
        { id: 'vinhhy', name: 'Vinh Hy', startSeed: 301, empty: false },
        { id: 'northeast', name: 'Northeast Vietnam', startSeed: 401, empty: false },
        { id: 'pattaya', name: 'Pattaya', startSeed: 501, empty: false },
        { id: 'bangkok', name: 'Bangkok', startSeed: 601, empty: false }
    ];

    let currentMode = 'menu'; let activeIndex = 0;
    const instructionBoard = document.getElementById('instructionBoard');
    const boardIcon = document.getElementById('boardIcon');
    const boardText = document.getElementById('boardText');
    let boardOpen = false;

    gsap.set(instructionBoard, { width: 50, height: 50, borderRadius: 25 });
    instructionBoard.addEventListener('click', () => {
        boardOpen = !boardOpen;
        if (boardOpen) {
            gsap.to(boardIcon, { opacity: 0, duration: 0.2 });
            gsap.to(instructionBoard, { width: 340, height: 260, borderRadius: 12, duration: 0.6, ease: "expo.out" });
            gsap.to(boardText, { autoAlpha: 1, duration: 0.4, delay: 0.2 });
        } else {
            gsap.to(boardText, { autoAlpha: 0, duration: 0.2 });
            gsap.to(instructionBoard, { width: 50, height: 50, borderRadius: 25, duration: 0.6, ease: "expo.inOut" });
            gsap.to(boardIcon, { opacity: 1, duration: 0.3, delay: 0.4 });
        }
    });

    const menuStack = document.getElementById('menuStack');
    const menuCollectionName = document.getElementById('menuCollectionName');
    let menuScroll = 0; let menuTarget = 0; const totalCards = collections.length;

    collections.forEach((col) => {
        let card = document.createElement('div'); card.className = 'menu-card';
        if (!col.empty) {
            let img = document.createElement('img');
            img.src = `https://picsum.photos/seed/${col.startSeed + 8}/600/800`;
            card.appendChild(img);
        } else {
            let emptyDiv = document.createElement('div'); emptyDiv.className = 'empty-block'; card.appendChild(emptyDiv);
        }
        menuStack.appendChild(card); col.cardEl = card;
    });

    function renderMenu() {
        menuScroll += (menuTarget - menuScroll) * 0.05;
        collections.forEach((col, i) => {
            let diff = i - menuScroll;
            diff = diff % totalCards;
            if (diff > totalCards / 2) diff -= totalCards;
            if (diff < -totalCards / 2) diff += totalCards;
            let x = diff * 140; let y = -diff * 60;
            let isCenter = Math.abs(diff) < 0.6;
            let emphasizeY = 0;
            if (isCenter) {
                let progress = 1 - (Math.abs(diff) * 1.6);
                emphasizeY = -Math.max(0, progress) * 80;
            }
            gsap.set(col.cardEl, {
                x: x, y: y + emphasizeY, z: -Math.abs(diff) * 120,
                skewX: -15, skewY: 8, scale: 1 - Math.abs(diff) * 0.05,
                opacity: 1 - Math.abs(diff) * 0.3, zIndex: Math.round(100 - Math.abs(diff) * 10)
            });
        });
        let wrappedScroll = menuScroll % totalCards;
        if (wrappedScroll < 0) wrappedScroll += totalCards;
        let newActiveIndex = Math.round(wrappedScroll) % totalCards;
        if (newActiveIndex !== activeIndex) {
            activeIndex = newActiveIndex;
            menuCollectionName.innerText = collections[activeIndex].name;
        }
    }

    const grid = document.getElementById('grid');
    const galleryCenterTitle = document.getElementById('galleryCenterTitle');
    const galleryComingSoon = document.getElementById('galleryComingSoon');
    let gridItems = []; const itemWidth = Math.max(window.innerWidth / 5, 260);
    const cols = 7; const rows = 8; const totalWidth = itemWidth * cols;
    const colSpeeds = [1, 1.25, 0.85, 1.15, 0.9, 1.3, 1.05];

    let gridScroll = { x: 0, y: 0 }; let gridTarget = { x: 0, y: 0 };
    let isDragging = false; let startPos = { x: 0, y: 0 };

    function buildGallery(collection) {
        grid.innerHTML = ''; gridItems = []; gridScroll = { x: 0, y: 0 }; gridTarget = { x: 0, y: 0 };
        galleryCenterTitle.innerText = collection.name;
        galleryComingSoon.style.display = collection.empty ? 'block' : 'none';

        for (let i = 0; i < cols; i++) {
            let currentY = 0; let columnItems = [];
            for (let j = 0; j < rows; j++) {
                let randomHeight = itemWidth * gsap.utils.random(0.7, 1.5);
                let el = document.createElement('div'); el.className = 'grid-item';
                el.style.width = `${itemWidth}px`; el.style.height = `${randomHeight}px`;

                let innerEl;
                if (collection.empty) {
                    innerEl = document.createElement('div'); innerEl.className = 'empty-block';
                } else {
                    innerEl = document.createElement('img');
                    let photoId = collection.startSeed + (i * rows + j);
                    innerEl.src = `https://picsum.photos/seed/${photoId}/800/1000`;
                    el.addEventListener('click', () => { if (currentMode === 'gallery') openDetail(innerEl.src, `Vol. ${photoId}`); });
                }
                el.appendChild(innerEl); grid.appendChild(el);
                columnItems.push({ el, y: currentY, h: randomHeight });
                currentY += randomHeight;
            }
            let colTotalHeight = currentY;
            columnItems.forEach(item => { gridItems.push({ el: item.el, col: i, x: i * itemWidth, y: item.y, h: item.h, wrapHeight: colTotalHeight }); });
        }
    }

    function renderGallery() {
        gridScroll.x += (gridTarget.x - gridScroll.x) * 0.06; gridScroll.y += (gridTarget.y - gridScroll.y) * 0.06;
        gridItems.forEach(item => {
            let currentX = item.x + gridScroll.x; let currentY = item.y + (gridScroll.y * colSpeeds[item.col]);
            let wrapX = gsap.utils.wrap(-itemWidth, totalWidth - itemWidth, currentX);
            let wrapY = gsap.utils.wrap(-item.h, item.wrapHeight - item.h, currentY);
            gsap.set(item.el, { x: wrapX, y: wrapY });
        });
    }

    window.addEventListener('wheel', (e) => {
        if (currentMode === 'menu') menuTarget += Math.sign(e.deltaY) * 0.4;
        else if (currentMode === 'gallery') { gridTarget.y -= e.deltaY * 1.5; gridTarget.x -= e.deltaX * 1.5; }
    });
    window.addEventListener('mousedown', (e) => {
        if (currentMode === 'gallery' && e.button === 1) {
            e.preventDefault(); isDragging = true; startPos.x = e.clientX; startPos.y = e.clientY; document.body.style.cursor = 'grabbing';
        }
    });
    window.addEventListener('mousemove', (e) => {
        if (isDragging && currentMode === 'gallery') {
            let dx = e.clientX - startPos.x; let dy = e.clientY - startPos.y;
            gridTarget.x += dx * 1.8; gridTarget.y += dy * 1.8;
            startPos.x = e.clientX; startPos.y = e.clientY;
        }
    });
    window.addEventListener('mouseup', (e) => {
        if (e.button === 1) { isDragging = false; document.body.style.cursor = 'default'; }
    });
    document.addEventListener('keydown', (e) => {
        if (document.body.dataset.page !== 'gallery') return;
        if (e.key === 'Enter' && currentMode === 'menu') {
            const selectedCol = collections[activeIndex]; buildGallery(selectedCol);
            gsap.to('#menuView', { autoAlpha: 0, duration: 0.6 });
            gsap.to('#galleryView', { autoAlpha: 1, duration: 0.8, delay: 0.2 }); currentMode = 'gallery';
        }
        if (e.key === 'Escape') {
            if (currentMode === 'gallery') document.getElementById('backBtn').click();
            else if (currentMode === 'detail') closeDetail();
        }
    });
    document.getElementById('backBtn').addEventListener('click', () => {
        if (currentMode === 'gallery') {
            // Drop URL param when exiting back to menu so it's clean
            window.history.pushState({}, '', 'gallery.html');
            gsap.to('#galleryView', { autoAlpha: 0, duration: 0.5 });
            gsap.to('#menuView', { autoAlpha: 1, duration: 0.6, delay: 0.2 }); currentMode = 'menu';
        }
    });

    // Check URL parameters to Auto-Open specific collection from Content pages!
    const urlParams = new URLSearchParams(window.location.search);
    const collectionParam = urlParams.get('collection');
    if (collectionParam) {
        const foundIndex = collections.findIndex(c => c.id === collectionParam);
        if (foundIndex > -1) {
            activeIndex = foundIndex;
            menuTarget = foundIndex;
            menuScroll = foundIndex;
            setTimeout(() => {
                buildGallery(collections[activeIndex]);
                gsap.to('#menuView', { autoAlpha: 0, duration: 0 });
                gsap.to('#galleryView', { autoAlpha: 1, duration: 0.8 });
                currentMode = 'gallery';
            }, 100);
        }
    }

    function tick() {
        if (currentMode === 'menu') renderMenu();
        else if (currentMode === 'gallery') renderGallery();
        if (document.body.dataset.page === "gallery") requestAnimationFrame(tick);
    }
    tick();

    const detailView = document.getElementById('detailView'); const detailImg = document.getElementById('detailImg');
    const detailTitle = document.getElementById('detailTitle'); const lines = document.querySelectorAll('.line-wrapper');

    function openDetail(src, title) {
        currentMode = 'detail'; detailImg.src = src; detailTitle.innerText = title;
        detailView.classList.add('active'); grid.classList.add('blurred');
        galleryCenterTitle.classList.add('blurred'); galleryComingSoon.classList.add('blurred');

        let tl = gsap.timeline();
        tl.to(detailView, { opacity: 1, duration: 0.4, ease: "power2.out" }).to(detailImg, { opacity: 1, scale: 1, duration: 0.8, ease: "expo.out" }, "-=0.2");
        lines.forEach((line, index) => {
            let block = line.querySelector('.block-reveal'); let content = line.querySelector('.content'); let delayTime = index * 0.15;
            tl.to(block, { scaleX: 1, transformOrigin: 'left', duration: 0.4, ease: 'expo.inOut' }, delayTime)
                .set(content, { opacity: 1 }, delayTime + 0.4)
                .to(block, { scaleX: 0, transformOrigin: 'right', duration: 0.4, ease: 'expo.inOut' }, delayTime + 0.4);
        });
    }

    function closeDetail() {
        let tl = gsap.timeline({
            onComplete: () => {
                detailView.classList.remove('active'); grid.classList.remove('blurred');
                galleryCenterTitle.classList.remove('blurred'); galleryComingSoon.classList.remove('blurred');
                gsap.set('.content', { opacity: 0 }); gsap.set('.block-reveal', { scaleX: 0 });
                gsap.set(detailImg, { opacity: 0, scale: 0.9 }); currentMode = 'gallery';
            }
        });
        tl.to(detailView, { opacity: 0, duration: 0.5, ease: "power2.inOut" });
    }

    detailView.addEventListener('click', (e) => {
        if (e.target === detailView || e.target.classList.contains('detail-left') || e.target.classList.contains('detail-right')) closeDetail();
    });
}

// =========================================
// ABOUT PAGE SCRIPT
// =========================================
function initAboutPage() {
    const btnProjects = document.querySelector('.btn-projects'); const modal = document.querySelector('.modal'); const modalOverlay = document.querySelector('.modal-overlay');
    const cursorThumb = document.querySelector('.cursor-thumbnail'); const cursorThumbImg = cursorThumb.querySelector('img'); const projectItems = document.querySelectorAll('.project-item');

    btnProjects.addEventListener('click', () => {
        gsap.to(modal, { autoAlpha: 1, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo('.project-item', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.1 });
    });
    modalOverlay.addEventListener('click', () => { gsap.to(modal, { autoAlpha: 0, duration: 0.5, ease: 'power2.in' }); });

    gsap.set(cursorThumb, { xPercent: -50, yPercent: -50 });
    modal.addEventListener('mousemove', (e) => { gsap.to(cursorThumb, { x: e.clientX, y: e.clientY, duration: 0.5, ease: 'power3.out' }); });

    projectItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursorThumbImg.src = item.getAttribute('data-img');
            gsap.to(cursorThumb, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' });
        });
        item.addEventListener('mouseleave', () => { gsap.to(cursorThumb, { autoAlpha: 0, scale: 0.85, duration: 0.3 }); });
    });

    function splitTextToWords(selector) {
        document.querySelectorAll(selector).forEach(el => {
            const text = el.innerText; const words = text.split(' '); el.innerHTML = '';
            words.forEach(word => {
                const span = document.createElement('span'); span.className = 'word'; span.innerText = word + ' '; el.appendChild(span);
            });
        });
    }
    splitTextToWords('.scroll-p');
    gsap.set('.word', { opacity: 0, y: 25, rotateX: 60, filter: 'blur(8px)' });

    const masterTl = gsap.timeline({ paused: true });
    const staggerTime = 0.015; const phaseDur = 1.6; const slideDur = phaseDur * 2.5;

    function createPhase(phaseNum, label, delayTime, yMove) {
        masterTl.addLabel(label, delayTime)
            .to(`.p${phaseNum} .word`, { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', stagger: staggerTime, duration: phaseDur, ease: "power3.out" }, label)
            .to('.photo-track', { y: yMove, duration: slideDur, ease: "none" }, label)
            .to(`.p${phaseNum} .word`, { opacity: 0, y: -25, rotateX: -60, filter: 'blur(8px)', stagger: staggerTime, duration: phaseDur, ease: "power3.in" }, `${label}+=${phaseDur * 1.5}`);
    }

    createPhase(1, 'phase1', 0, '-25%'); createPhase(2, 'phase2', phaseDur * 3, '-50%'); createPhase(3, 'phase3', phaseDur * 6, '-75%');
    masterTl.to({}, { duration: 0.5 });

    let scrollY = 0; let targetScrollY = 0; const cycleHeight = 5500;

    // Intelligently auto-scroll target at load so first text block reveals naturally
    gsap.to({}, { duration: 1.5, onUpdate: function () { targetScrollY = this.progress() * 300; } });

    window.addEventListener('wheel', (e) => { targetScrollY += e.deltaY; });
    let touchStart = 0;
    window.addEventListener('touchstart', (e) => { touchStart = e.touches[0].clientY; });
    window.addEventListener('touchmove', (e) => { targetScrollY += (touchStart - e.touches[0].clientY) * 2; touchStart = e.touches[0].clientY; });

    function render() {
        scrollY += (targetScrollY - scrollY) * 0.04;
        let progress = (scrollY % cycleHeight) / cycleHeight;
        if (progress < 0) progress += 1;
        masterTl.progress(progress);
        if (document.body.dataset.page === "about") requestAnimationFrame(render);
    }
    render();
}