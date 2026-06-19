<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$floor_id = (int)($_GET['floor'] ?? 0);
$table_id = (int)($_GET['table'] ?? 0);

if (!$floor_id || !$table_id) {
    redirect('index.php');
}

/**
 * IMPORTANT:
 * - Do NOT create invoice here
 * - Do NOT set tables.status = 'busy'
 * 
 * Just go to sale.php with floor/table.
 * sale.php will show "Order #New" until first item is added.
 * api_cart.php will create invoice on first ADD and mark table busy.
 */
redirect('sale.php?floor=' . $floor_id . '&table=' . $table_id);
