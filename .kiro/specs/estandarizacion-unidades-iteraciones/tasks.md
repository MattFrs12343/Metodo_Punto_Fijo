# Implementation Plan

- [x] 1. Create unit converter module


  - Create `react/src/lib/unitConverter.ts` file with TypeScript interfaces and types
  - Implement `degreesToRadians()` function for converting degrees to radians
  - Implement `radiansToDegrees()` function for converting radians to degrees
  - Implement `transformFunctionForUnit()` function to transform trigonometric functions based on selected unit
  - Implement `validateInitialValue()` function to validate and convert x₀ if needed
  - Implement `convertValueToDisplayUnit()` function for unit conversion in display
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 7.1, 7.2, 7.3, 11.1, 11.2, 12.1, 12.2_

- [ ]* 1.1 Write unit tests for unitConverter module
  - Create test file for `degreesToRadians()` with test cases for 0°, 45°, 90°, 180°
  - Create test file for `radiansToDegrees()` with test cases for 0, π/4, π/2, π
  - Write tests for `transformFunctionForUnit()` with various trigonometric functions
  - Write tests for edge cases and invalid inputs
  - _Requirements: 1.1, 1.2, 7.1, 7.2_



- [ ] 2. Create formatter module for display
  - Create `react/src/lib/formatter.ts` file with formatting interfaces
  - Implement `formatNumber()` function supporting both decimal and significant figure modes
  - Implement `formatError()` function with scientific notation for small values
  - Implement `getUnitSymbol()` function to return "°" for degrees and "rad" for radians
  - Implement `formatValueWithUnit()` function to combine value and unit symbol
  - _Requirements: 4.1, 4.2, 4.3, 6.1, 6.2, 9.1, 9.2, 10.1, 10.2_

- [ ]* 2.1 Write unit tests for formatter module
  - Write tests for `formatNumber()` with decimals mode
  - Write tests for `formatNumber()` with significant figures mode
  - Write tests for `formatError()` with various error magnitudes


  - Write tests for `getUnitSymbol()` and `formatValueWithUnit()`
  - _Requirements: 10.1, 10.2_

- [ ] 3. Update FixedPointOptions interface
  - Modify `react/src/lib/fixedPoint.ts` to make `angleUnit` a required field (remove default value)


  - Add `precisionMode?: 'decimals' | 'significant'` to interface
  - Add `decimals?: number` to interface for decimal formatting
  - Update TypeScript types to enforce angleUnit requirement
  - _Requirements: 1.1, 8.1, 8.2, 11.1_



- [ ] 4. Update FixedPointResult interface
  - Add `angleUnit: AngleUnit` field to `FixedPointResult` interface
  - Ensure result includes unit information for display purposes
  - Update all return statements in `fixedPointIteration()` to include angleUnit
  - _Requirements: 6.1, 6.2, 9.1, 9.2_

- [ ] 5. Enhance fixedPointIteration function with unit handling
  - Import `transformFunctionForUnit` from unitConverter module
  - Add validation to ensure `angleUnit` is provided and valid
  - Transform function string using `transformFunctionForUnit()` before compilation
  - Remove any existing unit conversion logic for x₀ (work in user's selected unit)
  - Ensure all iteration values are stored with full precision (no rounding)
  - Update convergence check to use full precision values
  - Add angleUnit to all return statements
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 11.1, 11.2, 11.3, 11.4, 12.1, 13.1, 13.2, 13.3_



- [ ]* 5.1 Write integration tests for fixedPointIteration with units
  - Write test for cos(x) with x₀=0.5 in radians mode
  - Write test for cos(x) with x₀=45 in degrees mode
  - Write test to verify full precision is maintained during iterations


  - Write test to verify angleUnit is included in result
  - Write test to verify no unit mixing occurs
  - _Requirements: 1.1, 1.2, 3.1, 11.3, 13.1_

- [ ] 6. Update App.tsx to pass angleUnit correctly
  - Ensure `angleUnit` state is passed to `fixedPointIteration()` call


  - Verify unit selector dropdown updates state correctly
  - Remove any default angleUnit value (make user selection explicit)
  - Add validation to ensure angleUnit is selected before calculation
  - _Requirements: 8.1, 8.2, 8.3, 11.1_

- [x] 7. Update table rendering with unit labels


  - Modify table header in `App.tsx` to include unit symbols in column headers
  - Use `getUnitSymbol()` from formatter module to get appropriate symbol
  - Update column headers: "xₙ (rad)" or "xₙ (°)" based on angleUnit
  - Update "g(xₙ)" column header with unit symbol
  - Ensure Aitken column also shows unit if enabled


  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 6.1, 6.2, 6.3, 9.1, 9.2_

- [ ] 8. Apply formatting at render time only
  - Update table cell rendering to use `formatNumber()` from formatter module
  - Pass `precisionMode`, `decimals`, and `significantFigures` to formatting function
  - Ensure formatting is applied only at render time, not during calculation


  - Update error column to use `formatError()` function
  - Verify that internal iteration values remain at full precision
  - _Requirements: 3.5, 6.4, 10.1, 10.2, 10.3, 10.4, 10.5, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 9. Update result summary display with units


  - Modify "Valor Final" display to include unit symbol using `formatValueWithUnit()`
  - Add unit information to result message (e.g., "x* = 0.739 rad")
  - Ensure all numeric displays show appropriate unit labels
  - Update convergence criterion display to include unit context
  - _Requirements: 9.1, 9.2, 9.3, 9.4_




- [ ] 10. Add unit validation and error handling
  - Add validation in `fixedPointIteration()` to check angleUnit is provided
  - Throw descriptive error if angleUnit is missing or invalid
  - Add try-catch for function transformation errors
  - Display user-friendly error messages in UI for unit-related errors
  - Add validation for formatting options (decimals, significantFigures)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 11. Update CobwebCanvas component for unit awareness
  - Add `angleUnit` prop to CobwebCanvas component interface
  - Update axis labels to include unit symbol if applicable
  - Ensure canvas rendering uses values in correct unit
  - Add unit label to x-axis and y-axis
  - _Requirements: 9.4, 9.5_

- [ ] 12. Add documentation and inline comments
  - Add JSDoc comments to all new functions in unitConverter.ts
  - Add JSDoc comments to all new functions in formatter.ts
  - Document the unit handling strategy in fixedPoint.ts
  - Add inline comments explaining no-rounding policy
  - Update README or user documentation with unit handling information
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 13. Comprehensive testing and validation
  - Test cos(x) with x₀=45° in degrees mode, verify convergence and unit display
  - Test cos(x) with x₀=0.785 rad in radians mode, verify convergence and unit display
  - Test switching between units and recalculating
  - Verify table headers show correct unit symbols
  - Verify no rounding occurs during iterations (check iteration values have full precision)
  - Test with very small tolerance (1e-12) to verify precision is maintained
  - Test with large tolerance (1.0) to verify convergence criteria work correctly
  - Test precision modes (decimals vs significant figures) for display
  - Verify error column uses scientific notation for small errors
  - Test that changing unit selector updates calculation correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 9.1, 9.2, 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_
