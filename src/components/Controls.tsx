import React, { useState } from 'react';
import { Play, RotateCcw, Pause, Volume2, VolumeX, Gauge } from 'lucide-react';
import { parseNotation } from '../utils/notation';

interface ControlsProps {
  onPlay: (moves: string[]) => void;
  onReset: () => void;
  isPlaying: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  speed: number;
  onToggleSpeed: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ onPlay, onReset, isPlaying, isMuted, onToggleMute, speed, onToggleSpeed }) => {
  const [input, setInput] = useState("R U R' U'");

  const handlePlay = () => {
    if (isPlaying) return;
    const moves = parseNotation(input);
    if (moves.length > 0) {
      onPlay(moves);
    }
  };

  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 shadow-2xl border border-white/10">
        <h2 className="text-white/80 font-semibold text-sm tracking-widest uppercase text-center mb-1">
          Notation Sequence
        </h2>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. U R F' D2"
          className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white text-lg font-mono tracking-widest text-center focus:outline-none focus:border-white/50 focus:bg-black/50 transition-all placeholder:text-white/20"
          spellCheck={false}
          autoComplete="off"
        />

        <div className="flex items-center justify-center gap-4 mt-2">
          <button
            onClick={onToggleSpeed}
            disabled={isPlaying}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 font-mono text-xs font-bold"
            title="Change Speed"
          >
            <Gauge size={16} />
            <span>{speed}x</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <button
            onClick={onReset}
            disabled={isPlaying}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reset Cube"
          >
            <RotateCcw size={20} />
          </button>
          
          <button
            onClick={handlePlay}
            disabled={isPlaying || !input}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isPlaying ? (
              <>
                <Pause size={20} className="animate-pulse" />
                <span>Playing...</span>
              </>
            ) : (
              <>
                <Play size={20} />
                <span>Play Animation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
