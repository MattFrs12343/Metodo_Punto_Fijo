/**
 * Unit Converter Module
 * 
 * Provides utilities for converting between angle units (radians and degrees)
 * and transforming trigonometric functions to work with the selected unit.
 */

export type AngleUnit = 'radians' | 'degrees';

/**
 * Convert degrees to radians
 * Formula: radians = degrees × (π / 180)
 * 
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 * 
 * @example
 * degreesToRadians(180) // Returns π (3.14159...)
 * degreesToRadians(45)  // Returns π/4 (0.78539...)
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * Formula: degrees = radians × (180 / π)
 * 
 * @param radians - Angle in radians
 * @returns Angle in degrees
 * 
 * @example
 * radiansToDegrees(Math.PI)     // Returns 180
 * radiansToDegrees(Math.PI / 4) // Returns 45
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Transform trigonometric functions in a string expression based on the selected angle unit
 * 
 * Strategy:
 * - For radians: No transformation needed (standard behavior)
 * - For degrees: Transform trig functions to accept degree input by multiplying argument by π/180
 * 
 * Examples:
 * - Input: "cos(x)", unit: "degrees" → Output: "cos(x * pi / 180)"
 * - Input: "sin(2*x) + cos(x)", unit: "degrees" → Output: "sin((2*x) * pi / 180) + cos((x) * pi / 180)"
 * - Input: "cos(x)", unit: "radians" → Output: "cos(x)" (no change)
 * 
 * @param funcStr - Function string (e.g., "cos(x)", "sin(x) + tan(2*x)")
 * @param unit - Angle unit ('radians' or 'degrees')
 * @returns Transformed function string
 */
export function transformFunctionForUnit(funcStr: string, unit: AngleUnit): string {
  if (unit === 'radians') {
    return funcStr; // No transformation needed for radians
  }
  
  // For degrees: transform trig functions to accept degree input
  // We need to multiply the argument by pi/180 to convert degrees to radians
  
  const trigFunctions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sec', 'csc', 'cot'];
  
  let transformed = funcStr;
  
  // Process each trigonometric function
  for (const func of trigFunctions) {
    // Match function calls: func(...) where ... is the argument
    // We need to be careful with nested functions and parentheses
    
    // Use a regex to find function calls
    // Pattern: \b{func}\s*\( matches word boundary + function name + optional spaces + opening paren
    const pattern = new RegExp(`\\b${func}\\s*\\(`, 'g');
    
    // Find all matches
    const matches: Array<{ index: number; length: number }> = [];
    let match;
    
    while ((match = pattern.exec(transformed)) !== null) {
      matches.push({ index: match.index, length: match[0].length });
    }
    
    // Process matches in reverse order to maintain correct indices
    for (let i = matches.length - 1; i >= 0; i--) {
      const matchInfo = matches[i];
      const startIndex = matchInfo.index;
      const matchLength = matchInfo.length;
      
      // Find the matching closing parenthesis
      let parenCount = 1;
      let endIndex = startIndex + matchLength;
      
      while (endIndex < transformed.length && parenCount > 0) {
        if (transformed[endIndex] === '(') parenCount++;
        if (transformed[endIndex] === ')') parenCount--;
        endIndex++;
      }
      
      if (parenCount === 0) {
        // Extract the argument (everything between the parentheses)
        const argStart = startIndex + matchLength;
        const argEnd = endIndex - 1;
        const argument = transformed.substring(argStart, argEnd);
        
        // Build the transformed function call
        const funcName = transformed.substring(startIndex, startIndex + matchLength - 1).trim();
        const newCall = `${funcName}((${argument}) * pi / 180)`;
        
        // Replace in the string
        transformed = 
          transformed.substring(0, startIndex) + 
          newCall + 
          transformed.substring(endIndex);
      }
    }
  }
  
  return transformed;
}

/**
 * Validate and convert initial value based on unit
 * 
 * This ensures x0 is in the correct unit for calculations.
 * If inputUnit is specified and different from calculation unit, conversion is performed.
 * 
 * @param x0 - Initial value
 * @param unit - Target calculation unit
 * @param inputUnit - Optional: unit of the input value (if different from calculation unit)
 * @returns Converted x0 value in the target unit
 * 
 * @example
 * // User enters 45 in degrees, but we're calculating in radians
 * validateInitialValue(45, 'radians', 'degrees') // Returns 0.785... (π/4)
 * 
 * // User enters 0.5 in radians, calculating in radians
 * validateInitialValue(0.5, 'radians', 'radians') // Returns 0.5 (no conversion)
 */
export function validateInitialValue(
  x0: number,
  unit: AngleUnit,
  inputUnit?: AngleUnit
): number {
  // If inputUnit is specified and different from calculation unit, convert
  if (inputUnit && inputUnit !== unit) {
    if (inputUnit === 'degrees' && unit === 'radians') {
      return degreesToRadians(x0);
    } else if (inputUnit === 'radians' && unit === 'degrees') {
      return radiansToDegrees(x0);
    }
  }
  
  // Otherwise, assume x0 is already in the correct unit
  return x0;
}

/**
 * Convert a value from internal calculation unit to display unit
 * 
 * @param value - Value in calculation unit
 * @param calculationUnit - Unit used for calculations
 * @param displayUnit - Unit to display
 * @returns Value converted to display unit
 * 
 * @example
 * // Calculated in radians, display in degrees
 * convertValueToDisplayUnit(Math.PI, 'radians', 'degrees') // Returns 180
 */
export function convertValueToDisplayUnit(
  value: number,
  calculationUnit: AngleUnit,
  displayUnit: AngleUnit
): number {
  if (calculationUnit === displayUnit) {
    return value;
  }
  
  if (calculationUnit === 'radians' && displayUnit === 'degrees') {
    return radiansToDegrees(value);
  } else if (calculationUnit === 'degrees' && displayUnit === 'radians') {
    return degreesToRadians(value);
  }
  
  return value;
}
