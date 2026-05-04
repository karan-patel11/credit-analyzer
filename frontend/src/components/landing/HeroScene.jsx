import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const hasWebGL = (() => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
})();

const HeroScene = () => {
  const mountRef = useRef(null);
  const [useFallback, setUseFallback] = useState(!hasWebGL);

  useEffect(() => {
    if (useFallback) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B1120');

    // CAMERA
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth * 0.45 / window.innerHeight, 0.1, 100);
    camera.position.z = 8;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // Handle resizing later
    const updateSize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for perf
    mountRef.current.appendChild(renderer.domElement);

    // MATERIALS
    const merchantMat = new THREE.MeshStandardMaterial({ 
      color: 0x2563EB, 
      roughness: 0.2, 
      metalness: 0.8 
    });
    
    const consumerMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x94A3B8,
      transmission: 0.9,
      opacity: 1,
      metalness: 0,
      roughness: 0.1,
      ior: 1.5,
      thickness: 0.1,
      transparent: true
    });

    const centralMat = new THREE.MeshStandardMaterial({ 
      color: 0x8B5CF6,
      emissive: 0x2563EB,
      emissiveIntensity: 0.5,
      roughness: 0.1,
      metalness: 0.8
    });

    // GEOMETRIES
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);

    // CENTRAL NODE (KAPS AI)
    const centerNode = new THREE.Mesh(sphereGeo, centralMat);
    centerNode.scale.set(0.5, 0.5, 0.5);
    scene.add(centerNode);

    // RINGS AROUND CENTER
    const ringGeo1 = new THREE.RingGeometry(0.7, 0.72, 64);
    const ringGeo2 = new THREE.RingGeometry(1.0, 1.02, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x2563EB, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat);
    scene.add(ring1);
    scene.add(ring2);

    // NODES
    const merchants = [];
    const consumers = [];
    const nodes = [];

    const numMerchants = 15;
    for (let i = 0; i < numMerchants; i++) {
      const mesh = new THREE.Mesh(sphereGeo, merchantMat);
      mesh.scale.set(0.3, 0.3, 0.3);
      // Random position around center
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 2 + Math.random() * 3;
      mesh.position.setFromSphericalCoords(r, phi, theta);
      
      scene.add(mesh);
      merchants.push({ mesh, targetScale: 0.3 });
      nodes.push(mesh);
    }

    const numConsumers = 25;
    for (let i = 0; i < numConsumers; i++) {
      const mesh = new THREE.Mesh(sphereGeo, consumerMat);
      mesh.scale.set(0.15, 0.15, 0.15);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 3 + Math.random() * 4;
      mesh.position.setFromSphericalCoords(r, phi, theta);
      
      scene.add(mesh);
      consumers.push(mesh);
      nodes.push(mesh);
    }

    // EDGES
    const lineMat = new THREE.LineBasicMaterial({ color: 0x2563EB, transparent: true, opacity: 0.2 });
    const edges = [];
    
    // Connect consumers to nearby merchants
    consumers.forEach(c => {
      // Find 1-2 closest merchants
      const sortedMerchants = [...merchants].sort((a, b) => c.position.distanceTo(a.mesh.position) - c.position.distanceTo(b.mesh.position));
      const targets = sortedMerchants.slice(0, Math.floor(Math.random() * 2) + 1);
      
      targets.forEach(m => {
        const points = [c.position, m.mesh.position];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, lineMat.clone());
        scene.add(line);
        edges.push({ line, start: c, end: m.mesh });
      });
    });

    // Connect some merchants to center
    merchants.forEach(m => {
      if (Math.random() > 0.3) {
        const points = [m.mesh.position, centerNode.position];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x8B5CF6, transparent: true, opacity: 0.2 }));
        scene.add(line);
      }
    });

    // TRANSACTION PARTICLES
    const particleGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0x10B981 });
    const particles = [];
    
    const spawnParticle = () => {
      if (particles.length > 8) return;
      
      const edge = edges[Math.floor(Math.random() * edges.length)];
      const mesh = new THREE.Mesh(particleGeo, particleMat);
      scene.add(mesh);
      
      particles.push({
        mesh,
        edge,
        progress: 0,
        speed: 0.005 + Math.random() * 0.005
      });
    };

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x2563EB, 5, 10);
    blueLight.position.set(-2, -2, 2);
    scene.add(blueLight);

    // MOUSE PARALLAX
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // INITIAL SIZING
    updateSize();
    window.addEventListener('resize', updateSize);

    // ANIMATION LOOP
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Slowly rotate scene
      scene.rotation.y += 0.1 * delta;
      scene.rotation.x = Math.sin(time * 0.1) * 0.1;

      // Pulse rings
      ring1.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
      ring2.scale.setScalar(1 + Math.sin(time * 2 + Math.PI) * 0.05);
      ring1.material.opacity = 0.3 + Math.sin(time * 2) * 0.1;
      ring2.material.opacity = 0.3 + Math.sin(time * 2 + Math.PI) * 0.1;

      // Parallax camera
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Pulse edge opacity
      edges.forEach((edge, i) => {
        edge.line.material.opacity = 0.1 + (Math.sin(time * 3 + i) * 0.5 + 0.5) * 0.3;
      });

      // Spawn particles randomly
      if (Math.random() < 0.05) spawnParticle();

      // Animate particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += p.speed;
        
        if (p.progress >= 1) {
          // Reached merchant!
          const merchantData = merchants.find(m => m.mesh === p.edge.end);
          if (merchantData) {
            merchantData.mesh.scale.setScalar(0.4); // Pop size
          }
          
          scene.remove(p.mesh);
          particles.splice(i, 1);
        } else {
          p.mesh.position.lerpVectors(p.edge.start.position, p.edge.end.position, p.progress);
        }
      }

      // Recover merchant scale
      merchants.forEach(m => {
        if (m.mesh.scale.x > m.targetScale) {
          const newScale = m.mesh.scale.x - delta * 0.5;
          m.mesh.scale.setScalar(Math.max(newScale, m.targetScale));
        }
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // CLEANUP
    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose materials/geometries
      sphereGeo.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      particleGeo.dispose();
      merchantMat.dispose();
      consumerMat.dispose();
      centralMat.dispose();
      ringMat.dispose();
      lineMat.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [useFallback]);

  if (useFallback) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        {/* Simple CSS fallback for no-WebGL */}
        <div className="relative w-[300px] h-[300px] animate-spin-slow">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] shadow-[0_0_30px_rgba(37,99,235,0.5)]"></div>
          {/* Orbits */}
          <div className="absolute top-0 left-0 w-full h-full border border-[#2563EB]/20 rounded-full"></div>
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] border border-[#2563EB]/10 rounded-full"></div>
          {/* Nodes */}
          <div className="absolute top-[10%] left-[20%] w-6 h-6 rounded-full bg-[#2563EB]"></div>
          <div className="absolute bottom-[20%] right-[10%] w-8 h-8 rounded-full bg-[#2563EB]"></div>
          <div className="absolute top-[50%] right-[-10%] w-4 h-4 rounded-full bg-[#94A3B8]"></div>
          <div className="absolute bottom-[-5%] left-[30%] w-5 h-5 rounded-full bg-[#94A3B8]"></div>
        </div>
      </div>
    );
  }

  return <div ref={mountRef} className="w-full h-full" />;
};

export default HeroScene;
