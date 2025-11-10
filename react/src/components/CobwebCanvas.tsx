import { useEffect, useRef } from 'react';
import * as math from 'mathjs';
import { IterationResult } from '../lib/fixedPoint';

interface CobwebCanvasProps {
  gFunction: string;
  iterations: IterationResult[];
  angleUnit?: 'radians' | 'degrees';
  width?: number;
  height?: number;
}

const CobwebCanvas = ({ gFunction, iterations, angleUnit = 'radians', width = 600, height = 600 }: CobwebCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get unit symbol for axis labels
  const unitSymbol = angleUnit === 'degrees' ? '°' : 'rad';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || iterations.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    try {
      // Compile function
      const compiled = math.compile(gFunction);
      const g = (x: number): number => {
        try {
          return compiled.evaluate({ x, pi: Math.PI }) as number;
        } catch {
          return NaN;
        }
      };

      // Calculate range based on iterations
      const xValues = iterations.map(iter => iter.xn);
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      
      // Add padding (20%)
      const padding = (maxX - minX) * 0.2;
      const xMin = minX - padding;
      const xMax = maxX + padding;
      
      // Ensure reasonable range
      const rangeX = Math.max(xMax - xMin, 1);
      const yMin = xMin;
      const yMax = xMax;
      const rangeY = rangeX;

      // Margins
      const margin = 50;
      const plotWidth = width - 2 * margin;
      const plotHeight = height - 2 * margin;

      // Coordinate transformation functions
      const toCanvasX = (x: number) => margin + ((x - xMin) / rangeX) * plotWidth;
      const toCanvasY = (y: number) => height - margin - ((y - yMin) / rangeY) * plotHeight;

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.03)');
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0.03)');
      ctx.fillStyle = gradient;
      ctx.fillRect(margin, margin, plotWidth, plotHeight);

      // Draw grid with subtle style
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      
      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = xMin + (rangeX * i) / 10;
        const canvasX = toCanvasX(x);
        ctx.beginPath();
        ctx.moveTo(canvasX, margin);
        ctx.lineTo(canvasX, height - margin);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let i = 0; i <= 10; i++) {
        const y = yMin + (rangeY * i) / 10;
        const canvasY = toCanvasY(y);
        ctx.beginPath();
        ctx.moveTo(margin, canvasY);
        ctx.lineTo(width - margin, canvasY);
        ctx.stroke();
      }

      // Draw axes with glow effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
      
      // X-axis
      const yAxisPos = toCanvasY(0);
      if (yAxisPos >= margin && yAxisPos <= height - margin) {
        ctx.beginPath();
        ctx.moveTo(margin, yAxisPos);
        ctx.lineTo(width - margin, yAxisPos);
        ctx.stroke();
      }
      
      // Y-axis
      const xAxisPos = toCanvasX(0);
      if (xAxisPos >= margin && xAxisPos <= width - margin) {
        ctx.beginPath();
        ctx.moveTo(xAxisPos, margin);
        ctx.lineTo(xAxisPos, height - margin);
        ctx.stroke();
      }
      
      ctx.shadowBlur = 0;

      // Draw y = x line with gradient
      const lineGradient = ctx.createLinearGradient(toCanvasX(xMin), toCanvasY(xMin), toCanvasX(xMax), toCanvasY(xMax));
      lineGradient.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
      lineGradient.addColorStop(1, 'rgba(236, 72, 153, 0.6)');
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 4]);
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(168, 85, 247, 0.4)';
      ctx.beginPath();
      ctx.moveTo(toCanvasX(xMin), toCanvasY(xMin));
      ctx.lineTo(toCanvasX(xMax), toCanvasY(xMax));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Draw g(x) function with gradient and glow
      const funcGradient = ctx.createLinearGradient(margin, margin, width - margin, height - margin);
      funcGradient.addColorStop(0, 'rgba(59, 130, 246, 1)');
      funcGradient.addColorStop(0.5, 'rgba(99, 102, 241, 1)');
      funcGradient.addColorStop(1, 'rgba(139, 92, 246, 1)');
      ctx.strokeStyle = funcGradient;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
      ctx.beginPath();
      
      let firstPoint = true;
      const numPoints = 200;
      for (let i = 0; i <= numPoints; i++) {
        const x = xMin + (rangeX * i) / numPoints;
        const y = g(x);
        
        if (isFinite(y) && y >= yMin && y <= yMax) {
          const canvasX = toCanvasX(x);
          const canvasY = toCanvasY(y);
          
          if (firstPoint) {
            ctx.moveTo(canvasX, canvasY);
            firstPoint = false;
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        } else {
          firstPoint = true;
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw cobweb pattern with gradient colors
      for (let i = 0; i < iterations.length - 1; i++) {
        const x1 = iterations[i].xn;
        const x2 = iterations[i + 1].xn;
        
        // Color gradient from red to orange based on iteration
        const progress = i / (iterations.length - 1);
        const r = Math.floor(239 - progress * 50);
        const g = Math.floor(68 + progress * 100);
        const b = Math.floor(68 + progress * 50);
        
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.7 + progress * 0.3})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
        
        // Vertical line from (x1, x1) to (x1, g(x1))
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x1), toCanvasY(x1));
        ctx.lineTo(toCanvasX(x1), toCanvasY(x2));
        ctx.stroke();
        
        // Horizontal line from (x1, g(x1)) to (g(x1), g(x1))
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x1), toCanvasY(x2));
        ctx.lineTo(toCanvasX(x2), toCanvasY(x2));
        ctx.stroke();
      }
      
      ctx.shadowBlur = 0;

      // Draw starting point with glow
      const x0 = iterations[0].xn;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(toCanvasX(x0), toCanvasY(x0), 7, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw outer ring for starting point
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(toCanvasX(x0), toCanvasY(x0), 10, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw final point with glow
      const xFinal = iterations[iterations.length - 1].xn;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(toCanvasX(xFinal), toCanvasY(xFinal), 7, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw outer ring for final point
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(toCanvasX(xFinal), toCanvasY(xFinal), 10, 0, 2 * Math.PI);
      ctx.stroke();
      
      ctx.shadowBlur = 0;

      // Draw labels with unit symbols
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      
      // X-axis label with unit
      ctx.fillText(`x (${unitSymbol})`, width - margin + 20, toCanvasY(0) + 5);
      
      // Y-axis label with unit
      ctx.save();
      ctx.translate(toCanvasX(0) - 5, margin - 20);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`y (${unitSymbol})`, 0, 0);
      ctx.restore();

      // Legend
      ctx.textAlign = 'left';
      ctx.font = '14px sans-serif';
      
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(margin + 10, 20);
      ctx.lineTo(margin + 40, 20);
      ctx.stroke();
      ctx.fillText('g(x)', margin + 50, 25);
      
      ctx.strokeStyle = '#9ca3af';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(margin + 10, 40);
      ctx.lineTo(margin + 40, 40);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText('y = x', margin + 50, 45);
      
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(margin + 10, 60);
      ctx.lineTo(margin + 40, 60);
      ctx.stroke();
      ctx.fillText('Iteraciones', margin + 50, 65);

    } catch (error) {
      console.error('Error drawing cobweb plot:', error);
      ctx.fillStyle = '#ef4444';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Error al dibujar el gráfico', width / 2, height / 2);
    }
  }, [gFunction, iterations, angleUnit, unitSymbol, width, height]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300 rounded-lg"
      />
    </div>
  );
};

export default CobwebCanvas;
