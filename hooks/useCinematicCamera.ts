import { useCallback, useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import type { Node } from "@xyflow/react";

interface UseCinematicCameraOptions {
  cinematicMode: boolean;
  activeNodeId: string | null;
  nodes: Node[];
}

export function useCinematicCamera({
  cinematicMode,
  activeNodeId,
  nodes,
}: UseCinematicCameraOptions) {
  const { setCenter, fitView } = useReactFlow();
  const cameraTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearCameraTimeout = useCallback(() => {
    if (cameraTimeoutRef.current) {
      clearTimeout(cameraTimeoutRef.current);
      cameraTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!cinematicMode || !activeNodeId) {
      clearCameraTimeout();
      return;
    }

    const node = nodes.find((n) => n.id === activeNodeId);
    if (!node) return;

    clearCameraTimeout();

    cameraTimeoutRef.current = setTimeout(() => {
      const x = node.position.x + (node.measured?.width ?? 200) / 2;
      const y = node.position.y + (node.measured?.height ?? 80) / 2;

      setCenter(x, y, {
        zoom: 1.4,
        duration: 400,
      });
    }, 100);

    return () => {
      clearCameraTimeout();
    };
  }, [activeNodeId, cinematicMode, nodes, setCenter, clearCameraTimeout]);

  const openingShot = useCallback(() => {
    if (!cinematicMode) return;
    fitView({
      duration: 600,
      padding: 0.2,
    });
  }, [cinematicMode, fitView]);

  const finalShot = useCallback(() => {
    if (!cinematicMode) return;
    setTimeout(() => {
      fitView({
        duration: 800,
        padding: 0.2,
      });
    }, 300);
  }, [cinematicMode, fitView]);

  return {
    openingShot,
    finalShot,
  };
}
