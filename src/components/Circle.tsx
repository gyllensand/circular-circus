import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useMemo, useRef } from "react";
import { DoubleSide, Mesh } from "three";
import { MusicNodeData } from "../App";
import { MeshDistortMaterial } from "@react-three/drei";
import { useGesture } from "react-use-gesture";
import { a, useSpring, SpringRef } from "@react-spring/three";
import { SpringValue } from "react-spring";

const AnimatedDistortMaterial = a(MeshDistortMaterial);
const BOUNDS_RADIUS = 2.7;

const Circle = ({
  onClick,
  analyser,
  filter,
  setThemeColor,
  setThemeOpacity,
  setThemeIntensity,
  themeColor,
  radius,
  color,
  index,
}: MusicNodeData & {
  onClick: () => void;
  themeColor: SpringValue<number[]>;
  setThemeOpacity?: SpringRef<{
    themeOpacity: number;
    themeSize: number;
  }>;
  setThemeColor?: SpringRef<{
    themeColor: number[];
  }>;
  setThemeIntensity?: SpringRef<{
    themeIntensity: number;
  }>;
  index: number;
}) => {
  const materialRef = useRef<Mesh>();
  const { size, viewport } = useThree();
  const aspect = useMemo(() => size.width / viewport.width, [size, viewport]);
  const posZ = useMemo(() => 5 - parseFloat(`0.${index}`), [index]);
  const isIdle = useRef(false);
  const initialScaleDelay = useRef(true);

  const [spring, setSpring] = useSpring(() => ({
    position: [0, 0, posZ],
    distort: 0,
    config: { friction: 20 },
  })) as any;

  const [scaleLoop, setScaleLoop] = useSpring(() => ({
    loop: { reverse: true },
    from: { scale: 1 },
    to: { scale: 1.2 },
    delay: () => {
      if (initialScaleDelay.current) {
        initialScaleDelay.current = false;
        return 2000 - index * 100;
      }
      return 1000;
    },
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
        const isOutsideBounds =
          Math.abs(x / aspect) > BOUNDS_RADIUS ||
          Math.abs(-y / aspect) > BOUNDS_RADIUS;

        const moveValue = Math.abs(x) > Math.abs(y) ? Math.abs(x) : Math.abs(y);
        const isActive = down || (!down && isOutsideBounds);

        if (index === 0) {
          setThemeColor?.start({
            themeColor: isOutsideBounds ? [255, 255, 255] : [0, 0, 0],
          });

          setThemeOpacity?.start({
            themeOpacity: isOutsideBounds ? 0 : 1,
            themeSize: isOutsideBounds ? 0 : 4,
          });

          if (isOutsideBounds) {
            setThemeIntensity?.start({
              themeIntensity: isOutsideBounds ? 0 : 1000,
            });
          }
        }

        setSpring.start({
          position: [
            isActive ? x / aspect : 0,
            isActive ? -y / aspect : 0,
            posZ,
          ],
          distort: isActive ? moveValue / aspect / 15 : 0,
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
        initial: () => [
          spring.position.get()[0] * aspect,
          -spring.position.get()[1] * aspect,
        ],
      },
    }
  );

  return (
    <>
      <a.mesh {...spring} {...bind()} castShadow receiveShadow {...scaleLoop}>
        <circleGeometry args={[radius, 100]} />
        {/*
            // @ts-ignore */}
        <AnimatedDistortMaterial
          ref={materialRef}
          side={DoubleSide}
          attach="material"
          color={index === 0 ? (themeColor as any) : color}
          factor={0}
          speed={4}
          distort={spring.distort}
        />
      </a.mesh>
    </>
  );
};

export default Circle;
