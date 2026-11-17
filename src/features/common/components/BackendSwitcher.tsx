'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Server, ChevronDown, Check, AlertCircle } from 'lucide-react';
import {
  BACKEND_TARGETS,
  BackendTarget,
  getSelectedBackend,
  switchBackend,
  isBackendSwitcherEnabled,
  getBackendHost,
} from '../config/api.config';

export const BackendSwitcher: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [selected, setSelected] = useState<BackendTarget>('java');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [targetToConfirm, setTargetToConfirm] = useState<BackendTarget | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEnabled(isBackendSwitcherEnabled());
    setSelected(getSelectedBackend());
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setTargetToConfirm(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!enabled) {
    return null;
  }

  const currentOption = BACKEND_TARGETS[selected] || BACKEND_TARGETS.java;

  const handleSelect = (key: BackendTarget) => {
    if (key === selected) {
      setIsOpen(false);
      return;
    }
    setTargetToConfirm(key);
  };

  const handleConfirmSwitch = () => {
    if (!targetToConfirm) return;
    switchBackend(targetToConfirm);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Botón activador del selector */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase bg-grafito-dark border border-grafito-light hover:border-alerta text-papel transition-colors"
        title="Cambiar backend de ejecución (Java / Scala / Kotlin)"
        aria-label="Selector de backend de ejecución"
        aria-expanded={isOpen}
      >
        <Server className="w-3 h-3 text-alerta shrink-0" aria-hidden="true" />
        <span className="font-bold text-alerta">{selected.toUpperCase()}</span>
        <span className="text-papel-muted text-[10px]">:{currentOption.port}</span>
        <ChevronDown className="w-3 h-3 text-papel-muted" aria-hidden="true" />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 border border-grafito-light bg-grafito-dark/95 backdrop-blur shadow-2xl z-50 p-2 font-mono text-xs">
          <div className="px-2 py-1.5 border-b border-grafito-light/60 mb-1">
            <span className="text-[10px] text-papel-muted uppercase tracking-widest block font-bold">
              CONEXIÓN DE BACKEND (DEMO)
            </span>
            <span className="text-[9px] text-papel-muted block mt-0.5">
              Cambiar cerrará la sesión actual y recargará la vista.
            </span>
          </div>

          <div className="space-y-1">
            {(Object.keys(BACKEND_TARGETS) as BackendTarget[]).map((key) => {
              const option = BACKEND_TARGETS[key];
              const isCurrent = key === selected;
              const hostUrl = getBackendHost(key);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelect(key)}
                  className={`w-full text-left px-2.5 py-2 border transition-colors flex items-center justify-between ${
                    isCurrent
                      ? 'border-alerta bg-grafito text-alerta font-bold'
                      : 'border-transparent text-papel hover:border-grafito-light hover:bg-grafito'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs uppercase">{option.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-alerta" />}
                    </div>
                    <span className="text-[10px] text-papel-muted mt-0.5">{hostUrl}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Confirmación explícita para evitar cambios accidentales */}
          {targetToConfirm && (
            <div className="mt-2 pt-2 border-t border-alerta/40 bg-alerta/5 p-2 text-[11px]">
              <div className="flex items-start gap-1.5 text-alerta mb-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  ¿Conectar a <strong>{BACKEND_TARGETS[targetToConfirm].name}</strong>? Se cerrará
                  la sesión.
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTargetToConfirm(null)}
                  className="px-2 py-1 text-[10px] border border-grafito-light text-papel-muted hover:text-papel hover:bg-grafito"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSwitch}
                  className="px-2 py-1 text-[10px] bg-alerta text-tinta font-bold border border-alerta hover:bg-alerta/90"
                >
                  Cambiar y recargar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
