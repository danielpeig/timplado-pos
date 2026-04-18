<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return Product::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    public function manageIndex()
    {
        return Product::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'is_active' => ['sometimes', 'boolean'],
            'name' => ['sometimes', 'string', 'max:255'],
            'price_cents' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:1000000'],
            'stock' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
            'image_url' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
        ]);

        $product->update($data);

        return $product->fresh();
    }
}
