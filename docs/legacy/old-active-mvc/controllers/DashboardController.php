<?php

namespace App\Http\Controllers;

use App\Http\Middleware\AuthMiddleware;

class DashboardController extends Controller {
    public function __construct() {
        (new AuthMiddleware())->handle();
    }

    public function index() {
        // Fetch stats: total products, customers, suppliers, today sales, low stock items, recent sales
        // Stub for now
        $stats = [
            'total_products' => 0,
            'total_customers' => 0,
            'total_suppliers' => 0,
            'today_sales' => 0,
            'low_stock_items' => [],
            'recent_sales' => []
        ];

        return $this->view('dashboard.index', compact('stats'));
    }
}
