<?php

namespace App\Core;

class View {
    public static function render($view, $data = []) {
        extract($data);
        $viewPath = __DIR__ . '/../../resources/views/' . str_replace('.', '/', $view) . '.php';
        
        if (file_exists($viewPath)) {
            require $viewPath;
        } else {
            die("View not found: $view");
        }
    }
}
