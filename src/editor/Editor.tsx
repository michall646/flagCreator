import { Stage, Layer, Line, Rect, Transformer, Circle, Ellipse } from 'react-konva';
import { useState, useEffect, useRef } from 'react';
import Konva from 'konva';
import type { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';
import { Colorful, type ColorResult } from '@uiw/react-color';
import RegPolygon from './RegPolygon';
import { bringDownByOne, bringToTheBottom, bringToTheTop, bringUpByOne } from '../scripts/layers';
import ObjectList from './ObjectList';
import ToolBar from './ToolBar';
import SideBar from './SideBar';
import type { Shape } from './ShapeType';

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


    const [stageWidth, setStageWidth] = useState(window.innerWidth);
    const [stageHeight, setStageHeight] = useState(window.innerHeight);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [guides, setGuides] = useState<Guide[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [color, setColor] = useState<string>("#ffffff");
    const [tool, setTool] = useState<"none"| "rectangle" | "circle" | "polygon">("rectangle");
    const history = useRef<canvasState[]>([]);
    const redoStack =  useRef<canvasState[]>([]);
    const [selectionRectangle, setSelectionRectangle] = useState<selectionRec>({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    });
    const [corners,setCorners] = useState<number>(0);

    const rectRefs = useRef<Record<string, Konva.Rect | null>>({});
    const transformerRef = useRef<Konva.Transformer | null>(null);
    const isSelecting = useRef<boolean>(false);

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' && selectedIds.length > 0) {
                saveState();
                setShapes(prevShapes => prevShapes.filter(shape => !selectedIds.includes(shape.id)));
                setSelectedIds([]);
            }

            if((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z' && history.current.length > 0){
                const popped = popFromHistory();
                console.log(popped, history)
                if (popped) {
                    setShapes(popped.shapes);
                }
            }
            if((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z'){
                
                const redo = redoStack.current.pop();
                console.log(redo)
                
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
                    const newShapes = JSON.parse(clipboardData);
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
            setStageWidth(window.innerWidth);
            setStageHeight(window.innerHeight);
        };
        const initialRects = [];
        for (let i = 0; i < 5; i++) {
            initialRects.push({
                id: `rect-${i}`, // Unique ID for each rectangle
                x: Math.random() * stageWidth,
                y: Math.random() * stageHeight,
                width: 50 + Math.random() * 50,
                height: 50 + Math.random() * 50,
                fill: Konva.Util.getRandomColor(),
                rotation: Math.random() * 360,
                type: "rectangle",
                name: "Rectangle" + (i + 1)
            });
        }
        saveState();
        setShapes(initialRects);
        
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
      .map(id => rectRefs.current[id])
      .filter((node): node is Konva.Rect => node !== null);
    
    // Set the nodes or clear the transformer
    if (validNodes.length > 0) {
      transformer.nodes(validNodes);
      transformer.getLayer()?.batchDraw();
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedIds]);

  // Separate effect for color updates
    useEffect(() => {
        if (selectedIds.length > 0) {  // Only update color if there's an actual selection
            const newColor = shapes.find(x => x.id === selectedIds[0])?.fill;
            if (newColor) setColor(newColor);
            const newCorner = shapes.find(x => x.id === selectedIds[0])?.corners;
            setCorners(newCorner || 0); 
        }
    }, [selectedIds, shapes]);

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
        
        console.log(history.current)
    };

    const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    // Find which rectangle(s) were transformed
    const node = e.target as Konva.Rect;
    const id = node.id();
    
    saveState();
    setShapes(prevRects => {
      const newRects = [...prevRects];
      const index = newRects.findIndex(r => r.id === id);
      
      if (index !== -1) {
        // Get the current scale values
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        // Calculate the new dimensions
        const newWidth = Math.max(5, newRects[index].width * scaleX);
        const newHeight = Math.max(5, newRects[index].height * scaleY);

        console.log(newWidth, newHeight)
        
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
        console.log(e.target=== e.target.getStage())
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
        if(selectionRectangle.x1 === selectionRectangle.x2||selectionRectangle.x1 === selectionRectangle.y1||selectionRectangle.x2 === selectionRectangle.y2||selectionRectangle.y1 === selectionRectangle.y2) return
        
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
        
        setSelectedIds(selected.map(rect => rect.id));
    };
    const handleMouseMove = (e:Konva.KonvaEventObject<MouseEvent>) => {
        // Do nothing if we didn't start selection
        if (!isSelecting.current) return;
        const pos = e.target.getStage().getPointerPosition();
        let x2 = pos.x;
        let y2 = pos.y
        console.log(e);
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

        console.log(isSelected, metaPressed)

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
        setColor(color.hex);
        setShapes((prevRects) =>
            prevRects.map((rect) =>
                selectedIds.includes(rect.id)
                    ? { ...rect, fill:color.hex }
                    : rect
            )
        );
    }


    const renderShape = (shape: Shape) => {
        const props = {
            id: shape.id,
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            fill: shape.fill,
            radiusX: Math.abs(shape.width/2),
            radiusY: Math.abs(shape.height/2),
            rotation:shape.rotation,
            draggable : true,
            cornerRadius: shape.corners,
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
            name: getNextItemName("rectangle")
        })
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
            type: "regular",
            name: getNextItemName("regular")
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
        })
        saveState();
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
        
        console.log(redoStack.current);
        return popped
    }

    const resizeSnap = (oldPos: { x: number; y: number }, newPos: { x: number; y: number }) => {
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
        console.log(value)
        
        setCorners(value);

        const temp = shapes.map(x => {
            if(selectedIds.includes(x.id)){
                console.log(x.id)
                return {...x, corners: value}
            }
            else return x
        });
        console.log(temp)
        saveState();
        setShapes(temp);
    }




  return (
    <>
    <Stage 
        width={window.innerWidth} 
        height={window.innerHeight} 
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={checkDeselect}>
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
      </Layer>
    </Stage>
    
    
    <ToolBar polygon={() => setTool("polygon")} circle={() => setTool("circle")} rectangle={() => setTool("rectangle")}/>
    <ObjectList selected={selectedIds} setSelected={setSelectedIds} shapes={shapes} setShapes={setShapes}/>
    <SideBar 
        selectedIds={selectedIds} 
        setSelectedIds={setSelectedIds} 
        color={color} 
        setColor={handleColorChange} 
        moveUp={moveUp} 
        moveDown={moveDown} 
        moveTop={moveTop} 
        moveBottom={moveBottom} 
        corners={corners}
        setCorners={handleCornersChange}
        />
        


    </>
  )
}

export default Editor
