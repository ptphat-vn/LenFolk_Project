'use client';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface FairyDustCursorProps {
  colors?: string[];
  element?: HTMLElement;
  characterSet?: string[];
  particleSize?: number;
  particleCount?: number;
  gravity?: number;
  fadeSpeed?: number;
  initialVelocity?: {
    min: number;
    max: number;
  };
}

interface Particle {
  x: number;
  y: number;
  character: string;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  lifeSpan: number;
  initialLifeSpan: number;
  scale: number;
}

export const FairyDustCursor: React.FC<FairyDustCursorProps> = ({
  colors = ['#02420794', '#095323ff', '#010506ff'],
  element,
  characterSet = ['♩', '♫', '♬', '♪'],
  particleSize = 21,
  particleCount = 1,
  gravity = 0.02,
  fadeSpeed = 0.98,
  initialVelocity = { min: 0.5, max: 1.5 },
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const cursorRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });
  const [mounted, setMounted] = useState(false);

  const [isFinePointer, setIsFinePointer] = useState(false);

  useLayoutEffect(() => {
    const pointerQuery = window.matchMedia(
      '(hover: hover) and (pointer: fine)',
    );
    const applyPointer = () => setIsFinePointer(pointerQuery.matches);
    applyPointer();
    pointerQuery.addEventListener('change', applyPointer);

    const updateCanvasSize = () => {
      const newWidth = element ? element.clientWidth : window.innerWidth;
      const newHeight = element ? element.clientHeight : window.innerHeight;

      setCanvasSize({ width: newWidth, height: newHeight });
    };

    updateCanvasSize();
    setMounted(true);
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      pointerQuery.removeEventListener('change', applyPointer);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [element]);

  useEffect(() => {
    if (!isFinePointer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const targetElement = element || document.body;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Animation frame setup
    let animationFrameId: number;

    const createParticle = (x: number, y: number): Particle => {
      const randomChar =
        characterSet[Math.floor(Math.random() * characterSet.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const velocityX =
        (Math.random() < 0.5 ? -1 : 1) *
        (Math.random() * (initialVelocity.max - initialVelocity.min) +
          initialVelocity.min);
      const velocityY = -(Math.random() * initialVelocity.max);

      return {
        x,
        y,
        character: randomChar,
        color: randomColor,
        velocity: { x: velocityX, y: velocityY },
        lifeSpan: 100,
        initialLifeSpan: 100,
        scale: 1,
      };
    };

    const updateParticles = () => {
      if (!context) return;
      context.clearRect(0, 0, canvasSize.width, canvasSize.height);

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;

        // Apply gravity
        particle.velocity.y += gravity;

        // Update lifespan and scale
        particle.lifeSpan *= fadeSpeed;
        particle.scale = Math.max(
          particle.lifeSpan / particle.initialLifeSpan,
          0,
        );

        // Draw particle
        context.save();
        context.font = `${particleSize * particle.scale}px serif`;
        context.fillStyle = particle.color;
        context.globalAlpha = particle.scale;
        context.fillText(particle.character, particle.x, particle.y);
        context.restore();
      });

      // Remove dead particles
      particlesRef.current = particlesRef.current.filter(
        (particle) => particle.lifeSpan > 0.1,
      );
    };

    const animate = () => {
      updateParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element ? targetElement.getBoundingClientRect() : undefined;
      const x = element ? e.clientX - rect!.left : e.clientX;
      const y = element ? e.clientY - rect!.top : e.clientY;

      cursorRef.current = { x, y };

      const distance = Math.hypot(
        cursorRef.current.x - lastPosRef.current.x,
        cursorRef.current.y - lastPosRef.current.y,
      );

      if (distance > 2) {
        for (let i = 0; i < particleCount; i++) {
          particlesRef.current.push(
            createParticle(cursorRef.current.x, cursorRef.current.y),
          );
        }
        lastPosRef.current = { ...cursorRef.current };
      }
    };

    targetElement.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      targetElement.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isFinePointer,
    colors,
    element,
    characterSet,
    particleSize,
    particleCount,
    gravity,
    fadeSpeed,
    initialVelocity,
    canvasSize,
  ]);

  if (!mounted || !isFinePointer) return null;

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      style={{
        position: element ? 'absolute' : 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default FairyDustCursor;
