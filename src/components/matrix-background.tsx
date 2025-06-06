import React, { useEffect, useRef } from 'react';

interface Drop {
  x: number;
  y: number;
  speed: number;
  value: string;
  fontSize: number;
  opacity: number;
}

interface MatrixBackgroundProps {
  className?: string;
}

export default function MatrixBackground({ className = '' }: MatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match window
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Matrix character set
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz[]/\\+-*=<>:;(){}';
    
    // Create drops
    const drops: Drop[] = [];
    const dropCount = Math.floor(canvas.width / 20); // Adjust drop density
    
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 1 + Math.random() * 3,
        value: chars.charAt(Math.floor(Math.random() * chars.length)),
        fontSize: 10 + Math.random() * 14,
        opacity: 0.1 + Math.random() * 0.9
      });
    }
    
    // Animation loop
    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw characters
      drops.forEach(drop => {
        // Set font and color
        ctx.font = `${drop.fontSize}px monospace`;
        ctx.fillStyle = `rgba(14, 232, 109, ${drop.opacity})`;
        
        // Draw the character
        ctx.fillText(drop.value, drop.x, drop.y);
        
        // Move the drop
        drop.y += drop.speed;
        
        // Reset drop if it goes offscreen
        if (drop.y > canvas.height) {
          drop.y = 0;
          drop.x = Math.random() * canvas.width;
          drop.value = chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Occasionally change character
        if (Math.random() > 0.95) {
          drop.value = chars.charAt(Math.floor(Math.random() * chars.length));
        }
      });
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    const animationRef = { current: 0 };
    animationRef.current = requestAnimationFrame(draw);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  return <canvas ref={canvasRef} className={`matrix-canvas ${className}`} />;
}