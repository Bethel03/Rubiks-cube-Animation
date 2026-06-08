import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Cube, type CubeRef } from './components/Cube';
import { Controls } from './components/Controls';
import { playCubeSound } from './utils/sound';
import './index.css';

function App() {
  const cubeRef = useRef<CubeRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [moveQueue, setMoveQueue] = useState<string[]>([]);

  const handlePlay = (moves: string[]) => {
    // Expand double moves (e.g. R2 -> R, R) so animation plays twice
    const expanded = moves.flatMap(move => {
      if (move.includes('2')) {
        const base = move.charAt(0);
        return [base, base];
      }
      return [move];
    });
    setMoveQueue(expanded);
    setIsPlaying(true);
  };

  const handleReset = () => {
    cubeRef.current?.reset();
    setMoveQueue([]);
    setIsPlaying(false);
  };

  // Process move queue
  useEffect(() => {
    if (moveQueue.length === 0) {
      setIsPlaying(false);
      return;
    }

    // Pop the first move
    const currentMove = moveQueue[0];
    
    // Play sound and apply move
    if (!isMuted) {
      playCubeSound(speed);
    }
    cubeRef.current?.applyMove(currentMove);

    // Wait for animation to finish before next move
    const timer = setTimeout(() => {
      setMoveQueue(prev => prev.slice(1));
    }, 400 / speed); // 400ms should match the react-spring animation approx duration

    return () => clearTimeout(timer);
  }, [moveQueue]);

  return (
    <div className="app-container">
      <div className="title-bar">
        <h1>Rubik's Simulation</h1>
        <p>Interactive 3D puzzle with notation support</p>
      </div>

      <Controls 
        onPlay={handlePlay} 
        onReset={handleReset} 
        isPlaying={isPlaying} 
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        speed={speed}
        onToggleSpeed={() => setSpeed(s => s === 1 ? 2 : s === 2 ? 0.5 : 1)}
      />

      <Canvas camera={{ position: [5, 4, 6], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        
        <Cube ref={cubeRef} speed={speed} />
        
        <Environment preset="city" />
        <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} far={4} />
        <OrbitControls 
          enablePan={false}
          minDistance={4}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
}

export default App;
