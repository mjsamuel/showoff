"use client";

import { useEffect, useRef, useState } from "react";
import { Box, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { Button } from "@/components/ui/button";
import * as THREE from "three";

useGLTF.preload("/playing_card.glb");

export default function Home() {
  return (
    <div className="w-full h-full relative touch-none select-none">
      <Canvas shadows camera={{ position: [0, 0, 25], fov: 30 }}>
        {/* <Canvas shadows camera={{ position: [5, -5, 50], fov: 30, rotation: [0, -1, 0] }}> */}
        {/* <Environment preset="apartment" background blur={0.8} /> */}
        <directionalLight position={[0, 0, 50]} intensity={1.2} castShadow />
        <Physics gravity={[0, 0, -50]} timeStep={1 / 120}>
          {/* Floor */}
          <RigidBody type="fixed" restitution={0}>
            <Box position={[0, 0, -5]} args={[20, 20, 5]}>
              <meshBasicMaterial opacity={0} transparent={true} />
            </Box>
          </RigidBody>
          {/* Card */}
          <Card position={[0, 0, 10]} />
          <Card position={[2, 2, 8]} />
        </Physics>
      </Canvas>
      <div className="absolute bottom-0 w-full flex justify-center">
        <Button className="mb-4">Next turn</Button>
      </div>
    </div>
  );
}

function Card({
  position,
  color,
}: Readonly<{ position?: [x: number, y: number, z: number]; color?: string }>) {
  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);
  const card = useRef<RapierRigidBody>(null);
  const vec = new THREE.Vector3(),
    dir = new THREE.Vector3();

  // eslint-disable-next-line
  const test: any = useGLTF("/playing_card.glb");
  console.log(test.materials["Material.001"].map);

  // const { nodes, materials } =
  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged]);

  useFrame((state) => {
    if (!dragged) return;

    vec.set(state.pointer.x, state.pointer.y, 0).unproject(state.camera);
    dir.copy(vec).sub(state.camera.position).normalize();
    vec.add(dir.multiplyScalar(state.camera.position.length()));
    vec.set(vec.x, vec.y, 5);
    card.current?.wakeUp();
    card.current?.setNextKinematicTranslation({
      x: vec.x - dragged.x,
      y: vec.y - dragged.y,
      z: vec.z - dragged.z,
    });
  });

  return (
    <RigidBody
      position={position}
      ref={card}
      type={dragged ? "kinematicPosition" : "dynamic"}
      restitution={0.25}
      friction={0.1}
      colliders="cuboid"
      rotation={[Math.PI / 2, 0, 0]}
      mass={0.5}
    >
      <mesh
        castShadow
        receiveShadow
        scale={[2.5, 15, 3.5]}
        geometry={test.nodes.Plane.geometry}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
        // eslint-disable-next-line
        onPointerUp={(e: any) => (
          e.target.releasePointerCapture(e.pointerId), drag(false)
        )}
        // eslint-disable-next-line
        onPointerDown={(e: any) => (
          e.stopPropagation(),
          e.nativeEvent.stopImmediatePropagation(),
          e.target.setPointerCapture(e.pointerId),
          drag(
            new THREE.Vector3()
              .copy(e.point)
              .sub(vec.copy(card.current!.translation())),
          )
        )}
      >
        <meshStandardMaterial
          color={color || "white"}
          metalness={0.2}
          roughness={0.1}
          envMapIntensity={1}
        />
      </mesh>
    </RigidBody>
  );
}
