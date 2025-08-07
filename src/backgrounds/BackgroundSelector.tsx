import type { FC } from 'react';
import { createBackground, createBackgrounds } from './BackgroundLibrary';
import type { Shape } from '../editor/ShapeType';
import './BackgroundSelector.css';
import { Layer, Stage } from 'react-konva';
import { gradientProps } from '../scripts/getGradientProps';
import { Rect, Circle } from 'react-konva';
import RegPolygon from '../editor/RegPolygon';

interface BackgroundSelectorProps {
    onSelectBackground: (shapes: Shape[]) => void;
    stageWidth: number;
    stageHeight: number;
}

export const BackgroundSelector: FC<BackgroundSelectorProps> = ({ onSelectBackground, stageWidth, stageHeight }) => {

    const renderShape = (shape: Shape) => {
        const gradient = gradientProps(shape);
        console.log(shape.width / stageWidth, shape.height / stageHeight)
        const props = {
          x: shape.x / stageWidth,
          y: shape.y / stageHeight,
          width: shape.width / stageWidth,
          height: shape.height / stageHeight,
          ...gradient,
          rotation:shape.rotation,
        }
        const shapeOffset = {x: shape.width / 2, y: shape.height / 2}
        if(shape.type === "rectangle"){
            return <Rect {...props} />
        }
        if(shape.type === "regular"){
            return <RegPolygon {...props} {...shapeOffset} />
        }
        if(shape.type === "circle"){
            return <Circle {...props} {...shapeOffset}/>
        }

    }
    console.log(stageWidth, stageHeight)
    return (
        <div className="background-selector">
            <h3>Backgrounds</h3>
            <hr></hr>
            <h4>Pattern</h4>
            <div className="background-grid">
                {createBackgrounds(stageWidth, stageHeight).map((bg) => (
                    <div
                        key={bg.id}
                        className="background-item"
                        onClick={() => onSelectBackground(bg.shapes)}
                    >
                        <div className="background-preview">
                        <Stage width={80} height={50}>
                            <Layer>
                                {createBackground(bg.name, bg.shapes, 80, 50).shapes.map(renderShape)}
                            </Layer>
                        </Stage>
                        </div>
                    </div>
                ))}
            </div>
            <h4>Colors</h4>
        </div>
    );
};
