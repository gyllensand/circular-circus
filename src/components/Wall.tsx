// @ts-nocheck
import { Reflector, useTexture } from "@react-three/drei";
import { a, SpringValue } from "@react-spring/three";
import { Vector2 } from "three";
import { useThree } from "@react-three/fiber";

const Wall = ({ themeOpacity }: { themeOpacity: SpringValue<number> }) => {
  const { getCurrentViewport } = useThree((state) => state.viewport);
  const { width, height } = getCurrentViewport();
  const [wall, normal] = useTexture([
    "/reflectionTexture/xx.jpeg",
    "/reflectionTexture/ground.jpeg",
  ]);

  return (
    <>
      <Reflector
        resolution={1024}
        args={[width, height]}
        mirror={1}
        blur={[200, 100]}
        mixBlur={10}
        mixStrength={1.5}
        position={[0, 0, 0]}
      >
        {(Material, props) => {
          const AnimatedMaterial = a(Material);
          return (
            <AnimatedMaterial
              color="#ffffff"
              metalness={1.5}
              roughnessMap={wall}
              normalMap={normal}
              normalScale={new Vector2(3, 2)}
              transparent
              opacity={themeOpacity}
              {...props}
            />
          );
        }}
      </Reflector>
    </>
  );
};

export default Wall;
