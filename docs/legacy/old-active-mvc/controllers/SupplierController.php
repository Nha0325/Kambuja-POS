<?php

namespace App\Http\Controllers;

use App\Http\Middleware\AuthMiddleware;

class SupplierController extends Controller {
    public function __construct() { (new AuthMiddleware())->handle(); }
    public function index() { return $this->view('suppliers.index'); }
    public function create() { return $this->view('suppliers.create'); }
}
