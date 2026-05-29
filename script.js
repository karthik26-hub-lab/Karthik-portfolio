// --- 1. GLOBAL THEME CHECK ---
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
}

// ==========================================
// THE HAPTIC ENGINE (Safe Hardware API call)
// ==========================================
function triggerHaptic(duration = 15) {
    // Checks if the browser/device actually supports the vibration motor
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 2. BUTTERY SMOOTH PAGE ENTRY & SPLASH
    // ==========================================
    const splashScreen = document.querySelector('.splash-screen');
    if (splashScreen) {
        if (sessionStorage.getItem('splashPlayed') === 'true') {
            splashScreen.remove(); 
            if (typeof gsap !== 'undefined') {
                gsap.fromTo('.navbar', { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
                gsap.fromTo('main', { opacity: 0, scale: 0.98, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.05 });
            }
        } else {
            if (typeof gsap !== 'undefined') {
                gsap.set('.navbar', { opacity: 0, y: -20 });
                gsap.set('main', { opacity: 0 });
                
                const splashTl = gsap.timeline();
                splashTl.to('.splash-text', { opacity: 1, duration: 1, ease: 'power2.out' })
                        .to('.splash-text', { opacity: 0, duration: 0.5, delay: 0.6, ease: 'power2.in' })
                        .to('.splash-screen', { 
                            yPercent: -100, 
                            duration: 1.2, 
                            ease: 'power3.inOut',
                            onComplete: () => {
                                splashScreen.remove(); 
                                sessionStorage.setItem('splashPlayed', 'true');
                            }
                        })
                        .to('.navbar', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, "-=1.0")
                        .to('main', { opacity: 1, duration: 1, ease: 'power3.out' }, "-=1.0");
            } else {
                splashScreen.remove();
            }
        }
        
        setTimeout(() => {
            const stuckSplash = document.querySelector('.splash-screen');
            if (stuckSplash) stuckSplash.remove();
        }, 2500);
    }

    // ==========================================
    // 3. DRAGGABLE THEME SWITCH
    // ==========================================
    const themeTrack = document.getElementById('themeTrack');
    const themeIndicator = document.getElementById('themeIndicator');
    const themeOptions = document.querySelectorAll('.theme-option');
    let isThemeDragging = false;

    if (themeTrack && themeIndicator && themeOptions.length > 0) {
        let activeOption = Array.from(themeOptions).find(opt => opt.getAttribute('data-theme-val') === savedTheme) || themeOptions[0];

        function updateThemeIndicator(element, animate = true) {
            if (!element) return;
            themeIndicator.style.transition = animate ? 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
            themeIndicator.style.transform = `translateX(${element.offsetLeft - themeOptions[0].offsetLeft}px)`;
            
            themeOptions.forEach(opt => opt.classList.remove('active'));
            element.classList.add('active');

            const themeVal = element.getAttribute('data-theme-val');
            if (themeVal === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            }
            
            // HAPTIC: A solid 20ms tick when the theme successfully switches
            triggerHaptic(20); 
        }

        setTimeout(() => updateThemeIndicator(activeOption, false), 50);

        function handleThemeDrag(e) {
            if (!isThemeDragging) return;
            e.preventDefault();
            let clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            let trackRect = themeTrack.getBoundingClientRect();
            let relativeX = clientX - trackRect.left;

            themeIndicator.style.transition = 'transform 0.15s ease-out'; 
            let pillX = relativeX - (themeIndicator.offsetWidth / 2);
            let maxDrag = trackRect.width - themeIndicator.offsetWidth - (themeOptions[0].offsetLeft * 2);
            
            if (pillX < 0) pillX = 0;
            if (pillX > maxDrag) pillX = maxDrag;
            
            themeIndicator.style.transform = `translateX(${pillX}px)`;
        }

        function endThemeDrag(e) {
            if (!isThemeDragging) return;
            isThemeDragging = false;
            
            let clientX = e.type.includes('mouse') ? e.clientX : (e.changedTouches ? e.changedTouches[0].clientX : 0);
            let trackRect = themeTrack.getBoundingClientRect();
            let relativeX = clientX - trackRect.left;

            let closestOption = themeOptions[0];
            let minDistance = Infinity;

            themeOptions.forEach(opt => {
                let optCenter = opt.offsetLeft + (opt.offsetWidth / 2);
                let distance = Math.abs(relativeX - optCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestOption = opt;
                }
            });
            updateThemeIndicator(closestOption);
            
            window.removeEventListener('mousemove', handleThemeDrag);
            window.removeEventListener('touchmove', handleThemeDrag, {passive: false});
            window.removeEventListener('mouseup', endThemeDrag);
            window.removeEventListener('touchend', endThemeDrag);
        }

        function startThemeDrag(e) {
            isThemeDragging = true;
            handleThemeDrag(e);
            window.addEventListener('mousemove', handleThemeDrag);
            window.addEventListener('touchmove', handleThemeDrag, {passive: false});
            window.addEventListener('mouseup', endThemeDrag);
            window.addEventListener('touchend', endThemeDrag);
        }

        themeTrack.addEventListener('mousedown', startThemeDrag);
        themeTrack.addEventListener('touchstart', startThemeDrag, {passive: false});

        themeOptions.forEach(opt => {
            opt.addEventListener('click', () => { updateThemeIndicator(opt); });
        });
    }

    // ==========================================
    // 4. MAIN NAVIGATION (Cinematic + Haptics)
    // ==========================================
    const navTrack = document.getElementById('navTrack');
    const navIndicator = document.getElementById('navIndicator');
    const links = document.querySelectorAll('.nav-links a');
    
    if (navTrack && navIndicator && links.length > 0) {
        
        let currentPath = window.location.pathname.split('/').pop();
        if (!currentPath || currentPath === '' || currentPath === '/') currentPath = 'index.html'; 

        let activeLink = Array.from(links).find(link => link.getAttribute('href') === currentPath) || links[0];
        let isNavDragging = false;
        let didNavMove = false; 

        function updateNavIndicator(element, animate = true) {
            if (!element) return;
            navIndicator.style.transition = animate ? 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
            navIndicator.style.width = `${element.offsetWidth}px`;
            navIndicator.style.transform = `translateX(${element.offsetLeft}px)`;
            
            links.forEach(l => l.classList.remove('active'));
            element.classList.add('active');
        }

        setTimeout(() => updateNavIndicator(activeLink, false), 50);

        function cinematicNavigate(targetUrl) {
            if (typeof gsap !== 'undefined') {
                gsap.to('main', { 
                    opacity: 0, 
                    duration: 0.15, 
                    ease: 'power2.inOut', 
                    onComplete: () => {
                        window.location.assign(targetUrl); 
                    }
                });
            } else {
                window.location.assign(targetUrl);
            }
        }

        function handleNavDrag(e) {
            if (!isNavDragging) return;
            didNavMove = true; 
            e.preventDefault(); 
            
            let clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            let trackRect = navTrack.getBoundingClientRect();
            let relativeX = clientX - trackRect.left;

            navIndicator.style.transition = 'none';
            let pillX = relativeX - (navIndicator.offsetWidth / 2);
            let maxDrag = trackRect.width - navIndicator.offsetWidth;
            
            if (pillX < 0) pillX = 0;
            if (pillX > maxDrag) pillX = maxDrag;
            
            navIndicator.style.transform = `translateX(${pillX}px)`;
        }

        function endNavDrag(e) {
            if (!isNavDragging) return;
            isNavDragging = false;
            
            if (didNavMove) {
                let clientX = e.type.includes('mouse') ? e.clientX : (e.changedTouches ? e.changedTouches[0].clientX : 0);
                let trackRect = navTrack.getBoundingClientRect();
                let relativeX = clientX - trackRect.left;

                let closestLink = links[0];
                let minDistance = Infinity;

                links.forEach(link => {
                    let linkCenter = link.offsetLeft + (link.offsetWidth / 2);
                    let distance = Math.abs(relativeX - linkCenter);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestLink = link;
                    }
                });

                updateNavIndicator(closestLink);
                
                let targetAttr = closestLink.getAttribute('href');
                let absoluteUrl = closestLink.href; 
                
                if (targetAttr !== currentPath) {
                    triggerHaptic(15); // HAPTIC: Light 15ms tap when drag drops on a new link
                    cinematicNavigate(absoluteUrl); 
                }
            }
            
            window.removeEventListener('mousemove', handleNavDrag);
            window.removeEventListener('touchmove', handleNavDrag);
            window.removeEventListener('mouseup', endNavDrag);
            window.removeEventListener('touchend', endNavDrag);
        }

        function startNavDrag(e) {
            isNavDragging = true;
            didNavMove = false; 
            
            window.addEventListener('mousemove', handleNavDrag);
            window.addEventListener('touchmove', handleNavDrag, {passive: false});
            window.addEventListener('mouseup', endNavDrag);
            window.addEventListener('touchend', endNavDrag);
        }

        navTrack.addEventListener('mousedown', startNavDrag);
        navTrack.addEventListener('touchstart', startNavDrag, {passive: false});

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (didNavMove) {
                    e.preventDefault();
                    return;
                }
                
                let targetAttr = link.getAttribute('href');
                let absoluteUrl = link.href; 
                
                // HAPTIC: A crisp 15ms pulse when tapping any nav link
                triggerHaptic(15);
                
                if (targetAttr === currentPath) {
                    e.preventDefault();
                    updateNavIndicator(link);
                } else {
                    e.preventDefault();
                    updateNavIndicator(link);
                    cinematicNavigate(absoluteUrl); 
                }
            });
        });

        window.addEventListener('resize', () => updateNavIndicator(activeLink));
    }
    
    // ==========================================
    // 5. GLOBAL BUTTON HAPTICS
    // ==========================================
    // Adds a heavier physical click to all major buttons across the site
    const allButtons = document.querySelectorAll('.btn, .submit-btn, .glass-btn');
    allButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic(25); // Slightly heavier 25ms buzz for main buttons
        });
    });

});

// ==========================================
// 6. LENIS SMOOTH SCROLLING & GSAP REVEALS
// ==========================================
if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(element => {
        gsap.fromTo(element, 
            { opacity: 0, y: 30 },
            {
                opacity: 1, 
                y: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
}
