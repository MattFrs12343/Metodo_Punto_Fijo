import { useState, useEffect } from 'react';

interface MathJaxConfig {
  tex: {
    inlineMath: string[][];
    displayMath: string[][];
    processEscapes: boolean;
  };
  svg: {
    fontCache: string;
  };
}

declare global {
  interface Window {
    MathJax: {
      typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
      config: MathJaxConfig;
    };
  }
}

export const useMathJax = () => {
  // Simplified version - always return loaded since we're using fallback rendering
  const [isLoaded] = useState(true);
  const [error] = useState<string | null>(null);

  return { isLoaded, error };
};