import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useMemo, useRef } from "react";
import { DoubleSide, Mesh } from "three";
import { MusicNodeData } from "../App";
import { MeshDistortMaterial } from "@react-three/drei";
import { useGesture } from "react-use-gesture";
import { a, useSpring, SpringRef } from "@react-spring/three";
import { SpringValue } from "react-spring";
import { easeInOutExpo, range } from "../utils";

const AnimatedDistortMaterial = a(MeshDistortMaterial);
const BOUNDS_RADIUS = 2.7;
const MIN_FREQ = 10;
const MAX_FREQ = 20000;

const Circle = ({
  onClick,
  analyser,
  filter,
  player,
  setThemeColor,
  setThemeOpacity,
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
  index: number;
}) => {
  const materialRef = useRef<Mesh>();
  const { size, viewport } = useThree((state) => ({
    size: state.size,
    viewport: state.viewport,
  }));
  const { getCurrentViewport } = viewport;
  const aspect = useMemo(
    () => size.width / getCurrentViewport().width,
    [size, getCurrentViewport]
  );

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
    config: { friction: 15 },
    delay: () => {
      if (initialScaleDelay.current) {
        initialScaleDelay.current = false;
        return 2000 - index * 100;
      }
      return 1000;
    },
  }));

  const getPosValue = useCallback(
    () =>
      Math.abs(spring.position.get()[0]) > Math.abs(spring.position.get()[1])
        ? spring.position.get()[0]
        : -spring.position.get()[1],
    [spring.position]
  );

  useFrame(({ clock }) => {
    analyser.update();
    const clamp = (energy: number, threshold: number) =>
      isFinite(energy) && energy > threshold ? energy : threshold;

    const energy = analyser.getEnergy().byFrequency("mid");
    const wobbleEnergy = analyser._map(energy, -130, -30, 0, 1);
    const wobbleValue = clamp(wobbleEnergy, 0);

    const interpolatedFreq = range(
      0,
      size.width > size.height ? size.width / 2 : size.height / 2,
      MIN_FREQ,
      MAX_FREQ,
      Math.abs(getPosValue() * aspect * 2)
    );

    // filter.frequency.rampTo(
    //   easeInOutExpo(interpolatedFreq, MIN_FREQ, MAX_FREQ, MAX_FREQ),
    //   0
    // );

    filter.frequency.value = easeInOutExpo(
      interpolatedFreq,
      MIN_FREQ,
      MAX_FREQ,
      MAX_FREQ
    );

    player.volume.value = easeInOutExpo(interpolatedFreq, 0, 1, 1);

    if (Math.abs(getPosValue()) / aspect / 2 === 0 && isIdle.current) {
      isIdle.current = false;
      setScaleLoop.resume();
    }

    //@ts-ignore
    // materialRef.current!.distort = wobbleValue;
  });

  const bind = useGesture(
    {
      onDrag: ({ down, movement: [x, y], tap, active }) => {
        const isOutsideBounds =
          Math.abs(x / aspect / 2) > BOUNDS_RADIUS ||
          Math.abs(-y / aspect / 2) > BOUNDS_RADIUS;

        const moveValue = Math.abs(x) > Math.abs(y) ? Math.abs(x) : Math.abs(y);
        const isActive = down || (!down && isOutsideBounds);

        if (index === 0) {
          setThemeColor?.start({
            themeColor: isOutsideBounds ? [255, 255, 255] : [0, 0, 0],
          });

          setThemeOpacity?.start({
            themeOpacity: isOutsideBounds ? 1 : 0,
            themeSize: isOutsideBounds ? 0 : 4,
          });
        }

        // filter.frequency.rampTo(isOutsideBounds ? MAX_FREQ : MIN_FREQ, 0.1);

        setSpring.start({
          position: [
            isActive ? x / aspect / 2 : 0,
            isActive ? -y / aspect / 2 : 0,
            posZ,
          ],
          distort: isActive ? range(0, size.width / 2, 0, 0.7, moveValue) : 0,
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
          left: -size.width / 2 + radius * aspect,
          right: size.width / 2 - radius * aspect,
          top: -size.height / 2 + radius * aspect,
          bottom: size.height / 2 - radius * aspect,
        },
        initial: () => [
          spring.position.get()[0] * (aspect * 2),
          -spring.position.get()[1] * (aspect * 2),
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
          color={index === 0 ? (themeColor as unknown as string) : color}
          factor={0}
          speed={4}
          distort={spring.distort}
        />
      </a.mesh>
    </>
  );
};

export default Circle;
