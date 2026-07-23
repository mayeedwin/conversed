declare module 'react' {
  export interface FC<P = {}> {
    (props: P): any;
  }
  export interface RefObject<T> {
    current: T | null;
  }
  export function createElement(type: any, props?: any, ...children: any[]): any;
  export function useRef<T>(initialValue: T | null): RefObject<T>;
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
}
