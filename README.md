# Proyecto: Visualización del Método de Punto Fijo con React y Streamlit

## 📋 Descripción General

Este proyecto implementa dos interfaces complementarias para el análisis y visualización del **Método de Iteración de Punto Fijo**, una técnica numérica fundamental para encontrar raíces de ecuaciones.

### Interfaces Disponibles

| Interfaz | Tecnología | Propósito | Puerto |
|----------|-----------|-----------|--------|
| **UI Minimalista Moderna** | React + Vite + Tailwind | Visualización clara y práctica del método | 5173 |
| **UI Original "Bonita"** | Streamlit + HTML incrustado | Interfaz visual avanzada con gráficos interactivos | 8501 |

Ambas aplicaciones pueden ejecutarse simultáneamente mediante **Docker Compose**.

---

## 🚀 Tecnologías Utilizadas

### Frontend Moderno (React)
- **React 18** con TypeScript
- **Vite** - Build tool rápido con HMR
- **Tailwind CSS** - Styling utility-first
- **mathjs** - Motor matemático para evaluación de expresiones

### Visualización Original (Streamlit)
- **Streamlit** - Framework web de Python
- **NumPy** - Cálculos numéricos
- **Pandas** - Manipulación de datos
- **HTML/CSS/JavaScript** - Visualización avanzada incrustada

### Infraestructura
- **Docker** + **Docker Compose** - Contenedorización y orquestación
- **Node.js 18** (Alpine) - Runtime para React
- **Python 3.11** (Slim) - Runtime para Streamlit

---

## 📁 Estructura del Proyecto

```
Proyecto_Métodos/
│
├─ docker-compose.yml          # Orquestación de contenedores
│
├─ react/                      # Aplicación React
│  ├─ Dockerfile
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  ├─ tailwind.config.js
│  ├─ postcss.config.js
│  ├─ index.html
│  └─ src/
│     ├─ main.tsx
│     ├─ App.tsx
│     ├─ index.css
│     ├─ components/
│     │  └─ CobwebCanvas.tsx   # Componente de visualización cobweb
│     └─ lib/
│        └─ fixedPoint.ts      # Algoritmo de punto fijo
│
└─ streamlit/                  # Aplicación Streamlit
   ├─ Dockerfile
   ├─ requirements.txt
   ├─ app.py                   # Aplicación principal
   └─ fixed_point_demo_sigfmt.html  # Visualización HTML avanzada
```

---

## 🛠️ Instalación y Ejecución

### Opción 1: Docker (Recomendado)

#### Requisitos Previos
- Docker Desktop instalado y ejecutándose

#### Pasos

1. **Clonar o navegar al directorio del proyecto:**
   ```bash
   cd Proyecto_Métodos
   ```

2. **Construir e iniciar los contenedores:**
   ```bash
   docker compose up --build
   ```

3. **Acceder a las aplicaciones:**
   - **React:** http://localhost:5173
   - **Streamlit:** http://localhost:8501

4. **Detener los contenedores:**
   ```bash
   docker compose down
   ```

---

### Opción 2: Instalación Local

#### React

1. **Navegar al directorio:**
   ```bash
   cd react
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en navegador:**
   - http://localhost:5173

#### Streamlit

1. **Navegar al directorio:**
   ```bash
   cd streamlit
   ```

2. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Ejecutar aplicación:**
   ```bash
   streamlit run app.py
   ```

4. **Abrir en navegador:**
   - http://localhost:8501

---

## 📊 Uso de las Aplicaciones

### Parámetros Configurables

Ambas interfaces permiten configurar:

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| **Función g(x)** | Función de iteración | `cos(x)`, `sqrt(x + 1)` |
| **Valor inicial x₀** | Punto de partida | `0.5` |
| **Tolerancia ε** | Criterio de convergencia | `1e-6` |
| **Máximo de iteraciones** | Límite de iteraciones | `100` |
| **Criterio de parada** | `\|xₙ₊₁ - xₙ\|` o `\|g(xₙ) - xₙ\|` | Delta o Residual |
| **Aceleración de Aitken** | Método Δ² para acelerar convergencia | Activar/Desactivar |

### Resultados Mostrados

- ✅ **Valor aproximado** de la solución x*
- 📉 **Error de iteración** final
- 🔢 **Número de iteraciones** realizadas
- 📋 **Tabla detallada** de valores por iteración
- 📊 **Gráfico cobweb** (telaraña) mostrando el proceso iterativo

---

## 🎯 Ejemplos de Funciones

### Funciones que Convergen

1. **g(x) = cos(x)** con x₀ = 0.5
   - Converge a x* ≈ 0.739085

2. **g(x) = sqrt(x + 1)** con x₀ = 1.0
   - Converge a x* ≈ 1.618034 (proporción áurea)

3. **g(x) = exp(-x)** con x₀ = 0.5
   - Converge a x* ≈ 0.567143

### Funciones que Pueden Diverger

1. **g(x) = x² - 2** con x₀ = 2.0
   - Puede diverger dependiendo del valor inicial

---

## 🔬 Método de Punto Fijo

### Fórmula

```
xₙ₊₁ = g(xₙ)
```

### Condición de Convergencia

El método converge si:
```
|g'(x*)| < 1
```
donde x* es el punto fijo.

### Aceleración de Aitken (Δ²)

Fórmula:
```
x̂ₙ = xₙ - (xₙ₊₁ - xₙ)² / (xₙ₊₂ - 2xₙ₊₁ + xₙ)
```

Mejora la velocidad de convergencia usando tres iteraciones consecutivas.

---

## 📈 Gráfico Cobweb

El gráfico cobweb (telaraña) visualiza geométricamente el proceso iterativo:

1. **Línea azul:** Función g(x)
2. **Línea gris punteada:** Línea y = x
3. **Líneas rojas:** Iteraciones (patrón de telaraña)
4. **Punto verde:** Valor inicial x₀
5. **Punto rojo:** Valor final

### Interpretación

- **Convergencia:** Las líneas se acercan a un punto
- **Divergencia:** Las líneas se alejan del punto fijo
- **Oscilación:** Las líneas forman un patrón cíclico

---

## ✨ Ventajas del Proyecto

✅ **Separación clara** entre UI y lógica  
✅ **Dos experiencias de usuario:**
   - Minimalista (rápida, limpia, para estudio)
   - Visual avanzada (ideal para presentaciones)  
✅ **Listo para desplegar** en servidores, Docker o hosting local  
✅ **Código modular** y fácil de extender  
✅ **Type-safe** con TypeScript en React  
✅ **Manejo robusto de errores**  

---

## 🔮 Mejoras Futuras

| Mejora | Beneficio |
|--------|-----------|
| Verificación automática de convergencia | Evaluar \|g'(x*)\| < 1 |
| Exportación de reportes | PDF, CSV, JSON |
| Modo claro/oscuro en React | Versatilidad visual |
| Más métodos numéricos | Newton-Raphson, Secante, Bisección |
| Análisis de sensibilidad | Estudiar efecto de parámetros |

---

## 🐛 Solución de Problemas

### Docker

**Problema:** Los contenedores no inician
```bash
# Verificar que Docker Desktop esté ejecutándose
docker ps

# Reconstruir contenedores
docker compose up --build --force-recreate
```

**Problema:** Puerto ya en uso
```bash
# Cambiar puertos en docker-compose.yml
ports:
  - "5174:5173"  # React
  - "8502:8501"  # Streamlit
```

### React

**Problema:** Error de dependencias
```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Streamlit

**Problema:** Error al importar módulos
```bash
# Reinstalar dependencias
pip install --upgrade -r requirements.txt
```

---

## 📝 Licencia

Este proyecto es de código abierto y está disponible para uso educativo.

---

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📧 Contacto

Para preguntas o sugerencias sobre el proyecto, por favor abre un issue en el repositorio.

---

## 🎓 Referencias

- [Método de Punto Fijo - Wikipedia](https://en.wikipedia.org/wiki/Fixed-point_iteration)
- [Aitken's Delta-Squared Process](https://en.wikipedia.org/wiki/Aitken%27s_delta-squared_process)
- [Numerical Analysis - Burden & Faires](https://www.cengage.com/c/numerical-analysis-10e-burden)

---

**¡Disfruta explorando el Método de Punto Fijo! 🚀**
