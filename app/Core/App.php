<?php

namespace App\Core;

class App
{
    private Router $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function run(): void
    {
        $request = Request::capture();
        $this->router->dispatch($request);
    }
}
