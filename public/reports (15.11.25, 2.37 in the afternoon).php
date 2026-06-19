<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_role('admin');
require_once __DIR__ . '/../helpers.php';
$s = get_settings();

$mode = $_GET['mode'] ?? 'daily';
$now = new DateTime('now');
$start = clone $now; $end = clone $now;

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
$st = db()->prepare("SELECT * FROM invoices WHERE status='paid' AND paid_at BETWEEN ? AND ? ORDER BY paid_at DESC");
$st->execute([$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]);
$data = $st->fetchAll();

$total_usd = 0.0; $total_khr = 0;
foreach ($data as $r) { $total_usd += (float)$r['total_usd']; $total_khr += (int)$r['total_khr']; }
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Reports – FTC</title>
  <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
</head>
<body class="bg-light">
<div class="container py-4">
  <div class="d-flex justify-content-between">
    <h3>Reports (<?= htmlspecialchars($mode) ?>)</h3>
    <!-- <div class="btn-group"> -->
      <a class="btn btn-outline-primary" href="?mode=daily">Daily</a>
      <a class="btn btn-outline-primary " href="?mode=weekly">Weekly</a>
      <a class="btn btn-outline-primary " href="?mode=monthly">Monthly</a>
      <a class="btn btn-secondary " href="reports_graph.php?mode=<?= $mode ?>">Graph</a>
      <a  class="btn btn-success " href="reports_graph_adv.php?mode=<?= $mode ?>&ctype=bar">Graph Advanced</a>
      <a class="btn btn-outline-secondary " href="index.php">Back</a>
    <!-- </div> -->
  </div>
  <div class="alert alert-info mt-3">
    Period: <?= $start->format('Y-m-d') ?> → <?= $end->format('Y-m-d') ?> &nbsp; | &nbsp;
    Total: <strong>$<?= number_format($total_usd,2) ?></strong> / <strong><?= number_format($total_khr) ?> ៛</strong>
  </div>
  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>ID</th><th>Floor/Table</th><th>Currency</th><th>Total USD</th><th>Total KHR</th><th>Paid At</th><th>Detail</th>
        </tr>
      </thead>
      <tbody>
      <?php foreach ($data as $r): ?>
        <tr>
          <td>#<?= $r['id'] ?></td>
          <td><?= $r['floor_id'] ?>/<?= $r['table_id'] ?></td>
          <td><?= $r['pay_currency'] ?></td>
          <td>$<?= number_format((float)$r['total_usd'],2) ?></td>
          <td><?= number_format((int)$r['total_khr']) ?> ៛</td>
          <td><?= htmlspecialchars($r['paid_at']) ?></td>
          <td><button class="btn btn-sm btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#inv<?= $r['id'] ?>">Items</button></td>
        </tr>
        <tr class="collapse" id="inv<?= $r['id'] ?>">
          <td colspan="7">
            <?php $it = db()->prepare("SELECT name, qty, line_total_usd, line_total_khr FROM invoice_items WHERE invoice_id=?"); $it->execute([$r['id']]); $its = $it->fetchAll(); ?>
            <ul class="mb-0">
              <?php foreach ($its as $i): ?>
                <li><?= htmlspecialchars($i['name']) ?> × <?= (int)$i['qty'] ?> —
                    $<?= number_format((float)$i['line_total_usd'],2) ?> /
                    <?= number_format((int)$i['line_total_khr']) ?> ៛</li>
              <?php endforeach; ?>
            </ul>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<script src="<?= BOOTSTRAP_JS ?>"></script>
</body>
</html>
