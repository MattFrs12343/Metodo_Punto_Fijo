import streamlit as st
import numpy as np
import pandas as pd
from typing import Callable, Tuple, List
from dataclasses import dataclass
from pathlib import Path

@dataclass
class IterationResult:
    n: int
    xn: float
    gxn: float
    error: float
    aitken_value: float = None

def parse_function(func_str: str) -> Callable:
    """Parse string function to callable using eval with safe namespace"""
    # Safe namespace with numpy functions
    safe_namespace = {
        "np": np,
        "sin": np.sin,
        "cos": np.cos,
        "tan": np.tan,
        "exp": np.exp,
        "log": np.log,
        "log10": np.log10,
        "sqrt": np.sqrt,
        "abs": np.abs,
        "pi": np.pi,
        "e": np.e,
        "arcsin": np.arcsin,
        "arccos": np.arccos,
        "arctan": np.arctan,
        "sinh": np.sinh,
        "cosh": np.cosh,
        "tanh": np.tanh,
    }
    
    def g(x):
        return eval(func_str, {"__builtins__": {}}, {**safe_namespace, "x": x})
    
    return g

def aitken_acceleration(xn: float, xn1: float, xn2: float) -> float:
    """Apply Aitken's delta-squared acceleration"""
    denominator = xn2 - 2 * xn1 + xn
    
    if abs(denominator) < 1e-10:
        return xn2
    
    numerator = (xn1 - xn) ** 2
    return xn - numerator / denominator

def fixed_point_iteration(
    g: Callable,
    x0: float,
    tol: float,
    max_iter: int,
    criterion: str,
    use_aitken: bool
) -> Tuple[List[IterationResult], bool, str]:
    """Execute fixed point iteration"""
    iterations = []
    
    try:
        # Initial iteration
        x = x0
        gx = g(x)
        
        iterations.append(IterationResult(
            n=0,
            xn=x,
            gxn=gx,
            error=abs(gx - x)
        ))
        
        # Iteration loop
        for n in range(1, max_iter + 1):
            x_prev = x
            x = gx
            gx = g(x)
            
            # Calculate error
            if criterion == 'delta':
                error = abs(x - x_prev)
            else:  # residual
                error = abs(gx - x)
            
            iteration = IterationResult(
                n=n,
                xn=x,
                gxn=gx,
                error=error
            )
            
            # Apply Aitken if enabled
            if use_aitken and len(iterations) >= 2:
                xn = iterations[-2].xn
                xn1 = iterations[-1].xn
                xn2 = x
                iteration.aitken_value = aitken_acceleration(xn, xn1, xn2)
            
            iterations.append(iteration)
            
            # Check convergence
            if error < tol:
                return iterations, True, f"Convergencia alcanzada en {n} iteraciones"
            
            # Check divergence
            if abs(x) > 1e10:
                return iterations, False, "El método diverge: los valores crecen sin límite"
        
        return iterations, False, f"No se alcanzó convergencia en {max_iter} iteraciones"
        
    except Exception as e:
        return iterations, False, f"Error durante el cálculo: {str(e)}"

def main():
    st.set_page_config(
        page_title="Método de Punto Fijo",
        page_icon="📊",
        layout="wide"
    )
    
    st.title("🔢 Método de Iteración de Punto Fijo")
    st.markdown("### Visualización Avanzada con Streamlit")
    
    # Sidebar for parameters
    with st.sidebar:
        st.header("⚙️ Parámetros")
        
        g_func_str = st.text_input(
            "Función g(x)",
            value="np.cos(x)",
            help="Ejemplos: np.cos(x), x**2 - 2, np.sqrt(x + 1)"
        )
        
        x0 = st.number_input(
            "Valor inicial x₀",
            value=0.5,
            step=0.1,
            format="%.4f"
        )
        
        tolerance = st.number_input(
            "Tolerancia (ε)",
            value=1e-6,
            format="%.2e",
            min_value=1e-10,
            max_value=1e-1
        )
        
        max_iter = st.number_input(
            "Máximo de iteraciones",
            value=100,
            min_value=1,
            max_value=1000,
            step=1
        )
        
        criterion = st.selectbox(
            "Criterio de parada",
            options=["delta", "residual"],
            format_func=lambda x: "|xₙ₊₁ - xₙ|" if x == "delta" else "|g(xₙ) - xₙ|"
        )
        
        use_aitken = st.checkbox(
            "Usar aceleración de Aitken (Δ²)",
            value=False
        )
        
        calculate_btn = st.button("🚀 Calcular", type="primary", use_container_width=True)
    
    # Main content
    if calculate_btn:
        try:
            # Parse function
            g = parse_function(g_func_str)
            
            # Test function
            _ = g(x0)
            
            # Execute algorithm
            with st.spinner("Calculando..."):
                iterations, success, message = fixed_point_iteration(
                    g, x0, tolerance, max_iter, criterion, use_aitken
                )
            
            # Display results
            if success:
                st.success(message)
            else:
                st.warning(message)
            
            # Summary metrics
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric(
                    "Valor final",
                    f"{iterations[-1].xn:.8f}" if np.isfinite(iterations[-1].xn) else "N/A"
                )
            
            with col2:
                st.metric(
                    "Error final",
                    f"{iterations[-1].error:.2e}" if np.isfinite(iterations[-1].error) else "N/A"
                )
            
            with col3:
                st.metric(
                    "Iteraciones",
                    len(iterations)
                )
            
            # Iterations table
            st.subheader("📋 Tabla de Iteraciones")
            
            # Create DataFrame
            df_data = {
                "n": [iter.n for iter in iterations],
                "xₙ": [iter.xn for iter in iterations],
                "g(xₙ)": [iter.gxn for iter in iterations],
                "Error": [iter.error for iter in iterations]
            }
            
            if use_aitken:
                df_data["Aitken"] = [
                    iter.aitken_value if iter.aitken_value is not None else np.nan
                    for iter in iterations
                ]
            
            df = pd.DataFrame(df_data)
            
            # Format display
            st.dataframe(
                df.style.format({
                    "xₙ": "{:.8f}",
                    "g(xₙ)": "{:.8f}",
                    "Error": "{:.2e}",
                    "Aitken": "{:.8f}"
                }),
                use_container_width=True,
                height=400
            )
            
            # Embed HTML visualization if file exists
            html_file = Path(__file__).parent / "fixed_point_demo_sigfmt.html"
            if html_file.exists():
                st.subheader("📊 Visualización Avanzada")
                with open(html_file, "r", encoding="utf-8") as f:
                    html_content = f.read()
                    st.components.v1.html(html_content, height=800, scrolling=True)
            
        except SyntaxError as e:
            st.error(f"❌ Error de sintaxis en g(x): {e}")
        except Exception as e:
            st.error(f"❌ Error al evaluar función: {e}")
    
    else:
        # Initial state
        st.info("👈 Configure los parámetros en la barra lateral y haga clic en 'Calcular'")
        
        # Show examples
        st.subheader("📚 Ejemplos de funciones")
        
        examples = [
            ("np.cos(x)", "Función coseno (converge a ~0.739085)"),
            ("np.sqrt(x + 1)", "Raíz cuadrada (converge a ~1.618034)"),
            ("x**2 - 2", "Parábola (puede diverger)"),
            ("np.exp(-x)", "Exponencial negativa"),
        ]
        
        for func, desc in examples:
            st.code(func, language="python")
            st.caption(desc)
            st.divider()

if __name__ == "__main__":
    main()
