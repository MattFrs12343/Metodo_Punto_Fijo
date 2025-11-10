# Requirements Document

## Introduction

Este documento define los requisitos para estandarizar el manejo de unidades angulares (radianes y grados) y la generación de tablas de iteración en los métodos numéricos implementados en el proyecto. El objetivo es garantizar consistencia matemática entre la unidad seleccionada por el usuario, los cálculos internos del algoritmo y la presentación de resultados en las tablas de iteración. Esta estandarización elimina inconsistencias donde los valores mostrados no corresponden a la unidad utilizada en los cálculos, mejorando la precisión y confiabilidad del sistema.

## Requirements

### Requirement 1: Manejo Consistente de Unidades Angulares

**User Story:** Como usuario del sistema de métodos numéricos, quiero que las funciones trigonométricas respeten la unidad angular seleccionada (radianes o grados), de manera que los cálculos sean matemáticamente correctos y consistentes con mi entrada.

#### Acceptance Criteria

1. WHEN el usuario ingresa una función con sin(x), cos(x), tan(x) sin especificador de unidad THEN el sistema SHALL interpretar la función en radianes por defecto
2. WHEN el usuario selecciona "Grados" como unidad angular THEN el sistema SHALL convertir automáticamente las funciones trigonométricas a sus equivalentes en grados (sind(x), cosd(x), tand(x)) o realizar conversión explícita
3. WHEN el usuario selecciona "Radianes" como unidad angular THEN el sistema SHALL utilizar las funciones trigonométricas estándar sin conversión
4. IF la función contiene funciones trigonométricas THEN el sistema SHALL aplicar la unidad seleccionada de manera consistente en todas las evaluaciones
5. WHEN se evalúa una función trigonométrica THEN el sistema SHALL garantizar que el argumento esté en la unidad correcta antes de la evaluación

### Requirement 2: Conversión Correcta del Valor Inicial

**User Story:** Como usuario, quiero que el valor inicial x₀ que ingreso sea interpretado correctamente según la unidad seleccionada, de manera que las iteraciones comiencen desde el punto correcto en el espacio de la función.

#### Acceptance Criteria

1. WHEN el usuario ingresa x₀ y selecciona "Radianes" THEN el sistema SHALL utilizar x₀ directamente sin conversión
2. WHEN el usuario ingresa x₀ y selecciona "Grados" THEN el sistema SHALL interpretar x₀ como un valor en grados
3. IF el usuario ingresa x₀ = 45 con unidad "Grados" THEN el sistema SHALL trabajar con 45 grados en todos los cálculos (no convertir a radianes internamente a menos que sea necesario para la función)
4. WHEN se inicia el algoritmo THEN el sistema SHALL verificar que x₀ corresponde a la unidad seleccionada antes de comenzar las iteraciones
5. IF hay conversión de unidades THEN el sistema SHALL documentar claramente en qué unidad se está trabajando internamente

### Requirement 3: Iteraciones Sin Redondeo Interno

**User Story:** Como usuario que necesita precisión numérica, quiero que el algoritmo no redondee valores durante las iteraciones internas, de manera que los errores de redondeo no se acumulen y afecten la convergencia.

#### Acceptance Criteria

1. WHEN el algoritmo ejecuta iteraciones THEN el sistema SHALL mantener precisión completa (double/float64) en todos los cálculos intermedios
2. WHEN se calcula xₙ₊₁ = g(xₙ) THEN el sistema SHALL almacenar el valor con precisión completa sin redondeo
3. WHEN se calcula el error |xₙ₊₁ - xₙ| THEN el sistema SHALL usar valores sin redondear
4. WHEN se evalúa el criterio de convergencia THEN el sistema SHALL comparar valores con precisión completa
5. IF se requiere redondeo THEN el sistema SHALL aplicarlo SOLO al momento de mostrar resultados en la tabla, no durante los cálculos

### Requirement 4: Tabla de Iteración Estandarizada

**User Story:** Como usuario, quiero ver una tabla de iteraciones con formato estándar y consistente, de manera que pueda analizar fácilmente el comportamiento del algoritmo y verificar la convergencia.

#### Acceptance Criteria

1. WHEN el algoritmo finaliza THEN el sistema SHALL generar una tabla con las columnas: n, xₙ, g(xₙ), error
2. WHEN se muestra la columna "n" THEN el sistema SHALL mostrar el número de iteración comenzando desde 0
3. WHEN se muestra la columna "xₙ" THEN el sistema SHALL mostrar el valor en la unidad seleccionada por el usuario
4. WHEN se muestra la columna "g(xₙ)" THEN el sistema SHALL mostrar el resultado de evaluar g(xₙ) en la unidad correspondiente
5. WHEN se muestra la columna "error" THEN el sistema SHALL mostrar |xₙ₊₁ - xₙ| o el criterio de error seleccionado
6. IF el usuario seleccionó "Grados" THEN el sistema SHALL mostrar todos los valores xₙ en grados
7. IF el usuario seleccionó "Radianes" THEN el sistema SHALL mostrar todos los valores xₙ en radianes
8. WHEN se presenta la tabla THEN el sistema SHALL aplicar formato numérico apropiado (número fijo de decimales o notación científica según magnitud)

### Requirement 5: Criterio de Parada Basado en Tolerancia

**User Story:** Como usuario, quiero que el algoritmo se detenga cuando el error cumpla con la tolerancia especificada, de manera que obtenga resultados con la precisión deseada sin iteraciones innecesarias.

#### Acceptance Criteria

1. WHEN el usuario especifica una tolerancia ε THEN el sistema SHALL detener las iteraciones cuando error < ε
2. WHEN se calcula el error en cada iteración THEN el sistema SHALL usar el criterio seleccionado (|xₙ₊₁ - xₙ| o |g(xₙ) - xₙ|)
3. WHEN el error cumple la tolerancia THEN el sistema SHALL marcar la convergencia y detener el algoritmo
4. WHEN se alcanza el máximo de iteraciones sin convergencia THEN el sistema SHALL detener el algoritmo y reportar no convergencia
5. IF el algoritmo converge THEN el sistema SHALL incluir la iteración final en la tabla con el error que cumplió la tolerancia

### Requirement 6: Consistencia Entre Cálculo y Presentación

**User Story:** Como usuario, quiero que los valores mostrados en la tabla correspondan exactamente a los valores utilizados en los cálculos, de manera que pueda confiar en que la tabla refleja fielmente el proceso iterativo.

#### Acceptance Criteria

1. WHEN se muestra xₙ en la tabla THEN el sistema SHALL mostrar el valor en la misma unidad utilizada para calcular g(xₙ)
2. WHEN se muestra g(xₙ) en la tabla THEN el sistema SHALL mostrar el resultado de evaluar la función con xₙ en la unidad correcta
3. IF se realizan conversiones de unidades THEN el sistema SHALL aplicar las mismas conversiones tanto en cálculo como en presentación
4. WHEN el usuario revisa la tabla THEN el sistema SHALL garantizar que no hay discrepancias entre los valores calculados y los mostrados
5. IF hay redondeo para presentación THEN el sistema SHALL aplicarlo de manera uniforme en todas las columnas numéricas

### Requirement 7: Soporte para Funciones Trigonométricas en Ambas Unidades

**User Story:** Como usuario, quiero poder trabajar con funciones trigonométricas tanto en radianes como en grados, de manera que pueda elegir la unidad más conveniente para mi problema específico.

#### Acceptance Criteria

1. WHEN el usuario selecciona "Radianes" THEN el sistema SHALL soportar sin(x), cos(x), tan(x), asin(x), acos(x), atan(x)
2. WHEN el usuario selecciona "Grados" THEN el sistema SHALL soportar sind(x), cosd(x), tand(x), asind(x), acosd(x), atand(x) o equivalentes
3. IF la biblioteca matemática no soporta funciones en grados nativamente THEN el sistema SHALL implementar conversión: sind(x) = sin(x * π/180)
4. WHEN se evalúa una función trigonométrica THEN el sistema SHALL aplicar la conversión correcta basada en la unidad seleccionada
5. IF el usuario mezcla unidades en la función THEN el sistema SHALL detectar y reportar el error o aplicar conversión explícita

### Requirement 8: Validación de Entrada de Unidades

**User Story:** Como usuario, quiero que el sistema valide mi selección de unidades y me alerte sobre posibles inconsistencias, de manera que evite errores de configuración que lleven a resultados incorrectos.

#### Acceptance Criteria

1. WHEN el usuario selecciona una unidad THEN el sistema SHALL validar que la selección es válida ("Radianes" o "Grados")
2. WHEN el usuario ingresa una función THEN el sistema SHALL detectar si contiene funciones trigonométricas
3. IF la función contiene funciones trigonométricas THEN el sistema SHALL mostrar claramente qué unidad se está utilizando
4. WHEN el usuario cambia la unidad THEN el sistema SHALL actualizar la interpretación de la función automáticamente
5. IF hay ambigüedad en la unidad THEN el sistema SHALL solicitar confirmación al usuario o usar radianes por defecto con advertencia

### Requirement 9: Documentación de Unidades en Resultados

**User Story:** Como usuario, quiero que los resultados indiquen claramente en qué unidad están expresados, de manera que no haya confusión al interpretar los valores numéricos.

#### Acceptance Criteria

1. WHEN se muestra la tabla de resultados THEN el sistema SHALL incluir un encabezado o nota indicando la unidad utilizada
2. WHEN se muestra el valor final x* THEN el sistema SHALL especificar la unidad (ej: "x* = 0.739 rad" o "x* = 42.3°")
3. WHEN se exportan resultados THEN el sistema SHALL incluir metadatos con la unidad angular utilizada
4. IF se muestran gráficos THEN el sistema SHALL etiquetar los ejes con la unidad correspondiente
5. WHEN se genera un reporte THEN el sistema SHALL documentar claramente la configuración de unidades utilizada

### Requirement 10: Manejo de Precisión y Cifras Significativas

**User Story:** Como usuario, quiero controlar la precisión de los resultados mostrados mediante cifras significativas o decimales, de manera que la tabla sea legible sin perder información importante.

#### Acceptance Criteria

1. WHEN el usuario especifica precisión por cifras significativas THEN el sistema SHALL redondear los valores mostrados a ese número de cifras significativas
2. WHEN el usuario especifica precisión por decimales THEN el sistema SHALL redondear los valores mostrados a ese número de decimales
3. WHEN se aplica redondeo para presentación THEN el sistema SHALL mantener los valores completos internamente para cálculos
4. IF los valores son muy grandes o muy pequeños THEN el sistema SHALL usar notación científica automáticamente
5. WHEN se muestra el error THEN el sistema SHALL usar formato apropiado (notación científica para errores muy pequeños)

### Requirement 11: Regla de Prioridad de Unidad

**User Story:** Como usuario, quiero que el sistema aplique reglas claras de prioridad cuando trabajo con funciones trigonométricas, de manera que no haya ambigüedad sobre qué unidad se está utilizando en los cálculos.

#### Acceptance Criteria

1. WHEN el usuario ingresa una función trigonométrica estándar (sin, cos, tan) sin especificar unidad THEN el sistema SHALL asumir radianes por defecto
2. WHEN el usuario selecciona "Grados" como unidad THEN el sistema SHALL aplicar automáticamente la versión en grados (sind, cosd, tand) o convertir internamente antes de evaluar
3. WHEN el sistema realiza cálculos THEN el sistema SHALL NEVER calcular en una unidad y mostrar en otra diferente
4. WHEN se muestra la tabla de iteraciones THEN el sistema SHALL garantizar que la unidad del cálculo coincide con la unidad mostrada
5. IF hay conversión de unidades THEN el sistema SHALL aplicarla de manera consistente en todos los cálculos y presentaciones

### Requirement 12: Validación Estricta del Valor Inicial x₀

**User Story:** Como usuario, quiero que el sistema valide y convierta correctamente mi valor inicial x₀ según la unidad seleccionada, de manera que las iteraciones comiencen desde el punto matemáticamente correcto.

#### Acceptance Criteria

1. WHEN el usuario ingresa x₀ en grados pero el modo activo es radianes THEN el sistema SHALL convertir x₀ ← x₀ × π/180
2. WHEN el usuario ingresa x₀ en radianes pero el modo activo es grados THEN el sistema SHALL convertir x₀ ← x₀ × 180/π
3. IF la unidad de x₀ no puede determinarse con certeza THEN el sistema SHALL detener la ejecución y solicitar aclaración al usuario
4. WHEN se realiza conversión de x₀ THEN el sistema SHALL documentar la conversión en los logs o mensajes informativos
5. WHEN se inicia el algoritmo THEN el sistema SHALL verificar que x₀ está en la unidad correcta antes de la primera iteración

### Requirement 13: Prohibición Explícita de Redondeo Interno

**User Story:** Como usuario que requiere precisión numérica, quiero que el sistema prohíba explícitamente el redondeo durante las iteraciones internas, de manera que la convergencia no se vea afectada por errores de redondeo acumulados.

#### Acceptance Criteria

1. WHEN el algoritmo ejecuta iteraciones THEN el sistema SHALL conservar la precisión completa de la máquina (double precision / float64) en todos los valores intermedios
2. WHEN se almacenan valores xₙ, g(xₙ), errores THEN el sistema SHALL mantener precisión completa sin redondeo
3. WHEN se evalúa el criterio de convergencia THEN el sistema SHALL usar valores con precisión completa
4. WHEN se muestra la tabla de resultados THEN el sistema SHALL aplicar redondeo SOLO para presentación visual
5. WHEN se reporta la solución final THEN el sistema SHALL aplicar redondeo SOLO al mostrar el resultado al usuario
6. IF se detecta redondeo interno THEN el sistema SHALL registrar una advertencia indicando que puede afectar la convergencia
