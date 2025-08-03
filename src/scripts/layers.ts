function bringDownByOne(arr : any[], indexes: number[]) {
    if (!indexes || indexes.length === 0) return [...arr];
    const indexesToMoveSet = new Set(indexes);
    const sortedIndexes = [...new Set(indexes)].sort((a, b) => a - b);
    const newArr = [...arr];
    for (const i of sortedIndexes) {
        if (i > 0 && i < newArr.length && !indexesToMoveSet.has(i - 1)) {
            const [elementToMove] = newArr.splice(i, 1);
            newArr.splice(i - 1, 0, elementToMove);
        }
    }
    return newArr;
}

function bringUpByOne(arr : any[], indexes: number[]) {
    if (!indexes || indexes.length === 0) return [...arr];
    const indexesToMoveSet = new Set(indexes);
    const sortedIndexes = [...new Set(indexes)].sort((a, b) => b - a);
    const newArr = [...arr];
    for (const i of sortedIndexes) {
        if (i >= 0 && i < newArr.length - 1 && !indexesToMoveSet.has(i + 1)) {
            const [elementToMove] = newArr.splice(i, 1);
            newArr.splice(i + 1, 0, elementToMove);
        }
    }
    return newArr;
}

function bringToTheBottom(arr : any[], indexes: number[]) {
    if (!indexes || indexes.length === 0) return [...arr];
    const sortedUniqueIndexes = [...new Set(indexes)].sort((a, b) => a - b);
    const elementsToMove = [];
    const indicesToRemoveSet = new Set();
    for (const i of sortedUniqueIndexes) {
        if (i >= 0 && i < arr.length) {
            elementsToMove.push(arr[i]);
            indicesToRemoveSet.add(i);
        }
    }
    const remainingElements = arr.filter((_, index) => !indicesToRemoveSet.has(index));
    return [...elementsToMove, ...remainingElements];
}

function bringToTheTop(arr : any[], indexes: number[]) {
    if (!indexes || indexes.length === 0) return [...arr];
    const sortedUniqueIndexes = [...new Set(indexes)].sort((a, b) => a - b);
    const elementsToMove = [];
    const indicesToRemoveSet = new Set();
    for (const i of sortedUniqueIndexes) {
        if (i >= 0 && i < arr.length) {
            elementsToMove.push(arr[i]);
            indicesToRemoveSet.add(i);
        }
    }
    const remainingElements = arr.filter((_, index) => !indicesToRemoveSet.has(index));
    return [...remainingElements, ...elementsToMove];
}

export {bringToTheBottom, bringDownByOne, bringUpByOne, bringToTheTop}