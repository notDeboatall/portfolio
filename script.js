        document.addEventListener('DOMContentLoaded', () => {
            const frameCount = 240;
            const images = [];
            let loadedCount = 0;
            
            const percentageElement = document.getElementById('load-percentage');
            const loadBar = document.getElementById('load-bar');
            const preloader = document.getElementById('preloader');
            
            // Canvas elements
            const canvas = document.getElementById('hero-canvas');
            const ctx = canvas.getContext('2d');
            const overlay = document.getElementById('canvas-overlay');
            const scrollContainer = document.getElementById('hero-scroll-container');
            
            // Hero Text Elements which move / fade
            const badge = document.getElementById('hero-text-badge');
            const name = document.getElementById('hero-text-name');
            const title = document.getElementById('hero-text-title');
            const cta = document.getElementById('hero-text-cta');

            // Format standard 3 digit zero-padded numbers
            const pad = (num) => String(num).padStart(3, '0');

            // Resize Canvas to fit screen bounding box
            function resizeCanvas() {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
                if (images[0]) {
                    drawFrameToCanvas(currentFrameIndex());
                }
            }
            window.addEventListener('resize', resizeCanvas);
            
            // Start Loading Image Sequence
            for (let i = 1; i <= frameCount; i++) {
                const img = new Image();
                img.src = `assets/frames/ezgif-frame-${pad(i)}.jpg`;
                img.onload = () => {
                    loadedCount++;
                    const progressVal = Math.round((loadedCount / frameCount) * 100);
                    
                    // Update HUD percentage loader
                    percentageElement.textContent = String(progressVal).padStart(2, '0');
                    loadBar.style.width = `${progressVal}%`;
                    
                    if (loadedCount === frameCount) {
                        onAllFramesLoaded();
                    }
                };
                img.onerror = () => {
                    // Fail-safe count updates
                    loadedCount++;
                    if (loadedCount === frameCount) {
                        onAllFramesLoaded();
                    }
                };
                images.push(img);
            }

            function onAllFramesLoaded() {
                // Initialize sizing
                resizeCanvas();
                
                // Hide Preloader Overlay and unlock page scroll
                setTimeout(() => {
                    preloader.style.opacity = '0';
                    setTimeout(() => {
                        preloader.classList.add('hidden');
                        document.body.classList.remove('loading');
                        // Initial draw
                        updateScrollSequencing();
                    }, 1000);
                }, 500);
            }

            // Obtain active scroll index
            function currentFrameIndex() {
                const rect = scrollContainer.getBoundingClientRect();
                const scrollTop = -rect.top;
                const scrollHeight = rect.height - window.innerHeight;
                let progress = scrollTop / scrollHeight;
                progress = Math.max(0, Math.min(1, progress));
                // Returns 1 - 240
                return Math.floor(progress * (frameCount - 1)) + 1;
            }

            // Draw a specific frame using responsive cover logic
            function drawFrameToCanvas(index) {
                const img = images[index - 1];
                if (!img || !img.complete) return;
                
                const canvasAspect = canvas.width / canvas.height;
                const imgAspect = img.width / img.height;
                
                let drawWidth, drawHeight, x, y;
                
                if (canvasAspect > imgAspect) {
                    drawWidth = canvas.width;
                    drawHeight = canvas.width / imgAspect;
                    x = 0;
                    y = (canvas.height - drawHeight) / 2;
                } else {
                    drawWidth = canvas.height * imgAspect;
                    drawHeight = canvas.height;
                    x = (canvas.width - drawWidth) / 2;
                    y = 0;
                }
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, x, y, drawWidth, drawHeight);
            }

            // Update UI/CSS Styles corresponding to scroll position
            function updateScrollSequencing() {
                const rect = scrollContainer.getBoundingClientRect();
                const scrollTop = -rect.top;
                const scrollHeight = rect.height - window.innerHeight;
                let progress = scrollTop / scrollHeight;
                progress = Math.max(0, Math.min(1, progress));
                
                // 1. Draw Frame
                const frameIndex = Math.floor(progress * (frameCount - 1)) + 1;
                drawFrameToCanvas(frameIndex);
                
                // 2. Camera effect: Subtle GPU zoom-in scale and pan on canvas
                const scale = 1.0 + (progress * 0.06); // scale from 1.0 to 1.06
                const panY = -progress * 25;           // pan slightly up
                canvas.style.transform = `scale(${scale}) translateY(${panY}px)`;
                
                // 3. Dark Overlay opacity transition
                // Starts at 0.85 opacity (Frame 1), drops to 0.45 around mid-scroll (0.5), locks at 0.4 at end
                let overlayOpacity = 0.85 - (progress * 0.45);
                overlay.style.opacity = Math.max(0.35, overlayOpacity);
                
                // 4. Interpolate text reveals (Apple-like states)
                // --- Segment 1: Computer Science Student Badge ---
                // Fades in at 0.15, fully visible by 0.35, fades slightly as name arrives? Or stays.
                let badgeProgress = (progress - 0.1) / 0.15; // length factor
                let badgeOpacity = Math.max(0, Math.min(1, badgeProgress));
                let badgeY = 20 * (1 - badgeOpacity);
                badge.style.opacity = badgeOpacity;
                badge.style.transform = `translateY(${badgeY}px)`;
                
                // --- Segment 2: Debo Jeet Name ---
                // Fades in around 0.35, fully visible by 0.55
                let nameProgress = (progress - 0.3) / 0.15;
                let nameOpacity = Math.max(0, Math.min(1, nameProgress));
                let nameY = 20 * (1 - nameOpacity);
                name.style.opacity = nameOpacity;
                name.style.transform = `translateY(${nameY}px)`;
                
                // --- Segment 3: Subtitle ---
                // Fades in around 0.5, fully visible by 0.7
                let titleProgress = (progress - 0.45) / 0.15;
                let titleOpacity = Math.max(0, Math.min(1, titleProgress));
                let titleY = 20 * (1 - titleOpacity);
                title.style.opacity = titleOpacity;
                title.style.transform = `translateY(${titleY}px)`;
                
                // --- Segment 4: CTA Buttons ---
                // Fades in around 0.7, fully visible by 0.95
                let ctaProgress = (progress - 0.65) / 0.2;
                let ctaOpacity = Math.max(0, Math.min(1, ctaProgress));
                let ctaY = 20 * (1 - ctaOpacity);
                cta.style.opacity = ctaOpacity;
                cta.style.transform = `translateY(${ctaY}px)`;
                
                // Hide scroll hint when user starts scrolling
                const hint = document.getElementById('scroll-hint');
                if (progress > 0.05) {
                    hint.style.opacity = '0';
                } else {
                    hint.style.opacity = '1';
                }
            }

            // Bind Scroll Events
            let requestActive = false;
            window.addEventListener('scroll', () => {
                if (!requestActive && loadedCount === frameCount) {
                    requestActive = true;
                    requestAnimationFrame(() => {
                        updateScrollSequencing();
                        requestActive = false;
                    });
                }
            });

            // Intersection Observer representing scroll-driven layouts reveals (About, Skills, Projects, Trajectory)
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: "0px 0px -100px 0px"
            });
            
            document.querySelectorAll('.reveal-element').forEach(element => {
                revealObserver.observe(element);
            });
        });
