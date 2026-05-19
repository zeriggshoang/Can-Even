if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

let lenis;

document.addEventListener("DOMContentLoaded", async () => {
    // FIX: Prevent browser from remembering scroll position and ruining the header/hamburger animation!
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Always force the page to start at the top on load unless there is a specific #hash anchor
    if (!window.location.hash) {
        window.scrollTo(0, 0);
    }

    const page = document.body.dataset.page;
    const urlParams = new URLSearchParams(window.location.search);
    const skipPreload = urlParams.get('skip');

    if (document.querySelector(".hamburger")) {
        initNewMenuSystem();
    }

    initContactPopup();
    initLogoNavigation();

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

            if (window.location.hash === "#location-anchor") {
                setTimeout(() => {
                    if (lenis) lenis.scrollTo('#location-anchor', { immediate: true });
                }, 100);
            }
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
        if (hamburger && hamburger.classList.contains("is-active")) { hamburger.click(); }

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
        const hamburger = document.querySelector('.hamburger');
        const isMenuOpen = hamburger && hamburger.classList.contains('is-active');
        if (isMenuOpen) return;
        const scrollY = window.scrollY;

        if (scrollY > 150 && isHeaderNavVisible) {
            gsap.to(".header-nav", { opacity: 0, x: 20, duration: 0.5, ease: "power3.inOut", pointerEvents: "none" });
            if (hamburger) gsap.to(".hamburger", { x: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" });
            isHeaderNavVisible = false;
        } else if (scrollY <= 150 && !isHeaderNavVisible) {
            gsap.to(".header-nav", { opacity: 1, x: 0, duration: 0.5, ease: "power3.inOut", pointerEvents: "auto" });
            if (hamburger) gsap.to(".hamburger", { x: 100, opacity: 0, scale: 0.8, duration: 0.5, ease: "power3.in" });
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
            if (hamburger && hamburger.classList.contains("is-active")) hamburger.click();
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

    blocks07.forEach(block => block.style.transform = 'scaleX(0)');
    await delay(500);
    blocksF5.forEach(block => block.style.transform = 'scaleX(0)');

    await delay(2000); leftSlider.style.transform = `translateY(-5vw)`; rightSlider.style.transform = `translateY(-5vw)`;
    await delay(2000); leftSlider.style.transform = `translateY(-10vw)`; rightSlider.style.transform = `translateY(-10vw)`;
    await delay(2000); leftSlider.style.transform = `translateY(-15vw)`; rightSlider.style.transform = `translateY(-15vw)`;

    await delay(1000); wordEven.style.opacity = 1; gsap.to(evenWrapper, { width: wordEven.scrollWidth, marginLeft: "1vw", duration: 1, ease: "power2.out" });
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
// GALLERY PAGE SCRIPT & CENTRALIZED DATA
// =========================================
const galleryData = {
    hcmc: {
        name: "Ho Chi Minh city",
        cover: "photo collections/ho chi minh/IMG_0240.jpg",
        photos: [
            { src: "photo collections/ho chi minh/IMG_0064.jpg", title: "Saigon After Dark - 1", desc: "This is my photo I took when I was walking aroung the apartment to practice. The apartment lights glow against the darkness of the night, creating a luminous atmosphere that quietly fills the surrounding cityscape." },
            { src: "photo collections/ho chi minh/IMG_0145.jpg", title: "Saigon After Dark - 2", desc: "My first long-exposure photograph captures the vibrant atmosphere of Bến Thành Market, with passing vehicles creating dynamic light trails through the energy of the city at night." },
            { src: "photo collections/ho chi minh/IMG_0146.jpg", title: "Saigon After Dark - 3", desc: "The rhythm of vehicles crossing in multiple directions created a dynamic visual through my lens, capturing the vibrant movement of the city in a single moment." },
            { src: "photo collections/ho chi minh/IMG_0150.jpg", title: "Saigon After Dark - 4", desc: "The vibrant vehicle lights, glowing storefronts, pedestrians, and street vendors crossing paths together made the street feel crowded, lively, and full of energy." },
            { src: "photo collections/ho chi minh/IMG_0155.jpg", title: "Saigon After Dark - 5", desc: "The long road ahead evokes a nostalgic feeling through the presence of old-school branded stores lining the street." },
            { src: "photo collections/ho chi minh/IMG_0181.jpg", title: "Saigon After Dark - 6", desc: "The glowing red neon of “Chợ Bến Thành” and the classic clock face reflected perfectly on the rain puddle, creating one of the most stunning moments I captured through my lens." },
            { src: "photo collections/ho chi minh/IMG_0255.jpg", title: "Saigon After Dark - 7", desc: "A group of youths enjoying street food together added to the harmonious and bustling atmosphere of the lively street scene." },
            { src: "photo collections/ho chi minh/IMG_0278.jpg", title: "Saigon After Dark - 8", desc: "Illuminated digital billboards and warm interior lights highlight a row of luxury high-end boutique storefronts along a dark street." },
            { src: "photo collections/ho chi minh/IMG_9975.jpg", title: "Saigon After Dark - 9", desc: "Silhouettes of people gather on steps at night in front of the illuminated Ho Chi Minh statue and the grand City Hall." },
            { src: "photo collections/ho chi minh/IMG_0105.jpg", title: "Saigon After Dark - 10", desc: "This is Bitexco, one of Vietnam’s iconic skyscrapers, whose towering architecture made me realize how small I felt standing beneath it." },
            { src: "photo collections/ho chi minh/IMG_0154.jpg", title: "Saigon After Dark - 11", desc: "This is another gate of Bến Thành Market, less crowded than the main entrance, yet still captivating through my camera lens." },
            { src: "photo collections/ho chi minh/IMG_0194.jpg", title: "Saigon After Dark - 12", desc: "Lowering my camera toward the ground allowed me to capture the expansive view stretching along the road beside the western side of Bến Thành Market." },
            { src: "photo collections/ho chi minh/IMG_0245.jpg", title: "Saigon After Dark - 13", desc: "This spontaneous shot captures the towering plaza and luxury-brand buildings glowing beautifully beneath the city lights, creating a glamorous urban atmosphere." },
            { src: "photo collections/ho chi minh/IMG_9937.jpg", title: "Saigon After Dark - 14", desc: "Fairy lights wrapped around street trees illuminate a lively strip of local restaurants and parked cars along a dark road." },
            { src: "photo collections/ho chi minh/IMG_9965.jpg", title: "Saigon After Dark - 15", desc: "A cluster of motorbikes is parked in the dark outside a closed tailor shop whose metal shutter is marked with graffiti." },
            { src: "photo collections/ho chi minh/IMG_0270.jpg", title: "Saigon After Dark - 16", desc: "Pedestrians stroll past the brightly lit display windows and glowing red signage of a Uniqlo store at night." },
            { src: "photo collections/ho chi minh/IMG_9957.jpg", title: "Saigon After Dark - 17", desc: "Two silhouetted figures walk down a dimly lit urban sidewalk alongside parked cars, with a towering illuminated skyscraper in the distance." },
            { src: "photo collections/ho chi minh/IMG_0176.jpg", title: "Saigon After Dark - 18", desc: "Walking toward the side gate of Bến Thành Market, I captured the bustling crowds and vibrant atmosphere surrounding the market stalls." },
            { src: "photo collections/ho chi minh/IMG_0175.jpg", title: "Saigon After Dark - 19", desc: "This skyscraper features a striking LED animation flowing from the top of the tower down to the base of the building, adding a dynamic glow to the city skyline." },
            { src: "photo collections/ho chi minh/IMG_9955.jpg", title: "Saigon After Dark - 20", desc: "A bustling multi-story building is packed with a vibrant array of neon-lit cafes, boutiques, and a bookstore on the ground floor." },
            { src: "photo collections/ho chi minh/IMG_9944.jpg", title: "Saigon After Dark - 21", desc: "Vibrant, glowing restaurant facades stand in stark contrast to the modern, blue-lit skyscraper looming in the background." },
            { src: "photo collections/ho chi minh/IMG_9964.jpg", title: "Saigon After Dark - 22", desc: "The warm, inviting neon sign of Ciao Café reflects beautifully on the wet pavement of a quiet city street." },
            { src: "photo collections/ho chi minh/IMG_9982.jpg", title: "Saigon After Dark - 23", desc: "Warm geometric light fixtures illuminate the sleek exterior and window displays of a Cartier boutique along an empty nighttime sidewalk." },
            { src: "photo collections/ho chi minh/IMG_0293.jpg", title: "Saigon After Dark - 24", desc: "The ornate French colonial architecture of the Ho Chi Minh City Hall glows warmly against the night sky under streetlights." },
            { src: "photo collections/ho chi minh/IMG_0281.jpg", title: "Saigon After Dark - 25", desc: "The glowing, elegant entrance of the Union Square shopping center." },
            { src: "photo collections/ho chi minh/IMG_0186.jpg", title: "Saigon After Dark - 26", desc: "The crossroads appeared unusually quiet during rush hour, and I quickly captured the spontaneous moment of a single person crossing the street lines." },
            { src: "photo collections/ho chi minh/IMG_0208.jpg", title: "Saigon After Dark - 27", desc: "The older generation sat together with beers and everyday conversations, creating a classic and nostalgic atmosphere that reminded me of my childhood days in kindergarten." },
            { src: "photo collections/ho chi minh/IMG_9990.jpg", title: "Saigon After Dark - 28", desc: "Bright the national red flags hang from the stone pillars of a building, illuminated by warm wall lamps above parked vehicles." },
            { src: "photo collections/ho chi minh/IMG_0240.jpg", title: "Saigon After Dark - 29", desc: "To me, this moment felt astonishing, vehicles rushing past at high speed while two people quietly waited for their turn to cross the street." }
        ]
    },
    vungtau: {
        name: "Vung Tau",
        cover: "",
        empty: true,
        photos: [] /* Empty array triggers the Gallery's "Coming Soon" screen automatically! */
    },
    dalat: {
        name: "Da Lat",
        cover: "photo collections/dalat/dalat-16.jpg",
        photos: [
            { src: "photo collections/dalat/dalat-7.jpg", title: "Da Lat", desc: "The parked car along the sidewalk, surrounded by wide negative space and a quiet atmosphere, instantly caught my attention and inspired me to capture the moment." },
            { src: "photo collections/dalat/dalat-18.jpg", title: "Da Lat", desc: "The center of Đà Lạt feels vast and lively, with vehicles constantly moving through alleyways and narrow streets while market stalls stretch along the pavements." },
            { src: "photo collections/dalat/dalat-20.jpg", title: "Da Lat", desc: "This spontaneous capture reflects the everyday scenery of a delivery worker and the daily activities unfolding around the city." },
            { src: "photo collections/dalat/dalat-22.jpg", title: "Da Lat", desc: "Crowds sitting together and people walking up and down the long staircase create the casual and classic atmosphere of Đà Lạt’s city center." },
            { src: "photo collections/dalat/IMG_4605.jpg", title: "Da Lat", desc: "While walking toward a bakery on the street, the dynamic movement of everything around me inspired me to capture the moment in a photograph." },
            { src: "photo collections/dalat/IMG_4622.jpg", title: "Da Lat", desc: "Those sponge cakes looked amazing, glowing softly beneath a single tiny light." },
            { src: "photo collections/dalat/IMG_4695.jpg", title: "Da Lat", desc: "The flower field surrounding the café beautifully decorated the entrance, appearing even more vibrant and visually striking through the close-up view on my camera screen." },
            { src: "photo collections/dalat/dalat-2.jpg", title: "Da Lat", desc: "This was my first test shot after arriving in Đà Lạt for the day, and its vibrant, familiar atmosphere reminded me of my hometown city." },
            { src: "photo collections/dalat/dalat-14.jpg", title: "Da Lat", desc: "From the head of the bridge, the leading lines of the road make people appear smaller as they move toward the bridge’s distant end." },
            { src: "photo collections/dalat/dalat-3.jpg", title: "Da Lat", desc: "The alleyway appeared narrow and curved through my perspective." },
            { src: "photo collections/dalat/dalat-15.jpg", title: "Da Lat", desc: "Standing among the bustling crowds at the center of Đà Lạt Square, I felt time slow down through the gentle rhythm of people walking around me." },
            { src: "photo collections/dalat/IMG_4653.jpg", title: "Da Lat", desc: "This spontaneous photo was taken on my way to a ramen restaurant, and the sunset behind the houses created a surprisingly beautiful and calming scene." },
            { src: "photo collections/dalat/dalat-1.jpg", title: "Da Lat", desc: "Standing on the hotel’s upper floor, I could overlook the sky and surrounding houses and hotels, where the colorful rooftops and walls created a vibrant urban scenery." },
            { src: "photo collections/dalat/IMG_4528.jpg", title: "Da Lat", desc: "The smiles on their faces while working reflected a simple and genuine happiness in everyday life." },
            { src: "photo collections/dalat/dalat-5.jpg", title: "Da Lat", desc: "The alleyway was uniquely built along an uphill road, offering a clear view of the buildings and streets while strolling through the area." },
            { src: "photo collections/dalat/dalat-11.jpg", title: "Da Lat", desc: "Lowering my camera allowed me to capture the small figure walking downhill beside the towering building, emphasizing the contrast in scale." },
            { src: "photo collections/dalat/IMG_4518.jpg", title: "Da Lat", desc: "The delivery worker moved through the city in sync with the fast rhythm of time, busy with the flow of everyday shipments." },
            { src: "photo collections/dalat/dalat-4.jpg", title: "Da Lat", desc: "The peach blossoms bloomed with soft pink petals in Đà Lạt, appearing even brighter beneath the clear sky through the close-up frame." },
            { src: "photo collections/dalat/dalat-12.jpg", title: "Da Lat", desc: "A vibrant, close-up view captures a dense cluster of bright red flowers blooming profusely against a background of vivid green foliage." },
            { src: "photo collections/dalat/IMG_4693.jpg", title: "Da Lat", desc: "The leftover milk tea after a relaxing moment at the hilltop café became a simple capture of the quiet atmosphere and lingering experience." },
            { src: "photo collections/dalat/IMG_4699.jpg", title: "Da Lat", desc: "Warm lantern lights surrounding Tophill Café, creating a cozy and peaceful nighttime atmosphere." },
            { src: "photo collections/dalat/IMG_4556.jpg", title: "Da Lat", desc: "This spontaneous close-up shot from above reveals the lively atmosphere inside the market, capturing a bright and dynamic scene that reflects the familiar rhythm of everyday human life." },
            { src: "photo collections/dalat/dalat-19.jpg", title: "Da Lat", desc: "This photo captures a massive old building standing still while the people passing by blur into constant motion around it." },
            { src: "photo collections/dalat/dalat-10.jpg", title: "Da Lat", desc: "Amid the continuous rhythm of life, moments of silence on the hill, free from vehicles and surrounding noise, felt rare and peaceful." },
            { src: "photo collections/dalat/dalat-6.jpg", title: "Da Lat", desc: "Moving closer revealed more details hidden within the shadows of the vibrant buildings." },
            { src: "photo collections/dalat/dalat-21.jpg", title: "Da Lat", desc: "Lowering down the exposure of the sky to see the patterns among the high buildings surrounded the market." },
            { src: "photo collections/dalat/dalat-13.jpg", title: "Da Lat", desc: "Capturing a hidden corner of the road created a fresh and creative angle for me while strolling through the tiny road." },
            { src: "photo collections/dalat/dalat-16.jpg", title: "Da Lat", desc: "This realistic view of the large Đà Lạt Market beside the square captured a moment I had always hoped to experience and photograph." }
        ]
    },
    vinhhy: {
        name: "Vinh Hy",
        cover: "photo collections/vinh hy/IMG_4744.jpg",
        photos: [
            { src: "photo collections/vinh hy/IMG_4757.jpg", title: "Vinh Hy", desc: "This solitary island stood quietly within the vast beach landscape as I captured it from a canoe on the way to the bay, appearing even more enormous through the distant zoom of my lens." },
            { src: "photo collections/vinh hy/IMG_4777.jpg", title: "Vinh Hy", desc: "Observing the rugged cliffs shaped by relentless waves." },
            { src: "photo collections/vinh hy/IMG_4821.jpg", title: "Vinh Hy", desc: "The crowd on the beach island enjoyed their time together, sharing joy and excitement beneath the open seaside atmosphere." },
            { src: "photo collections/vinh hy/IMG_4854.jpg", title: "Vinh Hy", desc: "The boats and canoes floated gently on the waves of the crystal-blue ocean." },
            { src: "photo collections/vinh hy/IMG_4875.jpg", title: "Vinh Hy", desc: "Approaching the grounded symmetry of sacred spaces shifted my perspective from seeking external validation to cultivating a deeply rooted inner peace." },
            { src: "photo collections/vinh hy/IMG_4914.jpg", title: "Vinh Hy", desc: "Capturing upward revealed the immense scale of the temple’s architecture." },
            { src: "photo collections/vinh hy/IMG_4937.jpg", title: "Vinh Hy", desc: "The large boat set sail on its long ocean journey, courageously moving through the powerful waves with the mountains rising in the background." },
            { src: "photo collections/vinh hy/IMG_4955.jpg", title: "Vinh Hy", desc: "Enjoying time at the beach became a perfect way for them to relax, share stories, and grow closer together." },
            { src: "photo collections/vinh hy/IMG_4958.jpg", title: "Vinh Hy", desc: "Zooming out revealed tiny boats floating quietly on the calm waves as fishermen continued their work in the distance." },
            { src: "photo collections/vinh hy/IMG_4974.jpg", title: "Vinh Hy", desc: "While heading back to the hotel, I saw a farmer tending a vibrant green field. I captured the solitary moment of their daily work, reflecting the quiet dedication behind everyday survival." },
            { src: "photo collections/vinh hy/IMG_4758.jpg", title: "Vinh Hy", desc: "I am drawn to solitary subjects in vast spaces, like a steadfast red buoy bobbing in unpredictable waters, and this perspective has shaped my evolving vision in photography." },
            { src: "photo collections/vinh hy/IMG_4926.jpg", title: "Vinh Hy", desc: "They immersed themselves in the crystal-blue ocean, finding a refreshing escape from long days of work and embracing the calm of a well-earned vacation." },
            { src: "photo collections/vinh hy/IMG_4850.jpg", title: "Vinh Hy", desc: "A striking scene unfolds as a mountain rises steeply behind a solitary boat drifting across the vast ocean." },
            { src: "photo collections/vinh hy/IMG_4847.jpg", title: "Vinh Hy", desc: "The boat was left stranded on the sand, resting after enduring a long battle with the relentless, aggressive waves." },
            { src: "photo collections/vinh hy/IMG_4921.jpg", title: "Vinh Hy", desc: "A single blooming flower sways in the wind, standing apart in an endless garden, its vibrant colors glowing softly under the golden sunset." },
            { src: "photo collections/vinh hy/IMG_4704.jpg", title: "Vinh Hy", desc: "This is my first photo upon arriving in Vinh Hy for a vacation, capturing vibrant blossoms stretching toward the sky." },
            { src: "photo collections/vinh hy/IMG_4722.jpg", title: "Vinh Hy", desc: "Look at them standing like a group of heroes, ready for a long journey across the ocean in search of their life’s treasure." },
            { src: "photo collections/vinh hy/IMG_4949.jpg", title: "Vinh Hy", desc: "This photo made me think of certain beaches in the US with similar scenery. It felt like a coincidence that connects different places through a shared atmosphere." },
            { src: "photo collections/vinh hy/IMG_4882.jpg", title: "Vinh Hy", desc: "This is a vision of traditional temple architecture, where a massive bell stands as a timeless symbol of history and spirit, even if I have forgotten the temple’s name." },
            { src: "photo collections/vinh hy/IMG_4727.jpg", title: "Vinh Hy", desc: "These photos capture the entrance gate before I boarded the boat to the bay, where the boats seemed to have waited silently for a long time." },
            { src: "photo collections/vinh hy/IMG_4770.jpg", title: "Vinh Hy", desc: "Facing sheer, unyielding cliffs rising from the sea, I discovered a quiet reverence for the towering obstacles that compel me to continually reach for higher ground." },
            { src: "photo collections/vinh hy/IMG_4825.jpg", title: "Vinh Hy", desc: "The people kayaking look much smaller compared to the cliffs formed where the rocks meet the tide." },
            { src: "photo collections/vinh hy/IMG_4805.jpg", title: "Vinh Hy", desc: "Within the wild hillside, serene spaces are carved in harmony, where scattered houses rest and form a quiet, beautiful pattern." },
            { src: "photo collections/vinh hy/IMG_4886.jpg", title: "Vinh Hy", desc: "Looking up at the ascending courtyards of the mountain temple, my perspective elevated, revealing that emotional maturity is a lifelong pilgrimage of climbing higher." },
            { src: "photo collections/vinh hy/IMG_4973.jpg", title: "Vinh Hy", desc: "This image captures manual laborers working tirelessly to sustain their lives, while a farmer in the green fields is gently emphasized by the vast emptiness of the surrounding space." },
            { src: "photo collections/vinh hy/IMG_4744.jpg", title: "Vinh Hy", desc: "Looking back at the peaceful intersection of human architecture and untamed nature." }
        ]
    },
    northeast: {
        name: "Northeast Vietnam",
        cover: "photo collections/ha giang/IMG_7560.jpg",
        photos: [
            { src: "photo collections/ha giang/IMG_7023.jpg", title: "Northeast", desc: "The way the light caught the rich textures of these wooden carvings was just too perfect not to capture." },
            { src: "photo collections/ha giang/IMG_7054.jpg", title: "Northeast", desc: "I loved how the incense smoke swirled up like a beautiful, chaotic dance.Iit looked so magical on camera." },
            { src: "photo collections/ha giang/IMG_7292.jpg", title: "Northeast", desc: "This little village tucked into the lush hills looked straight out of a fairytale, so I just had to snap a picture." },
            { src: "photo collections/ha giang/IMG_7610.jpg", title: "Northeast", desc: "The vibrant pops of pink and blue on their traditional headscarves made this bustling market scene visually irresistible." },
            { src: "photo collections/ha giang/IMG_7621.jpg", title: "Northeast", desc: "The bright blue of that boat gliding across the emerald water was an absolute photographer's dream." },
            { src: "photo collections/ha giang/IMG_7908.jpg", title: "Northeast", desc: "Nature really showed off here with these glowing, golden cave formations. It felt like stepping into a hidden treasure room." },
            { src: "photo collections/ha giang/IMG_7997.jpg", title: "Northeast", desc: "The river rushes over the rocks, its surface glowing with white bubbles as the water collides and splits into multiple flowing streams." },
            { src: "photo collections/ha giang/IMG_8065.jpg", title: "Northeast", desc: "I literally gasped when I saw this cascading waterfall, the sheer scale and the vivid greens were absolutely picture-perfect." },
            { src: "photo collections/ha giang/IMG_7822.jpg", title: "Northeast", desc: "That bright national red flag popping against the rustic floating houses and the jade river was a shot I simply couldn't pass up." },
            { src: "photo collections/ha giang/IMG_8098.jpg", title: "Northeast", desc: "Getting up close to the falls, the roaring white water rushing over the mossy rocks looked so incredibly refreshing and wild." },
            { src: "photo collections/ha giang/IMG_7469.jpg", title: "Northeast", desc: "Even in the rain, the sea of colorful umbrellas and traditional outfits made this street scene look incredibly charming." },
            { src: "photo collections/ha giang/IMG_7413.jpg", title: "Northeast", desc: "The earthy tones of these traditional houses resting under the misty mountains gave off the coziest, most nostalgic vibe." },
            { src: "photo collections/ha giang/IMG_7080.jpg", title: "Northeast", desc: "I loved the urban geometry here, with the neat row of cafe chairs perfectly framing the busy street traffic." },
            { src: "photo collections/ha giang/IMG_7032.jpg", title: "Northeast", desc: "Seeing these gorgeous red lanterns glowing against the canopy of green leaves brought such a joyful splash of color to my day." },
            { src: "photo collections/ha giang/IMG_7012.jpg", title: "Northeast", desc: "The vibrant architecture of this temple, guarded by the stone lion, was wonderfully detailed and striking." },
            { src: "photo collections/ha giang/IMG_7077.jpg", title: "Northeast", desc: "The mouthwatering sizzle of the grill and the vendor's focused expression made for the perfect slice-of-life street portrait." },
            { src: "photo collections/ha giang/IMG_7825.jpg", title: "Northeast", desc: "Looking up at those rustic homes scattered across the sweeping, terraced hillsides was pure visual poetry." },
            { src: "photo collections/ha giang/IMG_7447.jpg", title: "Northeast", desc: "Framing the lively festival crowd with those bright yellow flowers in the foreground made the whole moment feel so alive." },
            { src: "photo collections/ha giang/IMG_7725.jpg", title: "Northeast", desc: "The rugged textures of that sheer cliff face diving straight into the vibrant green water was an absolute stunner of a view." },
            { src: "photo collections/ha giang/IMG_7709.jpg", title: "Northeast", desc: "Sailing through this massive, dramatic canyon felt so epic, and the framing of the sheer rock walls was breathtaking." },
            { src: "photo collections/ha giang/IMG_7740.jpg", title: "Northeast", desc: "Those twin blue boats drifting through the majestic mountain valley looked so perfectly placed I had to take the shot." },
            { src: "photo collections/ha giang/IMG_7609.jpg", title: "Northeast", desc: "There was such a wonderful, joyful energy in this crowd wandering down the valley road together." },
            { src: "photo collections/ha giang/IMG_7932.jpg", title: "Northeast", desc: "The mysterious, cool lighting on these cave steps made it look like a pathway to another world. Completely mesmerizing." },
            { src: "photo collections/ha giang/IMG_7238.jpg", title: "Northeast", desc: "The intricate geometric patterns and vivid colors of these traditional fabrics were practically begging to be photographed." },
            { src: "photo collections/ha giang/IMG_7361.jpg", title: "Northeast", desc: "Walking under this canopy of gorgeous white blossoms with the crowd felt exactly like a scene from a beautiful movie." },
            { src: "photo collections/ha giang/IMG_7286.jpg", title: "Northeast", desc: "The peaceful contrast of the dark roofs against the vibrant green terraced fields was just the ultimate countryside view." },
            { src: "photo collections/ha giang/IMG_7104.jpg", title: "Northeast", desc: "I loved how this impressive building peeked out from the dense mountain forest; it looked so grand and secluded." },
            { src: "photo collections/ha giang/IMG_7690.jpg", title: "Northeast", desc: "The sheer scale of these towering cliffs dwarfing the little boats on the water was a mind-blowing sight to capture." },
            { src: "photo collections/ha giang/IMG_8040.jpg", title: "Northeast", desc: "The river was so incredibly lively with all those colorful tourist rafts reflecting in the water, it was an absolute joy to photograph" },
            { src: "photo collections/ha giang/IMG_7560.jpg", title: "Northeast", desc: "Watching those dramatic clouds roll over the rugged mountain peaks was so cinematic, I couldn't resist snapping one last perfect shot." }
        ]
    },
    pattaya: {
        name: "Pattaya",
        cover: "photo collections/thailand/day1/thailand-05.jpg",
        photos: [
            { src: "photo collections/thailand/day1/thailand-12.jpg", title: "Pattaya", desc: "The glistening, fresh seafood lined up on the ice looked so incredibly appetizing under the street lights, I just had to snap it." },
            { src: "photo collections/thailand/day1/thailand-14.jpg", title: "Pattaya", desc: "I absolutely loved the chaotic, cinematic energy of this street in Pattaya, with the bright neon signs glowing so vibrantly against the dark night." },
            { src: "photo collections/thailand/day2/thailand-59.jpg", title: "Pattaya", desc: "Seeing how they turned simple plastic bottles into these bright, colorful bamboo ornaments was such a cheerful and creative visual surprise." },
            { src: "photo collections/thailand/day2/thailand-70.jpg", title: "Pattaya", desc: "The bright rainbow umbrella perfectly framing the woman cooking on her traditional wooden boat was an absolute dream to photograph." },
            { src: "photo collections/thailand/day2/thailand-74.jpg", title: "Pattaya", desc: "The warm, golden glow spilling out from this retro little shop gave off the coziest, most inviting nostalgic vibe ever." },
            { src: "photo collections/thailand/day2/thailand-085.jpg", title: "Pattaya", desc: "That towering, brilliantly lit green tree stood out so magnificently against the pitch-black night sky." },
            { src: "photo collections/thailand/day2/thailand-095.jpg", title: "Pattaya", desc: "Looking out over the hazy bay, the city skyline curving around all those tiny scattered boats looked beautifully dramatic." },
            { src: "photo collections/thailand/day2/thailand-096.jpg", title: "Pattaya", desc: "I had to step back just to capture the sheer, majestic spread of that gorgeous green tree shading the little pavilion." },
            { src: "photo collections/thailand/day2/thailand-099.jpg", title: "Pattaya", desc: "The immense scale of that golden Buddha glowing against the massive rock face was so awe-inspiring, it practically demanded a photo" },
            { src: "photo collections/thailand/day2/thailand-67.jpg", title: "Pattaya", desc: "The way those lush, cascading pink flowers turned a simple storefront into a magical secret garden was just too pretty." },
            { src: "photo collections/thailand/day1/thailand-21.jpg", title: "Pattaya", desc: "Capturing the moody mix of glowing headlights and deep shadows on this busy street made it look exactly like a still from a movie." },
            { src: "photo collections/thailand/day1/thailand-13.jpg", title: "Pattaya", desc: "The cozy, warm glow of the single light bulb illuminating the vendor's hard work amidst the grilling smoke was a perfect street food moment." },
            { src: "photo collections/thailand/day1/thailand-02.jpg", title: "Pattaya", desc: "The absolute explosion of vibrant red and blue neon signs made this lively alleyway feel so electric and alive." },
            { src: "photo collections/thailand/day2/thailand-71.jpg", title: "Pattaya", desc: "I couldn't resist taking a picture of that adorable little golden lucky cat sitting right next to those massive, fresh green coconuts." },
            { src: "photo collections/thailand/day2/thailand-79.jpg", title: "Pattaya", desc: "The natural sunlight filtering through the wooden roof and lighting up those colorful hanging clothes was so beautifully picturesque." },
            { src: "photo collections/thailand/day2/thailand-61.jpg", title: "Pattaya", desc: "Walking through this cheerful, bright bridge of upcycled hanging ornaments felt exactly like strolling through a colorful summer festival" },
            { src: "photo collections/thailand/day2/thailand-72.jpg", title: "Pattaya", desc: "The vibrant emerald water reflecting the cute wooden boat and all those hanging colorful lanterns looked perfectly idyllic." },
            { src: "photo collections/thailand/day1/thailand-01.jpg", title: "Pattaya", desc: "The absolute explosion of glowing neon signs lighting up this busy street made it feel like stepping right into a vibrant, cinematic dreamscape." },
            { src: "photo collections/thailand/day1/thailand-07.jpg", title: "Pattaya", desc: "The way the warm stall light perfectly caught her concentration and the vibrant yellow of those fresh mangoes made for an unbelievably appetizing street portrait." },
            { src: "photo collections/thailand/day1/thailand-20.jpg", title: "Pattaya", desc: "Amid the rhythm of a lively street, a group of delivery workers works tirelessly through the night." },
            { src: "photo collections/thailand/day1/thailand-04.jpg", title: "Pattaya", desc: "My jaw dropped at the sight of hundreds of glowing red lanterns floating above the bustling, neon-lit crowd. It was pure magic." },
            { src: "photo collections/thailand/day1/thailand-15.jpg", title: "Pattaya", desc: "I loved how the glowing, warm shopfronts spilled out onto the busy street, creating such an inviting evening atmosphere." },
            { src: "photo collections/thailand/day1/thailand-10.jpg", title: "Pattaya", desc: "The vendor's bright red cap and shirt popping against the dark, busy night market scene made for such a striking, colorful portrait." },
            { src: "photo collections/thailand/day1/thailand-09.jpg", title: "Pattaya", desc: "The chaotic but beautiful blend of warm vendor lights and bustling crowds made this bustling market scene look so incredibly vibrant." },
            { src: "photo collections/thailand/day2/thailand-73.jpg", title: "Pattaya", desc: "The incredible rainbow of tie-dye colors on those flowing dresses just screamed pure summer joy, making for the happiest photo." },
            { src: "photo collections/thailand/day2/thailand-78.jpg", title: "Pattaya", desc: "The deep, rich shadows and warm, inviting lights drew me right into the heart of this charming, busy market alley." },
            { src: "photo collections/thailand/day2/thailand-77.jpg", title: "Pattaya", desc: "Those gorgeous, intricately shaped paper lanterns created such a festive and colorful canopy for everyone walking underneath." },
            { src: "photo collections/thailand/day2/thailand-098.jpg", title: "Pattaya", desc: "Getting this over-the-shoulder shot of him peering through the classic silver telescope felt perfectly candid and sweet." },
            { src: "photo collections/thailand/day2/thailand-093.jpg", title: "Pattaya", desc: "From way up high, the scattered boats anchored across the calm, twilight water looked exactly like lovely little toys." },
            { src: "photo collections/thailand/day1/thailand-05.jpg", title: "Pattaya", desc: "The glossy, vibrant yellow perfection of that freshly sliced mango sticky rice was so mouth-watering I had to photograph it before diving in." }
        ]
    },
    bangkok: {
        name: "Bangkok",
        cover: "photo collections/thailand/bangkok/1.jpg",
        photos: [
            { src: "photo collections/thailand/bangkok/5.jpg", title: "Bangkok", desc: "The sheer scale of this sprawling city from above was mind-blowing, and I just had to capture all those layers of skyscrapers fading beautifully into the haze." },
            { src: "photo collections/thailand/bangkok/6.jpg", title: "Bangkok", desc: "The bold contrast of that vibrant orange bus next to the bright yellow taxi was a street photographer's absolute dream" },
            { src: "photo collections/thailand/bangkok/8.jpg", title: "Bangkok", desc: "I loved how the soft, hazy light kissed those modern skyscrapers along the river while people strolled by—it looked so peaceful and perfect." },
            { src: "photo collections/thailand/bangkok/13.jpg", title: "Bangkok", desc: "Pointing my camera straight up at those intricate, soaring temple spires made me feel so tiny, and the architectural details are just out of this world." },
            { src: "photo collections/thailand/bangkok/20.jpg", title: "Bangkok", desc: "Looking down at the glowing, neat little striped tents of the night market felt like discovering a secret, luminous village right in the middle of the city." },
            { src: "photo collections/thailand/bangkok/22.jpg", title: "Bangkok", desc: "The geometric grid of these apartment balconies at night, with just a few random lights glowing, looked so incredibly moody and cinematic." },
            { src: "photo collections/thailand/bangkok/2.jpg", title: "Bangkok", desc: "Shooting through the glass to catch that iconic, pixelated skyscraper standing tall in the misty skyline was such a cool, futuristic perspective to find." },
            { src: "photo collections/thailand/bangkok/14.jpg", title: "Bangkok", desc: "Getting up close to the incredibly detailed porcelain patterns of the Wat Arun temple bathed in the bright sun was an absolute visual feast." },
            { src: "photo collections/thailand/bangkok/4.jpg", title: "Bangkok", desc: "I felt like I was looking into the future watching the elevated train track carve right through the dense, colorful jungle of concrete." },
            { src: "photo collections/thailand/bangkok/24.jpg", title: "Bangkok", desc: "Those sticky, glossy ribs stacked up under the warm market lights looked so dangerously mouthwatering I had to take a picture before I devoured them." },
            { src: "photo collections/thailand/bangkok/30.jpg", title: "Bangkok", desc: "The slick reflections of the bright neon green and yellow taxis lined up on the night street just screamed classic, vibrant city nightlife." },
            { src: "photo collections/thailand/bangkok/35.jpg", title: "Bangkok", desc: "That bright red and blue tuk-tuk lit up by the neon glow of the gas station looked so perfectly retro, I felt like I was shooting a movie scene." },
            { src: "photo collections/thailand/bangkok/26.jpg", title: "Bangkok", desc: "The bright pop of yellow from the stacked sweet corn under the glowing street lamps was such a cheerful, appetizing splash of color." },
            { src: "photo collections/thailand/bangkok/9.jpg", title: "Bangkok", desc: "The way that massive glass building reflected the warm afternoon sky like a giant golden mirror was an absolute showstopper." },
            { src: "photo collections/thailand/bangkok/15.jpg", title: "Bangkok", desc: "Framing the majestic, towering temple with the bustling, colorful crowd at the base really captured the epic energy of the place." },
            { src: "photo collections/thailand/bangkok/3.jpg", title: "Bangkok", desc: "Seeing that incredibly unique, jagged skyscraper piercing through the misty city skyline was an architectural view I just couldn't resist snapping." },
            { src: "photo collections/thailand/bangkok/17.jpg", title: "Bangkok", desc: "This kid striking a proud superhero pose on a vintage pink car against that fluffy blue sky is hands-down the most joyful, perfect moment I caught all day." },
            { src: "photo collections/thailand/bangkok/18.jpg", title: "Bangkok", desc: "I felt like I tumbled down the rabbit hole into a candy-colored wonderland with all these vividly painted rocks and whimsical hot air balloons." },
            { src: "photo collections/thailand/bangkok/32.jpg", title: "Bangkok", desc: "The sleek, futuristic curves of that illuminated building against the night sky looked like a giant glowing spaceship landing in the city." },
            { src: "photo collections/thailand/bangkok/21.jpg", title: "Bangkok", desc: "I am totally obsessed with how the moody red taillights reflected off the wet asphalt—it gives the street such a cool, cyberpunk vibe" },
            { src: "photo collections/thailand/bangkok/25.jpg", title: "Bangkok", desc: "All those bright, smiling crocheted flowers and keychains packed tightly together made for the absolute cutest, coziest splash of color." },
            { src: "photo collections/thailand/bangkok/23.jpg", title: "Bangkok", desc: "The chaotic, beautiful rainbow of patterned elephant bags hanging at the market stall was an irresistible, vibrant feast for the eyes." },
            { src: "photo collections/thailand/bangkok/33.jpg", title: "Bangkok", desc: "Getting right up close to the glowing red taillight of the neon tuk-tuk perfectly captured the electric buzz and grit of the city at night." },
            { src: "photo collections/thailand/bangkok/31.jpg", title: "Bangkok", desc: "The glowing bus stop signs and the candid crowd waiting under the streetlights created such a perfect, authentic slice-of-life urban scene." },
            { src: "photo collections/thailand/bangkok/1.jpg", title: "Bangkok", desc: "Looking straight down at the highway felt like watching a perfectly choreographed, colorful dance of tiny toy cars." }
        ]
    }
};

function initGalleryGrid() {
    let currentMode = 'menu'; let activeIndex = 0;

    const menuStack = document.getElementById('menuStack');
    const menuCollectionName = document.getElementById('menuCollectionName');
    let menuScroll = 0; let menuTarget = 0;
    const colKeys = Object.keys(galleryData);
    const totalCards = colKeys.length;

    colKeys.forEach((key) => {
        const col = galleryData[key];
        let card = document.createElement('div'); card.className = 'menu-card';
        if (col.photos && col.photos.length > 0) {
            let img = document.createElement('img');
            img.src = col.cover;
            card.appendChild(img);
        } else {
            let emptyDiv = document.createElement('div'); emptyDiv.className = 'empty-block'; card.appendChild(emptyDiv);
        }
        menuStack.appendChild(card); col.cardEl = card;
    });

    function renderMenu() {
        menuScroll += (menuTarget - menuScroll) * 0.05;
        colKeys.forEach((key, i) => {
            const col = galleryData[key];
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
            menuCollectionName.innerText = galleryData[colKeys[activeIndex]].name;
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

    function buildGallery(collectionId) {
        const colData = galleryData[collectionId];
        grid.innerHTML = ''; gridItems = []; gridScroll = { x: 0, y: 0 }; gridTarget = { x: 0, y: 0 };
        galleryCenterTitle.innerText = colData.name;

        if (!colData.photos || colData.photos.length === 0) {
            galleryComingSoon.style.display = 'block';
        } else {
            galleryComingSoon.style.display = 'none';
        }

        let photoIndex = 0;

        for (let i = 0; i < cols; i++) {
            let currentY = 0; let columnItems = [];
            for (let j = 0; j < rows; j++) {
                let randomHeight = itemWidth * gsap.utils.random(0.7, 1.5);
                let el = document.createElement('div'); el.className = 'grid-item';
                el.style.width = `${itemWidth}px`; el.style.height = `${randomHeight}px`;

                let innerEl;
                if (!colData.photos || colData.photos.length === 0) {
                    innerEl = document.createElement('div'); innerEl.className = 'empty-block';
                } else {
                    const photoObj = colData.photos[photoIndex % colData.photos.length];
                    photoIndex++;
                    innerEl = document.createElement('img');
                    innerEl.src = photoObj.src;
                    el.addEventListener('click', (e) => {
                        // Left click is now strictly for opening, so we no longer need to check if we dragged!
                        if (currentMode === 'gallery') {
                            openDetail(photoObj.src, photoObj.title, photoObj.desc);
                        }
                    });
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
            // ADDED force3D: true to kill the frame lag 
            gsap.set(item.el, { x: wrapX, y: wrapY, force3D: true });
        });
    }

    let dragged = false;
    const cursor = document.querySelector('.cursor-dot');

    window.addEventListener('wheel', (e) => {
        if (currentMode === 'menu') menuTarget += Math.sign(e.deltaY) * 0.4;
        else if (currentMode === 'gallery') { gridTarget.y -= e.deltaY * 1.5; gridTarget.x -= e.deltaX * 1.5; }
    });

    // MIDDLE CLICK to drag to avoid accidentally opening photos!
    window.addEventListener('mousedown', (e) => {
        if (currentMode === 'gallery' && e.button === 1) {
            e.preventDefault(); // Prevents the browser's default auto-scroll icon
            isDragging = true; dragged = false;
            startPos.x = e.clientX; startPos.y = e.clientY;
            if (cursor) {
                cursor.classList.add('active');
                cursor.setAttribute('data-text', 'DRAG');
            }
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging && currentMode === 'gallery') {
            dragged = true;
            let dx = e.clientX - startPos.x; let dy = e.clientY - startPos.y;
            gridTarget.x += dx * 1.8; gridTarget.y += dy * 1.8;
            startPos.x = e.clientX; startPos.y = e.clientY;
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (e.button === 1) {
            isDragging = false;
            if (cursor) { cursor.classList.remove('active'); cursor.removeAttribute('data-text'); }
        }
    });

    // INTUITIVE CLICK to Open Gallery Collection!
    menuStack.addEventListener('click', () => {
        if (currentMode === 'menu') {
            const selectedColKey = colKeys[activeIndex]; buildGallery(selectedColKey);
            gsap.to('#menuView', { autoAlpha: 0, duration: 0.6 });
            gsap.to('#galleryView', { autoAlpha: 1, duration: 0.8, delay: 0.2 });
            currentMode = 'gallery';
            document.getElementById("header").classList.add("blend-diff");
            if (cursor) { cursor.classList.remove('active'); cursor.removeAttribute('data-text'); }
        }
    });

    // Hover effect for the Menu Stack
    menuStack.addEventListener('mouseenter', () => {
        if (currentMode === 'menu' && cursor) {
            cursor.classList.add('active'); cursor.setAttribute('data-text', 'OPEN');
        }
    });
    menuStack.addEventListener('mouseleave', () => {
        if (cursor) { cursor.classList.remove('active'); cursor.removeAttribute('data-text'); }
    });

    document.addEventListener('keydown', (e) => {
        if (document.body.dataset.page !== 'gallery') return;
        if (e.key === 'Escape') {
            if (currentMode === 'gallery') document.getElementById('backBtn').click();
            else if (currentMode === 'detail') closeDetail();
        }
    });

    document.getElementById('backBtn').addEventListener('click', () => {
        if (currentMode === 'gallery') {
            window.history.pushState({}, '', 'gallery.html');
            gsap.to('#galleryView', { autoAlpha: 0, duration: 0.5 });
            gsap.to('#menuView', { autoAlpha: 1, duration: 0.6, delay: 0.2 });
            currentMode = 'menu';
            document.getElementById("header").classList.remove("blend-diff");
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const collectionParam = urlParams.get('collection');
    if (collectionParam) {
        const foundIndex = colKeys.findIndex(c => c === collectionParam);
        if (foundIndex > -1) {
            activeIndex = foundIndex; menuTarget = foundIndex; menuScroll = foundIndex;
            setTimeout(() => {
                buildGallery(colKeys[activeIndex]);
                gsap.to('#menuView', { autoAlpha: 0, duration: 0 });
                gsap.to('#galleryView', { autoAlpha: 1, duration: 0.8 });
                currentMode = 'gallery';
                document.getElementById("header").classList.add("blend-diff");
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

    function openDetail(src, title, desc) {
        currentMode = 'detail'; detailImg.src = src; detailTitle.innerText = title;
        document.getElementById('detailDesc').innerText = desc;
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
    gsap.set('.word', { opacity: 0, y: "2vw", rotateX: 60, filter: 'blur(8px)' });

    const masterTl = gsap.timeline({ paused: true });
    const staggerTime = 0.015; const phaseDur = 1.6; const slideDur = phaseDur * 2.5;

    function createPhase(phaseNum, label, delayTime) {
        masterTl.addLabel(label, delayTime)
            .to(`.p${phaseNum} .word`, { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', stagger: staggerTime, duration: phaseDur, ease: "power3.out" }, label)
            .to(`.p${phaseNum} .word`, { opacity: 0, y: "-2vw", rotateX: -60, filter: 'blur(8px)', stagger: staggerTime, duration: phaseDur, ease: "power3.in" }, `${label}+=${phaseDur * 1.5}`);
    }

    createPhase(1, 'phase1', 0);
    createPhase(2, 'phase2', phaseDur * 3);
    createPhase(3, 'phase3', phaseDur * 6);

    // Make the photo track slide seamlessly and continuously across all 3 text phases
    // phaseDur * 9 perfectly matches the rhythm of the text appearing, holding, and hiding.
    // This perfectly synchronizes the photo track so there is NO dead zone or freezing at the end.
    const exactDuration = masterTl.duration();

    // Use yPercent instead of y for strict pixel-perfect precision
    masterTl.fromTo('.photo-track',
        { yPercent: 0 },
        { yPercent: -75, duration: exactDuration, ease: "none" },
        0
    );

    let scrollY = 0; let targetScrollY = 0; const cycleHeight = 5500;

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