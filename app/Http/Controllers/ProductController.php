<?php

namespace App\Http\Controllers;

use App\Http\Middleware\AuthMiddleware;

class ProductController extends Controller {
    public function __construct() { (new AuthMiddleware())->handle(); }
    public function index() { return $this->view('products.index'); }
}
