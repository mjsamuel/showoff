"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Box, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { Button } from "@/components/ui/button";
import * as THREE from "three";

export default function Home() {
  return (
    <div className="w-full h-full relative touch-none">
      <Canvas camera={{ position: [0, 0, 20], fov: 25 }}>
        <Suspense>
          <Physics interpolate gravity={[0, 0, -100]} timeStep={1 / 60}>
            {/* Floor */}
            <RigidBody type="fixed" restitution={0}>
              <Box position={[0, 0, -5]} args={[10, 10, 5]}>
                <meshBasicMaterial opacity={0} transparent={true} />
              </Box>
            </RigidBody>
            {/* Card */}
            <Card position={[0, 0, 10]} />
            <Card position={[3, 3, 8]} />
          </Physics>

          <Environment background>
            <meshBasicMaterial opacity={0} transparent={true} />
            <Lightformer
              intensity={2}
              color="white"
              position={[0, -1, 5]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[-1, -1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[1, 1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={10}
              color="white"
              position={[-10, 0, 14]}
              rotation={[0, Math.PI / 2, Math.PI / 3]}
              scale={[100, 10, 1]}
            />
          </Environment>
        </Suspense>
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
  const vec = new THREE.Vector3();
  const dir = new THREE.Vector3();

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
      friction={0.01}
    >
      <Box
        args={[2.5, 3.5, 0.07]}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
        // eslint-disable-next-line
        onPointerUp={(e: any) => (
          e.target.releasePointerCapture(e.pointerId), drag(false)
        )}
        // eslint-disable-next-line
        onPointerDown={(e: any) => (
          e.target.setPointerCapture(e.pointerId),
          drag(
            new THREE.Vector3()
              .copy(e.point)
              .sub(vec.copy(card.current!.translation())),
          )
        )}
      >
        <meshStandardMaterial color={color || "white"} />
      </Box>
    </RigidBody>
  );
}
