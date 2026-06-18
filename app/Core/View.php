<?php

namespace App\Core;

class View
{
    public static function render(string $view, array $data = []): void
    {
        extract($data);
        $viewPath = __DIR__ . '/../../resources/views/' . str_replace('.', '/', $view) . '.php';

        if (!is_file($viewPath)) {
            throw new \RuntimeException("View not found: {$view}");
        }

        require $viewPath;
    }
}
