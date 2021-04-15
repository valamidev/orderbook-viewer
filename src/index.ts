import { Start } from "./app/app";


export const Overlay = async (): Promise<void> => {

  console.log('Application started');

  await Start();

};

declare global {
  interface Window {
    Overlay: any;
  }
}

window.Overlay = Overlay;

window.onload = () => {
  Overlay().then();
};
