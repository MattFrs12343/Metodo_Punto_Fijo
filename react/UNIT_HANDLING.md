# Unit Handling Documentation

## Overview

This document describes how the Fixed Point Iteration application handles angle units (radians and degrees) to ensure mathematical correctness and consistency between calculations and display.

## Core Principles

### 1. No Hidden Conversions
- **Rule**: The system NEVER calculates in one unit and displays in another
- **Implementation**: If the user selects "degrees", all calculations happen in degrees
- **Rationale**: Eliminates confusion and ensures transparency

### 2. Full Precision Maintenance
- **Rule**: NO rounding during internal iterations
- **Implementation**: All values stored as `number` (double precision / float64)
- **Rationale**: Prevents accumulated rounding errors that could affect convergence

### 3. Formatting Only at Display Time
- **Rule**: Rounding/formatting applied ONLY when rendering to UI
- **Implementation**: Separate `formatter.ts` module handles all display formatting
- **Rationale**: Keeps calculation logic separate from presentation logic

## Architecture

```
User Input (with unit selection)
    ↓
Function Transformation (if degrees)
    ↓
Calculation (in selected unit, full precision)
    ↓
Storage (full precision values)
    ↓
Display Formatting (rounded for readability)
    ↓
UI Rendering (with unit labels)
```

## Module Responsibilities

### `unitConverter.ts`
- **Purpose**: Handle unit conversions and function transformations
- **Key Functions**:
  - `degreesToRadians()`: Convert degrees to radians
  - `radiansToDegrees()`: Convert radians to degrees
  - `transformFunctionForUnit()`: Transform trig functions for degree input
  - `validateInitialValue()`: Validate and convert initial value if needed

**Example Transformation**:
```typescript
// Input: "cos(x)", unit: "degrees"
// Output: "cos(x * pi / 180)"
// This allows mathjs to work with degree inputs correctly
```

### `formatter.ts`
- **Purpose**: Format numerical values for display ONLY
- **Key Functions**:
  - `formatNumber()`: Format with decimals or significant figures
  - `formatError()`: Format error values (scientific notation for small values)
  - `getUnitSymbol()`: Get "°" or "rad" symbol
  - `formatValueWithUnit()`: Combine value and unit symbol

**Important**: These functions are NEVER used during calculations

### `fixedPoint.ts`
- **Purpose**: Core algorithm implementation
- **Key Changes**:
  - `angleUnit` is now REQUIRED (no default value)
  - Function transformation applied before compilation
  - All iteration values stored with full precision
  - `angleUnit` included in result for display

## Usage Examples

### Example 1: Radians (Standard)

```typescript
const result = fixedPointIteration({
  gFunction: 'cos(x)',
  x0: 0.5,
  tolerance: 1e-6,
  maxIterations: 100,
  stopCriterion: 'delta',
  useAitken: false,
  angleUnit: 'radians'  // REQUIRED
});

// Result:
// - Calculations in radians
// - No function transformation
// - Final value: ~0.739085 rad
// - Table shows "xₙ (rad)" in headers
```

### Example 2: Degrees

```typescript
const result = fixedPointIteration({
  gFunction: 'cos(x)',
  x0: 45,
  tolerance: 1e-6,
  maxIterations: 100,
  stopCriterion: 'delta',
  useAitken: false,
  angleUnit: 'degrees'  // REQUIRED
});

// Processing:
// 1. Function transformed: "cos(x)" → "cos(x * pi / 180)"
// 2. x0 = 45° (no conversion, calculate in degrees)
// 3. Iterations:
//    - n=0: x=45°, g(x)=cos(45° * π/180)=0.707...°
//    - n=1: x=0.707°, g(x)=cos(0.707° * π/180)=0.999...°
//    - Continue until convergence
// 4. Final value: ~1.000°
// 5. Table shows "xₙ (°)" in headers
```

## Data Flow

### Calculation Phase (Full Precision)

```typescript
// Step 1: Validate unit
if (!angleUnit || (angleUnit !== 'radians' && angleUnit !== 'degrees')) {
  throw new Error('angleUnit must be specified');
}

// Step 2: Transform function for unit
const transformedFunction = transformFunctionForUnit(gFunction, angleUnit);

// Step 3: Compile and iterate (FULL PRECISION)
for (let n = 1; n <= maxIterations; n++) {
  x = g(x);  // NO ROUNDING HERE
  error = Math.abs(x - xPrev);  // FULL PRECISION
  
  iterations.push({
    n,
    xn: x,      // FULL PRECISION (e.g., 0.7390851332151607)
    gxn: gx,    // FULL PRECISION
    error       // FULL PRECISION
  });
}
```

### Display Phase (Formatted)

```typescript
// In App.tsx - render time only
<td>{formatNumber(iter.xn)}</td>  // Now formatted: "0.739085"
<td>{formatError(iter.error)}</td>  // Now formatted: "1.23e-6"

// Table headers show unit
<th>xₙ ({getUnitSymbol(result.angleUnit)})</th>  // "xₙ (rad)" or "xₙ (°)"
```

## Validation

### Required Validations

1. **Angle Unit**: Must be 'radians' or 'degrees'
2. **Initial Value**: Must be finite number
3. **Tolerance**: Must be positive finite number
4. **Max Iterations**: Must be positive integer
5. **Function String**: Must be non-empty, < 1000 chars

### Error Messages

```typescript
// Missing unit
"angleUnit must be specified as 'radians' or 'degrees'"

// Invalid initial value
"Initial value x₀ must be a valid finite number"

// Invalid tolerance
"Tolerance must be a positive finite number"

// Function transformation error
"Failed to transform function for degrees: [error details]"
```

## Testing

### Unit Tests

```typescript
// Test 1: Radians calculation
expect(fixedPointIteration({
  gFunction: 'cos(x)',
  x0: 0.5,
  angleUnit: 'radians',
  ...
}).finalValue).toBeCloseTo(0.739085, 5);

// Test 2: Degrees calculation
expect(fixedPointIteration({
  gFunction: 'cos(x)',
  x0: 45,
  angleUnit: 'degrees',
  ...
}).finalValue).toBeLessThan(2);  // Should converge to ~1°

// Test 3: Full precision maintained
const result = fixedPointIteration({...});
result.iterations.forEach(iter => {
  expect(typeof iter.xn).toBe('number');
  expect(isFinite(iter.xn)).toBe(true);
  // Values should not be rounded to few decimals
  const str = iter.xn.toString();
  if (iter.n > 0) {
    expect(str.length).toBeGreaterThan(5);
  }
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

## Common Pitfalls

### ❌ DON'T: Convert internally and display differently
```typescript
// WRONG
let x0 = x0Input;
if (angleUnit === 'degrees') {
  x0 = degreesToRadians(x0Input);  // Converting to radians
}
// ... calculate in radians ...
// ... display in degrees (INCONSISTENT!)
```

### ✅ DO: Work in user's selected unit
```typescript
// CORRECT
const transformedFunction = transformFunctionForUnit(gFunction, angleUnit);
const x0 = x0Input;  // No conversion
// ... calculate in user's unit ...
// ... display in same unit (CONSISTENT!)
```

### ❌ DON'T: Round during iterations
```typescript
// WRONG
x = Math.round(g(x) * 1000) / 1000;  // Rounding during iteration
```

### ✅ DO: Maintain full precision
```typescript
// CORRECT
x = g(x);  // Full precision maintained
// ... later, only for display:
formatNumber(x)  // Rounded only for UI
```

## Future Enhancements

### Additional Units
- Gradians (400 gradians = 360 degrees)
- Turns/Revolutions (1 turn = 360 degrees)

### Unit Conversion Tool
- Add UI button to convert results between units
- Export results with unit metadata

### Automatic Unit Detection
- Suggest unit based on function notation
- Warn if x₀ value seems wrong for selected unit

## References

- [mathjs Documentation](https://mathjs.org/)
- [IEEE 754 Double Precision](https://en.wikipedia.org/wiki/Double-precision_floating-point_format)
- [Numerical Methods Best Practices](https://en.wikipedia.org/wiki/Numerical_analysis)
