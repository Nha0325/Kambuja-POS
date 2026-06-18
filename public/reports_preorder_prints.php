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

// mode: daily | weekly | monthly | custom
$mode       = $_GET['mode'] ?? 'daily';
$date_from  = $_GET['date_from'] ?? '';
$date_to    = $_GET['date_to']   ?? '';

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

// optional filter: who printed
$printed_by_id = (int)($_GET['user_id'] ?? 0);

// optional search by invoice / receipt id
$search_inv = trim($_GET['invoice_id'] ?? '');

// load users (for dropdown)
$users = $pdo->query("SELECT id, username, role FROM users ORDER BY username")->fetchAll();

/* ------------------------
 * WHERE Clause (for pre-order prints only)
 * ------------------------ */

$where = "WHERE l.print_type='preorder' 
          AND l.printed_at BETWEEN :start AND :end";
$params = [
    ':start' => $start->format('Y-m-d H:i:s'),
    ':end'   => $end->format('Y-m-d H:i:s'),
];

if ($printed_by_id > 0) {
    $where .= " AND l.printed_by = :uid";
    $params[':uid'] = $printed_by_id;
}

if ($search_inv !== '') {
    $where .= " AND l.invoice_id = :iid";
    $params[':iid'] = (int)$search_inv;
}

/* ------------------------
 * Load data
 * ------------------------ */

$sql = "
  SELECT 
    l.id            AS log_id,
    l.invoice_id,
    l.print_type,
    l.printed_at,
    u.username      AS printed_by_name,
    i.status        AS invoice_status,
    i.total_usd,
    i.total_khr,
    i.pay_method,
    i.pay_currency,
    i.paid_at,
    COALESCE(f.name, 'Take Away') AS floor_name,
    COALESCE(t.table_no, 'TAKE')  AS table_no
  FROM receipt_print_logs l
  LEFT JOIN invoices i ON i.id = l.invoice_id
  LEFT JOIN floors   f ON f.id = i.floor_id
  LEFT JOIN tables   t ON t.id = i.table_id
  LEFT JOIN users    u ON u.id = l.printed_by
  $where
  ORDER BY l.printed_at DESC, l.id DESC
";

$st = $pdo->prepare($sql);
$st->execute($params);
$rows = $st->fetchAll();

/* ------------------------
 * Summary: counts & totals
 * ------------------------ */

$total_prints   = count($rows);
$total_usd_sum  = 0.0; // sum of invoice total for each print (may repeat invoices)
$total_khr_sum  = 0;
$unique_invoices = [];

foreach ($rows as $r) {
    $total_usd_sum += (float)($r['total_usd'] ?? 0);
    $total_khr_sum += (int)  ($r['total_khr'] ?? 0);
    if (!empty($r['invoice_id'])) {
        $unique_invoices[$r['invoice_id']] = true;
    }
}
$unique_invoice_count = count($unique_invoices);

function sel($a,$b){ return $a==$b?'selected':''; }

?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Pre-Order Print Reports – FTC POS</title>
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
      padding-top: 5px;
    }
  </style>
</head>
<body class="bg-light">
<div class="container py-4">

  <!-- Sticky header (title + filters + summary) -->
  <div class="sticky-header">

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">របាយការណ៍បោះពុម្ព Pre-Order</h3>
      <div class="no-print">
        <a class="btn btn-outline-secondary" href="reports.php">ថយក្រោយ</a>
      </div>
    </div>

    <!-- FILTER FORM -->
    <form class="card mb-3 no-print" method="get">
      <div class="card-body">
        <div class="row g-3 align-items-end">

          <div class="col-md-2">
            <label class="form-label">ជម្រើស</label>
            <select class="form-select" name="mode">
              <option value="daily"   <?= sel($mode,'daily') ?>>ថ្ងៃនេះ</option>
              <option value="weekly"  <?= sel($mode,'weekly') ?>>សប្តាហ៍នេះ</option>
              <option value="monthly" <?= sel($mode,'monthly') ?>>ខែនេះ</option>
              <option value="custom"  <?= sel($mode,'custom') ?>>កំណតតាមចិត្ត</option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">អ្នកបោះពុម្ព (Printed by)</label>
            <select class="form-select" name="user_id">
              <option value="0">All users</option>
              <?php foreach ($users as $u): ?>
                <option value="<?= $u['id'] ?>" <?= $printed_by_id==$u['id']?'selected':'' ?>>
                  <?= htmlspecialchars($u['username']) ?> (<?= htmlspecialchars($u['role']) ?>)
                </option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Receipt / Invoice #</label>
            <input type="number"
                   name="invoice_id"
                   class="form-control"
                   value="<?= htmlspecialchars($search_inv) ?>"
                   placeholder="e.g. 101">
          </div>

          <!-- Custom date range when mode=custom -->
          <div class="col-md-2">
            <label class="form-label">ចាប់ពីថ្ងៃ</label>
            <input type="date"
                   name="date_from"
                   class="form-control"
                   value="<?= htmlspecialchars($date_from_value) ?>">
          </div>

          <div class="col-md-2">
            <label class="form-label">រហូតដល់ថ្ងៃ</label>
            <input type="date"
                   name="date_to"
                   class="form-control"
                   value="<?= htmlspecialchars($date_to_value) ?>">
          </div>

          <div class="col-md-2">
            <button class="btn btn-primary w-100 mt-3 mt-md-0">Apply</button>
          </div>
        </div>
      </div>
    </form>

    <!-- SUMMARY -->
    <div class="alert alert-info mb-0">
      Period: <?= $start->format('Y-m-d') ?> → <?= $end->format('Y-m-d') ?>
      &nbsp; | &nbsp;
      Total Pre-Order Prints: <strong><?= (int)$total_prints ?></strong>
      &nbsp; | &nbsp;
      Unique Invoices: <strong><?= (int)$unique_invoice_count ?></strong>
      &nbsp; | &nbsp;
      Invoice totals (sum over prints):
      <strong>$<?= number_format($total_usd_sum,2) ?></strong> /
      <strong><?= number_format($total_khr_sum) ?> ៛</strong>
    </div>
  </div> <!-- /sticky-header -->

  <!-- TABLE -->
  <div class="table-responsive mt-3">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>Log ID</th>
          <th>Receipt #</th>
          <th>Floor/Table</th>
          <th>Invoice Status</th>
          <th>Pay Method</th>
          <th>Total USD</th>
          <th>Total KHR</th>
          <th>Printed By</th>
          <th>Printed At</th>
          <th class="no-print">Actions</th>
        </tr>
      </thead>
      <tbody>
      <?php if (!$rows): ?>
        <tr>
          <td colspan="10" class="text-center text-muted py-3">
            No pre-order print logs.
          </td>
        </tr>
      <?php else: ?>
        <?php foreach ($rows as $r): ?>
          <tr>
            <td>#<?= (int)$r['log_id'] ?></td>
            <td>#<?= (int)$r['invoice_id'] ?></td>
            <td><?= htmlspecialchars($r['floor_name']) ?>/<?= htmlspecialchars($r['table_no']) ?></td>
            <td>
              <?php if ($r['invoice_status'] === 'paid'): ?>
                <span class="badge bg-success">paid</span>
              <?php else: ?>
                <span class="badge bg-warning text-dark">
                  <?= htmlspecialchars($r['invoice_status'] ?: 'open') ?>
                </span>
              <?php endif; ?>
            </td>
            <td>
              <?php
                if ($r['pay_method'] === 'qr') {
                    echo '<span class="badge bg-info text-dark">QR '.htmlspecialchars($r['pay_currency'] ?: '').'</span>';
                } elseif ($r['pay_method'] === 'cash') {
                    echo '<span class="badge bg-secondary">Cash '.htmlspecialchars($r['pay_currency'] ?: '').'</span>';
                } else {
                    echo '<span class="badge bg-light text-dark">N/A</span>';
                }
              ?>
            </td>
            <td>$<?= number_format((float)$r['total_usd'],2) ?></td>
            <td><?= number_format((int)$r['total_khr']) ?> ៛</td>
            <td><?= htmlspecialchars($r['printed_by_name'] ?? '-') ?></td>
            <td><?= htmlspecialchars($r['printed_at']) ?></td>
            <td class="no-print">
              <?php if (!empty($r['invoice_id'])): ?>
                <a class="btn btn-sm btn-outline-dark mb-1" target="_blank"
                   href="print_receipt.php?invoice_id=<?= (int)$r['invoice_id'] ?>">
                  Print
                </a>
                <a class="btn btn-sm btn-outline-primary mb-1" target="_blank"
                   href="export_invoice_pdf.php?invoice_id=<?= (int)$r['invoice_id'] ?>">
                  PDF
                </a>
              <?php else: ?>
                <span class="text-muted small">No invoice</span>
              <?php endif; ?>
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
