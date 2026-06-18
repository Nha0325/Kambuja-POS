<?php

namespace App\Support;

class Paginator
{
    public static function offset(int $page, int $perPage): int
    {
        return max(0, ($page - 1) * $perPage);
    }
}
