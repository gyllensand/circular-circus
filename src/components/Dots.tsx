import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { InstancedMesh, Matrix4, Vector3 } from "three";
import AudioEnergy from "../AudioEnergy";

const COUNT = 10000;

const roundedSquareWave = (t: number, delta: number, a: number, f: number) => {
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta);
};

const Dots = ({
  analyser,
  onClick,
}: {
  analyser?: AudioEnergy;
  onClick?: () => void;
}) => {
  const mesh = useRef<InstancedMesh>();

  const { vec, transform, positions, distances } = useMemo(() => {
    const vec = new Vector3();
    const transform = new Matrix4();
    const positions = [...Array(COUNT)].map((_, i) => {
      const position = new Vector3();

      // Place in a grid
      position.x = (i % 100) - 50;
      position.y = Math.floor(i / 100) - 50;

      // Offset every other column (hexagonal pattern)
      position.y += (i % 2) * 0.5;

      // Add some noise
      position.x += Math.random() * 0.3;
      position.y += Math.random() * 0.3;
      return position;
    });

    const distances = positions.map((pos) => pos.length());

    // Precompute initial distances with octagonal offset
    // const right = new Vector3(1, 0, 0);
    // const distances = positions.map((pos) => {
    //   return pos.length() + Math.cos(pos.angleTo(right) * 8) * 0.5;
    // });
    return { vec, transform, positions, distances };
  }, []);

  useFrame(({ clock }) => {
    // analyser.update();
    // const energy = analyser.getEnergy().byFrequency("mid");
    // const scale = analyser._map(energy, -300, -30, 1, 10);
    // const intensity = isFinite(scale) && scale > 1 ? scale : 1;

    for (let i = 0; i < COUNT; ++i) {
      if (i % 2) {
        continue;
      }
      const t = clock.elapsedTime - distances[i] / 80;
      // console.log(intensity - distances[i] / 150)
      // const t = intensity - distances[i] / 500;
      const wave = roundedSquareWave(t, 0.1, 1, 1 / 4);
      const scale = 1 + wave * 0.3;
      const scale2 = 1 + wave * 7;

      vec.copy(positions[i]).multiplyScalar(scale).setZ(scale2);
      transform.setPosition(vec);
      mesh.current!.setMatrixAt(i, transform);
    }

    mesh.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    // <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
    //   <dodecahedronBufferGeometry attach="geometry" args={[0.2, 0]} />
    //   <meshStandardMaterial attach="material" color="#050505" />
    // </instancedMesh>
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, COUNT]}
      position={[0, 0, -2]}
      onClick={onClick}
    >
      <circleBufferGeometry args={[0.15]} />
      <meshBasicMaterial color="#000000" />
    </instancedMesh>
  );
};

export default Dots;
