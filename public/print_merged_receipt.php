<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$payment_id = (int)($_GET['payment_id'] ?? 0);
if (!$payment_id) {
    die('Missing payment_id');
}

// type=pre → Pre-Print; anything else → Payment Receipt
$type = $_GET['type'] ?? 'payment';

// Settings / company info
$s = get_settings();
$company_name = $s['company_name'] ?? 'FTC POS';
$rate_default = (int)($s['usd_to_khr'] ?? 4100);

// Load payment
$st = $pdo->prepare("SELECT * FROM payments WHERE id=? LIMIT 1");
$st->execute([$payment_id]);
$payment = $st->fetch(PDO::FETCH_ASSOC);
if (!$payment) {
    die('Payment not found');
}

$pay_currency = $payment['pay_currency'] ?? 'USD';
$total_usd    = (float)($payment['total_usd'] ?? 0);
$total_khr    = (int)  ($payment['total_khr'] ?? 0);
$cash_usd     = (float)($payment['cash_in_usd'] ?? 0);
$cash_khr     = (int)  ($payment['cash_in_khr'] ?? 0);
$change_usd   = (float)($payment['change_usd'] ?? 0);
$change_khr   = (int)  ($payment['change_khr'] ?? 0);
$cashier_id   = (int)  ($payment['cashier_user_id'] ?? 0);

// Optional: load cashier username
$cashier_name = '';
try {
    $stUser = $pdo->prepare("SELECT username FROM users WHERE id=? LIMIT 1");
    $stUser->execute([$cashier_id]);
    $cashier_name = (string)$stUser->fetchColumn();
} catch (Throwable $e) {
    $cashier_name = '';
}

// Load invoices linked to this payment
$stInv = $pdo->prepare("
    SELECT i.*,
           f.name     AS floor_name,
           t.table_no AS table_no
      FROM payment_invoices pi
      JOIN invoices i ON i.id = pi.invoice_id
 LEFT JOIN floors   f ON f.id = i.floor_id
 LEFT JOIN tables   t ON t.id = i.table_id
     WHERE pi.payment_id = ?
  ORDER BY i.created_at, i.id
");
$stInv->execute([$payment_id]);
$invoices = $stInv->fetchAll(PDO::FETCH_ASSOC);
if (!$invoices) {
    die('No invoices linked to this payment');
}

// Load ALL items of ALL merged invoices
$stItems = $pdo->prepare("
    SELECT ii.*
      FROM payment_invoices pi
      JOIN invoice_items ii ON ii.invoice_id = pi.invoice_id
     WHERE pi.payment_id = ?
  ORDER BY ii.invoice_id, ii.id
");
$stItems->execute([$payment_id]);
$allItems = $stItems->fetchAll(PDO::FETCH_ASSOC);

// Group items by invoice_id
$itemsByInvoice = [];
foreach ($allItems as $row) {
    $invId = (int)$row['invoice_id'];
    if (!isset($itemsByInvoice[$invId])) {
        $itemsByInvoice[$invId] = [];
    }
    $itemsByInvoice[$invId][] = $row;
}

// Title text
if ($type === 'pre') {
    $title = 'Pre-Print (Merged)';
} else {
    $title = 'Payment Receipt (Merged)';
}

$now = date('Y-m-d H:i:s');
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title><?= htmlspecialchars($company_name) ?> – <?= htmlspecialchars($title) ?></title>
  <style>
    body {
      font-family: "Khmer OS System","Khmer OS Battambang",Arial,sans-serif;
      font-size: 12px;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .receipt-wrap {
      width: 80mm;
      margin: 0 auto;
      padding: 5px 5px 20px;
    }
    .center { text-align: center; }
    .right  { text-align: right; }
    .bold   { font-weight: bold; }
    .mt-5   { margin-top: 5px; }
    .mt-10  { margin-top: 10px; }
    .border-top {
      border-top: 1px dashed #000;
      margin-top: 3px;
      padding-top: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 2px 0;
    }
    th {
      border-bottom: 1px dashed #000;
      font-weight: bold;
      text-align: left;
    }
    .small { font-size: 11px; }
    .invoice-block {
      margin-top: 8px;
    }
    .invoice-title {
      font-weight: bold;
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      padding: 3px 0;
      margin-top: 5px;
    }
    @media print {
      body { background: #fff; }
    }
  </style>
</head>
<body onload="<?php if (!empty($_GET['auto'])) echo 'window.print();'; ?>">
<div class="receipt-wrap">

  <!-- Header -->
  <div class="center">
    <div class="bold"><?= htmlspecialchars($company_name) ?></div>
    <div class="small">Merged Receipt</div>
    <div class="small"><?= htmlspecialchars($title) ?></div>
  </div>

  <div class="mt-5 small">
    <div>Payment ID: <strong>#<?= $payment_id ?></strong></div>
    <div>Date/Time: <?= htmlspecialchars($now) ?></div>
    <?php if ($cashier_name || $cashier_id): ?>
      <div>Cashier: <?= htmlspecialchars($cashier_name ?: ('User '.$cashier_id)) ?></div>
    <?php endif; ?>
    <div>Rate: 1 USD = <?= (int)$rate_default ?> ៛</div>
  </div>

  <!-- List of invoices -->
  <div class="mt-10 small">
    <div class="bold">Invoices merged:</div>
    <?php foreach ($invoices as $inv): ?>
      <?php
        $invId   = (int)$inv['id'];
        $typeTxt = ($inv['order_type'] ?? 'table') === 'takeaway' ? 'Take Away' : 'Table';
        $floor   = $inv['floor_name'] ?? '-';
        $table   = $inv['table_no']   ?? '-';
      ?>
      <div>
        #<?= $invId ?> (<?= htmlspecialchars($typeTxt) ?> – <?= htmlspecialchars($floor.'/'.$table) ?>)
      </div>
    <?php endforeach; ?>
  </div>

  <!-- Items for each invoice -->
  <div class="mt-10">
    <?php foreach ($invoices as $inv): ?>
      <?php
        $invId   = (int)$inv['id'];
        $typeTxt = ($inv['order_type'] ?? 'table') === 'takeaway' ? 'Take Away' : 'Table';
        $floor   = $inv['floor_name'] ?? '-';
        $table   = $inv['table_no']   ?? '-';
        $items   = $itemsByInvoice[$invId] ?? [];
      ?>
      <div class="invoice-block">
        <div class="invoice-title small">
          Invoice #<?= $invId ?> – <?= htmlspecialchars($typeTxt) ?> (<?= htmlspecialchars($floor.'/'.$table) ?>)
        </div>

        <?php if (!$items): ?>
          <div class="small">No items in this invoice.</div>
        <?php else: ?>
          <table class="small">
            <thead>
              <tr>
                <th style="width:5mm;">No</th>
                <th>Item</th>
                <th style="width:8mm;" class="right">Qty</th>
                <th style="width:16mm;" class="right">Price</th>
                <th style="width:10mm;" class="right">Disc%</th>
                <th style="width:18mm;" class="right">Total</th>
              </tr>
            </thead>
            <tbody>
            <?php
              $no = 1;
              foreach ($items as $it):
                $qty      = (int)$it['qty'];
                $priceUsd = (float)$it['price_usd'];
                $priceKhr = (int)$it['price_khr'];
                $discPct  = (float)($it['discount_pct'] ?? 0);
                $lineUsd  = (float)$it['line_total_usd'];
                $lineKhr  = (int)$it['line_total_khr'];

                $priceText = '$'.number_format($priceUsd,2).' / '.number_format($priceKhr).'៛';
                $totalText = '$'.number_format($lineUsd,2).' / '.number_format($lineKhr).'៛';
            ?>
              <tr>
                <td><?= $no++ ?></td>
                <td><?= htmlspecialchars($it['name']) ?></td>
                <td class="right"><?= $qty ?></td>
                <td class="right"><?= $priceText ?></td>
                <td class="right">
                  <?= $discPct > 0 ? rtrim(rtrim(number_format($discPct,2),'0'),'.') : '0' ?>
                </td>
                <td class="right"><?= $totalText ?></td>
              </tr>
            <?php endforeach; ?>
            </tbody>
          </table>
        <?php endif; ?>
      </div>
    <?php endforeach; ?>
  </div>

  <!-- Grand totals -->
  <div class="border-top small">
    <div class="bold">Grand Totals (All merged invoices)</div>
    <div>Total: $<?= number_format($total_usd,2) ?> / <?= number_format($total_khr) ?>៛</div>
    <div>Pay Currency: <?= htmlspecialchars($pay_currency) ?></div>
    <div>Cash: $<?= number_format($cash_usd,2) ?> / <?= number_format($cash_khr) ?>៛</div>
    <div>Change: $<?= number_format($change_usd,2) ?> / <?= number_format($change_khr) ?>៛</div>
  </div>

  <div class="center mt-10 small">
    *** សូមអរគុណ ***
  </div>

</div>
</body>
</html>
