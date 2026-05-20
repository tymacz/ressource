"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, Wind } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Preset = {
  id: "748" | "55" | "46";
  label: string;
  inspiration: number;
  apnee: number;
  expiration: number;
};

const presets: Preset[] = [
  { id: "748", label: "7-4-8", inspiration: 7, apnee: 4, expiration: 8 },
  { id: "55", label: "5-5", inspiration: 5, apnee: 0, expiration: 5 },
  { id: "46", label: "4-6", inspiration: 4, apnee: 0, expiration: 6 },
];

const defaultPreset = presets[0]!;

function getPhases(preset: Preset) {
  return [
    { label: "Inspirez", duration: preset.inspiration },
    ...(preset.apnee > 0 ? [{ label: "Retenez", duration: preset.apnee }] : []),
    { label: "Expirez", duration: preset.expiration },
  ];
}

export default function RespirationPage() {
  const [selectedPreset, setSelectedPreset] = useState<Preset>(defaultPreset);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(selectedPreset.inspiration);
  const [isRunning, setIsRunning] = useState(false);

  const phases = useMemo(() => getPhases(selectedPreset), [selectedPreset]);
  const phase = phases[phaseIndex] ?? phases[0];

  useEffect(() => {
    setPhaseIndex(0);
    setRemaining(getPhases(selectedPreset)[0]?.duration ?? 0);
    setIsRunning(false);
  }, [selectedPreset]);

  useEffect(() => {
    if (!isRunning || !phase) return;

    const timeout = window.setTimeout(() => {
      if (remaining > 1) {
        setRemaining(remaining - 1);
        return;
      }

      const nextIndex = (phaseIndex + 1) % phases.length;
      setPhaseIndex(nextIndex);
      setRemaining(phases[nextIndex]?.duration ?? 0);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [isRunning, phase, phaseIndex, phases, remaining]);

  const reset = () => {
    setIsRunning(false);
    setPhaseIndex(0);
    setRemaining(phases[0]?.duration ?? 0);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:px-8">
      <div className="mb-10 max-w-3xl">
        <div className="bg-primary/10 text-primary mb-4 inline-flex rounded-full p-3">
          <Wind className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-foreground text-4xl font-black">
          Exercice de respiration
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Choisissez un rythme de cohérence cardiaque, lancez l'exercice et
          suivez les phases affichées à l'écran.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Rythme</CardTitle>
            <CardDescription>
              Les trois presets correspondent au sujet CESIZen.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {presets.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant={
                  selectedPreset.id === preset.id ? "default" : "outline"
                }
                onClick={() => setSelectedPreset(preset)}
                aria-pressed={selectedPreset.id === preset.id}
                className="justify-start"
              >
                {preset.label}
                <span className="ml-2 text-xs opacity-80">
                  {preset.inspiration}s / {preset.apnee}s / {preset.expiration}s
                </span>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session guidée</CardTitle>
            <CardDescription>
              L'annonce de phase est exposée aux lecteurs d'écran.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="bg-secondary/10 flex min-h-72 flex-col items-center justify-center rounded-lg border p-8 text-center"
              aria-live="polite"
            >
              <p className="text-primary text-2xl font-bold">{phase?.label}</p>
              <p className="text-foreground mt-4 text-7xl font-black">
                {remaining}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">secondes</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => setIsRunning((value) => !value)}
              >
                {isRunning ? (
                  <Pause className="mr-2 h-4 w-4" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isRunning ? "Mettre en pause" : "Démarrer"}
              </Button>
              <Button type="button" variant="outline" onClick={reset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
