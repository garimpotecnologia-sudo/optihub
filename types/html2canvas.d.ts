declare module "html2canvas" {
  interface Options {
    width?: number;
    height?: number;
    scale?: number;
    useCORS?: boolean;
    backgroundColor?: string | null;
    [key: string]: unknown;
  }
  export default function html2canvas(
    element: HTMLElement,
    options?: Options
  ): Promise<HTMLCanvasElement>;
}
