import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useLancamentos } from "@/hooks/useLancamentos";
import { maskCurrencyInput, parseCurrencyInput } from "@/lib/lancamentos-storage";
import { categoriasPorTipo, type LancamentoTipo } from "@/types/lancamento";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lancamentos/novo")({
  head: () => ({
    meta: [
      { title: "Novo Lançamento — MEI Finanças" },
      {
        name: "description",
        content: "Cadastre uma nova receita ou despesa do seu MEI.",
      },
      { property: "og:title", content: "Novo Lançamento — MEI Finanças" },
      {
        property: "og:description",
        content: "Cadastre uma nova receita ou despesa do seu MEI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NovoLancamento,
});

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function NovoLancamento() {
  const navigate = useNavigate();
  const { add } = useLancamentos();

  const [tipo, setTipo] = useState<LancamentoTipo>("receita");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [data, setData] = useState(todayISO());
  const [descricao, setDescricao] = useState("");
  const [errors, setErrors] = useState<{ valor?: string; categoria?: string; data?: string }>({});

  const categorias = categoriasPorTipo(tipo);

  const handleTipo = (next: LancamentoTipo) => {
    setTipo(next);
    setCategoria("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNumero = parseCurrencyInput(valor);
    const next: { valor?: string; categoria?: string; data?: string } = {};
    if (valorNumero <= 0) next.valor = "Informe um valor maior que zero.";
    if (!categoria) next.categoria = "Selecione uma categoria.";
    if (!data) next.data = "Informe a data.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    add({
      tipo,
      valor: valorNumero,
      categoria,
      data,
      descricao: descricao.trim(),
    });
    navigate({ to: "/lancamentos" });
  };

  const fieldClass =
    "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary";

  return (
    <div className="flex flex-col px-4 pt-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate({ to: "/lancamentos" })}
          aria-label="Voltar"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Novo Lançamento
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <div>
          <span className="text-sm font-medium text-foreground">Tipo</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTipo("receita")}
              aria-pressed={tipo === "receita"}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
                tipo === "receita"
                  ? "border-success bg-success/10 text-success"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              <ArrowUpRight className="h-4 w-4" />
              Receita
            </button>
            <button
              type="button"
              onClick={() => handleTipo("despesa")}
              aria-pressed={tipo === "despesa"}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
                tipo === "despesa"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              <ArrowDownRight className="h-4 w-4" />
              Despesa
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="valor" className="text-sm font-medium text-foreground">
            Valor
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 focus-within:border-primary">
            <span className="text-sm font-medium text-muted-foreground">R$</span>
            <input
              id="valor"
              inputMode="numeric"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(maskCurrencyInput(e.target.value))}
              className="w-full bg-transparent text-base font-semibold text-foreground outline-none"
            />
          </div>
          {errors.valor && (
            <p className="mt-1 text-xs text-destructive">{errors.valor}</p>
          )}
        </div>

        <div>
          <label htmlFor="categoria" className="text-sm font-medium text-foreground">
            Categoria
          </label>
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={cn(fieldClass, "mt-2")}
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.categoria && (
            <p className="mt-1 text-xs text-destructive">{errors.categoria}</p>
          )}
        </div>

        <div>
          <label htmlFor="data" className="text-sm font-medium text-foreground">
            Data
          </label>
          <input
            id="data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className={cn(fieldClass, "mt-2")}
          />
          {errors.data && (
            <p className="mt-1 text-xs text-destructive">{errors.data}</p>
          )}
        </div>

        <div>
          <label htmlFor="descricao" className="text-sm font-medium text-foreground">
            Descrição <span className="text-muted-foreground">(opcional)</span>
          </label>
          <textarea
            id="descricao"
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex.: Serviço de consultoria para cliente X"
            className={cn(fieldClass, "mt-2 resize-none")}
          />
        </div>

        <button
          type="submit"
          className="mt-1 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.99]"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
