"use client";
import { api } from "~/trpc/server";
import { useHealth } from "~/hooks/api/health";
import { useUser } from "~/hooks/api/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  // const { status } = await api.health.getHealth.query();
  const { data } = useHealth();
  const { user } = useUser();

  const router = useRouter();

  useEffect(() => {
    if (user && user.id) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [user, router]);
  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        {/* <h1 className="text-3xl">Streamyst - Stream in Style</h1>
        <h2>Server Status: {data?.status}</h2> */}
        <div>{JSON.stringify(user)}</div>
      </div>
    </main>
  );
}

//Output of the above code will be the user information in JSON format, which will be null if the user is not logged in.
//{"id":"6c324f69-249f-4e9e-b3d1-59199f5ac523","email":"test@gmail.com","fullName":"test","profileImageUrl":null}
