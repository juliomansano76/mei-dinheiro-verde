import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/ajustes")({
  head: () => ({
    meta: [
      { title: "Ajustes — MEI Finanças" },
      {
        name: "description",
        content: "Configure preferências do app MEI Finanças.",
      },
      { property: "og:title", content: "Ajustes — MEI Finanças" },
      {
        property: "og:description",
        content: "Configure preferências do app MEI Finanças.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col px-4 pt-6">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Ajustes
      </h1>
      <p className="text-sm text-muted-foreground">
        Personalize limites, notificações e perfil.
      </p>
      <div className="mt-8 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card">
        <EmptyState
          icon={Settings}
          title="Ajustes em breve"
          description="Essa área receberá configurações em uma próxima versão."
        />
      </div>
    </div>
  );
}
