# Testing Checklist - Unit Standardization

## ✅ Compilation Tests

- [x] All TypeScript files compile without errors
- [x] No diagnostic errors in fixedPoint.ts
- [x] No diagnostic errors in unitConverter.ts
- [x] No diagnostic errors in formatter.ts
- [x] No diagnostic errors in App.tsx
- [x] No diagnostic errors in CobwebCanvas.tsx

## 🧪 Functional Tests

### Test Case 1: Radians Mode (Standard Behavior)

**Setup:**
- Function: `cos(x)`
- x₀: `0.5`
- Unit: `Radianes`
- Tolerance: `1e-6`
- Precision: `Cifras Significativas`
- Cifras Sig.: `6`

**Expected Results:**
- ✅ Function should NOT be transformed
- ✅ Calculations should happen in radians
- ✅ Table headers should show "xₙ (rad)", "g(xₙ) (rad)"
- ✅ Final value should be approximately 0.739085 rad
- ✅ Convergence should occur in ~15-20 iterations
- ✅ All iteration values should maintain full precision internally
- ✅ Display values should be formatted to 6 significant figures

**Verification Steps:**
1. Open application at http://localhost:5173
2. Enter function: `cos(x)`
3. Enter x₀: `0.5`
4. Select unit: `Radianes`
5. Set tolerance: `0.000001`
6. Set precision: `Cifras Significativas`
7. Set cifras sig.: `6`
8. Click "🚀 Calcular"
9. Verify table headers show "(rad)"
10. Verify final value shows "rad" symbol
11. Verify convergence to ~0.739085

---

### Test Case 2: Degrees Mode

**Setup:**
- Function: `cos(x)`
- x₀: `45`
- Unit: `Grados (°)`
- Tolerance: `1e-6`
- Precision: `Cifras Significativas`
- Cifras Sig.: `3`

**Expected Results:**
- ✅ Function should be transformed to `cos(x * pi / 180)`
- ✅ Calculations should happen in degrees
- ✅ Table headers should show "xₙ (°)", "g(xₙ) (°)"
- ✅ Initial iteration: x₀=45°, g(x₀)≈0.707°
- ✅ Final value should be approximately 1.0°
- ✅ Convergence should occur
- ✅ All values in table should be in degrees (small numbers, not radians)

**Verification Steps:**
1. Enter function: `cos(x)`
2. Enter x₀: `45`
3. Select unit: `Grados (°)`
4. Set tolerance: `0.000001`
5. Set precision: `Cifras Significativas`
6. Set cifras sig.: `3`
7. Click "🚀 Calcular"
8. Verify table headers show "(°)"
9. Verify first iteration shows x₀=45°, g(x₀)≈0.707°
10. Verify final value shows "°" symbol
11. Verify all xₙ values are small (< 100), indicating degrees not radians

---

### Test Case 3: Unit Switching

**Setup:**
- Start with radians, then switch to degrees

**Expected Results:**
- ✅ Changing unit selector should update the calculation
- ✅ Results should be different for different units
- ✅ Table headers should update to show correct unit symbol
- ✅ No errors should occur during unit switching

**Verification Steps:**
1. Calculate with `cos(x)`, x₀=0.5, unit=Radianes
2. Note the final value (~0.739 rad)
3. Change unit to Grados (°)
4. Click "🚀 Calcular" again
5. Verify final value is different (~42.3°)
6. Verify table headers updated to show "(°)"

---

### Test Case 4: Full Precision Maintenance

**Setup:**
- Function: `cos(x)`
- x₀: `0.5`
- Unit: `Radianes`
- Tolerance: `1e-12` (very small)
- Precision: `Cifras Significativas`
- Cifras Sig.: `15`

**Expected Results:**
- ✅ Algorithm should converge with very small tolerance
- ✅ Iteration values should show many decimal places
- ✅ No premature convergence due to rounding
- ✅ Final error should be < 1e-12

**Verification Steps:**
1. Enter function: `cos(x)`
2. Enter x₀: `0.5`
3. Select unit: `Radianes`
4. Set tolerance: `0.000000000001` (1e-12)
5. Set precision: `Cifras Significativas`
6. Set cifras sig.: `15`
7. Click "🚀 Calcular"
8. Verify iteration values show many decimal places
9. Verify final error is very small (< 1e-12)
10. Verify convergence occurred (not max iterations)

---

### Test Case 5: Large Tolerance with Significant Figures

**Setup:**
- Function: `cos(x)`
- x₀: `45` (radianes)
- Unit: `Radianes`
- Tolerance: `2.9` (large)
- Precision: `Cifras Significativas`
- Cifras Sig.: `3`

**Expected Results:**
- ✅ Algorithm should NOT converge prematurely
- ✅ Should continue until 3 significant figures stabilize
- ✅ Should generate approximately 15 iterations
- ✅ Convergence criterion should show both tolerance AND significant figures

**Verification Steps:**
1. Enter function: `cos(x)`
2. Enter x₀: `45`
3. Select unit: `Radianes`
4. Set tolerance: `2.9`
5. Set precision: `Cifras Significativas`
6. Set cifras sig.: `3`
7. Click "🚀 Calcular"
8. Verify ~15 iterations (not just 2-3)
9. Verify convergence message mentions significant figures
10. Verify final value ~0.739

---

### Test Case 6: Decimal Precision Mode

**Setup:**
- Function: `cos(x)`
- x₀: `0.5`
- Unit: `Radianes`
- Tolerance: `1e-6`
- Precision: `Decimales`
- Decimales: `4`

**Expected Results:**
- ✅ Table values should show exactly 4 decimal places
- ✅ Final value should show 4 decimal places
- ✅ Calculations should still use full precision internally

**Verification Steps:**
1. Enter function: `cos(x)`
2. Enter x₀: `0.5`
3. Select unit: `Radianes`
4. Set tolerance: `0.000001`
5. Set precision: `Decimales`
6. Set decimales: `4`
7. Click "🚀 Calcular"
8. Verify all table values show exactly 4 decimal places (e.g., "0.7391")
9. Verify final value shows 4 decimal places

---

### Test Case 7: Error Formatting

**Setup:**
- Any convergent function
- Observe error column

**Expected Results:**
- ✅ Small errors (< 0.001) should use scientific notation
- ✅ Large errors (> 1000) should use scientific notation
- ✅ Medium errors should use fixed decimal notation

**Verification Steps:**
1. Calculate any convergent function
2. Observe error column in table
3. Verify first iterations show large errors (may use scientific notation)
4. Verify last iterations show small errors in scientific notation (e.g., "1.23e-7")

---

### Test Case 8: CobwebCanvas Unit Labels

**Setup:**
- Calculate any function successfully
- Observe cobweb graph

**Expected Results:**
- ✅ X-axis label should show unit: "x (rad)" or "x (°)"
- ✅ Y-axis label should show unit: "y (rad)" or "y (°)"
- ✅ Graph should render correctly

**Verification Steps:**
1. Calculate with radians mode
2. Verify cobweb graph shows "x (rad)" and "y (rad)"
3. Calculate with degrees mode
4. Verify cobweb graph shows "x (°)" and "y (°)"

---

### Test Case 9: Aitken Acceleration with Units

**Setup:**
- Function: `cos(x)`
- x₀: `0.5`
- Unit: `Radianes`
- Tolerance: `1e-6`
- Enable Aitken (Δ²)

**Expected Results:**
- ✅ Aitken column should appear in table
- ✅ Aitken column header should show unit: "Aitken (rad)" or "Aitken (°)"
- ✅ Aitken values should be formatted consistently
- ✅ Convergence should be faster with Aitken

**Verification Steps:**
1. Enter function: `cos(x)`
2. Enter x₀: `0.5`
3. Select unit: `Radianes`
4. Enable "Aitken (Δ²)" checkbox
5. Click "🚀 Calcular"
6. Verify Aitken column appears with unit label
7. Verify Aitken values are formatted
8. Compare iteration count with/without Aitken

---

### Test Case 10: Validation Errors

**Setup:**
- Test various invalid inputs

**Expected Results:**
- ✅ Missing angleUnit should show error
- ✅ Invalid function should show error
- ✅ Invalid x₀ should show error
- ✅ Invalid tolerance should show error

**Verification Steps:**
1. Try to calculate without selecting unit (if possible)
2. Enter invalid function: `invalid_func(x)`
3. Verify error message appears
4. Enter invalid x₀: `abc`
5. Verify error message appears
6. Enter invalid tolerance: `-1`
7. Verify error message appears

---

## 📊 Performance Tests

### Test Case 11: Large Number of Iterations

**Setup:**
- Function that requires many iterations
- Max iterations: 1000

**Expected Results:**
- ✅ Application should handle 1000 iterations smoothly
- ✅ Table should render without lag
- ✅ Formatting should complete in < 100ms

**Verification Steps:**
1. Set max iterations to 1000
2. Use a slowly converging function
3. Verify table renders smoothly
4. Verify no performance issues

---

## 🔍 Code Quality Tests

### Test Case 12: TypeScript Type Safety

**Expected Results:**
- ✅ No TypeScript errors
- ✅ angleUnit is required (not optional)
- ✅ All interfaces properly typed

**Verification:**
- [x] Compilation successful
- [x] No diagnostic errors
- [x] angleUnit is required in FixedPointOptions

---

### Test Case 13: Code Documentation

**Expected Results:**
- ✅ All public functions have JSDoc comments
- ✅ Complex logic has inline comments
- ✅ Unit handling strategy is documented

**Verification:**
- [x] unitConverter.ts has JSDoc
- [x] formatter.ts has JSDoc
- [x] fixedPoint.ts has inline comments
- [x] UNIT_HANDLING.md exists

---

## 📝 Summary

### Implementation Status

- ✅ Unit converter module created
- ✅ Formatter module created
- ✅ FixedPointOptions interface updated (angleUnit required)
- ✅ FixedPointResult interface updated (includes angleUnit)
- ✅ fixedPointIteration function enhanced with unit handling
- ✅ App.tsx passes angleUnit correctly
- ✅ Table headers show unit symbols
- ✅ Formatting applied at render time only
- ✅ Result summary shows units
- ✅ Validation added for units and inputs
- ✅ CobwebCanvas updated with unit labels
- ✅ Documentation created

### Key Features Implemented

1. **Consistent Unit Handling**: Calculate and display in same unit
2. **Full Precision**: No rounding during iterations
3. **Clear Labeling**: Unit symbols in all tables and graphs
4. **Validation**: Comprehensive input validation
5. **Documentation**: Complete JSDoc and user documentation

### Next Steps for Manual Testing

1. Start the development server: `npm run dev`
2. Open http://localhost:5173
3. Run through all test cases above
4. Verify each expected result
5. Report any issues found

---

## 🎯 Success Criteria

All tests should pass with:
- ✅ No compilation errors
- ✅ Correct unit handling in all modes
- ✅ Full precision maintained internally
- ✅ Proper formatting at display time
- ✅ Clear unit labels throughout UI
- ✅ Comprehensive validation
- ✅ Complete documentation
