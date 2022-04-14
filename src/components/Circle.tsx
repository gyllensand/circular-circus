import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  DoubleSide,
  Mesh,
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
import { useGesture } from "react-use-gesture";
import { a, useSpring } from "@react-spring/three";

const AnimatedDistortMaterial = a(MeshDistortMaterial);
const BOUNDS_RADIUS = 2.7;

const Circle = ({
  onClick,
  analyser,
  filter,
  isActive,
  radius,
  color,
  index,
}: MusicNodeData & {
  onClick: () => void;
  isActive: boolean;
  index: number;
}) => {
  const materialRef = useRef<Mesh>();
  const { size, viewport } = useThree();
  const aspect = useMemo(() => size.width / viewport.width, [size, viewport]);
  const posZ = useMemo(() => 5 - parseFloat(`0.${index}`), [index]);
  const isIdle = useRef(false);

  const [spring, setSpring] = useSpring(() => ({
    position: [0, 0, posZ],
    distort: 0,
    config: { friction: 20 },
  })) as any;

  const [scaleLoop, setScaleLoop] = useSpring(() => ({
    loop: { reverse: true },
    from: { scale: 1 },
    to: { scale: 1.1 },
    delay: 500 - index * 50,
  }));

  let getPosValue = useCallback(
    () =>
      Math.abs(spring.position.get()[0]) > Math.abs(spring.position.get()[1])
        ? spring.position.get()[0]
        : -spring.position.get()[1],
    [spring.position]
  );

  useFrame(({ clock }) => {
    analyser.update();
    // console.log(spring.position.get()[0] * 100)
    const clamp = (energy: number, threshold: number) =>
      isFinite(energy) && energy > threshold ? energy : threshold;

    const energy = analyser.getEnergy().byFrequency("mid");
    const wobbleEnergy = analyser._map(energy, -130, -30, 0, 1);
    const wobbleValue = clamp(wobbleEnergy, 0);

    filter.frequency.rampTo(Math.abs(getPosValue()) * 100, 0);

    if (Math.abs(getPosValue()) / aspect === 0 && isIdle.current) {
      isIdle.current = false;
      setScaleLoop.resume();
    }

    //@ts-ignore
    // smallMaterial.current!.distort = wobbleValue;
  });

  const bind = useGesture(
    {
      onDrag: ({ down, movement: [x, y], tap, active }) => {
        // if (tap) {
        //     if (isActive) {
        //       setSpring.start({
        //         position: [0, 0, posZ],
        //       });
        //     }
        //   onClick();
        //   return;
        // }

        const isOutsideBounds =
          Math.abs(x / aspect) > BOUNDS_RADIUS ||
          Math.abs(-y / aspect) > BOUNDS_RADIUS;

        const moveValue = Math.abs(x) > Math.abs(y) ? x : y;
        const isActive = down || (!down && isOutsideBounds);

        setSpring.start({
          position: [
            isActive ? x / aspect : 0,
            isActive ? -y / aspect : 0,
            posZ,
          ],
          distort: isActive ? moveValue / aspect / 10 : 0,
          // distort: isOutsideBounds ? moveValue / aspect / 10 : 0,
        });
      },
      onPointerDown: ({ event }) => {
        onClick();
        setScaleLoop.pause();
        event.stopPropagation();
      },
      onPointerUp: () => {
        isIdle.current = true;
      },
    },
    {
      drag: {
        bounds: {
          left: -size.width / 2 + radius * 50,
          right: size.width / 2 - radius * 50,
          top: -size.height / 2 + radius * 50,
          bottom: size.height / 2 - radius * 50,
        },
        // filterTaps: true,
        initial: () => [
          spring.position.get()[0] * aspect,
          -spring.position.get()[1] * aspect,
        ],
      },
    }
  );

  const light = useRef<SpotLight>();
  useHelper(light, SpotLightHelper, 1);
  // light.current?.lookAt(50, 50, 0)
  return (
    <>
      {/* <spotLight
        ref={light}
        angle={Math.PI / 8}
        castShadow
        penumbra={1}
        decay={0.5}
        distance={35}
        intensity={10}
        position={[10, 10, 20]}
        power={5}
        color={COLORS.purple}
      /> */}
      <a.mesh {...spring} {...bind()} castShadow receiveShadow {...scaleLoop}>
        <circleGeometry args={[radius, 100]} />
        {/*
            // @ts-ignore */}
        <AnimatedDistortMaterial
          ref={materialRef}
          side={DoubleSide}
          attach="material"
          color={color}
          factor={0}
          speed={4}
          distort={spring.distort}
        />
      </a.mesh>
    </>
  );
};

export default Circle;
