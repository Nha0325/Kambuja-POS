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
$mode      = $_GET['mode']      ?? 'daily';
$date_from = $_GET['date_from'] ?? '';
$date_to   = $_GET['date_to']   ?? '';

$now   = new DateTime('now');
$start = clone $now;
$end   = clone $now;

if ($mode === 'custom') {
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

// values for date inputs (only used when mode=custom)
$date_from_value = ($mode === 'custom') ? ($date_from ?: $start->format('Y-m-d')) : '';
$date_to_value   = ($mode === 'custom') ? ($date_to   ?: $end->format('Y-m-d'))   : '';

/* ------------------------
 * Filters
 * ------------------------ */

// optional cashier filter
$cashier_id = (int)($_GET['user_id'] ?? 0);

// optional search by receipt / invoice id
$search_inv = trim($_GET['invoice_id'] ?? '');

// pay method filter
$pay_method = $_GET['pay_method'] ?? '';   // '' | cash | qr

// pay currency filter
$pay_currency = $_GET['pay_currency'] ?? '';  // '' | USD | KHR

// floor / table text search
$floor_kw = trim($_GET['floor_kw'] ?? '');
$table_kw = trim($_GET['table_kw'] ?? '');

// load users
$users = $pdo->query("SELECT id, username, role FROM users ORDER BY username")->fetchAll();

/* ------------------------
 * WHERE Clause
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

if ($search_inv !== '') {
  $where .= " AND i.id = :iid";
  $params[':iid'] = (int)$search_inv;
}

if ($pay_method === 'cash' || $pay_method === 'qr') {
  $where .= " AND i.pay_method = :pm";
  $params[':pm'] = $pay_method;
}

if ($pay_currency === 'USD' || $pay_currency === 'KHR') {
  $where .= " AND i.pay_currency = :pc";
  $params[':pc'] = $pay_currency;
}

if ($floor_kw !== '') {
  // filter by floor name (contains)
  $where .= " AND f.name LIKE :fkw";
  $params[':fkw'] = '%'.$floor_kw.'%';
}

if ($table_kw !== '') {
  // filter by table number (contains)
  $where .= " AND t.table_no LIKE :tkw";
  $params[':tkw'] = '%'.$table_kw.'%';
}

/* ------------------------
 * Load data
 * ------------------------ */

$sql = "
  SELECT i.*,
         COALESCE(f.name, 'Take Away') AS floor_name,
         COALESCE(t.table_no, 'TAKE')  AS table_no,
         u.username AS cashier_name
  FROM invoices i
  LEFT JOIN floors f ON f.id = i.floor_id
  LEFT JOIN tables t ON t.id = i.table_id
  LEFT JOIN users  u ON u.id = i.cashier_id
  $where
  ORDER BY i.paid_at DESC, i.id DESC
";

$st = $pdo->prepare($sql);
$st->execute($params);
$rows = $st->fetchAll();

$total_usd = 0.0;
$total_khr = 0;

foreach ($rows as $r) {
  $total_usd += (float)$r['total_usd'];
  $total_khr += (int)$r['total_khr'];
}

function sel($a,$b){ return $a==$b?'selected':''; }

?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt Reports – FTC POS</title>
  <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">

  <style>
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background: #ffffff !important;
      }
      .container {
        max-width: none !important;
        width: 100% !important;
      }
      .sticky-header {
        position: static !important;
        box-shadow: none !important;
      }
    }

    .sticky-header {
      position: sticky;
      top: 0;
      z-index: 1020;
      background: #ffffff;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }
    .form-label {
      padding-top: 4px;
    }
  </style>
</head>
<body class="bg-light">
<div class="container py-4">

  <!-- Everything here sticks on top when scrolling -->
  <div class="sticky-header">

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Receipt Reports</h3>
      <a class="btn btn-outline-secondary no-print" href="reports.php?mode=<?= htmlspecialchars($mode) ?>">Back</a>
    </div>

    <!-- FILTER FORM -->
    <form class="card mb-3 no-print" method="get">
      <div class="card-body">
        <div class="row g-3 align-items-end">

          <div class="col-md-2">
            <label class="form-label">Mode</label>
            <select class="form-select" name="mode">
              <option value="daily"   <?= sel($mode,'daily') ?>>Daily</option>
              <option value="weekly"  <?= sel($mode,'weekly') ?>>Weekly</option>
              <option value="monthly" <?= sel($mode,'monthly') ?>>Monthly</option>
              <option value="custom"  <?= sel($mode,'custom') ?>>Custom</option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Sale User</label>
            <select class="form-select" name="user_id">
              <option value="0">All users</option>
              <?php foreach ($users as $u): ?>
                <option value="<?= $u['id'] ?>" <?= $cashier_id==$u['id']?'selected':'' ?>>
                  <?= htmlspecialchars($u['username']) ?> (<?= htmlspecialchars($u['role']) ?>)
                </option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Receipt / Invoice #</label>
            <input type="number" name="invoice_id"
                   class="form-control"
                   value="<?= htmlspecialchars($search_inv) ?>"
                   placeholder="e.g. 105">
          </div>

          <div class="col-md-2">
            <label class="form-label">Pay Method</label>
            <select class="form-select" name="pay_method">
              <option value="">All</option>
              <option value="cash" <?= sel($pay_method,'cash') ?>>Cash</option>
              <option value="qr"   <?= sel($pay_method,'qr') ?>>QR</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label">Currency</label>
            <select class="form-select" name="pay_currency">
              <option value="">All</option>
              <option value="USD" <?= sel($pay_currency,'USD') ?>>USD</option>
              <option value="KHR" <?= sel($pay_currency,'KHR') ?>>KHR</option>
            </select>
          </div>

        </div>

        <div class="row g-3 align-items-end mt-2">
          <div class="col-md-2">
            <label class="form-label">Floor</label>
            <input type="text" name="floor_kw"
                   class="form-control"
                   value="<?= htmlspecialchars($floor_kw) ?>"
                   placeholder="e.g. 1F">
          </div>

          <div class="col-md-2">
            <label class="form-label">Table</label>
            <input type="text" name="table_kw"
                   class="form-control"
                   value="<?= htmlspecialchars($table_kw) ?>"
                   placeholder="e.g. T01">
          </div>

          <div class="col-md-3">
            <label class="form-label">From (when Custom)</label>
            <input type="date" name="date_from"
                   class="form-control"
                   value="<?= htmlspecialchars($date_from_value) ?>">
          </div>

          <div class="col-md-3">
            <label class="form-label">To (when Custom)</label>
            <input type="date" name="date_to"
                   class="form-control"
                   value="<?= htmlspecialchars($date_to_value) ?>">
          </div>

          <div class="col-md-2">
            <button class="btn btn-primary w-100 mt-3 mt-md-0">Apply</button>
          </div>
        </div>

      </div>
    </form>

    <div class="alert alert-info mb-0">
      Period: <?= $start->format('Y-m-d') ?> → <?= $end->format('Y-m-d') ?> &nbsp; |
      Total: <strong>$<?= number_format($total_usd,2) ?></strong> /
             <strong><?= number_format($total_khr) ?> ៛</strong>
    </div>
  </div> <!-- /sticky-header -->

  <!-- TABLE -->
  <div class="table-responsive mt-3">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>Receipt #</th>
          <th>Floor/Table</th>
          <th>Cashier</th>
          <th>Pay Method</th>
          <th>Currency</th>
          <th>Total USD</th>
          <th>Total KHR</th>
          <th>Paid At</th>
          <th class="no-print">Print</th>
        </tr>
      </thead>
      <tbody>
      <?php if (!$rows): ?>
        <tr><td colspan="9" class="text-center text-muted py-3">No data.</td></tr>
      <?php else: ?>
        <?php foreach ($rows as $r): ?>
          <tr>
            <td>#<?= (int)$r['id'] ?></td>
            <td><?= htmlspecialchars($r['floor_name']) ?>/<?= htmlspecialchars($r['table_no']) ?></td>
            <td><?= htmlspecialchars($r['cashier_name'] ?? '-') ?></td>
            <td>
              <?php if ($r['pay_method'] === 'qr'): ?>
                <span class="badge bg-info text-dark">QR</span>
              <?php else: ?>
                <span class="badge bg-secondary">Cash</span>
              <?php endif; ?>
            </td>
            <td><?= htmlspecialchars($r['pay_currency']) ?></td>
            <td>$<?= number_format($r['total_usd'],2) ?></td>
            <td><?= number_format($r['total_khr']) ?> ៛</td>
            <td><?= htmlspecialchars($r['paid_at']) ?></td>
            <td class="no-print">
              <a class="btn btn-sm btn-outline-dark mb-1" target="_blank"
                href="print_receipt.php?invoice_id=<?= (int)$r['id'] ?>">
                Print
              </a>
              <a class="btn btn-sm btn-outline-primary" target="_blank"
                href="export_invoice_pdf.php?invoice_id=<?= (int)$r['id'] ?>">
                PDF
              </a>
            </td>
          </tr>
        <?php endforeach; ?>
      <?php endif; ?>
      </tbody>
    </table>
  </div>

</div>
<script src="<?= BOOTSTRAP_JS ?>"></script>
</body>
</html>
