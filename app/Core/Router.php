<?php

namespace App\Core;

class Router
{
    private array $routes = [];

    public function get(string $path, $callback, array $middleware = []): void
    {
        $this->add('GET', $path, $callback, $middleware);
    }

    public function post(string $path, $callback, array $middleware = []): void
    {
        $this->add('POST', $path, $callback, $middleware);
    }

    public function add(string $method, string $path, $callback, array $middleware = []): void
    {
        $this->routes[strtoupper($method)][] = [
            'path' => '/' . ltrim($path, '/'),
            'callback' => $callback,
            'middleware' => $middleware,
        ];
    }

    public function dispatch(Request $request): void
    {
        foreach ($this->routes[$request->method()] ?? [] as $route) {
            $parameters = $this->match($route['path'], $request->path());

            if ($parameters === null) {
                continue;
            }

            $request->setRouteParameters($parameters);

            foreach ($route['middleware'] as $middleware) {
                if ($middleware->handle($request) === false) {
                    return;
                }
            }

            $this->invoke($route['callback'], $request, $parameters);
            return;
        }

        Response::abort(404, 'errors.404');
    }

    private function match(string $routePath, string $requestPath): ?array
    {
        $parameterNames = [];
        $pattern = preg_replace_callback(
            '/\{([A-Za-z_][A-Za-z0-9_]*)\}/',
            static function (array $matches) use (&$parameterNames): string {
                $parameterNames[] = $matches[1];
                return '([^/]+)';
            },
            $routePath
        );

        if (!preg_match('#^' . $pattern . '$#', $requestPath, $matches)) {
            return null;
        }

        array_shift($matches);
        return array_combine($parameterNames, array_map('urldecode', $matches)) ?: [];
    }

    private function invoke($callback, Request $request, array $parameters): void
    {
        $arguments = array_values($parameters);

        if (is_array($callback)) {
            $controller = new $callback[0]();
            $method = $callback[1];
            $controller->{$method}($request, ...$arguments);
            return;
        }

        $callback($request, ...$arguments);
    }
}
