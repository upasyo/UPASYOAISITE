import React, { useEffect, useRef } from "react";

interface NeuralBackgroundProps {
  isDarkMode?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

export default function NeuralBackground({ isDarkMode = false }: NeuralBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width;
      canvas.height = height;

      // Re-populate particles proportional to screen size safely
      const density = Math.min(60, Math.floor((width * height) / 18000));
      particles = [];
      for (let i = 0; i < density; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1,
          alpha: Math.random() * 0.5 + 0.3
        });
      }
    };

    // Use ResizeObserver as specified in guidelines
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(container);

    resizeCanvas();

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Node and line settings depend on theme
      const nodeColor = isDarkMode ? "251, 207, 232" : "100, 116, 139"; // Pink dark, Slate light
      const lineColor = isDarkMode ? "251, 207, 232" : "148, 163, 184";

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];

        // Move
        pi.x += pi.vx;
        pi.y += pi.vy;

        // Bounce
        if (pi.x < 0 || pi.x > width) pi.vx *= -1;
        if (pi.y < 0 || pi.y > height) pi.vy *= -1;

        // Mouse influence
        const dxMouse = pi.x - mouseRef.current.x;
        const dyMouse = pi.y - mouseRef.current.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 120) {
          pi.x += (dxMouse / distMouse) * 0.6;
          pi.y += (dyMouse / distMouse) * 0.6;
        }

        // Draw particle node
        ctx.fillStyle = `rgba(${nodeColor}, ${pi.alpha})`;
        ctx.beginPath();
        ctx.arc(pi.x, pi.y, pi.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect with other particles within range
        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const alphaLine = (1 - dist / 100) * 0.14;
            ctx.strokeStyle = `rgba(${lineColor}, ${alphaLine})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }
      }

      requestRef.current = requestAnimationFrame(draw);
    };

    requestRef.current = requestAnimationFrame(draw);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isDarkMode]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10 w-full h-full overflow-hidden opacity-45 select-none"
      id="neural-background"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
