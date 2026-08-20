"use client";

import React, { useRef, useState, useCallback } from "react";

// -- Utility functions --
const rgbToHex = (r: number, g: number, b: number) =>
  "#" +
  ((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase();

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(
    l * 100
  )}%)`;
};

const hexToRgb = (hex: string): string => {
  const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(
    shorthand,
    (_, r, g, b) => r + r + g + g + b + b
  );
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : "255, 255, 255";
};

const hexToHsl = (hex: string): string => {
  const rgb = hexToRgb(hex).split(",").map((v) => parseInt(v.trim()));
  return rgbToHsl(rgb[0], rgb[1], rgb[2]);
};
// -- End utilities --

interface ColorData {
  hex: string;
  rgb: string;
  hsl: string;
}
interface SelectedColor extends ColorData {}
interface MousePosition {
  x: number;
  y: number;
}

type MouseOrTouchEvent = React.MouseEvent<HTMLCanvasElement, MouseEvent> | React.TouchEvent<HTMLCanvasElement>;

export default function ImageColorExtractor() {
  const [canvasHoverData, setCanvasHoverData] = useState<ColorData | null>(
    null
  );
  const [mousePosition, setMousePosition] = useState<MousePosition | null>(
    null
  );
  const [lastColorData, setLastColorData] = useState<ColorData>({
    hex: "#FFFFFF",
    rgb: "255, 255, 255",
    hsl: "hsl(0, 0%, 100%)",
  });
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>(
    []
  );
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const addColorToPalette = useCallback(
    (hex: string) => {
      if (!hex || hex === "#FFFFFF") return;
      if (selectedColors.some((c) => c.hex === hex)) {
        showToast(`Color ${hex} already in palette.`);
        return;
      }
      const newColor: SelectedColor = {
        hex,
        rgb: hexToRgb(hex),
        hsl: hexToHsl(hex),
      };
      setSelectedColors((prev) => [...prev, newColor]);
      showToast(`Added ${hex} 🎨`);
    },
    [selectedColors]
  );

  const removeColorFromPalette = useCallback(
    (index: number) => {
      const hex = selectedColors[index].hex;
      setSelectedColors((prev) => prev.filter((_, i) => i !== index));
      showToast(`Removed ${hex}`);
    },
    [selectedColors]
  );

  const clearSelectedPalette = () => {
    setSelectedColors([]);
    showToast("Palette cleared!");
  };

  const exportPalette = () => {
    if (selectedColors.length === 0) {
      showToast("Palette is empty.");
      return;
    }
    const paletteData = {
      colors: selectedColors,
      timestamp: new Date().toISOString(),
      count: selectedColors.length,
    };
    const blob = new Blob([JSON.stringify(paletteData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `palette-${new Date()
      .toISOString()
      .split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Palette exported!");
  };

  const getCanvasCoords = (event: MouseOrTouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      
      let clientX, clientY;
      
      if ('touches' in event.nativeEvent && event.nativeEvent.touches.length > 0) {
          clientX = event.nativeEvent.touches[0].clientX;
          clientY = event.nativeEvent.touches[0].clientY;
      } else if ('clientX' in event.nativeEvent) {
          clientX = event.nativeEvent.clientX;
          clientY = event.nativeEvent.clientY;
      } else {
          return null;
      }

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(
          (clientX - rect.left) * (canvas.width / rect.width)
      );
      const y = Math.floor(
          (clientY - rect.top) * (canvas.height / rect.height)
      );
      
      return { clientX, clientY, x, y, canvasWidth: canvas.width, canvasHeight: canvas.height };
  }

  const getColorAtEvent = (event: MouseOrTouchEvent): ColorData | null => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const coords = getCanvasCoords(event);
    
    if (!canvas || !ctx || !coords) return null;

    const { x, y, canvasWidth, canvasHeight } = coords;

    if (x >= 0 && y >= 0 && x < canvasWidth && y < canvasHeight) {
      const imageData = ctx.getImageData(x, y, 1, 1); 
      const [r, g, b] = imageData.data;
      return {
        hex: rgbToHex(r, g, b),
        rgb: `${r}, ${g}, ${b}`,
        hsl: rgbToHsl(r, g, b),
      };
    }
    return null;
  };

  const handleCanvasMove = (
    e: MouseOrTouchEvent
  ) => {
    if ('touches' in e.nativeEvent) {
        e.preventDefault();
    }
    
    const color = getColorAtEvent(e);
    const coords = getCanvasCoords(e);
    
    setCanvasHoverData(color);
    if (coords) {
        setMousePosition({ x: coords.clientX, y: coords.clientY });
    }
  };

  const handleCanvasClick = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const color = getColorAtEvent(e);
    if (!color) return;
    setLastColorData(color);
    showToast(`Selected ${color.hex}`);
  };
  
  const handleCanvasTouchStart = (
      e: React.TouchEvent<HTMLCanvasElement>
  ) => {
      const color = getColorAtEvent(e);
      if (!color) return;
      setLastColorData(color);
      showToast(`Selected ${color.hex}`);
      handleCanvasMove(e); 
  }

  const handleCanvasMouseLeave = () => {
    setCanvasHoverData(null);
    setMousePosition(null);
  };
  
  const handleCanvasTouchEnd = () => {
    setCanvasHoverData(null);
    setMousePosition(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => displayImageOnCanvas(img);
      if (typeof reader.result === "string") img.src = reader.result;
    };
    reader.readAsDataURL(file);
    setIsImageLoaded(false);
    setCanvasHoverData(null);
    setLastColorData({
      hex: "#FFFFFF",
      rgb: "255, 255, 255",
      hsl: "hsl(0, 0%, 100%)",
    });
  };

  const displayImageOnCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxWidth = 900;
    const maxHeight = 500;
    let { width, height } = img;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    setIsImageLoaded(true);
  };

  const displayColorData = lastColorData;
  const isColorPickable =
    isImageLoaded && lastColorData.hex !== "#FFFFFF";

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 space-y-8 mx-auto my-10 max-w-[95%] md:max-w-6xl">
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 border-b pb-4">
        Image Color Extractor & Palette Builder
      </h2>

      {/* Upload Section */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-700">
          1. Upload Image
        </h2>
        <label
          htmlFor="imageUpload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition"
        >
          <div className="text-center p-3">
            <svg
              className="w-8 h-8 text-purple-600 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2
                l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6
                20h12a2 2 0 002-2V6a2 2 0
                00-2-2H6a2 2 0 00-2 2v12a2 2 0
                002 2z"
              />
            </svg>
            <p className="mt-1 text-sm font-medium text-purple-800">
              Click to upload image (PNG, JPG, GIF)
            </p>
          </div>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Canvas & Picker */}
      <div className={`${isImageLoaded ? "" : "hidden"} space-y-4`}>
        <h2 className="text-lg md:text-xl font-bold text-gray-700">
          2. Pick a Color
        </h2>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex justify-center flex-1 bg-gray-100 rounded-lg p-4 shadow-inner overflow-x-auto">
            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-lg cursor-crosshair border-2 border-gray-300"
              onMouseMove={handleCanvasMove}
              onTouchMove={handleCanvasMove}
              onClick={handleCanvasClick}
              onTouchStart={handleCanvasTouchStart}
              onMouseLeave={handleCanvasMouseLeave}
              onTouchEnd={handleCanvasTouchEnd}
              style={{ touchAction: 'none' }} 
            />
            
           {canvasHoverData && mousePosition && (
  <div
    className="fixed pointer-events-none z-50"
    style={{
      left: mousePosition.x + 20,
      top: mousePosition.y - 40,
    }}
  >
    <div
      className="rounded-full border-4 border-white shadow-2xl flex items-center justify-center"
      style={{
        width: "70px",
        height: "70px",
        backgroundColor: canvasHoverData.hex,
        boxShadow:
          "0 0 0 2px rgba(0,0,0,0.3), 0 8px 30px rgba(0,0,0,0.4)",
      }}
    >
      <div className="w-1 h-1 bg-white/70 rounded-full" />

      <div className="absolute w-full h-full rounded-full pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20" />
        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white/20" />
      </div>
    </div>

    <div
      className="absolute bg-gray-900 text-white text-xs font-mono px-2 py-1 rounded shadow-lg whitespace-nowrap"
      style={{
        bottom: "-28px",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      {canvasHoverData.hex}
    </div>
  </div>
)}
          </div>

          {/* Last Selected Color */}
          <div className="w-full lg:w-80 p-4 bg-gray-50 rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-lg border-4 border-white shadow-2xl"
                  style={{ backgroundColor: displayColorData.hex }}
                />
                <div className="text-sm md:text-lg font-bold text-gray-800">
                  LAST VIEWED COLOR
                </div>
              </div>
              <div className="space-y-2 text-xs md:text-sm">
                <ColorDetail
                  label="HEX"
                  value={displayColorData.hex}
                />
                <ColorDetail
                  label="RGB"
                  value={displayColorData.rgb}
                />
                <ColorDetail
                  label="HSL"
                  value={displayColorData.hsl}
                />
              </div>
            </div>
            <button
              onClick={() => addColorToPalette(displayColorData.hex)}
              disabled={!isColorPickable}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              Add {displayColorData.hex}
            </button>
          </div>
        </div>
      </div>

      {/* Palette Section */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-700">
          3. Selected Palette ({selectedColors.length})
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {selectedColors.map((color, idx) => (
            <div
              key={idx}
              className="w-full aspect-square rounded-xl border-2 border-gray-200 relative group cursor-pointer shadow-lg hover:shadow-xl transition transform hover:scale-105"
              style={{ backgroundColor: color.hex }}
              onClick={() => {
                navigator.clipboard.writeText(color.hex);
                showToast(`Copied ${color.hex}`);
              }}
              title={`Click to copy ${color.hex}`}
            >
              <button
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white flex items-center justify-center rounded-full text-xs opacity-0 group-hover:opacity-100 transition z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  removeColorFromPalette(idx);
                }}
              >
                ✕
              </button>
              <div className="absolute inset-x-0 bottom-0 text-center text-[10px] md:text-xs font-mono bg-black bg-opacity-70 text-white py-1 rounded-b-xl opacity-0 group-hover:opacity-100 transition">
                {color.hex}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={exportPalette}
            disabled={selectedColors.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            Export JSON
          </button>
          <button
            onClick={clearSelectedPalette}
            disabled={selectedColors.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

// -- Subcomponent --
function ColorDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm border text-xs md:text-sm">
      <span className="font-semibold text-gray-600">{label}:</span>
      <span className="ml-2 font-mono text-gray-800 text-right break-all">
        {value}
      </span>
    </div>
  );
}