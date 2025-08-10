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
const createBackgrounds = (stageWidth: number, stageHeight: number, colors: string[]): Background[] => [
    createBackground('Solid', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1, // Use 1 for full width
            height: 1, // Use 1 for full height
            fill: colors[0],
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
            fill: colors[0],
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
            fill: colors[1],
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
            fill: colors[0],
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
            fill: colors[1],
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
            fill: colors[1],
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
            fill: colors[0],
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
            fill: colors[2],
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
            fill: colors[1],
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
            fill: colors[0],
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
            fill: colors[2],
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
            fill: colors[0],
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
            fill: colors[1],
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
            fill: colors[1],
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
            fill: colors[0],
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
            fill: colors[1],
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
            fill: colors[1],
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
            fill: colors[0],
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
            fill: colors[1],
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
            fill: colors[0],
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
            fill: colors[1],
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
            fill: colors[2],
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
            fill: colors[0],
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
            fill: colors[1],
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
            fill: colors[1],
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
            fill: colors[0],
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
            fill: colors[1],
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
            fill: colors[0],
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
            fill: colors[1],
            rotation: 328,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
    ], stageWidth, stageHeight),
    createBackground('1', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1, // One third of the height
            fill: colors[0],
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
            fill: colors[2],
            rotation: 32,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 1,
            width: 2,
            height: 2,
            fill: colors[1],
            rotation: 328,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        
    ], stageWidth, stageHeight),
    createBackground('2', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1, // One third of the height
            fill: colors[0],
            rotation: 0,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0.333,
            width: 1,
            height: 0.333,
            fill: colors[1],
            rotation: 0,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0.303,
            width: 1,
            height: 0.030,
            fill: colors[2],
            rotation: 0,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0.666,
            width: 1,
            height: 0.030,
            fill: colors[2],
            rotation: 0,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        
        
    ], stageWidth, stageHeight),
    createBackground('3', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1, // One third of the height
            fill: colors[0],
            rotation: 0,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0.333,
            y: 0.333,
            width: 1,
            height: 0.333,
            fill: colors[1],
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
            fill: colors[2],
            rotation: 45,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0,
        },
        {
            type: 'rectangle',
            x: 0,
            y: -0.1,
            width: 0.6,
            height: 0.3,
            fill: colors[1],
            rotation: 32,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: -0.1,
            y: 0.85,
            width: 0.6,
            height: 0.3,
            fill: colors[1],
            rotation: 328,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        
        
        
        
    ], stageWidth, stageHeight),
    createBackground('4', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1, // One third of the height
            fill: colors[0],
            rotation: 0,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0.333,
            width: 1,
            height: 0.333,
            fill: colors[1],
            rotation: 0,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0.303,
            width: 1,
            height: 0.030,
            fill: colors[2],
            rotation: 0,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0,
            y: 0.666,
            width: 1,
            height: 0.030,
            fill: colors[2],
            rotation: 0,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0.400,
            y: 0,
            width: 0.2,
            height: 1,
            fill: colors[2],
            rotation: 0,
            name: 'Background-Horizontal Bar',
            fillType: 'solid',
            corners: 0
        },
        
        
    ], stageWidth, stageHeight),
    createBackground('5', [
        {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1,
            height: 1, // One third of the height
            fill: colors[0],
            rotation: 0,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 0.34,
            y: -0.5,
            width: 2,
            height: 3, // One third of the height
            fill: colors[1],
            rotation: 20,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 1,
            y: -0.32,
            width: 2,
            height: 3, // One third of the height
            fill: colors[2],
            rotation: 50,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 1,
            y: 0.25,
            width: 2,
            height: 3, // One third of the height
            fill: colors[3],
            rotation: 64,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        {
            type: 'rectangle',
            x: 1,
            y: 0.6,
            width: 2,
            height: 3, // One third of the height
            fill: colors[0],
            rotation: 75,
            name: 'Background-Background',
            fillType: 'solid',
            corners: 0
        },
        
        
        
    ], stageWidth, stageHeight),

    // Add more background templates as needed
];

export {createBackground, createBackgrounds}
