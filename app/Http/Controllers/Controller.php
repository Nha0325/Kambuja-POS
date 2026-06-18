<?php

namespace App\Http\Controllers;

class Controller {
    protected function view($view, $data = []) {
        extract($data);
        $viewPath = __DIR__ . '/../../../resources/views/' . str_replace('.', '/', $view) . '.php';
        
        if (file_exists($viewPath)) {
            require $viewPath;
        } else {
            die("View $view not found at $viewPath");
        }
    }

    protected function redirect($url) {
        header("Location: " . BASE_URL . $url);
        exit;
    }
}
