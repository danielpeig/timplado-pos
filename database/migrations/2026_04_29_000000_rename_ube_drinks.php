<?php

use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Product::where('name', 'Ube Coconut Refresher')->update(['name' => 'Ube Refresher']);
        Product::where('name', 'Ube Coconut Latte')->update(['name' => 'Ube Latte']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Product::where('name', 'Ube Refresher')->update(['name' => 'Ube Coconut Refresher']);
        Product::where('name', 'Ube Latte')->update(['name' => 'Ube Coconut Latte']);
    }
};