import { useCallback } from 'react';

/**
 * Wrapper around React.useCallback that helps avoid stale closures.
 * Warns in development if dependencies are missing or incomplete.
 */
export function useCallbackDeps(callback, deps) {
  if (process.env.NODE_ENV === 'development') {
    if (deps === undefined) {
      console.warn(
        'useCallbackDeps: Falta el arreglo de dependencias. ' +
        'Asegúrate de pasar un arreglo como segundo argumento.'
      );
    } else if (Array.isArray(deps) && deps.length === 0) {
      console.warn(
        'useCallbackDeps: El arreglo de dependencias está vacío. ' +
        'Asegúrate de incluir todas las variables externas utilizadas en el callback.'
      );
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
}
