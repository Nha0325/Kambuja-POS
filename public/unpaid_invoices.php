<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_role('admin');
require_once __DIR__ . '/../helpers.php';

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

/**
 * status_filter:
 *  - open  : only status='open'
 *  - void  : only status='void'
 *  - all   : status<>'paid'  (open + void + any other non-paid)
 */
$status_filter = $_GET['status'] ?? 'open';

$where  = '';
$params = [];

switch ($status_filter) {
  case 'void':
    $where = "WHERE i.status = 'void'";
    break;
  case 'all':
    $where = "WHERE i.status <> 'paid'";
    break;
  default:
    $status_filter = 'open';
    $where = "WHERE i.status = 'open'";
}

/* Load invoices not paid */
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

function sel($a,$b){ return $a==$b?'selected':''; }

?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Unpaid Invoices – FTC POS</title>
  <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">

  <style>
    @media print {
      .no-print { display:none !important; }
      body { background:#ffffff !important; }
      .container { max-width:none !important; width:100% !important; }
      .sticky-header { position:static !important; box-shadow:none !important; }
    }
    .sticky-header {
      position:sticky;
      top:0;
      z-index:1020;
      background:#ffffff;
      padding-top:0.5rem;
      padding-bottom:0.5rem;
      box-shadow:0 2px 4px rgba(0,0,0,0.06);
    }
  </style>
</head>
<body class="bg-light">
<div class="container py-4">

  <!-- Sticky header -->
  <div class="sticky-header">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">វិក័យប័ត្រដែលមិនទាន់បានគិតលុយ (Unpaid)</h3>
      <div class="no-print">
        <a class="btn btn-outline-secondary" href="reports.php">ថយក្រោយ</a>
      </div>
    </div>

    <!-- Filter form -->
    <form class="card mb-3 no-print" method="get">
      <div class="card-body">
        <div class="row g-3 align-items-end">

          <div class="col-md-3">
            <label class="form-label">ប្រភេទវិក័យប័ត្រ</label>
            <select class="form-select" name="status">
              <option value="open" <?= sel($status_filter,'open') ?>>Open (កំពុងបើក)</option>
              <option value="void" <?= sel($status_filter,'void') ?>>Void (បោះបង់)</option>
              <option value="all"  <?= sel($status_filter,'all')  ?>>All not paid (ទាំងអស់មិនទាន់បង់)</option>
            </select>
          </div>

          <div class="col-md-2">
            <button class="btn btn-primary w-100">Apply</button>
          </div>

        </div>
      </div>
    </form>

    <div class="alert alert-warning mb-0">
      សរុបវិក័យប័ត្រមិនទាន់បានបង់៖ <strong><?= count($rows) ?></strong>
      (filter: <strong><?= htmlspecialchars($status_filter) ?></strong>)
    </div>
  </div> <!-- /sticky-header -->

  <!-- Table -->
  <div class="table-responsive mt-3">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>ID</th>
          <th>Floor/Table</th>
          <th>Order Type</th>
          <th>Status</th>
          <th>Cashier</th>
          <th>Total USD</th>
          <th>Total KHR</th>
          <th>Created At</th>
          <th class="no-print">Action</th>
        </tr>
      </thead>
      <tbody>
      <?php if (!$rows): ?>
        <tr><td colspan="9" class="text-center text-muted py-3">
          គ្មានវិក័យប័ត្រដែលមិនទាន់បានបង់ទេ។
        </td></tr>
      <?php else: ?>
        <?php foreach ($rows as $r): ?>
          <tr>
            <td>#<?= (int)$r['id'] ?></td>
            <td><?= htmlspecialchars($r['floor_name']) ?>/<?= htmlspecialchars($r['table_no']) ?></td>
            <td>
              <?php if ($r['order_type'] === 'takeaway'): ?>
                <span class="badge bg-info text-dark">Take Away</span>
              <?php else: ?>
                <span class="badge bg-secondary">Dine-in</span>
              <?php endif; ?>
            </td>
            <td>
              <?php if ($r['status'] === 'open'): ?>
                <span class="badge bg-warning text-dark">Open</span>
              <?php elseif ($r['status'] === 'void'): ?>
                <span class="badge bg-danger">Void</span>
              <?php else: ?>
                <span class="badge bg-secondary"><?= htmlspecialchars($r['status']) ?></span>
              <?php endif; ?>
            </td>
            <td><?= htmlspecialchars($r['cashier_name'] ?? '-') ?></td>
            <td>$<?= number_format($r['total_usd'],2) ?></td>
            <td><?= number_format($r['total_khr']) ?> ៛</td>
            <td><?= htmlspecialchars($r['created_at']) ?></td>
            <td class="no-print">
              <a class="btn btn-sm btn-outline-primary"
                 href="sale.php?invoice=<?= (int)$r['id'] ?>">
                Open in Sale
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
