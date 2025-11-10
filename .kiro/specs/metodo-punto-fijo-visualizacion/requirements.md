# Requirements Document

## Introduction

Este proyecto implementa una aplicación dual para la visualización y análisis del Método de Iteración de Punto Fijo, una técnica numérica fundamental para encontrar raíces de ecuaciones. El sistema proporciona dos interfaces complementarias: una interfaz moderna y minimalista construida con React para uso práctico y educativo, y una interfaz visual avanzada con Streamlit para presentaciones y análisis detallados. Ambas aplicaciones se ejecutan simultáneamente mediante Docker Compose, permitiendo a los usuarios elegir la experiencia que mejor se adapte a sus necesidades.

## Requirements

### Requirement 1: Interfaz React Moderna

**User Story:** Como estudiante o profesor de métodos numéricos, quiero una interfaz web moderna y minimalista para visualizar el método de punto fijo, de manera que pueda entender rápidamente el comportamiento del algoritmo sin distracciones visuales.

#### Acceptance Criteria

1. WHEN el usuario accede a la aplicación React THEN el sistema SHALL mostrar una interfaz limpia construida con React, Vite y Tailwind CSS
2. WHEN el usuario ingresa una función g(x) THEN el sistema SHALL validar la sintaxis matemática usando mathjs
3. WHEN el usuario configura los parámetros (x₀, tolerancia, máximo de iteraciones) THEN el sistema SHALL almacenar estos valores y permitir su modificación
4. WHEN el usuario ejecuta el método THEN el sistema SHALL calcular las iteraciones y mostrar los resultados en tiempo real
5. WHEN el cálculo finaliza THEN el sistema SHALL mostrar el valor aproximado x*, el error, el número de iteraciones y una tabla detallada
6. WHEN el usuario solicita visualización THEN el sistema SHALL generar un gráfico cobweb interactivo usando canvas
7. IF la aplicación React está ejecutándose THEN el sistema SHALL estar disponible en http://localhost:5173

### Requirement 2: Interfaz Streamlit Visual Avanzada

**User Story:** Como presentador o investigador, quiero una interfaz visual rica con gráficos avanzados y herramientas interactivas, de manera que pueda realizar presentaciones profesionales y análisis detallados del método.

#### Acceptance Criteria

1. WHEN el usuario accede a la aplicación Streamlit THEN el sistema SHALL mostrar una interfaz visual avanzada con HTML incrustado
2. WHEN el usuario interactúa con los controles THEN el sistema SHALL proporcionar widgets interactivos de Streamlit
3. WHEN el usuario ejecuta el método THEN el sistema SHALL calcular usando numpy y mostrar visualizaciones detalladas
4. WHEN se generan gráficos THEN el sistema SHALL incluir el archivo HTML fixed_point_demo_sigfmt.html con visualizaciones avanzadas
5. IF la aplicación Streamlit está ejecutándose THEN el sistema SHALL estar disponible en http://localhost:8501

### Requirement 3: Motor de Cálculo del Método de Punto Fijo

**User Story:** Como usuario de cualquiera de las interfaces, quiero que el sistema calcule correctamente el método de iteración de punto fijo, de manera que obtenga resultados matemáticamente precisos y confiables.

#### Acceptance Criteria

1. WHEN el usuario proporciona una función g(x) y un valor inicial x₀ THEN el sistema SHALL ejecutar la iteración xₙ₊₁ = g(xₙ)
2. WHEN se ejecuta una iteración THEN el sistema SHALL calcular el error según el criterio seleccionado (|xₙ₊₁ - xₙ| o |g(xₙ) - xₙ|)
3. WHEN el error es menor que la tolerancia ε THEN el sistema SHALL detener las iteraciones y reportar convergencia
4. WHEN se alcanza el máximo de iteraciones THEN el sistema SHALL detener el cálculo y reportar no convergencia
5. IF el usuario habilita la aceleración de Aitken Δ² THEN el sistema SHALL aplicar el método de aceleración para mejorar la convergencia
6. WHEN ocurre un error matemático (división por cero, función indefinida) THEN el sistema SHALL capturar el error y mostrar un mensaje descriptivo

### Requirement 4: Configuración de Parámetros

**User Story:** Como usuario, quiero configurar todos los parámetros del método de punto fijo, de manera que pueda experimentar con diferentes funciones y condiciones iniciales.

#### Acceptance Criteria

1. WHEN el usuario accede a la interfaz THEN el sistema SHALL proporcionar campos para ingresar la función g(x)
2. WHEN el usuario configura parámetros THEN el sistema SHALL permitir establecer: valor inicial x₀, tolerancia ε, máximo de iteraciones
3. WHEN el usuario selecciona criterio de parada THEN el sistema SHALL ofrecer opciones: |xₙ₊₁ - xₙ| o |g(xₙ) - xₙ|
4. WHEN el usuario activa opciones avanzadas THEN el sistema SHALL permitir habilitar/deshabilitar la aceleración de Aitken
5. IF los parámetros son inválidos THEN el sistema SHALL mostrar mensajes de validación claros

### Requirement 5: Visualización con Gráfico Cobweb

**User Story:** Como usuario, quiero ver una representación gráfica tipo cobweb (telaraña) del proceso iterativo, de manera que pueda visualizar geométricamente la convergencia o divergencia del método.

#### Acceptance Criteria

1. WHEN el cálculo finaliza exitosamente THEN el sistema SHALL generar un gráfico cobweb
2. WHEN se dibuja el gráfico THEN el sistema SHALL mostrar la función g(x) y la línea y = x
3. WHEN se trazan las iteraciones THEN el sistema SHALL dibujar líneas verticales y horizontales alternadas mostrando el proceso iterativo
4. WHEN el usuario interactúa con el gráfico THEN el sistema SHALL permitir zoom y navegación (en la versión React)
5. IF hay muchas iteraciones THEN el sistema SHALL optimizar el renderizado para mantener el rendimiento

### Requirement 6: Tabla de Resultados por Iteración

**User Story:** Como usuario, quiero ver una tabla detallada con los valores de cada iteración, de manera que pueda analizar numéricamente el comportamiento del método.

#### Acceptance Criteria

1. WHEN el cálculo finaliza THEN el sistema SHALL mostrar una tabla con todas las iteraciones
2. WHEN se muestra la tabla THEN el sistema SHALL incluir columnas: n (número de iteración), xₙ, g(xₙ), error
3. WHEN hay muchas iteraciones THEN el sistema SHALL implementar paginación o scroll
4. IF el usuario usa aceleración de Aitken THEN el sistema SHALL incluir columnas adicionales con los valores acelerados

### Requirement 7: Contenedorización con Docker

**User Story:** Como usuario o desarrollador, quiero ejecutar ambas aplicaciones fácilmente usando Docker, de manera que no tenga que configurar manualmente dependencias ni entornos.

#### Acceptance Criteria

1. WHEN el usuario ejecuta docker compose up --build THEN el sistema SHALL construir e iniciar ambos contenedores
2. WHEN los contenedores están activos THEN el sistema SHALL exponer React en puerto 5173 y Streamlit en puerto 8501
3. WHEN se modifica el código THEN el sistema SHALL soportar hot-reload en modo desarrollo
4. IF ocurre un error en un contenedor THEN el sistema SHALL mostrar logs descriptivos
5. WHEN el usuario detiene los contenedores THEN el sistema SHALL limpiar recursos correctamente

### Requirement 8: Estructura de Proyecto Modular

**User Story:** Como desarrollador, quiero una estructura de proyecto clara y modular, de manera que pueda mantener, extender y entender fácilmente el código.

#### Acceptance Criteria

1. WHEN se organiza el proyecto THEN el sistema SHALL separar claramente las carpetas react/ y streamlit/
2. WHEN se estructura el código React THEN el sistema SHALL organizar en: components/, lib/, y archivos de configuración
3. WHEN se implementa lógica THEN el sistema SHALL separar la lógica matemática (fixedPoint.ts) de los componentes UI
4. WHEN se crean componentes THEN el sistema SHALL usar TypeScript para type safety
5. IF se añaden nuevas funcionalidades THEN el sistema SHALL mantener la separación de responsabilidades

### Requirement 9: Instalación y Ejecución Local

**User Story:** Como desarrollador, quiero poder ejecutar las aplicaciones localmente sin Docker, de manera que pueda desarrollar y depurar más eficientemente.

#### Acceptance Criteria

1. WHEN el usuario ejecuta npm install en react/ THEN el sistema SHALL instalar todas las dependencias de Node.js
2. WHEN el usuario ejecuta npm run dev THEN el sistema SHALL iniciar el servidor de desarrollo de Vite
3. WHEN el usuario ejecuta pip install -r requirements.txt en streamlit/ THEN el sistema SHALL instalar dependencias de Python
4. WHEN el usuario ejecuta streamlit run app.py THEN el sistema SHALL iniciar la aplicación Streamlit
5. IF faltan dependencias THEN el sistema SHALL mostrar mensajes de error claros

### Requirement 10: Manejo de Errores y Validación

**User Story:** Como usuario, quiero que el sistema maneje errores gracefully y me proporcione retroalimentación clara, de manera que pueda corregir problemas sin frustración.

#### Acceptance Criteria

1. WHEN el usuario ingresa una función inválida THEN el sistema SHALL mostrar un mensaje de error específico sobre la sintaxis
2. WHEN ocurre un error matemático durante el cálculo THEN el sistema SHALL capturar la excepción y mostrar un mensaje comprensible
3. WHEN los parámetros están fuera de rango THEN el sistema SHALL validar y sugerir valores apropiados
4. IF el método no converge THEN el sistema SHALL informar claramente y mostrar las iteraciones realizadas
5. WHEN hay errores de red o carga THEN el sistema SHALL mostrar indicadores de estado apropiados
