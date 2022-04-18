import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Filter, Player } from "tone";
import AudioEnergy, { FrequencyNames } from "./AudioEnergy";
import Scene from "./components/Scene";

export const DEFAULT_FADE = "0.5s";

export const COLORS = {
  black: "#000000",
  gold: "#ebb134",
  purple: "#e731ce",
  green: "#30f8a0",
  red: "#f93b3b",
  orange: "#fe7418",
  blue: "#497fff",
  pink: "#f93b3b",
};

export interface MusicNodeData {
  radius: number;
  color: string;
  analyser: AudioEnergy;
  player: Player;
  filter: Filter;
}

export const musicNodes: MusicNodeData[] = [
  {
    radius: 0.6,
    color: COLORS.black,
    analyser: new AudioEnergy(),
    filter: new Filter(200, "lowpass"),
    player: new Player({
      url: `${process.env.PUBLIC_URL}/audio/pad.mp3`,
      fadeIn: 0,
    }),
  },
  {
    radius: 0.9,
    color: COLORS.orange,
    analyser: new AudioEnergy(),
    filter: new Filter(200, "lowpass"),
    player: new Player({
      url: `${process.env.PUBLIC_URL}/audio/pluck.mp3`,
      fadeIn: 0,
    }),
  },
  {
    radius: 1.2,
    color: COLORS.blue,
    analyser: new AudioEnergy(),
    filter: new Filter(200, "lowpass"),
    player: new Player({
      url: `${process.env.PUBLIC_URL}/audio/sticks.mp3`,
      fadeIn: 0,
    }),
  },
  {
    radius: 1.5,
    color: COLORS.green,
    analyser: new AudioEnergy(),
    filter: new Filter(200, "lowpass"),
    player: new Player({
      url: `${process.env.PUBLIC_URL}/audio/kick.mp3`,
      fadeIn: 0,
    }),
  },
  {
    radius: 1.8,
    color: COLORS.red,
    analyser: new AudioEnergy(),
    filter: new Filter(200, "lowpass"),
    player: new Player({
      url: `${process.env.PUBLIC_URL}/audio/clap.mp3`,
      fadeIn: 0,
    }),
  },
];

const App = () => (
  <Canvas shadows>
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  </Canvas>
);

export default App;
