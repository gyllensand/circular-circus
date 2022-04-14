import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  DirectionalLightHelper,
  Mesh,
  Object3D,
  PointLight,
  SpotLight,
  SpotLightHelper,
  Vector3,
} from "three";
import { COLORS, MusicNodeData } from "../App";
import { GodRays } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import {
  useCubeTexture,
  MeshWobbleMaterial,
  MeshDistortMaterial,
  useTexture,
  useHelper,
} from "@react-three/drei";

const Wall = () => {
  const light = useRef<SpotLight>();
  useHelper(light, DirectionalLightHelper, 1, "red");
  //     var dashMaterial = new THREE.LineDashedMaterial( { color: 0xee6666, dashSize: 2*Math.PI*10/40, gapSize: 2*Math.PI*10/40, linewidth:4  } ),
  // circGeom = new THREE.CircleGeometry( 10, 20 );

  // circGeom.vertices.shift();
  // circGeom.computeLineDistances();
  //@ts-ignore
  //   light.current!.target.position.set(0, 0, 0);

  return (
    <>
      {/* <spotLight
        ref={light}
        position={[0, 0, 0.1]}
        intensity={500}
        distance={15}
        angle={Math.PI / 2}
        penumbra={1}
      /> */}
      {/* <directionalLight ref={light} intensity={10} position={[0, 0, 1]} /> */}

      <mesh position={[0, 0, -5]} receiveShadow>
        <planeBufferGeometry attach="geometry" args={[60, 40]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </>
  );
};

export default Wall;
