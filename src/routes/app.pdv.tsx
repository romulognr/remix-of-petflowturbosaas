// src/routes/app.pdv.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Barcode,
  Banknote,
  CalendarCheck2,
  CheckCircle2,
  CreditCard,
  Landmark,
  Package,
  PawPrint,
  Plus,
  QrCode,
  Scissors,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import type { Tables } from '@/integrations/supabase/types'

type CustomerRow = Tables<'customer'>
type ServiceRow = Tables<'service'>
type AppointmentRow = Tables<'appointment'> & {
  pet_name?: string | null
  payment_status?: string | null
}
type ProductRow = {
  id: string
  company_id: string
  name: string
  description?: string | null
  sku?: string | null
  barcode?: string | null
  category?: string | null
  price?: number | null
  sale_price?: number | null
  cost_price?: number | null
  stock_quantity: number
  min_stock_alert?: number | null
  unit?: string | null
  active: boolean
}

const cartItemSchema = z.object({
  uid: z.string(),
  item_type: z.enum(['product', 'service']),
  product_id: z.string().uuid().nullable(),
  service_id: z.string().uuid().nullable(),
  appointment_id: z.string().uuid().nullable(),
  item_name: z.string().min(1),
  code_label: z.string(),
  unit_price: z.number().nonnegative(),
  quantity: z.number().positive(),
})

const checkoutFormSchema = z.object({
  customer_id: z.string().nullable().optional(),
  payment_method: z.enum([
    'pix',
    'cartao_credito',
    'cartao_debito',
    'dinheiro',
    'multiplo',
    'crediario',
  ]),
  discount_amount: z.coerce.number().min(0).default(0),
  amount_paid: z.coerce.number().min(0).default(0),
  notes: z.string().max(500).optional(),
  items: z.array(cartItemSchema).min(1, 'Adicione pelo menos um item ao cupom.'),
})

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

export const Route = createFileRoute('/app/pdv')({
  component: PdvScreen,
})

function PdvScreen() {
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [services, setServices] = useState<ServiceRow[]>([])
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])

  const [activeTab, setActiveTab] = useState<'products' | 'appointments' | 'services'>('products')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [barcodeOrSearch, setBarcodeOrSearch] = useState('')
  const [scanMultiplier, setScanMultiplier] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null)

  const barcodeInputRef = useRef<HTMLInputElement>(null)

  const resolveCompanyId = async (): Promise<string | null> => {
    const { data: rpcId } = await supabase.rpc('current_company_id')
    if (rpcId) return rpcId

    const { data: firstCompany } = await supabase
      .from('company')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    return firstCompany?.id ?? null
  }

  const loadPdvData = useCallback(async () => {
    try {
      const cid = await resolveCompanyId()
      if (!cid) return
      setCompanyId(cid)

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const [productsRes, customersRes, servicesRes, appointmentsRes] = await Promise.all([
        supabase
          .from('products' as any)
          .select('*')
          .eq('company_id', cid)
          .eq('active', true)
          .order('name'),
        supabase
          .from('customer')
          .select('*')
          .eq('company_id', cid)
          .eq('status', 'active')
          .order('name'),
        supabase
          .from('service')
          .select('*')
          .eq('company_id', cid)
          .eq('active', true)
          .order('name'),
        supabase
          .from('appointment')
          .select('*')
          .eq('company_id', cid)
          .gte('scheduled_at', todayStart.toISOString())
          .neq('status', 'cancelado')
          .order('scheduled_at', { ascending: true }),
      ])

      setProducts((productsRes.data as unknown as ProductRow[]) ?? [])
      setCustomers(customersRes.data ?? [])
      setServices(servicesRes.data ?? [])
      setAppointments((appointmentsRes.data as AppointmentRow[]) ?? [])
    } catch (err) {
      console.error('Erro ao carregar PDV:', err)
    }
  }, [])

  useEffect(() => {
    loadPdvData()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadPdvData()
    })
    return () => sub.subscription.unsubscribe()
  }, [loadPdvData])

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema) as any,
    defaultValues: {
      customer_id: null,
      payment_method: 'pix',
      discount_amount: 0,
      amount_paid: 0,
      notes: '',
      items: [],
    },
  })

  const cartItems = form.watch('items')
  const discountAmount = Number(form.watch('discount_amount') || 0)
  const paymentMethod = form.watch('payment_method')
  const amountPaid = Number(form.watch('amount_paid') || 0)

  const getProductUnitPrice = (p: ProductRow) => Number(p.sale_price ?? p.price ?? 0)

  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return ['ALL', ...Array.from(set)]
  }, [products])

  const filteredProducts = useMemo(() => {
    const q = barcodeOrSearch.trim().toLowerCase()
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      return matchesCat && matchesQuery
    })
  }, [products, selectedCategory, barcodeOrSearch])

  const { subtotal, totalAmount, changeAmount } = useMemo(() => {
    const sub = cartItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0)
    const validDiscount = Math.min(sub, Math.max(0, discountAmount))
    const total = Math.max(0, sub - validDiscount)
    const change = paymentMethod === 'dinheiro' ? Math.max(0, amountPaid - total) : 0
    return { subtotal: sub, totalAmount: total, changeAmount: change }
  }, [cartItems, discountAmount, paymentMethod, amountPaid])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const addProductToCart = (product: ProductRow, qty = 1) => {
    const current = form.getValues('items')
    const existingIndex = current.findIndex(
      (i) => i.item_type === 'product' && i.product_id === product.id,
    )

    if (existingIndex > -1) {
      const updated = [...current]
      updated[existingIndex].quantity += qty
      form.setValue('items', updated, { shouldValidate: true })
    } else {
      form.setValue(
        'items',
        [
          ...current,
          {
            uid: crypto.randomUUID(),
            item_type: 'product',
            product_id: product.id,
            service_id: null,
            appointment_id: null,
            item_name: product.name,
            code_label: product.barcode
              ? `EAN: ${product.barcode}`
              : `SKU: ${product.sku ?? 'N/A'}`,
            unit_price: getProductUnitPrice(product),
            quantity: qty,
          },
        ],
        { shouldValidate: true },
      )
    }
  }

  const addServiceToCart = (service: ServiceRow) => {
    const current = form.getValues('items')
    form.setValue(
      'items',
      [
        ...current,
        {
          uid: crypto.randomUUID(),
          item_type: 'service',
          product_id: null,
          service_id: service.id,
          appointment_id: null,
          item_name: service.name,
          code_label: `SERVIÇO • ${service.duration_minutes}min`,
          unit_price: Number(service.price),
          quantity: 1,
        },
      ],
      { shouldValidate: true },
    )
  }

  const addAppointmentToCart = (appt: AppointmentRow) => {
    const current = form.getValues('items')
    if (current.some((i) => i.appointment_id === appt.id)) return

    if (appt.customer_id && !form.getValues('customer_id')) {
      form.setValue('customer_id', appt.customer_id)
    }

    form.setValue(
      'items',
      [
        ...current,
        {
          uid: crypto.randomUUID(),
          item_type: 'service',
          product_id: null,
          service_id: appt.service_id,
          appointment_id: appt.id,
          item_name: `${appt.service_name ?? 'Serviço Pet'} (${appt.customer_name ?? 'Cliente'})`,
          code_label: `AGENDAMENTO • ${new Date(appt.scheduled_at).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
          unit_price: Number(appt.price ?? 0),
          quantity: 1,
        },
      ],
      { shouldValidate: true },
    )
  }

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()

    const raw = barcodeOrSearch.trim()
    if (!raw) return

    const exactProduct = products.find(
      (p) => p.barcode === raw || (p.sku && p.sku.toLowerCase() === raw.toLowerCase()),
    )

    if (exactProduct) {
      addProductToCart(exactProduct, scanMultiplier)
      setBarcodeOrSearch('')
      setScanMultiplier(1)
    } else if (filteredProducts.length === 1) {
      addProductToCart(filteredProducts[0], scanMultiplier)
      setBarcodeOrSearch('')
      setScanMultiplier(1)
    }
  }

  const updateItemQuantity = (uid: string, delta: number) => {
    const current = form.getValues('items')
    const updated = current
      .map((item) => (item.uid === uid ? { ...item, quantity: item.quantity + delta } : item))
      .filter((item) => item.quantity > 0)
    form.setValue('items', updated, { shouldValidate: true })
  }

  const removeItem = (uid: string) => {
    const current = form.getValues('items')
    form.setValue(
      'items',
      current.filter((i) => i.uid !== uid),
      { shouldValidate: true },
    )
  }

  const onSubmitSale = async (values: CheckoutFormValues) => {
    if (!companyId) return
    setIsSubmitting(true)
    setFeedbackBanner(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: createdSale, error: saleError } = await supabase
        .from('sales' as any)
        .insert({
          company_id: companyId,
          customer_id: values.customer_id || null,
          seller_user_id: user?.id ?? null,
          status: 'completed',
          payment_method: values.payment_method,
          subtotal,
          discount: values.discount_amount,
          discount_amount: values.discount_amount,
          total: totalAmount,
          total_amount: totalAmount,
          amount_paid: values.payment_method === 'dinheiro' ? values.amount_paid : totalAmount,
          change_amount: changeAmount,
          notes: values.notes || null,
        })
        .select('id, sale_number')
        .single()

      if (saleError || !createdSale) {
        throw new Error(saleError?.message ?? 'Falha ao registar cabeçalho da venda.')
      }

      const saleRow = createdSale as any

      const itemsPayload = values.items.map((item) => ({
        sale_id: saleRow.id,
        company_id: companyId,
        item_type: item.item_type,
        product_id: item.product_id,
        service_id: item.service_id,
        appointment_id: item.appointment_id,
        item_name: item.item_name,
        description: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: 0,
        total_price: Number((item.unit_price * item.quantity).toFixed(2)),
      }))

      const { error: itemsError } = await supabase
        .from('sale_items' as any)
        .insert(itemsPayload)

      if (itemsError) {
        await supabase
          .from('sales' as any)
          .update({ status: 'cancelled' })
          .eq('id', saleRow.id)
        throw new Error(itemsError.message)
      }

      setFeedbackBanner(
        `Venda #${saleRow.sale_number ?? String(saleRow.id).slice(0, 6)} concluída! Total: ${formatCurrency(totalAmount)}`,
      )
      form.reset({
        customer_id: null,
        payment_method: 'pix',
        discount_amount: 0,
        amount_paid: 0,
        notes: '',
        items: [],
      })

      await loadPdvData()
      barcodeInputRef.current?.focus()
    } catch (err: any) {
      alert(`Erro ao finalizar venda: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#152923] text-zinc-100 flex flex-col select-none">
      {/* TOPBAR DO PDV */}
      <header className="h-14 border-b border-emerald-900/60 bg-[#11221D] px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base text-white">OnePet ERP</span>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                PDV • Caixa Rápido
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Baixa automática de estoque e lançamento financeiro integrado
            </p>
          </div>
        </div>

        {feedbackBanner && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackBanner}</span>
          </div>
        )}
      </header>

      {/* GRID PRINCIPAL */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden h-[calc(100vh-3.5rem)]">
        {/* COLUNA ESQUERDA: BUSCA + CATÁLOGO */}
        <section className="col-span-12 lg:col-span-7 xl:col-span-8 p-5 flex flex-col gap-4 overflow-hidden">
          <div className="bg-[#1C352D] border border-emerald-800/50 rounded-2xl p-3.5 flex flex-wrap items-center gap-3 shadow-lg">
            <div className="flex items-center gap-2 bg-[#11221D] border border-emerald-800/60 rounded-xl px-3 py-2">
              <span className="text-xs font-mono text-zinc-400">QTD</span>
              <input
                type="number"
                min={1}
                value={scanMultiplier}
                onChange={(e) => setScanMultiplier(Math.max(1, Number(e.target.value)))}
                className="w-12 bg-transparent text-center font-mono font-bold text-amber-300 focus:outline-none"
              />
            </div>

            <div className="relative flex-1 min-w-[240px]">
              <Barcode className="w-5 h-5 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeOrSearch}
                onChange={(e) => setBarcodeOrSearch(e.target.value)}
                onKeyDown={handleBarcodeKeyDown}
                placeholder="Bipe o código de barras (EAN/SKU) ou pesquise o produto..."
                className="w-full bg-[#11221D] border border-emerald-800/60 focus:border-emerald-400 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* SELETOR DE MODO */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-[#11221D] p-1 rounded-xl border border-emerald-900/60">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'products'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Produtos ({products.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'appointments'
                    ? 'bg-amber-400 text-zinc-950'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <CalendarCheck2 className="w-4 h-4" />
                <span>Banho & Tosa Hoje ({appointments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'services'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <Scissors className="w-4 h-4" />
                <span>Serviços Avulsos ({services.length})</span>
              </button>
            </div>

            {activeTab === 'products' && (
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-[#11221D] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'Todas Categorias' : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LISTAGEM CENTRAL */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
            {activeTab === 'products' &&
              filteredProducts.map((product) => {
                const isLowStock =
                  Number(product.stock_quantity) <= Number(product.min_stock_alert ?? 5)
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProductToCart(product, scanMultiplier)}
                    className="group text-left bg-[#1C352D]/90 hover:bg-[#234238] border border-emerald-800/50 hover:border-emerald-400/60 rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-zinc-400">
                        <span>{product.barcode || product.sku || 'S/ CÓD'}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-semibold ${
                            isLowStock
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-emerald-500/15 text-emerald-300'
                          }`}
                        >
                          Est: {Number(product.stock_quantity)} {product.unit ?? 'UN'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-white mt-1.5 line-clamp-2 group-hover:text-emerald-200">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="font-mono font-bold text-base text-amber-300">
                        {formatCurrency(getProductUnitPrice(product))}
                      </span>
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-400 group-hover:text-zinc-950 flex items-center justify-center text-emerald-300 transition">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                )
              })}

            {activeTab === 'appointments' &&
              appointments.map((appt) => (
                <button
                  key={appt.id}
                  type="button"
                  onClick={() => addAppointmentToCart(appt)}
                  className="text-left bg-[#1C352D]/90 hover:bg-[#234238] border border-amber-400/30 hover:border-amber-400 rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
                      {new Date(appt.scheduled_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      • {appt.status}
                    </span>
                    <h3 className="font-semibold text-sm text-white mt-2">
                      {appt.service_name ?? 'Serviço'}
                    </h3>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Cliente: {appt.customer_name ?? 'Não informado'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="font-mono font-bold text-amber-300">
                      {formatCurrency(Number(appt.price ?? 0))}
                    </span>
                    <span className="text-xs font-semibold text-emerald-300">+ Cobrar no PDV</span>
                  </div>
                </button>
              ))}

            {activeTab === 'services' &&
              services.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => addServiceToCart(srv)}
                  className="text-left bg-[#1C352D]/90 hover:bg-[#234238] border border-emerald-800/50 hover:border-emerald-400 rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition"
                >
                  <div>
                    <span className="text-[10px] font-mono text-emerald-300">
                      Duração: {srv.duration_minutes} min
                    </span>
                    <h3 className="font-semibold text-sm text-white mt-1">{srv.name}</h3>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="font-mono font-bold text-amber-300">
                      {formatCurrency(Number(srv.price))}
                    </span>
                    <Plus className="w-4 h-4 text-emerald-300" />
                  </div>
                </button>
              ))}
          </div>
        </section>

        {/* COLUNA DIREITA: CARRINHO E RESUMO FINANCEIRO */}
        <aside className="col-span-12 lg:col-span-5 xl:col-span-4 bg-[#12241F] text-white flex flex-col h-full border-l border-emerald-950 overflow-hidden">
          <form
            onSubmit={form.handleSubmit(onSubmitSale)}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* SELETOR DE CLIENTE */}
            <div className="p-4 border-b border-white/10 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Resumo do Cupom
                </span>
                <button
                  type="button"
                  onClick={() => form.setValue('items', [])}
                  className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              </div>

              <div className="bg-[#1A312A] border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <select
                  {...form.register('customer_id')}
                  className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none"
                >
                  <option value="" className="bg-zinc-900">
                    Consumidor Final (Sem cadastro)
                  </option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-zinc-900">
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ITENS DO CARRINHO */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cartItems.map((item, idx) => (
                <div
                  key={item.uid}
                  className="bg-[#1A312A] border border-white/10 rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        #{String(idx + 1).padStart(2, '0')} • {item.code_label}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-0.5">{item.item_name}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.uid)}
                      className="text-zinc-400 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                    <div className="flex items-center gap-1 bg-black/25 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.uid, -1)}
                        className="w-6 h-6 rounded hover:bg-white/10 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 font-mono text-xs font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.uid, 1)}
                        className="w-6 h-6 rounded hover:bg-white/10 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-mono text-sm font-extrabold text-emerald-300">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* TOTAIS E PAGAMENTO */}
            <div className="p-4 bg-[#0E1D19] border-t border-white/10 space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-200">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Desconto (R$)</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    {...form.register('discount_amount')}
                    className="w-24 bg-[#1A312A] border border-white/15 rounded-lg px-2 py-1 text-right font-mono text-amber-300 font-bold focus:outline-none"
                  />
                </div>
                <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
                  <span className="text-sm font-bold uppercase text-emerald-300">Total</span>
                  <span className="font-mono text-2xl font-extrabold">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Botões de Método de Pagamento */}
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: 'pix', label: 'PIX', icon: QrCode },
                    { id: 'cartao_credito', label: 'Crédito', icon: CreditCard },
                    { id: 'cartao_debito', label: 'Débito', icon: Landmark },
                    { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => form.setValue('payment_method', id)}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      paymentMethod === id
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'border-white/10 bg-[#1A312A] text-zinc-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSubmitting ? 'Processando...' : 'Finalizar Venda [F9]'}</span>
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  )
}
