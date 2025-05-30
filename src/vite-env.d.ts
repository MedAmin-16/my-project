/// <reference types="vite/client" />

// Allow importing .png files
declare module "*.png" {
  const value: string;
  export default value;
}

// Allow importing .jpg files
declare module "*.jpg" {
  const value: string;
  export default value;
}

// Allow importing .svg files
declare module "*.svg" {
  const value: string;
  export default value;
}