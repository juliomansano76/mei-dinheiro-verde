import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  ClipboardList,
  FileText,
  Loader2,
  Paperclip,
  Plus,
  Upload,
} from "lucide-react";
import { useLancamentos } from "@/hooks/useLancamentos";
import { useDas } from "@/hooks/useDas";
import { maskCurrencyInput, parseCurrencyInput } from "@/lib/lancamentos-storage";
import { saveArquivo } from "@/lib/arquivos-storage";
import { categoriasPorTipo, type LancamentoTipo } from "@/types/lancamento";
import { MESES, vencimentoDoMes, type DasStatus } from "@/types/das";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lancamentos/novo")({
  head: () => ({
    meta: [
      { title: "Novo Lançamento — MEI Finanças" },
      {
        name: "description",
        content: "Cadastre receitas, despesas, notas fiscais e guias DAS do seu MEI.",
      },
      { property: "og:title", content: "Novo Lançamento — MEI Finanças" },
      {
        property: "og:description",
        content: "Cadastre receitas, despesas, notas fiscais e guias DAS do seu MEI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NovoLancamento,
});

type Modo = "manual" | "nf" | "das";

const ACCEPT = "application/pdf,image/*";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const fieldClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary";

function NovoLancamento() {
  const navigate = useNavigate();
  const { add } = useLancamentos();
  const { add: addDasRegistro } = useDas();

  const [modo, setModo] = useState<Modo>("manual");

  // manual / NF
  const [tipo, setTipo] = useState<LancamentoTipo>("receita");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [data, setData] = useState(todayISO());
  const [descricao, setDescricao] = useState("");
  const [errors, setErrors] = useState<{ valor?: string; categoria?: string; data?: string; arquivo?: string }>({});

  // arquivos
  const [nfFile, setNfFile] = useState<{ id: string; nome: string } | null>(null);
  const [dasFile, setDasFile] = useState<{ id: string; nome: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const nfInputRef = useRef<HTMLInputElement>(null);
  const dasInputRef = useRef<HTMLInputElement>(null);

  // DAS
  const hoje = new Date();
  const [dasMes, setDasMes] = useState(String(hoje.getMonth() + 1).padStart(2, "0"));
  const [dasAno, setDasAno] = useState(String(hoje.getFullYear()));
  const [dasValor, setDasValor] = useState("");
  const [dasStatus, setDasStatus] = useState<DasStatus>("pendente");
  const [dasErrors, setDasErrors] = useState<{ valor?: string }>({});

  const categorias = categoriasPorTipo(tipo);

  const handleTipo = (next: LancamentoTipo) => {
    setTipo(next);
    setCategoria("");
  };

  const trocarModo = (next: Modo) => {
    setModo(next);
    setErrors({});
    setDasErrors({});
    if (next === "nf") {
      setTipo("receita");
      setCategoria("Serviços Prestados");
      setData(todayISO());
    }
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "nf" | "das",
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const id = await saveArquivo(file);
      const info = { id, nome: file.name };
      if (target === "nf") {
        setNfFile(info);
        setErrors(({ arquivo: _omit, ...rest }) => rest);
      } else {
        setDasFile(info);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNumero = parseCurrencyInput(valor);
    const next: typeof errors = {};
    if (valorNumero <= 0) next.valor = "Informe um valor maior que zero.";
    if (!categoria) next.categoria = "Selecione uma categoria.";
    if (!data) next.data = "Informe a data.";
    if (modo === "nf" && !nfFile) next.arquivo = "Envie o PDF ou a imagem da nota fiscal.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    add({
      tipo: modo === "nf" ? "receita" : tipo,
      valor: valorNumero,
      categoria,
      data,
      descricao: descricao.trim(),
      arquivoId: modo === "nf" ? (nfFile?.id ?? null) : null,
    });
    navigate({ to: "/lancamentos" });
  };

  const handleDasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNumero = parseCurrencyInput(dasValor);
    if (valorNumero <= 0) {
      setDasErrors({ valor: "Informe o valor do DAS." });
      return;
    }
    setDasErrors({});
    const mesReferencia = `${dasAno}-${dasMes}`;
    addDasRegistro({
      mesReferencia,
      valor: valorNumero,
      status: dasStatus,
      dataVencimento: vencimentoDoMes(mesReferencia),
      arquivoId: dasFile?.id ?? null,
    });
    navigate({ to: "/ajustes" });
  };

  const anos = [hoje.getFullYear() - 1, hoje.getFullYear(), hoje.getFullYear() + 1];

  const modos: { key: Modo; label: string; icon: typeof Plus }[] = [
    { key: "manual", label: "Manual", icon: Plus },
    { key: "nf", label: "Nota Fiscal", icon: FileText },
    { key: "das", label: "DAS", icon: ClipboardList },
  ];

  return (
    <div className="flex flex-col px-4 pt-6 pb-6">
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

      <div className="mt-5 grid grid-cols-3 gap-2">
        {modos.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => trocarModo(key)}
            aria-pressed={modo === key}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition-all duration-300",
              modo === key
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </button>
        ))}
      </div>

      <div key={modo} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {modo === "das" ? (
          <form onSubmit={handleDasSubmit} className="mt-6 flex flex-col gap-5">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground">Guia DAS</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Anexe o boleto (PDF ou imagem) e registre o pagamento.
              </p>
              <input
                ref={dasInputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => handleUpload(e, "das")}
              />
              <button
                type="button"
                onClick={() => dasInputRef.current?.click()}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-3 py-2.5 text-sm font-semibold text-primary"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {dasFile ? "Trocar arquivo" : "Registrar DAS"}
              </button>
              {dasFile && (
                <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                  <Paperclip className="h-3.5 w-3.5 shrink-0" />
                  {dasFile.nome}
                </p>
              )}
            </div>

            <div>
              <span className="text-sm font-medium text-foreground">Mês de referência</span>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <select
                  aria-label="Mês"
                  value={dasMes}
                  onChange={(e) => setDasMes(e.target.value)}
                  className={fieldClass}
                >
                  {MESES.map((m, i) => (
                    <option key={m} value={String(i + 1).padStart(2, "0")}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Ano"
                  value={dasAno}
                  onChange={(e) => setDasAno(e.target.value)}
                  className={fieldClass}
                >
                  {anos.map((a) => (
                    <option key={a} value={String(a)}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="dasValor" className="text-sm font-medium text-foreground">
                Valor do DAS
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 focus-within:border-primary">
                <span className="text-sm font-medium text-muted-foreground">R$</span>
                <input
                  id="dasValor"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={dasValor}
                  onChange={(e) => setDasValor(maskCurrencyInput(e.target.value))}
                  className="w-full bg-transparent text-base font-semibold text-foreground outline-none"
                />
              </div>
              {dasErrors.valor && (
                <p className="mt-1 text-xs text-destructive">{dasErrors.valor}</p>
              )}
            </div>

            <div>
              <span className="text-sm font-medium text-foreground">Status</span>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDasStatus("pago")}
                  aria-pressed={dasStatus === "pago"}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
                    dasStatus === "pago"
                      ? "border-success bg-success/10 text-success"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  Pago
                </button>
                <button
                  type="button"
                  onClick={() => setDasStatus("pendente")}
                  aria-pressed={dasStatus === "pendente"}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
                    dasStatus === "pendente"
                      ? "border-warning bg-warning/10 text-warning-foreground"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  Pendente
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-1 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.99]"
            >
              Salvar DAS
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            {modo === "nf" ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">Nota fiscal</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Envie o PDF ou tire uma foto da NF. O lançamento será uma receita.
                </p>
                <input
                  ref={nfInputRef}
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={(e) => handleUpload(e, "nf")}
                />
                <button
                  type="button"
                  onClick={() => nfInputRef.current?.click()}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-3 py-2.5 text-sm font-semibold text-primary"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {nfFile ? "Trocar arquivo" : "Enviar NF"}
                </button>
                {nfFile && (
                  <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <Paperclip className="h-3.5 w-3.5 shrink-0" />
                    {nfFile.nome}
                  </p>
                )}
                {errors.arquivo && (
                  <p className="mt-2 text-xs text-destructive">{errors.arquivo}</p>
                )}
              </div>
            ) : (
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
            )}

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
              {errors.data && <p className="mt-1 text-xs text-destructive">{errors.data}</p>}
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
        )}
      </div>
    </div>
  );
}
