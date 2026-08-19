import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Clock, FileText, Plus, Settings } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useDas } from "@/hooks/useDas";
import { formatCurrency, formatDate } from "@/lib/storage";
import { openArquivo } from "@/lib/arquivos-storage";
import { labelMesReferencia } from "@/types/das";

export const Route = createFileRoute("/ajustes")({
  head: () => ({
    meta: [
      { title: "Ajustes — MEI Finanças" },
      {
        name: "description",
        content: "Histórico do DAS e preferências do app MEI Finanças.",
      },
      { property: "og:title", content: "Ajustes — MEI Finanças" },
      {
        property: "og:description",
        content: "Histórico do DAS e preferências do app MEI Finanças.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { hydrated, registros, setStatus } = useDas();

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col px-4 pt-6 pb-6">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Ajustes
      </h1>
      <p className="text-sm text-muted-foreground">
        Personalize limites, notificações e perfil.
      </p>

      <section className="mt-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Histórico DAS</h2>
          <Link
            to="/lancamentos/novo"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            <Plus className="h-4 w-4" />
            Registrar
          </Link>
        </div>

        {!hydrated ? null : registros.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma guia DAS registrada ainda.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {registros.map((das) => (
              <li
                key={das.id}
                className="rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium capitalize text-foreground">
                      {labelMesReferencia(das.mesReferencia)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vencimento {formatDate(das.dataVencimento)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatCurrency(das.valor)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      das.status === "pago"
                        ? "bg-success/15 text-success"
                        : "bg-warning/15 text-warning-foreground"
                    }`}
                  >
                    {das.status === "pago" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                    {das.status === "pago" ? "Pago" : "Pendente"}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {das.arquivoId && (
                    <button
                      type="button"
                      onClick={() => void openArquivo(das.arquivoId as string)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Comprovante
                    </button>
                  )}
                  {das.status === "pendente" && (
                    <button
                      type="button"
                      onClick={() => setStatus(das.id, "pago")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Marcar como pago
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card">
        <EmptyState
          icon={Settings}
          title="Mais ajustes em breve"
          description="Essa área receberá configurações de perfil e notificações."
        />
      </div>
    </div>
  );
}
