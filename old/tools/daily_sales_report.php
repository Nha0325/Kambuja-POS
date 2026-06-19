<?php
// /var/www/html/ftc-pos/tools/daily_sales_report.php

require_once __DIR__ . '/../helpers.php';

// Simple protection so only your script can call it
$secret = 'FTCSecret123';   // <— USE THIS EXACT VALUE

if (!isset($_GET['key']) || $_GET['key'] !== $secret) {
    http_response_code(403);
    echo "Forbidden";
    exit;
}

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Date to report (default: yesterday)
$report_date = $_GET['date'] ?? date('Y-m-d', strtotime('yesterday'));

// Load settings for header
$s = get_settings();
$shop_name = $s['company_name'] ?? 'FTC POS';

// Get paid invoices for that date (using paid_at)
$sql = "
    SELECT i.id,
           i.order_type,
           i.total_usd,
           i.total_khr,
           i.pay_currency,
           i.cash_in_usd,
           i.cash_in_khr,
           i.change_usd,
           i.change_khr,
           i.paid_at,
           f.name  AS floor_name,
           t.table_no
    FROM invoices i
    LEFT JOIN floors f ON f.id = i.floor_id
    LEFT JOIN tables t ON t.id = i.table_id
    WHERE i.status = 'paid'
      AND DATE(i.paid_at) = :d
    ORDER BY i.paid_at ASC, i.id ASC
";
$st = $pdo->prepare($sql);
$st->execute([':d' => $report_date]);
$rows = $st->fetchAll();

// Totals
$total_usd = 0;
$total_khr = 0;
foreach ($rows as $r) {
    $total_usd += (float)$r['total_usd'];
    $total_khr += (int)$r['total_khr'];
}
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daily Sales Report - <?= htmlspecialchars($report_date) ?></title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; }
    h1, h2, h3 { margin: 0; padding: 0; }
    .header { text-align: center; margin-bottom: 10px; }
    .meta { margin-top: 4px; font-size: 11px; }
    table { border-collapse: collapse; width: 100%; margin-top: 10px; }
    th, td { border: 1px solid #555; padding: 4px 6px; }
    th { background: #eee; }
    .right { text-align: right; }
    .center { text-align: center; }
    .summary { margin-top: 10px; border: 1px solid #555; padding: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <h2><?= htmlspecialchars($shop_name) ?></h2>
    <h3>Daily Sales Report</h3>
    <div class="meta">
      Date: <strong><?= htmlspecialchars($report_date) ?></strong>
    </div>
  </div>

  <div class="summary">
    <strong>Summary:</strong><br>
    Total Orders: <?= count($rows) ?><br>
    Total Amount: $<?= number_format($total_usd, 2) ?> &nbsp; | &nbsp; <?= number_format($total_khr) ?> ៛
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Invoice</th>
        <th>Time</th>
        <th>Type</th>
        <th>Floor / Table</th>
        <th class="right">Total USD</th>
        <th class="right">Total KHR</th>
        <th>Pay Cur</th>
      </tr>
    </thead>
    <tbody>
    <?php if (!$rows): ?>
      <tr>
        <td colspan="8" class="center">No paid invoices for this date.</td>
      </tr>
    <?php else: ?>
      <?php $i = 1; foreach ($rows as $r): ?>
        <tr>
          <td class="center"><?= $i++ ?></td>
          <td class="center">#<?= (int)$r['id'] ?></td>
          <td class="center"><?= htmlspecialchars($r['paid_at']) ?></td>
          <td class="center">
            <?= $r['order_type'] === 'takeaway' ? 'Take Away' : 'Table' ?>
          </td>
          <td class="center">
            <?php if ($r['order_type'] === 'takeaway'): ?>
              -
            <?php else: ?>
              <?= htmlspecialchars(($r['floor_name'] ?? '') . ' / ' . ($r['table_no'] ?? '')) ?>
            <?php endif; ?>
          </td>
          <td class="right">$<?= number_format((float)$r['total_usd'], 2) ?></td>
          <td class="right"><?= number_format((int)$r['total_khr']) ?> ៛</td>
          <td class="center"><?= htmlspecialchars($r['pay_currency']) ?></td>
        </tr>
      <?php endforeach; ?>
    <?php endif; ?>
    </tbody>
  </table>
</body>
</html>
