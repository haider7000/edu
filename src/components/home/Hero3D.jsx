import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  PerspectiveCamera,
  RoundedBox,
  Sparkles,
  Torus,
} from "@react-three/drei";
import * as THREE from "three";

function Laptop() {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;

    group.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.35) * 0.08;

    group.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.25) * 0.025;
  });

  return (
    <group ref={group} rotation={[0.02, -0.25, 0]}>
      <RoundedBox
        args={[3.5, 0.16, 2.3]}
        radius={0.08}
        smoothness={3}
        position={[0, -1.15, 0]}
      >
        <meshStandardMaterial
          color="#151923"
          metalness={0.7}
          roughness={0.3}
        />
      </RoundedBox>

      <RoundedBox
        args={[3.1, 2.05, 0.12]}
        radius={0.08}
        smoothness={3}
        position={[0, 0.05, -0.92]}
        rotation={[-0.1, 0, 0]}
      >
        <meshStandardMaterial
          color="#0b0e16"
          metalness={0.55}
          roughness={0.22}
        />
      </RoundedBox>

      <mesh
        position={[0, 0.05, -0.845]}
        rotation={[-0.1, 0, 0]}
      >
        <planeGeometry args={[2.65, 1.6]} />

        <meshBasicMaterial color="#101d3d" />
      </mesh>

      <mesh
        position={[0, 0.05, -0.83]}
        rotation={[-0.1, 0, 0]}
      >
        <planeGeometry args={[2.1, 0.9]} />

        <meshBasicMaterial
          color="#2563eb"
          transparent
          opacity={0.16}
        />
      </mesh>

      <mesh
        position={[0, 0.05, -0.815]}
        rotation={[-0.1, 0, 0]}
      >
        <planeGeometry args={[1.5, 0.05]} />

        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.65}
        />
      </mesh>

      <mesh
        position={[-0.5, -1.06, 0.08]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <boxGeometry args={[0.5, 0.35, 0.03]} />

        <meshStandardMaterial
          color="#222735"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function Book() {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    ref.current.rotation.y =
      state.clock.elapsedTime * 0.35;
  });

  return (
    <group
      ref={ref}
      position={[2.05, 0.8, 0]}
      rotation={[0.15, 0.2, -0.12]}
    >
      <RoundedBox
        args={[1.25, 0.18, 1.7]}
        radius={0.06}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#7c3aed"
          metalness={0.2}
          roughness={0.55}
        />
      </RoundedBox>

      <RoundedBox
        args={[1.25, 0.14, 1.7]}
        radius={0.05}
        smoothness={2}
        position={[0, 0.17, 0]}
      >
        <meshStandardMaterial
          color="#2563eb"
          metalness={0.2}
          roughness={0.55}
        />
      </RoundedBox>
    </group>
  );
}

function Certificate() {
  return (
    <Float
      speed={1.2}
      rotationIntensity={0.2}
      floatIntensity={0.5}
    >
      <group
        position={[-2.2, 0.5, 0.3]}
        rotation={[0.08, 0.3, -0.1]}
      >
        <RoundedBox
          args={[1.5, 0.08, 1.05]}
          radius={0.04}
          smoothness={2}
        >
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.1}
            roughness={0.6}
          />
        </RoundedBox>

        <mesh position={[0, 0.055, 0]}>
          <planeGeometry args={[0.8, 0.5]} />

          <meshBasicMaterial
            color="#2563eb"
            transparent
            opacity={0.2}
          />
        </mesh>
      </group>
    </Float>
  );
}

function GraduationCap() {
  return (
    <Float
      speed={1.3}
      rotationIntensity={0.25}
      floatIntensity={0.7}
    >
      <group
        position={[1.25, 2.1, 0.2]}
        rotation={[0.05, -0.2, 0.05]}
      >
        <mesh rotation={[0, 0, 0.05]}>
          <coneGeometry args={[1, 0.18, 4]} />

          <meshStandardMaterial
            color="#111827"
            metalness={0.45}
            roughness={0.3}
          />
        </mesh>

        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry
            args={[0.28, 0.28, 0.25, 24]}
          />

          <meshStandardMaterial
            color="#2563eb"
            metalness={0.35}
            roughness={0.3}
          />
        </mesh>

        <mesh
          position={[0.42, 0.02, 0]}
          rotation={[0, 0, -0.2]}
        >
          <cylinderGeometry
            args={[0.015, 0.015, 0.8, 8]}
          />

          <meshStandardMaterial color="#60a5fa" />
        </mesh>
      </group>
    </Float>
  );
}

function Scene() {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;

    const x =
      state.pointer.x * 0.12;

    const y =
      state.pointer.y * 0.08;

    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      x,
      0.035
    );

    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -y,
      0.035
    );
  });

  return (
    <group ref={group}>
      <ambientLight intensity={1.1} />

      <directionalLight
        position={[4, 6, 5]}
        intensity={2.5}
        color="#ffffff"
      />

      <pointLight
        position={[-4, 1, 2]}
        intensity={3}
        color="#2563eb"
      />

      <pointLight
        position={[3, -2, 2]}
        intensity={2}
        color="#7c3aed"
      />

      <Laptop />
      <Book />
      <Certificate />
      <GraduationCap />

      <Float
        speed={0.7}
        rotationIntensity={0.15}
        floatIntensity={0.5}
      >
        <mesh position={[-2.4, -1.4, 0.2]}>
          <icosahedronGeometry args={[0.45, 1]} />

          <meshStandardMaterial
            color="#2563eb"
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>
      </Float>

      <Torus
        args={[2.7, 0.018, 12, 96]}
        rotation={[1.15, 0.2, 0]}
        position={[0, 0, -0.8]}
      >
        <meshBasicMaterial
          color="#2563eb"
          transparent
          opacity={0.35}
        />
      </Torus>

      <Torus
        args={[3.1, 0.012, 12, 96]}
        rotation={[1.05, -0.3, 0.2]}
        position={[0, 0.2, -1]}
      >
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.2}
        />
      </Torus>

      <Sparkles
        count={35}
        scale={[7, 6, 5]}
        size={1.5}
        speed={0.2}
        color="#60a5fa"
      />
    </group>
  );
}

function FallbackVisual() {
  return (
    <div className="relative flex h-full min-h-[420px] items-center justify-center lg:min-h-[600px]">
      <div className="absolute h-[300px] w-[300px] rounded-full bg-blue-600/[0.12] blur-[90px]" />

      <div className="relative w-[min(88%,420px)]">
        <div className="absolute -right-3 -top-8 h-24 w-24 rounded-2xl border border-violet-400/20 bg-violet-500/10 blur-[1px]" />

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl backdrop-blur-xl">
          <div className="rounded-[1.5rem] border border-blue-400/20 bg-[var(--surface)] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="h-2.5 w-24 rounded-full bg-white/10" />
              <div className="h-8 w-8 rounded-lg bg-blue-500/20" />
            </div>

            <div className="h-28 rounded-2xl bg-gradient-to-br from-blue-600/30 to-violet-600/20" />

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="h-14 rounded-xl bg-white/[0.05]" />
              <div className="h-14 rounded-xl bg-white/[0.05]" />
              <div className="h-14 rounded-xl bg-white/[0.05]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero3D() {
  const [canRender3D, setCanRender3D] = useState(false);

  useEffect(() => {
    const update = () => {
      setCanRender3D(
        window.innerWidth >= 768 &&
          window.matchMedia(
            "(prefers-reduced-motion: no-preference)"
          ).matches
      );
    };

    update();

    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!canRender3D) {
    return <FallbackVisual />;
  }

  return (
    <div className="desktop-3d absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <PerspectiveCamera
            makeDefault
            position={[0, 0, 8]}
            fov={42}
          />

          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}