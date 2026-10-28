gsap.registerPlugin(ScrollTrigger);

// Force scroll to top on reload
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const canvas = document.getElementById('sequence-canvas');
const context = canvas.getContext('2d');

const frameCount = 240;
const currentFrame = (index) => (
    `sequence/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

const images = [];
const airbnb = {
    frame: 0
};

// Preload images
let imagesLoaded = 0;
const loaderProgress = document.querySelector('.progress-bar');
const loaderText = document.querySelector('.progress-text');

function preloadImages() {
    // Initialize image array
    for (let i = 0; i < frameCount; i++) {
        images[i] = new Image();
    }

    // Load the first frame immediately to unblock the UI
    images[0].onload = () => {
        imagesLoaded++;
        
        // Fast-forward the loader animation smoothly
        gsap.to(loaderProgress, { width: `100%`, duration: 0.4, ease: "power2.out" });
        gsap.to(".car-container", { left: `100%`, duration: 0.4, ease: "power2.out" });
        
        // Animate percentage text
        let progressObj = { val: 0 };
        gsap.to(progressObj, {
            val: 100,
            duration: 0.4,
            ease: "power2.out",
            onUpdate: () => {
                loaderText.innerText = `${Math.round(progressObj.val)}%`;
            },
            onComplete: () => {
                initScrollSequence();
                startIntroAnimation();
                loadRemainingImages();
            }
        });
    };
    images[0].src = currentFrame(0);
}

function loadRemainingImages() {
    // Load remaining images in the background
    for (let i = 1; i < frameCount; i++) {
        images[i].onload = () => {
            imagesLoaded++;
            // Force a render if this is the current frame the user is waiting for
            if (airbnb.frame === i) render();
        };
        images[i].src = currentFrame(i);
    }
}

function initScrollSequence() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const heroScrollLength = "+=300%";

    const heroSequenceTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#hero-pin-container",
            pin: true,
            start: "top top",
            end: heroScrollLength, /* 3 screens of scrolling for the sequence and transition */
            scrub: 1,
        }
    });

    heroSequenceTl.to(airbnb, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        duration: 4.1,
        onUpdate: render
    }).to({}, {
        duration: 0.9
    });

    // Fade the canvas at the end to transition cleanly into the typography section.
    gsap.to('.canvas-container', {
        opacity: 0,
        scrollTrigger: {
            trigger: "#hero-pin-container",
            start: "95% top",
            end: "bottom top",
            scrub: true
        }
    });

    // IMMEDIATELY move hero content UP when scroll starts
    gsap.to(['.hero-content', '.bottom-info', '.scroll-hint', 'nav'], {
        opacity: 0,
        y: -100,
        scrollTrigger: {
            trigger: "#hero-pin-container",
            start: "top top", // Start as soon as user scrolls
            end: "15% top",  // Finish quickly (within first 15% of scroll)
            scrub: 1
        }
    });

    // Section Progress Indicator Logic

    initEditorialReveal();
    initGallerySequence();
    initSpecsHorizontal();
    ScrollTrigger.refresh();

    render(); // First frame is already loaded, render immediately

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        render();
    });
}

function initEditorialReveal() {
    const section = document.querySelector('#about-editorial');
    const copy = document.querySelector('.editorial-copy');
    const lines = gsap.utils.toArray('.copy-line');

    if (!section || !copy || !lines.length) {
        return;
    }

    gsap.set(lines, {
        color: '#c7c7c3',
        opacity: 0.58,
        y: 10,
        filter: 'blur(0.45px)'
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: `+=${lines.length * 115}%`,
            pin: true,
            scrub: 1.45,
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });

    tl.to(section, {
        opacity: 1,
        duration: 0.35,
        ease: 'power1.out'
    }, 0);

    tl.to(copy, {
        y: -22,
        ease: 'none',
        duration: lines.length + 0.8
    }, 0.1);

    lines.forEach((line, index) => {
        tl.to(line, {
            color: '#050505',
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.18,
            ease: 'power2.inOut'
        }, 0.45 + index * 0.9);
    });

    tl.to({}, {
        duration: 0.45
    });
}

function render() {
    const img = images[airbnb.frame];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Maintain aspect ratio cover
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;

    context.drawImage(img, x, y, img.width * scale, img.height * scale);
}

function startIntroAnimation() {
    const tl = gsap.timeline();

    tl.to(".logo-text", {
        opacity: 1,
        y: 0,
        duration: 0.4,
        delay: 0.1
    })
        .to("#loader", {
            opacity: 0,
            duration: 0.5,
            delay: 0.2,
            onComplete: () => {
                document.getElementById("loader").style.display = "none";
            }
        })
        .from("nav", {
            y: -50,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out"
        }, "-=0.3")
        .to(".eyebrow", {
            opacity: 1,
            duration: 0.5
        }, "-=0.4")
        .to("h1", {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power3.out"
        }, "-=0.4")
        .to(".cta-group", {
            opacity: 1,
            duration: 0.5
        }, "-=0.5")
        .to(".bottom-info", {
            opacity: 1,
            duration: 0.5
        }, "-=0.4")
        .to(".scroll-hint", {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
        }, "-=0.4")
        .from("#scroll-indicator", {
            x: 50,
            opacity: 0,
            duration: 0.6
        }, "-=0.6");
}



// Custom Cursor Logic
const cursor = document.querySelector('.custom-cursor');
const wheel = document.querySelector('.cursor-wheel');

let lastX = window.innerWidth / 2;
let lastY = window.innerHeight / 2;
let rotationAngle = 0;

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Follow the mouse with a slight high-performance dampening lag
    gsap.to(cursor, {
        x: posX,
        y: posY,
        duration: 0.06,
        ease: "power2.out"
    });

    // Calculate movement difference on horizontal axis
    const dx = posX - lastX;

    // Accumulate rotation angle (dx * 2.2 degrees simulates physical rolling)
    rotationAngle += dx * 2.2;

    // Rotate the wheel SVG
    gsap.to(wheel, {
        rotation: rotationAngle,
        duration: 0.25,
        ease: "power1.out"
    });

    lastX = posX;
    lastY = posY;
});

// Hover effect on interactive elements (Simulating Brake Calliper Heating)
function initCursorHovers() {
    const interactives = document.querySelectorAll('a, button, [role="button"], .social-icon, .menu-icon');
    interactives.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
}

initCursorHovers();

function initGallerySequence() {
    const container = document.querySelector('#gallery-pin-container');
    const wrapper = document.querySelector('.gallery-wrapper');
    const grid = document.querySelector('.gallery-grid');
    const items = gsap.utils.toArray('.gallery-item');
    const centerHero = document.querySelector('.center-hero');
    const centerImg = centerHero.querySelector('img');
    const overlay = document.querySelector('.gallery-content-overlay');
    const label = document.querySelector('.content-label');
    const headingLines = gsap.utils.toArray('.heading-line');
    const description = document.querySelector('.content-description');

    if (!container || !wrapper || !grid || !centerHero) return;

    // 1. Initial State for all items
    gsap.set(items, { transformOrigin: "center center" });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "+=400%",
            pin: true,
            scrub: 1,
            anticipatePin: 1
        }
    });

    // 2. The Great Expansion
    items.forEach((item, i) => {
        if (item === centerHero) {
            // Expand center hero to fill screen
            tl.to(item, {
                scale: 3, // Zoom in heavily
                z: 500,
                duration: 2,
                ease: "power2.inOut"
            }, 0);
        } else {
            // Move others away from center
            const rect = item.getBoundingClientRect();
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const angle = Math.atan2(rect.top + rect.height/2 - centerY, rect.left + rect.width/2 - centerX);
            const dist = 1000;

            tl.to(item, {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                scale: 0.2,
                opacity: 0,
                duration: 1.5,
                ease: "power2.in"
            }, 0);
        }
    });

    // 3. Reveal Content
    tl.to(overlay, {
        opacity: 1,
        y: 0,
        duration: 1
    }, 1.5);

    // 4. Content Reveal
    tl.to(overlay, {
        opacity: 1,
        duration: 1
    }, 2.5);

    tl.to(label, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
    }, 2.8);

    tl.to(headingLines, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: "power3.out"
    }, 3.0);

    tl.to(description, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
    }, 3.5);

    // Final immersion pause
    tl.to({}, { duration: 1 });
}

function initSpecsHorizontal() {
    const section = document.querySelector('#specs-horizontal');
    const track = document.querySelector('.specs-track');
    const bgNums = gsap.utils.toArray('.spec-bg-num');
    
    if (!section || !track) return;

    let proxy = { skew: 0 };
    let skewSetter = gsap.quickSetter(track, "skewX", "deg");
    let clamp = gsap.utils.clamp(-10, 10);

    gsap.delayedCall(0.1, () => {
        const trackWidth = track.scrollWidth;
        const scrollAmount = trackWidth - window.innerWidth;

        gsap.to(track, {
            x: -scrollAmount,
            ease: "none",
            scrollTrigger: {
                trigger: section,
                start: "top top",
                end: () => `+=${trackWidth}`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    let skew = clamp(self.getVelocity() / -300);
                    if (Math.abs(skew) > Math.abs(proxy.skew)) {
                        proxy.skew = skew;
                        gsap.to(proxy, {
                            skew: 0,
                            duration: 0.8,
                            ease: "power3",
                            overwrite: true,
                            onUpdate: () => skewSetter(proxy.skew)
                        });
                    }
                }
            }
        });

        // Parallax background numbers
        bgNums.forEach((num, i) => {
            gsap.to(num, {
                x: 150,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    containerAnimation: gsap.getById("specsScroll"), // Need to ID the main tween
                    start: "top top",
                    end: () => `+=${trackWidth}`,
                    scrub: true
                }
            });
        });
        // Actually, simple parallax relative to track movement is better
        gsap.to('.spec-bg-num', {
            x: -100,
            stagger: 0.05,
            ease: "none",
            scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    // Staggered reveal for technical cards
    gsap.from('.spec-card', {
        y: 80,
        opacity: 0,
        rotationX: -15,
        stagger: 0.2,
        duration: 1.5,
        ease: "power4.out",
        scrollTrigger: {
            trigger: section,
            start: "top 80%",
        }
    });
}

preloadImages();
