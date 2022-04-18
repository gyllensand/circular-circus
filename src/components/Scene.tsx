import { useCallback, useEffect, useRef, useState } from "react";
import { extend, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer } from "@react-three/postprocessing";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Destination, start, Transport } from "tone";
import { SpotLight } from "three";
import Circle from "./Circle";
import { musicNodes } from "../App";
import Wall from "./Wall";
import DashedCircle from "./DashedCircle";
import { a, useSpring } from "@react-spring/three";

const debounce = require("lodash.debounce");
extend({ EffectComposer, RenderPass, UnrealBloomPass });

export const rows = [{}, {}, {}, {}];

const Scene = () => {
  const { camera, size } = useThree();
  const [toneInitialized, setToneInitialized] = useState(false);
  const [activeNodes, setActiveNodes] = useState<boolean[]>(
    musicNodes.map(() => false)
  );

  const [{ themeOpacity, themeSize }, setThemeOpacity] = useSpring(() => ({
    themeOpacity: 0,
    themeSize: 4,
  }));

  const [{ themeColor }, setThemeColor] = useSpring(() => ({
    themeColor: [0, 0, 0],
    config: { duration: 0 },
  }));

  Transport.timeSignature = [4, 4];
  Transport.bpm.value = 110;
  Transport.loop = true;
  Transport.loopStart = 0;
  Transport.loopEnd = "32m";

  if (size.width < 600) {
    camera.position.set(0, 0, 15);
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
    [initializeTone, toneInitialized]
  );

  const light = useRef<SpotLight>();
  // useHelper(light, SpotLightHelper, 1);

  return (
    <>
      <ambientLight />

      <OrbitControls enabled={false} />

      <Wall themeOpacity={themeOpacity} />
      <DashedCircle themeSize={themeSize} />
      {musicNodes.map((node, i) => (
        <Circle
          {...node}
          setThemeColor={setThemeColor}
          setThemeOpacity={setThemeOpacity}
          key={i}
          index={i}
          themeColor={themeColor}
          onClick={() => onClick(i)}
        />
      ))}
    </>
  );
};

export default Scene;
