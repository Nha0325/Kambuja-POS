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
  default:
    $mode = 'daily';
    $start->setTime(0,0,0);
    $end->setTime(23,59,59);
}

/* ------------------------
 * Load sessions
 * ------------------------ */

$sql = "
  SELECT 
    bs.*,
    u1.username AS opened_by_name,
    u2.username AS closed_by_name
  FROM business_sessions bs
  LEFT JOIN users u1 ON u1.id = bs.opened_by
  LEFT JOIN users u2 ON u2.id = bs.closed_by
  WHERE bs.opened_at BETWEEN :start AND :end
  ORDER BY bs.opened_at DESC, bs.id DESC
";
$st = $pdo->prepare($sql);
$st->execute([
  ':start' => $start->format('Y-m-d H:i:s'),
  ':end'   => $end->format('Y-m-d H:i:s'),
]);
$sessions = $st->fetchAll();

function sel($a,$b){ return $a==$b?'selected':''; }

?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Close Business Reports – FTC POS</title>
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

    /* Sticky header (title + filters + period) */
    .sticky-header {
      position: sticky;
      top: 0;
      z-index: 1020;
      background: #ffffff;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }
  </style>
</head>
<body class="bg-light">
<div class="container py-4">

  <!-- Sticky top block -->
  <div class="sticky-header">

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Close Business Reports</h3>
      <a class="btn btn-outline-secondary no-print" href="reports.php">Back</a>
    </div>

    <!-- FILTER FORM -->
    <form class="card mb-3 no-print" method="get">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label">Mode</label>
            <select class="form-select" name="mode">
              <option value="daily"   <?= sel($mode,'daily') ?>>Daily</option>
              <option value="weekly"  <?= sel($mode,'weekly') ?>>Weekly</option>
              <option value="monthly" <?= sel($mode,'monthly') ?>>Monthly</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-primary w-100">Apply</button>
          </div>
        </div>
      </div>
    </form>

    <div class="alert alert-info mb-0">
      Period: <?= $start->format('Y-m-d') ?> → <?= $end->format('Y-m-d') ?>
    </div>
  </div>
  <!-- /sticky-header -->

  <div class="table-responsive mt-3">
    <table class="table table-striped table-hover table-sm">
      <thead class="table-light">
        <tr>
          <th>ID</th>
          <th>Opened</th>
          <th>Closed</th>
          <th>Opened By</th>
          <th>Closed By</th>
          <th>Opening USD/KHR</th>
          <th>Expected Cash USD/KHR</th>
          <th>Expected QR USD/KHR</th>
          <th>Closing Cash USD/KHR</th>
          <th>Closing QR USD/KHR</th>
          <th>Diff Cash</th>
          <th>Diff QR</th>
          <th>Status</th>
          <th class="no-print">Print</th>
        </tr>
      </thead>
      <tbody>
      <?php if (!$sessions): ?>
        <tr><td colspan="14" class="text-center text-muted py-3">No sessions.</td></tr>
      <?php else: ?>
        <?php foreach ($sessions as $bs): ?>
          <?php
            $opening_usd       = (float)($bs['opening_cash_usd'] ?? 0);
            $opening_khr       = (int)  ($bs['opening_cash_khr'] ?? 0);
            $expected_cash_usd = (float)($bs['expected_cash_usd'] ?? 0);
            $expected_cash_khr = (int)  ($bs['expected_cash_khr'] ?? 0);
            $expected_qr_usd   = (float)($bs['expected_qr_usd']   ?? 0);
            $expected_qr_khr   = (int)  ($bs['expected_qr_khr']   ?? 0);
            $closing_cash_usd  = (float)($bs['closing_cash_usd']  ?? 0);
            $closing_cash_khr  = (int)  ($bs['closing_cash_khr']  ?? 0);
            $closing_qr_usd    = (float)($bs['closing_qr_usd']    ?? 0);
            $closing_qr_khr    = (int)  ($bs['closing_qr_khr']    ?? 0);

            $diff_cash_usd = $closing_cash_usd - $expected_cash_usd;
            $diff_cash_khr = $closing_cash_khr - $expected_cash_khr;
            $diff_qr_usd   = $closing_qr_usd   - $expected_qr_usd;
            $diff_qr_khr   = $closing_qr_khr   - $expected_qr_khr;

            $opened_by = $bs['opened_by_name'] ?: ($bs['opened_by'] ?? '-');
            $closed_by = $bs['closed_by_name'] ?: ($bs['closed_by'] ?? '-');
          ?>
          <tr>
            <td><?= (int)$bs['id'] ?></td>
            <td><?= htmlspecialchars($bs['opened_at']) ?></td>
            <td><?= htmlspecialchars($bs['closed_at'] ?? '') ?></td>
            <td><?= htmlspecialchars($opened_by) ?></td>
            <td><?= htmlspecialchars($closed_by) ?></td>
            <td>
              $<?= number_format($opening_usd,2) ?> /
              <?= number_format($opening_khr) ?> ៛
            </td>
            <td>
              $<?= number_format($expected_cash_usd,2) ?> /
              <?= number_format($expected_cash_khr) ?> ៛
            </td>
            <td>
              $<?= number_format($expected_qr_usd,2) ?> /
              <?= number_format($expected_qr_khr) ?> ៛
            </td>
            <td>
              $<?= number_format($closing_cash_usd,2) ?> /
              <?= number_format($closing_cash_khr) ?> ៛
            </td>
            <td>
              $<?= number_format($closing_qr_usd,2) ?> /
              <?= number_format($closing_qr_khr) ?> ៛
            </td>
            <td>
              $<?= number_format($diff_cash_usd,2) ?> /
              <?= number_format($diff_cash_khr) ?> ៛
            </td>
            <td>
              $<?= number_format($diff_qr_usd,2) ?> /
              <?= number_format($diff_qr_khr) ?> ៛
            </td>
            <td>
              <?php if ($bs['status'] === 'closed'): ?>
                <span class="badge bg-success">Closed</span>
              <?php else: ?>
                <span class="badge bg-warning text-dark"><?= htmlspecialchars($bs['status']) ?></span>
              <?php endif; ?>
            </td>
            <td class="no-print">
              <a class="btn btn-sm btn-outline-dark"
                 target="_blank"
                 href="print_closing_report.php?session_id=<?= (int)$bs['id'] ?>">
                Print
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
