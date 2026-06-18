<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';
$invoice_id = (int)($_GET['invoice_id'] ?? 0);
$auto = isset($_GET['auto']) ? true : false;
if (!$invoice_id) { echo "Missing invoice_id"; exit; }

// Load invoice
$invSt = db()->prepare("SELECT i.*, f.name AS floor_name, t.table_no FROM invoices i
  JOIN floors f ON f.id=i.floor_id
  JOIN tables t ON t.id=i.table_id
  WHERE i.id=?");
$invSt->execute([$invoice_id]);
$inv = $invSt->fetch();
if (!$inv) { echo "Invoice not found"; exit; }

// Load items
$it = db()->prepare("SELECT name, qty, price_usd, price_khr, line_total_usd, line_total_khr FROM invoice_items WHERE invoice_id=? ORDER BY id");
$it->execute([$invoice_id]);
$items = $it->fetchAll();

$s = get_settings();
$rate = (int)$inv['usd_to_khr'];
$company = $s['company_name'] ?? 'FTC POS';
$is_paid = ($inv['status'] === 'paid');

// Totals (already saved in invoice)
$subtotal_usd = (float)$inv['subtotal_usd'];
$subtotal_khr = (int)$inv['subtotal_khr'];
$total_usd = (float)$inv['total_usd'];
$total_khr = (int)$inv['total_khr'];
$pay_cur = $inv['pay_currency'];
$cash_usd = (float)$inv['cash_in_usd'];
$cash_khr = (int)$inv['cash_in_khr'];
$chg_usd = (float)$inv['change_usd'];
$chg_khr = (int)$inv['change_khr'];
$ts = $is_paid ? $inv['paid_at'] : $inv['created_at'];
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt #<?= $invoice_id ?></title>
  <style>
    /* 80mm paper friendly */
    @page { size: 80mm auto; margin: 0; }
    body { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; margin: 0; padding: 8px; }
    .ticket { width: 76mm; margin: 0 auto; }
    .center { text-align: center; }
    .bold { font-weight: 700; }
    .sm { font-size: 12px; }
    .xs { font-size: 11px; }
    .hr { border-top: 1px dashed #000; margin: 6px 0; }
    .row { display: flex; justify-content: space-between; }
    .right { text-align: right; }
    .mt { margin-top: 6px; }
    .bb { border-bottom: 1px dashed #000; padding-bottom: 4px; }
    .logo { font-size: 16px; font-weight: 800; margin-bottom: 2px; }
    .badge { display: inline-block; padding: 2px 6px; border: 1px solid #000; border-radius: 4px; font-size: 11px; }
    .items td { padding: 2px 0; vertical-align: top; }
    .items .qty { width: 16mm; }
    .items .name { width: 36mm; }
    .items .amt { width: 20mm; text-align: right; }
    .muted { color: #444; }
    .qr { text-align: center; margin-top: 10px; }
    @media print { .noprint { display: none; } body { padding: 0; } }
    button { padding: 6px 10px; }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="center">
      <div class="logo"><?= htmlspecialchars($company) ?></div>
      <div class="xs muted">1 USD = <?= number_format($rate) ?> KHR</div>
      <div class="xs"><?= $is_paid ? '<span class="badge">PAID</span>' : '<span class="badge">PRE-ORDER</span>' ?></div>
    </div>
    <div class="hr"></div>
    <div class="xs">
      <div class="row"><div>Invoice</div><div>#<?= $invoice_id ?></div></div>
      <div class="row"><div>Date</div><div><?= htmlspecialchars($ts) ?></div></div>
      <div class="row"><div>Floor/Table</div><div><?= htmlspecialchars($inv['floor_name']) ?>/<?= htmlspecialchars($inv['table_no']) ?></div></div>
    </div>
    <div class="hr"></div>

    <table class="items xs" width="100%">
      <?php foreach ($items as $it): ?>
        <tr>
          <td class="qty"><?= (int)$it['qty'] ?> × $<?= number_format((float)$it['price_usd'],2) ?></td>
          <td class="name"><?= htmlspecialchars($it['name']) ?></td>
          <td class="amt">$<?= number_format((float)$it['line_total_usd'],2) ?></td>
        </tr>
      <?php endforeach; ?>
    </table>

    <div class="hr"></div>
    <div class="xs">
      <div class="row"><div>Subtotal</div><div>$<?= number_format($subtotal_usd,2) ?> | <?= number_format($subtotal_khr) ?> ៛</div></div>
      <div class="row bold"><div>Total</div><div>$<?= number_format($total_usd,2) ?> | <?= number_format($total_khr) ?> ៛</div></div>
    </div>

    <?php if ($is_paid): ?>
      <div class="hr"></div>
      <div class="xs">
        <div class="row"><div>Paid (<?= $pay_cur ?>)</div>
          <div>
            <?php if ($pay_cur==='USD'): ?>
              $<?= number_format($cash_usd,2) ?><?php if ($cash_khr>0): ?> + <?= number_format($cash_khr) ?>៛<?php endif; ?>
            <?php else: ?>
              <?= number_format($cash_khr) ?> ៛<?php if ($cash_usd>0): ?> + $<?= number_format($cash_usd,2) ?><?php endif; ?>
            <?php endif; ?>
          </div>
        </div>
        <div class="row"><div>Change</div>
          <div>
            <?php if ($pay_cur==='USD'): ?>
              $<?= number_format($chg_usd,2) ?>
            <?php else: ?>
              <?= number_format($chg_khr) ?> ៛
            <?php endif; ?>
          </div>
        </div>
      </div>
    <?php endif; ?>

    <div class="hr"></div>
    <div class="center xs">Thank you! សូមអរគុណ</div>

    <div class="center noprint mt">
      <button onclick="window.print()">Print</button>
      <a href="index.php"><button>Back</button></a>
    </div>
  </div>
  <?php if ($auto): ?>
  <script>window.onload = () => { window.print(); };</script>
  <?php endif; ?>
</body>
</html>
