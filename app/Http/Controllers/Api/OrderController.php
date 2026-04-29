<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status');
        $active = $request->boolean('active');
        $analytics = $request->boolean('analytics');
        $date = $request->query('date');

        $query = Order::query()
            ->when($status, function ($q, $status) {
                if (is_array($status)) {
                    return $q->whereIn('status', $status);
                }

                return $q->where('status', $status);
            })
            ->when($active, fn ($q) => $q->whereIn('status', ['new', 'in_progress']))
            ->when($date, fn ($q, $date) => $q->whereDate('completed_at', $date))
            ->when($analytics, fn ($q) => $q->where('status', '!=', 'archived'));

        if (! $analytics) {
            $query->limit(200);
        }

        return $query
            ->with(['items.product'])
            ->orderByDesc('id')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'note' => ['nullable', 'string', 'max:2000'],
            'order_type' => ['required', 'string', 'in:dine_in,takeout'],
            'table_number' => ['required_if:order_type,dine_in', 'nullable', 'string', 'max:255'],
            'customer_name' => ['required_if:order_type,takeout', 'nullable', 'string', 'max:255'],
            'payment_mode' => ['required', 'string', 'in:cash,gcash'],
            'status' => ['sometimes', 'string', 'in:new,preorder'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        try {
            $order = DB::transaction(function () use ($data) {
                $preorderNumber = null;
                if (($data['status'] ?? 'new') === 'preorder') {
                    $preorderNumber = (int) Order::whereNotNull('preorder_number')->max('preorder_number') + 1;
                }

                $order = Order::create([
                    'status' => $data['status'] ?? 'new',
                    'note' => $data['note'] ?? null,
                    'order_type' => $data['order_type'],
                    'table_number' => $data['order_type'] === 'dine_in' ? ($data['table_number'] ?? null) : null,
                    'customer_name' => $data['order_type'] === 'takeout' ? ($data['customer_name'] ?? null) : null,
                    'payment_mode' => $data['payment_mode'],
                    'preorder_number' => $preorderNumber,
                ]);

                foreach ($data['items'] as $item) {
                    $product = Product::where('id', $item['product_id'])->lockForUpdate()->first();

                    if (! $product || $product->stock < $item['quantity']) {
                        throw new \RuntimeException('Not enough stock for one or more items.');
                    }

                    $product->decrement('stock', $item['quantity']);

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'is_done' => false,
                    ]);
                }

                return $order;
            });
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        $order->load(['items.product']);

        return response()->json($order, 201);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['sometimes', 'string', 'in:new,in_progress,done,cancelled,archived'],
            'note' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'payment_mode' => ['sometimes', 'string', 'in:cash,gcash'],
        ]);

        if (empty($data)) {
            return response()->json([
                'message' => 'No changes provided.',
            ], 422);
        }

        $update = [];

        if (array_key_exists('status', $data)) {
            $update['status'] = $data['status'];

            if ($data['status'] === 'done') {
                $update['completed_at'] = now();
            } elseif ($data['status'] === 'cancelled') {
                $update['completed_at'] = null;
            }
        }

        if (array_key_exists('note', $data)) {
            $update['note'] = $data['note'];
        }

        if (array_key_exists('payment_mode', $data)) {
            $update['payment_mode'] = $data['payment_mode'];
        }

        $order->update($update);

        $order->load(['items.product']);

        return $order;
    }
}
