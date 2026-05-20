"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { isStaffRole } from "@/lib/auth/roles";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/connexion");
      } else if (!isStaffRole(session.user.role_id)) {
        router.push("/tableau-de-bord");
      }
    }
  }, [session, isPending, router]);

  if (isPending || !isStaffRole(session?.user.role_id)) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="text-primary mb-4 h-10 w-10 animate-spin" />
        <p className="text-muted-foreground font-medium">
          Vérification des accès sécurisés...
        </p>
      </div>
    );
  }

  return (
    <div className="dark:bg-background min-h-screen bg-slate-50">
      <main className="w-full">{children}</main>
    </div>
  );
}
