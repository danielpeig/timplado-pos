<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('products')
            ->where('name', 'Pork HumBuns')
            ->update(['price_pesos' => 120]);
    }

    public function down(): void
    {
        DB::table('products')
            ->where('name', 'Pork HumBuns')
            ->update(['price_pesos' => 99]);
    }
};
