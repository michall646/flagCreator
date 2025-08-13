import type { Gradient } from "./GradientType";

export interface Shape {
    id: string, // Unique ID for each rectangle
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    rotation: number,
    sides? : number,
    type: string, 
    name: string,
    corners? : number;
    fillType: "solid"|"linear"|"radial";
    gradient? : Gradient,
    value?: string,
    size?: number,
    font?: string,
    align?: "left" | "center" | "right"|string,
    path?: string,
    strokeColor?: string,
    strokeWidth?: number,
}
