<?php

namespace App\Http\Controllers;

use App\Http\Middleware\AuthMiddleware;

class SettingController extends Controller {
    public function __construct() { (new AuthMiddleware())->handle(); }
    public function index() { return $this->view('settings.index'); }
}
