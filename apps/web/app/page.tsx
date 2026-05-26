"use client";
import { api } from "~/trpc/server";
import { useHealth } from "~/hooks/api/health";

export default function Home() {
  // const { status } = await api.health.getHealth.query();
  const { data } = useHealth();
  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        <h1 className="text-3xl">Streamyst - Stream in Style</h1>
        <h2>Server Status: {data?.status}</h2>
      </div>
    </main>
  );
}
