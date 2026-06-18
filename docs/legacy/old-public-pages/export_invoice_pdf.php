<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$invoice_id = (int)($_GET['invoice_id'] ?? 0);
if ($invoice_id <= 0) {
    die('Missing invoice_id');
}

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$s = get_settings();

// 1) Load invoice
$st = $pdo->prepare("
    SELECT i.*,
           COALESCE(f.name, 'Take Away') AS floor_name,
           COALESCE(t.table_no, 'TAKE')  AS table_no,
           u.username AS cashier_name
    FROM invoices i
    LEFT JOIN floors f ON f.id = i.floor_id
    LEFT JOIN tables t ON t.id = i.table_id
    LEFT JOIN users  u ON u.id = i.cashier_id
    WHERE i.id = ?
");
$st->execute([$invoice_id]);
$invoice = $st->fetch();

if (!$invoice) {
    die('Invoice not found');
}

// 2) Load items
$it = $pdo->prepare("
    SELECT name, qty, price_usd, price_khr, line_total_usd, line_total_khr, discount_pct
    FROM invoice_items
    WHERE invoice_id = ?
    ORDER BY id ASC
");
$it->execute([$invoice_id]);
$items = $it->fetchAll();

// 3) Make sure totals are up to date
calc_totals($invoice_id);

$tt = $pdo->prepare("
    SELECT subtotal_usd, subtotal_khr, total_usd, total_khr, discount_pct
    FROM invoices
    WHERE id = ?
");
$tt->execute([$invoice_id]);
$tot = $tt->fetch();

$subtotal_usd    = (float)($tot['subtotal_usd'] ?? 0);
$subtotal_khr    = (int)  ($tot['subtotal_khr'] ?? 0);
$total_usd       = (float)($tot['total_usd']    ?? 0);
$total_khr       = (int)  ($tot['total_khr']    ?? 0);
$invoice_disc_pct= (float)($tot['discount_pct'] ?? 0);

// 4) Build HTML for PDF (A4 simple invoice)
$company_name  = htmlspecialchars($s['company_name'] ?? 'FTC POS');
$company_addr  = htmlspecialchars($s['company_address'] ?? '');
$company_phone = htmlspecialchars($s['company_phone'] ?? '');

$floor_table = $invoice['order_type'] === 'takeaway'
    ? 'Take Away'
    : 'Floor '.htmlspecialchars($invoice['floor_name']).' / Table '.htmlspecialchars($invoice['table_no']);

$cashier_name = htmlspecialchars($invoice['cashier_name'] ?? '-');
$pay_method   = $invoice['pay_method'] === 'qr' ? 'QR' : 'Cash';
$pay_currency = htmlspecialchars($invoice['pay_currency'] ?? '');

$rate = (int)$invoice['usd_to_khr'];

ob_start();
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice #<?= $invoice_id ?></title>
  <style>
    body {
      font-family: DejaVu Sans, Arial, sans-serif;
      font-size: 12px;
      margin: 20px;
      color: #333;
    }
    h1, h2, h3, h4 {
      margin: 0;
      padding: 0;
    }
    .header {
      border-bottom: 1px solid #ccc;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .header-left {
      float: left;
      width: 60%;
    }
    .header-right {
      float: right;
      width: 40%;
      text-align: right;
      font-size: 11px;
    }
    .clearfix {
      clear: both;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 4px 6px;
    }
    th {
      background: #f2f2f2;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .no-border {
      border: none;
    }
    .mt-10 { margin-top: 10px; }
    .mt-5  { margin-top: 5px; }
    .small { font-size: 11px; }
  </style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <h2><?= $company_name ?></h2>
    <?php if ($company_addr): ?>
      <div class="small"><?= $company_addr ?></div>
    <?php endif; ?>
    <?php if ($company_phone): ?>
      <div class="small">Tel: <?= $company_phone ?></div>
    <?php endif; ?>
  </div>
  <div class="header-right">
    <h3>INVOICE</h3>
    <div>Invoice #: <strong>#<?= $invoice_id ?></strong></div>
    <div>Date: <?= htmlspecialchars($invoice['paid_at'] ?? $invoice['created_at'] ?? '') ?></div>
  </div>
  <div class="clearfix"></div>
</div>

<table class="small">
  <tr>
    <td width="40%">
      <strong>Order Type / Table</strong><br>
      <?= $floor_table ?>
    </td>
    <td width="30%">
      <strong>Cashier</strong><br>
      <?= $cashier_name ?>
    </td>
    <td width="30%">
      <strong>Payment</strong><br>
      <?= $pay_method ?> (<?= $pay_currency ?>)<br>
      Rate: 1 USD = <?= number_format($rate) ?> KHR
    </td>
  </tr>
</table>

<table class="mt-10">
  <thead>
    <tr>
      <th style="width:5%;">#</th>
      <th style="width:35%;">Item</th>
      <th style="width:10%;" class="text-center">Qty</th>
      <th style="width:15%;" class="text-right">Price USD</th>
      <th style="width:15%;" class="text-right">Price KHR</th>
      <th style="width:10%;" class="text-center">% Disc</th>
      <th style="width:10%;" class="text-right">Total USD</th>
    </tr>
  </thead>
  <tbody>
    <?php if (!$items): ?>
      <tr>
        <td colspan="7" class="text-center small">No items</td>
      </tr>
    <?php else: ?>
      <?php $idx = 1; foreach ($items as $it): ?>
        <tr>
          <td class="text-center"><?= $idx++ ?></td>
          <td><?= htmlspecialchars($it['name']) ?></td>
          <td class="text-center"><?= (int)$it['qty'] ?></td>
          <td class="text-right">$<?= number_format((float)$it['price_usd'],2) ?></td>
          <td class="text-right"><?= number_format((int)$it['price_khr']) ?> ៛</td>
          <td class="text-center"><?= number_format((float)$it['discount_pct'],1) ?>%</td>
          <td class="text-right">$<?= number_format((float)$it['line_total_usd'],2) ?></td>
        </tr>
      <?php endforeach; ?>
    <?php endif; ?>
  </tbody>
</table>

<table class="mt-10">
  <tr>
    <td class="no-border" style="width:60%;"></td>
    <td style="width:20%;">Subtotal</td>
    <td style="width:20%;" class="text-right">
      $<?= number_format($subtotal_usd,2) ?> /
      <?= number_format($subtotal_khr) ?> ៛
    </td>
  </tr>
  <tr>
    <td class="no-border"></td>
    <td>Invoice Discount</td>
    <td class="text-right">
      <?= number_format($invoice_disc_pct,1) ?> %
    </td>
  </tr>
  <tr>
    <td class="no-border"></td>
    <td><strong>Total</strong></td>
    <td class="text-right">
      <strong>
        $<?= number_format($total_usd,2) ?> /
        <?= number_format($total_khr) ?> ៛
      </strong>
    </td>
  </tr>
</table>

<p class="mt-10 small">
  Thank you for your business.
</p>

</body>
</html>
<?php
$html = ob_get_clean();

// 5) Generate PDF file using your helper
list($targetPath, $filename) = invoice_pdf_target_path($invoice_id);

if (!function_exists('generate_pdf_from_html')) {
    die('generate_pdf_from_html() helper not found. Please make sure it is defined in helpers.php');
}

if (!generate_pdf_from_html($html, $targetPath)) {
    die('Failed to generate PDF');
}

// 6) Stream PDF to browser
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="'.$filename.'"');
header('Content-Length: ' . filesize($targetPath));

readfile($targetPath);
// optional: unlink($targetPath);

exit;
