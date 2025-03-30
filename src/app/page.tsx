"use client";

import { Suspense } from "react";
import { Box, Environment, Lightformer } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 20], fov: 25 }}>
        <Suspense>
          <Physics interpolate gravity={[0, 0, -40]} timeStep={1 / 60}>
            {/* Floor */}
            <RigidBody type="fixed">
              <Box position={[0, 0, 0]} args={[10, 10, 2]}>
                <meshBasicMaterial opacity={0} transparent={true} />
              </Box>
            </RigidBody>
            {/* Card */}
            <Card position={[0, 0, 10]} />
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
  return (
    <RigidBody position={position} restitution={0.8}>
      <Box args={[2.5, 3.5, 0.07]}>
        <meshStandardMaterial color={color || "white"} />
      </Box>
    </RigidBody>
  );
}
