import { RegularPolygon } from "react-konva";
import { useRef } from "react";
const RegPolygon = (shapeProps) => {
    const shapeRef = useRef();
    console.log(shapeProps)

    const width = shapeProps.width;
    const height = shapeProps.height;
    const scaleX = 1;
    const scaleY = height / width;


    return (
      <>
        <RegularPolygon
          sides={3}
          radius={70}
          ref={shapeRef}
          {...shapeProps}
          height={shapeProps.width}
          scale={{x: scaleX, y: scaleY}}
          draggable
        />
      </>
    );
}

export default RegPolygon
