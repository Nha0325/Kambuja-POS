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
    $pdo->beginTransaction();

    // Lock this invoice row
    $st = $pdo->prepare("
        SELECT id, order_type, floor_id, table_id, status
        FROM invoices
        WHERE id = ?
        FOR UPDATE
    ");
    $st->execute([$invoice_id]);
    $inv = $st->fetch();

    if (!$inv) {
        throw new Exception('Invoice not found');
    }

    // Only allow clear on open invoices
    if ($inv['status'] !== 'open') {
        // nothing to clear, just go back
        $pdo->commit();
        redirect('index.php');
    }

    // 1) Delete all items of this invoice
    $delItems = $pdo->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
    $delItems->execute([$invoice_id]);

    // 2) Reset invoice totals BUT keep same ID and keep it OPEN
    $updInv = $pdo->prepare("
        UPDATE invoices
           SET subtotal_usd        = 0.00,
               subtotal_khr        = 0,
               total_usd           = 0.00,
               total_khr           = 0,
               discount_pct        = 0,
               discount_amount_usd = 0.00,
               discount_amount_khr = 0,
               pay_currency        = NULL,
               cash_in_usd         = 0.00,
               cash_in_khr         = 0,
               change_usd          = 0.00,
               change_khr          = 0,
               paid_at             = NULL
         WHERE id = ?
    ");
    $updInv->execute([$invoice_id]);

    // 3) Free table status (table can be reused, but invoice id stays)
    if ($inv['order_type'] === 'table' && !empty($inv['table_id'])) {
        $updTable = $pdo->prepare("UPDATE tables SET status = 'free' WHERE id = ?");
        $updTable->execute([(int)$inv['table_id']]);
    }

    $pdo->commit();

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "Cancel error: " . htmlspecialchars($e->getMessage());
    exit;
}

// Back to main tables screen
redirect('index.php');
