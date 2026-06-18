<?php

namespace App\Http\Controllers;

use App\Http\Middleware\AuthMiddleware;

class PurchaseController extends Controller {
    public function __construct() { (new AuthMiddleware())->handle(); }
    public function index() { return $this->view('purchases.index'); }
}
