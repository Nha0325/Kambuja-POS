<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_role('admin');
require_once __DIR__ . '/../helpers.php';

$s   = get_settings();
$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

/* ------------------------
 * Date range by mode + custom
 * ------------------------ */

// from query
$mode      = $_GET['mode']      ?? 'daily';   // daily|weekly|monthly|custom
$date_from = $_GET['date_from'] ?? '';
$date_to   = $_GET['date_to']   ?? '';

$now   = new DateTime('now');
$start = clone $now;
$end   = clone $now;

if ($mode === 'custom') {
  // CUSTOM RANGE
  if ($date_from !== '') {
    $dt = DateTime::createFromFormat('Y-m-d', $date_from);
    if ($dt) $start = $dt;
  }
  if ($date_to !== '') {
    $dt = DateTime::createFromFormat('Y-m-d', $date_to);
    if ($dt) $end = $dt;
  }
  $start->setTime(0,0,0);
  $end->setTime(23,59,59);
} else {
  // PRESET RANGE
  switch ($mode) {
    case 'weekly':
      $start->modify('monday this week')->setTime(0,0,0);
      $end->modify('sunday this week')->setTime(23,59,59);
      break;
    case 'monthly':
      $start->modify('first day of this month')->setTime(0,0,0);
      $end->modify('last day of this month')->setTime(23,59,59);
      break;
    default:
      $mode = 'daily';
      $start->setTime(0,0,0);
      $end->setTime(23,59,59);
  }
}

/* ------------------------
 * Filters
 * ------------------------ */

// cashier filter
$cashier_id = (int)($_GET['user_id'] ?? 0);

// pay method filter: '' | cash | qr
$pay_method = $_GET['pay_method'] ?? '';

/* ------------------------
 * WHERE clause – for paid invoices
 * ------------------------ */
$where = "WHERE i.status='paid' AND i.paid_at BETWEEN :start AND :end";
$params = [
  ':start' => $start->format('Y-m-d H:i:s'),
  ':end'   => $end->format('Y-m-d H:i:s'),
];

if ($cashier_id > 0) {
  $where .= " AND i.cashier_id = :uid";
  $params[':uid'] = $cashier_id;
}

if ($pay_method === 'cash' || $pay_method === 'qr') {
  $where .= " AND i.pay_method = :pm";
  $params[':pm'] = $pay_method;
}

/* ------------------------
 * Load product summary (USD + KHR from sale date)
 * ------------------------ */
$sql = "
  SELECT 
    it.product_id,
    it.name AS product_name,
    SUM(it.qty)              AS qty,
    SUM(it.line_total_usd)   AS sum_usd,
    SUM(it.line_total_khr)   AS sum_khr
  FROM invoice_items it
  JOIN invoices i ON i.id = it.invoice_id
  $where
  GROUP BY it.product_id, it.name
  ORDER BY it.name ASC
";

$st = $pdo->prepare($sql);
$st->execute($params);
$rows = $st->fetchAll();

/* ------------------------
 * Totals (USD + KHR)
 * ------------------------ */
$sales_amount_usd = 0.0;  // sum of AMOUNT (USD)
$sales_amount_khr = 0;    // sum of AMOUNT (KHR, already using sale-date rate)

foreach ($rows as $r) {
  $sales_amount_usd += (float)$r['sum_usd'];
  $sales_amount_khr += (int)$r['sum_khr'];
}

// If you use tax later, change here
$sales_tax_usd   = 0.0;
$sales_tax_khr   = 0;
$sales_total_usd = $sales_amount_usd + $sales_tax_usd;
$sales_total_khr = $sales_amount_khr + $sales_tax_khr;

/* ------------------------
 * Exchange rate (from invoices in period)
 * ------------------------ */

// We reuse same WHERE, but only from invoices table
$sqlRates = "SELECT DISTINCT i.usd_to_khr FROM invoices i $where ORDER BY i.usd_to_khr";
$stR = $pdo->prepare($sqlRates);
$stR->execute($params);
$rateValues = $stR->fetchAll(PDO::FETCH_COLUMN);

$rate_info = 'N/A';
if ($rateValues && count($rateValues) > 0) {
  if (count($rateValues) === 1) {
    $rate_info = '1 $ = ' . number_format((int)$rateValues[0]) . ' ៛';
  } else {
    $parts = [];
    foreach ($rateValues as $rv) {
      $parts[] = number_format((int)$rv);
    }
    $rate_info = 'Multiple: ' . implode(', ', $parts) . ' ៛';
  }
}

/* ------------------------
 * Header info: salesperson & print date
 * ------------------------ */
if ($cashier_id > 0) {
  $u = $pdo->prepare("SELECT username FROM users WHERE id=?");
  $u->execute([$cashier_id]);
  $urow = $u->fetch();
  $sales_person = $urow ? $urow['username'] : 'Unknown';
} else {
  $sales_person = 'All users';
}

// PRINTED DATE (today)
$today_str = (new DateTime('now'))->format('Y-m-d');

// Optional autoprint
$autoPrint = !empty($_GET['autoprint']);

?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sales Report (Print)</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      margin: 20px;
      color: #000;
    }
    h1, h2, h3, h4, h5 {
      margin: 0;
      padding: 0;
    }
    .top-line {
      margin-bottom: 16px;
    }
    .label-strong {
      font-weight: bold;
    }
    .flex-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 40px;
    }
    .box {
      border: 1px solid #000;
      padding: 6px 10px;
      min-height: 26px;
      min-width: 220px;
    }
    .right-summary {
      text-align: right;
      min-width: 240px;
    }
    .right-summary div {
      margin-bottom: 4px;
    }
    .right-summary span.label {
      margin-right: 10px;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 24px;
    }
    th, td {
      border: 1px solid #000;
      padding: 4px 6px;
    }
    thead th {
      background: #f0f0f0;
      text-align: center;
    }
    td.num {
      text-align: right;
    }
    td.center {
      text-align: center;
    }
    tfoot td {
      font-weight: bold;
      background: #f0f0f0;
    }

    @media print {
      body {
        margin: 10mm;
      }
      .no-print {
        display: none;
      }
    }

    .btn-print {
      margin-top: 16px;
      padding: 6px 12px;
      border: 1px solid #333;
      background: #eee;
      cursor: pointer;
      font-size: 12px;
    }
    .btn-print a {
      text-decoration: none;
      color: inherit;
    }
  </style>
</head>
<body>

  <div class="top-line">
    Sales report for period
    <strong><?= htmlspecialchars($start->format('Y-m-d')) ?></strong>
    to
    <strong><?= htmlspecialchars($end->format('Y-m-d')) ?></strong>.
  </div>

  <div class="flex-row">
    <div>
      <div class="label-strong">SALES PERSON</div>
      <div class="box"><?= htmlspecialchars($sales_person) ?></div>

      <div style="margin-top:8px;">
        <div class="label-strong">EXCHANGE RATE (from sales)</div>
        <div class="box"><?= htmlspecialchars($rate_info) ?></div>
      </div>
    </div>

    <div>
      <div class="label-strong">DATE (Printed)</div>
      <div class="box"><?= htmlspecialchars($today_str) ?></div>
    </div>

    <div class="right-summary">
      <div>
        <span class="label label-strong">SALES AMOUNT</span>
        $<?= number_format($sales_amount_usd, 2) ?>
        /
        <?= number_format($sales_amount_khr) ?> ៛
      </div>
      <div>
        <span class="label label-strong">SALES TAX</span>
        $<?= number_format($sales_tax_usd, 2) ?>
        /
        <?= number_format($sales_tax_khr) ?> ៛
      </div>
      <div>
        <span class="label label-strong">SALES TOTAL</span>
        $<?= number_format($sales_total_usd, 2) ?>
        /
        <?= number_format($sales_total_khr) ?> ៛
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:60px;">ITEM NO</th>
        <th>ITEM NAME</th>
        <th>ITEM DESCRIPTION</th>
        <th style="width:80px;">PRICE (USD)</th>
        <th style="width:60px;">QTY</th>
        <th style="width:90px;">AMOUNT (USD)</th>
        <th style="width:70px;">TAX RATE</th>
        <th style="width:80px;">TAX (USD)</th>
        <th style="width:90px;">TOTAL (USD)</th>
      </tr>
    </thead>
    <tbody>
      <?php if (!$rows): ?>
        <tr>
          <td colspan="9" class="center">No data.</td>
        </tr>
      <?php else: ?>
        <?php
          $i = 1;
          $total_amount_usd = 0.0;
          $total_amount_khr = 0;
          $total_tax_usd    = 0.0;
          $total_tax_khr    = 0;
          $total_line_usd   = 0.0;
          $total_line_khr   = 0;
        ?>
        <?php foreach ($rows as $r): ?>
          <?php
            $qty         = (int)$r['qty'];
            $amount_usd  = (float)$r['sum_usd'];   // total (USD)
            $amount_khr  = (int)$r['sum_khr'];     // total (KHR)
            $price_usd   = $qty > 0 ? $amount_usd / $qty : 0.0;
            // if you ever need KHR price per unit:
            // $price_khr   = $qty > 0 ? $amount_khr / $qty : 0.0;

            $tax_rate       = 0;                  // change later if you add tax
            $tax_usd        = $amount_usd * $tax_rate / 100;
            $tax_khr        = $amount_khr * $tax_rate / 100;
            $line_total_usd = $amount_usd + $tax_usd;
            $line_total_khr = $amount_khr + $tax_khr;

            $total_amount_usd += $amount_usd;
            $total_amount_khr += $amount_khr;
            $total_tax_usd    += $tax_usd;
            $total_tax_khr    += $tax_khr;
            $total_line_usd   += $line_total_usd;
            $total_line_khr   += $line_total_khr;
          ?>
          <tr>
            <!-- ITEM NO: 1,2,3,... -->
            <td class="center"><?= $i++ ?></td>

            <td><?= htmlspecialchars($r['product_name']) ?></td>
            <td><!-- optional description --></td>

            <td class="num">$<?= number_format($price_usd, 2) ?></td>
            <td class="center"><?= $qty ?></td>
            <td class="num">$<?= number_format($amount_usd, 2) ?></td>
            <td class="center"><?= $tax_rate ?>%</td>
            <td class="num">$<?= number_format($tax_usd, 2) ?></td>
            <td class="num">$<?= number_format($line_total_usd, 2) ?></td>
          </tr>
        <?php endforeach; ?>
      <?php endif; ?>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="5" class="center">TOTAL</td>
        <td class="num">
          $<?= number_format($total_amount_usd, 2) ?>
          <br>
          <small>(<?= number_format($total_amount_khr) ?> ៛)</small>
        </td>
        <td class="center"></td>
        <td class="num">
          $<?= number_format($total_tax_usd, 2) ?>
          <br>
          <small>(<?= number_format($total_tax_khr) ?> ៛)</small>
        </td>
        <td class="num">
          $<?= number_format($total_line_usd, 2) ?>
          <br>
          <small>(<?= number_format($total_line_khr) ?> ៛)</small>
        </td>
      </tr>
    </tfoot>
  </table>

  <button class="btn-print no-print" onclick="window.print()">Print</button>
  <button class="btn-print no-print"><a href="reports.php">Back</a></button>

  <?php if ($autoPrint): ?>
  <script>
    window.onload = function () { window.print(); };
  </script>
  <?php endif; ?>

</body>
</html>
