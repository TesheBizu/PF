import { useEffect, useRef } from 'react';
import './SpiderWeb.css';

const PARTICLE_COUNT = 80;
const CONNECTION_DISTANCE = 140;
const MOUSE_RADIUS = 160;

function SpiderWeb() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    const mouse = { x: null, y: null };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Mouse repulsion
        if (mouse.x !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS) {
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            this.x += (dx / dist) * force * 2.5;
            this.y += (dy / dist) * force * 2.5;
          }
        }
      }

      draw() {
        // Get the CSS variable color
        const dotColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--web-dot-color')
          .trim();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = dotColor;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      }
    }

    const init = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    };

    const drawLines = () => {
      const dotColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--web-dot-color')
        .trim();

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.4;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            // Premium linear gradient lines between nodes
            const grad = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
            grad.addColorStop(0, `rgba(99, 102, 241, ${alpha})`);
            grad.addColorStop(1, `rgba(6, 182, 212, ${alpha})`);
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        // Lines to mouse
        if (mouse.x !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS * 1.2) {
            const alpha = (1 - dist / (MOUSE_RADIUS * 1.2)) * 0.55;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            
            const grad = ctx.createLinearGradient(particles[i].x, particles[i].y, mouse.x, mouse.y);
            grad.addColorStop(0, `rgba(99, 102, 241, ${alpha})`);
            grad.addColorStop(1, `rgba(6, 182, 212, ${alpha})`);
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawLines();
      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    resize();
    init();
    animate();

    window.addEventListener('resize', () => {
      resize();
      init();
    });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="spider-web-canvas" aria-hidden="true" />;
}

export default SpiderWeb;
