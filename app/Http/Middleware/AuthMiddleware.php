<?php

namespace App\Http\Middleware;

class AuthMiddleware {
    public function handle() {
        if (!isset($_SESSION['user'])) {
            header("Location: " . BASE_URL . "/login");
            exit;
        }
    }
}
