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
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
