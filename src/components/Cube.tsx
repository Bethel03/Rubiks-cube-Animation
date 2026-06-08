import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Cubie } from './Cubie';
import { generateInitialState, applyMoveToState, type CubieState } from '../utils/cubeState';

export interface CubeRef {
  applyMove: (notation: string) => void;
  reset: () => void;
}

export interface CubeProps {
  speed?: number;
}

export const Cube = forwardRef<CubeRef, CubeProps>(({ speed = 1 }, ref) => {
  const [cubies, setCubies] = useState<CubieState[]>(generateInitialState());

  useImperativeHandle(ref, () => ({
    applyMove: (notation: string) => {
      setCubies((prev) => applyMoveToState(prev, notation));
    },
    reset: () => {
      setCubies(generateInitialState());
    }
  }));

  return (
    <group>
      {cubies.map(cubie => (
        <Cubie key={cubie.id} state={cubie} speed={speed} />
      ))}
    </group>
  );
});

Cube.displayName = 'Cube';
