// Singleton AudioContext to avoid hitting browser limits
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  return audioCtx;
};

let convolverBuffer: AudioBuffer | null = null;

export const playCubeSound = (speed: number = 1) => {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  // Create the plastic resonance impulse response once
  if (!convolverBuffer) {
    const duration = 0.06; // 60ms resonance
    const length = ctx.sampleRate * duration;
    convolverBuffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const channel = convolverBuffer.getChannelData(c);
      for (let i = 0; i < length; i++) {
        // Fast decay for rigid plastic
        const decay = Math.exp(-i / (ctx.sampleRate * 0.015));
        // Add some comb-filtering effects (springs/screws inside the cube)
        const spring = Math.sin(i * 0.8) * 0.3;
        channel[i] = (Math.random() * 2 - 1) * decay * (1 + spring);
      }
    }
  }

  const now = ctx.currentTime;

  // 1. The Friction / Slide
  const slideDuration = 0.15 / speed;
  const slideBuffer = ctx.createBuffer(1, Math.max(1, ctx.sampleRate * slideDuration), ctx.sampleRate);
  const slideData = slideBuffer.getChannelData(0);
  for (let i = 0; i < slideBuffer.length; i++) {
    const decay = 1 - (i / slideBuffer.length);
    slideData[i] = (Math.random() * 2 - 1) * decay * 0.5;
  }
  const slideSource = ctx.createBufferSource();
  slideSource.buffer = slideBuffer;
  
  const slideFilter = ctx.createBiquadFilter();
  slideFilter.type = 'lowpass';
  slideFilter.frequency.setValueAtTime(800 * Math.sqrt(speed), now); // Pitch up slightly when faster
  
  const slideGain = ctx.createGain();
  slideGain.gain.setValueAtTime(0, now);
  slideGain.gain.linearRampToValueAtTime(0.3, now + Math.min(0.05, slideDuration / 2));
  slideGain.gain.exponentialRampToValueAtTime(0.01, now + slideDuration);
  
  slideSource.connect(slideFilter);
  slideFilter.connect(slideGain);
  slideGain.connect(ctx.destination);
  slideSource.start(now);

  // 2. The Snap (Mechanical lock) routed through the plastic Convolver
  const snapTime = now + (0.12 / speed) + (Math.random() * 0.01); // Fire proportionally

  
  const convolver = ctx.createConvolver();
  convolver.buffer = convolverBuffer;
  
  // The source of the snap is a very sharp, tiny noise burst (like an impact)
  const impactDuration = 0.01;
  const impactBuffer = ctx.createBuffer(1, ctx.sampleRate * impactDuration, ctx.sampleRate);
  const impactData = impactBuffer.getChannelData(0);
  for (let i = 0; i < impactBuffer.length; i++) {
    const decay = Math.exp(-i / (ctx.sampleRate * 0.002));
    impactData[i] = (Math.random() * 2 - 1) * decay;
  }
  
  const impactSource = ctx.createBufferSource();
  impactSource.buffer = impactBuffer;
  
  // EQ the snap to remove harsh high-end and boost the "clack"
  const impactEq = ctx.createBiquadFilter();
  impactEq.type = 'bandpass';
  impactEq.frequency.setValueAtTime(1500 + (Math.random() * 500), snapTime);
  impactEq.Q.setValueAtTime(0.5, snapTime);
  
  const impactGain = ctx.createGain();
  impactGain.gain.value = 4.0; // Boost because convolver lowers volume
  
  impactSource.connect(impactEq);
  impactEq.connect(convolver);
  convolver.connect(impactGain);
  impactGain.connect(ctx.destination);
  
  impactSource.start(snapTime);
};
