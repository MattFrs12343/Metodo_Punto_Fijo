# Design Document

## Overview

El proyecto implementa una arquitectura dual con dos aplicaciones independientes pero complementarias para la visualización del Método de Iteración de Punto Fijo. La arquitectura se basa en:

1. **Frontend React (Puerto 5173)**: Aplicación SPA moderna con TypeScript, Vite y Tailwind CSS
2. **Frontend Streamlit (Puerto 8501)**: Aplicación Python con visualizaciones avanzadas y HTML incrustado
3. **Orquestación Docker**: Docker Compose para ejecutar ambas aplicaciones simultáneamente

Ambas aplicaciones son independientes y no comparten backend, cada una implementa su propia lógica de cálculo (JavaScript/mathjs para React, Python/numpy para Streamlit).

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose                          │
│  ┌──────────────────────────┐  ┌──────────────────────────┐│
│  │   React Container        │  │  Streamlit Container     ││
│  │   (Node.js + Vite)       │  │  (Python + Streamlit)    ││
│  │   Port: 5173             │  │  Port: 8501              ││
│  │                          │  │                          ││
│  │  ┌────────────────────┐  │  │  ┌────────────────────┐ ││
│  │  │   React App        │  │  │  │  Streamlit App     │ ││
│  │  │   - App.tsx        │  │  │  │  - app.py          │ ││
│  │  │   - Components     │  │  │  │  - HTML embed      │ ││
│  │  │   - fixedPoint.ts  │  │  │  │  - numpy calc      │ ││
│  │  └────────────────────┘  │  │  └────────────────────┘ ││
│  └──────────────────────────┘  └──────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    User Browser
            (Accede a ambas URLs simultáneamente)
```

### Technology Stack

**React Application:**
- **Framework**: React 18 con TypeScript
- **Build Tool**: Vite (desarrollo rápido con HMR)
- **Styling**: Tailwind CSS (utility-first)
- **Math Engine**: mathjs (evaluación de expresiones y cálculos)
- **Canvas Rendering**: HTML5 Canvas API para gráfico cobweb

**Streamlit Application:**
- **Framework**: Streamlit (Python web framework)
- **Math Engine**: numpy (cálculos numéricos)
- **Visualization**: HTML incrustado con JavaScript
- **File**: fixed_point_demo_sigfmt.html (visualización avanzada)

**Infrastructure:**
- **Containerization**: Docker + Docker Compose
- **Base Images**: node:18-alpine (React), python:3.11-slim (Streamlit)

## Components and Interfaces

### React Application Structure

```
react/
├── Dockerfile
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.tsx              # Entry point
    ├── App.tsx               # Main component
    ├── index.css             # Global styles + Tailwind
    ├── components/
    │   └── CobwebCanvas.tsx  # Canvas component for cobweb plot
    └── lib/
        └── fixedPoint.ts     # Core algorithm implementation
```

#### Component: App.tsx

**Responsibilities:**
- Gestionar el estado de la aplicación (función, parámetros, resultados)
- Renderizar el formulario de entrada
- Coordinar el cálculo y visualización
- Mostrar tabla de resultados

**State Management:**
```typescript
interface AppState {
  gFunction: string;           // e.g., "cos(x)"
  x0: number;                  // Initial value
  tolerance: number;           // e.g., 1e-6
  maxIterations: number;       // e.g., 100
  stopCriterion: 'delta' | 'residual';
  useAitken: boolean;
  results: IterationResult[] | null;
  error: string | null;
  isCalculating: boolean;
}

interface IterationResult {
  n: number;
  xn: number;
  gxn: number;
  error: number;
  aitkenValue?: number;
}
```

#### Component: CobwebCanvas.tsx

**Props:**
```typescript
interface CobwebCanvasProps {
  gFunction: string;
  iterations: IterationResult[];
  width?: number;
  height?: number;
}
```

**Responsibilities:**
- Dibujar ejes cartesianos
- Plotear función g(x) y línea y = x
- Dibujar el patrón cobweb de las iteraciones
- Implementar zoom y pan (opcional)

**Rendering Strategy:**
1. Calcular rango apropiado basado en valores de iteraciones
2. Dibujar grid y ejes
3. Plotear g(x) evaluando en múltiples puntos
4. Plotear y = x como línea diagonal
5. Dibujar iteraciones: línea vertical de (xₙ, xₙ) a (xₙ, g(xₙ)), luego horizontal a (g(xₙ), g(xₙ))

#### Module: fixedPoint.ts

**Core Algorithm:**
```typescript
interface FixedPointOptions {
  gFunction: string;
  x0: number;
  tolerance: number;
  maxIterations: number;
  stopCriterion: 'delta' | 'residual';
  useAitken: boolean;
}

interface FixedPointResult {
  success: boolean;
  iterations: IterationResult[];
  finalValue: number;
  finalError: number;
  message: string;
}

function fixedPointIteration(options: FixedPointOptions): FixedPointResult
```

**Algorithm Steps:**
1. Compilar función g(x) usando mathjs
2. Inicializar x = x₀
3. Loop hasta convergencia o max iteraciones:
   - Calcular xₙ₊₁ = g(xₙ)
   - Calcular error según criterio
   - Si useAitken y n ≥ 2: aplicar aceleración Δ²
   - Guardar resultado de iteración
   - Verificar convergencia
4. Retornar resultados

**Aitken Acceleration:**
```typescript
// Δ² Aitken: x̂ₙ = xₙ - (xₙ₊₁ - xₙ)² / (xₙ₊₂ - 2xₙ₊₁ + xₙ)
function aitkenAcceleration(xn: number, xn1: number, xn2: number): number {
  const denominator = xn2 - 2 * xn1 + xn;
  if (Math.abs(denominator) < 1e-10) return xn2;
  return xn - Math.pow(xn1 - xn, 2) / denominator;
}
```

### Streamlit Application Structure

```
streamlit/
├── Dockerfile
├── requirements.txt
├── app.py                           # Main Streamlit app
└── fixed_point_demo_sigfmt.html     # Advanced visualization
```

#### Module: app.py

**Structure:**
```python
import streamlit as st
import numpy as np
from typing import Callable, Tuple, List

def parse_function(func_str: str) -> Callable:
    """Parse string function to callable using eval with safe namespace"""
    pass

def fixed_point_iteration(g: Callable, x0: float, tol: float, 
                         max_iter: int, criterion: str,
                         use_aitken: bool) -> Tuple[List, bool, str]:
    """Execute fixed point iteration"""
    pass

def aitken_acceleration(xn: float, xn1: float, xn2: float) -> float:
    """Apply Aitken's delta-squared acceleration"""
    pass

def main():
    st.title("Método de Punto Fijo - Visualización Avanzada")
    
    # Sidebar for parameters
    with st.sidebar:
        g_func = st.text_input("Función g(x)", "np.cos(x)")
        x0 = st.number_input("Valor inicial x₀", value=0.5)
        tolerance = st.number_input("Tolerancia", value=1e-6, format="%.2e")
        max_iter = st.number_input("Máximo iteraciones", value=100)
        criterion = st.selectbox("Criterio", ["delta", "residual"])
        use_aitken = st.checkbox("Usar aceleración Aitken")
    
    # Calculate button
    if st.button("Calcular"):
        # Execute algorithm
        # Display results table
        # Embed HTML visualization
        pass
    
    # Embed advanced HTML visualization
    with open("fixed_point_demo_sigfmt.html", "r") as f:
        html_content = f.read()
        st.components.v1.html(html_content, height=800)
```

#### File: fixed_point_demo_sigfmt.html

**Purpose:** Visualización avanzada con gráficos interactivos

**Expected Content:**
- Canvas o SVG para gráficos
- JavaScript para interactividad
- Estilos CSS avanzados
- Posible uso de bibliotecas como D3.js o Chart.js

### Docker Configuration

#### docker-compose.yml

```yaml
version: '3.8'

services:
  react:
    build:
      context: ./react
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./react:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev -- --host

  streamlit:
    build:
      context: ./streamlit
      dockerfile: Dockerfile
    ports:
      - "8501:8501"
    volumes:
      - ./streamlit:/app
    environment:
      - PYTHONUNBUFFERED=1
    command: streamlit run app.py --server.address=0.0.0.0
```

#### React Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

#### Streamlit Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8501

CMD ["streamlit", "run", "app.py", "--server.address=0.0.0.0"]
```

## Data Models

### Iteration Result Model

**TypeScript (React):**
```typescript
interface IterationResult {
  n: number;              // Iteration number (0, 1, 2, ...)
  xn: number;             // Current value
  gxn: number;            // g(xn) value
  error: number;          // Error based on criterion
  aitkenValue?: number;   // Aitken accelerated value (optional)
}
```

**Python (Streamlit):**
```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class IterationResult:
    n: int
    xn: float
    gxn: float
    error: float
    aitken_value: Optional[float] = None
```

### Configuration Model

**TypeScript:**
```typescript
interface FixedPointConfig {
  gFunction: string;
  x0: number;
  tolerance: number;
  maxIterations: number;
  stopCriterion: 'delta' | 'residual';
  useAitken: boolean;
}
```

**Python:**
```python
@dataclass
class FixedPointConfig:
    g_function: str
    x0: float
    tolerance: float
    max_iterations: int
    stop_criterion: str  # 'delta' or 'residual'
    use_aitken: bool
```

## Error Handling

### React Application

**Error Categories:**

1. **Function Parsing Errors**
   - Invalid syntax in g(x)
   - Undefined variables
   - Strategy: Try-catch around mathjs.compile(), show user-friendly message

2. **Evaluation Errors**
   - Division by zero
   - Domain errors (sqrt of negative, log of negative)
   - Strategy: Try-catch in iteration loop, stop and report

3. **Convergence Errors**
   - Max iterations reached
   - Divergence detected (value exceeds threshold)
   - Strategy: Return partial results with warning message

**Implementation:**
```typescript
try {
  const compiled = math.compile(gFunction);
  const g = (x: number) => compiled.evaluate({ x });
  // ... iteration logic
} catch (error) {
  if (error instanceof SyntaxError) {
    return {
      success: false,
      message: `Error de sintaxis en g(x): ${error.message}`,
      iterations: [],
      finalValue: NaN,
      finalError: NaN
    };
  }
  // Handle other errors
}
```

### Streamlit Application

**Error Handling:**
```python
try:
    # Parse function
    namespace = {"np": np, "sin": np.sin, "cos": np.cos, "exp": np.exp, ...}
    g = lambda x: eval(func_str, {"__builtins__": {}}, {**namespace, "x": x})
    
    # Test function
    _ = g(x0)
    
except SyntaxError as e:
    st.error(f"Error de sintaxis: {e}")
    return
except Exception as e:
    st.error(f"Error al evaluar función: {e}")
    return
```

**Safety Considerations:**
- Restricted eval namespace (no __builtins__)
- Only allow safe math functions
- Validate input before evaluation

## Testing Strategy

### React Application Testing

**Unit Tests (Vitest):**

1. **fixedPoint.ts Tests**
   - Test convergent cases (e.g., g(x) = cos(x), x₀ = 0.5)
   - Test divergent cases
   - Test Aitken acceleration
   - Test error criteria (delta vs residual)
   - Test edge cases (max iterations, tolerance)

2. **Component Tests (React Testing Library)**
   - App.tsx: Form submission, state updates
   - CobwebCanvas.tsx: Canvas rendering, props handling

**Example Test:**
```typescript
import { describe, it, expect } from 'vitest';
import { fixedPointIteration } from './fixedPoint';

describe('fixedPointIteration', () => {
  it('should converge for g(x) = cos(x)', () => {
    const result = fixedPointIteration({
      gFunction: 'cos(x)',
      x0: 0.5,
      tolerance: 1e-6,
      maxIterations: 100,
      stopCriterion: 'delta',
      useAitken: false
    });
    
    expect(result.success).toBe(true);
    expect(result.finalValue).toBeCloseTo(0.739085, 5);
  });
});
```

**Integration Tests:**
- Test full workflow: input → calculation → display
- Test Docker container startup and accessibility

### Streamlit Application Testing

**Unit Tests (pytest):**

1. **Algorithm Tests**
   - Test fixed_point_iteration function
   - Test aitken_acceleration
   - Test parse_function with various inputs

2. **Integration Tests**
   - Test Streamlit app startup
   - Test HTML file loading

**Example Test:**
```python
import pytest
import numpy as np
from app import fixed_point_iteration, aitken_acceleration

def test_convergence():
    g = lambda x: np.cos(x)
    results, success, msg = fixed_point_iteration(
        g, x0=0.5, tol=1e-6, max_iter=100, 
        criterion='delta', use_aitken=False
    )
    
    assert success
    assert abs(results[-1].xn - 0.739085) < 1e-5
```

### Manual Testing Checklist

- [ ] React app loads at localhost:5173
- [ ] Streamlit app loads at localhost:8501
- [ ] Both apps run simultaneously via Docker Compose
- [ ] Function input accepts valid mathematical expressions
- [ ] Invalid functions show appropriate error messages
- [ ] Convergent cases produce correct results
- [ ] Divergent cases are handled gracefully
- [ ] Cobweb plot renders correctly
- [ ] Results table displays all iterations
- [ ] Aitken acceleration produces improved convergence
- [ ] Both stop criteria work correctly
- [ ] Hot reload works in development mode

## Performance Considerations

### React Application

**Optimization Strategies:**

1. **Canvas Rendering**
   - Use requestAnimationFrame for smooth rendering
   - Implement debouncing for resize events
   - Cache computed function values

2. **Large Iteration Sets**
   - Virtualize table rows if > 100 iterations
   - Limit cobweb plot to first N iterations for clarity

3. **Function Evaluation**
   - Compile function once, reuse for all evaluations
   - Memoize function values for plotting

### Streamlit Application

**Optimization:**

1. **Caching**
   - Use @st.cache_data for expensive computations
   - Cache parsed functions

2. **Rendering**
   - Limit table display to reasonable number of rows
   - Use Streamlit's built-in pagination

## Security Considerations

### Function Evaluation Security

**React (mathjs):**
- mathjs provides safe evaluation by default
- No access to JavaScript runtime or DOM
- Limited to mathematical operations

**Streamlit (Python eval):**
- **Critical**: Restrict eval namespace
- Remove __builtins__ access
- Whitelist only safe numpy functions
- Consider using safer alternatives like numexpr or sympy

**Implementation:**
```python
SAFE_NAMESPACE = {
    "np": np,
    "sin": np.sin,
    "cos": np.cos,
    "tan": np.tan,
    "exp": np.exp,
    "log": np.log,
    "sqrt": np.sqrt,
    "abs": np.abs,
    "pi": np.pi,
    "e": np.e
}

def safe_eval(expr: str, x: float) -> float:
    return eval(expr, {"__builtins__": {}}, {**SAFE_NAMESPACE, "x": x})
```

### Docker Security

- Use non-root users in containers
- Minimize image size (alpine, slim variants)
- Pin dependency versions
- Regular security updates

## Deployment Considerations

### Development Mode

- Hot reload enabled
- Source maps for debugging
- Verbose logging
- Volume mounts for live code updates

### Production Mode

**React:**
- Build optimized bundle: `npm run build`
- Serve static files via nginx or CDN
- Enable gzip compression
- Set appropriate cache headers

**Streamlit:**
- Disable debug mode
- Set appropriate server configuration
- Consider authentication if needed
- Use production WSGI server

**Docker:**
- Multi-stage builds to reduce image size
- Health checks for containers
- Resource limits (CPU, memory)
- Restart policies

## Future Extensibility

### Planned Enhancements

1. **Automatic Convergence Verification**
   - Analyze |g'(x*)| < 1 condition
   - Provide convergence predictions

2. **Export Functionality**
   - Export results to CSV/JSON
   - Export plots as PNG/SVG
   - Generate PDF reports

3. **Dark Mode (React)**
   - Tailwind dark mode classes
   - Persistent theme preference

4. **Additional Numerical Methods**
   - Newton-Raphson
   - Secant method
   - Bisection method
   - Shared component architecture

### Architecture for Extensions

- Keep algorithm implementations modular
- Use strategy pattern for different methods
- Shared visualization components
- Consistent data models across methods
