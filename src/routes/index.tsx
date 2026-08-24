import { createFileRoute } from "@tanstack/react-router";
import { TallyApp } from "@/components/tally-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <TallyApp />;
}
