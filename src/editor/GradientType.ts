import type { Vector2d } from "konva/lib/types";



export interface Gradient {
    start: Vector2d,
    end: Vector2d,
    colorStops: Array<any>,
    startRadius: number,
    endRadius: number

}