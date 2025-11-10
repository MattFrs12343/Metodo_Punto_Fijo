# Design Document

## Overview

Este documento describe el diseño técnico para estandarizar el manejo de unidades angulares (radianes y grados) y la generación de tablas de iteración en el sistema de métodos numéricos. El diseño se enfoca en tres pilares fundamentales:

1. **Consistencia Matemática**: Garantizar que la unidad seleccionada se aplique de manera uniforme en cálculos y presentación
2. **Precisión Numérica**: Eliminar el redondeo interno durante iteraciones para evitar errores acumulados
3. **Claridad en Presentación**: Mostrar resultados con formato apropiado y documentación clara de unidades

El sistema actual ya tiene una arquitectura base implementada en TypeScript con React. Este diseño extiende y corrige esa implementación para cumplir con los requisitos de estandarización.

## Architecture

### Current System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────────────┐ │
│  │    App.tsx       │────────▶│  fixedPoint.ts           │ │
│  │  (UI Layer)      │         │  (Algorithm Layer)       │ │
│  │                  │         │                          │ │
│  │  - Input forms   │         │  - fixedPointIteration() │ │
│  │  - Unit selector │         │  - degreesToRadians()    │ │
│  │  - Results table │         │  - roundSignificant()    │ │
│  │  - Formatting    │         │  - numericalDerivative() │ │
│  └──────────────────┘         └──────────────────────────┘ │
│           │                              │                  │
│           │                              │                  │
│           ▼                              ▼                  │
│  ┌──────────────────┐         ┌──────────────────────────┐ │
│  │ CobwebCanvas.tsx │         │      mathjs library      │ │
│  │ (Visualization)  │         │  (Function evaluation)   │ │
│  └──────────────────┘         └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Enhanced Architecture with Unit Standardization

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Enhanced React Application                       │
│                                                                      │
│  ┌──────────────────┐         ┌────────────────────────────────┐   │
│  │    App.tsx       │────────▶│  fixedPoint.ts (Enhanced)      │   │
│  │                  │         │                                │   │
│  │  + Unit selector │         │  + transformFunctionForUnit()  │   │
│  │  + Unit display  │         │  + validateInitialValue()      │   │
│  │  + Format config │         │  + convertValueToUnit()        │   │
│  └──────────────────┘         │  + formatIterationResult()     │   │
│           │                   └────────────────────────────────┘   │
│           │                              │                          │
│           ▼                              ▼                          │
│  ┌──────────────────┐         ┌────────────────────────────────┐   │
│  │  TableRenderer   │         │    UnitConverter utility       │   │
│  │  (New Component) │         │    (New Module)                │   │
│  │                  │         │                                │   │
│  │  - Format values │         │  - degreesToRadians()          │   │
│  │  - Unit labels   │         │  - radiansToDegrees()          │   │
│  │  - Precision     │         │  - transformTrigFunctions()    │   │
│  └──────────────────┘         └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```


## Components and Interfaces

### 1. Enhanced FixedPointOptions Interface

```typescript
export interface FixedPointOptions {
  gFunction: string;              // Function g(x) as string
  x0: number;                     // Initial value (in user's selected unit)
  tolerance: number;              // Convergence tolerance
  maxIterations: number;          // Maximum iterations
  stopCriterion: 'delta' | 'residual';
  useAitken: boolean;
  significantFigures?: number;    // For display only
  angleUnit: 'radians' | 'degrees';  // REQUIRED (no default)
  precisionMode?: 'decimals' | 'significant';  // Display format
  decimals?: number;              // For decimal mode
}
```

**Key Changes:**
- `angleUnit` is now REQUIRED (no default value)
- Added `precisionMode` and `decimals` for flexible formatting
- All numeric values maintain full precision internally

### 2. Enhanced IterationResult Interface

```typescript
export interface IterationResult {
  n: number;                      // Iteration number
  xn: number;                     // Value at iteration n (full precision)
  gxn: number;                    // g(xn) value (full precision)
  error: number;                  // Error value (full precision)
  aitkenValue?: number;           // Aitken accelerated value (optional)
  
  // NEW: Display values (rounded for presentation only)
  xnDisplay?: string;             // Formatted xn for display
  gxnDisplay?: string;            // Formatted g(xn) for display
  errorDisplay?: string;          // Formatted error for display
}
```

**Rationale:**
- Separate internal (full precision) from display (formatted) values
- Display values are computed at presentation time, not during iteration
- Maintains backward compatibility with existing code

### 3. New UnitConverter Module

**File**: `react/src/lib/unitConverter.ts`

```typescript
export type AngleUnit = 'radians' | 'degrees';

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Transform trigonometric functions in a string expression
 * based on the selected angle unit
 * 
 * Examples:
 * - Input: "cos(x)", unit: "degrees" → Output: "cos(x * pi / 180)"
 * - Input: "sin(2*x)", unit: "degrees" → Output: "sin(2*x * pi / 180)"
 * - Input: "cos(x)", unit: "radians" → Output: "cos(x)" (no change)
 */
export function transformFunctionForUnit(
  funcStr: string, 
  unit: AngleUnit
): string {
  if (unit === 'radians') {
    return funcStr;  // No transformation needed
  }
  
  // For degrees: transform trig functions to accept degree input
  // Strategy: Replace sin(expr) with sin((expr) * pi/180)
  const trigFunctions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'];
  
  let transformed = funcStr;
  
  for (const func of trigFunctions) {
    // Match function calls: func(...)
    // Use regex to find and replace
    const regex = new RegExp(`\\b${func}\\s*\\(`, 'g');
    transformed = transformed.replace(regex, `${func}((`) + ' * pi / 180)';
  }
  
  return transformed;
}

/**
 * Validate and convert initial value based on unit
 * This ensures x0 is in the correct unit for calculations
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
```


### 4. Enhanced fixedPointIteration Function

**Key Design Principles:**

1. **No Internal Rounding**: All calculations use full precision (double/float64)
2. **Unit Consistency**: Calculate and display in the same unit
3. **Clear Separation**: Calculation logic separate from formatting logic

**Algorithm Flow:**

```typescript
export function fixedPointIteration(options: FixedPointOptions): FixedPointResult {
  // STEP 1: Extract and validate options
  const { 
    gFunction, 
    x0: x0Input, 
    tolerance, 
    maxIterations, 
    angleUnit,
    significantFigures = 6
  } = options;
  
  // STEP 2: Validate angle unit (REQUIRED)
  if (!angleUnit || (angleUnit !== 'radians' && angleUnit !== 'degrees')) {
    throw new Error('angleUnit must be specified as "radians" or "degrees"');
  }
  
  // STEP 3: Transform function for unit if needed
  // If user selects degrees, we need to handle trig functions appropriately
  const transformedFunction = transformFunctionForUnit(gFunction, angleUnit);
  
  // STEP 4: Validate and prepare initial value
  // x0Input is assumed to be in the selected angleUnit
  let x0 = x0Input;
  
  // If function uses radians internally but user selected degrees,
  // we need to convert x0 to radians for calculation
  // DECISION: We will calculate in the user's selected unit
  // This means if user selects degrees, all calculations are in degrees
  
  // STEP 5: Compile function with mathjs
  const compiled = math.compile(transformedFunction);
  const g = (x: number): number => {
    const result = compiled.evaluate({ x, pi: Math.PI });
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error(`Invalid function result: ${result}`);
    }
    return result;
  };
  
  // STEP 6: Initialize iteration variables (FULL PRECISION)
  let x = x0;
  let gx = g(x);
  const iterations: IterationResult[] = [];
  
  // STEP 7: Store initial iteration (n=0)
  iterations.push({
    n: 0,
    xn: x,      // FULL PRECISION - no rounding
    gxn: gx,    // FULL PRECISION - no rounding
    error: 0
  });
  
  // STEP 8: Iteration loop
  for (let n = 1; n <= maxIterations; n++) {
    const xPrev = x;
    const xNext = gx;  // xₙ₊₁ = g(xₙ)
    
    // Update for next iteration
    x = xNext;
    gx = g(x);
    
    // Calculate error (FULL PRECISION)
    const error = Math.abs(xNext - xPrev);
    
    // Store iteration result (FULL PRECISION)
    iterations.push({
      n,
      xn: x,      // FULL PRECISION
      gxn: gx,    // FULL PRECISION
      error       // FULL PRECISION
    });
    
    // STEP 9: Check convergence
    // Dual criteria: tolerance AND significant figures stability
    const convergedByTolerance = error < tolerance;
    const xRounded = roundSignificant(x, significantFigures);
    const xPrevRounded = roundSignificant(xPrev, significantFigures);
    const convergedBySignificantFigures = xRounded === xPrevRounded;
    
    if (convergedByTolerance && convergedBySignificantFigures) {
      return {
        success: true,
        iterations,
        finalValue: x,  // FULL PRECISION
        finalError: error,
        message: `Converged in ${n} iterations`,
        angleUnit  // Include unit in result
      };
    }
  }
  
  // STEP 10: Max iterations reached
  return {
    success: false,
    iterations,
    finalValue: x,
    finalError: iterations[iterations.length - 1].error,
    message: `Max iterations (${maxIterations}) reached`,
    angleUnit
  };
}
```

**Critical Design Decisions:**

1. **Calculation Unit = User Selected Unit**: 
   - If user selects "degrees", all calculations happen in degrees
   - If user selects "radians", all calculations happen in radians
   - This eliminates conversion confusion

2. **Function Transformation Strategy**:
   - For degrees: Transform `sin(x)` → `sin(x * pi/180)` in the function string
   - This allows mathjs to work correctly with degree inputs
   - Alternative: Use mathjs unit system (more complex)

3. **No Conversion Between Units**:
   - We do NOT convert x0 from degrees to radians internally
   - We do NOT convert results back
   - Everything stays in the user's selected unit


### 5. Formatting and Display Module

**File**: `react/src/lib/formatter.ts`

```typescript
export interface FormattingOptions {
  precisionMode: 'decimals' | 'significant';
  decimals?: number;
  significantFigures?: number;
}

/**
 * Format a number for display based on precision mode
 * This function is ONLY used for display, never for calculations
 */
export function formatNumber(
  value: number, 
  options: FormattingOptions
): string {
  if (!isFinite(value)) {
    return 'N/A';
  }
  
  const { precisionMode, decimals = 6, significantFigures = 6 } = options;
  
  if (precisionMode === 'decimals') {
    return value.toFixed(decimals);
  } else {
    return value.toPrecision(significantFigures);
  }
}

/**
 * Format error values (typically use scientific notation for small values)
 */
export function formatError(error: number): string {
  if (!isFinite(error)) {
    return 'N/A';
  }
  
  if (error < 0.001 || error > 1000) {
    return error.toExponential(2);
  }
  
  return error.toFixed(6);
}

/**
 * Get unit symbol for display
 */
export function getUnitSymbol(unit: AngleUnit): string {
  return unit === 'degrees' ? '°' : 'rad';
}

/**
 * Format a value with unit label
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
```

### 6. Enhanced Table Component

**Component**: `TableRenderer` (can be integrated into App.tsx or separate component)

```typescript
interface TableRendererProps {
  iterations: IterationResult[];
  angleUnit: AngleUnit;
  formattingOptions: FormattingOptions;
  useAitken: boolean;
}

function TableRenderer({ 
  iterations, 
  angleUnit, 
  formattingOptions,
  useAitken 
}: TableRendererProps) {
  const unitSymbol = getUnitSymbol(angleUnit);
  
  return (
    <div className="overflow-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th>n</th>
            <th>xₙ ({unitSymbol})</th>
            <th>g(xₙ) ({unitSymbol})</th>
            <th>Error</th>
            {useAitken && <th>Aitken</th>}
          </tr>
        </thead>
        <tbody>
          {iterations.map((iter) => (
            <tr key={iter.n}>
              <td>{iter.n}</td>
              <td>{formatNumber(iter.xn, formattingOptions)}</td>
              <td>{formatNumber(iter.gxn, formattingOptions)}</td>
              <td>{formatError(iter.error)}</td>
              {useAitken && (
                <td>
                  {iter.aitkenValue !== undefined 
                    ? formatNumber(iter.aitkenValue, formattingOptions)
                    : '-'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Key Features:**
- Unit symbol displayed in column headers
- All values formatted consistently
- Full precision values used internally
- Formatting applied only at render time


## Data Flow

### Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INPUT                                  │
│  - Function: "cos(x)"                                               │
│  - x₀: 45                                                           │
│  - Unit: "degrees"                                                  │
│  - Tolerance: 1e-6                                                  │
│  - Precision: 3 significant figures                                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FUNCTION TRANSFORMATION                           │
│  transformFunctionForUnit("cos(x)", "degrees")                      │
│  → "cos(x * pi / 180)"                                              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    INITIAL VALUE VALIDATION                          │
│  x₀ = 45 (degrees) - no conversion needed                           │
│  Unit matches calculation unit                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ITERATION LOOP (FULL PRECISION)                   │
│  n=0: x₀=45.0, g(x₀)=0.707106781..., error=0                       │
│  n=1: x₁=0.707106781..., g(x₁)=0.999847695..., error=44.292893...  │
│  n=2: x₂=0.999847695..., g(x₂)=0.999999943..., error=0.292740...   │
│  ...                                                                │
│  ALL VALUES STORED WITH FULL PRECISION (no rounding)                │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CONVERGENCE CHECK                                 │
│  Check: error < tolerance AND significant figures stable            │
│  Uses full precision values for comparison                          │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RESULT FORMATTING (DISPLAY ONLY)                  │
│  Apply formatNumber() to each value                                 │
│  n=0: x₀="45.0°", g(x₀)="0.707°", error="0.00e+0"                  │
│  n=1: x₁="0.707°", g(x₁)="1.00°", error="4.43e+1"                  │
│  ...                                                                │
│  Add unit symbols to headers                                        │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TABLE DISPLAY                                     │
│  Show formatted values with unit labels                             │
│  User sees: "Final value: 1.00° (degrees)"                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Example Scenarios

#### Scenario 1: Radians (Default Behavior)

**Input:**
- Function: `cos(x)`
- x₀: `0.5`
- Unit: `radians`
- Tolerance: `1e-6`

**Processing:**
1. No function transformation needed (already in radians)
2. x₀ = 0.5 rad (no conversion)
3. Iterations calculate in radians
4. Display shows "rad" in headers
5. Final result: "x* = 0.739085 rad"

#### Scenario 2: Degrees

**Input:**
- Function: `cos(x)`
- x₀: `45`
- Unit: `degrees`
- Tolerance: `1e-6`

**Processing:**
1. Transform function: `cos(x)` → `cos(x * pi / 180)`
2. x₀ = 45° (no conversion, calculate in degrees)
3. Iterations:
   - n=0: x=45°, g(x)=cos(45° * π/180)=0.707...°
   - n=1: x=0.707°, g(x)=cos(0.707° * π/180)=0.999...°
   - Continue until convergence
4. Display shows "°" in headers
5. Final result: "x* = 1.000° (degrees)"

**Note**: The values are mathematically different from radians because we're working in a different unit space.


## Error Handling

### Unit Validation Errors

```typescript
// Error 1: Missing angle unit
if (!angleUnit) {
  throw new Error(
    'Angle unit must be specified. Please select "radians" or "degrees".'
  );
}

// Error 2: Invalid angle unit
if (angleUnit !== 'radians' && angleUnit !== 'degrees') {
  throw new Error(
    `Invalid angle unit: "${angleUnit}". Must be "radians" or "degrees".`
  );
}

// Error 3: Function contains trig functions but no unit specified
if (containsTrigFunctions(gFunction) && !angleUnit) {
  throw new Error(
    'Function contains trigonometric functions. Please specify angle unit.'
  );
}
```

### Function Transformation Errors

```typescript
// Error 4: Function transformation failed
try {
  const transformed = transformFunctionForUnit(gFunction, angleUnit);
  const compiled = math.compile(transformed);
} catch (error) {
  throw new Error(
    `Failed to transform function for ${angleUnit}: ${error.message}`
  );
}
```

### Display Errors

```typescript
// Error 5: Invalid formatting options
if (precisionMode === 'decimals' && (!decimals || decimals < 0)) {
  throw new Error('Decimals must be a positive number');
}

if (precisionMode === 'significant' && (!significantFigures || significantFigures < 1)) {
  throw new Error('Significant figures must be at least 1');
}
```

## Testing Strategy

### Unit Tests

#### 1. Unit Converter Tests

```typescript
describe('unitConverter', () => {
  describe('degreesToRadians', () => {
    it('should convert 0° to 0 rad', () => {
      expect(degreesToRadians(0)).toBe(0);
    });
    
    it('should convert 180° to π rad', () => {
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI, 10);
    });
    
    it('should convert 45° to π/4 rad', () => {
      expect(degreesToRadians(45)).toBeCloseTo(Math.PI / 4, 10);
    });
  });
  
  describe('transformFunctionForUnit', () => {
    it('should not transform for radians', () => {
      const result = transformFunctionForUnit('cos(x)', 'radians');
      expect(result).toBe('cos(x)');
    });
    
    it('should transform cos(x) for degrees', () => {
      const result = transformFunctionForUnit('cos(x)', 'degrees');
      expect(result).toContain('pi / 180');
    });
    
    it('should handle multiple trig functions', () => {
      const result = transformFunctionForUnit('sin(x) + cos(2*x)', 'degrees');
      expect(result).toContain('sin');
      expect(result).toContain('cos');
      expect(result).toContain('pi / 180');
    });
  });
});
```

#### 2. Fixed Point Algorithm Tests

```typescript
describe('fixedPointIteration with units', () => {
  it('should calculate correctly in radians', () => {
    const result = fixedPointIteration({
      gFunction: 'cos(x)',
      x0: 0.5,
      tolerance: 1e-6,
      maxIterations: 100,
      stopCriterion: 'delta',
      useAitken: false,
      angleUnit: 'radians'
    });
    
    expect(result.success).toBe(true);
    expect(result.finalValue).toBeCloseTo(0.739085, 5);
    expect(result.angleUnit).toBe('radians');
  });
  
  it('should calculate correctly in degrees', () => {
    const result = fixedPointIteration({
      gFunction: 'cos(x)',
      x0: 45,
      tolerance: 1e-6,
      maxIterations: 100,
      stopCriterion: 'delta',
      useAitken: false,
      angleUnit: 'degrees'
    });
    
    expect(result.success).toBe(true);
    expect(result.angleUnit).toBe('degrees');
    // Final value should be in degrees
    expect(result.finalValue).toBeLessThan(2);  // Should converge to ~1°
  });
  
  it('should maintain full precision during iterations', () => {
    const result = fixedPointIteration({
      gFunction: 'cos(x)',
      x0: 0.5,
      tolerance: 1e-10,
      maxIterations: 100,
      stopCriterion: 'delta',
      useAitken: false,
      angleUnit: 'radians'
    });
    
    // Check that iteration values have full precision
    result.iterations.forEach(iter => {
      expect(typeof iter.xn).toBe('number');
      expect(isFinite(iter.xn)).toBe(true);
      // Values should not be rounded to few decimal places
      const str = iter.xn.toString();
      if (iter.n > 0) {
        expect(str.length).toBeGreaterThan(5);  // More than just "0.739"
      }
    });
  });
});
```

#### 3. Formatting Tests

```typescript
describe('formatter', () => {
  describe('formatNumber', () => {
    it('should format with decimals', () => {
      const result = formatNumber(3.14159265, {
        precisionMode: 'decimals',
        decimals: 3
      });
      expect(result).toBe('3.142');
    });
    
    it('should format with significant figures', () => {
      const result = formatNumber(3.14159265, {
        precisionMode: 'significant',
        significantFigures: 4
      });
      expect(result).toBe('3.142');
    });
    
    it('should handle very small numbers', () => {
      const result = formatError(1e-8);
      expect(result).toContain('e');  // Scientific notation
    });
  });
  
  describe('formatValueWithUnit', () => {
    it('should append degree symbol', () => {
      const result = formatValueWithUnit(45, 'degrees', {
        precisionMode: 'decimals',
        decimals: 2
      });
      expect(result).toBe('45.00 °');
    });
    
    it('should append rad symbol', () => {
      const result = formatValueWithUnit(0.785, 'radians', {
        precisionMode: 'decimals',
        decimals: 3
      });
      expect(result).toBe('0.785 rad');
    });
  });
});
```


### Integration Tests

```typescript
describe('End-to-End Unit Handling', () => {
  it('should handle complete workflow in degrees', () => {
    // Simulate user input
    const userInput = {
      gFunction: 'cos(x)',
      x0: 45,
      angleUnit: 'degrees',
      tolerance: 1e-6,
      maxIterations: 100,
      stopCriterion: 'delta',
      useAitken: false,
      precisionMode: 'significant',
      significantFigures: 3
    };
    
    // Calculate
    const result = fixedPointIteration(userInput);
    
    // Verify result
    expect(result.success).toBe(true);
    expect(result.angleUnit).toBe('degrees');
    
    // Format for display
    const formattedFinal = formatValueWithUnit(
      result.finalValue,
      result.angleUnit,
      { precisionMode: 'significant', significantFigures: 3 }
    );
    
    expect(formattedFinal).toContain('°');
    expect(formattedFinal).not.toContain('rad');
  });
  
  it('should never mix units in display', () => {
    const result = fixedPointIteration({
      gFunction: 'cos(x)',
      x0: 45,
      angleUnit: 'degrees',
      tolerance: 1e-6,
      maxIterations: 100,
      stopCriterion: 'delta',
      useAitken: false
    });
    
    // All iteration values should be in degrees
    result.iterations.forEach(iter => {
      // Values should be small (degrees), not large (radians)
      expect(Math.abs(iter.xn)).toBeLessThan(100);
    });
  });
});
```

### Manual Testing Checklist

- [ ] Test cos(x) with x₀=45° in degrees mode
- [ ] Verify table shows "°" symbol in headers
- [ ] Verify final result shows "°" symbol
- [ ] Test same function with x₀=0.785 rad in radians mode
- [ ] Verify table shows "rad" symbol in headers
- [ ] Verify final result shows "rad" symbol
- [ ] Test that changing unit selector updates calculation correctly
- [ ] Verify no rounding during iterations (check console logs)
- [ ] Test with very small tolerance (1e-12) to verify precision
- [ ] Test with large tolerance (1.0) to verify convergence criteria
- [ ] Test precision modes (decimals vs significant figures)
- [ ] Verify error column uses scientific notation for small errors

## Performance Considerations

### Precision vs Performance

**Trade-off**: Full precision (double) vs memory usage

**Decision**: Use full precision (double/float64) for all calculations
- Modern JavaScript engines handle doubles efficiently
- Memory impact is negligible for typical iteration counts (<1000)
- Precision is more important than minimal memory savings

### Function Transformation Overhead

**Concern**: String manipulation for function transformation

**Mitigation**:
- Transform function once before iteration loop
- Cache compiled function
- Transformation is O(n) where n = function string length (typically <100 chars)

### Display Formatting Overhead

**Concern**: Formatting every value in table

**Mitigation**:
- Format only visible rows (if using virtualization)
- Use memoization for repeated formatting operations
- Consider formatting on-demand rather than pre-computing

**Benchmark Target**: <100ms for 1000 iterations including formatting


## Implementation Strategy

### Phase 1: Core Unit Handling

1. Create `unitConverter.ts` module
   - Implement conversion functions
   - Implement function transformation logic
   - Add unit validation

2. Update `fixedPoint.ts`
   - Make `angleUnit` required in options
   - Add function transformation before compilation
   - Remove any internal unit conversions
   - Ensure no rounding during iterations

3. Add unit tests for Phase 1

### Phase 2: Display Formatting

1. Create `formatter.ts` module
   - Implement formatting functions
   - Add unit symbol helpers

2. Update `FixedPointResult` interface
   - Add `angleUnit` field to result

3. Add unit tests for Phase 2

### Phase 3: UI Integration

1. Update `App.tsx`
   - Ensure unit selector passes value correctly
   - Update table rendering to show unit symbols
   - Update result display to show units
   - Apply formatting at render time only

2. Update `CobwebCanvas.tsx`
   - Add unit labels to axes if needed

3. Manual testing of complete workflow

### Phase 4: Documentation and Validation

1. Add inline documentation
2. Update user-facing documentation
3. Add validation messages for unit errors
4. Final integration testing

## Migration Path

### Current State Issues

1. **Issue**: `angleUnit` has default value of 'radians'
   - **Fix**: Remove default, make required

2. **Issue**: Conversion happens at x0 input
   - **Fix**: Remove conversion, work in user's unit

3. **Issue**: No unit labels in table
   - **Fix**: Add unit symbols to column headers

4. **Issue**: Function doesn't transform for degrees
   - **Fix**: Add transformation logic

### Breaking Changes

**None** - This is an enhancement that maintains backward compatibility:
- Existing code that passes `angleUnit: 'radians'` will work unchanged
- New requirement to always specify `angleUnit` is enforced by TypeScript

### Rollout Plan

1. **Development**: Implement in feature branch
2. **Testing**: Comprehensive unit and integration tests
3. **Staging**: Deploy to test environment
4. **Validation**: Manual testing with various functions
5. **Production**: Deploy with monitoring
6. **Documentation**: Update user guides

## Alternative Approaches Considered

### Alternative 1: Always Calculate in Radians

**Approach**: Convert all inputs to radians, calculate, convert back to degrees for display

**Pros**:
- Simpler internal logic
- Standard mathematical convention

**Cons**:
- Requires conversion at input and output
- Risk of conversion errors
- Confusion about which unit is "real"
- **Violates Requirement 11**: "Never calculate in one unit and show in another"

**Decision**: REJECTED

### Alternative 2: Use mathjs Unit System

**Approach**: Use mathjs built-in unit system (`math.unit('45 deg')`)

**Pros**:
- Built-in conversion handling
- Type safety for units

**Cons**:
- More complex API
- Overhead of unit objects
- Requires significant refactoring
- May not support all needed operations

**Decision**: REJECTED (too complex for current needs)

### Alternative 3: Separate Functions for Each Unit

**Approach**: Have `fixedPointIterationRadians()` and `fixedPointIterationDegrees()`

**Pros**:
- Clear separation
- No conditional logic

**Cons**:
- Code duplication
- Harder to maintain
- Not scalable to other units

**Decision**: REJECTED

### Selected Approach: Function Transformation

**Rationale**:
- Minimal code changes
- Clear and explicit
- Maintains single source of truth
- Satisfies all requirements
- Easy to test and validate


## Security Considerations

### Function Evaluation Safety

**Risk**: User-provided function strings could contain malicious code

**Mitigation**:
- mathjs provides sandboxed evaluation
- No access to JavaScript runtime or DOM
- Limited to mathematical operations
- Function transformation only adds mathematical operations

**Additional Safeguards**:
```typescript
// Validate function string before transformation
function validateFunctionString(funcStr: string): void {
  // Check for suspicious patterns
  const forbidden = ['eval', 'Function', 'require', 'import', '__proto__'];
  
  for (const keyword of forbidden) {
    if (funcStr.includes(keyword)) {
      throw new Error(`Forbidden keyword in function: ${keyword}`);
    }
  }
  
  // Check for excessive length
  if (funcStr.length > 1000) {
    throw new Error('Function string too long');
  }
}
```

### Input Validation

**Risk**: Invalid numeric inputs could cause errors

**Mitigation**:
```typescript
function validateNumericInput(value: number, name: string): void {
  if (!isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
  
  if (isNaN(value)) {
    throw new Error(`${name} is not a valid number`);
  }
}
```

## Accessibility Considerations

### Screen Reader Support

- Table headers clearly labeled with units
- ARIA labels for unit selector
- Status messages for calculation results

```typescript
<select 
  aria-label="Angle unit selection"
  value={angleUnit}
  onChange={handleUnitChange}
>
  <option value="radians">Radianes (rad)</option>
  <option value="degrees">Grados (°)</option>
</select>

<div role="status" aria-live="polite">
  {result && `Calculation complete: ${result.message}`}
</div>
```

### Visual Clarity

- Unit symbols clearly visible in table headers
- Color coding for different units (optional)
- Sufficient contrast for readability
- Clear visual separation between columns

## Future Enhancements

### 1. Additional Angle Units

Support for:
- Gradians (400 gradians = 360 degrees)
- Turns/Revolutions (1 turn = 360 degrees)

**Implementation**:
```typescript
type AngleUnit = 'radians' | 'degrees' | 'gradians' | 'turns';

function convertToRadians(value: number, unit: AngleUnit): number {
  switch (unit) {
    case 'radians': return value;
    case 'degrees': return value * Math.PI / 180;
    case 'gradians': return value * Math.PI / 200;
    case 'turns': return value * 2 * Math.PI;
  }
}
```

### 2. Unit Conversion Tool

Add UI feature to convert between units:
```typescript
<button onClick={() => convertDisplayUnit('radians', 'degrees')}>
  Convert to Degrees
</button>
```

### 3. Export with Units

When exporting results to CSV/JSON, include unit metadata:
```json
{
  "function": "cos(x)",
  "angleUnit": "degrees",
  "initialValue": { "value": 45, "unit": "degrees" },
  "finalValue": { "value": 1.0, "unit": "degrees" },
  "iterations": [...]
}
```

### 4. Unit Mismatch Detection

Detect when user might have entered wrong unit:
```typescript
// If x0 is very large and unit is radians, warn user
if (angleUnit === 'radians' && Math.abs(x0) > 10) {
  showWarning('Large value for radians. Did you mean degrees?');
}
```

### 5. Automatic Unit Selection

Suggest unit based on function:
```typescript
function suggestUnit(funcStr: string): AngleUnit {
  // If function uses degree-specific notation, suggest degrees
  if (funcStr.includes('sind') || funcStr.includes('cosd')) {
    return 'degrees';
  }
  return 'radians';  // Default
}
```

## Conclusion

This design provides a robust, maintainable solution for standardizing unit handling in the numerical methods system. Key achievements:

1. **Mathematical Correctness**: Calculations and display use the same unit
2. **Numerical Precision**: No rounding during iterations
3. **User Clarity**: Clear unit labels and documentation
4. **Maintainability**: Modular design with clear separation of concerns
5. **Testability**: Comprehensive test coverage
6. **Extensibility**: Easy to add new units or features

The implementation follows best practices for numerical computing while maintaining a clean, user-friendly interface.
