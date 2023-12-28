import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import rough from "roughjs";

interface Element {
  type: string;
  offsetX: number;
  offsetY: number;
  width?: number;
  heigth?: number;
  path?: number[][];
  stroke: string;
  strokeWidth: number;
}

interface WhiteBoardProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  ctxRef: React.MutableRefObject<CanvasRenderingContext2D | null>;
  elements: Element[];
  setElements: React.Dispatch<React.SetStateAction<Element[]>>;
  tool: string;
  color: string;
  brushSize: number;
  user: { presenter: boolean };
  socket: SocketIOClient.Socket;
}

const roughGenerator = rough.generator();

const WhiteBoard: React.FC<WhiteBoardProps> = ({
  canvasRef,
  ctxRef,
  elements,
  setElements,
  tool,
  color,
  brushSize,
  user,
  socket
}) => {
  const [img, setImg] = useState<string | null>(null);

  useEffect(() => {
    socket.on("whiteBoardDataResponse", (data) => {
      setImg(data.imgURL);
    });
  }, [socket]);

  if (!user?.presenter) {
    return (
      <>
        <div className="border border-dark border-3 overflow-hidden" style={{ width: '100%', height: '800px' }}>
          <img
            src={img}
            style={{ width: window.innerWidth * 2, height: '800px' }}
            alt="Real-time whiteboard image shared by presenter"
          />
        </div>
      </>
    );
  }

  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.height = 800;
    canvas.width = window.innerWidth * 2;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";

    ctxRef.current = ctx;
  }, [color, brushSize]);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
    }
  }, [color]);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.lineWidth = brushSize;
    }
  }, [brushSize]);

  useLayoutEffect(() => {
    if (canvasRef.current) {
      const roughCanvas = rough.canvas(canvasRef.current);

      if (elements.length > 0) {
        ctxRef.current?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      elements.forEach((element) => {
        if (element.type === "pencil") {
          roughCanvas.linearPath(element.path!, {
            stroke: element.stroke,
            strokeWidth: element.strokeWidth,
            roughness: 0,
          });
        } else if (element.type === "line") {
          roughCanvas.draw(
            roughGenerator.line(element.offsetX, element.offsetY, element.width!, element.heigth!, {
              stroke: element.stroke,
              strokeWidth: element.strokeWidth,
              roughness: 0,
            })
          );
        } else if (element.type === "rect") {
          roughCanvas.draw(
            roughGenerator.rectangle(element.offsetX, element.offsetY, element.width!, element.heigth!, {
              stroke: element.stroke,
              strokeWidth: element.strokeWidth,
              roughness: 0,
            })
          );
        }
      });

      const canvasImage = canvasRef.current.toDataURL();
      socket.emit("whiteboardData", canvasImage);
    }
  }, [elements]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === "pencil") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "pencil",
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: color,
          strokeWidth: brushSize,
        },
      ]);
    } else if (tool === "line") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "line",
          offsetX,
          offsetY,
          width: offsetX,
          heigth: offsetY,
          stroke: color,
          strokeWidth: brushSize,
        },
      ]);
    } else if (tool === "rect") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "rect",
          offsetX,
          offsetY,
          width: offsetX,
          heigth: offsetY,
          stroke: color,
          strokeWidth: brushSize,
        },
      ]);
    }

    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (isDrawing) {
      if (tool === "pencil") {
        const { path } = elements[elements.length - 1];
        const newPath = [...path!, [offsetX, offsetY]];
        setElements((prevElements) =>
          prevElements.map((ele, index) =>
            index === elements.length - 1 ? { ...ele, path: newPath } : ele
          )
        );
      } else if (tool === "line") {
        setElements((prevElements) =>
          prevElements.map((ele, index) =>
            index === elements.length - 1 ? { ...ele, width: offsetX, heigth: offsetY } : ele
          )
        );
      } else if (tool === "rect") {
        setElements((prevElements) =>
          prevElements.map((ele, index) =>
            index === elements.length - 1
              ? { ...ele, width: offsetX - ele.offsetX, heigth: offsetY - ele.offsetY }
              : ele
          )
        );
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <>
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="border border-dark border-3 h-100 w-100 overflow-hidden"
      >
        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default WhiteBoard;
