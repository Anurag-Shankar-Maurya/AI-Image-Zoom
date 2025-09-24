/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useState, useCallback, useImperativeHandle } from 'react';
import type { Rect, ImageDisplayHandle } from '../types';

interface ImageDisplayProps {
  imageSrc: string;
  onSelect: (originalRect: Rect, screenRect: Rect, canvasDataUrl: string) => void;
  isEnhancing: boolean;
  historicalSelection?: Rect | null;
  useFixedSelectionBox: boolean;
  fixedSelectionSizePercentage: number;
}

export const ImageDisplay = React.forwardRef<ImageDisplayHandle, ImageDisplayProps>(({ imageSrc, onSelect, isEnhancing, historicalSelection, useFixedSelectionBox, fixedSelectionSizePercentage }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [selection, setSelection] = useState<Rect | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [confirmedSelection, setConfirmedSelection] = useState<Rect | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();
  
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImage(img);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
  }, [imageSrc]);

  const getCanvasScale = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return { scale: 1, offsetX: 0, offsetY: 0, dWidth: 0, dHeight: 0 };
    
    const { width: canvasWidth, height: canvasHeight } = canvas.getBoundingClientRect();

    const canvasAspect = canvasWidth / canvasHeight;
    const imageAspect = image.naturalWidth / image.naturalHeight;
    
    let dWidth, dHeight, offsetX, offsetY;

    if (canvasAspect > imageAspect) {
      dHeight = canvasHeight;
      dWidth = dHeight * imageAspect;
    } else {
      dWidth = canvasWidth;
      dHeight = dWidth / imageAspect;
    }
    
    offsetX = (canvasWidth - dWidth) / 2;
    offsetY = (canvasHeight - dHeight) / 2;
    const scale = dWidth / image.naturalWidth;
    
    return { scale, offsetX, offsetY, dWidth, dHeight };
  }, [image]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !image) return;
    
    const { width: cssWidth, height: cssHeight } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    
    const { scale: baseScale, offsetX: baseOffsetX, offsetY: baseOffsetY } = getCanvasScale();
    const effectiveScale = baseScale * zoom;

    const drawX = baseOffsetX + offset.x;
    const drawY = baseOffsetY + offset.y;
    const drawWidth = image.naturalWidth * effectiveScale;
    const drawHeight = image.naturalHeight * effectiveScale;

    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

    const rectToDraw = selection || confirmedSelection;
    if (rectToDraw) {
      ctx.strokeStyle = '#39FF14';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(rectToDraw.x, rectToDraw.y, rectToDraw.w, rectToDraw.h);
      ctx.setLineDash([]);
      
      ctx.font = '10px "Fira Code", monospace';
      const info = `x:${Math.round(rectToDraw.x)} y:${Math.round(rectToDraw.y)} w:${Math.round(rectToDraw.w)} h:${Math.round(rectToDraw.h)}`;
      const textMetrics = ctx.measureText(info);
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(rectToDraw.x -1, rectToDraw.y - 14, textMetrics.width + 4, 12);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(info, rectToDraw.x + 1, rectToDraw.y - 4);
    } else if (historicalSelection) {
      const screenRect = {
          x: historicalSelection.x * effectiveScale + drawX,
          y: historicalSelection.y * effectiveScale + drawY,
          w: historicalSelection.w * effectiveScale,
          h: historicalSelection.h * effectiveScale,
      };

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenRect.x, screenRect.y, screenRect.w, screenRect.h);
      
      ctx.font = '10px "Fira Code", monospace';
      const info = `PREV. CROP`;
      const textMetrics = ctx.measureText(info);
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(screenRect.x - 1, screenRect.y - 14, textMetrics.width + 4, 12);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(info, screenRect.x + 1, screenRect.y - 4);
    }
  }, [image, selection, getCanvasScale, historicalSelection, confirmedSelection, zoom, offset]);
  
  useEffect(() => {
    draw();
  }, [draw, zoom, offset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const { width, height } = parent.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }
        draw();
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [draw, image]);

  useEffect(() => {
    if (!confirmedSelection) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const pulseDuration = 400;

    let startTime = performance.now();
    const animate = (time: number) => {
      const elapsed = time - startTime;
      if (elapsed >= pulseDuration) {
        const { scale: baseScale, offsetX: baseOffsetX, offsetY: baseOffsetY } = getCanvasScale();
        const effectiveScale = baseScale * zoom;
        const originalRect: Rect = {
            x: (confirmedSelection.x - (baseOffsetX + offset.x)) / effectiveScale,
            y: (confirmedSelection.y - (baseOffsetY + offset.y)) / effectiveScale,
            w: confirmedSelection.w / effectiveScale,
            h: confirmedSelection.h / effectiveScale
        };
        const ctx = canvas.getContext('2d');
        if(ctx){
          ctx.strokeStyle = '#39FF14';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(confirmedSelection.x, confirmedSelection.y, confirmedSelection.w, confirmedSelection.h);
          ctx.setLineDash([]);
        }
        
        const canvasDataUrl = canvas.toDataURL('image/png');
        onSelect(originalRect, confirmedSelection, canvasDataUrl);
        setConfirmedSelection(null);
        return;
      }
      draw();
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [confirmedSelection, draw, getCanvasScale, onSelect, zoom, offset]);


  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement> | React.WheelEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const clampOffset = useCallback((offsetToClamp: { x: number; y: number }, currentZoom: number) => {
    if (!image || !canvasRef.current) return offsetToClamp;
    
    const { scale: baseScale, dWidth: fitWidth, dHeight: fitHeight } = getCanvasScale();
    const zoomedWidth = image.naturalWidth * baseScale * currentZoom;
    const zoomedHeight = image.naturalHeight * baseScale * currentZoom;

    const maxPanX = Math.max(0, zoomedWidth - fitWidth);
    const maxPanY = Math.max(0, zoomedHeight - fitHeight);

    const clampedX = Math.max(-maxPanX, Math.min(0, offsetToClamp.x));
    const clampedY = Math.max(-maxPanY, Math.min(0, offsetToClamp.y));
    
    return { x: clampedX, y: clampedY };
  }, [image, getCanvasScale]);

  const handleZoom = useCallback((zoomFactor: number, pivot: {x: number, y: number}) => {
    if (!image) return;
    
    const newZoom = zoom * zoomFactor;
    const clampedZoom = Math.max(1, Math.min(newZoom, 15));

    const { scale: baseScale, offsetX: baseOffsetX, offsetY: baseOffsetY } = getCanvasScale();
    const imageX = (pivot.x - baseOffsetX - offset.x) / (baseScale * zoom);
    const imageY = (pivot.y - baseOffsetY - offset.y) / (baseScale * zoom);
    const newOffsetX = pivot.x - (imageX * baseScale * clampedZoom) - baseOffsetX;
    const newOffsetY = pivot.y - (imageY * baseScale * clampedZoom) - baseOffsetY;
    
    setZoom(clampedZoom);
    setOffset(clampOffset({ x: newOffsetX, y: newOffsetY }, clampedZoom));
  }, [zoom, offset, image, getCanvasScale, clampOffset]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { width, height } = canvas.getBoundingClientRect();
      handleZoom(1.2, { x: width / 2, y: height / 2 });
    },
    zoomOut: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { width, height } = canvas.getBoundingClientRect();
      handleZoom(1 / 1.2, { x: width / 2, y: height / 2 });
    },
    resetZoom: () => {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
  }));

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isEnhancing) return;
    const pos = getMousePos(e);
    const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    handleZoom(zoomFactor, pos);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isEnhancing || confirmedSelection) return;
    const pos = getMousePos(e);

    if ((e.metaKey || e.ctrlKey || e.button === 1) && zoom > 1) {
      setIsPanning(true);
      setPanStart({ x: pos.x - offset.x, y: pos.y - offset.y });
      return;
    }

    if (useFixedSelectionBox) {
        if (!image || !canvasRef.current) return;
        
        const { scale: baseScale, offsetX: baseOffsetX, offsetY: baseOffsetY } = getCanvasScale();
        const effectiveScale = baseScale * zoom;
        const drawX = baseOffsetX + offset.x;
        const drawY = baseOffsetY + offset.y;
        const drawWidth = image.naturalWidth * effectiveScale;
        const drawHeight = image.naturalHeight * effectiveScale;

        if (pos.x < drawX || pos.x > drawX + drawWidth || pos.y < drawY || pos.y > drawY + drawHeight) {
            return;
        }
        
        const originalClickX = (pos.x - drawX) / effectiveScale;
        const originalClickY = (pos.y - drawY) / effectiveScale;
        
        const boxWidth = image.naturalWidth * fixedSelectionSizePercentage;
        const boxHeight = image.naturalHeight * fixedSelectionSizePercentage;
        
        let originalX = originalClickX - boxWidth / 2;
        let originalY = originalClickY - boxHeight / 2;
        
        if (originalX < 0) originalX = 0;
        if (originalY < 0) originalY = 0;
        if (originalX + boxWidth > image.naturalWidth) originalX = image.naturalWidth - boxWidth;
        if (originalY + boxHeight > image.naturalHeight) originalY = image.naturalHeight - boxHeight;
        
        const originalRect: Rect = { x: originalX, y: originalY, w: boxWidth, h: boxHeight };
        
        const screenRect: Rect = {
            x: originalRect.x * effectiveScale + drawX,
            y: originalRect.y * effectiveScale + drawY,
            w: originalRect.w * effectiveScale,
            h: originalRect.h * effectiveScale,
        };
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = '#39FF14';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(screenRect.x, screenRect.y, screenRect.w, screenRect.h);
          ctx.setLineDash([]);
        }
        const canvasDataUrl = canvas.toDataURL('image/png');
        draw();
        onSelect(originalRect, screenRect, canvasDataUrl);
    } else {
        setStartPoint(pos);
        setSelection({ ...pos, w: 0, h: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isEnhancing || confirmedSelection) return;
    const pos = getMousePos(e);

    if (isPanning) {
      const newOffset = { x: pos.x - panStart.x, y: pos.y - panStart.y };
      setOffset(clampOffset(newOffset, zoom));
      return;
    }

    if (useFixedSelectionBox || !startPoint) return;
    
    const x = Math.min(pos.x, startPoint.x);
    const y = Math.min(pos.y, startPoint.y);
    const w = Math.abs(pos.x - startPoint.x);
    const h = Math.abs(pos.y - startPoint.y);
    setSelection({ x, y, w, h });
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (useFixedSelectionBox) return;

    if (!selection || !image || selection.w < 10 || selection.h < 10 || isEnhancing || confirmedSelection) {
      setStartPoint(null);
      setSelection(null);
      return;
    }

    setConfirmedSelection({ ...selection });
    setStartPoint(null);
    setSelection(null);
  };

  let cursorClass = 'cursor-crosshair';
  if (isEnhancing || confirmedSelection) {
      cursorClass = 'cursor-wait';
  } else if (isPanning) {
      cursorClass = 'cursor-grabbing';
  } else if (zoom > 1) {
      cursorClass = 'cursor-grab';
  } else if (useFixedSelectionBox) {
      cursorClass = 'cursor-zoom-in';
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className={`max-w-full max-h-full w-full h-full transition-[filter] duration-700 ${isEnhancing || confirmedSelection ? 'filter brightness-50' : 'filter brightness-100'} ${cursorClass}`}
    />
  );
});