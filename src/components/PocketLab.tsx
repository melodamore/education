import { useEffect, useRef, useState } from 'react';
import { Play, Square, Smartphone } from 'lucide-react';

export default function PocketLab() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const pointsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!isActive) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel) return;

      const currentX = accel.x || 0;
      setAcceleration({ x: currentX, y: accel.y || 0, z: accel.z || 0 });

      // Save points for live graph plotting
      pointsRef.current.push(currentX);
      if (pointsRef.current.length > 100) pointsRef.current.shift();
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 3;
      ctx.beginPath();

      const sliceWidth = canvas.width / 100;
      let x = 0;

      pointsRef.current.forEach((point, index) => {
        const y = (canvas.height / 2) + (point * 10); // scale up sensor data
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      });

      ctx.stroke();
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] text-white space-y-4 shadow-xl">
      <div className="flex items-center space-x-3">
        <Smartphone className="w-6 h-6 text-indigo-400" />
        <h4 className="font-black text-xl tracking-tight">Pocket Lab: Motion Analyzer</h4>
      </div>
      
      <p className="text-xs font-medium text-slate-400">Swing your phone gently back and forth to measure velocity changes and capture live dynamic force oscillation wave data.</p>

      <canvas ref={canvasRef} width={350} height={150} className="w-full bg-slate-950 border border-slate-800 rounded-xl" />

      <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
        <div className="bg-slate-800 p-2 rounded-lg"><span className="block text-slate-400">X-Axis</span>{acceleration.x.toFixed(2)}</div>
        <div className="bg-slate-800 p-2 rounded-lg"><span className="block text-slate-400">Y-Axis</span>{acceleration.y.toFixed(2)}</div>
        <div className="bg-slate-800 p-2 rounded-lg"><span className="block text-slate-400">Z-Axis</span>{acceleration.z.toFixed(2)}</div>
      </div>

      <button 
        onClick={() => setIsActive(!isActive)}
        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors ${isActive ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'}`}
      >
        {isActive ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
        <span>{isActive ? 'STOP EXHAUST DATA' : 'ENGAGE SENSORS'}</span>
      </button>
    </div>
  );
}