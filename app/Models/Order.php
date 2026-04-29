<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'status',
        'note',
        'order_type',
        'table_number',
        'customer_name',
        'payment_mode',
        'preorder_number',
        'completed_at',
        'total',
        'subtotal',
        'discount_amount',
        'discount_details',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'discount_details' => 'array',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
