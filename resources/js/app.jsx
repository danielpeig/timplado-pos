import './bootstrap';
import { Printer, X } from 'lucide-react';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

function currencyFromPesos(pricePesos) {
    if (pricePesos == null) return '';
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'PHP',
    }).format(pricePesos);
}

function centsFromCartLine(product, quantity) {
    const price = product?.price_pesos ?? 0;
    return price * quantity;
}

function getOrderLabel(order) {
    if (!order) return '#—';
    return order.preorder_number ? `Pre-Order #${order.preorder_number}` : `#${order.id ?? '—'}`;
}

function formatOrderDateTime(createdAtDate) {
    if (!createdAtDate) return '';
    const date = new Date(createdAtDate);
    if (isNaN(date.getTime())) return '';
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${month} ${day} | ${displayHours}:${minutes} ${ampm}`;
}

function buildOrderSlipHtml(order) {
    const itemsRows = (order.items ?? [])
        .map((it) => {
            const name = it.product?.name ?? 'Item';
            const amount = currencyFromPesos(centsFromCartLine(it.product, it.quantity));
            return `
                <tr>
                    <td>${name}</td>
                    <td style="text-align:center">${it.quantity}</td>
                    <td style="text-align:right">${amount}</td>
                </tr>`;
        })
        .join('');

    const totalAmount = order.total ?? (order.items ?? []).reduce(
        (sum, it) => sum + centsFromCartLine(it.product, it.quantity),
        0,
    );

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Order Slip ${getOrderLabel(order)}</title>
<style>
  body { font-family: ui-sans-serif, system-ui, sans-serif; color: #111; padding: 24px; }
  h1, h2, h3, p, div { margin: 0; }
  h1 { font-size: 28px; margin-bottom: 12px; }
  .meta { margin-bottom: 18px; }
  .meta div { margin-bottom: 6px; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { padding: 10px 8px; border-bottom: 1px solid #ddd; }
  th { text-align: left; font-weight: 700; }
  .total { margin-top: 16px; text-align: right; font-size: 16px; font-weight: 700; }
  .note { margin-top: 16px; font-size: 14px; color: #444; }
  .small { margin-top: 26px; font-size: 12px; color: #666; }
  @media print {
    body { padding: 12mm; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
  <h1>Order Slip</h1>
  <div class="meta">
    <div><strong>Order: </strong> ${getOrderLabel(order)}</div>
    <div><strong>Order Date: </strong> ${formatOrderDateTime(order.created_at)}</div>
    <div><strong>Completed Date: </strong> ${formatOrderDateTime(order.completed_at)}</div>
    <div><strong>Type: </strong> ${order.order_type === 'dine_in' ? 'Dine In' : 'Takeout'}</div>
    <div><strong>${order.order_type === 'dine_in' ? 'Table' : 'Customer'}: </strong> ${order.order_type === 'dine_in' ? order.table_number ?? '—' : order.customer_name ?? '—'}</div>
    <div><strong>Payment:  </strong> ${order.payment_mode === 'gcash' ? 'Gcash' : order.payment_mode === 'cash' ? 'Cash' : '—'}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>${itemsRows}</tbody>
  </table>
  <div class="total">Total: ${currencyFromPesos(totalAmount)}</div>
  ${order.note ? `<div class="note"><strong>Note:</strong> ${order.note}</div>` : ''}
  <div class="small">Printed from Timplado POS</div>
</body>
</html>`;
}

function printOrderSlip(order) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        window.alert('Please allow popups to print the order slip.');
        return;
    }
    printWindow.document.write(buildOrderSlipHtml(order));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
}

function ModeSelect() {
    return (
        <div className="min-h-screen bg-[#fff7eb] text-slate-900 flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full text-center">
                
                {/* Logo and Brand Space */}
                <div className="mb-12">
                    <div className="mx-auto h-70 w-70 overflow-hidden rounded-2xl">
                        <img
                            src="/images/logo.png"
                            alt="Timplado POS logo"
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-800">Timplado POS</h1>
                    <p className="mt-2 text-slate-500 font-medium">
                        Select a mode for this device to get started.
                    </p>
                </div>

                {/* Large Selection Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link
                        to="/front"
                        className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-100 active:scale-95"
                    >
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                            🖥️
                        </div>
                        <div className="text-xl font-bold text-slate-800">Front Desk</div>
                        <div className="mt-2 text-sm text-slate-500 leading-relaxed">
                            Manage customer orders, handle takeout, and coordinate with the kitchen.
                        </div>
                    </Link>

                    <Link
                        to="/kitchen"
                        className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-orange-500 hover:shadow-xl hover:shadow-orange-100 active:scale-95"
                    >
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl transition-colors group-hover:bg-orange-500 group-hover:text-white">
                            🍳
                        </div>
                        <div className="text-xl font-bold text-slate-800">Kitchen</div>
                        <div className="mt-2 text-sm text-slate-500 leading-relaxed">
                            View incoming orders in real-time and mark items as they are prepared.
                        </div>
                    </Link>
                </div>

                {/* Footer hint */}
                <footer className="mt-12 text-xs text-slate-400 font-medium uppercase tracking-widest">
                    System Beta
                </footer>
            </div>
        </div>
    );
}

function ButtonLink({ to, children }) {
    return (
        <Link
            to={to}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition"
        >
            {children}
        </Link>
    );
}

function orderStatusBadge(status, index = null) {
    const normalized = String(status ?? '').toLowerCase();

    if (normalized === 'done') {
        return (
            <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                Completed
            </span>
        );
    }

    if (normalized === 'cancelled' || normalized === 'canceled') {
        return (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                Cancelled
            </span>
        );
    }

    if (index === 0) {
        return (
            <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
                New
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">
            Pending
        </span>
    );
}

function FrontDesk() {
    const [products, setProducts] = React.useState([]);
    const [cart, setCart] = React.useState(() => new Map());
    const [note, setNote] = React.useState('');
    const [orderType, setOrderType] = React.useState(null);
    const [orderDetail, setOrderDetail] = React.useState('');
    const [paymentMode, setPaymentMode] = React.useState(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [lastOrderId, setLastOrderId] = React.useState(null);
    const [confirmAction, setConfirmAction] = React.useState('send');
    const [showConfirmModal, setShowConfirmModal] = React.useState(false);
    const [pendingOrderCount, setPendingOrderCount] = React.useState(0);
    const [error, setError] = React.useState(null);
    const [toastMessage, setToastMessage] = React.useState(null);
    const [isLeaving, setIsLeaving] = React.useState(false);
    const [preOrders, setPreOrders] = React.useState([]);

    React.useEffect(() => {
        let isMounted = true;
        window.axios
            .get('/api/products')
            .then((r) => {
                if (!isMounted) return;
                setProducts(r.data);
            })
            .catch((e) => {
                if (!isMounted) return;
                setError(e?.message ?? 'Failed to load products');
            });
        return () => {
            isMounted = false;
        };
    }, []);

    function addToCart(productId) {
        setCart((prev) => {
            const next = new Map(prev);
            const product = products.find((p) => p.id === productId);
            const currentQuantity = next.get(productId) ?? 0;
            const remainingStock = Math.max(0, (product?.stock ?? 0) - currentQuantity);

            if (remainingStock <= 0) {
                return prev;
            }

            next.set(productId, currentQuantity + 1);
            return next;
        });
    }

    function decFromCart(productId) {
        setCart((prev) => {
            const next = new Map(prev);
            const cur = next.get(productId) ?? 0;
            if (cur <= 1) next.delete(productId);
            else next.set(productId, cur - 1);
            return next;
        });
    }

    function setProductStock(productId, stock) {
        setProducts((prev) =>
            prev.map((p) =>
                p.id === productId ? { ...p, stock: Math.max(0, Number(stock) || 0) } : p,
            ),
        );
    }

    async function updateProductStock(product) {
        const stock = Math.max(0, Number(product.stock) || 0);
        const r = await window.axios.patch(`/api/products/${product.id}`, {
            stock,
        });
        setProducts((prev) => prev.map((p) => (p.id === product.id ? r.data : p)));
    }

    const cartItems = React.useMemo(() => {
        const byId = new Map(products.map((p) => [p.id, p]));
        return Array.from(cart.entries())
            .map(([productId, quantity]) => ({
                product: byId.get(productId),
                productId,
                quantity,
            }))
            .filter((x) => x.product);
    }, [cart, products]);

    const visibleProducts = React.useMemo(() => {
        return products;
    }, [products]);

    const productsByCategory = React.useMemo(() => {
        const map = new Map();
        for (const p of visibleProducts) {
            const key = p.category ?? 'Other';
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(p);
        }
        for (const arr of map.values()) {
            arr.sort(
                (a, b) =>
                    (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
                    String(a.name).localeCompare(String(b.name)),
            );
        }
        return map;
    }, [visibleProducts]);

    const cartTotalCents = React.useMemo(() => {
        return cartItems.reduce(
            (sum, x) => sum + centsFromCartLine(x.product, x.quantity),
            0,
        );
    }, [cartItems]);

    React.useEffect(() => {
    if (!toastMessage) {
        setIsLeaving(false); 
        return;
    }

    const displayTimer = window.setTimeout(() => {
        setIsLeaving(true);
    }, 3000);

    const removeTimer = window.setTimeout(() => {
        setToastMessage(null);
    }, 3400); 

    return () => {
        window.clearTimeout(displayTimer);
        window.clearTimeout(removeTimer);
    };
}, [toastMessage]);

    React.useEffect(() => {
        let cancelled = false;

        async function refreshPendingOrders() {
            try {
                const r = await window.axios.get('/api/orders', {
                    params: { active: true },
                });

                if (!cancelled) {
                    setPendingOrderCount(r.data.length);
                }
            } catch {
                // ignore errors for the badge
            }
        }

        refreshPendingOrders();
        const interval = window.setInterval(refreshPendingOrders, 2000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    function getCurrentOrderSlip() {
        return {
            id: null,
            note: note.trim() ? note.trim() : null,
            order_type: orderType,
            table_number: orderType === 'dine_in' ? orderDetail.trim() || null : null,
            payment_mode: paymentMode,
            customer_name: orderType === 'takeout' ? orderDetail.trim() || null : null,
            payment_mode: paymentMode,
            items: cartItems.map((x) => ({
                product: x.product,
                productId: x.productId,
                quantity: x.quantity,
            })),
            total: cartTotalCents,
        };
    }

    async function submitOrder() {
        setError(null);
        setLastOrderId(null);
        setIsSubmitting(true);
        setShowConfirmModal(false);
        const orderPreview = getCurrentOrderSlip();

        try {
            const payload = {
                note: orderPreview.note,
                order_type: orderPreview.order_type,
                payment_mode: orderPreview.payment_mode,
                table_number: orderPreview.table_number,
                customer_name: orderPreview.customer_name,
                payment_mode: orderPreview.payment_mode,
                items: orderPreview.items.map((x) => ({
                    product_id: x.productId,
                    quantity: x.quantity,
                })),
            };

            const r = await window.axios.post('/api/orders', payload);
            const orderWithId = { ...orderPreview, id: r.data.id };
            window.localStorage.setItem('lastOrderSlip', JSON.stringify(orderWithId));
            setLastOrderId(r.data.id);
            setCart(new Map());
            setNote('');
            setOrderType(null);
            setOrderDetail('');
            setPaymentMode(null);
            setPendingOrderCount((prev) => prev + 1);
            setToastMessage(`Order #${r.data.id} Successfully Sent to Kitchen`);
        } catch (e) {
            setError(
                e?.response?.data?.message ??
                    e?.message ??
                    'Failed to submit order',
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function savePreOrder() {
        setError(null);
        setLastOrderId(null);
        setIsSubmitting(true);
        setShowConfirmModal(false);

        try {
            const orderPreview = getCurrentOrderSlip();
            const payload = {
                note: orderPreview.note,
                payment_mode: orderPreview.payment_mode,
                order_type: orderPreview.order_type,
                table_number: orderPreview.table_number,
                customer_name: orderPreview.customer_name,
                payment_mode: orderPreview.payment_mode,
                status: 'preorder',
                items: orderPreview.items.map((x) => ({
                    product_id: x.productId,
                    quantity: x.quantity,
                })),
            };

            await window.axios.post('/api/orders', payload);
            setPaymentMode(null);
            setCart(new Map());
            setNote('');
            setOrderType(null);
            setOrderDetail('');
            setPaymentMode(null);
            setToastMessage('Pre-order saved successfully');
        } catch (e) {
            setError(
                e?.response?.data?.message ??
                    e?.message ??
                    'Failed to save pre-order',
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    function openConfirm(action) {
        setConfirmAction(action);
        setShowConfirmModal(true);
    }

    async function handleConfirm() {
        if (confirmAction === 'preorder') {
            savePreOrder();
            setShowConfirmModal(false);
            return;
        }

        await submitOrder();
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#fff7eb] text-slate-900">
            {/* Top Navigation Bar - Rigid */}
            <header className="flex-none border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <ButtonLink to="/" className="text-slate-500 hover:text-slate-900">
                            <span className="text-lg">←</span>
                        </ButtonLink>
                        
                        {/* Logo Group */}
                        <div className="flex items-center gap-4"> {/* Increased gap slightly for the bigger logo */}
                            <img 
                                src="/images/logo.png" 
                                alt="Logo" 
                                className="h-12 w-auto object-contain" // Changed from h-10 to h-14
                            />
                            <h1 className="text-3xl font-black tracking-tighter text-slate-800">
                                Timplado
                            </h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 ring-1 ring-inset ring-amber-500/20">
                            {pendingOrderCount} Pending Orders
                        </span>
                        <ButtonLink to="/front/status" className="bg-white border shadow-sm">Status</ButtonLink>
                        <ButtonLink to="/front/preorders" className="bg-white border shadow-sm">Pre-Orders</ButtonLink>
                        <ButtonLink to="/front/history" className="bg-white border shadow-sm">History</ButtonLink>
                    </div>
                </div>
            </header>

            {/* Main Body - This container provides the rigid structure */}
            <main className="flex-1 flex overflow-hidden max-w-[1600px] w-full mx-auto p-6 gap-8">
                
                {/* Product Selection Area */}
                <div className="flex-1 flex flex-col min-h-0 pr-2 gap-6 lg:gap-8 overflow-y-auto"> {/* Increased gap between categories */}
                    {['Drinks and Desserts', 'Meals', 'Add Ons'].map((cat) => (
                        <section key={cat} className="flex-none flex flex-col"> {/* Changed flex-1 to flex-none to stop squishing */}
                            {/* Minimalist Category Header */}
                            <div className="flex items-center gap-2 mb-3"> {/* Increased margin below header */}
                                <h2 className="text-[10px] lg:text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">
                                    {cat}
                                </h2>
                                <div className="h-[1px] flex-1 bg-slate-200/60"></div>
                            </div>
                            
                            {/* Grid Area */}
                            <div className="grid grid-cols-4 xl:grid-cols-5 gap-4"> {/* Standardized gap */}
                                {(productsByCategory.get(cat) ?? []).map((p) => {
                                    const selectedQuantity = cart.get(p.id) ?? 0;
                                    const remainingStock = Math.max(0, (p.stock ?? 0) - selectedQuantity);
                                    const isSelected = selectedQuantity > 0;
                                    const isOutOfStock = remainingStock <= 0;
                                    const isAddOn = cat === 'Add Ons';

                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            disabled={isOutOfStock}
                                            onClick={() => addToCart(p.id)}
                                            className={`group relative flex transition-all duration-200 active:scale-95 border ${
                                                isAddOn 
                                                    ? 'flex-row items-center p-3 rounded-xl h-fit min-h-[70px]' 
                                                    : 'flex-col p-2.5 rounded-2xl'
                                            } ${
                                                isSelected
                                                    ? 'border-emerald-500 bg-emerald-50/30 shadow-md ring-1 ring-emerald-500/20'
                                                    : 'border-slate-100 bg-white hover:border-slate-300 shadow-sm'
                                            } ${isOutOfStock ? 'cursor-not-allowed opacity-60' : ''}`}
                                        >
                                            {/* Unified Quantity Badge */}
                                            {isSelected && (
                                                <div className="absolute -right-1.5 -top-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow-lg ring-2 ring-white animate-in zoom-in">
                                                    {selectedQuantity}
                                                </div>
                                            )}

                                            {/* Image Container (Meals/Drinks Only) */}
                                            {!isAddOn && (
                                                <div className="aspect-[10/8] w-full mb-3 rounded-xl overflow-hidden border border-slate-100/50 bg-slate-50">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} alt={p.name} className="h-full w-full object-contain transition-transform group-hover:scale-105" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">No Image</div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Text Info Area */}
                                            <div className={`text-left flex flex-col justify-center min-w-0 flex-1 ${!isAddOn ? 'px-0.5' : ''}`}>
                                                <div className="font-bold text-slate-800 leading-tight text-[12px] lg:text-[13px] line-clamp-1">
                                                    {p.name}
                                                </div>
                                                
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[11px] lg:text-[12px] font-semibold text-slate-400">
                                                        {p.price_pesos != null ? currencyFromPesos(p.price_pesos) : '—'}
                                                    </span>
                                                </div>

                                                <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    {isOutOfStock ? 'Out of stock' : `Available ${remainingStock}`}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Sidebar - Rigid */}
                <aside className="w-[320px] lg:w-[380px] flex flex-col h-full rounded-2xl border border-slate-200 bg-white p-4 lg:p-6 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <h2 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6 flex-none text-slate-800 tracking-tight">Order Form</h2>

                    {/* Scrollable Middle Section */}
                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4 lg:space-y-6">
                        
                        {/* Rigid Controls */}
                        <div className="flex p-1 bg-slate-100 rounded-xl flex-none">
                            <button type="button" onClick={() => { setOrderType('takeout'); setOrderDetail(''); }} className={`flex-1 rounded-lg py-2 lg:py-2.5 text-xs lg:text-sm font-bold transition-all ${orderType === 'takeout' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Takeout</button>
                            <button type="button" onClick={() => { setOrderType('dine_in'); setOrderDetail(''); }} className={`flex-1 rounded-lg py-2 lg:py-2.5 text-xs lg:text-sm font-bold transition-all ${orderType === 'dine_in' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Dine In</button>
                        </div>

                        <div className="flex-none">
                            <label className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 lg:mb-2 block">{orderType === 'dine_in' ? 'Table Number' : 'Customer Name'}</label>
                            <input type="text" value={orderDetail} onChange={(e) => setOrderDetail(e.target.value)} className="w-full rounded-xl border-slate-200 bg-slate-50 p-2 lg:p-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder={orderType === 'dine_in' ? 'e.g. 05' : 'e.g. John Doe'} disabled={!orderType}/>
                        </div>

                        {/* Cart Items */}
                        <div className="space-y-3">
                            {cartItems.length === 0 ? (
                                <div className="py-4 flex flex-col items-center justify-center opacity-30">
                                    <div className="text-2xl mb-1 italic">🛒</div>
                                    <p className="text-xs font-bold uppercase tracking-widest">Empty</p>
                                </div>
                            ) : (
                                cartItems.map(({ product, productId, quantity }) => (
                                    <div key={productId} className="flex items-center justify-between group flex-none">
                                        <div className="min-w-0 pr-2">
                                            <div className="text-xs lg:text-sm font-bold text-slate-800 truncate">{product.name}</div>
                                            <div className="text-[10px] lg:text-xs text-slate-500">{currencyFromPesos(centsFromCartLine(product, quantity))}</div>
                                        </div>
                                        <div className="flex items-center gap-1.5 lg:gap-2 flex-none">
                                            <button onClick={() => decFromCart(productId)} className="h-7 w-7 lg:h-8 lg:w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-90">−</button>
                                            <span className="w-4 text-center text-xs lg:text-sm font-bold">{quantity}</span>
                                            <button onClick={() => addToCart(productId)} className="h-7 w-7 lg:h-8 lg:w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-90">+</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 lg:mb-2 block">Notes (optional)</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full min-h-[60px] lg:min-h-[70px] rounded-xl border border-slate-200 bg-slate-50 p-2 lg:p-3 text-sm text-slate-800 resize-none focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                placeholder="Special instructions..."
                            />
                        </div>

                        {/* Payment Section */}
                        <div className="pb-2">
                            <label className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 lg:mb-2 block">Mode of Payment</label>
                            <div className="flex p-1 bg-slate-100 rounded-xl">
                                <button type="button" onClick={() => setPaymentMode('cash')} className={`flex-1 rounded-lg py-2 text-xs lg:text-sm font-bold transition-all ${paymentMode === 'cash' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Cash</button>
                                <button type="button" onClick={() => setPaymentMode('gcash')} className={`flex-1 rounded-lg py-2 text-xs lg:text-sm font-bold transition-all ${paymentMode === 'gcash' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>GCash</button>
                            </div>
                        </div>
                    </div>

                    {/* Rigid Bottom Section */}
                    <div className="border-t border-slate-100 pt-3 lg:pt-4 mt-2 flex-none">
                        <div className="flex items-center justify-between mb-4 lg:mb-6">
                            <span className="text-slate-500 text-xs lg:text-sm font-medium uppercase tracking-widest">Total</span>
                            <span className="text-xl lg:text-2xl font-black text-slate-900">{currencyFromPesos(cartTotalCents)}</span>
                        </div>
                        <div className="space-y-2 lg:space-y-3">
                            <button type="button" disabled={cartItems.length === 0 || isSubmitting || !orderType || !orderDetail.trim() || !paymentMode} onClick={() => openConfirm('send')} className="w-full rounded-2xl bg-emerald-600 py-3 lg:py-4 text-base lg:text-lg font-bold text-white shadow-lg shadow-emerald-200 disabled:opacity-40 active:scale-[0.98] transition-all">
                                {isSubmitting ? 'Sending...' : 'Send to Kitchen'}
                            </button>
                            <button type="button" disabled={cartItems.length === 0 || isSubmitting || !orderType || !orderDetail.trim() || !paymentMode} onClick={() => openConfirm('preorder')} className="w-full rounded-xl border border-slate-200 bg-white py-2 lg:py-3 text-xs lg:text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 transition-all">
                                Pre-Order
                            </button>
                        </div>
                    </div>
                </aside>
            </main>

            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirmModal(false)} />
                    <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {confirmAction === 'preorder' ? 'Confirm Pre-Order' : 'Confirm Order'}
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    {confirmAction === 'preorder'
                                        ? 'Review the items below before saving this pre-order.'
                                        : 'Review the items below before sending the order to the kitchen.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                                <div>
                                    <div className="font-semibold text-slate-900">Order type</div>
                                    <div>{orderType === 'dine_in' ? 'Dine In' : 'Takeout'}</div>
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">{orderType === 'dine_in' ? 'Table' : 'Customer'}</div>
                                    <div>{orderDetail || '—'}</div>
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">Payment</div>
                                    <div>{paymentMode === 'gcash' ? 'Gcash' : paymentMode === 'cash' ? 'Cash' : '—'}</div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                    Order Summary
                                </div>
                                <div className="space-y-3">
                                    {cartItems.map(({ product, quantity }) => (
                                        <div key={product.id} className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-slate-800">{product.name}</div>
                                                <div className="text-xs text-slate-500">x{quantity}</div>
                                            </div>
                                            <div className="text-sm font-black text-slate-900">
                                                {currencyFromPesos(centsFromCartLine(product, quantity))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm font-black text-slate-900">
                                    <span>Total</span>
                                    <span>{currencyFromPesos(cartTotalCents)}</span>
                                </div>
                            </div>

                            {note ? (
                                <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                                    <div className="font-semibold text-slate-900 mb-2">Note</div>
                                    <div>{note}</div>
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Edit Order
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Sending...' : confirmAction === 'preorder' ? 'Confirm Pre-Order' : 'Confirm & Send'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className={`fixed top-24 right-6 z-50 pointer-events-auto ${
                    isLeaving ? 'animate-toast-slide-out' : 'animate-toast-slide-in'
                }`}>
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-emerald-200/50 min-w-[340px]">
                        <div className="flex items-center gap-4">
                            {/* Status Icon */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </div>
                            
                            {/* Content */}
                            <div className="flex flex-col pr-4">
                                <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Success!</span>
                                <span className="text-xs font-medium text-slate-500">{toastMessage}</span>
                            </div>

                            {/* X Button */}
                            <button 
                                onClick={() => setIsLeaving(true)} // Trigger leave animation on click
                                className="ml-auto p-1 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

function FrontStatus() {
    const [orders, setOrders] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [cancelingOrderId, setCancelingOrderId] = React.useState(null);
    const [toastMessage, setToastMessage] = React.useState(null);
    const [isLeaving, setIsLeaving] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [lastInvoiceOrder, setLastInvoiceOrder] = React.useState(null);

    React.useEffect(() => {
        if (!toastMessage) {
            setIsLeaving(false);
            return;
        }

        const displayTimer = window.setTimeout(() => {
            setIsLeaving(true);
        }, 3000);

        const removeTimer = window.setTimeout(() => {
            setToastMessage(null);
        }, 3400);

        return () => {
            window.clearTimeout(displayTimer);
            window.clearTimeout(removeTimer);
        };
    }, [toastMessage]);

    async function performCancelOrder(orderId) {
        await window.axios.patch(`/api/orders/${orderId}/status`, {
            status: 'cancelled',
        });
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setToastMessage(`Order #${orderId} has been successfully cancelled.`);
        setCancelingOrderId(null);
    }

    const cancelingOrder = orders.find((o) => o.id === cancelingOrderId) ?? null;

    React.useEffect(() => {
        let cancelled = false;

        window.axios
            .get('/api/orders', { params: { active: true } })
            .then((r) => {
                if (!cancelled) setOrders(r.data);
            })
            .catch((e) => {
                if (!cancelled) setError(e?.message ?? 'Failed to load active orders');
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        const interval = setInterval(() => {
            window.axios
                .get('/api/orders', { params: { active: true } })
                .then((r) => {
                    if (!cancelled) setOrders(r.data);
                })
                .catch(() => {});
        }, 2000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    React.useEffect(() => {
        try {
            const stored = window.localStorage.getItem('lastOrderSlip');
            if (stored) {
                setLastInvoiceOrder(JSON.parse(stored));
            }
        } catch {
            // ignore malformed localStorage data
        }
    }, []);

    return (
    <>
        <div className="h-screen overflow-y-auto bg-[#fff7eb] text-slate-900 flex flex-col">
            {/* Consistent Top Navigation Bar */}
            <header className="flex-none sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <ButtonLink to="/front" className="text-slate-500 hover:text-slate-900">
                            <span className="text-lg">←</span>
                        </ButtonLink>
                        
                        {/* Logo and Text Group */}
                        <div className="flex items-center gap-4">
                            <img 
                                src="/images/logo.png" 
                                alt="Logo" 
                                className="h-14 w-auto object-contain" 
                            />
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
                                    Order Status
                                </h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                                    Active Orders Queue
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block text-right mr-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Status</div>
                            <div className="text-[10px] text-blue-600 font-bold">Auto-updating</div>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="flex-1 p-6 mx-auto w-full max-w-[1600px] ">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 italic">
                        <div className="text-5xl mb-4 animate-pulse">⌛</div>
                        <p className="text-xl font-medium">Loading active orders…</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 italic">
                        <div className="text-5xl mb-4">✨</div>
                        <p className="text-xl font-medium">All orders served! No active orders.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-12">
                        {orders.map((o, index) => (
                            <div
                                key={o.id}
                                className="flex flex-col bg-white rounded-[2rem] border-b-4 border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
                            >
                                {/* Header */}
                                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Order</span>
                                        <span className="text-2xl font-black text-slate-900 leading-none">{getOrderLabel(o)}</span>
                                    </div>
                                    {orderStatusBadge(o.status, index)}
                                </div>

                                {/* 2. Primary Order Details - Refined with Payment Magic */}
                                {(o.order_type || o.table_number || o.customer_name) && (
                                    <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between gap-2">
                                        {/* Left Side: Order Type and Name/Table */}
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={`inline-flex shrink-0 items-center rounded-lg px-2 py-1 text-[10px] font-black text-white shadow-sm ${
                                                o.order_type === 'dine_in' 
                                                    ? 'bg-emerald-500 shadow-emerald-100' 
                                                    : 'bg-blue-600 shadow-blue-100'
                                            }`}>
                                                {o.order_type === 'dine_in' ? '🍽️ DINE IN' : '🛍️ TAKEOUT'}
                                            </div>
                                            
                                            {(o.table_number || o.customer_name) && (
                                                <div className="text-sm font-bold text-slate-700 tracking-tight truncate">
                                                    {o.order_type === 'dine_in' ? `Table ${o.table_number}` : o.customer_name}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Side: Payment Mode Magic */}
                                        {o.payment_mode && (
                                            <div className="flex shrink-0 flex-col items-end">
                                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1">Paid via</span>
                                                <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                                    o.payment_mode === 'gcash' 
                                                        ? 'text-blue-600 border-blue-100 bg-blue-50/50' 
                                                        : 'text-slate-600 border-slate-200 bg-slate-100/50'
                                                }`}>
                                                    {o.payment_mode}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 3. Order Items - Fixed Height with Internal Scroll */}
                                <div className="flex-1 p-5 pb-2 min-h-0 flex flex-col">
                                    <div className="font-black text-[9px] text-slate-300 uppercase tracking-[0.2em] mb-3">
                                        Order Items
                                    </div>
                                    
                                    {/* Set a max-height (around 4-5 items worth) and enable y-scroll */}
                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[200px]">
                                        <div className="space-y-3">
                                            {o.items?.map((it) => (
                                                <div key={it.id} className="space-y-1">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="text-sm font-bold text-slate-700 leading-tight">
                                                            {it.product?.name}
                                                        </div>
                                                        <div className="text-xs font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded shrink-0">
                                                            x{it.quantity}
                                                        </div>
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 font-medium">
                                                        {currencyFromPesos(centsFromCartLine(it.product, it.quantity))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total Section - Now sits firmly below the scrollable area */}
                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-black text-slate-900">
                                        <span className="uppercase tracking-widest text-[10px] text-slate-400">Total</span>
                                        <span>{currencyFromPesos(
                                            (o.items ?? []).reduce(
                                                (sum, it) => sum + centsFromCartLine(it.product, it.quantity),
                                                0,
                                            )
                                        )}</span>
                                    </div>
                                </div>

                                {/* 4. Note Section (Bottom) */}
                                {o.note && (
                                    <div className="px-5 pb-4 mt-4">
                                        <div className="relative rounded-2xl bg-white border border-slate-100 p-3 shadow-sm">
                                            <div className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-bold uppercase text-amber-500 tracking-tighter border border-slate-100 rounded-full">
                                                Note
                                            </div>
                                            <p className="text-[12px] text-slate-600 italic leading-relaxed">
                                                “{o.note}”
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="p-5 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => printOrderSlip(o)}
                                        className="w-full rounded-2xl bg-slate-900 py-3 text-[11px] font-black text-white shadow-sm transition-all active:scale-95 hover:bg-slate-800"
                                    >
                                        PRINT ORDER SLIP
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCancelingOrderId(o.id)}
                                        className="w-full rounded-2xl bg-white border border-rose-100 py-3 text-[11px] font-black text-rose-500 shadow-sm transition-all active:scale-95 hover:bg-rose-50"
                                    >
                                        CANCEL ORDER
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Success Toast Notification */}
            {toastMessage && (
                <div className={`fixed top-24 right-6 z-50 pointer-events-auto ${isLeaving ? 'animate-toast-slide-out' : 'animate-toast-slide-in'}`}>
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-emerald-200/50 min-w-[340px]">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </div>
                            <div className="flex flex-col pr-4">
                                <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Cancelled</span>
                                <span className="text-xs font-medium text-slate-500">{toastMessage}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

            {cancelingOrder ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setCancelingOrderId(null)}
                    />
                    <div className="relative w-full max-w-lg rounded-lg bg-white border border-slate-200 shadow-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-lg font-semibold">Cancel order</div>
                                <div className="text-sm text-slate-600">
                                    Are you sure you want to cancel order <span className="font-bold">#{cancelingOrder.id}</span>?
                                </div>
                            </div>
                            <button
                                type="button"
                                className="text-sm text-slate-600 hover:text-slate-900"
                                onClick={() => setCancelingOrderId(null)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-4 space-y-2 text-sm text-slate-700">
                            {cancelingOrder.items?.map((it) => (
                                <div key={it.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 p-3">
                                    <div>{it.product?.name}</div>
                                    <div className="font-semibold text-slate-900">x{it.quantity}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setCancelingOrderId(null)}
                                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Keep order
                            </button>
                            <button
                                type="button"
                                onClick={() => performCancelOrder(cancelingOrder.id)}
                                className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition shadow-sm"
                            >
                                Cancel order
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}

function OrderHistory({ mode }) {
    const [orders, setOrders] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [statusFilter, setStatusFilter] = React.useState('completed');
    const [currentPage, setCurrentPage] = React.useState(1);

    React.useEffect(() => {
    // If your backend isn't set up to handle { status: [...] }, 
    // it might be failing. Try sending no params first to test.
    const params = { history: true }; 

    window.axios
        .get('/api/orders', { params })
        .then((r) => setOrders(r.data))
        .catch((e) => setError('Failed to load history'));
    }, [mode]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, orders.length]);

    const visibleOrders = React.useMemo(() => {
    return orders.filter((order) => {
        const status = order.status?.toLowerCase(); // Standardize to lowercase
        
        if (statusFilter === 'completed') {
            return status === 'done' || status === 'completed';
        }

        return status === 'cancelled' || status === 'canceled';
    });
    }, [orders, statusFilter]);

    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(visibleOrders.length / pageSize));
    const pagedOrders = visibleOrders.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

    React.useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const filterOptions = [
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <div className="min-h-screen bg-[#fff7eb] text-slate-900 flex flex-col">
            {/* Sticky Header to match other pages */}
            <header className="flex-none sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <ButtonLink to={mode === 'kitchen' ? '/kitchen' : '/front'} className="text-slate-500">
                            <span className="text-lg">←</span>
                        </ButtonLink>
                        {/* Logo and Text Group */}
                            <div className="flex items-center gap-4">
                                <img 
                                    src="/images/logo.png" 
                                    alt="Logo" 
                                    className="h-14 w-auto object-contain" 
                                />
                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
                                        Order History
                                    </h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {mode === 'kitchen' ? 'Kitchen Logs' : 'Front Desk Records'}
                                    </p>
                                </div>
                            </div>
                    </div>
                    
                    {/* Filter Tabs - Styled as segmented controls */}
                    <div className="hidden sm:flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                        {filterOptions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => { setStatusFilter(option.id); setCurrentPage(1); }}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    statusFilter === option.id
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>
            <main className="flex-1 p-6 mx-auto w-full max-w-[1600px]">
                {/* 1. Meta Info & Header Summary */}
                {visibleOrders.length > 0 && (
                    <div className="mb-6 flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Showing {pagedOrders.length} of {visibleOrders.length} {statusFilter} orders
                        </div>
                    </div>
                )}

                {/* Error Feedback */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 animate-pulse">
                        {error}
                    </div>
                )}

                {/* 2. Content Area: Check if Empty vs Has Data */}
                {visibleOrders.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 italic animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-6xl mb-4 opacity-50">📂</div>
                        <h3 className="text-xl font-bold text-slate-500 not-italic">No history found</h3>
                        <p className="text-sm not-italic mt-1">There are no {statusFilter} orders to display in this category.</p>
                    </div>
                ) : (
                    /* Grid Layout for History Cards */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-24">
                        {pagedOrders.map((o, index) => (
                            <div
                                key={o.id}
                                className="flex flex-col bg-white rounded-[2rem] border-b-4 border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
                            >
                                {/* Card Header */}
                                <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-white">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Order</span>
                                        <span className="text-2xl font-black text-slate-900 leading-none">{getOrderLabel(o)}</span>
                                        <span className="text-[11px] text-slate-600 mt-1">{formatOrderDateTime(o.completed_at ?? o.created_at)}</span>
                                    </div>
                                    {orderStatusBadge(o.status, index)}
                                </div>

                                {/* Metadata Strip (Type & Customer/Table) */}
                                {(o.order_type || o.table_number || o.customer_name) && (
                                    <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between gap-2">
                                        {/* Left Side: Order Type and Name/Table */}
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={`inline-flex shrink-0 items-center rounded-lg px-2 py-1 text-[10px] font-black text-white shadow-sm ${
                                                o.order_type === 'dine_in' 
                                                    ? 'bg-emerald-500 shadow-emerald-100' 
                                                    : 'bg-blue-600 shadow-blue-100'
                                            }`}>
                                                {o.order_type === 'dine_in' ? '🍽️ DINE IN' : '🛍️ TAKEOUT'}
                                            </div>
                                            
                                            {(o.table_number || o.customer_name) && (
                                                <div className="text-sm font-bold text-slate-700 tracking-tight truncate">
                                                    {o.order_type === 'dine_in' ? `Table ${o.table_number}` : o.customer_name}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Side: Payment Mode Magic */}
                                        {o.payment_mode && (
                                            <div className="flex shrink-0 flex-col items-end">
                                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1">Paid via</span>
                                                <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                                    o.payment_mode === 'gcash' 
                                                        ? 'text-blue-600 border-blue-100 bg-blue-50/50' 
                                                        : 'text-slate-600 border-slate-200 bg-slate-100/50'
                                                }`}>
                                                    {o.payment_mode}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Items List - Scrollable Internal Area */}
                                <div className="flex-1 p-5 min-h-[140px] flex flex-col">
                                    <div className="font-black text-[9px] text-slate-300 uppercase tracking-[0.2em] mb-3 text-center">
                                        Receipt Items
                                    </div>
                                    <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                                        {o.items?.map((it) => (
                                            <div key={it.id} className="space-y-0.5">
                                                <div className="flex justify-between items-start text-sm">
                                                    <span className="font-bold text-slate-700 leading-tight">{it.product?.name}</span>
                                                    <span className="bg-slate-50 px-1.5 py-0.5 rounded text-[10px] font-black text-slate-400 shrink-0">
                                                        x{it.quantity}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium">
                                                    {currencyFromPesos(centsFromCartLine(it.product, it.quantity))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Historical Note Section */}
                                {o.note && (
                                    <div className="px-5 pb-4">
                                        <div className="relative rounded-2xl bg-white border border-slate-100 p-3 shadow-sm mt-2">
                                            <div className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-bold uppercase text-amber-500 tracking-tighter border border-slate-100 rounded-full">
                                                Note
                                            </div>
                                            <p className="text-[11px] text-slate-500 italic leading-relaxed">
                                                “{o.note}”
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Summary Footer with Grand Total */}
                                <div className="mt-auto p-5 bg-slate-50 border-t border-slate-100 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                                        <span className="text-lg font-black text-slate-900">
                                            {currencyFromPesos((o.items ?? []).reduce((sum, it) => sum + centsFromCartLine(it.product, it.quantity), 0))}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => printOrderSlip(o)}
                                        className="w-full rounded-2xl bg-slate-900 py-3 text-[11px] font-black text-white shadow-sm transition-all active:scale-95 hover:bg-slate-800"
                                    >
                                        Print Order Slip
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 3. Floating Modern Pagination Bar */}
                {totalPages > 1 && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-3xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-40 animate-in slide-in-from-bottom-4">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-20 transition-all text-sm font-bold active:scale-90"
                        >
                            ← Prev
                        </button>
                        <div className="h-4 w-[1px] bg-slate-200 mx-2" />
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            Page <span className="text-slate-900 text-sm mx-1">{currentPage}</span> / {totalPages}
                        </div>
                        <div className="h-4 w-[1px] bg-slate-200 mx-2" />
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-20 transition-all text-sm font-bold active:scale-90"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

function EditItems() {
    const [products, setProducts] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [toastMessage, setToastMessage] = React.useState(null);
    const [isLeaving, setIsLeaving] = React.useState(false);

    async function refresh() {
        const r = await window.axios.get('/api/products/manage');
        setProducts(r.data);
    }

    React.useEffect(() => {
        setIsLoading(true);
        refresh()
            .catch((e) => setError(e?.message ?? 'Failed to load products'))
            .finally(() => setIsLoading(false));
    }, []);

    async function toggleActive(p) {
        const r = await window.axios.patch(`/api/products/${p.id}`, {
            is_active: !p.is_active,
        });
        setProducts((prev) =>
            prev.map((x) => (x.id === p.id ? r.data : x)),
        );
    }

    function setProductStock(productId, stock) {
        setProducts((prev) =>
            prev.map((p) =>
                p.id === productId ? { ...p, stock: Math.max(0, Number(stock) || 0) } : p,
            ),
        );
    }

    async function saveStock(p) {
        const r = await window.axios.patch(`/api/products/${p.id}`, {
            stock: Math.max(0, Number(p.stock) || 0),
        });
        setProducts((prev) => prev.map((x) => (x.id === p.id ? r.data : x)));
        setToastMessage(`Stock for ${p.name} saved successfully`);
    }

    React.useEffect(() => {
        if (!toastMessage) {
            setIsLeaving(false);
            return;
        }

        const displayTimer = window.setTimeout(() => {
            setIsLeaving(true);
        }, 3000);

        const removeTimer = window.setTimeout(() => {
            setToastMessage(null);
        }, 3400);

        return () => {
            window.clearTimeout(displayTimer);
            window.clearTimeout(removeTimer);
        };
    }, [toastMessage]);

    return (
        /* 1. Add h-screen and overflow-y-auto to the outermost container to fix the scrollbar position */
        <div className="h-screen overflow-y-auto bg-[#fff7eb] text-slate-900 flex flex-col">
            
            {/* 2. Sticky Header matching your other pages */}
            <header className="flex-none sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <ButtonLink to="/kitchen" className="text-slate-500 hover:text-slate-900">
                            <span className="text-lg">←</span>
                        </ButtonLink>
                        {/* Logo and Text Group */}
                        <div className="flex items-center gap-4">
                            <img 
                                src="/images/logo.png" 
                                alt="Logo" 
                                className="h-14 w-auto object-contain" 
                            />
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
                                    Edit Items
                                </h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                                    Control stock levels per item. Orders and pre-orders will deduct stock when created.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 mx-auto w-full max-w-[1600px]">
                {error ? (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        {error}
                    </div>
                ) : null}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[40vh] text-slate-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mb-4"></div>
                        <p className="text-sm font-medium">Loading Items...</p>
                    </div>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {products.map((p) => (
                        <div
                            key={p.id}
                            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="font-medium truncate">
                                        {p.name}
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        {p.price_pesos != null
                                            ? currencyFromPesos(p.price_pesos)
                                            : 'No price yet'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toggleActive(p)}
                                    className={
                                        p.is_active
                                            ? 'rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 transition'
                                            : 'rounded-md bg-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 transition'
                                    }
                                >
                                    {p.is_active ? 'Active' : 'Disabled'}
                                </button>
                            </div>
                            <div className="mt-4 space-y-3">
                                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                    Stock
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        value={p.stock ?? 0}
                                        onChange={(e) => setProductStock(p.id, e.target.value)}
                                        className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => saveStock(p)}
                                        className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {toastMessage && (
                <div className={`fixed top-24 right-6 z-50 pointer-events-auto ${isLeaving ? 'animate-toast-slide-out' : 'animate-toast-slide-in'}`}>
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-emerald-200/50 min-w-[300px]">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </div>
                            <div className="flex flex-col pr-4">
                                <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Success!</span>
                                <span className="text-xs font-medium text-slate-500">{toastMessage}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Kitchen() {
    const [orders, setOrders] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [toastMessage, setToastMessage] = React.useState(null);
    const [isLeaving, setIsLeaving] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [cancelingOrderId, setCancelingOrderId] = React.useState(null);
    const [lastInvoiceOrder, setLastInvoiceOrder] = React.useState(null);
    const [newOrderSlips, setNewOrderSlips] = React.useState([]);
    const ordersRef = React.useRef([]);
    const isInitialLoad = React.useRef(true);
    const newOrderAudioRef = React.useRef(null);

    // Upload your sound file to public/audio/new-order.mp3
    // Example: public/audio/new-order.mp3
    React.useEffect(() => {
        if (typeof Audio !== 'undefined') {
            newOrderAudioRef.current = new Audio('/audio/new-order.mp3');
            newOrderAudioRef.current.volume = 0.35;
        }
    }, []);

    React.useEffect(() => {
        if (!toastMessage) {
            setIsLeaving(false);
            return;
        }

        const displayTimer = window.setTimeout(() => {
            setIsLeaving(true);
        }, 3000);

        const removeTimer = window.setTimeout(() => {
            setToastMessage(null);
        }, 3400);

        return () => {
            window.clearTimeout(displayTimer);
            window.clearTimeout(removeTimer);
        };
    }, [toastMessage]);

    async function refresh() {
        const r = await window.axios.get('/api/kitchen/orders');
        const newOrders = r.data;
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
        } else {
            const previousIds = new Set(ordersRef.current.map((o) => o.id));
            const added = newOrders.filter((o) => !previousIds.has(o.id));
            if (added.length > 0) {
                setNewOrderSlips((prev) => [...prev, ...added]);
                if (newOrderAudioRef.current) {
                    newOrderAudioRef.current.currentTime = 0;
                    newOrderAudioRef.current.play().catch(() => {});
                }
            }
        }
        ordersRef.current = newOrders;
        setOrders(newOrders);
    }

    React.useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        refresh()
            .catch((e) => {
                if (cancelled) return;
                setError(e?.message ?? 'Failed to load orders');
            })
            .finally(() => {
                if (cancelled) return;
                setIsLoading(false);
            });

            const interval = setInterval(() => {
                refresh().catch(() => {});
            }, 2000);

            return () => {
                cancelled = true;
                clearInterval(interval);
            };
        }, []);

        async function toggleItemDone(orderItemId) {
            const r = await window.axios.patch(
                `/api/order-items/${orderItemId}/toggle-done`,
            );
            setOrders((prev) => {
                const next = prev.slice();
                const idx = next.findIndex((o) => o.id === r.data.id);
                if (idx >= 0) next[idx] = r.data;
                else next.unshift(r.data);
                return next;
            });
        }

        async function markOrderDone(orderId) {
            const r = await window.axios.patch(`/api/orders/${orderId}/status`, {
                status: 'done',
            });
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
            setLastInvoiceOrder(r.data);
            setToastMessage(`Order ${getOrderLabel(r.data)} completed successfully`);
        }

        async function cancelOrder(orderId) {
            const r = await window.axios.patch(`/api/orders/${orderId}/status`, {
                status: 'cancelled',
            });
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
            setCancelingOrderId(null);
            setToastMessage(`${getOrderLabel(r.data)} cancelled successfully`);
        }

        const cancelingOrder = orders.find((o) => o.id === cancelingOrderId) ?? null;

        return (
        <>
            <div className="flex flex-col h-screen overflow-hidden bg-[#fff7eb] text-slate-900">
                <header className="flex-none border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <ButtonLink to="/" className="text-slate-500 hover:text-slate-900">
                                <span className="text-lg">←</span>
                            </ButtonLink>
                            
                            {/* Logo Group */}
                            <div className="flex items-center gap-4"> {/* Increased gap slightly for the bigger logo */}
                                <img 
                                    src="/images/logo.png" 
                                    alt="Logo" 
                                    className="h-12 w-auto object-contain" // Changed from h-10 to h-14
                                />
                                <h1 className="text-3xl font-black tracking-tighter text-slate-800">
                                    Timplado Kitchen
                                </h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="hidden md:block text-right mr-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Sync</div>
                                <div className="text-[10px] text-emerald-600 font-bold">Refreshing every 2s</div>
                            </div>
                            <ButtonLink to="/items" className="bg-white border shadow-sm">Items</ButtonLink>
                            <ButtonLink to="/kitchen/history" className="bg-white border shadow-sm">History</ButtonLink>
                        </div>
                    </div>
                </header>

                {/* Horizontal Receipt Rail */}
                <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 mx-auto max-w-[1600px]">
                <div className="flex h-full gap-6 items-start">
                    {orders.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center h-full text-slate-400 italic">
                            <div className="text-5xl mb-4">🍳</div>
                            <p className="text-xl font-medium">No active orders in the queue.</p>
                        </div>
                    ) : (
                        orders.map((o, index) => {
                            // Magic logic to handle Pre-Order label vs regular Order
                            const isPreOrder = o.status === 'preorder' || getOrderLabel(o).toLowerCase().includes('pre-order');
                            
                            return (
                                <div
                                    key={o.id}
                                    className="flex-none w-80 max-h-full flex flex-col bg-white rounded-[2rem] border-b-4 border-slate-300 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-4"
                                >
                                    {/* 1. Sleek Receipt Header */}
                                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                                        <div className="flex items-baseline gap-2">
                                            {!isPreOrder && (
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Order</span>
                                            )}
                                            <span className="text-2xl font-black text-slate-900 leading-none">
                                                {isPreOrder ? getOrderLabel(o) : `#${o.id}`}
                                            </span>
                                        </div>
                                        {orderStatusBadge(o.status, index)}
                                    </div>

                                    {/* 2. Metadata Bar (Type, Table/Name, Payment) */}
                                    {(o.order_type || o.table_number || o.customer_name) && (
                                        <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                                                <div className={`inline-flex shrink-0 items-center rounded-lg px-2 py-1 text-[10px] font-black text-white shadow-sm ${
                                                    o.order_type === 'dine_in' 
                                                        ? 'bg-emerald-500 shadow-emerald-100' 
                                                        : 'bg-blue-600 shadow-blue-100'
                                                }`}>
                                                    {o.order_type === 'dine_in' ? '🍽️ DINE IN' : '🛍️ TAKEOUT'}
                                                </div>
                                                
                                                {(o.table_number || o.customer_name) && (
                                                    <div className="text-sm font-bold text-slate-700 tracking-tight truncate">
                                                        {o.order_type === 'dine_in' ? `Table ${o.table_number}` : o.customer_name}
                                                    </div>
                                                )}
                                            </div>

                                            {o.payment_mode && (
                                                <div className="flex shrink-0 flex-col items-end">
                                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1">Paid via</span>
                                                    <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                                        o.payment_mode === 'gcash' 
                                                            ? 'text-blue-600 border-blue-100 bg-blue-50/50' 
                                                            : 'text-slate-600 border-slate-200 bg-slate-100/50'
                                                    }`}>
                                                        {o.payment_mode}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 3. Scrollable Items Area */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        

                                        <div className="space-y-1">
                                            {o.items?.map((it) => (
                                                <label
                                                    key={it.id}
                                                    className={`flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer border ${
                                                        it.is_done 
                                                        ? 'bg-slate-50 border-transparent opacity-50' 
                                                        : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={!!it.is_done}
                                                        onChange={() => toggleItemDone(it.id)}
                                                        className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <div className="min-w-0">
                                                        <div className={`text-base font-bold leading-tight ${it.is_done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                                            {it.product?.name}
                                                        </div>
                                                        <div className={`text-sm font-black ${it.is_done ? 'text-slate-300' : 'text-emerald-600'}`}>
                                                            QTY: {it.quantity}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>

                                        {o.note && (
                                            <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-900 italic shadow-sm">
                                                <span className="font-black uppercase text-[9px] text-amber-600 block mb-1">Note:</span>
                                                "{o.note}"
                                            </div>
                                        )}

                                    </div>

                                    {/* 4. Action Footer */}
                                    <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-3">
                                        <button
                                            type="button"
                                            onClick={() => markOrderDone(o.id)}
                                            disabled={!(o.items?.every((it) => !!it.is_done) ?? false)}
                                            className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-200 transition active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none hover:bg-emerald-700"
                                        >
                                            COMPLETE ORDER
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => printOrderSlip(o)}
                                            className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-900 shadow-sm transition active:scale-95 hover:bg-white/80"
                                        >
                                            PRINT ORDER SLIP
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCancelingOrderId(o.id)}
                                            className="w-full py-1 text-[10px] font-bold text-rose-400 uppercase tracking-widest hover:text-rose-600 transition"
                                        >
                                            CANCEL ORDER
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

                {toastMessage && (
                    <div className={`fixed top-24 right-6 z-50 pointer-events-auto ${
                        isLeaving ? 'animate-toast-slide-out' : 'animate-toast-slide-in'
                    }`}>
                        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-emerald-200/50 min-w-[340px]">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-6 w-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </div>
                                <div className="flex flex-col pr-4">
                                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Success!</span>
                                    <span className="text-xs font-medium text-slate-500">{toastMessage}</span>
                                </div>
                                <button
                                    onClick={() => setIsLeaving(true)}
                                    className="ml-auto p-1 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {newOrderSlips.length > 0 && (
                    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                        {newOrderSlips.map((slip) => (
                            <div key={slip.id} className="w-[360px] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/50">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                        🧾
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="text-sm font-black text-slate-900">New order received</div>
                                        <div className="text-xs text-slate-500">Order {getOrderLabel(slip)} has arrived. Print the kitchen slip now.</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setNewOrderSlips((prev) => prev.filter((item) => item.id !== slip.id))}
                                        className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="mt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            printOrderSlip(slip);
                                            setNewOrderSlips((prev) => prev.filter((item) => item.id !== slip.id));
                                        }}
                                        className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200"
                                    >
                                        Print Slip
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewOrderSlips((prev) => prev.filter((item) => item.id !== slip.id))}
                                        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            {cancelingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setCancelingOrderId(null)}
                    />
                    <div className="relative w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-2xl p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-xl font-bold text-slate-900">Cancel Order</div>
                                <div className="text-sm text-slate-500 mt-1">
                                    Are you sure you want to cancel order <span className="font-bold">#{cancelingOrder.id}</span>?
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            {cancelingOrder.items?.map((it) => (
                                <div key={it.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 p-3 text-sm">
                                    <div className="font-medium text-slate-700">{it.product?.name}</div>
                                    <div className="font-bold text-slate-900">x{it.quantity}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setCancelingOrderId(null)}
                                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Keep Order
                            </button>
                            <button
                                type="button"
                                onClick={() => cancelOrder(cancelingOrder.id)}
                                className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition shadow-sm"
                            >
                                Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
    }

    function PreOrders() {
        const [preOrders, setPreOrdersState] = React.useState([]);
        const [isSending, setIsSending] = React.useState(false);
        const [sendingId, setSendingId] = React.useState(null);
        const [toastMessage, setToastMessage] = React.useState(null);
        const [isLeaving, setIsLeaving] = React.useState(false);
        const [error, setError] = React.useState(null);
        const [showNoteModal, setShowNoteModal] = React.useState(false);
        const [activePreOrder, setActivePreOrder] = React.useState(null);
        const [noteDraft, setNoteDraft] = React.useState('');
        const [modalAction, setModalAction] = React.useState('send');
        const [cancelingPreOrderId, setCancelingPreOrderId] = React.useState(null);

        React.useEffect(() => {
            fetchPreOrders();
        }, []);

        React.useEffect(() => {
            if (!toastMessage) {
                setIsLeaving(false);
                return;
            }

            const displayTimer = window.setTimeout(() => {
                setIsLeaving(true);
            }, 3000);

            const removeTimer = window.setTimeout(() => {
                setToastMessage(null);
            }, 3400);

            return () => {
                window.clearTimeout(displayTimer);
                window.clearTimeout(removeTimer);
            };
        }, [toastMessage]);

        async function fetchPreOrders() {
            try {
                const r = await window.axios.get('/api/orders', {
                    params: { status: 'preorder' },
                });
                setPreOrdersState(r.data);
            } catch (e) {
                setError(e?.message ?? 'Failed to load pre-orders');
            }
        }

        function openNoteModal(preOrder, action = 'send') {
            setActivePreOrder(preOrder);
            setModalAction(action);
            setNoteDraft(preOrder.note ?? '');
            setShowNoteModal(true);
        }

        function closeNoteModal() {
            setShowNoteModal(false);
            setActivePreOrder(null);
            setNoteDraft('');
            setModalAction('send');
        }

        async function patchPreOrder(preOrderId, payload) {
            const r = await window.axios.patch(`/api/orders/${preOrderId}/status`, payload);
            return r.data;
        }

        async function sendToKitchen(preOrder, note = null) {
            setError(null);
            setIsSending(true);
            setSendingId(preOrder.id);

            try {
                const r = await patchPreOrder(preOrder.id, {
                    status: 'new',
                    note: note?.trim() ? note.trim() : null,
                });
                window.localStorage.setItem('lastOrderSlip', JSON.stringify(r));

                const next = preOrders.filter((o) => o.id !== preOrder.id);
                setPreOrdersState(next);
                setToastMessage(`${getOrderLabel(r)} sent to kitchen`);
                closeNoteModal();
            } catch (e) {
                setError(e?.response?.data?.message ?? e?.message ?? 'Failed to send pre-order');
            } finally {
                setIsSending(false);
                setSendingId(null);
            }
        }

        async function savePreOrderNote(preOrder, note = null) {
            setError(null);
            setIsSending(true);
            setSendingId(preOrder.id);

            try {
                const r = await patchPreOrder(preOrder.id, {
                    note: note?.trim() ? note.trim() : null,
                });

                const next = preOrders.map((o) => (o.id === preOrder.id ? r : o));
                setPreOrdersState(next);
                setToastMessage(`Note updated for ${getOrderLabel(r)}`);
                closeNoteModal();
            } catch (e) {
                setError(e?.response?.data?.message ?? e?.message ?? 'Failed to save note');
            } finally {
                setIsSending(false);
                setSendingId(null);
            }
        }

        async function handleNoteModalSubmit() {
            if (!activePreOrder) return;

            if (modalAction === 'send') {
                await sendToKitchen(activePreOrder, noteDraft);
            } else {
                await savePreOrderNote(activePreOrder, noteDraft);
            }
        }

        function openCancelModal(preOrder) {
            setCancelingPreOrderId(preOrder.id);
        }

        function closeCancelModal() {
            setCancelingPreOrderId(null);
        }

        async function cancelPreOrder(preOrderId) {
            setError(null);
            setIsSending(true);
            setSendingId(preOrderId);

            try {
                const r = await patchPreOrder(preOrderId, {
                    status: 'cancelled',
                });

                setPreOrdersState((prev) => prev.filter((o) => o.id !== preOrderId));
                setToastMessage(`${getOrderLabel(r)} cancelled successfully`);
                closeCancelModal();
            } catch (e) {
                setError(e?.response?.data?.message ?? e?.message ?? 'Failed to cancel pre-order');
            } finally {
                setIsSending(false);
                setSendingId(null);
            }
        }

        const safePreOrders = Array.isArray(preOrders) ? preOrders.filter(Boolean) : [];
        const sortedPreOrders = [...safePreOrders].sort(
            (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        );

        return (
            <div className="h-screen overflow-y-auto bg-[#fff7eb] text-slate-900 flex flex-col">
                <header className="flex-none sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <ButtonLink to="/front" className="text-slate-500 hover:text-slate-900">
                                <span className="text-lg">←</span>
                            </ButtonLink>
                            
                            {/* Logo and Text Group */}
                            <div className="flex items-center gap-4">
                                <img 
                                    src="/images/logo.png" 
                                    alt="Logo" 
                                    className="h-14 w-auto object-contain" 
                                />
                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
                                        Pre-Orders
                                    </h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                                        Saved orders waiting to be sent to kitchen
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 mx-auto w-full max-w-[1600px]">
                    {sortedPreOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 italic">
                            <div className="text-5xl mb-4">📦</div>
                            <p className="text-xl font-medium">No pre-orders saved yet.</p>
                            <p className="mt-2 text-sm text-slate-500">Create one from the front desk and it will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {sortedPreOrders.map((o, index) => {
                                const preOrderNumber = o.preorder_number ?? index + 1;
                                const preOrderTotal = (o.items ?? []).reduce((sum, it) => sum + centsFromCartLine(it.product, it.quantity), 0);

                                return (
                                    <div key={o.id ?? `preorder-${index}`} className="flex flex-col bg-white rounded-[2rem] border-b-4 border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                                        <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-white">
                                            <div className="flex flex-col">
                                                <span className="text-2xl font-black text-slate-900 leading-none">Pre-Order #{preOrderNumber}</span>
                                            </div>
                                            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">Held</span>
                                        </div>

                                        {(o.order_type || o.table_number || o.customer_name) && (
                                        <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between gap-2">
                                            {/* Left Side: Order Type and Name/Table */}
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className={`inline-flex shrink-0 items-center rounded-lg px-2 py-1 text-[10px] font-black text-white shadow-sm ${
                                                    o.order_type === 'dine_in' 
                                                        ? 'bg-emerald-500 shadow-emerald-100' 
                                                        : 'bg-blue-600 shadow-blue-100'
                                                }`}>
                                                    {o.order_type === 'dine_in' ? '🍽️ DINE IN' : '🛍️ TAKEOUT'}
                                                </div>
                                                
                                                {(o.table_number || o.customer_name) && (
                                                    <div className="text-sm font-bold text-slate-700 tracking-tight truncate">
                                                        {o.order_type === 'dine_in' ? `Table ${o.table_number}` : o.customer_name}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Side: Payment Mode Magic */}
                                            {o.payment_mode && (
                                                <div className="flex shrink-0 flex-col items-end">
                                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1">Paid via</span>
                                                    <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                                        o.payment_mode === 'gcash' 
                                                            ? 'text-blue-600 border-blue-100 bg-blue-50/50' 
                                                            : 'text-slate-600 border-slate-200 bg-slate-100/50'
                                                    }`}>
                                                        {o.payment_mode}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                        <div className="flex-1 p-5 pb-2 min-h-0 flex flex-col">
                                            <div className="font-black text-[9px] text-slate-300 uppercase tracking-[0.2em] mb-3">Order Items</div>
                                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[220px] space-y-3">
                                                {o.items?.map((it) => (
                                                    <div key={`${o.id}-${it.productId}`} className="space-y-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="text-sm font-bold text-slate-700 leading-tight">{it.product?.name}</div>
                                                            <div className="text-xs font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded shrink-0">x{it.quantity}</div>
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 font-medium">{currencyFromPesos(centsFromCartLine(it.product, it.quantity))}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-black text-slate-900">
                                                <span className="uppercase tracking-widest text-[10px] text-slate-400">Total</span>
                                                <span>{currencyFromPesos(preOrderTotal)}</span>
                                            </div>
                                        </div>

                                        {o.note && (
                                            <div className="px-5 pb-4 mt-4">
                                                <div className="relative rounded-2xl bg-white border border-slate-100 p-3 shadow-sm">
                                                    <div className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-bold uppercase text-amber-500 tracking-tighter border border-slate-100 rounded-full">Note</div>
                                                    <p className="text-[12px] text-slate-600 italic leading-relaxed">“{o.note}”</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-5 space-y-3">
                                            <button
                                                type="button"
                                                disabled={isSending && sendingId === o.id}
                                                onClick={() => openNoteModal(o, 'send')}
                                                                                        className="w-full rounded-2xl bg-slate-900 py-3 text-[11px] font-black text-white shadow-sm transition-all active:scale-95 hover:bg-slate-800"

                                            >
                                                {isSending && sendingId === o.id ? 'Sending…' : 'SEND TO KITCHEN'}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isSending && sendingId === o.id}
                                                onClick={() => openNoteModal(o, 'edit')}
                                                className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-[11px] font-black text-slate-900 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
                                            >
                                                {o.note ? 'Edit Note' : 'Add Note'}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isSending && sendingId === o.id}
                                                onClick={() => openCancelModal(o)}
                                                className="w-full rounded-2xl border border-rose-200 bg-white py-3 text-[11px] font-black text-rose-600 shadow-sm transition-all hover:bg-rose-50 disabled:opacity-50"
                                            >
                                                CANCEL PRE-ORDER
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>

                {showNoteModal && activePreOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40" onClick={closeNoteModal} />
                        <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {modalAction === 'send' ? 'Send Pre-Order to Kitchen' : 'Edit Pre-Order Note'}
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {modalAction === 'send'
                                            ? 'You can add or update the note before sending this pre-order to the kitchen.'
                                            : 'Edit the existing note for this pre-order.'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeNoteModal}
                                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                                    <div>
                                        <div className="font-semibold text-slate-900">Order</div>
                                        <div>{getOrderLabel(activePreOrder)}</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">Placed</div>
                                        <div>{formatOrderDateTime(activePreOrder.created_at)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Kitchen note</label>
                                <textarea
                                    value={noteDraft}
                                    onChange={(e) => setNoteDraft(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                                    placeholder="Add special instructions for the kitchen..."
                                />
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeNoteModal}
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNoteModalSubmit}
                                    disabled={isSending && sendingId === activePreOrder.id}
                                    className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 disabled:opacity-50"
                                >
                                    {isSending && sendingId === activePreOrder.id
                                        ? 'Saving…'
                                        : modalAction === 'send'
                                            ? 'Send to Kitchen'
                                            : 'Save Note'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {cancelingPreOrderId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40" onClick={closeCancelModal} />
                        <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-xl font-bold text-slate-900">Cancel Pre-Order</div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        Are you sure you want to cancel {getOrderLabel(preOrders.find((o) => o.id === cancelingPreOrderId) ?? {})}?
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeCancelModal}
                                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-5 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeCancelModal}
                                    className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Keep Pre-Order
                                </button>
                                <button
                                    type="button"
                                    onClick={() => cancelPreOrder(cancelingPreOrderId)}
                                    disabled={isSending && sendingId === cancelingPreOrderId}
                                    className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
                                >
                                    {isSending && sendingId === cancelingPreOrderId ? 'Cancelling…' : 'Cancel Pre-Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {toastMessage && (
                    <div className={`fixed top-24 right-6 z-50 pointer-events-auto ${isLeaving ? 'animate-toast-slide-out' : 'animate-toast-slide-in'}`}>
                        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-emerald-200/50 min-w-[340px]">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-6 w-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </div>
                                <div className="flex flex-col pr-4">
                                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Success!</span>
                                    <span className="text-xs font-medium text-slate-500">{toastMessage}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="fixed bottom-6 right-6 z-50 w-[360px] rounded-3xl border border-rose-200 bg-white p-4 shadow-2xl shadow-rose-100/60">
                        <div className="text-sm font-semibold text-rose-700">{error}</div>
                    </div>
                )}
            </div>
        );
    }

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ModeSelect />} />
                <Route path="/front" element={<FrontDesk />} />
                <Route path="/front/status" element={<FrontStatus />} />
                <Route path="/front/preorders" element={<PreOrders />} />
                <Route
                    path="/front/history"
                    element={<OrderHistory mode="front" />}
                />
                <Route path="/kitchen" element={<Kitchen />} />
                <Route path="/items" element={<EditItems />} />
                <Route
                    path="/kitchen/history"
                    element={<OrderHistory mode="kitchen" />}
                />
            </Routes>
        </BrowserRouter>
    );
}

const el = document.getElementById('app');
if (el) {
    createRoot(el).render(<App />);
}

