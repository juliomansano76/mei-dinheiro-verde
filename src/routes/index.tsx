import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, ArrowRight, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useLancamentos } from "@/hooks/useLancamentos";
import { formatCurrency, formatDate } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MEI Finanças" },
      {
        name: "description",
        content: "Acompanhe saldo, faturamento e próximos pagamentos do seu MEI.",
      },
      { property: "og:title", content: "Dashboard — MEI Finanças" },
      {
        property: "og:description",
        content: "Acompanhe saldo, faturamento e próximos pagamentos do seu MEI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { userName, annualLimit, dasDueDay } = useFinanceData();
  const {
    hydrated,
    receitasMes: monthlyIncome,
    despesasMes: monthlyExpense,
    saldoMes: monthlyBalance,
    receitaAnual: annualRevenue,
    ultimos: recentTransactions,
  } = useLancamentos();
  const revenueProgress = Math.min((annualRevenue / annualLimit) * 100, 100);

  const monthLabel = format(new Date(), "MMMM", { locale: ptBR });
  const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">
          {capitalizedMonth} de {format(new Date(), "yyyy")}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Olá, {userName}
        </h1>
      </header>

      <section className="relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium opacity-90">Saldo do mês</span>
            <Wallet className="h-5 w-5 opacity-80" />
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {hydrated ? formatCurrency(monthlyBalance) : "R$ —"}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary-foreground/15 p-3">
              <div className="flex items-center gap-1 text-xs font-medium opacity-90">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Receitas
              </div>
              <p className="mt-1 text-sm font-semibold">
                {hydrated ? formatCurrency(monthlyIncome) : "R$ —"}
              </p>
            </div>
            <div className="rounded-xl bg-primary-foreground/15 p-3">
              <div className="flex items-center gap-1 text-xs font-medium opacity-90">
                <ArrowDownRight className="h-3.5 w-3.5" />
                Despesas
              </div>
              <p className="mt-1 text-sm font-semibold">
                {hydrated ? formatCurrency(monthlyExpense) : "R$ —"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Faturamento anual</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {hydrated ? formatCurrency(annualRevenue) : "R$ —"}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}de {formatCurrency(annualLimit)}
              </span>
            </p>
          </div>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            {hydrated ? `${revenueProgress.toFixed(1)}%` : "—%"}
          </span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${hydrated ? revenueProgress : 0}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Limite anual do MEI: R$ 81.000,00
        </p>
      </section>

      <section className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4">
        <div className="mt-0.5 rounded-full bg-warning p-1.5">
          <AlertTriangle className="h-4 w-4 text-warning-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-warning-foreground">DAS vence dia {dasDueDay}</p>
          <p className="mt-0.5 text-xs text-warning-foreground/80">
            Não esqueça de pagar a guia do Simples Nacional até o dia {dasDueDay} deste mês.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Últimos lançamentos</h2>
          <Link
            to="/lancamentos"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Nenhum lançamento registrado.</p>
            <Link
              to="/lancamentos/novo"
              className="mt-2 inline-flex text-sm font-medium text-primary"
            >
              Adicionar primeiro lançamento
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentTransactions.map((transaction) => (
              <li
                key={transaction.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      transaction.tipo === "receita"
                        ? "bg-success/15 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {transaction.tipo === "receita" ? (
                      <ArrowUpRight className="h-4.5 w-4.5" />
                    ) : (
                      <ArrowDownRight className="h-4.5 w-4.5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {transaction.descricao || transaction.categoria}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.data)} · {transaction.categoria}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    transaction.tipo === "receita" ? "text-success" : "text-destructive"
                  }`}
                >
                  {transaction.tipo === "receita" ? "+" : "-"}
                  {formatCurrency(transaction.valor)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
