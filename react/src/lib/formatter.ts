/**
 * Formatter Module
 * 
 * Provides utilities for formatting numerical values for display.
 * This module is ONLY used for presentation - never for calculations.
 * All internal calculations maintain full precision (double/float64).
 */

import { AngleUnit } from './unitConverter';

export interface FormattingOptions {
  precisionMode: 'decimals' | 'significant';
  decimals?: number;
  significantFigures?: number;
}

/**
 * Format a number for display based on precision mode
 * 
 * IMPORTANT: This function is ONLY used for display, never for calculations.
 * Internal calculations always maintain full precision.
 * 
 * @param value - Number to format
 * @param options - Formatting options (precision mode, decimals, significant figures)
 * @returns Formatted string representation
 * 
 * @example
 * formatNumber(3.14159265, { precisionMode: 'decimals', decimals: 3 })
 * // Returns "3.142"
 * 
 * formatNumber(3.14159265, { precisionMode: 'significant', significantFigures: 4 })
 * // Returns "3.142"
 */
export function formatNumber(value: number, options: FormattingOptions): string {
  if (!isFinite(value)) {
    return 'N/A';
  }
  
  const { precisionMode, decimals = 6, significantFigures = 6 } = options;
  
  if (precisionMode === 'decimals') {
    return value.toFixed(decimals);
  } else {
    // Significant figures mode
    return value.toPrecision(significantFigures);
  }
}

/**
 * Format error values for display
 * 
 * Uses scientific notation for very small or very large values
 * to maintain readability.
 * 
 * @param error - Error value to format
 * @returns Formatted error string
 * 
 * @example
 * formatError(0.000001)  // Returns "1.00e-6"
 * formatError(0.123456)  // Returns "0.123456"
 * formatError(1234.5)    // Returns "1.23e+3"
 * formatError(NaN)       // Returns "–" (for initial iteration)
 */
export function formatError(error: number): string {
  // For initial iteration (n=0), error is NaN
  if (isNaN(error)) {
    return '–';
  }
  
  if (!isFinite(error)) {
    return 'N/A';
  }
  
  // Use scientific notation for very small or very large values
  if (error < 0.001 || error > 1000) {
    return error.toExponential(2);
  }
  
  // Otherwise use fixed decimal notation
  return error.toFixed(6);
}

/**
 * Get unit symbol for display
 * 
 * @param unit - Angle unit ('radians' or 'degrees')
 * @returns Unit symbol ('rad' or '°')
 * 
 * @example
 * getUnitSymbol('radians')  // Returns "rad"
 * getUnitSymbol('degrees')  // Returns "°"
 */
export function getUnitSymbol(unit: AngleUnit): string {
  return unit === 'degrees' ? '°' : 'rad';
}

/**
 * Format a value with unit label
 * 
 * Combines formatted number with appropriate unit symbol.
 * 
 * @param value - Numerical value
 * @param unit - Angle unit
 * @param options - Formatting options
 * @returns Formatted string with unit (e.g., "45.00 °" or "0.785 rad")
 * 
 * @example
 * formatValueWithUnit(45, 'degrees', { precisionMode: 'decimals', decimals: 2 })
 * // Returns "45.00 °"
 * 
 * formatValueWithUnit(0.785398, 'radians', { precisionMode: 'significant', significantFigures: 4 })
 * // Returns "0.7854 rad"
 */
export function formatValueWithUnit(
  value: number,
  unit: AngleUnit,
  options: FormattingOptions
): string {
  const formatted = formatNumber(value, options);
  const symbol = getUnitSymbol(unit);
  return `${formatted} ${symbol}`;
}
