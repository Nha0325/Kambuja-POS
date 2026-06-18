<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';
include __DIR__ . '/style_global.php';

/**
 * Simple kitchen ticket: items + qty, no prices.
 */
function render_kitchen_ticket_html(array $invoice, array $items, array $cfg, bool $auto=false): string {
    $floor_label = $invoice['floor_name'] ?? '—';
    $table_label = $invoice['table_no']   ?? '—';
    $created_at  = $invoice['created_at'] ?? '';
    $user_name   = $_SESSION['user']['username'] ?? '—';

    ob_start(); ?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Kitchen Ticket #<?= (int)$invoice['id'] ?></title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    body {
      margin:0;
      padding:8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas,
                   "Liberation Mono", monospace;
      font-size: 13px;
    }
    .ticket { width: 76mm; margin: 0 auto; }
    .center { text-align:center; }
    .bold { font-weight:700; }
    .big { font-size: 20px; letter-spacing: 1px; }
    .sm { font-size: 12px; }
    .line { margin:6px 0; border-top:1px solid #000; }
    .noprint { margin-top:10px; }

    table { border-collapse:collapse; width:100%; }
    th, td { padding:2px 3px; }
    th { border-bottom:1px solid #000; text-align:left; }
    .qty { text-align:right; width:40px; }

    @media print {
      .noprint { display:none; }
      body { padding:0; }
    }
    button { padding:6px 10px; }
  </style>
</head>
<body>
  <div class="ticket">

    <div class="center big bold">KITCHEN</div>
    <div class="center sm">
      <?= htmlspecialchars($cfg['title'] ?? ($cfg['company_name'] ?? 'FTC POS')) ?>
    </div>
    <div class="line"></div>

    <div class="sm" style="margin-top:4px;">
      <div>Floor/Table: <?= htmlspecialchars($floor_label) ?>/<?= htmlspecialchars($table_label) ?></div>
      <div>Order #: #<?= (int)$invoice['id'] ?></div>
      <div>Time: <?= htmlspecialchars($created_at) ?></div>
      <div>Cashier: <?= htmlspecialchars($user_name) ?></div>
    </div>

    <div class="line"></div>

    <table class="sm">
      <thead>
        <tr>
          <th>Item</th>
          <th class="qty">Qty</th>
        </tr>
      </thead>
      <tbody>
      <?php if (!$items): ?>
        <tr><td colspan="2" class="center">No items.</td></tr>
      <?php else: ?>
        <?php foreach ($items as $r): ?>
          <tr>
            <td><?= htmlspecialchars($r['name'] ?? '') ?></td>
            <td class="qty"><?= (int)($r['qty'] ?? 0) ?></td>
          </tr>
        <?php endforeach; ?>
      <?php endif; ?>
      </tbody>
    </table>

    <div class="line"></div>
    <div class="center sm">** For Kitchen Use Only **</div>

    <div class="center noprint">
      <button onclick="window.print()">Print</button>
    </div>
  </div>

  <?php if ($auto): ?>
  <script>
    window.onload = () => { window.print(); };
  </script>
  <?php endif; ?>
</body>
</html>
<?php
    return ob_get_clean();
}

/* ==================== MAIN ==================== */

$invoice_id = (int)($_GET['invoice_id'] ?? 0);
$auto       = isset($_GET['auto']);
$type       = $_GET['type'] ?? null;     // 'kitchen' or null

if (!$invoice_id) {
    echo "Missing invoice_id";
    exit;
}

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // make sure totals are fresh (subtotal, discount, total...)
    calc_totals($invoice_id);

    // load invoice (with floor/table)
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

    // load items
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

    // receipt / company settings
    $cfg = receipt_settings();

    /* ---------- KITCHEN PRINT (no logging to reports) ---------- */
    if ($type === 'kitchen') {
        echo render_kitchen_ticket_html($inv, $items, $cfg, $auto);
        exit;
    }

    /* ---------- PRE-ORDER / RECEIPT PRINT (with logging) ---------- */

    // decide print_type for logs
    // if invoice already paid => this is a receipt re-print
    // otherwise => this is a pre-order print
    $print_type = ($inv['status'] === 'paid') ? 'receipt' : 'preorder';

    // current user
    $user    = current_user();
    $user_id = $user['id'] ?? null;

    if ($print_type === 'preorder') {
        /**
         * PRE-ORDER:
         * Use the new helper to log a full snapshot:
         *   - items
         *   - subtotal_usd/khr
         *   - discount_usd/khr
         *   - total_usd/khr
         * so reports_preorder_vs_receipts.php can show
         * សរុប / បញ្ចុះតម្លៃ / ទឹកប្រាក់ត្រូវបង់
         * exactly like the pre-print.
         */
        if ($user_id) {
            try {
                log_preorder_snapshot($invoice_id, (int)$user_id);
            } catch (Throwable $e) {
                // don't block printing if logging fails
            }
        }
    } else {
        /**
         * RECEIPT:
         * Keep old simple logging (array of items only).
         * Reports only use receipt logs for count/time,
         * so this format is still OK.
         */
        $items_snapshot = [];
        foreach ($items as $r) {
            // normalize discount: store NULL if no discount, so report can show "-"
            $disc = isset($r['discount_pct']) ? (float)$r['discount_pct'] : null;
            if ($disc <= 0) {
                $disc = null;
            }

            $items_snapshot[] = [
                'name'           => $r['name'],
                'qty'            => (int)$r['qty'],
                'price_usd'      => (float)$r['price_usd'],
                'price_khr'      => (int)$r['price_khr'],
                'line_total_usd' => (float)$r['line_total_usd'],
                'line_total_khr' => (int)$r['line_total_khr'],
                'discount_pct'   => $disc,   // will be null if no per-item discount
            ];
        }
        $items_json = json_encode($items_snapshot, JSON_UNESCAPED_UNICODE);

        // log into receipt_print_logs (if table exists)
        try {
            $log = $pdo->prepare("
                INSERT INTO receipt_print_logs
                    (invoice_id, print_type, user_id, items_json, printed_at)
                VALUES (?, ?, ?, ?, NOW())
            ");
            $log->execute([
                $invoice_id,
                $print_type,
                $user_id,
                $items_json
            ]);
        } catch (Throwable $e) {
            // ignore logging errors – don't block printing
        }
    }

    // render normal receipt (works for both pre-order + receipt)
    echo render_receipt_html($inv, $items, $cfg, $auto);

} catch (Throwable $e) {
    http_response_code(500);
    echo "<pre style='padding:1em;background:#fff3cd;border:1px solid #ffeeba;font-family:monospace'>";
    echo "Print error: " . htmlspecialchars($e->getMessage());
    echo "</pre>";
}
