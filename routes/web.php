<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;

$router->get('/', [DashboardController::class, 'index']);
$router->get('/dashboard', [DashboardController::class, 'index']);
$router->get('/login', [AuthController::class, 'showLoginForm']);
$router->post('/login', [AuthController::class, 'login']);
$router->get('/logout', [AuthController::class, 'logout']);

$router->get('/products', [ProductController::class, 'index']);
$router->get('/categories', [CategoryController::class, 'index']);
$router->get('/customers', [CustomerController::class, 'index']);
$router->get('/suppliers', [SupplierController::class, 'index']);
$router->get('/sales', [SaleController::class, 'index']);
$router->get('/purchases', [PurchaseController::class, 'index']);
$router->get('/stock', [StockController::class, 'index']);
$router->get('/reports', [ReportController::class, 'index']);
$router->get('/settings', [SettingController::class, 'index']);
