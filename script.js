document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Canvas logic for the "Aleph" background
    const canvas = document.getElementById('aleph-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    // The "Aleph" point - the convergence center
    let center = { x: 0, y: 0 };
    
    // Mouse tracking for subtle interaction
    let mouse = { x: -1000, y: -1000 };
    let isMouseActive = false;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        center.x = width / 2;
        // Position the aleph point slightly higher than center
        center.y = height * 0.4;
    }

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        isMouseActive = true;
    });

    window.addEventListener('mouseout', () => {
        isMouseActive = false;
        mouse.x = -1000;
        mouse.y = -1000;
    });

    class Particle {
        constructor() {
            this.reset();
            // Stagger start positions so they don't all spawn at the center at once
            this.t = Math.random() * Math.PI * 2;
            this.radius = Math.random() * 200 + 50; 
        }

        reset() {
            // Start at the aleph point
            this.x = center.x;
            this.y = center.y;
            
            // Random angle to shoot out
            this.angle = Math.random() * Math.PI * 2;
            // The speed controls how fast it expands or contracts
            this.speed = Math.random() * 0.5 + 0.1;
            
            // Current distance from center
            this.dist = 0;
            // Max distance before it respawns/fades
            this.maxDist = Math.max(width, height) * 0.8;
            
            this.size = Math.random() * 1.5 + 0.5;
            // Opacity function of distance (fades out as it moves away)
            this.baseAlpha = Math.random() * 0.5 + 0.1;
        }

        update() {
            // Slowly increase distance from center (simulating the "infinite expansion" from a single point)
            this.dist += this.speed;
            
            // Interaction: if mouse is near, slightly perturb the angle
            if (isMouseActive) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distToMouse = Math.sqrt(dx * dx + dy * dy);
                if (distToMouse < 150) {
                    // Gravitate very slightly towards mouse
                    this.angle += (Math.atan2(dy, dx) - this.angle) * 0.01;
                }
            }

            // Calculate x and y based on orbit/expansion
            this.x = center.x + Math.cos(this.angle) * this.dist;
            this.y = center.y + Math.sin(this.angle) * this.dist;

            // Slowly rotate the entire system
            this.angle += 0.001;

            if (this.dist > this.maxDist) {
                this.reset();
            }
        }

        draw() {
            // Fade out as it reaches max distance
            let alpha = this.baseAlpha * (1 - (this.dist / this.maxDist));
            
            // Brighten near center to make the "Aleph" glow
            if (this.dist < 100) {
                alpha += (100 - this.dist) / 100 * 0.5;
            }

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Number of particles - keeping it minimal
    const particleCount = 200;
    for (let i = 0; i < particleCount; i++) {
        // distribute them randomly initially so they aren't all concentrated at the start
        let p = new Particle();
        p.dist = Math.random() * p.maxDist;
        particles.push(p);
    }

    function animate() {
        // Trail effect by drawing a semi-transparent black rectangle
        ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
        ctx.fillRect(0, 0, width, height);

        // Draw the central "Aleph" point glow
        const glowRadius = isMouseActive ? 30 : 20;
        const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, glowRadius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(5, 5, 5, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(center.x, center.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
});
