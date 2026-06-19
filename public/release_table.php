<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$invoice_id = (int)($_GET['invoice'] ?? 0);
if (!$invoice_id) {
    redirect('index.php');
}

try {
    // Load invoice basic info
    $st = $pdo->prepare("
        SELECT id, order_type, floor_id, table_id, status
        FROM invoices
        WHERE id = ?
        LIMIT 1
    ");
    $st->execute([$invoice_id]);
    $inv = $st->fetch();

    if (!$inv) {
        // Invoice not found -> just go back to table view
        redirect('index.php');
    }

    $order_type = $inv['order_type'] ?? 'table';
    $table_id   = !empty($inv['table_id']) ? (int)$inv['table_id'] : 0;

    // Count items in this invoice
    $cntSt = $pdo->prepare("SELECT COUNT(*) FROM invoice_items WHERE invoice_id = ?");
    $cntSt->execute([$invoice_id]);
    $item_count = (int)$cntSt->fetchColumn();

    // Only handle table orders (takeaway has no physical table)
    if ($order_type === 'table' && $table_id > 0) {

        if ($item_count === 0) {
            // ===========================
            // CASE 1: No items
            // ===========================
            // Just free the table – DO NOT touch invoice.status
            $freeTable = $pdo->prepare("UPDATE tables SET status = 'free' WHERE id = ?");
            $freeTable->execute([$table_id]);

        } else {
            // ===========================
            // CASE 2: Has items
            // ===========================
            // Keep/set table BUSY
            $busyTable = $pdo->prepare("UPDATE tables SET status = 'busy' WHERE id = ?");
            $busyTable->execute([$table_id]);
        }
    }

    // Finally go back to table view
    redirect('index.php');

} catch (Throwable $e) {
    // Avoid HTTP 500 blank page – show debug (you can later change to logging only)
    echo "<pre style='padding:1em;background:#fff3cd;border:1px solid #ffeeba;font-family:monospace'>";
    echo "<b>Release table error:</b> " . htmlspecialchars($e->getMessage());
    echo "</pre>";
    exit;
}
