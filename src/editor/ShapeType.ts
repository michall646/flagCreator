export interface Shape {
    id: string, // Unique ID for each rectangle
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    rotation: number,
    type: string,
    name: string,
    corners? : number;
    isGradient?: boolean;
    //gradient? : any
}