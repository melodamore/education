import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';

const H2OMolecule: React.FC<{ rotation: [number, number, number] }> = ({ rotation }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation[0], 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation[1], 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, rotation[2], 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh position={[-1.2, -0.8, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[1.2, -0.8, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.6, -0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.2, 0.2, 1.5]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh position={[0.6, -0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.2, 0.2, 1.5]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <Text position={[0, 1.5, 0]} fontSize={0.5} color="black">
        H₂O
      </Text>
    </group>
  );
};

export const ARDeskLab: React.FC = () => {
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha ? THREE.MathUtils.degToRad(event.alpha) : 0;
      const beta = event.beta ? THREE.MathUtils.degToRad(event.beta) : 0;
      const gamma = event.gamma ? THREE.MathUtils.degToRad(event.gamma) : 0;
      setRotation([beta, gamma, alpha]);
    };

    if (permissionGranted) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [permissionGranted]);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setPermissionGranted(true);
        } else {
          setPermissionGranted(false);
        }
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {permissionGranted === null ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-6 text-center">
          <p className="text-gray-900 font-bold">To use the AR Desk Lab, we need access to your device's motion sensors.</p>
          <button onClick={requestPermission} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
            Enable AR Tracking
          </button>
        </div>
      ) : permissionGranted === false ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-red-500 font-bold">
          Permission denied. AR tracking unavailable.
        </div>
      ) : (
        <>
          <p className="absolute top-4 left-0 right-0 z-10 text-xs font-black tracking-widest uppercase text-gray-500 text-center pointer-events-none">Tilt phone to inspect 3D Model</p>
          <div className="flex-1 w-full bg-gray-50 rounded-2xl overflow-hidden shadow-inner">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Environment preset="city" />
              <H2OMolecule rotation={rotation} />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </div>
        </>
      )}
    </div>
  );
};
