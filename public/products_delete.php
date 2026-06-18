<?php
require_once __DIR__ . '/../auth.php';
require_role('admin');
require_once __DIR__ . '/../helpers.php';

try {
    // Accept POST or GET (to make it easier)
    $method = $_SERVER['REQUEST_METHOD'];
    if (!in_array($method, ['POST','GET'], true)) {
        http_response_code(405);
        echo "Method Not Allowed";
        exit;
    }

    $id = (int)(($_POST['id'] ?? $_GET['id'] ?? 0));
    if ($id <= 0) {
        throw new Exception("Invalid product ID.");
    }

    $pdo = db();

    // Confirm product exists
    $chk = $pdo->prepare("SELECT id FROM products WHERE id=?");
    $chk->execute([$id]);
    if (!$chk->fetch()) {
        throw new Exception("Product not found.");
    }

    // Soft delete (mark inactive)
    $upd = $pdo->prepare("UPDATE products SET is_active=0 WHERE id=?");
    $upd->execute([$id]);

    // Redirect back to list
    header("Location: products.php?deleted=1");
    exit;

} catch (Throwable $e) {
    http_response_code(500);
    echo "<h3>Delete Failed</h3>";
    echo "<p style='color:red;white-space:pre-wrap;'>".htmlspecialchars($e->getMessage())."</p>";
}
