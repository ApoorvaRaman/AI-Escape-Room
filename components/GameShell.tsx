"use client";

import { useState } from "react";
import { useGame } from "@/lib/game-context";
import AssistantConsole from "./AssistantConsole";
import BottomPanel from "./BottomPanel";
import EndScreen from "./EndScreen";
import Header from "./Header";
import PuzzleCanvas from "./PuzzleCanvas";
import StartScreen from "./StartScreen";

export default function GameShell() {
  const { state } = useGame();
  const [panelOpen, setPanelOpen] = useState(false);
  const [tab, setTab] = useState<"summary" | "leaderboard">("summary");

  const openLeaderboard = () => { setTab("leaderboard"); setPanelOpen(true); };

  if (state.status === "idle") {
    return (
      <>
        <StartScreen onOpenLeaderboard={openLeaderboard} />
        <BottomPanel open={panelOpen} onOpenChange={setPanelOpen} initialTab={tab} />
      </>
    );
  }

  if (state.status === "won" || state.status === "lost") {
    return (
      <>
        <EndScreen onOpenLeaderboard={openLeaderboard} />
        <BottomPanel open={panelOpen} onOpenChange={setPanelOpen} initialTab={tab} />
      </>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Header onOpenLeaderboard={openLeaderboard} />
      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-5">
        <div className="lg:col-span-3"><PuzzleCanvas /></div>
        <div className="lg:col-span-2"><AssistantConsole /></div>
      </main>
      <BottomPanel open={panelOpen} onOpenChange={setPanelOpen} initialTab={tab} />
    </div>
  );
}
