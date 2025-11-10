# 🚀 Inicio Rápido - 3 Pasos

## Paso 1: Iniciar Docker

```bash
docker compose up --build
```

Espera a ver estos mensajes:
- ✅ `react-1      | Local: http://localhost:5173/`
- ✅ `streamlit-1  | You can now view your Streamlit app`

## Paso 2: Abrir las Aplicaciones

### React (Interfaz Moderna)
🌐 http://localhost:5173

### Streamlit (Interfaz Avanzada)
🌐 http://localhost:8501

## Paso 3: Probar

### En React:
1. Función: `cos(x)` (ya está por defecto)
2. Click en **"Calcular"**
3. ✅ Debería converger a ~0.739085

### En Streamlit:
1. Función: `np.cos(x)` (ya está por defecto)
2. Click en **"🚀 Calcular"**
3. ✅ Debería converger a ~0.739085

---

## 🎯 Ejemplos Rápidos

### Convergencia Rápida
- **Función:** `cos(x)` o `np.cos(x)`
- **x₀:** 0.5
- **Resultado:** ~0.739085

### Proporción Áurea
- **Función:** `sqrt(x + 1)` o `np.sqrt(x + 1)`
- **x₀:** 1.0
- **Resultado:** ~1.618034

### Con Aceleración
- Activar checkbox **"Usar aceleración de Aitken"**
- Converge más rápido

---

## 🛑 Detener

```bash
Ctrl + C
docker compose down
```

---

## 📚 Más Información

- **Guía completa:** `README.md`
- **Instalación detallada:** Ver README.md
- **Resumen del proyecto:** Ver especificaciones en `.kiro/specs/`

---

**¡Listo! Disfruta explorando el Método de Punto Fijo 🎉**
