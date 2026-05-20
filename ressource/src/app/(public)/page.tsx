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
  BookOpen,
  HeartHandshake,
  PenLine,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <section className="from-secondary/20 to-background w-full bg-gradient-to-b px-4 py-24 text-center md:px-8 lg:py-32">
        <div className="animate-in fade-in slide-in-from-bottom-4 container mx-auto max-w-4xl space-y-8 duration-1000">
          <h1 className="text-foreground text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Cultivez la <span className="text-primary">qualité</span> de vos
            relations
          </h1>

          <p className="text-muted-foreground mx-auto max-w-2xl text-lg font-medium sm:text-xl">
            (RE)Sources Relationnelles est une plateforme citoyenne dédiée à
            l'épanouissement personnel. Explorez, partagez et enrichissez vos
            liens au quotidien pour une meilleure qualité de vie.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link href="/catalogue">
              <Button
                size="lg"
                className="w-full rounded-full text-base shadow-lg transition-all hover:shadow-xl sm:w-auto"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Explorer le catalogue
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-primary/20 hover:bg-primary/5 w-full rounded-full text-base transition-all sm:w-auto"
              >
                Rejoindre la communauté
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-16 md:px-8">
        <div className="bg-primary/5 border-primary/10 container mx-auto max-w-3xl rounded-2xl border p-8 text-center md:p-12">
          <h2 className="text-foreground mb-6 text-2xl font-bold">
            Au cœur de nos besoins fondamentaux
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed font-medium">
            D'après la pyramide de Maslow, nos besoins se structurent jusqu'à
            notre accomplissement personnel[cite: 14]. Le levier le plus
            puissant pour y parvenir reste la qualité de nos relations aux
            autres : famille, amis, collègues. C'est toute la mission de cette
            plateforme.
          </p>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16 md:px-8 lg:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-foreground text-3xl font-black">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-muted-foreground mt-4 text-lg font-medium">
            Une boîte à outils complète et participative pour vos relations.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card/50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <CardHeader>
              <div className="bg-primary/10 text-primary mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">Consultation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80 text-base font-medium">
                Accédez librement à des ressources de différents types [cite:
                21] pour améliorer vos relations familiales, amicales ou
                professionnelles.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <CardHeader>
              <div className="bg-secondary/30 text-secondary-foreground mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl">
                <BookOpen className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">
                Catalogue Dynamique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80 text-base font-medium">
                Filtrez facilement les contenus par type (vidéos, articles,
                jeux) et trouvez exactement ce qui correspond à votre
                besoin[cite: 22].
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <CardHeader>
              <div className="bg-primary/10 text-primary mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl">
                <PenLine className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">
                Création & Partage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80 text-base font-medium">
                Devenez acteur de la communauté. Créez vos propres ressources,
                partagez vos expériences et échangez avec les autres
                citoyens[cite: 23].
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <CardHeader>
              <div className="bg-secondary/30 text-secondary-foreground mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl">
                <BarChart3 className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/80 text-base font-medium">
                Consultez les statistiques en rapport aux ressources à
                disposition (consultations, recherches, partages)[cite: 24].
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
