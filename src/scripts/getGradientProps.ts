
import type { Shape } from "../editor/ShapeType";

export const gradientProps = (shape: Shape) =>{
    if(shape.fillType === "solid" || !shape.gradient) return {};
    if(shape.fillType === "linear") return {
        fillLinearGradientStartPoint: shape.gradient.start,
        fillLinearGradientEndPoint: shape.gradient.end,
        fillLinearGradientColorStops: shape.gradient.colorStops,
    }
    if(shape.fillType === "radial") return {
        fillRadialGradientStartPoint:shape.gradient.start,
        fillRadialGradientStartRadius:shape.gradient.startRadius,
        fillRadialGradientEndPoint: shape.gradient.end,
        fillRadialGradientEndRadius:shape.gradient.endRadius,
        fillRadialGradientColorStops:shape.gradient.colorStops,
    }
}