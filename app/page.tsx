import { GameProvider } from "@/lib/game-context";
import GameShell from "@/components/GameShell";

export default function Page() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  );
}
