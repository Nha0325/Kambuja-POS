<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_role('admin');
require_once __DIR__ . '/../helpers.php';

$s   = get_settings();
$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

/* ------------------------
 * Date range by mode
 * ------------------------ */
$mode = $_GET['mode'] ?? 'daily';
$now  = new DateTime('now');
$start = clone $now;
$end   = clone $now;

switch ($mode) {
  case 'weekly':
    $start->modify('monday this week')->setTime(0,0,0);
    $end->modify('sunday this week')->setTime(23,59,59);
    break;
  case 'monthly':
    $start->modify('first day of this month')->setTime(0,0,0);
    $end->modify('last day of this month')->setTime(23,59,59);
    break;
  case 'custom':
    $date_from = $_GET['date_from'] ?? '';
    $date_to   = $_GET['date_to']   ?? '';
    if ($date_from) {
      $dt = DateTime::createFromFormat('Y-m-d', $date_from);
      if ($dt) $start = $dt;
    }
    if ($date_to) {
      $dt = DateTime::createFromFormat('Y-m-d', $date_to);
      if ($dt) $end = $dt;
    }
    $start->setTime(0,0,0);
    $end->setTime(23,59,59);
    break;
  default:
    $mode = 'daily';
    $start->setTime(0,0,0);
    $end->setTime(23,59,59);
}

/* For custom date inputs */
$date_from_value = ($mode === 'custom') ? ($date_from ?? $start->format('Y-m-d')) : '';
$date_to_value   = ($mode === 'custom') ? ($date_to   ?? $end->format('Y-m-d'))   : '';

/* ------------------------
 * Filters
 * ------------------------ */

// optional cashier filter
$cashier_id = (int)($_GET['user_id'] ?? 0);
// optional search by invoice id
$search_inv = trim($_GET['invoice_id'] ?? '');
// optional floor
$floor_id = (int)($_GET['floor_id'] ?? 0);
// optional table no (string)
$table_no = trim($_GET['table_no'] ?? '');

// load users
$users = $pdo->query("SELECT id, username, role FROM users ORDER BY username")->fetchAll();
// load floors
$floors = $pdo->query("SELECT id, name FROM floors ORDER BY sort_order, name")->fetchAll();

/* ------------------------
 * WHERE Clause : status = 'open' (PRE-ORDER)
 * ------------------------ */

$where = "WHERE i.status='open' AND i.created_at BETWEEN :start AND :end";
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

if ($floor_id > 0) {
  $where .= " AND i.floor_id = :fid";
  $params[':fid'] = $floor_id;
}

if ($table_no !== '') {
  // match table_no from tables table
  $where .= " AND t.table_no LIKE :tno";
  $params[':tno'] = '%' . $table_no . '%';
}

/* ------------------------
 * Load Pre-Order (OPEN) invoices
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
  ORDER BY i.created_at DESC, i.id DESC
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
  <title>Pre-Order Reports – FTC POS</title>
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
      padding-top:4px;
    }
  </style>
</head>
<body class="bg-light">
<div class="container py-4">

  <!-- Sticky header -->
  <div class="sticky-header">

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">របាយការណ៍ Pre-Order (Invoice កំពុងបើក)</h3>
      <a class="btn btn-outline-secondary no-print" href="reports.php">ថយក្រោយ</a>
    </div>

    <!-- FILTER FORM -->
    <form class="card mb-3 no-print" method="get">
      <div class="card-body">
        <div class="row g-3 align-items-end">

          <div class="col-md-2">
            <label class="form-label">ជម្រើសថ្ងៃ</label>
            <select class="form-select" name="mode">
              <option value="daily"   <?= sel($mode,'daily') ?>>ថ្ងៃនេះ</option>
              <option value="weekly"  <?= sel($mode,'weekly') ?>>សប្តាហ៍នេះ</option>
              <option value="monthly" <?= sel($mode,'monthly') ?>>ខែនេះ</option>
              <option value="custom"  <?= sel($mode,'custom') ?>>កំណត់ផ្ទាល់ខ្លួន</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label">អ្នកគិតលុយ</label>
            <select class="form-select" name="user_id">
              <option value="0">All users</option>
              <?php foreach ($users as $u): ?>
                <option value="<?= $u['id'] ?>" <?= $cashier_id==$u['id']?'selected':'' ?>>
                  <?= htmlspecialchars($u['username']) ?> (<?= htmlspecialchars($u['role']) ?>)
                </option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label">ជាន់ / Floor</label>
            <select class="form-select" name="floor_id">
              <option value="0">All floors</option>
              <?php foreach ($floors as $f): ?>
                <option value="<?= $f['id'] ?>" <?= $floor_id==$f['id']?'selected':'' ?>>
                  <?= htmlspecialchars($f['name']) ?>
                </option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label">លេខតុ</label>
            <input type="text" name="table_no"
                   class="form-control"
                   value="<?= htmlspecialchars($table_no) ?>"
                   placeholder="e.g. T01">
          </div>

          <div class="col-md-2">
            <label class="form-label">លេខបង្កាន់ដៃ</label>
            <input type="number" name="invoice_id"
                   class="form-control"
                   value="<?= htmlspecialchars($search_inv) ?>"
                   placeholder="e.g. 105">
          </div>

          <div class="col-md-2">
            <button class="btn btn-primary w-100">Apply</button>
          </div>
        </div>

        <!-- custom date row -->
        <?php if ($mode === 'custom'): ?>
        <div class="row g-3 align-items-end mt-2">
          <div class="col-md-3">
            <label class="form-label">ចាប់ពីថ្ងៃ</label>
            <input type="date" name="date_from" class="form-control"
                   value="<?= htmlspecialchars($date_from_value) ?>">
          </div>
          <div class="col-md-3">
            <label class="form-label">រហូតដល់ថ្ងៃ</label>
            <input type="date" name="date_to" class="form-control"
                   value="<?= htmlspecialchars($date_to_value) ?>">
          </div>
        </div>
        <?php endif; ?>

      </div>
    </form>

    <div class="alert alert-warning mb-0">
      <div>
        Period: <?= $start->format('Y-m-d') ?> → <?= $end->format('Y-m-d') ?>
      </div>
      <div>
        ស្ថានភាព: <strong>Pre-Order (Invoice status = OPEN)</strong><br>
        Total: <strong>$<?= number_format($total_usd,2) ?></strong> /
               <strong><?= number_format($total_khr) ?> ៛</strong>
      </div>
    </div>
  </div> <!-- /sticky-header -->

  <!-- TABLE -->
  <div class="table-responsive mt-3">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>Invoice #</th>
          <th>Floor/Table</th>
          <th>Order Type</th>
          <th>Cashier</th>
          <th>Total USD</th>
          <th>Total KHR</th>
          <th>Created At</th>
          <th class="no-print">Action</th>
        </tr>
      </thead>
      <tbody>
      <?php if (!$rows): ?>
        <tr><td colspan="8" class="text-center text-muted py-3">No pre-order / open invoices.</td></tr>
      <?php else: ?>
        <?php foreach ($rows as $r): ?>
          <tr>
            <td>#<?= (int)$r['id'] ?></td>
            <td><?= htmlspecialchars($r['floor_name']) ?>/<?= htmlspecialchars($r['table_no']) ?></td>
            <td>
              <?php if ($r['order_type'] === 'takeaway'): ?>
                <span class="badge bg-info text-dark">Take Away</span>
              <?php else: ?>
                <span class="badge bg-secondary">Dine-In</span>
              <?php endif; ?>
            </td>
            <td><?= htmlspecialchars($r['cashier_name'] ?? '-') ?></td>
            <td>$<?= number_format($r['total_usd'],2) ?></td>
            <td><?= number_format($r['total_khr']) ?> ៛</td>
            <td><?= htmlspecialchars($r['created_at']) ?></td>
            <td class="no-print">
              <!-- open sale page -->
              <?php if ($r['order_type'] === 'takeaway'): ?>
                <a class="btn btn-sm btn-outline-primary mb-1"
                   href="sale.php?invoice=<?= (int)$r['id'] ?>">
                  បន្តបញ្ជាទិញ
                </a>
              <?php else: ?>
                <a class="btn btn-sm btn-outline-primary mb-1"
                   href="sale.php?invoice=<?= (int)$r['id'] ?>">
                  បន្តបញ្ជាទិញ
                </a>
              <?php endif; ?>

              <!-- print pre-order -->
              <a class="btn btn-sm btn-outline-dark"
                 target="_blank"
                 href="print_receipt.php?invoice_id=<?= (int)$r['id'] ?>">
                Print Pre-Order
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
