'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Cpu,
  Clock,
  HardDrive,
  BarChart2,
  CheckCircle2,
  Code2,
  Sparkles,
  AlertTriangle,
  RotateCw,
  ArrowLeft,
  Sliders,
  FileText,
  Server,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../src/features/auth';
import { Spinner, ErrorState, Button } from '../../src/features/common/components';

interface RubricScores {
  executionTime: number;
  memoryConsumption: number;
  throughput: number;
  codeQuality: number;
  reliability: number;
  functionalStyle: number;
}

interface LanguageMetrics {
  startupTimeMs: number;
  memoryIdleMb: number;
  memoryPeakMb: number;
  pipelineThroughputRecordsSec: number;
  httpRpsConcurrency50: number;
  httpP95LatencyMs: number;
  contractTestsPassed: number;
  contractTestsTotal: number;
  checksumValidityRate: number;
  unexpectedErrorRate: number;
  codeCoveragePercent: number;
  cyclomaticComplexityMean: number;
  functionsOver30LinesPercent: number;
  codeDuplicationPercent: number;
  nloc: number;
  explicitLoops: number;
  mutableVariables: number;
  functionalCoverageOperations: string;
  lambdaDensityPer100Nloc: number;
  nullLiteralsCount: number;
  cleanImports: boolean;
}

interface RankedLanguage {
  rank: number;
  language: string;
  key: string;
  framework: string;
  version: string;
  totalScore: number;
  scores: RubricScores;
  metrics: LanguageMetrics;
  strengths: string[];
  limitations: string[];
}

interface SensitivityScenario {
  name: string;
  winner: string;
  scores: Record<string, number>;
  notes?: string;
}

interface BenchmarkData {
  isExample?: boolean;
  exampleNotice?: string;
  generatedAt: string;
  runId: string;
  environment: {
    os: string;
    cpu: string;
    ramLimit: string;
    jdkVersion: string;
    jvmFlags: string;
    rounds: number;
    scenarios: string[];
  };
  rubricWeights: {
    executionTime: number;
    memoryConsumption: number;
    throughput: number;
    codeQuality: number;
    reliability: number;
    functionalStyle: number;
  };
  winner: {
    language: string;
    key: string;
    totalScore: number;
    summary: string;
  };
  rankings: RankedLanguage[];
  sensitivityAnalysis: {
    standardRubric: SensitivityScenario;
    equalWeights: SensitivityScenario;
    performanceHeavy: SensitivityScenario;
  };
}

export default function BenchmarkPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<BenchmarkData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ranking' | 'metrics' | 'sensitivity'>('ranking');

  const fetchBenchmarkData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Agregar timestamp para evitar almacenamiento en caché del archivo estático
      const res = await fetch(`/benchmark/ranking.json?t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(
          `No se pudo cargar el archivo public/benchmark/ranking.json (${res.status} ${res.statusText})`,
        );
      }
      const json = (await res.json()) as BenchmarkData;
      setData(json);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error inesperado al leer los datos de clasificación del benchmark.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'ADMIN') {
        router.push('/cases');
        return;
      }
      fetchBenchmarkData();
    }
  }, [authLoading, isAuthenticated, user, router, fetchBenchmarkData]);

  if (authLoading || (isLoading && !data)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4 font-mono text-xs">
        <Spinner className="w-8 h-8" />
        <p className="text-papel-muted uppercase tracking-widest animate-pulse">
          Cargando informe y métricas consolidadas de benchmark...
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <ErrorState message={error} />
        <div className="flex justify-end">
          <Button variant="secondary" onClick={fetchBenchmarkData}>
            <RotateCw className="w-4 h-4 mr-2" />
            Reintentar lectura
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const criteriaLabels: Record<
    keyof RubricScores,
    { label: string; weight: string; icon: React.ReactNode }
  > = {
    executionTime: {
      label: 'Tiempo de Ejecución',
      weight: '25%',
      icon: <Clock className="w-4 h-4 text-alerta" />,
    },
    memoryConsumption: {
      label: 'Consumo de Memoria',
      weight: '20%',
      icon: <HardDrive className="w-4 h-4 text-alerta" />,
    },
    throughput: {
      label: 'Rendimiento (Throughput)',
      weight: '20%',
      icon: <Zap className="w-4 h-4 text-alerta" />,
    },
    codeQuality: {
      label: 'Calidad de Código',
      weight: '15%',
      icon: <Code2 className="w-4 h-4 text-alerta" />,
    },
    reliability: {
      label: 'Confiabilidad',
      weight: '10%',
      icon: <CheckCircle2 className="w-4 h-4 text-alerta" />,
    },
    functionalStyle: {
      label: 'Uso Funcional',
      weight: '10%',
      icon: <Sparkles className="w-4 h-4 text-alerta" />,
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Aviso de confidencialidad y cabecera institucional noir */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-grafito-light gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest uppercase bg-alerta/20 text-alerta px-2 py-0.5 border border-alerta/40">
              ACCESO RESTRINGIDO // COMISARÍA GENERAL
            </span>
            <span className="text-xs font-mono text-papel-muted">LAB-BENCH-2026</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-papel font-medium tracking-wide">
            Comparativo de Lenguajes y Paradigmas
          </h1>
          <p className="font-mono text-xs text-papel-muted mt-1">
            Evaluación experimental cuantitativa y cualitativa en JVM 21: Java vs Scala vs Kotlin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase border border-grafito-light text-papel hover:bg-grafito transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Admin</span>
          </Link>
          <Button
            variant="secondary"
            className="px-2.5 py-1 text-[11px]"
            onClick={fetchBenchmarkData}
            title="Recargar datos del ranking"
          >
            <RotateCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Alerta si el archivo corresponde a datos de ejemplo */}
      {data.isExample && (
        <div
          role="alert"
          className="border border-alerta/60 bg-alerta/10 p-4 font-mono text-xs text-papel flex items-start gap-3 shadow-lg"
        >
          <AlertTriangle className="w-5 h-5 text-alerta shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-alerta tracking-wider uppercase block">
              [DATOS PRELIMINARES DE EJEMPLO // ENTORNO DE PRUEBAS DEL FRONTEND]
            </span>
            <p className="text-papel-dark leading-relaxed">
              {data.exampleNotice ||
                'Este panel muestra datos de prueba estructurados de acuerdo con la especificación de José Daniel Morales (Integrante D). Una vez finalizada la corrida del harness oficial en Docker, los resultados definitivos se volcarán automáticamente en este informe.'}
            </p>
          </div>
        </div>
      )}

      {/* Panel de Metadatos del Entorno Experimental */}
      <section className="border border-grafito-light bg-grafito p-4 sm:p-5 shadow-md">
        <h2 className="font-mono text-xs uppercase tracking-widest text-papel-dark font-semibold mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-alerta" />
          CONDICIONES DEL ENTORNO DE MEDICIÓN (DOCKER / EQUIDAD)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="border border-grafito-light/60 bg-grafito-dark p-2.5">
            <span className="text-[10px] text-papel-muted uppercase block">Sistema Operativo</span>
            <span className="text-papel font-medium truncate block">{data.environment.os}</span>
          </div>
          <div className="border border-grafito-light/60 bg-grafito-dark p-2.5">
            <span className="text-[10px] text-papel-muted uppercase block">Límite de CPU</span>
            <span className="text-alerta font-bold block">{data.environment.cpu}</span>
          </div>
          <div className="border border-grafito-light/60 bg-grafito-dark p-2.5">
            <span className="text-[10px] text-papel-muted uppercase block">Límite de Memoria</span>
            <span className="text-alerta font-bold block">{data.environment.ramLimit}</span>
          </div>
          <div className="border border-grafito-light/60 bg-grafito-dark p-2.5">
            <span className="text-[10px] text-papel-muted uppercase block">JDK & VM Flags</span>
            <span
              className="text-papel font-medium truncate block"
              title={data.environment.jvmFlags}
            >
              JDK 21 / G1GC
            </span>
          </div>
          <div className="border border-grafito-light/60 bg-grafito-dark p-2.5">
            <span className="text-[10px] text-papel-muted uppercase block">Rondas Rotadas</span>
            <span className="text-papel font-medium block">{data.environment.rounds} rondas</span>
          </div>
          <div className="border border-grafito-light/60 bg-grafito-dark p-2.5">
            <span className="text-[10px] text-papel-muted uppercase block">Escenarios</span>
            <span className="text-papel font-medium block">
              {data.environment.scenarios.join(', ')}
            </span>
          </div>
        </div>
      </section>

      {/* Tarjeta de Ganador Oficial */}
      <section className="border-2 border-alerta bg-grafito p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none overflow-hidden">
          <div className="bg-alerta text-tinta font-mono text-[9px] font-bold py-1 text-center uppercase tracking-widest transform rotate-45 translate-x-8 translate-y-4 w-40 shadow">
            PRIMER PUESTO
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-alerta" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-alerta">
                LENGUAJE GANADOR DE LA EVALUACIÓN
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-papel font-bold">
              {data.winner.language}
            </h2>
            <p className="font-mono text-xs sm:text-sm text-papel-dark leading-relaxed">
              {data.winner.summary}
            </p>
          </div>

          <div className="bg-grafito-dark border border-alerta/50 p-4 sm:p-6 text-center shrink-0 min-w-[180px]">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-papel-muted">
              PUNTAJE PONDERADO
            </span>
            <span className="block font-serif text-4xl sm:text-5xl font-bold text-alerta my-1">
              {data.winner.totalScore.toFixed(2)}
            </span>
            <span className="block font-mono text-[10px] text-papel-muted">
              de 100 puntos posibles
            </span>
          </div>
        </div>
      </section>

      {/* Pestañas de Navegación de Vistas */}
      <div className="border-b border-grafito-light flex items-center gap-2 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('ranking')}
          className={`px-4 py-2.5 border-b-2 font-bold uppercase transition-colors flex items-center gap-2 ${
            activeTab === 'ranking'
              ? 'border-alerta text-alerta bg-grafito'
              : 'border-transparent text-papel-muted hover:text-papel'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Clasificación y Puntuación</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2.5 border-b-2 font-bold uppercase transition-colors flex items-center gap-2 ${
            activeTab === 'metrics'
              ? 'border-alerta text-alerta bg-grafito'
              : 'border-transparent text-papel-muted hover:text-papel'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Métricas Detalladas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sensitivity')}
          className={`px-4 py-2.5 border-b-2 font-bold uppercase transition-colors flex items-center gap-2 ${
            activeTab === 'sensitivity'
              ? 'border-alerta text-alerta bg-grafito'
              : 'border-transparent text-papel-muted hover:text-papel'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Análisis de Sensibilidad</span>
        </button>
      </div>

      {/* VISTA 1: CLASIFICACIÓN Y PUNTUACIÓN POR CRITERIO */}
      {activeTab === 'ranking' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.rankings.map((item) => (
              <div
                key={item.key}
                className={`border p-5 flex flex-col justify-between transition-all bg-grafito shadow-xl ${
                  item.rank === 1
                    ? 'border-alerta ring-1 ring-alerta/30'
                    : 'border-grafito-light hover:border-grafito-light/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-grafito-light/70">
                    <div>
                      <span className="font-mono text-[10px] text-papel-muted uppercase tracking-widest block">
                        POSICIÓN #{item.rank}
                      </span>
                      <h3 className="font-serif text-2xl text-papel font-bold">{item.language}</h3>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xl font-bold text-alerta">
                        {item.totalScore.toFixed(2)}
                      </span>
                      <span className="block font-mono text-[9px] text-papel-muted">/ 100 pts</span>
                    </div>
                  </div>

                  <div className="py-2 font-mono text-[11px] text-papel-muted border-b border-grafito-light/40">
                    <span>{item.version}</span> &bull; <span>{item.framework}</span>
                  </div>

                  {/* Barras de Puntuación por Criterio */}
                  <div className="my-4 space-y-3 font-mono text-xs">
                    {(Object.keys(criteriaLabels) as (keyof RubricScores)[]).map((critKey) => {
                      const score = item.scores[critKey];
                      const meta = criteriaLabels[critKey];
                      return (
                        <div key={critKey} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-papel-dark flex items-center gap-1">
                              {meta.label}{' '}
                              <span className="text-papel-muted text-[10px]">({meta.weight})</span>
                            </span>
                            <span className="font-bold text-papel">{score.toFixed(1)}</span>
                          </div>
                          {/* Barra de progreso CSS pura */}
                          <div className="w-full h-2 bg-grafito-dark border border-grafito-light/50 overflow-hidden">
                            <div
                              className="h-full bg-alerta transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Fortalezas y Limitaciones */}
                <div className="pt-3 border-t border-grafito-light/60 space-y-2 text-xs">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase text-alerta block mb-1">
                      Aspectos Destacados
                    </span>
                    <ul className="list-disc list-inside text-papel-dark space-y-0.5 text-[11px]">
                      {item.strengths.slice(0, 2).map((s, idx) => (
                        <li key={idx} className="truncate" title={s}>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico Comparativo de Barras SVG Nativas */}
          <section className="border border-grafito-light bg-grafito p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-papel font-semibold">
                  Distribución Comparativa por Criterio
                </h3>
                <p className="font-mono text-xs text-papel-muted">
                  Visualización de rendimiento normalizado de los tres lenguajes
                </p>
              </div>
              <div className="flex items-center gap-4 font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-amber-500 inline-block" />
                  <span>Java</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-purple-500 inline-block" />
                  <span>Kotlin</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-red-500 inline-block" />
                  <span>Scala</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {(Object.keys(criteriaLabels) as (keyof RubricScores)[]).map((critKey) => {
                const meta = criteriaLabels[critKey];
                return (
                  <div key={critKey} className="border-b border-grafito-light/40 pb-3">
                    <div className="flex justify-between font-mono text-xs mb-1.5">
                      <span className="text-papel font-medium flex items-center gap-1.5">
                        {meta.icon}
                        {meta.label}
                      </span>
                      <span className="text-papel-muted">Peso: {meta.weight}</span>
                    </div>

                    <div className="space-y-1.5">
                      {data.rankings.map((lang) => {
                        const val = lang.scores[critKey];
                        const colorClass =
                          lang.key === 'java'
                            ? 'bg-amber-500'
                            : lang.key === 'kotlin'
                              ? 'bg-purple-500'
                              : 'bg-red-500';
                        return (
                          <div key={lang.key} className="flex items-center gap-2 font-mono text-xs">
                            <span className="w-14 text-papel-muted text-[11px] truncate">
                              {lang.language}
                            </span>
                            <div className="flex-1 h-3 bg-grafito-dark border border-grafito-light/40 overflow-hidden">
                              <div
                                className={`h-full ${colorClass} transition-all duration-300`}
                                style={{ width: `${val}%` }}
                              />
                            </div>
                            <span className="w-10 text-right text-papel font-bold text-[11px]">
                              {val.toFixed(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* VISTA 2: MÉTRICAS TÉCNICAS DETALLADAS */}
      {activeTab === 'metrics' && (
        <section className="border border-grafito-light bg-grafito p-6 shadow-xl space-y-6">
          <div>
            <h3 className="font-serif text-xl text-papel font-semibold">
              Métricas Cuantitativas y Reglas Verificables
            </h3>
            <p className="font-mono text-xs text-papel-muted">
              Datos extraídos por los instrumentos de medición, lizard y reglas funcionales
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-grafito-light bg-grafito-dark text-papel-muted uppercase text-[10px] tracking-wider">
                  <th className="p-3">Dimensión / Métrica</th>
                  {data.rankings.map((r) => (
                    <th key={r.key} className="p-3 text-papel font-bold">
                      {r.language}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-grafito-light/50">
                {/* Rendimiento y tiempo */}
                <tr className="bg-grafito-dark/40 font-bold text-alerta">
                  <td colSpan={4} className="p-2.5 uppercase text-[11px]">
                    1. Rendimiento, Carga y Latencia
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">Throughput Pipeline (registros / seg)</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 font-bold text-papel">
                      {r.metrics.pipelineThroughputRecordsSec.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">Throughput HTTP Concurrencia 50 (rps)</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-papel">
                      {r.metrics.httpRpsConcurrency50.toFixed(1)} req/s
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">Latencia HTTP p95 (ms)</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-papel">
                      {r.metrics.httpP95LatencyMs.toFixed(1)} ms
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">Tiempo de arranque en frío (ms)</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-papel">
                      {r.metrics.startupTimeMs} ms
                    </td>
                  ))}
                </tr>

                {/* Memoria */}
                <tr className="bg-grafito-dark/40 font-bold text-alerta">
                  <td colSpan={4} className="p-2.5 uppercase text-[11px]">
                    2. Consumo de Memoria en Contenedor (Límite 2 GB)
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">Memoria en reposo (Idle RAM)</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-papel">
                      {r.metrics.memoryIdleMb.toFixed(1)} MB
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">Pico de memoria bajo carga masiva</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-papel font-semibold">
                      {r.metrics.memoryPeakMb.toFixed(1)} MB
                    </td>
                  ))}
                </tr>

                {/* Calidad de código */}
                <tr className="bg-grafito-dark/40 font-bold text-alerta">
                  <td colSpan={4} className="p-2.5 uppercase text-[11px]">
                    3. Calidad de Código y Estilo
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">Cobertura de Líneas JaCoCo/scoverage</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-papel">
                      {r.metrics.codeCoveragePercent.toFixed(1)} %
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">Pruebas de contrato superadas</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-green-400 font-bold">
                      {r.metrics.contractTestsPassed} / {r.metrics.contractTestsTotal} (100 %)
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">Complejidad ciclomática media</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-papel">
                      {r.metrics.cyclomaticComplexityMean.toFixed(1)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">Líneas de Código Efectivas (NLOC)</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-papel">
                      {r.metrics.nloc}
                    </td>
                  ))}
                </tr>

                {/* Uso Funcional */}
                <tr className="bg-grafito-dark/40 font-bold text-alerta">
                  <td colSpan={4} className="p-2.5 uppercase text-[11px]">
                    4. Verificación de Paradigma Funcional (F1 a F6)
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">F1: Bucles explícitos (for / while)</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-green-400 font-bold">
                      {r.metrics.explicitLoops} (Perfecto)
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">F2: Variables mutables / estado mutable</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-green-400 font-bold">
                      {r.metrics.mutableVariables} (Inmutable)
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">F3: Operaciones funcionales requeridas</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-papel font-bold">
                      {r.metrics.functionalCoverageOperations}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">F4: Densidad de Lambdas por 100 NLOC</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-papel">
                      {r.metrics.lambdaDensityPer100Nloc.toFixed(1)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-papel-dark">F6: Pureza de Imports (analytics)</td>
                  {data.rankings.map((r) => (
                    <td key={r.key} className="p-3 text-green-400">
                      {r.metrics.cleanImports ? 'Cumple (Sin IO/SQL)' : 'No cumple'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* VISTA 3: ANÁLISIS DE SENSIBILIDAD */}
      {activeTab === 'sensitivity' && (
        <section className="space-y-6">
          <div className="border border-grafito-light bg-grafito p-6 shadow-xl space-y-4">
            <div>
              <h3 className="font-serif text-xl text-papel font-semibold">
                Análisis de Sensibilidad de la Clasificación
              </h3>
              <p className="font-mono text-xs text-papel-muted">
                Verificación de estabilidad del ganador al alterar los pesos de la rúbrica oficial
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {/* Escenario 1 */}
              <div className="border border-alerta bg-grafito-dark p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-grafito-light">
                  <span className="font-bold text-alerta uppercase">
                    {data.sensitivityAnalysis.standardRubric.name}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(data.sensitivityAnalysis.standardRubric.scores).map(
                    ([lang, sc]) => (
                      <div key={lang} className="flex justify-between">
                        <span className="text-papel-dark">{lang}</span>
                        <span className="font-bold text-papel">{sc.toFixed(2)} pts</span>
                      </div>
                    ),
                  )}
                </div>
                <div className="pt-2 border-t border-grafito-light/50 text-[11px] text-papel-muted">
                  Ganador:{' '}
                  <strong className="text-alerta">
                    {data.sensitivityAnalysis.standardRubric.winner}
                  </strong>
                </div>
              </div>

              {/* Escenario 2 */}
              <div className="border border-grafito-light bg-grafito-dark p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-grafito-light">
                  <span className="font-bold text-papel uppercase">
                    {data.sensitivityAnalysis.equalWeights.name}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(data.sensitivityAnalysis.equalWeights.scores).map(
                    ([lang, sc]) => (
                      <div key={lang} className="flex justify-between">
                        <span className="text-papel-dark">{lang}</span>
                        <span className="font-bold text-papel">{sc.toFixed(2)} pts</span>
                      </div>
                    ),
                  )}
                </div>
                <div className="pt-2 border-t border-grafito-light/50 text-[11px] text-papel-muted">
                  Ganador:{' '}
                  <strong className="text-alerta">
                    {data.sensitivityAnalysis.equalWeights.winner}
                  </strong>
                  {data.sensitivityAnalysis.equalWeights.notes && (
                    <p className="mt-1 text-[10px] text-papel-dark">
                      {data.sensitivityAnalysis.equalWeights.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Escenario 3 */}
              <div className="border border-grafito-light bg-grafito-dark p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-grafito-light">
                  <span className="font-bold text-papel uppercase">
                    {data.sensitivityAnalysis.performanceHeavy.name}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(data.sensitivityAnalysis.performanceHeavy.scores).map(
                    ([lang, sc]) => (
                      <div key={lang} className="flex justify-between">
                        <span className="text-papel-dark">{lang}</span>
                        <span className="font-bold text-papel">{sc.toFixed(2)} pts</span>
                      </div>
                    ),
                  )}
                </div>
                <div className="pt-2 border-t border-grafito-light/50 text-[11px] text-papel-muted">
                  Ganador:{' '}
                  <strong className="text-alerta">
                    {data.sensitivityAnalysis.performanceHeavy.winner}
                  </strong>
                  {data.sensitivityAnalysis.performanceHeavy.notes && (
                    <p className="mt-1 text-[10px] text-papel-dark">
                      {data.sensitivityAnalysis.performanceHeavy.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pie con referencia a la memoria técnica y al monorepo */}
      <footer className="border-t border-grafito-light/60 pt-4 flex flex-col sm:flex-row items-center justify-between text-papel-muted font-mono text-[11px] gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-alerta" />
          <span>EXPEDIENTE TÉCNICO // EVALUACIÓN DE LENGUAJES Y PARADIGMAS</span>
        </div>
        <div>
          <span>ID Corrida: {data.runId}</span> &bull;{' '}
          <span>Generado: {new Date(data.generatedAt).toLocaleString('es-CO')}</span>
        </div>
      </footer>
    </div>
  );
}
