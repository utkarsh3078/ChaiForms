"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "~/hooks/api/auth";
import { Spinner } from "~/components/ui/spinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const isSignedOut = !isLoading && !user;

  useEffect(() => {
    if (isSignedOut) {
      router.replace("/login");
    }
  }, [isSignedOut, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isSignedOut) return null;

  return <>{children}</>;
}
