import { useState, type FC } from 'react';
import { createBackground, createBackgrounds } from './BackgroundLibrary';
import type { Shape } from '../editor/ShapeType';
import './BackgroundSelector.css';
import { Layer, Stage } from 'react-konva';
import { gradientProps } from '../scripts/getGradientProps';
import { Rect, Circle } from 'react-konva';
import RegPolygon from '../editor/RegPolygon';
import { Colorful, type ColorResult } from '@uiw/react-color';

interface BackgroundSelectorProps {
    onSelectBackground: (shapes: Shape[]) => void;
    stageWidth: number;
    stageHeight: number;
    bgColors: string[];
    setBgColors: (bgColors: string[]) => void
}

export const BackgroundSelector: FC<BackgroundSelectorProps> = ({ onSelectBackground, stageWidth, stageHeight, bgColors, setBgColors }) => {

    const [editingIndex, setEditingIndex] = useState(-1);

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
          key: shape.id
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

    const handleColorChange = (color: ColorResult) => {
        if(editingIndex === -1) return
        
        const temp = bgColors.slice();
        temp[editingIndex] = color.hex;
        setBgColors(temp)
    }

    
    console.log(stageWidth, stageHeight)
    return (
        <div className="sidebox">
            <h3>Backgrounds</h3>
            <div className="background-grid">
                {createBackgrounds(stageWidth, stageHeight, bgColors).map((bg) => (
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
            <div style={{display: 'flex', justifyContent: 'space-around', margin: 5}}>
                <div className='colorSelector' style={{backgroundColor: bgColors[0], borderColor: editingIndex === 0? "white": "transparent"}} onClick={() => setEditingIndex(0)}></div>
                <div className='colorSelector' style={{backgroundColor: bgColors[1], borderColor: editingIndex === 1? "white": "transparent"}} onClick={() => setEditingIndex(1)}></div>
                <div className='colorSelector' style={{backgroundColor: bgColors[2], borderColor: editingIndex === 2? "white": "transparent"}} onClick={() => setEditingIndex(2)}></div>
                <div className='colorSelector' style={{backgroundColor: bgColors[3], borderColor: editingIndex === 3? "white": "transparent"}} onClick={() => setEditingIndex(3)}></div>
            </div>

            <Colorful
                color={bgColors[editingIndex]}
                onChange={handleColorChange}
            />

            
        </div>
    );
};
