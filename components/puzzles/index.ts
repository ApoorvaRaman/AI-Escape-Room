import type { ComponentType } from "react";
import type { PuzzleProps } from "@/lib/types";
import Stage1Logic from "./Stage1Logic";
import Stage2DataDetective from "./Stage2DataDetective";
import Stage3MLChallenge from "./Stage3MLChallenge";
import Stage4Cryptography from "./Stage4Cryptography";
import Stage5DebugModel from "./Stage5DebugModel";
import Stage6DataViz from "./Stage6DataViz";
import Stage7Ethics from "./Stage7Ethics";
import Stage8FinalEscape from "./Stage8FinalEscape";

export const PUZZLES: ComponentType<PuzzleProps>[] = [
  Stage1Logic,
  Stage2DataDetective,
  Stage3MLChallenge,
  Stage4Cryptography,
  Stage5DebugModel,
  Stage6DataViz,
  Stage7Ethics,
  Stage8FinalEscape,
];
