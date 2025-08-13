import { Stage, Layer, Line, Rect, Transformer, Ellipse, Circle, Path } from 'react-konva';
import { useState, useEffect, useRef } from 'react';
import Konva from 'konva';
import type { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';
import { type ColorResult } from '@uiw/react-color';
import RegPolygon from './RegPolygon';
import { bringDownByOne, bringToTheBottom, bringToTheTop, bringUpByOne } from '../scripts/layers';
import ObjectList from './ObjectList';
import ToolBar from './ToolBar';
import SideBar from './SideBar';
import type { Shape } from './ShapeType';
import type { Gradient } from './GradientType';
import { gradientProps } from '../scripts/getGradientProps';
import { BackgroundSelector } from '../backgrounds/BackgroundSelector';
import EditableText from './EditableText';
import SymbolSelector from '../symbols/SymbolSelector';

const GUIDELINE_OFFSET = 5;

interface Guide {
            lineGuide: number,
            offset: number,
            orientation: 'H' | 'V'|String,
            snap: string,
}
interface lineGuideStop {
    vertical:number[], 
    horizontal:number[]
}


interface selectionRec  {
    visible: boolean,
    x1: number,
    x2: number,
    y1: number,
    y2: number
}
interface canvasState {
    shapes: Shape[],
    background: any
}

const degToRad = (angle: number) => (angle / 180) * Math.PI;

const getCorner = (pivotX: number, pivotY: number, diffX: number, diffY: number, angle: number) => {
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);
  angle += Math.atan2(diffY, diffX);
  const x = pivotX + distance * Math.cos(angle);
  const y = pivotY + distance * Math.sin(angle);
  return { x, y };
};

const getClientRect = (element:Shape) => {
  const { x, y, width, height, rotation = 0 } = element;
  const rad = degToRad(rotation);

  const p1 = getCorner(x, y, 0, 0, rad);
  const p2 = getCorner(x, y, width, 0, rad);
  const p3 = getCorner(x, y, width, height, rad);
  const p4 = getCorner(x, y, 0, height, rad);

  const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
  const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
  const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
  const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const getLineGuideStops = (skipShapeIds: string[], allRectsData: Shape[], rectRefs: React.MutableRefObject<Record<string, Konva.Rect | null>>, stageWidth:number, stageHeight: number) => {
    // We can snap to stage borders and the center of the stage
    const vertical = [0, stageWidth / 2, stageWidth];
    const horizontal = [0, stageHeight / 2, stageHeight];

    // And we snap over edges and center of each object on the canvas
    allRectsData.forEach((rectData) => {
        if (skipShapeIds.includes(rectData.id)) {
            return;
        }
        const guideItemNode = rectRefs.current[rectData.id];
        if (guideItemNode) {
            const box = guideItemNode.getClientRect();
            // And we can snap to all edges of shapes
            vertical.push(box.x, box.x + box.width, box.x + box.width / 2);
            horizontal.push(box.y, box.y + box.height, box.y + box.height / 2);
        }
    });

    return {
        vertical: vertical.flat(),
        horizontal: horizontal.flat(),
    };
};

// Helper function to get snapping points of the object being dragged
function getObjectSnappingEdges(node: Konva.Shape) {
    const box = node.getClientRect();
    const absPos = node.absolutePosition();

    return {
        vertical: [
            {
                guide: Math.round(box.x),
                offset: Math.round(absPos.x - box.x),
                snap: 'start',
            },
            {
                guide: Math.round(box.x + box.width / 2),
                offset: Math.round(absPos.x - box.x - box.width / 2),
                snap: 'center',
            },
            {
                guide: Math.round(box.x + box.width),
                offset: Math.round(absPos.x - box.x - box.width),
                snap: 'end',
            },
        ],
        horizontal: [
            {
                guide: Math.round(box.y),
                offset: Math.round(absPos.y - box.y),
                snap: 'start',
            },
            {
                guide: Math.round(box.y + box.height / 2),
                offset: Math.round(absPos.y - box.y - box.height / 2),
                snap: 'center', // Corrected from 'end' in original
            },
            {
                guide: Math.round(box.y + box.height),
                offset: Math.round(absPos.y - box.y - box.height),
                snap: 'end',
            },
        ],
    };
}

function getGuides(lineGuideStops: lineGuideStop, itemBounds:any) {
    const resultV: any[] = [];
    const resultH: any[] = [];

    lineGuideStops.vertical.forEach((lineGuide) => {
        itemBounds.vertical.forEach((itemBound: any) => {
            const diff = Math.abs(lineGuide - itemBound.guide);
            // If the distance between guild line and object snap point is close, we can consider this for snapping
            if (diff < GUIDELINE_OFFSET) {
                resultV.push({
                    lineGuide: lineGuide,
                    diff: diff,
                    snap: itemBound.snap,
                    offset: itemBound.offset,
                });
            }
        });
    });

    lineGuideStops.horizontal.forEach((lineGuide) => {
        itemBounds.horizontal.forEach((itemBound:any) => {
            const diff = Math.abs(lineGuide - itemBound.guide);
            if (diff < GUIDELINE_OFFSET) {
                resultH.push({
                    lineGuide: lineGuide,
                    diff: diff,
                    snap: itemBound.snap,
                    offset: itemBound.offset,
                });
            }
        });
    });

    const guides = [];

    // Find closest snap
    const minV = resultV.sort((a, b) => a.diff - b.diff)[0];
    const minH = resultH.sort((a, b) => a.diff - b.diff)[0];

    if (minV) {
        guides.push({
            lineGuide: minV.lineGuide,
            offset: minV.offset,
            orientation: 'V',
            snap: minV.snap,
        });
    }
    if (minH) {
        guides.push({
            lineGuide: minH.lineGuide,
            offset: minH.offset,
            orientation: 'H',
            snap: minH.snap,
        });
    }
    return guides;
}


const Editor = () => {


    // Calculate stage dimensions to maintain 5:8 ratio
    const calculateStageDimensions = () => {
        const maxWidth = window.innerWidth * 0.8; // Use 80% of window width
        const maxHeight = window.innerHeight * 0.8; // Use 80% of window height
        
        // Target ratio is 5:8
        const targetRatio = 5/8;
        
        let width = maxWidth;
        let height = width * targetRatio;
        
        // If height is too large, calculate from height instead
        if (height > maxHeight) {
            height = maxHeight;
            width = height / targetRatio;
        }
        
        return { width, height };
    };

    const [stageWidth, setStageWidth] = useState(calculateStageDimensions().width);
    const [stageHeight, setStageHeight] = useState(calculateStageDimensions().height);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [background, setBackground] = useState<Shape[]>([]);
    const [guides, setGuides] = useState<Guide[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [tool, setTool] = useState<"none"| "rectangle" | "circle" | "polygon" | "background"| "text">("rectangle");
    const history = useRef<canvasState[]>([]);
    const redoStack =  useRef<canvasState[]>([]);
    const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
    const [selectionRectangle, setSelectionRectangle] = useState<selectionRec>({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    });
    const [showSymbolSelector, setShowSymbolSelector] = useState(false);
    const [sides, setSides] = useState<number>(-1);

    const [selectedStop, setSelectedStop] = useState<number>(-1);

    const rectRefs = useRef<Record<string, Konva.Rect | null>>({});
    const transformerRef = useRef<Konva.Transformer | null>(null);
    const isSelecting = useRef<boolean>(false);

    const [gradient, setGradient] = useState<Gradient>({
        start: {x: 50, y: 50},
        end: {x: 17, y:50},
        startRadius: 0,
        endRadius: 50,
        colorStops: [0, '#79d3db', 1, '#79db8c'],
    })

    const [showSideBar, setSideBar] = useState<boolean>(false);

    const [bgColors, setBgColors] = useState([
        "#f2ff00",
        "#ff0000",
        "#00ffc3",
        "#55ff00ff"
    ])


    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' && selectedIds.length > 0) {
                saveState();
                setShapes(prevShapes => prevShapes.filter(shape => !selectedIds.includes(shape.id) ));

                setSelectedIds([]);
            }

            if((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z' && history.current.length > 0){
                const popped = popFromHistory();
                if (popped) {
                    setShapes(popped.shapes);
                }
            }
            if((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z'){
                
                const redo = redoStack.current.pop();
                
                if(redo){
                    setShapes(redo.shapes);
                }
            }

            // Handle copy (Ctrl+C or Cmd+C)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedIds.length > 0) {
                const selectedShapes = shapes.filter(shape => selectedIds.includes(shape.id));
                // Store in clipboard with offset for paste
                const clipboard = selectedShapes.map(shape => ({
                    ...shape,
                    id: `${shape.id}-${shapes.length}`,
                    x: shape.x + 20,
                    y: shape.y + 20,
                    name: getNextItemName(shape.type)
                }));
                localStorage.setItem('shapesClipboard', JSON.stringify(clipboard));
            }

            // Handle paste (Ctrl+V or Cmd+V)
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                const clipboardData = localStorage.getItem('shapesClipboard');
                if (clipboardData) {
                    const newShapes: Shape[] = JSON.parse(clipboardData);
                    saveState();
                    setShapes(prevShapes => [...prevShapes, ...newShapes]);
                    
                    setSelectedIds(newShapes.map(shape => shape.id));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, shapes, history]); // Add dependencies

    // Initialize stage dimensions on resize
    useEffect(() => {
        const handleResize = () => {
            const { width, height } = calculateStageDimensions();
            setStageWidth(width);
            setStageHeight(height);
        }
        saveState();
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);

        
    }, []);


    useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) {
      return;
    }

    // Filter out the empty string ID and get valid nodes
    const validNodes = selectedIds
      .filter(id => id !== "")
      .map(id => rectRefs.current[id] as Node)
      
    
    
    // Set the nodes or clear the transformer
    if (validNodes.length > 0) {
      transformer.nodes(validNodes);
      transformer.getLayer()?.batchDraw();
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }

    if(selectedIds.length === 0) {
        setSideBar(false);
    }
    else {
        setSideBar(true);
        setShowBackgroundSelector(false);
        setShowSymbolSelector(false);
    };

  }, [selectedIds]);

  // Separate effect for color updates

    const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
        const draggedNode = e.target as Konva.Rect;
        const draggedRectId = draggedNode.id(); // Get the ID of the dragged node

        // Clear existing guides
        setGuides([]);

        // Find possible snapping lines from other objects and stage boundaries
        const lineGuideStops = getLineGuideStops([draggedRectId], shapes, rectRefs, stageWidth, stageHeight);
        // Find snapping points of the current object
        const itemBounds = getObjectSnappingEdges(draggedNode);

        // Now find where can we snap current object
        const newGuides = getGuides(lineGuideStops, itemBounds);

        // If snapping is possible, force object position
        if (newGuides.length) {
            const absPos = { ...draggedNode.absolutePosition() }; // Copy to avoid direct mutation
            newGuides.forEach((lg) => {
                switch (lg.orientation) {
                    case 'V':
                        absPos.x = lg.lineGuide + lg.offset;
                        break;
                    case 'H':
                        absPos.y = lg.lineGuide + lg.offset;
                        break;
                }
            });
            draggedNode.absolutePosition(absPos); // Update Konva node directly for immediate visual feedback
        }
        // Update the state for the dragged rectangle's position
        setShapes((prevRects) =>
            prevRects.map((rect) =>
                rect.id === draggedRectId
                    ? { ...rect, x: draggedNode.x(), y: draggedNode.y() }
                    : rect
            )
        );
        // Update the guides state to render them
        setGuides(newGuides);
    };

    const handleDragEnd = (e:KonvaEventObject<DragEvent, Node<NodeConfig>>) => {
        // Clear all guide lines after drag ends
        setGuides([]);
        // Ensure the final position is updated in state
        const draggedNode = e.target;
        if(!draggedNode) return
        const draggedRectId = draggedNode.id();
        
        setShapes((prevRects) =>
            prevRects.map((rect) =>
                rect.id === draggedRectId
                    ? { ...rect, x: draggedNode.x(), y: draggedNode.y() }
                    : rect
                )
        );
        
    };

    const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    // Find which rectangle(s) were transformed
    const node = e.target as Konva.Rect;
    
    saveState();
    setShapes(prevRects => {
      const newRects = [...prevRects];
      const index = newRects.findIndex(r => r.id === e.target.id());
        console.log(index);
      if (index !== -1) {
        // Get the current scale values
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        const isPath = node instanceof Konva.Path;

        console.log(isPath);
        
        // Calculate the new dimensions
        const newWidth = isPath? 300 * scaleX: Math.max(5, node.width() * scaleX);
        const newHeight = isPath? 300 * scaleY: Math.max(5, node.height() * scaleY);


        
        // Reset scale to 1 since we're applying it to width/height
        node.scaleX(1);
        node.scaleY(1);
        
        // Update the state with new values
        newRects[index] = {
          ...newRects[index],
          x: node.x(),
          y: node.y(),
          width: newWidth,
          height: newHeight,
          rotation: node.rotation(),
        };
      }
      
      return newRects;
    });
  };

    const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
        // Do nothing if we mousedown on any shape

        if (e.target !== e.target.getStage()) {
        return;
        }
        
        // Start selection rectangle
        isSelecting.current = true;
        const pos = e.target.getStage().getPointerPosition();
        if(!pos) return
        setSelectionRectangle({
        visible: true,
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
        });
    };

    const handleMouseUp = () => {
        // Do nothing if we didn't start selection
        if (!isSelecting.current) {
        return;
        }
        isSelecting.current = false;
        console.log(Math.abs(selectionRectangle.x1 - selectionRectangle.x2), Math.abs(selectionRectangle.y1 - selectionRectangle.y2))
        if(Math.abs(selectionRectangle.x1 - selectionRectangle.x2) * Math.abs(selectionRectangle.y1 - selectionRectangle.y2) < 200) {
            setSelectedIds([]);
            setGuides([]);
            setTimeout(() => {
            setSelectionRectangle({
                ...selectionRectangle,
                visible: false,
            });
            });
            return
        }
        
        setTimeout(() => {
        setSelectionRectangle({
            ...selectionRectangle,
            visible: false,
        });
        });
        // Update visibility in timeout, so we can check it in click event
        if(tool === "rectangle"){
            spawnRectangle(selectionRectangle.x1, selectionRectangle.x2, selectionRectangle.y1, selectionRectangle.y2);
            return
        }
        if(tool === "circle"){
            spawnCircle(selectionRectangle.x1, selectionRectangle.x2, selectionRectangle.y1, selectionRectangle.y2);
            return
        }
        if(tool === "polygon"){
            spawnPolygon(selectionRectangle.x1, selectionRectangle.x2, selectionRectangle.y1, selectionRectangle.y2);
            return
        }
        if(tool === "text"){
            spawnText(selectionRectangle.x1, selectionRectangle.x2, selectionRectangle.y1, selectionRectangle.y2);
            return
        }
        

        const selBox = {
            x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
            y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
            width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
            height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
        };

        const selected = shapes.filter(rect => {
        // Check if rectangle intersects with selection box
        return Konva.Util.haveIntersection(selBox, getClientRect(rect));
        });

        if(selected.length === 0) setSelectedIds([]);
        else{setSelectedIds(selected.map(rect => rect.id));}
        
    };
    const handleMouseMove = (e:Konva.KonvaEventObject<MouseEvent>) => {
        // Do nothing if we didn't start selection
        if (!isSelecting.current||e.target.getStage() === null) return;
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;
        let x2 = pos.x;
        let y2 = pos.y;
        if(e.evt.shiftKey){
            const width = x2 - selectionRectangle.x1;
            const height = y2 - selectionRectangle.y1;
            const size = Math.max(Math.abs(width), Math.abs(height));
            
            // Maintain the direction of the drag while making it square
            x2 = selectionRectangle.x1 + (size * Math.sign(width));
            y2 = selectionRectangle.y1 + (size * Math.sign(height));
        }
        
        
        setSelectionRectangle({
        ...selectionRectangle,
        x2: x2,
        y2: y2,
        });
    };


    const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
        setSelectedIds([]);
    }
    };

    const handleShapeClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const clickedNode = e.target;
        const clickedId: string = clickedNode.id();
        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = selectedIds.includes(clickedId);


        // Check if the clicked shape is a background shape
        const clickedShape = shapes.find(shape => shape.id === clickedId);
        if (clickedShape?.name.startsWith('Background')) {
            // If it's a background shape, don't select it
            return;
        }


        if (!metaPressed && !isSelected) {
        // If no key pressed and the node is not selected
        // select just one
        setSelectedIds([clickedId]);
        } else if (metaPressed && isSelected) {
        // If we pressed keys and node was selected
        // we need to remove it from selection
        setSelectedIds(selectedIds.filter(id => id !== clickedId));
        } else if (metaPressed && !isSelected) {
        // Add the node into selection
        setSelectedIds([...selectedIds, clickedId]);
        }
    }

    const handleColorChange = (color: ColorResult) => {
        saveState();
        
        
        if (selectedStop >= 0) {
            // Update color stop in gradient
            const temp = {...gradient};
            temp.colorStops = [...temp.colorStops];
            temp.colorStops[selectedStop + 1] = color.hex;  // +1 because colors are at odd indices

            
            setGradient(temp);
            setShapes((prevRects) =>
                prevRects.map((rect) =>
                    selectedIds.includes(rect.id)
                        ? { 
                            ...rect, 
                            gradient: {...temp},
                            fillType: rect.fillType // Preserve the existing fillType
                          }
                        : rect
                )
            );
        } else {
            // Update fill color as before
            setShapes((prevRects) =>
                prevRects.map((rect) =>
                    selectedIds.includes(rect.id)
                        ? { 
                            ...rect, 
                            fill: color.hex,
                            fillType: rect.fillType // Preserve the existing fillType
                          }
                        : rect
                )
            );
        }
    }


    const renderShape = (shape: Shape) => {

        const gradient = gradientProps(shape);

        
        const props = {
            id: shape.id,
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            radiusX: Math.abs(shape.width/2),
            radiusY: Math.abs(shape.height/2),
            rotation:shape.rotation,
            draggable : true,
            sides: shape.sides,
            value: shape.value,
            cornerRadius: shape.corners,
            font: shape.font,
            fontSize: shape.size,
            data: shape.path,
            align: shape.align,
            strokeEnabled: true,
            strokeWidth: shape.strokeWidth,
            stroke: shape.strokeColor,
            ...gradient,
            onClick:handleShapeClick,
            onDragMove:handleDragMove,
            onDragStart: saveState,
            onDragEnd:handleDragEnd,
            onTransformEnd:(e: any) =>handleTransformEnd(e),
            ref:(node: any) => {
                if (node) {
                    rectRefs.current[shape.id] = node;
                }
            }
        }
        if(shape.type === "rectangle"){
            return <Rect key={shape.id} {...props}/>
        }
        if(shape.type === "regular"){
            return <RegPolygon key={shape.id} {...props}/>
        }
        if(shape.type === "circle"){
            return <Ellipse key={shape.id} {...props}/>
        }
        if(shape.type === "text"){
            return <EditableText key={shape.id} {...props} reference={rectRefs.current[shape.id]}/>
        }
        console.log(shape.width)
        if(shape.type === "svg"){
            return <Path scaleX={shape.width/ 300} scaleY={shape.height/300} {...props}/>
        }

    }

    const spawnRectangle = (x1:number,x2:number,y1:number,y2:number) => {
        const temp = shapes.slice();
        saveState();
        temp.push({
            id: `rect-${temp.length}`, // Unique ID for each rectangle
            x: x1,
            y: y1,
            width: x2 - x1,
            height: y2 - y1,
            fill: Konva.Util.getRandomColor(),
            rotation: 0,
            type: "rectangle",
            name: getNextItemName("rectangle"),
            fillType: "linear",
            gradient: { ...gradient }
        })
        console.log(temp)
        setShapes(temp);
        
    }
    const spawnPolygon = (x1:number,x2:number,y1:number,y2:number) => {
        const temp = shapes.slice();
        temp.push({
            id: `rect-${temp.length}`, // Unique ID for each rectangle
            x: x1,
            y: y1,
            width: x2 - x1,
            height: y2 - y1,
            fill: Konva.Util.getRandomColor(),
            rotation: 0,
            sides: sides > 3? sides: 3,
            type: "regular",
            name: getNextItemName("regular"),
            fillType: "solid"
        })
        saveState();
        setShapes(temp);
        
    }
    const spawnCircle = (x1:number,x2:number,y1:number,y2:number) => {
        const temp = shapes.slice();
        temp.push({
            id: `rect-${temp.length}`, // Unique ID for each rectangle
            x: x1 + (x2 - x1)/2,
            y: y1 + (y2 - y1)/2,
            width: x2 - x1,
            height: y2 - y1,
            fill: Konva.Util.getRandomColor(),
            rotation: 0,
            type: "circle",
            name: getNextItemName("circle"),
            fillType: "solid"
        })
        saveState();
        setShapes(temp);
        
    }
    const spawnText = (x1:number,x2:number,y1:number,y2:number) => {
        const temp = shapes.slice();
        temp.push({
            id: `text-${temp.length}`, // Unique ID for each rectangle
            x: x1 + (x2 - x1)/2,
            y: y1 + (y2 - y1)/2,
            width: x2 - x1,
            height: y2 - y1,
            fill: Konva.Util.getRandomColor(),
            rotation: 0,
            type: "text",
            name: "Text",
            fillType: "solid",
            value: "Text",
            font: "Arial",
            size: 20,

        })
        saveState();
        console.log(temp);
        setShapes(temp);
        
    }
    const spawnSvg = (path: string) => {
        setShowSymbolSelector(false);
        const temp = shapes.slice();
        const x1 = 100, x2 = 200, y1 = 100, y2 = 200
        temp.push({
            id: `symbol-${temp.length}`, // Unique ID for each rectangle
            x: x1 + (x2 - x1)/2,
            y: y1 + (y2 - y1)/2,
            width: x2 - x1,
            height: y2 - y1,
            fill: 'black',
            rotation: 0,
            type: "svg",
            name: "symbol",
            fillType: "solid",
            path: path

        })
        saveState();
        console.log(temp);
        setShapes(temp);
        
    }


    const getIndex = (item: string) => {
        return shapes.findIndex(x => x.id === item)
    }

    const moveUp = () => {saveState(); setShapes(bringUpByOne(shapes, selectedIds.map(getIndex))); }
    const moveDown = () => {saveState();setShapes(bringDownByOne(shapes, selectedIds.map(getIndex))); }
    const moveTop = () => {saveState(); setShapes(bringToTheTop(shapes, selectedIds.map(getIndex))); }
    const moveBottom = () =>{saveState();setShapes(bringToTheBottom(shapes, selectedIds.map(getIndex))); }

    const getNextItemName = (type: string) => {
        let circles = 1;
        let rectangles = 1;
        let polygons = 1;
        for(let i of shapes){
            if(i.type === "circle") circles++
            if(i.type === "rectangle") rectangles++;
            if(i.type === "regular") polygons++;
        }
        if(type === "circle") return "Circle "+ circles
        if(type === "rectangle") return "Rectangle "+ rectangles
        if(type === "regular") return "Polygon "+ polygons

        return "Rectangle "+ rectangles
    }

    const saveState = () => {
        history.current.push({shapes: shapes, background: null});
    }
    const popFromHistory = () => {
        redoStack.current.push({shapes: shapes, background: null});
        const popped = history.current.pop();
        
        return popped
    }

    const resizeSnap = (_oldPos: { x: number; y: number }, newPos: { x: number; y: number }) => {
        // If no shapes are selected, return the original position
        if (selectedIds.length === 0) return newPos;

        const draggedRectId = selectedIds[0];
        const draggedNode = rectRefs.current[draggedRectId];
        if (!draggedNode) return newPos;

        // Calculate snap threshold
        const SNAP_THRESHOLD = 5;

        // Clear existing guides
        setGuides([]);

        // Get all possible snap points from other shapes
        const snapPoints: Array<{ x?: number, y?: number }> = [];
        shapes.forEach(shape => {
            if (shape.id !== draggedRectId) {
                // Add edge points
                snapPoints.push(
                    { x: shape.x }, // Left
                    { x: shape.x + shape.width }, // Right
                    { x: shape.x + shape.width / 2 }, // Center X
                    { y: shape.y }, // Top
                    { y: shape.y + shape.height }, // Bottom
                    { y: shape.y + shape.height / 2 } // Center Y
                );
            }
        });

        // Add stage boundaries and center lines
        snapPoints.push(
            { x: 0 }, { x: stageWidth }, { x: stageWidth / 2 },
            { y: 0 }, { y: stageHeight }, { y: stageHeight / 2 }
        );

        let snappedPos = { ...newPos };
        let closestSnapX = Infinity;
        let closestSnapY = Infinity;
        let activeGuides: Guide[] = [];

        // Find closest snap points
        snapPoints.forEach(point => {
            if (point.x !== undefined) {
                const diff = Math.abs(newPos.x - point.x);
                if (diff < SNAP_THRESHOLD && diff < closestSnapX) {
                    closestSnapX = diff;
                    snappedPos.x = point.x;
                    activeGuides.push({
                        lineGuide: point.x,
                        offset: 0,
                        orientation: 'V',
                        snap: 'edge'
                    });
                }
            }
            if (point.y !== undefined) {
                const diff = Math.abs(newPos.y - point.y);
                if (diff < SNAP_THRESHOLD && diff < closestSnapY) {
                    closestSnapY = diff;
                    snappedPos.y = point.y;
                    activeGuides.push({
                        lineGuide: point.y,
                        offset: 0,
                        orientation: 'H',
                        snap: 'edge'
                    });
                }
            }
        });

        // Update guides visualization only if we have active snap points
        if (activeGuides.length > 0) {
            setGuides(activeGuides);
        }

        return snappedPos;

    }

    const handleCornersChange = (value: number) =>{
        

        const temp = shapes.map(x => {
            if(selectedIds.includes(x.id)){
                return {...x, corners: value}
            }
            else return x
        });
        saveState();
        setShapes(temp);
    }

    const handleSidesChange = (value: number) => {

        setSides(value)
        const temp = shapes.map(x => {
            if(selectedIds.includes(x.id)){
                return {...x, sides: value}
            }
            else return x
        });
        saveState();
        setShapes(temp);
    }

    const startPointMove = (e: KonvaEventObject<DragEvent>) => {
        // Get the currently selected shape
        const selectedShape = shapes.find(x => selectedIds.includes(x.id));
        if (!selectedShape) return;

        // Calculate relative position within the shape
        const relativeX = (e.target.x() - selectedShape.x);
        const relativeY = (e.target.y() - selectedShape.y);


        const temp = {
            ...gradient,
            start: {
                x: relativeX,
                y: relativeY
            }
        };
        
        setShapes(shapes.map(x => {
            if(selectedIds.includes(x.id)) {
                return {...x, gradient: {...temp}, fillType: "linear"}
            }
            return x
        }));
        setGradient(temp);
        saveState();
    }

    const endPointMove = (e: KonvaEventObject<DragEvent>) => {
        // Get the currently selected shape
        const selectedShape = shapes.find(x => selectedIds.includes(x.id));
        if (!selectedShape) return;

        // Calculate relative position within the shape
        const relativeX = (e.target.x() - selectedShape.x);
        const relativeY = (e.target.y() - selectedShape.y);

        const temp = {
            ...gradient,
            end: {
                x: relativeX,
                y: relativeY
            }
        };
        
        setShapes(shapes.map(x => {
            if(selectedIds.includes(x.id)) {
                return {...x, gradient: {...temp}, fillType: "linear"}
            }
            return x
        }));
        setGradient(temp);
        saveState();
    }

    const handleGradientClick = (e:KonvaEventObject<MouseEvent>) => {
        const selectedShape = shapes.find(x => x.id === selectedIds[0]);
        if (!selectedShape) return;
        
        // Get click position relative to stage
        const stage = e.target.getStage();
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;

        // Calculate relative position from shape origin
        const relativeX = pos.x - selectedShape.x;
        const relativeY = pos.y - selectedShape.y;

        // Calculate gradient vector
        const gradientVector = {
            x: gradient.end.x - gradient.start.x,
            y: gradient.end.y - gradient.start.y
        };
        
        // Calculate projection onto gradient line
        const startX = gradient.start.x;
        const startY = gradient.start.y;
        const gradientLength = Math.sqrt(
            gradientVector.x * gradientVector.x + 
            gradientVector.y * gradientVector.y
        );
        
        // Calculate position along gradient line (0 to 1)
        const t = (
            (relativeX - startX) * gradientVector.x + 
            (relativeY - startY) * gradientVector.y
        ) / (gradientLength * gradientLength);
        
        // Clamp t between 0 and 1
        const position = Math.max(0, Math.min(1, t));

        // Add new color stop
        const temp = {...gradient};
        temp.colorStops = [...temp.colorStops];
        // Insert new stop at the calculated position
        temp.colorStops.splice(temp.colorStops.length - 2, 0, position, '#ffffff');
        
        setShapes(shapes.map(x => {
            if(selectedIds.includes(x.id)) {
                return {...x, gradient: temp, fillType: "linear"}
            }
            return x
        }));
        setSelectedStop(temp.colorStops.length - 4);
        setGradient(temp);
        saveState();
    }

    const renderColorStop = (stop: number | string, i: number) => {
        if (i % 2 === 0 && i > 0 && i < gradient.colorStops.length - 2) {
            const position = stop as number;
            const color = gradient.colorStops[i + 1] as string;
            
            // Get the gradient line vector
            const gradientVector = {
                x: gradient.end.x - gradient.start.x,
                y: gradient.end.y - gradient.start.y
            };
            
            // Calculate position along the gradient line
            const x = shapes.find(x => x.id === selectedIds[0])!.x + 
                gradient.start.x + gradientVector.x * position;
            const y = shapes.find(x => x.id === selectedIds[0])!.y + 
                gradient.start.y + gradientVector.y * position;
            
            const isSelected = selectedStop === i;
            return (
                <Circle
                    key={i}
                    radius={4}
                    x={x}
                    y={y}
                    fill={color}
                    stroke={isSelected? "#ffffffff": "#676f70"}
                    strokeWidth={isSelected? 2: 1}
                    draggable
                    onRig
                    onDragMove={(e) => {
                        const selectedShape = shapes.find(x => x.id === selectedIds[0]);
                        if (!selectedShape) return;

                        // Get current pointer position relative to shape
                        const relativeX = e.target.x() - selectedShape.x;
                        const relativeY = e.target.y() - selectedShape.y;
                        
                        // Calculate projection onto gradient line
                        const startX = gradient.start.x;
                        const startY = gradient.start.y;
                        const gradientLength = Math.sqrt(
                            gradientVector.x * gradientVector.x + 
                            gradientVector.y * gradientVector.y
                        );
                        
                        // Calculate position along gradient line (0 to 1)
                        const t = (
                            (relativeX - startX) * gradientVector.x + 
                            (relativeY - startY) * gradientVector.y
                        ) / (gradientLength * gradientLength);
                        
                        const position = Math.max(0, Math.min(1, t));

                        // Update color stop position
                        const temp = {...gradient};
                        temp.colorStops = [...temp.colorStops];
                        temp.colorStops[i] = position;

                        setShapes(shapes.map(x => {
                            if(selectedIds.includes(x.id)) {
                                return {...x, gradient: temp, fillType: "linear"}
                            }
                            return x
                        }));
                        setGradient(temp);
                    }}
                    onClick={() => {
                        setSelectedStop(i);
                    }}
                />
            );
        }
        return null;
    }

    const handleFillTypeChange = (type: "linear"|"solid"|"radial")=>{
        setShapes(shapes.map(x => {
            if(selectedIds.includes(x.id)) {
                return {...x, gradient: x.gradient || gradient, fillType: type}
            }
            return x
        }));
    }

    const handleBackgroundSelect = (backgroundShapes: Shape[]) => {
        saveState();
        setBackground(backgroundShapes);
        setShowBackgroundSelector(false);
    }
    const renderBackground = (shape: Shape) => {
        const gradient = gradientProps(shape);
        
        const props = {
            id: shape.id,
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            radiusX: Math.abs(shape.width/2),
            radiusY: Math.abs(shape.height/2),
            rotation:shape.rotation,
            sides: shape.sides,
            cornerRadius: shape.corners,
            onClick: handleShapeClick,
            ...gradient,
        }
        if(shape.type === "rectangle"){
            return <Rect key={shape.id} {...props}/>
        }
        if(shape.type === "regular"){
            return <RegPolygon key={shape.id} {...props}/>
        }
        if(shape.type === "circle"){
            return <Ellipse key={shape.id} {...props}/>
        }
    };

    const handleValueChange = (text: string)=>{
        setShapes(shapes.map((x) => {
            return selectedIds.includes(x.id) ? {...x, value:text, name: text}: x
        }))
        
    } 

    const handleFontChange = (font: string) => {
        setShapes(shapes.map((x) => {
            return selectedIds.includes(x.id) ? {...x, font}: x
        }))
    }
    
    const handleFontSizeChange = (size: number) => {
        setShapes(shapes.map((x) => {
            return selectedIds.includes(x.id) ? {...x, size}: x
        }))
    }

    const handleXChange = (x: number) => {
        setShapes(shapes.map((t) => {
            return selectedIds.includes(t.id) ? {...t, x}: t
        }))
    }
    const handleYChange = (y: number) => {
        setShapes(shapes.map((t) => {
            return selectedIds.includes(t.id) ? {...t, y}: t
        }))
    }
    const handleWidthChange = (width: number) => {
        setShapes(shapes.map((t) => {
            return selectedIds.includes(t.id) ? {...t, width}: t
        }))
    }
    const handleHeightChange = (height: number) => {
        setShapes(shapes.map((t) => {
            return selectedIds.includes(t.id) ? {...t, height}: t
        }))
    }

    const setAlign = (align: string) => {
        setShapes(shapes.map((t) => {
            return selectedIds.includes(t.id) ? {...t, align}: t
        }))
    }
    const setStrokeColor =(color: ColorResult) => {
        setShapes(shapes.map(x => {
            return selectedIds.includes(x.id) ? {...x, strokeColor: color.hex}: x
        }))
    }
    const setStrokeWidth = (width: number) => {
        setShapes(shapes.map(x => {
            return selectedIds.includes(x.id) ? {...x, strokeWidth: width}: x;
        }))
    }

  return (
    <>
    <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }}>
        <Stage 
            width={stageWidth} 
            height={stageHeight} 
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={checkDeselect}
            style={{
                backgroundColor: 'white',
            }}>
        <Layer listening={false}>
            {background.map(renderBackground)}
        </Layer>
        <Layer>
            {shapes.map(renderShape)}
            
            {guides.map((lg, i) => (
                <Line
                    key={i}
                    points={lg.orientation === 'H' ? [-6000, 0, 6000, 0] : [0, -6000, 0, 6000]}
                    stroke="rgb(0, 161, 255)"
                    strokeWidth={1}
                    dash={[4, 6]}
                    x={lg.orientation === 'V' ? lg.lineGuide : 0}
                    y={lg.orientation === 'H' ? lg.lineGuide : 0}
                />
            ))}
        
        <Transformer
            ref={transformerRef}
            rotationSnaps={[0,45, 90, 135, 180, 225, 270, 315]}
            rotationSnapTolerance={5}
            anchorDragBoundFunc={resizeSnap}
            
            />
        {selectionRectangle.visible && (
            <>
                {/* Selection rectangle */}
                <Rect
                    x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
                    y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
                    width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
                    height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
                    stroke="#666"
                    strokeWidth={1}
                    dash={[4, 4]}
                />
                {/* Shape preview */}
                {tool === "rectangle" && (
                    <Rect
                        x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
                        y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
                        width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
                        height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
                        fill="rgba(0,0,255,0.2)"
                    />
                )}
                {tool === "circle" && (
                    <Ellipse
                        x={selectionRectangle.x1 + (selectionRectangle.x2 - selectionRectangle.x1)/2}
                        y={selectionRectangle.y1 + (selectionRectangle.y2 - selectionRectangle.y1)/2}
                        radiusX={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)/2}
                        radiusY={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)/2}
                        fill="rgba(0,0,255,0.2)"
                    />
                )}
                {tool === "polygon" && (
                    <RegPolygon
                        x={selectionRectangle.x1}
                        y={selectionRectangle.y1}
                        width={selectionRectangle.x2 - selectionRectangle.x1}
                        height={selectionRectangle.y2 - selectionRectangle.y1}
                        fill="rgba(0,0,255,0.2)"
                    />
                )}
            </>
            )}
        {/*Gradient Controls */}
        {selectedIds.length === 1 && shapes.find(x => x.id === selectedIds[0])?.fillType === "linear" && (
            <>
                <Line
                    points={[
                        shapes.find(x => x.id === selectedIds[0])!.x + gradient.start.x,
                        shapes.find(x => x.id === selectedIds[0])!.y + gradient.start.y,
                        shapes.find(x => x.id === selectedIds[0])!.x + gradient.end.x,
                        shapes.find(x => x.id === selectedIds[0])!.y + gradient.end.y
                    ]}
                    stroke="#999"
                    strokeWidth={4}
                    onClick={handleGradientClick}
                />
                <Circle
                    radius={6}
                    onDragMove={startPointMove}
                    x={shapes.find(x => x.id === selectedIds[0])!.x + gradient.start.x}
                    y={shapes.find(x => x.id === selectedIds[0])!.y + gradient.start.y}
                    fill={gradient.colorStops[1]}
                    draggable
                    stroke={selectedStop === 0? "#ffffffff": "#676f70"}
                    onClick={() => setSelectedStop(0)}
                />
                <Circle
                    radius={6}
                    onDragMove={endPointMove}
                    x={shapes.find(x => x.id === selectedIds[0])!.x + gradient.end.x}
                    y={shapes.find(x => x.id === selectedIds[0])!.y + gradient.end.y}
                    fill={gradient.colorStops.at(-1)}
                    draggable
                    stroke={selectedStop === (gradient.colorStops.length - 2)? "#ffffffff": "#676f70"}
                    onClick={() => setSelectedStop(gradient.colorStops.length - 2)}
                />
                {/* Color stop points */}
                {gradient.colorStops.map(renderColorStop)}
            </>
        )}
        </Layer>
    </Stage>
    </div>
    
    <ToolBar 
        polygon={() => setTool("polygon")} 
        selection={() => setTool("none")} 
        circle={() => setTool("circle")} 
        text={() => setTool("text")}
        rectangle={() => setTool("rectangle")}
        symbol={() => {setShowSymbolSelector(true); setShowBackgroundSelector(false); setSelectedIds([])}}
        background={() => {setShowSymbolSelector(false); setShowBackgroundSelector(true); setSelectedIds([])}}
    />
    <ObjectList selected={selectedIds} setSelected={setSelectedIds} shapes={shapes} setShapes={setShapes}/>
    <SideBar 
        showSideBar={showSideBar}
        selectedIds={selectedIds} 
        setSelectedIds={setSelectedIds} 
        shape={shapes.find(x => x.id === selectedIds[0])}

        setColor={handleColorChange}
        setSides={handleSidesChange}
        setCorners={handleCornersChange}
        handleFillTypeChange={handleFillTypeChange}
        setValue={handleValueChange}
        setFont={handleFontChange}
        setSize={handleFontSizeChange}
        setAlign={setAlign}
        setStrokeColor={setStrokeColor}
        setStrokeWidth={setStrokeWidth}

        setX={handleXChange}
        setY={handleYChange}
        setWidth={handleWidthChange}
        setHeight={handleHeightChange}

        moveUp={moveUp} 
        moveDown={moveDown} 
        moveTop={moveTop} 
        moveBottom={moveBottom} 
        
    />
    {showBackgroundSelector && (
        <BackgroundSelector 
            onSelectBackground={handleBackgroundSelect}
            stageWidth={stageWidth}
            stageHeight={stageHeight}
            bgColors={bgColors}
            setBgColors={setBgColors}
        />
    )}
    {showSymbolSelector && (
        <SymbolSelector
            spawnSvg={spawnSvg}
        />
    )}
    
    </>
  )
}

export default Editor
