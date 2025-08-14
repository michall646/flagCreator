
import { Rect, Circle, Stage, Layer } from 'react-konva';
import RegPolygon from './RegPolygon';
import { gradientProps } from '../scripts/getGradientProps';
import type { Shape } from './ShapeType';

interface shape{
    id: string, // Unique ID for each rectangle
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    rotation: number,
    type: string,
    name: string,
    
}

interface tileProps {
  index: number
  shape: shape,
  change: (id:string, event:any)=> void,
  editingId: string,
  setEditingId: (id:string)=> void,
  selected: string[],
  handleSelected: (id: string, event:any) => void;
}


const ShapeTile = ({shape, change, editingId, setEditingId, selected, handleSelected}: tileProps) => {

    const handleDoubleClick = () => {
        setEditingId(shape.id);
    }

    // Handle text change in the input field
    const handleChange = (event: any) => {
        change(shape.id, event.target.value);
    };

    // Handle blur (when the user clicks away) to exit edit mode
    const handleBlur = () => {
        setEditingId("");
    };

    // Handle key presses, specifically the 'Enter' key, to exit edit mode
    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter') {
            setEditingId("");
        }
    };

    const handleClick = (event:any) => {
        handleSelected(shape.id, event.shiftKey || event.ctrlKey);

    }

    const renderShape = (shape: Shape) => {
        const ICON_SIZE = 30;
        const scaleX = ICON_SIZE / shape.width;
        const scaleY = ICON_SIZE / shape.height;
        const scale = Math.min(scaleX, scaleY);
        const gradient = gradientProps(shape)
        const props = {
          x: 0,
          y: 0,
          width: shape.width,
          height: shape.height,
          ...gradient,
          rotation:0,
          scale: {x: scale, y:scale}
        }
        const shapeOffset = {x: shape.width * scale / 2, y: shape.height * scale / 2}
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

    const ShapeIcon = renderShape(shape);

    const isSelected = selected.includes(shape.id);
    const bgClass = isSelected? 'toolSelected':'';
  return (
    <div onClick={handleClick} className={'shapeTile ' + bgClass}>
        <Stage width={30} height={30}>
            <Layer>
                {ShapeIcon}
            </Layer>
        </Stage>
      {editingId === shape.id ? (
        <input
          type="text"
          value={shape.name}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus // Automatically focuses the input when it's rendered
        />
      ) : (
        <span onDoubleClick={handleDoubleClick}>
          {shape.name}
        </span>
      )}
    </div>
  )
}

export default ShapeTile
