import React from 'react';
import { useSpring, a } from '@react-spring/three';
import { RoundedBox } from '@react-three/drei';
import type { CubieState } from '../utils/cubeState';

interface CubieProps {
  state: CubieState;
  size?: number;
  spacing?: number;
  speed?: number;
}

// Face orientations: Right, Left, Top, Bottom, Front, Back
const STICKER_OFFSETS: [number, number, number][] = [
  [0.5, 0, 0],
  [-0.5, 0, 0],
  [0, 0.5, 0],
  [0, -0.5, 0],
  [0, 0, 0.5],
  [0, 0, -0.5],
];

const STICKER_ROTATIONS: [number, number, number][] = [
  [0, Math.PI / 2, 0],
  [0, -Math.PI / 2, 0],
  [-Math.PI / 2, 0, 0],
  [Math.PI / 2, 0, 0],
  [0, 0, 0],
  [0, Math.PI, 0],
];

export const Cubie: React.FC<CubieProps> = ({ state, size = 0.96, spacing = 1, speed = 1 }) => {
  const { position, quaternion } = useSpring({
    position: [
      state.position[0] * spacing,
      state.position[1] * spacing,
      state.position[2] * spacing,
    ] as [number, number, number],
    quaternion: state.quaternion,
    config: { mass: 1, tension: 220 * (speed * speed), friction: 25 * speed },
  });

  const stickerSize = size * 0.88;
  const stickerThickness = 0.04;

  return (
    <a.group
      position={position}
      quaternion={quaternion as unknown as [number, number, number, number]}
    >
      {/* Core block (black plastic) */}
      <RoundedBox args={[size, size, size]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          color="#1a1a1a"
          roughness={0.7}
          metalness={0.1}
          clearcoat={0.1}
        />
      </RoundedBox>

      {/* Colored Caps / Stickers */}
      {state.colors.map((color, index) => {
        if (color === '#000000') return null;

        const offset = STICKER_OFFSETS[index].map(
          (v) => v * (size - 0.02)
        ) as [number, number, number];

        return (
          <RoundedBox
            key={index}
            position={offset}
            rotation={STICKER_ROTATIONS[index]}
            args={[stickerSize, stickerSize, stickerThickness]}
            radius={0.04}
            smoothness={4}
          >
            <meshPhysicalMaterial
              color={color}
              roughness={0.1}
              metalness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
            />
          </RoundedBox>
        );
      })}
    </a.group>
  );
};
