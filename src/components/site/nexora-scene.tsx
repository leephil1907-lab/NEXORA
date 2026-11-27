"use client";

import { useEffect, useRef } from "react";

/**
 * NEXORA hero scene — a live WebGL crystal-core built on the Three.js core ES
 * module only (no addons): custom shader material, hand-rolled camera drift and
 * pointer parallax, orbiting particle field. Rendered after hydration inside the
 * hero orb; the CSS glow beneath remains as the no-WebGL fallback.
 */
export function NexoraScene() {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = holder.current;
    if (!host) return;
    let disposed = false;
    let stop: (() => void) | undefined;

    void (async () => {
      const THREE = await import("three");
      if (disposed || !host) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(host.clientWidth || 420, host.clientHeight || 420);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0, 6.2);

      // -- crystal core: fresnel gradient shader -----------------------------
      const uniforms = { uTime: { value: 0 } };
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.85, 5),
        new THREE.ShaderMaterial({
          uniforms,
          transparent: true,
          vertexShader: `
            uniform float uTime;
            varying vec3 vNormal;
            varying vec3 vPos;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec3 p = position;
              float w = sin(p.x * 2.4 + uTime * 0.7) * cos(p.y * 2.1 - uTime * 0.5) * sin(p.z * 2.7 + uTime * 0.6);
              p += normal * w * 0.075;
              vPos = p;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vPos;
            void main() {
              vec3 viewDir = normalize(cameraPosition - vPos);
              float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 1.9);
              vec3 violet = vec3(0.655, 0.545, 0.980);
              vec3 cyan   = vec3(0.404, 0.910, 0.976);
              vec3 magenta= vec3(0.941, 0.671, 0.988);
              vec3 base = mix(violet, cyan, smoothstep(-1.6, 1.6, vPos.y + vPos.x * 0.6));
              vec3 color = mix(base, magenta, fresnel * 0.9);
              float glow = 0.28 + fresnel * 0.9;
              gl_FragColor = vec4(color * glow, 0.42 + fresnel * 0.55);
            }
          `,
        })
      );
      scene.add(core);

      // -- wireframe shell ----------------------------------------------------
      const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.45, 1),
        new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: 0.16 })
      );
      scene.add(shell);

      // -- orbiting particle field -------------------------------------------
      const count = 420;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        const r = 2.9 + Math.random() * 1.7;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      const particlesGeometry = new THREE.BufferGeometry();
      particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const particles = new THREE.Points(
        particlesGeometry,
        new THREE.PointsMaterial({ color: 0x7de3f4, size: 0.035, transparent: true, opacity: 0.7, depthWrite: false })
      );
      scene.add(particles);

      // -- camera drift + pointer parallax (implemented inline) ---------------
      let targetX = 0;
      let targetY = 0;
      const onPointer = (event: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 1.1;
        targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.8;
      };
      const onResize = () => {
        const w = host.clientWidth || 420;
        const h = host.clientHeight || 420;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("resize", onResize);
      onResize();

      const clock = new THREE.Clock();
      let frame = 0;
      const tick = () => {
        frame = window.requestAnimationFrame(tick);
        const t = clock.getElapsedTime();
        uniforms.uTime.value = t;
        if (!reduceMotion) {
          core.rotation.y = t * 0.12;
          core.rotation.x = Math.sin(t * 0.16) * 0.18;
          shell.rotation.y = -t * 0.05;
          particles.rotation.y = t * 0.07;
        }
        camera.position.x += (targetX - camera.position.x) * 0.045;
        camera.position.y += (-targetY - camera.position.y) * 0.045;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      };

      if (reduceMotion) {
        renderer.render(scene, camera);
      } else {
        tick();
      }

      stop = () => {
        window.cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("resize", onResize);
        core.geometry.dispose();
        (core.material as unknown as { dispose: () => void }).dispose();
        shell.geometry.dispose();
        (shell.material as unknown as { dispose: () => void }).dispose();
        particlesGeometry.dispose();
        (particles.material as unknown as { dispose: () => void }).dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      stop?.();
    };
  }, []);

  return <div ref={holder} className="absolute inset-0" aria-hidden />;
}
