<?php

use App\Http\Controllers\Api\KitchenController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/manage', [ProductController::class, 'manageIndex']);
Route::patch('/products/{product}', [ProductController::class, 'update']);

Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);

Route::get('/kitchen/orders', [KitchenController::class, 'index']);
Route::patch('/order-items/{orderItem}/toggle-done', [KitchenController::class, 'toggleItemDone']);


