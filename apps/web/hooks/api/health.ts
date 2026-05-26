import { trpc } from "~/trpc/client";

export function useHealth() {
  const { data, error, isFetched, isLoading, status } = trpc.health.getHealth.useQuery(); // either useQuery or mutation

  return {
    data,
    error,
    isFetched,
    isLoading,
    status,
  };
}
