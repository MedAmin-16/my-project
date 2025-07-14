import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface MatrixBackgroundProps {
  className?: string;
}

export function MatrixBackground({ className }: MatrixBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    // Clean up any existing columns before creating new ones
    container.innerHTML = '';
    
    // Create matrix columns
    const createMatrixAnimation = () => {
      const width = window.innerWidth;
      const numberOfColumns = Math.floor(width / 20);
      
      for (let i = 0; i < numberOfColumns; i++) {
        const column = document.createElement('div');
        column.className = 'matrix-code fixed font-mono text-sm text-matrix/70 pointer-events-none z-0 animate-matrix-fall';
        column.style.left = `${i * 20}px`;
        column.style.animationDelay = `${Math.random() * 5}s`;
        column.style.opacity = `${Math.random() * 0.5 + 0.1}`;
        column.textContent = generateRandomCharacters();
        container.appendChild(column);
      }
    };
    
    // Generate random matrix-style characters
    const generateRandomCharacters = () => {
      const characters = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,./<>?';
      let result = '';
      const length = Math.floor(Math.random() * 10) + 15;
      
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      return result;
    };
    
    // Create initial animation
    createMatrixAnimation();
    
    // Recreate on window resize
    const handleResize = () => {
      container.innerHTML = '';
      createMatrixAnimation();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={cn("fixed top-0 left-0 w-full h-full z-0", className)}
      aria-hidden="true"
    />
  );
}
