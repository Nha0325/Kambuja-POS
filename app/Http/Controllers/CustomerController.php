<?php

namespace App\Http\Controllers;

use App\Http\Middleware\AuthMiddleware;

class CustomerController extends Controller {
    public function __construct() { (new AuthMiddleware())->handle(); }
    public function index() { return $this->view('customers.index'); }
    public function create() { return $this->view('customers.create'); }
}
