import { Shape } from "react-konva";

interface RegPolygonProps {
    width: number;
    height: number;
    x: number;
    y: number;
    fill: string;
    cornerRadius?: number;
    rotation?: number;
    sides?: number
    [key: string]: any; // for other Konva properties
}

const RegPolygon = (shapeProps: RegPolygonProps) => {

    const width = shapeProps.width;
    const height = shapeProps.height;
    const cornerRadius = shapeProps.cornerRadius || 0;
    const sides = shapeProps.sides || 3;
    
    return (
      <>
        <Shape
          {...shapeProps}
          width={width}
          scaleY={height/width}
          sceneFunc={(context, shape) => {
            context.beginPath();
            const radius = Math.min(width, height) / 2;
            const angleStep = (Math.PI * 2) / sides;
            const centerX = width / 2;
            const centerY = height / 2;
            
            const points = [];
            for (let i = 0; i < sides; i++) {
              const angle = i * angleStep - Math.PI / 2;
              points.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
              });
            }

            if (cornerRadius === 0) {
              // Draw regular polygon without rounded corners
              context.moveTo(points[0].x, points[0].y);
              for (let i = 1; i < sides; i++) {
                context.lineTo(points[i].x, points[i].y);
              }
            } else {
              // Draw polygon with rounded corners
              for (let i = 0; i < sides; i++) {
                const curr = points[i];
                const next = points[(i + 1) % sides];
                const prev = points[(i - 1 + sides) % sides];

                // Calculate the vectors
                const dx1 = curr.x - prev.x;
                const dy1 = curr.y - prev.y;
                const dx2 = next.x - curr.x;
                const dy2 = next.y - curr.y;

                // Normalize vectors
                const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
                const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                const nx1 = dx1 / len1;
                const ny1 = dy1 / len1;
                const nx2 = dx2 / len2;
                const ny2 = dy2 / len2;

                // Calculate corner points
                const radius = Math.min(cornerRadius, len1 / 2, len2 / 2);
                const p1x = curr.x - nx1 * radius;
                const p1y = curr.y - ny1 * radius;
                const p2x = curr.x + nx2 * radius;
                const p2y = curr.y + ny2 * radius;

                if (i === 0) {
                  context.moveTo(p1x, p1y);
                } else {
                  context.lineTo(p1x, p1y);
                }

                context.quadraticCurveTo(curr.x, curr.y, p2x, p2y);
              }
            }

            context.closePath();
            context.fillStrokeShape(shape);
          }}
        />
      </>
    );
}

export default RegPolygon
