<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            // Drinks and Desserts
            ['name' => 'Ube Refresher', 'price_pesos' => 120, 'category' => 'Drinks and Desserts', 'sort_order' => 10, 'image_url' => '/images/uberefresh.png'],
            ['name' => 'Ube Latte', 'price_pesos' => 125, 'category' => 'Drinks and Desserts', 'sort_order' => 20, 'image_url' => '/images/ubelatte.png'],
            ['name' => 'Cucumber Calamansi Juice', 'price_pesos' => 90, 'category' => 'Drinks and Desserts', 'sort_order' => 30, 'image_url' => '/images/cucumber.png'],
            ['name' => 'Putli Mandi', 'price_pesos' => 85, 'category' => 'Drinks and Desserts', 'sort_order' => 40, 'image_url' => '/images/putliman.png'],

            // Meals
            ['name' => 'Chicken Inasal Tanglad Rice', 'price_pesos' => 170, 'category' => 'Meals', 'sort_order' => 50, 'image_url' => '/images/inasal.png'],
            ['name' => 'Sinaing na Tilapia', 'price_pesos' => 160, 'category' => 'Meals', 'sort_order' => 60, 'image_url' => '/images/tilapia.png'],
            ['name' => 'Pork HumBuns', 'price_pesos' => 99, 'category' => 'Meals', 'sort_order' => 70, 'image_url' => '/images/banme.png'],

            // Add Ons
            ['name' => 'Sea Salt Cream', 'price_pesos' => 10, 'category' => 'Add Ons', 'sort_order' => 80],
            ['name' => 'Cup Holder Packaging', 'price_pesos' => 10, 'category' => 'Add Ons', 'sort_order' => 90],
        ];

        foreach ($items as $item) {
            Product::updateOrCreate(
                ['name' => $item['name']],
                [
                    'image_url' => $item['image_url'] ?? null,
                    'price_pesos' => is_null($item['price_pesos'])
                        ? null
                        : (int) $item['price_pesos'],
                    'category' => $item['category'],
                    'stock' => $item['stock'] ?? 20,
                    'is_active' => true,
                    'sort_order' => $item['sort_order'],
                ],
            );
        }
    }
}
