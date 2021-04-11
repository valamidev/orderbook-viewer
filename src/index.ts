export const Overlay = (): void => {

};

declare global {
  interface Window {
    Overlay: any;
  }
}

window.Overlay = Overlay;
