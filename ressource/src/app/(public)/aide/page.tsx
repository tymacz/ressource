import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HelpCircle,
  BookOpen,
  UserPlus,
  ShieldAlert,
  Mail,
} from "lucide-react";

export default function AidePage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center pb-16">
      {/* En-tête de la page d'aide */}
      <section className="from-primary/10 to-background w-full bg-gradient-to-b px-4 py-16 text-center md:px-8 lg:py-24">
        <div className="animate-in fade-in slide-in-from-bottom-4 container mx-auto max-w-3xl space-y-6 duration-700">
          <div className="bg-primary/20 text-primary mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="text-foreground text-4xl font-black tracking-tight sm:text-5xl">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg font-medium">
            Retrouvez ici toutes les informations nécessaires pour bien utiliser
            la plateforme (RE)Sources Relationnelles.
          </p>
        </div>
      </section>

      {/* Section FAQ (Foire Aux Questions) */}
      <section className="container mx-auto max-w-5xl px-4 py-12 md:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <div className="mb-2 flex items-center gap-3">
                <BookOpen className="text-primary h-5 w-5" />
                <CardTitle className="text-xl font-bold">
                  Quapos;est-ce que le catalogue ?
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80 text-base leading-relaxed">
                Le catalogue est un espace public où vous pouvez consulter des
                ressources (articles, vidéos, activités) classées par catégories
                pour vous aider à cultiver vos relations. La consultation est
                libre et gratuite pour tous les citoyens.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <div className="mb-2 flex items-center gap-3">
                <UserPlus className="text-primary h-5 w-5" />
                <CardTitle className="text-xl font-bold">
                  Pourquoi créer un compte ?
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80 text-base leading-relaxed">
                Créer un compte vous permet dapos;aller plus loin : vous pourrez
                sauvegarder vos ressources favorites, suivre votre progression,
                interagir avec la communauté via les commentaires et même
                proposer vos propres ressources.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <div className="mb-2 flex items-center gap-3">
                <ShieldAlert className="text-primary h-5 w-5" />
                <CardTitle className="text-xl font-bold">
                  Comment sont modérées les ressources ?
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80 text-base leading-relaxed">
                Chaque ressource proposée par un citoyen passe par une étape de
                validation par notre équipe de modérateurs. Cela garantit un
                espace dapos;échange sain, bienveillant et pertinent pour tous.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <div className="mb-2 flex items-center gap-3">
                <HelpCircle className="text-primary h-5 w-5" />
                <CardTitle className="text-xl font-bold">
                  Japos;ai un problème technique, que faire ?
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80 text-base leading-relaxed">
                Si vous rencontrez un bug ou une difficulté dapos;accès,
                vérifiez dapos;bord que votre navigateur est à jour. Si le
                problème persiste, vous pouvez contacter le support technique.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section Contact */}
      <section className="container mx-auto mt-8 max-w-3xl px-4 text-center md:px-8">
        <div className="bg-secondary/20 border-secondary/30 rounded-2xl border p-8 md:p-12">
          <Mail className="text-secondary-foreground mx-auto mb-4 h-10 w-10" />
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg font-medium">
            Notre équipe dapos;administration est à votre disposition pour toute
            question supplémentaire concernant la plateforme.
          </p>
          <Link href="/">
            <Button size="lg" className="rounded-full shadow-md">
              Retourner à lapos;accueil
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
