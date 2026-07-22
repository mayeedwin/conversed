declare module 'react' {
  export interface FC<P = {}> {
    (props: P): any;
  }
  export function createElement(type: any, props?: any, ...children: any[]): any;
}
