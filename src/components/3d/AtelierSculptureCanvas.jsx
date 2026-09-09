import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function AtelierSculptureCanvas({ isInteractive = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const isWebGLAvailable = Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      if (!isWebGLAvailable) return;
    } catch {
      return;
    }

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Luxury Sculptural Geometry: Interlocking Atelier Torus Knot
    // Low vertex count (< 3,500 vertices) for 60 FPS performance
    const knotGeometry = new THREE.TorusKnotGeometry(2.0, 0.52, 84, 16, 2, 3);
    const knotMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4b996, // Brushed champagne gold
      roughness: 0.28,
      metalness: 0.85,
    });
    const knotMesh = new THREE.Mesh(knotGeometry, knotMaterial);
    scene.add(knotMesh);

    // Inner Obsidian Facet Core
    const coreGeometry = new THREE.IcosahedronGeometry(0.9, 0);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x161618,
      roughness: 0.15,
      metalness: 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // 5. Lighting Setup (Champagne & Obsidian contrast)
    const ambientLight = new THREE.AmbientLight(0xf7f5f0, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.4);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc5a880, 1.2);
    fillLight.position.set(-6, -4, -4);
    scene.add(fillLight);

    const pointLight = new THREE.PointLight(0xc5a880, 0.8, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // 6. Interaction & Motion Tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let isVisible = true;
    let animationFrameId = null;

    const handleMouseMove = (e) => {
      if (!isInteractive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.45;
      targetRotX = -y * 0.45;
    };

    if (isInteractive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // 7. Render Loop with Inertia Damping
    const startTime = performance.now();

    const animate = () => {
      if (!isVisible) return;

      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Gentle continuous ambient drift
      knotMesh.rotation.y += 0.005;
      knotMesh.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15;
      coreMesh.rotation.y -= 0.007;
      coreMesh.rotation.z += 0.004;

      // Mouse responsive tilt
      knotMesh.rotation.y += (targetRotY - knotMesh.rotation.y * 0.1) * 0.04;
      knotMesh.rotation.x += (targetRotX - knotMesh.rotation.x * 0.1) * 0.04;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    // 8. IntersectionObserver to pause loop when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (!animationFrameId) {
            animate();
          }
        } else {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    animate();

    // 10. Cleanup & Disposal
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      if (isInteractive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      knotGeometry.dispose();
      knotMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();

      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [isInteractive]);

  return <div ref={containerRef} className="w-full h-full min-h-[320px] flex items-center justify-center relative cursor-grab active:cursor-grabbing" />;
}
