"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/server/better-auth/client";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const { error } = await authClient.signIn.email({
      email: email,
      password: password,
    });

    setIsPending(false);

    if (error) {
      toast.error(error.message ?? "Email ou mot de passe incorrect !", {
        position: "bottom-right",
      });
      return;
    } else {
      toast.success("Connexion Réussie !", { position: "bottom-right" });
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div>
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border p-6 shadow-sm"
      >
        <h1 className="mb-4 text-center text-2xl font-bold">Se connecter</h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border p-2"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border p-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-primary mt-2 rounded p-2 text-white disabled:bg-gray-400"
        >
          {isPending ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <Link
          href="/inscription"
          className="text-primary text-sm hover:underline"
        >
          Vous ne possédez pas de compte ?
        </Link>
      </div>
    </div>
  );
}
