<?php

namespace App\Core;

class Router {
    private $routes = [];

    public function get($path, $callback) {
        $this->routes['GET'][$path] = $callback;
    }

    public function post($path, $callback) {
        $this->routes['POST'][$path] = $callback;
    }

    public function dispatch($method, $uri) {
        $path = parse_url($uri, PHP_URL_PATH);
        $base = str_replace('/public/index.php', '', $_SERVER['SCRIPT_NAME']);
        if (strpos($path, $base) === 0) {
            $path = substr($path, strlen($base));
        }
        if ($path === '') $path = '/';
        
        $callback = $this->routes[$method][$path] ?? false;

        if ($callback === false) {
            http_response_code(404);
            echo "404 Not Found";
            return;
        }

        if (is_array($callback)) {
            $controller = new $callback[0]();
            $method = $callback[1];
            return $controller->$method();
        }

        return call_user_func($callback);
    }
}
