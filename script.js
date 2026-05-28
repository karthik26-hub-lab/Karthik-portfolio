// --- 1. SMOOTH SCROLLING (LENIS) ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    smoothWheel: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Sync Lenis with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);


// --- 2. PAGE ANIMATIONS (SCROLLTRIGGER) ---
function initPageAnimations() {
    const revealElements = gsap.utils.toArray('.reveal');
    revealElements.forEach(el => {
        gsap.fromTo(el, 
            { y: 40, opacity: 0 }, 
            {
                scrollTrigger: { trigger: el, start: "top 85%" },
                y: 0, opacity: 1, duration: 1.2, ease: "power3.out"
            }
        );
    });

    const staggerGrids = ['.skills-grid', '.process-grid'];
    staggerGrids.forEach(grid => {
        const el = document.querySelector(grid);
        if(el) {
            ScrollTrigger.create({
                trigger: el, start: "top 80%",
                animation: gsap.fromTo(`${grid} .reveal-stagger`, 
                    { y: 40, opacity: 0 }, 
                    { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
                )
            });
        }
    });

    ScrollTrigger.refresh();
}


// --- 3. THE INITIAL BOOT SEQUENCE (SPLASH SCREEN) ---
const splashScreen = document.querySelector('.splash-screen');

if (splashScreen) {
    // Hide Navbar and Main Content immediately on load
    gsap.set('.navbar', { opacity: 0, y: -20 });
    gsap.set('main', { opacity: 0 });
    
    const splashTl = gsap.timeline();
    
    splashTl.to('.splash-text', { opacity: 1, duration: 1, ease: 'power2.out' })
            .to('.splash-text', { opacity: 0, duration: 0.5, delay: 0.6, ease: 'power2.in' })
            .to('.splash-screen', { 
                yPercent: -100, 
                duration: 1.2, 
                ease: 'power3.inOut',
                // FIRE THE TEXT ANIMATION AS THE CURTAIN STARTS LIFTING
                onStart: () => { initPageAnimations(); },
                onComplete: () => gsap.set('.splash-screen', { display: 'none' })
            })
            // REVEAL NAVBAR AND MAIN CONTENT SIMULTANEOUSLY
            .to('.navbar', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, "-=1.0")
            .to('main', { opacity: 1, duration: 1, ease: 'power3.out' }, "-=1.0");
} else {
    // Standard load for pages without a splash screen
    initPageAnimations();
}


// --- 4. MACOS STYLE SEAMLESS ROUTER ---
let isTransitioning = false;

async function navigateTo(url) {
    if (isTransitioning) return;
    
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const targetFile = url.split('/').pop() || 'index.html';
    if (currentFile === targetFile) return;

    isTransitioning = true;
    const mainContent = document.querySelector('main');

    // macOS Style Outro: Slight scale down and fade out
    await gsap.to(mainContent, {
        opacity: 0,
        scale: 0.98,
        duration: 0.4,
        ease: 'power2.inOut'
    });

    try {
        const response = await fetch(url);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newMain = doc.querySelector('main').innerHTML;
        
        mainContent.innerHTML = newMain;
        history.pushState({}, '', url);
        
        window.scrollTo(0, 0);
        lenis.scrollTo(0, { immediate: true });
        
        initPageAnimations();
        
        // macOS Style Intro: Fade in and scale up the new content
        gsap.fromTo(mainContent, 
            { opacity: 0, scale: 1.02 }, 
            { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
        );
        
    } catch (error) {
        console.error("Navigation failed:", error);
        window.location.href = url; 
    }
    
    setTimeout(() => { isTransitioning = false; }, 600);
}

// Intercept Navigation Links
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); 
        navigateTo(this.getAttribute('href')); 
    });
});

window.addEventListener('popstate', () => {
    navigateTo(window.location.pathname.split('/').pop() || 'index.html');
});


// --- 5. DYNAMIC SCROLL & SWIPE GESTURES ---
const pageSequence = ['index.html', 'about.html', 'capabilities.html', 'works.html', 'process.html', 'contact.html'];

function getAdjacentPage(direction) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const currentIndex = pageSequence.indexOf(currentPath) !== -1 ? pageSequence.indexOf(currentPath) : 0;
    return direction === 'next' ? pageSequence[currentIndex + 1] : pageSequence[currentIndex - 1];
}

// Mouse Wheel (Harsh scroll up/down)
window.addEventListener('wheel', (e) => {
    if (Math.ceil(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 5) {
        if (e.deltaY > 50 && getAdjacentPage('next')) navigateTo(getAdjacentPage('next'));
    }
    if (window.scrollY <= 5) {
        if (e.deltaY < -50 && getAdjacentPage('prev')) navigateTo(getAdjacentPage('prev'));
    }
});

// Mobile Touch / Swipe Gestures
let touchStartX = 0;
let touchStartY = 0;

window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let deltaX = touchEndX - touchStartX;
    let deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal Swipe
        if (deltaX < -50 && getAdjacentPage('next')) navigateTo(getAdjacentPage('next'));      // Swiped Left
        else if (deltaX > 50 && getAdjacentPage('prev')) navigateTo(getAdjacentPage('prev'));  // Swiped Right
    } else {
        // Vertical Swipe
        if (deltaY < -50 && Math.ceil(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 5) {
            if (getAdjacentPage('next')) navigateTo(getAdjacentPage('next'));
        } else if (deltaY > 50 && window.scrollY <= 5) {
            if (getAdjacentPage('prev')) navigateTo(getAdjacentPage('prev'));
        }
    }
});
