import { Reflector, useTexture } from "@react-three/drei";
import { a } from "@react-spring/three";
import { Vector2 } from "three";

const Wall = (props: any) => {
  const [wall, normal] = useTexture([
    "/reflectionTexture/xx.jpeg",
    "/reflectionTexture/ground.jpeg",
  ]);

  return (
    <>
      <Reflector resolution={1024} args={[50, 30]} {...props}>
        {(Material, props) => (
          <Material
            color="#ffffff"
            metalness={1.5}
            roughnessMap={wall}
            normalMap={normal}
            normalScale={new Vector2(3, 2)}
            {...props}
          />
        )}
      </Reflector>
      <a.mesh position={[0, 0, 1]}>
        <planeGeometry args={[50, 30]} />
        {/*
            // @ts-ignore */}
        <a.meshStandardMaterial
          transparent
          opacity={props.opacity}
          color="#ffffff"
        />
      </a.mesh>
    </>
  );
};

export default Wall;
