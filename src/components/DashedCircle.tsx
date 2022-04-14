//@ts-nocheck
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferGeometry, Float32BufferAttribute, Line } from "three";
import { COLORS } from "../App";

const DashedCircle = () => {
  const lineRef = useRef<Line>();

  const geometry = useMemo(() => {
    const vertices = [];
    const divisions = 50;

    for (let i = 0; i <= divisions; i++) {
      const v = (i / divisions) * (Math.PI * 2);
      const x = Math.sin(v);
      const y = Math.cos(v);
      vertices.push(x, y, 0.5);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    return geometry;
  }, []);

  useFrame(() => {
    lineRef.current!.rotation.z -= 0.003;
  });

  return (
    <line
      ref={lineRef}
      onUpdate={(line: Line) => line.computeLineDistances()}
      geometry={geometry}
      scale={4}
    >
      <lineDashedMaterial
        color={COLORS.black}
        scale={2}
        dashSize={0.1}
        gapSize={0.2}
      />
    </line>
  );
};

export default DashedCircle;
