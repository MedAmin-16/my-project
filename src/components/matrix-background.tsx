import React, { useEffect, useRef } from "react";

interface Drop {
  x: number;
  y: number;
  speed: number;
  value: string;
  fontSize: number;
  opacity: number;
}

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const characters = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデド";
    const drops: Drop[] = [];
    const columnWidth = 20;
    
    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const columns = Math.floor(canvas.width / columnWidth);
      
      // Clear existing drops
      drops.length = 0;
      
      // Create a drop for each column
      for (let i = 0; i < columns; i++) {
        drops.push({
          x: i * columnWidth,
          y: Math.random() * canvas.height,
          speed: 0.5 + Math.random() * 2.5,
          value: characters.charAt(Math.floor(Math.random() * characters.length)),
          fontSize: 12 + Math.random() * 4,
          opacity: 0.5 + Math.random() * 0.5
        });
      }
    };
    
    const draw = () => {
      // Semi-transparent black layer to create trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw each drop
      for (const drop of drops) {
        // Change character randomly
        if (Math.random() > 0.975) {
          drop.value = characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        // Set the style for characters
        ctx.font = `${drop.fontSize}px monospace`;
        ctx.fillStyle = `rgba(0, 255, 70, ${drop.opacity})`;
        
        // Draw the character
        ctx.fillText(drop.value, drop.x, drop.y);
        
        // Move the drop
        drop.y += drop.speed;
        
        // Reset the drop when it goes off screen
        if (drop.y > canvas.height) {
          drop.y = 0;
          drop.x = Math.floor(Math.random() * canvas.width);
          drop.speed = 0.5 + Math.random() * 2.5;
        }
      }
      
      requestAnimationFrame(draw);
    };
    
    // Handle resize
    window.addEventListener("resize", initCanvas);
    
    // Initialize canvas and start animation
    initCanvas();
    draw();
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", initCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-20"
      aria-hidden="true"
    />
  );
}