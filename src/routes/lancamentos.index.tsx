import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowDownRight, ArrowUpRight, Plus, Receipt } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useLancamentos } from "@/hooks/useLancamentos";
import { formatCurrency } from "@/lib/storage";

export const Route = createFileRoute("/lancamentos/")({
  head: () => ({
    meta: [
      { title: "Lançamentos — MEI Finanças" },
      {
        name: "description",
        content: "Registre e acompanhe suas receitas e despesas do mês.",
      },
      { property: "og:title", content: "Lançamentos — MEI Finanças" },
      {
        property: "og:description",
        content: "Registre e acompanhe suas receitas e despesas do mês.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { hydrated, groupedByDate, receitasMes, despesasMes } = useLancamentos();

  const monthLabel = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] flex-col px-4 pt-6">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Lançamentos
      </h1>
      <p className="text-sm capitalize text-muted-foreground">{monthLabel}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-medium text-muted-foreground">Receitas</p>
          <p className="mt-1 text-sm font-semibold text-success">
            {hydrated ? formatCurrency(receitasMes) : "R$ —"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-medium text-muted-foreground">Despesas</p>
          <p className="mt-1 text-sm font-semibold text-destructive">
            {hydrated ? formatCurrency(despesasMes) : "R$ —"}
          </p>
        </div>
      </div>

      {hydrated && groupedByDate.length === 0 ? (
        <div className="mt-6 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card">
          <EmptyState
            icon={Receipt}
            title="Nenhum lançamento neste mês"
            description="Cadastre receitas e despesas para acompanhar seu fluxo de caixa."
            action={
              <Link
                to="/lancamentos/novo"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Novo lançamento
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-5 pb-4">
          {groupedByDate.map(([data, items]) => (
            <section key={data} className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {format(parseISO(data), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h2>
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          item.tipo === "receita"
                            ? "bg-success/15 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {item.tipo === "receita" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.categoria}
                        </p>
                        {item.descricao ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {item.descricao}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-semibold ${
                        item.tipo === "receita" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {item.tipo === "receita" ? "+" : "-"}
                      {formatCurrency(item.valor)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Link
        to="/lancamentos/novo"
        aria-label="Novo lançamento"
        className="fixed bottom-24 right-[max(1rem,calc(50%-13rem))] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
