'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

type HeroCanvasProps = {
  className?: string;
};

// Lightweight particles field with gentle motion
export function HeroCanvas({ className }: HeroCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b1022, 0.035);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0); // transparent
    mount.appendChild(renderer.domElement);

    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const r = 2.8 + Math.random() * 1.8;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 2.0;
      positions[i3 + 0] = Math.cos(angle) * r;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(angle) * r;
      scales[i] = Math.random() * 1.25 + 0.25;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color('#7c3aed'), // purple-600
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // subtle gradient plane at the bottom
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#0ea5e9'), // sky-500
        transparent: true,
        opacity: 0.06,
      })
    );
    plane.position.z = -4;
    plane.position.y = -3;
    scene.add(plane);

    const resize = () => {
      if (!mount) return;
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      const t = clock.getElapsedTime();
      points.rotation.y = t * 0.02;
      points.rotation.x = Math.sin(t * 0.2) * 0.06;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    // entry animation
    gsap.from(camera.position, { z: 9, duration: 1.4, ease: 'power2.out' });
    gsap.from(points.position, { y: 0.6, duration: 1.6, ease: 'power2.out' });

    // parallax mouse move
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * -2;
      gsap.to(camera.position, { x: x * 0.6, y: y * 0.4, duration: 0.6, ease: 'power3.out' });
    };
    window.addEventListener('mousemove', onMove);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
      geometry.dispose();
      material.dispose();
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className={className ?? 'absolute inset-0'} />;
}

