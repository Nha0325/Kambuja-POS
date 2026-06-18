<?php

namespace App\Core;

class Request
{
    private string $method;
    private string $uri;
    private array $routeParameters = [];

    public function __construct(string $method, string $uri)
    {
        $this->method = strtoupper($method);
        $this->uri = $uri;
    }

    public static function capture(): self
    {
        return new self(
            $_SERVER['REQUEST_METHOD'] ?? 'GET',
            $_SERVER['REQUEST_URI'] ?? '/'
        );
    }

    public function method(): string
    {
        return $this->method;
    }

    public function path(): string
    {
        $path = parse_url($this->uri, PHP_URL_PATH) ?: '/';
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $basePath = rtrim(str_replace('/index.php', '', $scriptName), '/');

        if ($basePath !== '' && strpos($path, $basePath) === 0) {
            $path = substr($path, strlen($basePath)) ?: '/';
        }

        return '/' . ltrim($path, '/');
    }

    public function input(string $key, $default = null)
    {
        return $_POST[$key] ?? $_GET[$key] ?? $default;
    }

    public function all(): array
    {
        return array_merge($_GET, $_POST);
    }

    public function setRouteParameters(array $parameters): void
    {
        $this->routeParameters = $parameters;
    }

    public function route(string $key, $default = null)
    {
        return $this->routeParameters[$key] ?? $default;
    }
}
