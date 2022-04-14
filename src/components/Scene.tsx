import { useCallback, useEffect, useRef, useState } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useHelper } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import { EffectComposer, SelectiveBloom } from "@react-three/postprocessing";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {
  AutoFilter,
  Destination,
  Filter,
  Player,
  start,
  Transport,
} from "tone";
import Dots from "./Dots";
import {
  DirectionalLightHelper,
  PointLightHelper,
  SpotLight,
  SpotLightHelper,
} from "three";
import Circle from "./Circle";
import { COLORS, musicNodes } from "../App";
import Wall from "./Wall";
import DashedCircle from "./DashedCircle";

const debounce = require("lodash.debounce");
extend({ EffectComposer, RenderPass, UnrealBloomPass });

export const rows = [{}, {}, {}, {}];

const Scene = () => {
  const { scene, camera, size } = useThree();
  const [toneInitialized, setToneInitialized] = useState(false);
  const [activeNodes, setActiveNodes] = useState<boolean[]>(
    musicNodes.map(() => false)
  );

  Transport.timeSignature = [4, 4];
  Transport.bpm.value = 110;
  Transport.loop = true;
  Transport.loopStart = 0;
  Transport.loopEnd = "32m";

  if (size.width < 600) {
    camera.position.set(0, 0, 20);
  } else {
    camera.position.set(0, 0, 10);
  }

  useEffect(() => {
    musicNodes.forEach((node) => {
      // const filter = new AutoFilter(4).start();
      // filter.frequency.rampTo(20000, 10);
      // const distortion = new Tone.Distortion(0.5);
      // connect the player to the filter, distortion and then to the master output
      node.player.chain(node.filter, Destination);

      // node.player.toDestination();
      node.player.connect(node.analyser);
      node.analyser.update();
    });
  }, []);

  const initializeTone = useCallback(async () => {
    await start();
    setToneInitialized(true);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onClick = useCallback(
    debounce(async (index: number) => {
      if (!toneInitialized) {
        await initializeTone();
      }

      if (Transport.state === "stopped") {
        setTimeout(() => {
          Transport.start("+0.1");
          musicNodes.forEach((node) => {
            node.player.start();
          });
        }, 100);
      }

      // const { player } = musicNodes[index];
      // const activePlayers = activeNodes.map((o, i) => (i === index ? !o : o));
      // setActiveNodes(activePlayers);

      // if (player.state === "stopped") {
      //   player.sync().start(0);
      // } else {
      //   player.stop().unsync();

      //   if (!activePlayers.find((o) => o) && Transport.state === "started") {
      //     setTimeout(() => {
      //       Transport.stop();
      //     }, 100);
      //   }
      // }
    }, 100),
    [initializeTone, toneInitialized, activeNodes]
  );

  const light = useRef<SpotLight>();
  useHelper(light, SpotLightHelper, 1);

  // light.current?.shadow.bias = -0.01;

  return (
    <>
      <color attach="background" args={[255, 255, 255]} />
      {/* <spotLight
        ref={light}
        angle={Math.PI / 8}
        castShadow
        penumbra={1}
        decay={0.5}
        distance={35}
        intensity={10}
        position={[0, 0, 20]}
      /> */}

      <ambientLight />
      {/* <OrbitControls />
      <Wall /> */}
      <DashedCircle />
      {musicNodes.map((node, i) => (
        <Circle
          {...node}
          key={i}
          index={i}
          isActive={activeNodes[i]}
          onClick={() => onClick(i)}
        />
      ))}
    </>
  );
};

export default Scene;
