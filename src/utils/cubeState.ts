import * as THREE from 'three';

export interface CubieState {
  id: number;
  position: [number, number, number];
  quaternion: [number, number, number, number];
  colors: string[];
}

const DEFAULT_COLORS = [
  '#B90000', // 0: Right (+x) - Red
  '#FF5900', // 1: Left (-x) - Orange
  '#FFFFFF', // 2: Top (+y) - White
  '#FFD500', // 3: Bottom (-y) - Yellow
  '#009B48', // 4: Front (+z) - Green
  '#0045AD', // 5: Back (-z) - Blue
];

export const generateInitialState = (): CubieState[] => {
  const cubies: CubieState[] = [];
  let id = 0;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        // Skip the core cubie
        if (x === 0 && y === 0 && z === 0) continue;

        const colors = [
          x === 1 ? DEFAULT_COLORS[0] : '#000000',
          x === -1 ? DEFAULT_COLORS[1] : '#000000',
          y === 1 ? DEFAULT_COLORS[2] : '#000000',
          y === -1 ? DEFAULT_COLORS[3] : '#000000',
          z === 1 ? DEFAULT_COLORS[4] : '#000000',
          z === -1 ? DEFAULT_COLORS[5] : '#000000',
        ];

        cubies.push({
          id: id++,
          position: [x, y, z],
          quaternion: [0, 0, 0, 1], // Identity quaternion
          colors,
        });
      }
    }
  }
  return cubies;
};

// Map notations to axis and angle
export const getRotationParams = (notation: string) => {
  const axisMap: Record<string, 'x' | 'y' | 'z'> = {
    U: 'y', D: 'y',
    R: 'x', L: 'x',
    F: 'z', B: 'z'
  };

  // 90 degrees in radians
  const PI_2 = Math.PI / 2;

  // Directions based on right-hand rule
  const dirMap: Record<string, number> = {
    U: -1, D: 1,
    R: -1, L: 1,
    F: -1, B: 1
  };

  const baseMove = notation.charAt(0);
  const isPrime = notation.includes("'");
  const isDouble = notation.includes("2");

  const axis = axisMap[baseMove];
  let dir = dirMap[baseMove];

  if (isPrime) dir *= -1;
  if (isDouble) dir *= 2;

  const angle = dir * PI_2;

  return { axis, angle, baseMove };
};

export const applyMoveToState = (state: CubieState[], notation: string): CubieState[] => {
  const { axis, angle, baseMove } = getRotationParams(notation);

  // Group selector
  const selectorMap: Record<string, (p: [number, number, number]) => boolean> = {
    U: (p) => p[1] > 0.5,
    D: (p) => p[1] < -0.5,
    R: (p) => p[0] > 0.5,
    L: (p) => p[0] < -0.5,
    F: (p) => p[2] > 0.5,
    B: (p) => p[2] < -0.5,
  };

  const isAffected = selectorMap[baseMove];

  // Axis vector
  const axisVec = new THREE.Vector3();
  if (axis === 'x') axisVec.set(1, 0, 0);
  if (axis === 'y') axisVec.set(0, 1, 0);
  if (axis === 'z') axisVec.set(0, 0, 1);

  const rotQuat = new THREE.Quaternion().setFromAxisAngle(axisVec, angle);

  return state.map(cubie => {
    if (!isAffected(cubie.position)) return cubie;

    const posVec = new THREE.Vector3(...cubie.position);
    posVec.applyQuaternion(rotQuat);

    const quat = new THREE.Quaternion(...cubie.quaternion);
    // Multiply rotQuat * quat to accumulate rotations in world space
    const newQuat = rotQuat.clone().multiply(quat);

    // Round position to avoid floating point errors
    const newPos: [number, number, number] = [
      Math.round(posVec.x),
      Math.round(posVec.y),
      Math.round(posVec.z),
    ];

    return {
      ...cubie,
      position: newPos,
      quaternion: [newQuat.x, newQuat.y, newQuat.z, newQuat.w]
    };
  });
};
