import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Interactive particle globe with plexus lattice + horizontal nebula glow.
 * Uses Three.js WebGL, continuous rotation, mouse parallax.
 */
export function ParticleGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Group holds globe + rotates
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Generate points on a sphere (Fibonacci distribution)
    const POINT_COUNT = 900;
    const RADIUS = 2.6;
    const positions = new Float32Array(POINT_COUNT * 3);
    const colors = new Float32Array(POINT_COUNT * 3);
    const pointVecs: THREE.Vector3[] = [];

    const cyan = new THREE.Color(0x00d2ff);
    const royal = new THREE.Color(0x0052cc);

    for (let i = 0; i < POINT_COUNT; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / POINT_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const x = RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = RADIUS * Math.sin(phi) * Math.sin(theta);
      const z = RADIUS * Math.cos(phi);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color gradient: right-facing points glow cyan
      const t = (x / RADIUS + 1) / 2;
      const c = royal.clone().lerp(cyan, t);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      pointVecs.push(new THREE.Vector3(x, y, z));
    }

    // Points (particles)
    const pointsGeom = new THREE.BufferGeometry();
    pointsGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pointsGeom.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Circular glow sprite for particles
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = spriteCanvas.height = 64;
    const sctx = spriteCanvas.getContext("2d")!;
    const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.3, "rgba(120,200,255,0.8)");
    grad.addColorStop(1, "rgba(0,80,200,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 64, 64);
    const sprite = new THREE.CanvasTexture(spriteCanvas);

    const pointsMat = new THREE.PointsMaterial({
      size: 0.07,
      map: sprite,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(pointsGeom, pointsMat);
    globeGroup.add(points);

    // Plexus lines: connect nearest neighbors
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    const MAX_DIST = 0.55;
    for (let i = 0; i < POINT_COUNT; i++) {
      for (let j = i + 1; j < POINT_COUNT; j++) {
        const d = pointVecs[i].distanceTo(pointVecs[j]);
        if (d < MAX_DIST) {
          linePositions.push(
            pointVecs[i].x, pointVecs[i].y, pointVecs[i].z,
            pointVecs[j].x, pointVecs[j].y, pointVecs[j].z,
          );
          const a = 1 - d / MAX_DIST;
          const ci = new THREE.Color(0x00d2ff).multiplyScalar(a);
          lineColors.push(ci.r, ci.g, ci.b, ci.r, ci.g, ci.b);
        }
      }
    }
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeom.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lines = new THREE.LineSegments(lineGeom, lineMat);
    globeGroup.add(lines);

    // Subtle inner glow sphere
    const innerGeom = new THREE.SphereGeometry(RADIUS * 0.92, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0a3fa8,
      transparent: true,
      opacity: 0.08,
    });
    globeGroup.add(new THREE.Mesh(innerGeom, innerMat));

    // Mouse parallax
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 0.6;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener("mousemove", onMove);

    // Resize
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      globeGroup.rotation.y += 0.0018;
      globeGroup.rotation.x = mouse.y * 0.3;
      globeGroup.rotation.z = mouse.x * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      pointsGeom.dispose();
      lineGeom.dispose();
      innerGeom.dispose();
      pointsMat.dispose();
      lineMat.dispose();
      innerMat.dispose();
      sprite.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />;
}
