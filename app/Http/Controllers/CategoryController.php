<?php

namespace App\Http\Controllers;

use App\Http\Middleware\AuthMiddleware;

class CategoryController extends Controller {
    public function __construct() { (new AuthMiddleware())->handle(); }
    public function index() { return $this->view('categories.index'); }
    public function create() { return $this->view('categories.create'); }
}
