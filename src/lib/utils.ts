import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRandomPin = (chars: string, len: number) =>
  [...Array(len)]
    .map((i) => chars[Math.floor(Math.random() * chars.length)])
    .join("");

export const blobToImage = (blob: Blob) => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    let img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.src = url;
  });
};
