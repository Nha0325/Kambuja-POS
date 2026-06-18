<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$invoice_id = (int)($_GET['invoice_id'] ?? 0);
$auto       = isset($_GET['auto']);

if (!$invoice_id) {
    echo "Missing invoice_id";
    exit;
}

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // 👉 Make sure totals (subtotal / total) are fresh
    //    - subtotal_*  = sum of line_total_* (after item discounts)
    //    - total_*     = subtotal_* after whole invoice discount_pct
    calc_totals($invoice_id);

    // Reload invoice after calc_totals so we get updated subtotal/total
    $st = $pdo->prepare("
        SELECT i.*, f.name AS floor_name, t.table_no
        FROM invoices i
        LEFT JOIN floors f ON f.id = i.floor_id
        LEFT JOIN tables t ON t.id = i.table_id
        WHERE i.id = ?
    ");
    $st->execute([$invoice_id]);
    $inv = $st->fetch();
    if (!$inv) {
        throw new Exception('Invoice not found');
    }

    // Load items with price, line_total and item discount
    $it = $pdo->prepare("
        SELECT 
          name,
          qty,
          price_usd,
          price_khr,
          line_total_usd,
          line_total_khr,
          discount_pct
        FROM invoice_items
        WHERE invoice_id = ?
        ORDER BY id
    ");
    $it->execute([$invoice_id]);
    $items = $it->fetchAll();

    // Get company / receipt settings
    $cfg = receipt_settings();

    // Render the receipt (this already handles:
    // - item original price
    // - item discount
    // - whole invoice discount
    // - total discount value
    echo render_receipt_html($inv, $items, $cfg, $auto);

} catch (Throwable $e) {
    http_response_code(500);
    echo "<pre style='padding:1em;background:#fff3cd;border:1px solid #ffeeba;font-family:monospace'>";
    echo "Print error: " . htmlspecialchars($e->getMessage());
    echo "</pre>";
}
