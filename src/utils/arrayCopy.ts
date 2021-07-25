export function arrayCopy<T extends unknown>(
  sourceArray: T[],
  sourceIndex: number,
  destinationArray: T[],
  destinationIndex: number,
  length: number,
): void {
  let destination = destinationIndex;
  const finalLength = sourceIndex + length;
  for (let i = sourceIndex; i < finalLength; i++) {
    destinationArray[destination] = sourceArray[i];
    ++destination;
  }
}
