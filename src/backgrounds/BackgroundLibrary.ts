import type { Shape } from '../editor/ShapeType';

export interface Background {
    id: string;
    name: string;
    shapes: Shape[];
    thumbnail?: string; // We could add thumbnails later
}

// Function to create a background shape with stage-relative dimensions
const createBackgroundShape = (shape: Omit<Shape, 'id'>, stageWidth: number, stageHeight: number): Omit<Shape, 'id'> => {
    const relativeShape = { ...shape };
    if ('width' in relativeShape) {
        relativeShape.width = (relativeShape.width as number) * stageWidth;
    }
    if ('height' in relativeShape) {
        relativeShape.height = (relativeShape.height as number) * stageHeight;
    }
    if ('x' in relativeShape) {
        relativeShape.x = (relativeShape.x as number) * stageWidth;
    }
    if ('y' in relativeShape) {
        relativeShape.y = (relativeShape.y as number) * stageHeight;
    }
    return relativeShape;
};

// Helper function to create backgrounds with proper IDs and stage-relative dimensions
const createBackground = (name: string, shapes: Omit<Shape, 'id'>[], stageWidth: number, stageHeight: number): Background => ({
    id: `bg-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    shapes: shapes.map((shape, index) => ({
        ...createBackgroundShape(shape, stageWidth, stageHeight),
        id: `bg-${name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    }))
});

// Function to create backgrounds with current stage dimensions
const createBackgrounds = (stageWidth: number, stageHeight: number): Background[] => [
    createBackground('Solid', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1, // Use 1 for full width
            height: 1, // Use 1 for full height
            fill: '#ffffff',
            rotation: 0,
            name: 'Background',
            fillType: 'solid',
            corners: 0
        }
    ], stageWidth, stageHeight),
    createBackground('TwoHorizontal', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            fill: '#ddff00ff',
            rotation: 0,
            name: 'Background Left',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0.5, // Half of the width
            y: 0,
            width: 0.5, // Half of the width
            height: 1,
            fill: '#ff0000ff',
            rotation: 0,
            name: 'Background Right',
            fillType: 'solid',
            corners: 0
        }
    ], stageWidth, stageHeight),
    createBackground('TwoHorizontal', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            fill: '#e1ff00ff',
            rotation: 0,
            name: 'Background Left',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0, // Half of the width
            y: 0.5,
            width: 1, // Half of the width
            height: 0.5,
            fill: '#ff0000ff',
            rotation: 0,
            name: 'Background Right',
            fillType: 'solid',
            corners: 0
        }
    ], stageWidth, stageHeight),
    createBackground('Tricolor', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 0.333, // One third of the height
            fill: '#ff0000',
            rotation: 0,
            name: 'Background-Top Band',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0.333,
            width: 1,
            height: 0.333,
            fill: '#ffffff',
            rotation: 0,
            name: 'Background-Middle Band',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0.666,
            width: 1,
            height: 0.333,
            fill: '#0000ff',
            rotation: 0,
            name: 'Background-Bottom Band',
            fillType: 'solid',
            corners: 0
        }
    ], stageWidth, stageHeight),
    createBackground('TriHorizontal', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 0.333,
            height: 1, // One third of the height
            fill: '#ff0000',
            rotation: 0,
            name: 'Background-Top Band',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0.333,
            y: 0,
            width: 0.333,
            height: 1,
            fill: '#fffb00ff',
            rotation: 0,
            name: 'Background-Middle Band',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0.666,
            y: 0,
            width: 0.333,
            height: 1,
            fill: '#04ff00ff',
            rotation: 0,
            name: 'Background-Bottom Band',
            fillType: 'solid',
            corners: 0
        }
    ], stageWidth, stageHeight),
    createBackground('Cross', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1, // One third of the height
            fill: '#ffe100ff',
            rotation: 0,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0.4,
            y: 0,
            width: 0.2,
            height: 1,
            fill: '#ff0000ff',
            rotation: 0,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0.35,
            width: 1,
            height: 0.3,
            fill: '#ff0000ff',
            rotation: 0,
            name: 'Background-Bottom Band',
            fillType: 'solid',
            corners: 0
        }
    ], stageWidth, stageHeight),
    createBackground('OffCross', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1, // One third of the height
            fill: '#ffe100ff',
            rotation: 0,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0.3,
            y: 0,
            width: 0.2,
            height: 1,
            fill: '#ff0000ff',
            rotation: 0,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0.35,
            width: 1,
            height: 0.3,
            fill: '#ff0000ff',
            rotation: 0,
            name: 'Background-Bottom Band',
            fillType: 'solid',
            corners: 0
        }
    ], stageWidth, stageHeight),
    createBackground('Canton', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1, // One third of the height
            fill: '#ffe100ff',
            rotation: 0,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 0.4,
            height: 0.4,
            fill: '#ff0000ff',
            rotation: 0,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
    ], stageWidth, stageHeight),
    createBackground('Cze', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1, // One third of the height
            fill: '#ffe100ff',
            rotation: 0,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0.5,
            width: 1,
            height: 0.5,
            fill: '#ff0000ff',
            rotation: 0,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 0.443,
            height: 1,
            fill: '#00ff1aff',
            rotation: 45,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
    ], stageWidth, stageHeight),
    createBackground('Sco', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1, // One third of the height
            fill: '#ffe100ff',
            rotation: 0,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: -0.1,
            width: 2,
            height: 0.2,
            fill: '#ff0000ff',
            rotation: 32,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: -0.1,
            y: 1,
            width: 2,
            height: 0.2,
            fill: '#ff0000ff',
            rotation: 328,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
    ], stageWidth, stageHeight),
    createBackground('Diagonal', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1, // One third of the height
            fill: '#ffe100ff',
            rotation: 0,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 2,
            height: 2,
            fill: '#ff0000ff',
            rotation: 32,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
    ], stageWidth, stageHeight),
    createBackground('Diagonal-Reverse', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1, // One third of the height
            fill: '#ffe100ff',
            rotation: 0,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 1,
            width: 2,
            height: 2,
            fill: '#ff0000ff',
            rotation: 328,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
    ], stageWidth, stageHeight),
    // Add more background templates as needed
];

export {createBackground, createBackgrounds}
