<?php

namespace App\Http\Controllers;

use App\Http\Middleware\AuthMiddleware;

class StockController extends Controller {
    public function __construct() { (new AuthMiddleware())->handle(); }
    public function index() { return $this->view('stock.index'); }
}
