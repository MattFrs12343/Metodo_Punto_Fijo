import { useState } from 'react';
import { fixedPointIteration, FixedPointResult } from './lib/fixedPoint';
import CobwebCanvas from './components/CobwebCanvas';
import { getUnitSymbol, formatNumber as formatNumberUtil, formatError, formatValueWithUnit } from './lib/formatter';

function App() {
  const [gFunction, setGFunction] = useState('cos(x)');
  const [x0, setX0] = useState(0.5);
  const [tolerance, setTolerance] = useState(1e-6);
  const [maxIterations, setMaxIterations] = useState(100);
  const [stopCriterion, setStopCriterion] = useState<'delta' | 'residual'>('delta');
  const [errorType, setErrorType] = useState<'absolute' | 'relative'>('absolute');
  const [useAitken, setUseAitken] = useState(false);
  const [precisionMode, setPrecisionMode] = useState<'decimals' | 'significant'>('significant');
  const [decimals, setDecimals] = useState(6);
  const [significantFigures, setSignificantFigures] = useState(6);
  const [angleUnit, setAngleUnit] = useState<'radians' | 'degrees'>('radians');
  
  const [result, setResult] = useState<FixedPointResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Format numbers for display only (never for calculations)
  // This function applies formatting at render time only
  const formatNumber = (num: number): string => {
    return formatNumberUtil(num, {
      precisionMode,
      decimals,
      significantFigures
    });
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const calculationResult = fixedPointIteration({
        gFunction,
        x0,
        tolerance,
        maxIterations,
        stopCriterion,
        errorType,
        useAitken,
        significantFigures,
        angleUnit
      });
      
      setResult(calculationResult);
      setIsCalculating(false);
    }, 10);
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setGFunction('cos(x)');
    setX0(0.5);
    setTolerance(1e-6);
    setMaxIterations(100);
    setStopCriterion('delta');
    setErrorType('absolute');
    setUseAitken(false);
    setPrecisionMode('significant');
    setDecimals(6);
    setSignificantFigures(6);
    setAngleUnit('radians');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
      {showWelcome ? (
        // Welcome Screen
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            {/* Main Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-12 hover:border-white/20 transition-all duration-500">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-block mb-6">
                  <div className="text-7xl mb-4 animate-bounce">
                    <svg className="w-20 h-20 mx-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4">
                  Método de Punto Fijo
                </h1>
                <p className="text-xl text-gray-300 font-light">
                  Análisis Numérico Avanzado
                </p>
              </div>

              {/* Description */}
              <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
                <p className="text-gray-300 text-center leading-relaxed">
                  Herramienta interactiva para el cálculo de puntos fijos mediante iteración funcional.
                  Incluye visualización cobweb, análisis de convergencia y aceleración de Aitken.
                </p>
              </div>

              {/* Team Section */}
              <div className="mb-10">
                <h3 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
                  Integrantes
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    'Franco Salvatierra Matias',
                    'Duran Perez Melissa',
                    'Cortez Cáceres Lucas',
                    'Ribas Abanillo Yasirenday',
                    'Veliz Loayza Jhamil',
                    'Montaño Ortiz José Manuel'
                  ].map((name, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-3 border border-indigo-400/20 hover:border-indigo-400/40 hover:scale-105 transition-all duration-300"
                    >
                      <p className="text-gray-200 text-sm text-center font-medium">
                        {name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <button
                  onClick={() => setShowWelcome(false)}
                  className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50"
                >
                  <span className="mr-2">Iniciar Cálculos</span>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                  Métodos Numéricos • 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Main Application
        <div className="h-full max-w-[1800px] mx-auto p-4 flex flex-col">
          <div className="flex items-center justify-end mb-3">
            <button
              onClick={() => setShowWelcome(true)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              ← Volver al inicio
            </button>
          </div>
          
          <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
            {/* Input Panel */}
          <div className="col-span-3">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-4 h-full border border-indigo-400/20 hover:border-indigo-400/40 hover:shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.01]">
              <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-3">⚙️ Parámetros</h2>
              
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">
                    Función g(x)
                  </label>
                  <input
                    type="text"
                    value={gFunction}
                    onChange={(e) => setGFunction(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white/90 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="cos(x)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-200 mb-1">
                      x₀
                    </label>
                    <input
                      type="number"
                      value={x0}
                      onChange={(e) => setX0(parseFloat(e.target.value))}
                      step="0.1"
                      className="w-full px-2.5 py-1.5 text-sm bg-white/90 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-200 mb-1">
                      Unidad
                    </label>
                    <select
                      value={angleUnit}
                      onChange={(e) => setAngleUnit(e.target.value as 'radians' | 'degrees')}
                      className="w-full px-2.5 py-1.5 text-sm bg-white/90 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="radians">Radianes</option>
                      <option value="degrees">Grados (°)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">
                    Tolerancia
                  </label>
                  <input
                    type="number"
                    value={tolerance}
                    onChange={(e) => setTolerance(parseFloat(e.target.value))}
                    step="0.000001"
                    className="w-full px-2.5 py-1.5 text-sm bg-white/90 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">
                    Máx. iteraciones
                  </label>
                  <input
                    type="number"
                    value={maxIterations}
                    onChange={(e) => setMaxIterations(parseInt(e.target.value))}
                    min="1"
                    className="w-full px-2.5 py-1.5 text-sm bg-white/90 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">
                    Criterio
                  </label>
                  <select
                    value={stopCriterion}
                    onChange={(e) => setStopCriterion(e.target.value as 'delta' | 'residual')}
                    className="w-full px-2.5 py-1.5 text-sm bg-white/90 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="delta">|xₙ₊₁ - xₙ|</option>
                    <option value="residual">|g(xₙ) - xₙ|</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">
                    Tipo de Error
                  </label>
                  <select
                    value={errorType}
                    onChange={(e) => setErrorType(e.target.value as 'absolute' | 'relative')}
                    className="w-full px-2.5 py-1.5 text-sm bg-white/90 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="absolute">Absoluto</option>
                    <option value="relative">Relativo (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">
                    Precisión
                  </label>
                  <select
                    value={precisionMode}
                    onChange={(e) => setPrecisionMode(e.target.value as 'decimals' | 'significant')}
                    className="w-full px-2.5 py-1.5 text-sm bg-white/90 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="decimals">Decimales</option>
                    <option value="significant">Cifras Significativas</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-200 mb-1">
                      Decimales
                    </label>
                    <input
                      type="number"
                      value={decimals}
                      onChange={(e) => setDecimals(Math.max(1, Math.min(15, parseInt(e.target.value) || 6)))}
                      min="1"
                      max="15"
                      disabled={precisionMode !== 'decimals'}
                      className="w-full px-2.5 py-1.5 text-sm bg-white/90 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-200 mb-1">
                      Cifras Sig.
                    </label>
                    <input
                      type="number"
                      value={significantFigures}
                      onChange={(e) => setSignificantFigures(Math.max(1, Math.min(15, parseInt(e.target.value) || 6)))}
                      min="1"
                      max="15"
                      disabled={precisionMode !== 'significant'}
                      className="w-full px-2.5 py-1.5 text-sm bg-white/90 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    id="aitken"
                    checked={useAitken}
                    onChange={(e) => setUseAitken(e.target.checked)}
                    className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="aitken" className="ml-2 block text-xs text-gray-200">
                    Aitken (Δ²)
                  </label>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 font-medium text-sm"
                  >
                    {isCalculating ? '⏳ Calculando...' : '🚀 Calcular'}
                  </button>

                  {result && (
                    <button
                      onClick={handleNewAnalysis}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-4 rounded-lg hover:from-emerald-500 hover:to-teal-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-emerald-500/50 font-medium text-sm"
                    >
                      ✨ Nuevo Análisis
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="col-span-9 flex flex-col gap-3 min-h-0">
            {result && (
              <>
                {/* Advertencia de Derivada */}
                {result.derivativeWarning && (
                  <div className="bg-yellow-500/20 border border-yellow-400/50 backdrop-blur-md p-2.5 rounded-xl hover:border-yellow-400/70 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 animate-pulse">
                    <p className="text-xs text-yellow-200">{result.derivativeWarning}</p>
                  </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-5 gap-2.5">
                  <div className={`p-2.5 rounded-xl backdrop-blur-md border transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer ${result.success ? 'bg-emerald-500/20 border-emerald-400/50 hover:border-emerald-400/70 hover:shadow-emerald-500/30' : 'bg-red-500/20 border-red-400/50 hover:border-red-400/70 hover:shadow-red-500/30'}`}>
                    <p className={`text-xs font-medium mb-1 ${result.success ? 'text-emerald-200' : 'text-red-200'}`}>
                      Estado
                    </p>
                    <p className={`text-sm font-bold ${result.success ? 'text-emerald-100' : 'text-red-100'}`}>
                      {result.message}
                    </p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-xl p-2.5 rounded-xl border border-indigo-400/20 hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-105 transition-all duration-300 cursor-pointer" title="Aproximación final del punto fijo">
                    <p className="text-xs font-medium text-gray-200 mb-1">Valor Final</p>
                    <p className="text-base font-bold text-white">
                      {formatValueWithUnit(result.finalValue, result.angleUnit, {
                        precisionMode,
                        decimals,
                        significantFigures
                      })}
                    </p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-xl p-2.5 rounded-xl border border-blue-400/20 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <p className="text-xs font-medium text-gray-200 mb-1">Error Final</p>
                    <p className="text-base font-bold text-white">
                      {formatError(result.finalError, {
                        precisionMode,
                        decimals,
                        significantFigures
                      })}
                    </p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-xl p-2.5 rounded-xl border border-cyan-400/20 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <p className="text-xs font-medium text-gray-200 mb-1">Iteraciones</p>
                    <p className="text-base font-bold text-white">
                      {result.iterations.length}
                    </p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl p-2.5 rounded-xl border border-pink-400/20 hover:border-pink-400/50 hover:shadow-lg hover:shadow-pink-500/20 hover:scale-105 transition-all duration-300 cursor-pointer" title="Derivada numérica en x₀">
                    <p className="text-xs font-medium text-gray-200 mb-1">|g'(x₀)|</p>
                    <p className="text-base font-bold text-white">
                      {result.derivativeValue !== undefined ? Math.abs(result.derivativeValue).toFixed(4) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Criterio de Convergencia */}
                {result.convergenceCriterion && (
                  <div className="bg-blue-500/20 border border-blue-400/50 backdrop-blur-md p-2 rounded-xl hover:border-blue-400/70 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                    <p className="text-xs text-blue-200">
                      <span className="font-semibold">Criterio:</span> {result.convergenceCriterion}
                    </p>
                  </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
                  {/* Cobweb Plot */}
                  {result.success && result.iterations.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-3 border border-indigo-400/20 hover:border-indigo-400/40 hover:shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.01] flex flex-col">
                      <h2 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">📈 Gráfico Cobweb</h2>
                      <div className="flex-1 flex items-center justify-center min-h-0">
                        <CobwebCanvas 
                          gFunction={gFunction}
                          iterations={result.iterations}
                          angleUnit={result.angleUnit}
                          width={450}
                          height={450}
                        />
                      </div>
                    </div>
                  )}

                  {/* Iterations Table */}
                  {result.iterations.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-3 border border-cyan-400/20 hover:border-cyan-400/40 hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.01] flex flex-col min-h-0">
                      <h2 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">📊 Iteraciones</h2>
                      <div className="flex-1 overflow-auto min-h-0">
                        <table className="w-full text-xs">
                          <thead className="bg-white/5 sticky top-0">
                            <tr>
                              <th className="px-2 py-1.5 text-left font-medium text-gray-200">n</th>
                              <th className="px-2 py-1.5 text-left font-medium text-gray-200">
                                xₙ ({getUnitSymbol(result.angleUnit)})
                              </th>
                              <th className="px-2 py-1.5 text-left font-medium text-gray-200">
                                g(xₙ) ({getUnitSymbol(result.angleUnit)})
                              </th>
                              <th className="px-2 py-1.5 text-left font-medium text-gray-200">Error</th>
                              {useAitken && (
                                <th className="px-2 py-1.5 text-left font-medium text-gray-200">
                                  Aitken ({getUnitSymbol(result.angleUnit)})
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {result.iterations.map((iter) => (
                              <tr key={iter.n} className="hover:bg-white/5 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-transparent transition-all duration-200">
                                <td className="px-2 py-1 text-gray-300">{iter.n}</td>
                                <td className="px-2 py-1 text-gray-300">{formatNumber(iter.xn)}</td>
                                <td className="px-2 py-1 text-gray-300">{formatNumber(iter.gxn)}</td>
                                <td className="px-2 py-1 text-gray-300">{formatError(iter.error, {
                                  precisionMode,
                                  decimals,
                                  significantFigures
                                })}</td>
                                {useAitken && (
                                  <td className="px-2 py-1 text-gray-300">
                                    {iter.aitkenValue !== undefined ? formatNumber(iter.aitkenValue) : '-'}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!result && (
              <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-500 flex items-center justify-center group">
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
                  <h3 className="text-xl font-medium text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">Listo para calcular</h3>
                  <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                    Configura los parámetros y presiona "Calcular"
                  </p>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
