# 🧪 Caso de Prueba: g(x) = cos(x), x₀ = 45 rad

## Parámetros de Entrada

- **Función:** `cos(x)`
- **x₀:** `45` radianes
- **Tolerancia:** `2.9`
- **Máx. iteraciones:** `100`
- **Precisión:** Cifras significativas = `3`
- **Unidad:** Radianes

---

## Tabla de Iteraciones Esperada

| n | xₙ | g(xₙ) = cos(xₙ) | Error = \|xₙ₊₁ − xₙ\| |
|---|-----|-----------------|----------------------|
| 0 | 45.0 | 0.525 | — |
| 1 | 0.525 | 0.865 | 4.45e+1 |
| 2 | 0.865 | 0.649 | 3.40e-1 |
| 3 | 0.649 | 0.797 | 0.216 |
| 4 | 0.797 | 0.699 | 0.098 |
| 5 | 0.699 | 0.765 | 0.066 |
| 6 | 0.765 | 0.722 | 0.043 |
| 7 | 0.722 | 0.751 | 0.029 |
| 8 | 0.751 | 0.731 | 0.020 |
| 9 | 0.731 | 0.744 | 0.013 |
| 10 | 0.744 | 0.736 | 0.008 |
| 11 | 0.736 | 0.741 | 0.005 |
| 12 | 0.741 | 0.738 | 0.003 |
| 13 | 0.738 | 0.740 | 0.002 |
| 14 | 0.740 | 0.739 | 0.001 |
| 15 | 0.739 | 0.739 | 6.10e-04 ✅ |

---

## Resultado Final Esperado

- **Valor Final:** `0.739`
- **Error Final:** `6.10e-04` o menor
- **Iteraciones:** `~15`
- **Convergencia:** ✅ Sí

---

## Explicación del Proceso

### Iteración 0:
- x₀ = 45.0
- g(x₀) = cos(45.0) = 0.525
- Error = 0 (no hay iteración previa)

### Iteración 1:
- x₁ = g(x₀) = 0.525
- g(x₁) = cos(0.525) = 0.865
- Error = |x₁ - x₀| = |0.525 - 45.0| = 44.475 ≈ 4.45e+1

### Iteración 2:
- x₂ = g(x₁) = 0.865
- g(x₂) = cos(0.865) = 0.649
- Error = |x₂ - x₁| = |0.865 - 0.525| = 0.340 ≈ 3.40e-1

### Iteración 3:
- x₃ = g(x₂) = 0.649
- g(x₃) = cos(0.649) = 0.797
- Error = |x₃ - x₂| = |0.649 - 0.865| = 0.216

... y así sucesivamente hasta que el error sea menor que la tolerancia (2.9) **Y** las cifras significativas se estabilicen.

---

## Criterio de Convergencia

Con tolerancia = 2.9 y 3 cifras significativas:

- El método debe continuar hasta que:
  1. Error < 2.9 (se cumple desde iteración 1)
  2. **Y** las 3 cifras significativas sean iguales entre xₙ y xₙ₊₁

Por ejemplo:
- Iteración 14: x = 0.740, x_prev = 0.738 → Redondeado a 3 cifras: 0.740 ≠ 0.738
- Iteración 15: x = 0.739, x_prev = 0.740 → Redondeado a 3 cifras: 0.739 = 0.739 ✅

---

## Problema Actual

Si el algoritmo converge en la iteración 2, significa que:
- El error (0.340) es menor que la tolerancia (2.9) ✓
- Las cifras significativas ya son iguales (0.865 y 0.525 redondeados a 3 cifras)

**Esto es incorrecto** porque 0.865 y 0.525 redondeados a 3 cifras son diferentes.

---

## Solución

El problema está en que el criterio de convergencia requiere **AMBOS** criterios:
1. Error < tolerancia
2. Cifras significativas estables

Pero con una tolerancia tan grande (2.9), el primer criterio se cumple demasiado pronto.

**Corrección:** El algoritmo debe verificar que las cifras significativas sean estables durante al menos 2-3 iteraciones consecutivas, no solo una vez.
