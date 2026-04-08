function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getTechnologyImageMetrics(image) {
  const aspectRatio = Number(image?.aspectRatio) > 0 ? Number(image.aspectRatio) : 1;
  const zoom = clamp(Number(image?.zoom) || 1, 1, 3);
  const baseWidth = aspectRatio >= 1 ? aspectRatio * 100 : 100;
  const baseHeight = aspectRatio >= 1 ? 100 : (100 / aspectRatio);
  const maxOffsetX = Math.max(0, ((baseWidth * zoom) - 100) / 2);
  const maxOffsetY = Math.max(0, ((baseHeight * zoom) - 100) / 2);
  const offsetX = maxOffsetX ? clamp(Number(image?.offsetX) || 0, -1, 1) : 0;
  const offsetY = maxOffsetY ? clamp(Number(image?.offsetY) || 0, -1, 1) : 0;

  return {
    zoom,
    baseWidth,
    baseHeight,
    maxOffsetX,
    maxOffsetY,
    left: 50 + (offsetX * maxOffsetX),
    top: 50 + (offsetY * maxOffsetY),
  };
}

export function getTechnologyImageStyles(image) {
  const { zoom, baseWidth, baseHeight, left, top } = getTechnologyImageMetrics(image);

  return {
    width: `${baseWidth * zoom}%`,
    height: `${baseHeight * zoom}%`,
    left: `${left}%`,
    top: `${top}%`,
    transform: "translate(-50%, -50%)",
  };
}
