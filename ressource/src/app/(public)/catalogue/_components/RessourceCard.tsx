import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, LockKeyhole, Tag, User } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RessourceCardProps {
  id: string;
  titre: string;
  nomAuteur: string;
  libelleCategorie: string;
  libelleRelation?: string;
  libelleType?: string;
  dateCreation: Date;
  visibilite?: "PUBLIQUE" | "PARTAGEE" | "PRIVEE";
}

export function RessourceCard({
  id,
  titre,
  nomAuteur,
  libelleCategorie,
  libelleRelation,
  libelleType,
  dateCreation,
  visibilite = "PUBLIQUE",
}: RessourceCardProps) {
  return (
    <Link href={`/ressources/${id}`} className="group block h-full">
      <Card className="hover:border-primary/50 flex h-full flex-col transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="mb-2 flex items-start justify-between gap-4">
            <Badge
              variant="secondary"
              className="bg-secondary/20 text-secondary-foreground"
            >
              {libelleCategorie}
            </Badge>

            {visibilite === "PARTAGEE" && (
              <Badge
                variant="outline"
                className="border-border/50 text-muted-foreground flex items-center gap-1"
              >
                <LockKeyhole className="h-3 w-3" />
                Partagée
              </Badge>
            )}
          </div>
          <CardTitle className="group-hover:text-primary line-clamp-2 text-xl transition-colors">
            {titre}
          </CardTitle>
        </CardHeader>

        <CardContent className="grow">
          <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
            {libelleRelation && (
              <span className="bg-muted inline-flex items-center gap-1 rounded-md px-2 py-1">
                <Tag className="h-3 w-3" />
                {libelleRelation}
              </span>
            )}
            {libelleType && (
              <span className="bg-muted rounded-md px-2 py-1">
                {libelleType}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-border/50 text-muted-foreground flex items-center justify-between border-t pt-4 text-sm">
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span className="max-w-[120px] truncate">{nomAuteur}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{format(dateCreation, "d MMM yyyy", { locale: fr })}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
