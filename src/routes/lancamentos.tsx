import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/lancamentos")({
  head: () => ({
    meta: [
      { title: "Lançamentos — MEI Finanças" },
      {
        name: "description",
        content: "Registre e acompanhe suas receitas e despesas.",
      },
      { property: "og:title", content: "Lançamentos — MEI Finanças" },
      {
        property: "og:description",
        content: "Registre e acompanhe suas receitas e despesas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col px-4 pt-6">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Lançamentos
      </h1>
      <p className="text-sm text-muted-foreground">
        Controle todas as entradas e saídas do seu MEI.
      </p>
      <div className="mt-8 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card">
        <EmptyState
          icon={Receipt}
          title="Nenhum lançamento ainda"
          description="Cadastre receitas e despesas para acompanhar seu fluxo de caixa."
        />
      </div>
    </div>
  );
}
