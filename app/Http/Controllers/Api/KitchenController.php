<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class KitchenController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status');

        return Order::query()
            ->when($status, fn ($q) => $q->where('status', $status))
            ->whereIn('status', ['new', 'in_progress'])
            ->with(['items.product'])
            ->orderByDesc('id')
            ->limit(100)
            ->get();
    }

    public function toggleItemDone(OrderItem $orderItem)
    {
        $orderItem->update([
            'is_done' => ! $orderItem->is_done,
        ]);

        $order = Order::query()
            ->with(['items.product'])
            ->findOrFail($orderItem->order_id);

        return $order;
    }
}
