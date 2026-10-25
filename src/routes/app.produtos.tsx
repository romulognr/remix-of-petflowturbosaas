import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/app/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — PetFlow AI" },
      { name: "description", content: "Cadastro de produtos e controle de estoque." },
    ],
  }),
  component: ProdutosPage,
});

const EMPTY = { id: "", name: "", category: "", sku: "", barcode: "", cost_price: "", sale_price: "", stock_quantity: "0", min_stock_alert: "5", unit: "un" };

function ProdutosPage() {
  const { data: company } = useCurrentCompany();
  const companyId = company?.id;
  const qc = useQueryClient();
  const [f, setF] = useState(EMPTY);

  const products = useQuery({
    queryKey: ["products", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("company_id", companyId!).order("name");
      return data ?? [];
    },
  });

  const save = async () => {
    if (!companyId || !f.name.trim()) return toast.error("Informe o nome do produto");
    const payload = {
      company_id: companyId,
      name: f.name.trim(),
      category: f.category || null,
      sku: f.sku || null,
      barcode: f.barcode || null,
      cost_price: f.cost_price ? Number(f.cost_price) : null,
      sale_price: f.sale_price ? Number(f.sale_price) : null,
      price: f.sale_price ? Number(f.sale_price) : null,
      stock_quantity: Number(f.stock_quantity || 0),
      min_stock_alert: f.min_stock_alert ? Number(f.min_stock_alert) : null,
      unit: f.unit || "un",
    };
    const { error } = f.id
      ? await supabase.from("products").update(payload).eq("id", f.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(f.id ? "Produto atualizado" : "Produto cadastrado");
    setF(EMPTY);
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const toggle = async (p: any) => {
    await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const field = (k: keyof typeof EMPTY, label: string, type = "text") => (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Produtos" description="Cadastre produtos vendidos no PDV e acompanhe o estoque" />
      <Card>
        <CardHeader><CardTitle className="text-base">{f.id ? "Editar produto" : "Novo produto"}</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">{field("name", "Nome")}</div>
          {field("category", "Categoria")}
          {field("unit", "Unidade")}
          {field("sku", "Código (SKU)")}
          {field("barcode", "Código de barras")}
          {field("cost_price", "Preço de custo", "number")}
          {field("sale_price", "Preço de venda", "number")}
          {field("stock_quantity", "Estoque", "number")}
          {field("min_stock_alert", "Estoque mínimo", "number")}
          <div className="md:col-span-2 flex items-end gap-2">
            <Button onClick={save}>{f.id ? "Salvar" : "Cadastrar"}</Button>
            {f.id && <Button variant="outline" onClick={() => setF(EMPTY)}>Cancelar</Button>}
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={products.data ?? []}
        searchableKeys={["name", "category", "sku", "barcode"]}
        emptyMessage="Nenhum produto cadastrado."
        columns={[
          { key: "name", header: "Produto" },
          { key: "category", header: "Categoria" },
          { key: "sale_price", header: "Preço", render: (p: any) => formatBRL(p.sale_price ?? p.price) },
          {
            key: "stock_quantity", header: "Estoque",
            render: (p: any) => (
              <span className="flex items-center gap-2">
                {p.stock_quantity} {p.unit}
                {p.stock_quantity <= (p.min_stock_alert ?? 0) && <Badge variant="destructive">Baixo</Badge>}
              </span>
            ),
          },
          { key: "active", header: "Status", render: (p: any) => <Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Ativo" : "Inativo"}</Badge> },
          {
            key: "actions", header: "",
            render: (p: any) => (
              <div className="flex gap-1 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setF({
                  id: p.id, name: p.name, category: p.category ?? "", sku: p.sku ?? "", barcode: p.barcode ?? "",
                  cost_price: p.cost_price?.toString() ?? "", sale_price: (p.sale_price ?? p.price)?.toString() ?? "",
                  stock_quantity: String(p.stock_quantity), min_stock_alert: p.min_stock_alert?.toString() ?? "", unit: p.unit ?? "un",
                })}>Editar</Button>
                <Button size="sm" variant="ghost" onClick={() => toggle(p)}>{p.active ? "Desativar" : "Ativar"}</Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
