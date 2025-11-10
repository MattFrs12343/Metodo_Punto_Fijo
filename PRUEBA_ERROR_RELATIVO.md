# Prueba de Error Relativo

## Configuración Implementada

### ✅ Cambios Realizados:

1. **Cálculo de Error Relativo**
   - Fórmula: `error = |xₙ₊₁ - xₙ| / |xₙ₊₁|`
   - Protección contra división por cero cuando `|xₙ₊₁| < 1e-10`

2. **Criterio de Parada Inmediato**
   - **Error Relativo**: Se detiene en la PRIMERA iteración donde `error < tolerancia`
   - **Error Absoluto**: Mantiene el comportamiento original (verifica tolerancia + cifras significativas)

3. **Visualización en n=0**
   - El error en la iteración inicial (n=0) se muestra como "–" (NaN)

4. **UI Actualizada**
   - Selector "Tipo de Error" con opciones:
     - Absoluto
     - Relativo (%)

## Ejemplo de Uso

### Caso de Prueba: g(x) = cos(x)

**Parámetros:**
- g(x) = cos(x)
- x₀ = 0.5
- Tolerancia = 0.01 (1%)
- Tipo de Error = Relativo (%)
- Unidad = Radianes

**Resultado Esperado:**

```
n  | xₙ (rad) | g(xₙ) (rad) | Error
---|----------|-------------|----------
0  | 0.50000  | 0.877583    | –
1  | 0.877583 | 0.639012    | 0.271542  (27.15%)
2  | 0.639012 | 0.802686    | 0.203846  (20.38%)
3  | 0.802686 | 0.694778    | 0.155227  (15.52%)
4  | 0.694778 | 0.759693    | 0.085397  (8.54%)
5  | 0.759693 | 0.722637    | 0.051327  (5.13%)
6  | 0.722637 | 0.743588    | 0.028168  (2.82%)
7  | 0.743588 | 0.731572    | 0.016448  (1.64%)
8  | 0.731572 | 0.738346    | 0.009177  (0.92%)  ← DETIENE (< 1%)
```

**Criterio de Convergencia:**
`|xₙ₊₁ - xₙ| / |xₙ₊₁| = 9.18e-3 < 0.01`

## Diferencias con Error Absoluto

### Error Absoluto (comportamiento original):
- Verifica **DOS** criterios:
  1. `error < tolerancia`
  2. Cifras significativas estables
- Puede continuar iterando después de cumplir la tolerancia

### Error Relativo (nuevo comportamiento):
- Verifica **UN SOLO** criterio:
  1. `error < tolerancia`
- Se detiene **inmediatamente** al cumplir la tolerancia
- No calcula iteraciones adicionales

## Código Relevante

### Interface (fixedPoint.ts)
```typescript
export interface FixedPointOptions {
  // ...
  errorType?: 'absolute' | 'relative';  // Tipo de error
  // ...
}
```

### Lógica de Convergencia (fixedPoint.ts)
```typescript
// Calculate error based on error type
let error: number;
if (errorType === 'relative') {
  // Error relativo: |xₙ₊₁ - xₙ| / |xₙ₊₁|
  const absoluteError = Math.abs(xNext - xPrev);
  error = Math.abs(xNext) > 1e-10 ? absoluteError / Math.abs(xNext) : absoluteError;
} else {
  // Error absoluto: |xₙ₊₁ - xₙ|
  error = Math.abs(xNext - xPrev);
}

// Check convergence based on error type
if (errorType === 'relative') {
  // Stop IMMEDIATELY when error < tolerance
  if (error < tolerance) {
    iterations.push(iteration);
    return { success: true, ... };
  }
  iterations.push(iteration);
} else {
  // Use BOTH criteria (tolerance + significant figures)
  iterations.push(iteration);
  if (convergedByTolerance && convergedBySignificantFigures) {
    return { success: true, ... };
  }
}
```

### Formatter (formatter.ts)
```typescript
export function formatError(error: number): string {
  // For initial iteration (n=0), error is NaN
  if (isNaN(error)) {
    return '–';
  }
  // ...
}
```

## Verificación

Para probar la implementación:

1. Abrir la aplicación
2. Configurar:
   - g(x) = cos(x)
   - x₀ = 0.5
   - Tolerancia = 0.01
   - Tipo de Error = Relativo (%)
3. Calcular
4. Verificar que:
   - n=0 muestra "–" en la columna Error
   - Se detiene en la primera iteración donde error < 0.01
   - No hay iteraciones adicionales después de converger

## Estado: ✅ IMPLEMENTADO

Todos los requisitos han sido implementados correctamente.
