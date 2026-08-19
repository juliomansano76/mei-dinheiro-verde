import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — MEI Finanças" },
      {
        name: "description",
        content: "Visualize relatórios financeiros do seu MEI.",
      },
      { property: "og:title", content: "Relatórios — MEI Finanças" },
      {
        property: "og:description",
        content: "Visualize relatórios financeiros do seu MEI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col px-4 pt-6">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Relatórios
      </h1>
      <p className="text-sm text-muted-foreground">
        Acompanhe evolução mensal, anual e projeções.
      </p>
      <div className="mt-8 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card">
        <EmptyState
          icon={BarChart3}
          title="Nenhum relatório disponível"
          description="Com mais lançamentos, você verá gráficos e análises aqui."
        />
      </div>
    </div>
  );
}
