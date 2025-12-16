import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FixedPointResult } from '../lib/fixedPoint';

interface SubStep {
  content: string;
  explanation: string;
  highlight?: boolean;
}

interface MathStep {
  stepNumber: number;
  title: string;
  content: string[];
  subSteps?: SubStep[];
  explanation: string;
  isVisible: boolean;
  hasSubSteps?: boolean;
}

interface MathRendererProps {
  latex: string;
  display?: boolean;
  highlight?: boolean;
}

const MathRenderer: React.FC<MathRendererProps> = ({ latex, display = true, highlight = false }) => {
  const renderMath = (latexStr: string): string => {
    let rendered = latexStr;
    
    rendered = rendered.replace(/\\cos/g, 'cos');
    rendered = rendered.replace(/\\sin/g, 'sin');
    rendered = rendered.replace(/\\tan/g, 'tan');
    rendered = rendered.replace(/\\exp/g, 'exp');
    rendered = rendered.replace(/\\log/g, 'log');
    rendered = rendered.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
    rendered = rendered.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
    rendered = rendered.replace(/\{([^}]+)\}/g, '$1');
    rendered = rendered.replace(/\^/g, '^');
    rendered = rendered.replace(/\\_/g, '_');
    rendered = rendered.replace(/\\varepsilon/g, 'ε');
    rendered = rendered.replace(/\\longrightarrow/g, '→');
    rendered = rendered.replace(/\\quad/g, ' ');
    rendered = rendered.replace(/\\left\(/g, '(');
    rendered = rendered.replace(/\\right\)/g, ')');
    rendered = rendered.replace(/\\text\{([^}]+)\}/g, '$1');
    
    return rendered;
  };

  return (
    <div className={`math-expression text-center my-4 ${display ? 'display-math' : 'inline-math'}`}>
      <div className={`relative backdrop-blur-sm rounded-lg p-4 font-mono text-xl transition-all duration-300 ${
        highlight 
          ? 'bg-cyan-500/10 border border-cyan-400/30 text-cyan-100 shadow-lg shadow-cyan-500/20' 
          : 'bg-slate-800/60 border border-slate-600/40 text-slate-100'
      }`}>
        {highlight && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-violet-500/5 rounded-lg"></div>
        )}
        <div className="relative z-10">
          {renderMath(latex)}
        </div>
      </div>
    </div>
  );
};

interface StepByStepViewProps {
  originalFunction: string;
  gFunction: string;
  result: FixedPointResult;
  tolerance: number;
  stopCriterion: 'delta' | 'residual';
  onClose: () => void;
}

const StepByStepView: React.FC<StepByStepViewProps> = ({
  originalFunction,
  gFunction,
  result,
  tolerance,
  stopCriterion,
  onClose
}) => {
  const [steps, setSteps] = useState<MathStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateSteps();
  }, [originalFunction, gFunction]);

  const generateAlgebraicSubSteps = (originalFunc: string, gFunc: string): SubStep[] => {
    const subSteps: SubStep[] = [];
    
    subSteps.push({
      content: `${convertToLatex(originalFunc)} = 0`,
      explanation: "Ecuación original que queremos resolver"
    });

    if (gFunc.includes('cos(')) {
      subSteps.push({
        content: `cos(x) - x = 0`,
        explanation: "Identificamos los términos de la ecuación"
      });
      subSteps.push({
        content: `cos(x) = x`,
        explanation: "Movemos x al lado derecho"
      });
      subSteps.push({
        content: `x = cos(x)`,
        explanation: "Intercambiamos lados para obtener la forma x = g(x)",
        highlight: true
      });
    } else if (gFunc.includes('sin(')) {
      subSteps.push({
        content: `sin(x) - x = 0`,
        explanation: "Identificamos los términos de la ecuación"
      });
      subSteps.push({
        content: `sin(x) = x`,
        explanation: "Movemos x al lado derecho"
      });
      subSteps.push({
        content: `x = sin(x)`,
        explanation: "Intercambiamos lados para obtener la forma x = g(x)",
        highlight: true
      });
    } else {
      subSteps.push({
        content: `${convertToLatex(gFunc)} - x = 0`,
        explanation: "Identificamos los términos de la ecuación"
      });
      subSteps.push({
        content: `x = ${convertToLatex(gFunc)}`,
        explanation: "Obtenemos la forma final x = g(x)",
        highlight: true
      });
    }

    return subSteps;
  };

  const generateDerivativeSubSteps = (gFunc: string): SubStep[] => {
    const subSteps: SubStep[] = [];
    
    subSteps.push({
      content: `g(x) = ${convertToLatex(gFunc)}`,
      explanation: "Función a derivar"
    });

    if (gFunc.includes('cos(')) {
      subSteps.push({
        content: `g'(x) = d/dx[cos(x)]`,
        explanation: "Aplicamos la regla de derivación del coseno"
      });
      subSteps.push({
        content: `g'(x) = -sin(x)`,
        explanation: "La derivada del coseno es -seno",
        highlight: true
      });
    } else if (gFunc.includes('sin(')) {
      subSteps.push({
        content: `g'(x) = d/dx[sin(x)]`,
        explanation: "Aplicamos la regla de derivación del seno"
      });
      subSteps.push({
        content: `g'(x) = cos(x)`,
        explanation: "La derivada del seno es coseno",
        highlight: true
      });
    } else if (gFunc.includes('exp(')) {
      subSteps.push({
        content: `g'(x) = d/dx[exp(x)]`,
        explanation: "Aplicamos la regla de derivación de la exponencial"
      });
      subSteps.push({
        content: `g'(x) = exp(x)`,
        explanation: "La derivada de exp(x) es exp(x)",
        highlight: true
      });
    } else if (gFunc.includes('log(')) {
      subSteps.push({
        content: `g'(x) = d/dx[log(x)]`,
        explanation: "Aplicamos la regla de derivación del logaritmo"
      });
      subSteps.push({
        content: `g'(x) = 1/x`,
        explanation: "La derivada de log(x) es 1/x",
        highlight: true
      });
    } else if (gFunc.includes('sqrt(')) {
      subSteps.push({
        content: `g'(x) = d/dx[√x]`,
        explanation: "Aplicamos la regla de derivación de la raíz cuadrada"
      });
      subSteps.push({
        content: `g'(x) = 1/(2√x)`,
        explanation: "La derivada de √x es 1/(2√x)",
        highlight: true
      });
    } else if (gFunc.includes('x^')) {
      const match = gFunc.match(/x\^(\d+)/);
      if (match) {
        const power = match[1];
        const newPower = parseInt(power) - 1;
        subSteps.push({
          content: `g'(x) = d/dx[x^${power}]`,
          explanation: `Aplicamos la regla de la potencia para x^${power}`
        });
        subSteps.push({
          content: `g'(x) = ${power}x^${newPower}`,
          explanation: `La derivada de x^n es n·x^(n-1)`,
          highlight: true
        });
      }
    } else {
      subSteps.push({
        content: `g'(x) = d/dx[${convertToLatex(gFunc)}]`,
        explanation: "Calculamos la derivada de la función",
        highlight: true
      });
    }

    return subSteps;
  };

  const generateSteps = () => {
    const newSteps: MathStep[] = [];

    newSteps.push({
      stepNumber: 1,
      title: "Función original",
      content: [`f(x) = ${convertToLatex(originalFunction)} = 0`],
      explanation: "Se parte de la ecuación original f(x) = 0, cuyo objetivo es encontrar el valor de x que satisface la igualdad.",
      isVisible: true
    });

    newSteps.push({
      stepNumber: 2,
      title: "Despeje algebraico",
      content: [
        `${convertToLatex(originalFunction)} = 0`,
        `x = ${convertToLatex(gFunction)}`
      ],
      subSteps: generateAlgebraicSubSteps(originalFunction, gFunction),
      explanation: "Reordenamos la ecuación original para despejar x y obtener una expresión equivalente de la forma x = g(x).",
      isVisible: true,
      hasSubSteps: true
    });

    newSteps.push({
      stepNumber: 3,
      title: "Transformación f(x) → g(x)",
      content: [
        "f(x) = 0  →  x = g(x)",
        `g(x) = ${convertToLatex(gFunction)}`
      ],
      explanation: "La función g(x) se obtiene del despeje algebraico y se utilizará en el proceso iterativo.",
      isVisible: true
    });

    newSteps.push({
      stepNumber: 4,
      title: "Derivación de g(x)",
      content: [`g'(x) = d/dx(${convertToLatex(gFunction)})`],
      subSteps: generateDerivativeSubSteps(gFunction),
      explanation: "Se deriva la función g(x) para analizar la convergencia del método.",
      isVisible: true,
      hasSubSteps: true
    });

    newSteps.push({
      stepNumber: 5,
      title: "Condición de convergencia",
      content: ["|g'(x)| < 1"],
      explanation: "El método de punto fijo converge si esta condición se cumple en el entorno de la raíz.",
      isVisible: true
    });

    newSteps.push({
      stepNumber: 6,
      title: "Iteración del método",
      content: ["x_{n+1} = g(x_n)"],
      explanation: "A partir de un valor inicial x₀, se aplica la función g(x) de forma iterativa.",
      isVisible: true
    });

    const criterionFormula = stopCriterion === 'delta' 
      ? "|x_{n+1} - x_n| < ε"
      : "|f(x_n)| < ε";
    
    newSteps.push({
      stepNumber: 7,
      title: "Criterio de parada",
      content: [criterionFormula],
      explanation: "El proceso se detiene cuando el error es menor que la tolerancia establecida.",
      isVisible: true
    });

    setSteps(newSteps);
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      if (stepRef.current) {
        stepRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      if (stepRef.current) {
        stepRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  };

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    if (stepRef.current) {
      stepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  const convertToLatex = (func: string): string => {
    let latex = func;
    
    latex = latex.replace(/cos\(/g, 'cos(');
    latex = latex.replace(/sin\(/g, 'sin(');
    latex = latex.replace(/tan\(/g, 'tan(');
    latex = latex.replace(/exp\(/g, 'exp(');
    latex = latex.replace(/log\(/g, 'log(');
    latex = latex.replace(/sqrt\(/g, '√(');
    latex = latex.replace(/abs\(/g, '|');
    latex = latex.replace(/\*\*/g, '^');
    latex = latex.replace(/\|([^|]+)\)/g, '|$1|');
    
    return latex;
  };

  if (steps.length === 0) {
    return null;
  }

  const currentStep = steps[currentStepIndex];

  return (
    <div className="h-full bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/50 flex flex-col">
      {/* Header - Académico y profesional */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <h2 className="text-xl font-semibold text-slate-100">
              Análisis Paso a Paso
            </h2>
          </div>
          <div className="text-sm text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50">
            {currentStepIndex + 1} / {steps.length}
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="px-4 py-2 text-slate-300 hover:text-slate-100 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg transition-all duration-200 text-sm font-medium border border-slate-700/50 hover:border-slate-600/50"
        >
          Cerrar
        </button>
      </div>

      {/* Progress Indicator - Minimalista y elegante */}
      <div className="px-6 py-4 border-b border-slate-700/30 flex-shrink-0">
        <div className="relative">
          <div className="flex space-x-1 mb-3">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`flex-1 h-1 rounded-full transition-all duration-500 ease-out ${
                  index === currentStepIndex
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30'
                    : index < currentStepIndex
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : 'bg-slate-700/60'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs">
            {steps.map((step, index) => (
              <span 
                key={index} 
                className={`transition-all duration-300 ${
                  index === currentStepIndex 
                    ? 'text-cyan-300 font-medium' 
                    : index < currentStepIndex
                    ? 'text-emerald-400'
                    : 'text-slate-500'
                }`}
              >
                {step.stepNumber}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content - Diseño académico progresivo */}
      <div className="flex-1 overflow-auto p-6">
        <motion.div
          key={currentStepIndex}
          ref={stepRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Step Section - Bloque horizontal limpio */}
          <div className="mb-8">
            <div className="flex items-start space-x-6 mb-6">
              {/* Indicador visual del paso */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    <span className="text-white font-bold text-lg">{currentStep.stepNumber}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur opacity-30 animate-pulse"></div>
                </div>
              </div>
              
              {/* Título y explicación */}
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-semibold text-slate-100 mb-3">
                  {currentStep.title}
                </h3>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {currentStep.explanation}
                </p>
              </div>
            </div>
            
            {/* Línea separadora con glow sutil */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent mb-8"></div>
          </div>

          {/* Mathematical Content - Secuencia animada progresiva */}
          {currentStep.subSteps && currentStep.subSteps.length > 0 ? (
            <div className="space-y-8 mb-12">
              {currentStep.subSteps.map((subStep, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.3,
                    ease: "easeOut"
                  }}
                  className="relative"
                >
                  {/* Paso de transformación */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0 transition-all duration-300 ${
                      subStep.highlight 
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30' 
                        : 'bg-slate-700/60 text-slate-300 border border-slate-600/50'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-300 leading-relaxed">
                        {subStep.explanation}
                      </p>
                    </div>
                  </div>
                  
                  {/* Expresión matemática como protagonista */}
                  <div className="ml-12">
                    <MathRenderer latex={subStep.content} highlight={subStep.highlight} />
                  </div>
                  
                  {/* Indicador de resultado final */}
                  {subStep.highlight && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.3 + 0.5, duration: 0.4 }}
                      className="ml-12 mt-4"
                    >
                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-medium rounded-lg backdrop-blur-sm">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                        Forma final
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Flecha de continuidad (excepto en el último paso) */}
                  {index < currentStep.subSteps!.length - 1 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.3 + 0.6, duration: 0.3 }}
                      className="flex justify-center mt-6 mb-2"
                    >
                      <div className="text-slate-500 text-2xl">↓</div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mb-12">
              {currentStep.content.map((latex, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.6 }}
                >
                  <MathRenderer latex={latex} />
                </motion.div>
              ))}
            </div>
          )}



          {/* Información especializada - Diseño académico */}
          {currentStep.stepNumber === 6 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/30 rounded-xl p-6 mb-8 shadow-xl"
            >
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center mr-3">
                  <div className="w-3 h-3 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                </div>
                <h4 className="text-xl font-semibold text-slate-100">Resultados del Proceso Iterativo</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h5 className="font-medium text-cyan-300 text-lg">Convergencia</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-slate-300">Valor final:</span>
                      <span className="font-mono text-cyan-200 text-lg">{result.finalValue.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-slate-300">Error final:</span>
                      <span className="font-mono text-cyan-200">{result.finalError.toExponential(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-slate-300">Iteraciones:</span>
                      <span className="font-mono text-cyan-200">{result.iterations.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h5 className="font-medium text-violet-300 text-lg">Parámetros</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-slate-300">Tolerancia:</span>
                      <span className="font-mono text-violet-200">{tolerance ? tolerance.toExponential(2) : '1.00e-6'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-slate-300">Criterio:</span>
                      <span className="font-mono text-violet-200">{stopCriterion === 'delta' ? '|xₙ₊₁ - xₙ|' : '|f(xₙ)|'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-slate-300">Estado:</span>
                      <span className={`font-medium flex items-center ${result.success ? 'text-emerald-300' : 'text-red-300'}`}>
                        <div className={`w-3 h-3 rounded-full mr-2 ${result.success ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'}`}></div>
                        {result.success ? 'Convergió' : 'No convergió'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-5 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <p className="text-slate-200 leading-relaxed">
                  El método aplica repetidamente la fórmula{' '}
                  <span className="font-mono bg-slate-800/60 px-3 py-1 rounded border border-slate-600/50 text-cyan-200">
                    x<sub>n+1</sub> = g(x<sub>n</sub>)
                  </span>{' '}
                  comenzando desde x₀ = {result.iterations.length > 0 ? result.iterations[0].xn.toFixed(3) : 'N/A'} hasta alcanzar la convergencia.
                </p>
              </div>
            </motion.div>
          )}

          {currentStep.stepNumber === 7 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-slate-800/40 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6 mb-8 shadow-xl shadow-amber-500/10"
            >
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
                </div>
                <h4 className="text-xl font-semibold text-slate-100">Criterio de Convergencia</h4>
              </div>
              
              <div className="text-center mb-6">
                <div className="bg-slate-700/40 backdrop-blur-sm border border-amber-400/30 rounded-lg p-6 shadow-inner">
                  <p className="font-mono text-2xl text-amber-200 mb-2">
                    {stopCriterion === 'delta' 
                      ? `|xₙ₊₁ - xₙ| < ${tolerance ? tolerance.toExponential(2) : '1.00e-6'}`
                      : `|f(xₙ)| < ${tolerance ? tolerance.toExponential(2) : '1.00e-6'}`
                    }
                  </p>
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent my-4"></div>
                  <p className="text-slate-300">
                    <span className="font-medium text-amber-300">Tolerancia:</span> {tolerance ? tolerance.toExponential(2) : '1.00e-6'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Navigation - Elegante y minimalista */}
      <div className="flex items-center justify-between p-6 border-t border-slate-700/30 flex-shrink-0 bg-slate-800/20 backdrop-blur-sm">
        <button
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          className="flex items-center space-x-3 px-5 py-3 bg-slate-700/40 hover:bg-slate-600/40 text-slate-300 hover:text-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 text-sm font-medium border border-slate-600/30 hover:border-slate-500/50 backdrop-blur-sm"
        >
          <span className="text-lg">←</span>
          <span>Anterior</span>
        </button>

        {/* Indicadores de navegación elegantes */}
        <div className="flex space-x-3">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentStepIndex
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 scale-125 shadow-lg shadow-cyan-500/50'
                  : index < currentStepIndex
                  ? 'bg-emerald-400 hover:bg-emerald-300 shadow-sm shadow-emerald-400/30'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextStep}
          disabled={currentStepIndex === steps.length - 1}
          className="flex items-center space-x-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
        >
          <span>Siguiente</span>
          <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  );
};

export default StepByStepView;