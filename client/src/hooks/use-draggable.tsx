import React, { useState, useContext, createContext, ReactNode, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

// Create DnD Context
interface DndContextType {
  activeDragId: string | null;
  setActiveDragId: (id: string | null) => void;
  onDragEnd: (result: { active: string; over: string | null }) => void;
}

const DndContextObj = createContext<DndContextType>({
  activeDragId: null,
  setActiveDragId: () => {},
  onDragEnd: () => {},
});

// DnD Context Provider
interface DndContextProps {
  children: ReactNode;
  onDragEnd: (result: { active: string; over: string | null }) => void;
}

export const DndContext = ({ children, onDragEnd }: DndContextProps) => {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  return (
    <DndContextObj.Provider value={{ activeDragId, setActiveDragId, onDragEnd }}>
      {children}
    </DndContextObj.Provider>
  );
};

// Draggable hook
export function useDraggable(id: string, isDraggable: boolean = true) {
  const [isDragging, setIsDragging] = useState(false);
  const { setActiveDragId, onDragEnd } = useContext(DndContextObj);
  const isMobile = useIsMobile();
  const [lastY, setLastY] = useState<number | null>(null);
  const scrollSpeed = 15; // Pixels to scroll per frame

  useEffect(() => {
    let animationFrameId: number;
    
    const handleScroll = () => {
      if (isDragging && lastY !== null && isMobile) {
        const currentY = lastY;
        const viewportHeight = window.innerHeight;
        const scrollThreshold = viewportHeight * 0.2; // 20% of viewport height
        
        if (currentY < scrollThreshold) {
          // Near top - scroll up
          window.scrollBy(0, -scrollSpeed);
        } else if (currentY > viewportHeight - scrollThreshold) {
          // Near bottom - scroll down
          window.scrollBy(0, scrollSpeed);
        }
        
        animationFrameId = requestAnimationFrame(handleScroll);
      }
    };

    if (isDragging && isMobile) {
      animationFrameId = requestAnimationFrame(handleScroll);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDragging, lastY, isMobile]);

  // Styles to apply when dragging
  const style = {
    transform: isDragging ? 'translate(0, -5px)' : undefined,
    cursor: isDragging ? 'grabbing' : (isDraggable ? 'grab' : 'default'),
    opacity: isDragging ? 0.5 : 1,
  };

  // Attributes and event listeners
  const attributes = {
    draggable: isDraggable,
    'data-drag-id': id,
  };

  const listeners = isDraggable ? {
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', id);
      setIsDragging(true);
      setActiveDragId(id);
      setLastY(e.clientY);
    },
    onDragEnd: (e: React.DragEvent) => {
      setIsDragging(false);
      setActiveDragId(null);
      setLastY(null);
    },
    onDrag: (e: React.DragEvent) => {
      if (e.clientY !== 0) { // Filter out invalid drag events
        setLastY(e.clientY);
      }
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (isMobile) {
        const touch = e.touches[0];
        setLastY(touch.clientY);
      }
    }
  } : {};

  return {
    isDragging,
    attributes,
    listeners,
    setNodeRef: (element: any) => {}, // For compatibility with other DnD libraries
    style,
  };
}

// Droppable hook
export function useDroppable(id: string) {
  const [isOver, setIsOver] = useState(false);
  const { activeDragId, onDragEnd } = useContext(DndContextObj);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const dragId = e.dataTransfer.getData('text/plain');
    onDragEnd({ active: dragId, over: id });
  };

  return {
    isOver,
    setNodeRef: (element: any) => {
      if (element) {
        element.ondragover = (e: DragEvent) => {
          e.preventDefault();
          setIsOver(true);
        };
        element.ondragenter = (e: DragEvent) => {
          e.preventDefault();
          setIsOver(true);
        };
        element.ondragleave = () => setIsOver(false);
        element.ondrop = handleDrop;
      }
    },
  };
}
