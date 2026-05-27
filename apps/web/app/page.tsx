"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { useUser } from "~/hooks/api/auth";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user.id) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user && user.id) return null;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold">ChaiForms</h1>
        <p className="text-lg text-muted-foreground">
          ChaiForms lets you create, share and collect responses from custom forms quickly and
          securely. Build surveys, feedback forms, and registration pages with an intuitive builder
          — then share a public link to start collecting responses.
        </p>

        <div className="text-left">
          <ul className="list-disc ml-6 space-y-2 text-sm">
            <li>Create customizable forms with fields (text, email, number, date, yes/no).</li>
            <li>Share forms publicly and collect submissions in real time.</li>
            <li>Manage your forms from a simple dashboard and export responses.</li>
          </ul>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">Sign up</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
