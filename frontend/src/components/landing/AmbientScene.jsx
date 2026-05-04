import React, { useEffect, useRef, useState } from 'react';

const WHITE_NODE_COUNT = 8;
const GRAY_NODE_COUNT = 12;
const TOTAL_NODES = WHITE_NODE_COUNT + GRAY_NODE_COUNT;
const CONNECTION_DISTANCE = 2.4;

const getRenderMode = () => {
  if (typeof window === 'undefined') return 'fallback';
  if (window.innerWidth < 768) return 'mobile';

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  return context ? 'render' : 'fallback';
};

const AmbientScene = () => {
  const mountRef = useRef(null);
  const [renderMode, setRenderMode] = useState(getRenderMode);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setRenderMode(getRenderMode());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (renderMode !== 'render' || !mountRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(mountRef.current);
    return () => observer.disconnect();
  }, [renderMode]);

  useEffect(() => {
    if (!isVisible || renderMode !== 'render' || !mountRef.current) return undefined;

    let disposed = false;
    let cleanup = () => {};

    const initializeScene = async () => {
      const THREE = await import('three');

      if (disposed || !mountRef.current) return;

      const container = mountRef.current;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f4f0);
      scene.fog = new THREE.Fog(0xf5f4f0, 5, 12);

      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / 400, 0.1, 100);
      camera.position.set(0, 0, 6.5);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(container.clientWidth, 400, false);
      renderer.setClearColor(0xf5f4f0, 1);
      container.appendChild(renderer.domElement);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      const whiteGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const grayGeometry = new THREE.SphereGeometry(0.1, 12, 12);
      const particleGeometry = new THREE.SphereGeometry(0.035, 10, 10);
      const connectionGeometry = new THREE.CylinderGeometry(0.007, 0.007, 1, 6, 1, true);

      const whiteMaterial = new THREE.MeshBasicMaterial({
        color: 0x0a0a0a,
        transparent: true,
        opacity: 0.35,
        fog: true
      });
      const grayMaterial = new THREE.MeshBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.25,
        fog: true
      });
      const connectionMaterial = new THREE.MeshBasicMaterial({
        color: 0x0a0a0a,
        transparent: true,
        opacity: 0.05,
        fog: true
      });
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0x16a34a,
        transparent: true,
        opacity: 0.9,
        fog: true
      });

      const updateSegment = (mesh, start, end) => {
        const direction = new THREE.Vector3().subVectors(end, start);
        const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

        mesh.position.copy(midpoint);
        mesh.scale.set(1, direction.length(), 1);
        mesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.normalize()
        );
      };

      const nodeData = Array.from({ length: TOTAL_NODES }, (_, index) => {
        const base = new THREE.Vector3(
          (Math.random() - 0.5) * 5.4,
          (Math.random() - 0.5) * 3.2,
          (Math.random() - 0.5) * 3.4
        );
        const mesh = new THREE.Mesh(
          index < WHITE_NODE_COUNT ? whiteGeometry : grayGeometry,
          index < WHITE_NODE_COUNT ? whiteMaterial : grayMaterial
        );

        mesh.position.copy(base);
        rootGroup.add(mesh);

        return {
          base,
          mesh,
          drift: new THREE.Vector3(
            0.55 + Math.random() * 0.35,
            0.45 + Math.random() * 0.4,
            0.5 + Math.random() * 0.3
          ),
          phase: Math.random() * Math.PI * 2
        };
      });

      const connectionPairs = [];
      const connected = new Set();

      for (let i = 0; i < nodeData.length; i += 1) {
        let nearestIndex = -1;
        let nearestDistance = Infinity;

        for (let j = i + 1; j < nodeData.length; j += 1) {
          const distance = nodeData[i].base.distanceTo(nodeData[j].base);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = j;
          }

          if (distance <= CONNECTION_DISTANCE) {
            connectionPairs.push({ from: i, to: j });
            connected.add(i);
            connected.add(j);
          }
        }

        if (!connected.has(i) && nearestIndex >= 0) {
          connectionPairs.push({ from: i, to: nearestIndex });
          connected.add(i);
          connected.add(nearestIndex);
        }
      }

      const connections = connectionPairs.map((pair) => {
        const mesh = new THREE.Mesh(connectionGeometry, connectionMaterial);
        rootGroup.add(mesh);
        return { ...pair, mesh };
      });

      const travelerConnections = connections.slice(0, 3).map((connection, index) => {
        const mesh = new THREE.Mesh(particleGeometry, particleMaterial);
        rootGroup.add(mesh);

        return {
          connection,
          mesh,
          progress: index / 3,
          speed: 0.0025 + index * 0.0007
        };
      });

      const resize = () => {
        const width = container.clientWidth || window.innerWidth;
        camera.aspect = width / 400;
        camera.updateProjectionMatrix();
        renderer.setSize(width, 400, false);
      };

      window.addEventListener('resize', resize);

      let frameId = 0;
      let tick = 0;

      const animate = () => {
        tick += 0.01;

        nodeData.forEach((node, index) => {
          const offset = index < WHITE_NODE_COUNT ? 0.12 : 0.08;
          node.mesh.position.set(
            node.base.x + Math.sin(tick * node.drift.x + node.phase) * offset,
            node.base.y + Math.cos(tick * node.drift.y + node.phase * 0.7) * offset,
            node.base.z + Math.sin(tick * node.drift.z + node.phase * 1.2) * offset
          );
        });

        connections.forEach(({ from, to, mesh }) => {
          updateSegment(mesh, nodeData[from].mesh.position, nodeData[to].mesh.position);
        });

        travelerConnections.forEach((traveler) => {
          traveler.progress = (traveler.progress + traveler.speed) % 1;
          traveler.mesh.position.lerpVectors(
            nodeData[traveler.connection.from].mesh.position,
            nodeData[traveler.connection.to].mesh.position,
            traveler.progress
          );
        });

        rootGroup.rotation.y += 0.0003;
        rootGroup.rotation.x = Math.sin(tick * 0.08) * 0.04;

        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(animate);
      };

      resize();
      animate();

      cleanup = () => {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener('resize', resize);

        nodeData.forEach(({ mesh }) => rootGroup.remove(mesh));
        connections.forEach(({ mesh }) => rootGroup.remove(mesh));
        travelerConnections.forEach(({ mesh }) => rootGroup.remove(mesh));

        whiteGeometry.dispose();
        grayGeometry.dispose();
        particleGeometry.dispose();
        connectionGeometry.dispose();
        whiteMaterial.dispose();
        grayMaterial.dispose();
        connectionMaterial.dispose();
        particleMaterial.dispose();
        renderer.dispose();

        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    initializeScene();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [isVisible, renderMode]);

  if (renderMode === 'mobile') {
    return <div style={{ height: '400px', background: '#F5F4F0' }} aria-hidden="true" />;
  }

  if (renderMode === 'fallback') {
    return <div style={{ height: '400px', background: '#F5F4F0' }} aria-hidden="true" />;
  }

  return <div ref={mountRef} style={{ width: '100%', height: '400px' }} aria-hidden="true" />;
};

export default AmbientScene;
