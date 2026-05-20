"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { canManageUsers, getRoleLabel } from "@/lib/auth/roles";

export default function AdminDashboardPage() {
  const { data: session } = authClient.useSession();
  const canOpenUsers = canManageUsers(session?.user.role_id);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-primary/10 text-primary rounded-xl p-3">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-foreground text-3xl font-black">
            Espace administration
          </h1>
          <p className="text-muted-foreground">
            Bienvenue, {session?.user.name}. Rôle :{" "}
            {getRoleLabel(session?.user.role_id)}.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <AdminCard
          title="Ressources"
          href="/admin/ressources"
          cta="Modérer"
          icon={BookOpen}
        />

        {canOpenUsers && (
          <AdminCard
            title="Utilisateurs"
            href="/admin/utilisateurs"
            cta="Gérer"
            icon={Users}
          />
        )}

        <AdminCard
          title="Référentiel"
          href="/admin/catalogue"
          cta="Modifier"
          icon={Settings}
        />

        <AdminCard
          title="Statistiques"
          href="/admin/statistiques"
          cta="Analyser"
          icon={BarChart3}
          highlighted
        />

        <AdminCard
          title="Commentaires"
          href="/admin/commentaires"
          cta="Modérer"
          icon={MessageSquare}
        />
      </div>
    </div>
  );
}

type AdminCardProps = {
  title: string;
  href: string;
  cta: string;
  icon: ComponentType<{ className?: string }>;
  highlighted?: boolean;
};

function AdminCard({
  title,
  href,
  cta,
  icon: Icon,
  highlighted = false,
}: AdminCardProps) {
  return (
    <Card
      className={`border-border/50 flex flex-col shadow-sm ${
        highlighted ? "bg-primary/5" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle
          className={`text-sm font-medium ${
            highlighted ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {title}
        </CardTitle>
        <Icon
          className={`h-4 w-4 ${
            highlighted ? "text-primary" : "text-muted-foreground"
          }`}
        />
      </CardHeader>
      <CardContent className="mt-auto flex grow flex-col justify-end pt-4">
        <Button
          asChild
          className="w-full"
          variant={highlighted ? "default" : "outline"}
        >
          <Link href={href}>
            {cta} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
