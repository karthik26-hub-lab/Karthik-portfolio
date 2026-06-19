document.addEventListener('DOMContentLoaded', () => {

    // --- High-Performance Lottie Intro Controller ---
    const sequenceContainer = document.getElementById('intro-sequence');
    const mainContent = document.getElementById('main-content');

    const animationPlayer = lottie.loadAnimation({
        container: document.getElementById('lottie-intro-player'),
        renderer: 'svg', loop: false, autoplay: true, path: 'intro-anim.json' 
    });

    function transitionToPortfolio() {
        sequenceContainer.style.opacity = '0';
        setTimeout(() => {
            sequenceContainer.style.display = 'none';
            mainContent.style.display = 'block';
            setTimeout(() => {
                mainContent.style.opacity = '1';
                handleScrollReveal(); 
                handleHorizontalScroll(); 
            }, 20);
        }, 300);
    }

    animationPlayer.addEventListener('complete', () => {
        const finalIntro = document.getElementById('intro-final');
        const lottiePlayer = document.getElementById('lottie-intro-player');
        if(lottiePlayer) {
            lottiePlayer.style.transition = 'opacity 0.5s ease';
            lottiePlayer.style.opacity = '0';
        }
        if(finalIntro) finalIntro.classList.add('active'); 
        
        setTimeout(() => {
            if(finalIntro) {
                finalIntro.classList.remove('active');
                finalIntro.classList.add('exit'); 
            }
            setTimeout(transitionToPortfolio, 200); 
        }, 2000); 
    });
    
    setTimeout(() => {
        if (sequenceContainer.style.display !== 'none') transitionToPortfolio();
    }, 4000);

    // --- Scroll Reveal ---
    function handleScrollReveal() {
        const reveals = document.querySelectorAll('.scroll-reveal');
        const windowHeight = window.innerHeight;
        reveals.forEach(reveal => {
            const revealTop = reveal.getBoundingClientRect().top;
            if (revealTop < windowHeight * 0.95) reveal.classList.add('is-revealed');
        });
    }
    window.addEventListener('scroll', handleScrollReveal, { passive: true });

// --- 1. Horizontal Scroll Engine (For LAB) ---
    const labContainer = document.getElementById('lab-container');
    const labTrack = document.getElementById('lab-track');

    function handleLabScroll() {
        if (!labContainer || !labTrack) return;
        const rect = labContainer.getBoundingClientRect();
        let progress = 0;
        if (rect.top <= 0) {
            const maxScroll = rect.height - window.innerHeight;
            progress = Math.min(1, Math.max(0, -rect.top / maxScroll));
        }
        const trackScrollWidth = labTrack.scrollWidth;
        const parentWidth = labTrack.parentElement.clientWidth;
        if (trackScrollWidth > parentWidth) {
            const maxTranslate = trackScrollWidth - parentWidth;
            labTrack.style.transform = `translate3d(-${progress * maxTranslate}px, 0, 0)`;
        }
    }
    window.addEventListener('scroll', handleLabScroll, { passive: true });
    window.addEventListener('resize', handleLabScroll, { passive: true });

    // --- 2. Horizontal OVERLAP Stack Engine (For WORKS) ---
    const worksContainer = document.getElementById('works-container');
    const hCard2 = document.getElementById('h-card-2');
    const hCard3 = document.getElementById('h-card-3');
    const hCard1Inner = document.getElementById('h-card-1-inner');
    const hCard2Inner = document.getElementById('h-card-2-inner');

    window.addEventListener('scroll', () => {
        if (!worksContainer || !hCard2 || !hCard3) return;
        
        const rect = worksContainer.getBoundingClientRect();
        let progress = 0;
        
        // Container top screen-a touch pannathum calculation start aagum
        if (rect.top <= 0) {
            const maxScroll = rect.height - window.innerHeight;
            progress = Math.min(1, Math.max(0, -rect.top / maxScroll));
        }
        
        // Phase 1 (0 to 0.5 progress): Card 2 slides in from Right
        let p1 = Math.min(1, Math.max(0, progress * 2));
        hCard2.style.transform = `translate3d(${100 - (p1 * 100)}%, 0, 0)`; // 100% (hidden right) to 0% (center)
        if(hCard1Inner) {
            hCard1Inner.style.transform = `scale(${1 - (p1 * 0.05)})`; // Slightly shrinks to give depth
            hCard1Inner.style.filter = `brightness(${1 - (p1 * 0.5)}) blur(${p1 * 4}px)`; // Dims & Blurs
        }

        // Phase 2 (0.5 to 1.0 progress): Card 3 slides in from Right
        let p2 = Math.min(1, Math.max(0, (progress - 0.5) * 2));
        hCard3.style.transform = `translate3d(${100 - (p2 * 100)}%, 0, 0)`;
        if(hCard2Inner) {
            hCard2Inner.style.transform = `scale(${1 - (p2 * 0.05)})`;
            hCard2Inner.style.filter = `brightness(${1 - (p2 * 0.5)}) blur(${p2 * 4}px)`;
        }
    }, { passive: true });
    // --- X-Ray Lerp Physics ---
    const homeWrapper = document.getElementById('home-wrapper');
    const realityLayer = document.querySelector('.reality-world');
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let xrayX = window.innerWidth / 2, xrayY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    function renderFluidPhysics() {
        if (window.scrollY < 50 && homeWrapper && realityLayer) {
            const rect = homeWrapper.getBoundingClientRect();
            xrayX += ((mouseX - rect.left) - xrayX) * 0.1; 
            xrayY += ((mouseY - rect.top) - xrayY) * 0.1;
            realityLayer.style.setProperty('--mouse-x', `${xrayX}px`);
            realityLayer.style.setProperty('--mouse-y', `${xrayY}px`);
        }
        requestAnimationFrame(renderFluidPhysics);
    }
    renderFluidPhysics();
    
    // --- AirDrop Expand Math ---
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY <= window.innerHeight && homeWrapper && realityLayer) {
            const progress = scrollY / window.innerHeight; 
            realityLayer.style.setProperty('--xray-radius', `${150 + (progress * 5000)}px`);
            if (scrollY > 10) {
                realityLayer.style.setProperty('--mouse-x', `50%`);
                realityLayer.style.setProperty('--mouse-y', `50%`);
            }
            homeWrapper.style.transform = `translate3d(0, ${scrollY * 0.4}px, -100px) scale(${Math.max(0.85, 1 - (progress * 0.15))})`;
            homeWrapper.style.filter = `blur(${progress * 8}px) brightness(${1 - (progress * 0.8)})`;
        }
    }, { passive: true });

    // --- TRUE 3D Flip Clock Engine ---
    function initFlipClock() {
        const hourEl = document.getElementById('flip-hour'), minEl = document.getElementById('flip-min');
        const secEl = document.getElementById('flip-sec'), ampmEl = document.getElementById('flip-ampm');
        if (!hourEl) return;

        function triggerTick(element, newValue) {
            if (element.textContent === newValue) return;
            element.textContent = newValue;
            element.setAttribute('data-val', element.textContent);
            element.classList.remove('tick');
            void element.offsetWidth; // Reflow
            element.classList.add('tick');
        }

        function updateClock() {
            const now = new Date();
            let h = now.getHours();
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            triggerTick(hourEl, h.toString().padStart(2, '0'));
            triggerTick(minEl, m);
            triggerTick(secEl, s);
            ampmEl.textContent = ampm;
        }
        setInterval(updateClock, 1000); updateClock();
    }
    initFlipClock();

    // --- 3D Card Swap Logic (Vanilla GSAP) Fixed inside DOM Content ---
    const cards = document.querySelectorAll('.swap-card');
    const container = document.getElementById('card-swap-container');
    
    if(cards.length > 0) {
        const cardDistance = window.innerWidth < 768 ? 40 : 60; 
        const verticalDistance = window.innerWidth < 768 ? 50 : 70;
        const skewAmount = 6;
        let swapInterval;

        const makeSlot = (i, total) => ({
            x: i * cardDistance, y: -i * verticalDistance,
            z: -i * cardDistance * 1.5, zIndex: total - i
        });

        cards.forEach((card, i) => {
            const slot = makeSlot(i, cards.length);
            gsap.set(card, {
                x: slot.x, y: slot.y, z: slot.z, xPercent: -50, yPercent: -50,
                skewY: skewAmount, transformOrigin: 'center center', zIndex: slot.zIndex,
                force3D: true, transformStyle: 'preserve-3d', backfaceVisibility: 'hidden'
            });
        });

        let order = Array.from({ length: cards.length }, (_, i) => i);

        function swapCards() {
            if (order.length < 2) return;
            const frontIdx = order[0], rest = order.slice(1), elFront = cards[frontIdx];
            const tl = gsap.timeline();

            tl.to(elFront, { y: '+=500', duration: 0.8, ease: 'power1.inOut' });
            tl.addLabel('promote', '-=0.36'); 
            
            rest.forEach((idx, i) => {
                const el = cards[idx], slot = makeSlot(i, cards.length);
                tl.set(el, { zIndex: slot.zIndex }, 'promote');
                tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: 0.8, ease: 'power1.inOut' }, `promote+=${i * 0.15}`);
            });

            const backSlot = makeSlot(cards.length - 1, cards.length);
            tl.addLabel('return', `promote+=${0.8 * 0.2}`);
            tl.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, 'return');
            tl.to(elFront, { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: 0.8, ease: 'power1.inOut' }, 'return');

            order = [...rest, frontIdx];
        }

        swapInterval = setInterval(swapCards, 4000);
        container.addEventListener('mouseenter', () => clearInterval(swapInterval));
        container.addEventListener('mouseleave', () => swapInterval = setInterval(swapCards, 4000));
    }

});

// --- Active Navbar Underline Tracker (Fixed for Lab) ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]'); // Track all sections with ID

    window.addEventListener('scroll', () => {
        let currentSection = '';

        // Track which section we are currently in
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            // Screen-oda middle-la section varumbothu detect pannum
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                currentSection = section.getAttribute('id');
            }
        });

        // BUG FIX: Match 'lab-container' to the '#lab' nav link
        if (currentSection === 'lab-container') {
            currentSection = 'lab';
        }

        // Add underline to the active link and remove from others
        navLinks.forEach(link => {
            // Remove underline from all links
            link.classList.remove('text-white', 'border-b', 'border-white', 'pb-1');
            link.classList.add('text-white/60');
            
            // If href matches current section, add the underline
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.remove('text-white/60');
                link.classList.add('text-white', 'border-b', 'border-white', 'pb-1');
            }
        });
    }, { passive: true }); // Gives 0 lag while scrolling