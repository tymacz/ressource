import { AlertCircle, BookOpen, HeartPulse, ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sections = [
  {
    title: "Comprendre le stress",
    icon: HeartPulse,
    content:
      "Le stress est une réaction naturelle face à une situation perçue comme exigeante ou menaçante. Il devient problématique lorsqu'il se prolonge, se répète ou empêche le repos.",
  },
  {
    title: "Repérer les signaux",
    icon: AlertCircle,
    content:
      "Fatigue persistante, irritabilité, troubles du sommeil, difficultés de concentration ou tensions corporelles sont des signaux qui invitent à ralentir et à demander de l'aide si nécessaire.",
  },
  {
    title: "Prévenir au quotidien",
    icon: ShieldCheck,
    content:
      "Des habitudes simples aident à réduire la charge mentale : respiration, pauses régulières, activité physique douce, sommeil régulier et maintien du lien social.",
  },
];

export default function InformationsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:px-8">
      <div className="mb-10 max-w-3xl">
        <div className="bg-primary/10 text-primary mb-4 inline-flex rounded-full p-3">
          <BookOpen className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-foreground text-4xl font-black">
          Informations santé mentale
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Cette page répond au module obligatoire d'information : elle donne un
          premier niveau de repères sur la santé mentale, la prévention et la
          gestion du stress.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <section.icon
                className="text-primary mb-2 h-6 w-6"
                aria-hidden="true"
              />
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                {section.content}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="bg-card mt-10 rounded-lg border p-6">
        <h2 className="text-foreground text-2xl font-bold">
          Limite importante
        </h2>
        <p className="text-muted-foreground mt-3">
          CESIZen ne remplace pas un avis médical. En cas de détresse, de danger
          immédiat ou de symptômes persistants, il faut contacter un
          professionnel de santé ou les services d'urgence.
        </p>
      </section>
    </div>
  );
}
