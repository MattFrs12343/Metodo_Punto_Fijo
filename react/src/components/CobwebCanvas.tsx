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

    // Clear canvas with dark background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'; // slate-900 with transparency
    ctx.fillRect(0, 0, width, height);

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
      const margin = 60;
      const plotWidth = width - 2 * margin;
      const plotHeight = height - 2 * margin;

      // Coordinate transformation functions
      const toCanvasX = (x: number) => margin + ((x - xMin) / rangeX) * plotWidth;
      const toCanvasY = (y: number) => height - margin - ((y - yMin) / rangeY) * plotHeight;

      // Draw subtle background gradient for plot area
      const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
      bgGradient.addColorStop(0, 'rgba(30, 41, 59, 0.4)'); // slate-800
      bgGradient.addColorStop(1, 'rgba(15, 23, 42, 0.8)'); // slate-900
      ctx.fillStyle = bgGradient;
      ctx.fillRect(margin, margin, plotWidth, plotHeight);

      // Draw elegant grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)'; // slate-400 with low opacity
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

      // Draw main axes with subtle glow
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)'; // slate-200
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(59, 130, 246, 0.3)'; // blue glow
      
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

      // Draw y = x line (identity line) - tenue y punteada
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)'; // slate-400
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(148, 163, 184, 0.3)';
      ctx.beginPath();
      ctx.moveTo(toCanvasX(xMin), toCanvasY(xMin));
      ctx.lineTo(toCanvasX(xMax), toCanvasY(xMax));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Draw g(x) function - línea limpia, color frío (cyan/azul)
      const funcGradient = ctx.createLinearGradient(margin, margin, width - margin, height - margin);
      funcGradient.addColorStop(0, 'rgba(34, 211, 238, 1)'); // cyan-400
      funcGradient.addColorStop(0.5, 'rgba(59, 130, 246, 1)'); // blue-500
      funcGradient.addColorStop(1, 'rgba(99, 102, 241, 1)'); // indigo-500
      ctx.strokeStyle = funcGradient;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
      ctx.beginPath();
      
      let firstPoint = true;
      const numPoints = 300; // Más puntos para mayor precisión visual
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

      // Draw cobweb pattern - iteraciones progresivas con énfasis visual
      for (let i = 0; i < iterations.length - 1; i++) {
        const x1 = iterations[i].xn;
        const x2 = iterations[i + 1].xn;
        
        // Progresión de color elegante: de cyan a naranja
        const progress = i / Math.max(iterations.length - 2, 1);
        const alpha = 0.6 + progress * 0.4; // Aumenta opacidad hacia el final
        
        // Colores progresivos: cyan → violet → orange
        let r, g, b;
        if (progress < 0.5) {
          // cyan to violet
          const t = progress * 2;
          r = Math.floor(34 + t * (139 - 34));   // cyan-400 to violet-500
          g = Math.floor(211 + t * (92 - 211));
          b = Math.floor(238 + t * (246 - 238));
        } else {
          // violet to orange
          const t = (progress - 0.5) * 2;
          r = Math.floor(139 + t * (249 - 139)); // violet-500 to orange-400
          g = Math.floor(92 + t * (115 - 92));
          b = Math.floor(246 + t * (22 - 246));
        }
        
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = 1.5 + progress * 1; // Líneas más gruesas hacia el final
        ctx.shadowBlur = 4 + progress * 4;
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

      // Draw starting point - punto inicial destacado
      const x0 = iterations[0].xn;
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.8)'; // emerald-500
      ctx.fillStyle = 'rgba(16, 185, 129, 1)';
      ctx.beginPath();
      ctx.arc(toCanvasX(x0), toCanvasY(x0), 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Outer ring for starting point
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(toCanvasX(x0), toCanvasY(x0), 12, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw final point - último punto con glow sutil comunicando "convergencia"
      const xFinal = iterations[iterations.length - 1].xn;
      ctx.shadowBlur = 25;
      ctx.shadowColor = 'rgba(249, 115, 22, 0.9)'; // orange-500
      ctx.fillStyle = 'rgba(249, 115, 22, 1)';
      ctx.beginPath();
      ctx.arc(toCanvasX(xFinal), toCanvasY(xFinal), 7, 0, 2 * Math.PI);
      ctx.fill();
      
      // Pulsing outer ring for convergence
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(toCanvasX(xFinal), toCanvasY(xFinal), 14, 0, 2 * Math.PI);
      ctx.stroke();
      
      ctx.shadowBlur = 0;

      // Draw elegant labels - tipografía pequeña y elegante
      ctx.fillStyle = 'rgba(226, 232, 240, 0.8)'; // slate-200
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      
      // X-axis label with unit
      ctx.fillText(`x (${unitSymbol})`, width - margin + 25, toCanvasY(0) + 5);
      
      // Y-axis label with unit
      ctx.save();
      ctx.translate(toCanvasX(0) - 25, margin - 15);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`y (${unitSymbol})`, 0, 0);
      ctx.restore();

      // Elegant legend - ubicación discreta, colores coherentes
      ctx.textAlign = 'left';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      
      // Legend background
      const legendX = margin + 15;
      const legendY = 15;
      const legendWidth = 120;
      const legendHeight = 75;
      
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)'; // slate-800
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 1;
      ctx.fillRect(legendX - 5, legendY - 5, legendWidth, legendHeight);
      ctx.strokeRect(legendX - 5, legendY - 5, legendWidth, legendHeight);
      
      // g(x) line
      ctx.strokeStyle = 'rgba(59, 130, 246, 1)'; // blue-500
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY + 10);
      ctx.lineTo(legendX + 25, legendY + 10);
      ctx.stroke();
      ctx.fillStyle = 'rgba(226, 232, 240, 0.9)';
      ctx.fillText('g(x)', legendX + 30, legendY + 14);
      
      // y = x line
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)'; // slate-400
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(legendX, legendY + 30);
      ctx.lineTo(legendX + 25, legendY + 30);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText('y = x', legendX + 30, legendY + 34);
      
      // Iterations line
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.8)'; // orange-500
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY + 50);
      ctx.lineTo(legendX + 25, legendY + 50);
      ctx.stroke();
      ctx.fillText('Iteraciones', legendX + 30, legendY + 54);

    } catch (error) {
      console.error('Error drawing cobweb plot:', error);
      // Error message with dark theme
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'; // red-500
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
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
        className="rounded-lg border border-slate-600/30 shadow-lg shadow-slate-900/50 backdrop-blur-sm"
        style={{
          background: 'transparent'
        }}
      />
    </div>
  );
};

export default CobwebCanvas;
