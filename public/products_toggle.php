<?php
require_once __DIR__ . '/../auth.php';
require_role('admin');
require_once __DIR__ . '/../helpers.php';

$id = (int)($_POST['id'] ?? 0);
$val = (int)($_POST['is_active'] ?? 0);

if (!$id) { http_response_code(400); echo "Invalid id"; exit; }

$u = db()->prepare("UPDATE products SET is_active=? WHERE id=?");
$u->execute([$val, $id]);
header("Location: products.php");
