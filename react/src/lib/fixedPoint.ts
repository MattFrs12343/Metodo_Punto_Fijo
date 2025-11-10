import * as math from 'mathjs';
import { transformFunctionForUnit } from './unitConverter';

export interface IterationResult {
  n: number;
  xn: number;
  gxn: number;
  error: number;
  aitkenValue?: number;
}

export interface FixedPointOptions {
  gFunction: string;
  x0: number;
  tolerance: number;
  maxIterations: number;
  stopCriterion: 'delta' | 'residual';
  errorType?: 'absolute' | 'relative';  // Tipo de error: absoluto o relativo
  useAitken: boolean;
  significantFigures?: number;
  angleUnit: 'radians' | 'degrees';  // REQUIRED - no default value
  precisionMode?: 'decimals' | 'significant';
  decimals?: number;
}

export interface FixedPointResult {
  success: boolean;
  iterations: IterationResult[];
  finalValue: number;
  finalError: number;
  message: string;
  convergenceCriterion?: string;
  derivativeWarning?: string;
  derivativeValue?: number;
  angleUnit: 'radians' | 'degrees';  // Include unit information in result
}

/**
 * Redondea un número a n cifras significativas
 * Implementación mejorada según especificación científica
 * @param x - Número a redondear
 * @param sig - Número de cifras significativas
 * @returns Número redondeado
 */
export function roundSignificant(x: number, sig: number): number {
  if (x === 0 || !isFinite(x)) return x;
  const d = Math.ceil(Math.log10(Math.abs(x)));
  const power = sig - d;
  const magnitude = Math.pow(10, power);
  return Math.round(x * magnitude) / magnitude;
}

/**
 * Convierte grados a radianes
 * @param degrees - Ángulo en grados
 * @returns Ángulo en radianes
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calcula la derivada numérica de g(x) en un punto
 * Usa diferencias centrales: g'(x) ≈ [g(x+h) - g(x-h)] / (2h)
 * @param g - Función g(x)
 * @param x - Punto donde calcular la derivada
 * @param h - Paso (por defecto 1e-5)
 * @returns Valor aproximado de g'(x)
 */
export function numericalDerivative(g: (x: number) => number, x: number, h: number = 1e-5): number {
  try {
    const gPlus = g(x + h);
    const gMinus = g(x - h);
    return (gPlus - gMinus) / (2 * h);
  } catch {
    return NaN;
  }
}

/**
 * Apply Aitken's delta-squared acceleration method
 * Formula: x̂ₙ = xₙ - (xₙ₊₁ - xₙ)² / (xₙ₊₂ - 2xₙ₊₁ + xₙ)
 */
export function aitkenAcceleration(xn: number, xn1: number, xn2: number): number {
  const denominator = xn2 - 2 * xn1 + xn;
  
  // Avoid division by zero
  if (Math.abs(denominator) < 1e-10) {
    return xn2;
  }
  
  const numerator = Math.pow(xn1 - xn, 2);
  return xn - numerator / denominator;
}

/**
 * Execute fixed point iteration method with numerical rigor
 * Implements:
 * - Unit-aware function transformation (degrees/radians)
 * - Convergence check via derivative g'(x₀)
 * - Dual convergence criteria: tolerance and significant figures
 * - Numerical derivative estimation
 * - Full precision maintenance (no internal rounding)
 * - Comprehensive error handling
 */
export function fixedPointIteration(options: FixedPointOptions): FixedPointResult {
  const { 
    gFunction, 
    x0: x0Input, 
    tolerance, 
    maxIterations, 
    stopCriterion,
    errorType = 'absolute',
    useAitken,
    significantFigures = 6,
    angleUnit
  } = options;
  
  const iterations: IterationResult[] = [];
  let convergenceCriterion = '';
  let derivativeWarning: string | undefined;
  let derivativeValue: number | undefined;
  
  try {
    // 1. VALIDATE ANGLE UNIT (REQUIRED)
    if (!angleUnit || (angleUnit !== 'radians' && angleUnit !== 'degrees')) {
      throw new Error('angleUnit must be specified as "radians" or "degrees"');
    }
    
    // 2. VALIDATE NUMERIC INPUTS
    if (!isFinite(x0Input) || isNaN(x0Input)) {
      throw new Error('Initial value x₀ must be a valid finite number');
    }
    
    if (!isFinite(tolerance) || isNaN(tolerance) || tolerance <= 0) {
      throw new Error('Tolerance must be a positive finite number');
    }
    
    if (!isFinite(maxIterations) || isNaN(maxIterations) || maxIterations < 1) {
      throw new Error('Maximum iterations must be a positive integer');
    }
    
    // 3. VALIDATE FUNCTION STRING
    if (!gFunction || typeof gFunction !== 'string' || gFunction.trim().length === 0) {
      throw new Error('Function g(x) must be a non-empty string');
    }
    
    if (gFunction.length > 1000) {
      throw new Error('Function string is too long (maximum 1000 characters)');
    }
    
    // 4. TRANSFORM FUNCTION FOR SELECTED UNIT
    // If user selects degrees, transform trig functions to work with degree inputs
    // If user selects radians, no transformation needed
    let transformedFunction: string;
    try {
      transformedFunction = transformFunctionForUnit(gFunction, angleUnit);
    } catch (error) {
      throw new Error(`Failed to transform function for ${angleUnit}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // 5. PREPARE INITIAL VALUE
    // x0Input is assumed to be in the selected angleUnit
    // We work directly in the user's selected unit (no conversion)
    const x0 = x0Input;

    // 6. COMPILE THE TRANSFORMED FUNCTION
    const compiled = math.compile(transformedFunction);
    const g = (x: number): number => {
      const result = compiled.evaluate({ x, pi: Math.PI });
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error(`La función g(x) produjo un valor inválido: ${result}`);
      }
      return result;
    };
    
    // 7. VALIDATE FUNCTION WITH INITIAL VALUE
    let x = x0;
    let gx = g(x);

    // 8. CALCULATE NUMERICAL DERIVATIVE AND CHECK CONVERGENCE
    const gPrime = numericalDerivative(g, x0);
    derivativeValue = gPrime;
    
    if (isFinite(gPrime) && Math.abs(gPrime) > 1) {
      derivativeWarning = `⚠️ El método podría no converger porque |g'(x₀)| = ${Math.abs(gPrime).toFixed(4)} > 1`;
    }
    
    // 9. STORE INITIAL ITERATION (n=0)
    // At iteration 0: xₙ = x₀, g(xₙ) = g(x₀), error = NaN (no previous iteration)
    // IMPORTANT: Store with FULL PRECISION - no rounding
    iterations.push({
      n: 0,
      xn: x,      // FULL PRECISION
      gxn: gx,    // FULL PRECISION
      error: NaN  // Se mostrará como "–"
    });
    
    // 10. ITERATION LOOP: xₙ₊₁ = g(xₙ)
    // CRITICAL: All values maintained at FULL PRECISION throughout
    for (let n = 1; n <= maxIterations; n++) {
      const xPrev = x;  // xₙ
      const xNext = gx;  // xₙ₊₁ = g(xₙ)
      
      // Actualizar para la siguiente iteración
      x = xNext;
      gx = g(x);  // Calcular g(xₙ₊₁) para la siguiente iteración
      
      // Calculate error based on error type (FULL PRECISION)
      let error: number;
      if (errorType === 'relative') {
        // Error relativo: |xₙ₊₁ - xₙ| / |xₙ₊₁|
        const absoluteError = Math.abs(xNext - xPrev);
        error = Math.abs(xNext) > 1e-10 ? absoluteError / Math.abs(xNext) : absoluteError;
      } else {
        // Error absoluto: |xₙ₊₁ - xₙ|
        error = Math.abs(xNext - xPrev);
      }
      
      // Store iteration result with FULL PRECISION (no rounding)
      const iteration: IterationResult = {
        n,
        xn: x,      // xₙ₊₁ - FULL PRECISION
        gxn: gx,    // g(xₙ₊₁) - FULL PRECISION
        error       // Error (absoluto o relativo) - FULL PRECISION
      };
      
      // Aplicar aceleración de Aitken si está habilitada
      if (useAitken && iterations.length >= 2) {
        const xn = iterations[iterations.length - 2].xn;
        const xn1 = iterations[iterations.length - 1].xn;
        const xn2 = x;
        
        const aitkenValue = aitkenAcceleration(xn, xn1, xn2);
        iteration.aitkenValue = aitkenValue;
      }
      
      // 11. CHECK CONVERGENCE BASED ON ERROR TYPE
      if (errorType === 'relative') {
        // For relative error: Stop IMMEDIATELY when error < tolerance
        // No need to check significant figures
        if (error < tolerance) {
          iterations.push(iteration);
          
          convergenceCriterion = `|xₙ₊₁ - xₙ| / |xₙ₊₁| = ${error.toExponential(2)} < ${tolerance}`;
          
          return {
            success: true,
            iterations,
            finalValue: x,  // FULL PRECISION
            finalError: error,
            message: `✅ Converge en ${n} iteraciones`,
            convergenceCriterion,
            derivativeWarning,
            derivativeValue,
            angleUnit  // Include unit in result
          };
        }
        // If not converged, store iteration and continue
        iterations.push(iteration);
      } else {
        // For absolute error: Use BOTH criteria (tolerance + significant figures)
        iterations.push(iteration);
        
        // 12. CONVERGENCE CRITERION: Tolerance check
        const convergedByTolerance = error < tolerance;
        
        // 13. ADDITIONAL CRITERION: Significant figures equality (prevent premature convergence)
        // NOTE: Rounding is ONLY for convergence check, not for storage
        const xRounded = roundSignificant(x, significantFigures);
        const xPrevRounded = roundSignificant(xPrev, significantFigures);
        const convergedBySignificantFigures = xRounded === xPrevRounded;
        
        // Check convergence: BOTH criteria must be met
        if (convergedByTolerance && convergedBySignificantFigures) {
          convergenceCriterion = `|xₙ₊₁ - xₙ| = ${error.toExponential(2)} < ${tolerance} y ${significantFigures} cifras estables`;
          
          return {
            success: true,
            iterations,
            finalValue: x,  // FULL PRECISION
            finalError: error,
            message: `✅ Converge en ${n} iteraciones`,
            convergenceCriterion,
            derivativeWarning,
            derivativeValue,
            angleUnit  // Include unit in result
          };
        }
      }
      
      // 13. CHECK FOR DIVERGENCE
      if (Math.abs(x) > 1e10) {
        return {
          success: false,
          iterations,
          finalValue: x,
          finalError: error,
          message: '❌ El método diverge: los valores crecen sin límite',
          convergenceCriterion: 'Divergencia detectada',
          derivativeWarning,
          derivativeValue,
          angleUnit
        };
      }

      // 14. CHECK FOR OSCILLATION (alternating values)
      if (n > 5) {
        const lastFive = iterations.slice(-5).map(it => it.xn);
        const range = Math.max(...lastFive) - Math.min(...lastFive);
        const avgError = lastFive.slice(1).reduce((sum, val, i) => sum + Math.abs(val - lastFive[i]), 0) / 4;
        
        if (range > 1 && avgError > tolerance * 10) {
          return {
            success: false,
            iterations,
            finalValue: x,
            finalError: error,
            message: '❌ El método oscila sin converger',
            convergenceCriterion: 'Oscilación detectada',
            derivativeWarning,
            derivativeValue,
            angleUnit
          };
        }
      }
    }
    
    // 15. MAXIMUM ITERATIONS REACHED
    return {
      success: false,
      iterations,
      finalValue: x,
      finalError: iterations[iterations.length - 1].error,
      message: `⚠️ Límite de ${maxIterations} iteraciones alcanzado sin convergencia`,
      convergenceCriterion: 'Máximo de iteraciones',
      derivativeWarning,
      derivativeValue,
      angleUnit
    };
    
  } catch (error) {
    if (error instanceof Error) {
      // Syntax errors
      if (error.message.includes('Undefined symbol') || 
          error.message.includes('Unexpected') ||
          error.message.includes('parse')) {
        return {
          success: false,
          iterations: [],
          finalValue: NaN,
          finalError: NaN,
          message: `❌ La función g(x) ingresada no es válida: ${error.message}`,
          convergenceCriterion: 'Error de sintaxis',
          angleUnit: angleUnit || 'radians'
        };
      }
      
      // Other evaluation errors
      return {
        success: false,
        iterations,
        finalValue: NaN,
        finalError: NaN,
        message: `❌ Error al evaluar g(x): ${error.message}`,
        convergenceCriterion: 'Error de evaluación',
        angleUnit: angleUnit || 'radians'
      };
    }
    
    return {
      success: false,
      iterations: [],
      finalValue: NaN,
      finalError: NaN,
      message: '❌ Error desconocido durante el cálculo',
      convergenceCriterion: 'Error desconocido',
      angleUnit: angleUnit || 'radians'
    };
  }
}
