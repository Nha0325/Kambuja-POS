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

$now   = new DateTime('now');
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
 * Filters
 * ------------------------ */

$filter_user_id = (int)($_GET['user_id'] ?? 0);

// load users
$users = $pdo->query("SELECT id, username, role FROM users ORDER BY username")->fetchAll();

function sel($a,$b){ return $a==$b?'selected':''; }

/* ------------------------
 * Main query (one row per PAID invoice)
 * ------------------------ */

$where  = "WHERE i.status = 'paid' AND i.paid_at BETWEEN :start AND :end";
$params = [
    ':start' => $start->format('Y-m-d H:i:s'),
    ':end'   => $end->format('Y-m-d H:i:s')
];

if ($filter_user_id > 0) {
    $where .= " AND (
        i.cashier_id         = :uid
        OR pre.pre_user_id   = :uid
        OR rcpt.rcpt_user_id = :uid
    )";
    $params[':uid'] = $filter_user_id;
}

$sql = "
    SELECT
      i.id,

      -- invoice totals (final paid state)
      i.subtotal_usd,
      i.subtotal_khr,
      i.discount_amount_usd,
      i.discount_amount_khr,
      i.total_usd,
      i.total_khr,

      i.paid_at,
      i.created_at,
      i.cashier_id,
      u.username AS cashier_name,
      COALESCE(f.name, 'Take Away') AS floor_name,
      COALESCE(t.table_no, 'TAKE')  AS table_no,

      /* PRE-ORDER summary */
      pre.pre_count,
      pre.pre_first_printed_at,
      pre.pre_user_id,
      up.username AS pre_user_name,

      /* RECEIPT summary */
      rcpt.rcpt_count,
      rcpt.rcpt_first_printed_at,
      rcpt.rcpt_user_id,
      ur.username AS rcpt_user_name

    FROM invoices i
    LEFT JOIN floors f ON f.id = i.floor_id
    LEFT JOIN tables t ON t.id = i.table_id
    LEFT JOIN users  u ON u.id = i.cashier_id

    /* PRE-ORDER PRINTS aggregate */
    LEFT JOIN (
      SELECT 
        invoice_id,
        COUNT(*)        AS pre_count,
        MIN(printed_at) AS pre_first_printed_at,
        MIN(user_id)    AS pre_user_id
      FROM receipt_print_logs
      WHERE print_type = 'preorder'
      GROUP BY invoice_id
    ) pre ON pre.invoice_id = i.id
    LEFT JOIN users up ON up.id = pre.pre_user_id

    /* RECEIPT PRINTS aggregate */
    LEFT JOIN (
      SELECT 
        invoice_id,
        COUNT(*)        AS rcpt_count,
        MIN(printed_at) AS rcpt_first_printed_at,
        MIN(user_id)    AS rcpt_user_id
      FROM receipt_print_logs
      WHERE print_type = 'receipt'
      GROUP BY invoice_id
    ) rcpt ON rcpt.invoice_id = i.id
    LEFT JOIN users ur ON ur.id = rcpt.rcpt_user_id

    $where
    ORDER BY i.paid_at DESC, i.id DESC
";

$st = $pdo->prepare($sql);
$st->execute($params);
$rows = $st->fetchAll();

/* ------------------------
 * Totals & stats
 * ------------------------ */

$total_usd = 0.0;
$total_khr = 0;
$pre_only  = 0;
$rcpt_only = 0;
$both      = 0;
$none      = 0;

foreach ($rows as $r) {
    $total_usd += (float)$r['total_usd'];
    $total_khr += (int)$r['total_khr'];

    $has_pre  = (int)($r['pre_count']  ?? 0) > 0;
    $has_rcpt = (int)($r['rcpt_count'] ?? 0) > 0;

    if ($has_pre && $has_rcpt) {
        $both++;
    } elseif ($has_pre && !$has_rcpt) {
        $pre_only++;
    } elseif (!$has_pre && $has_rcpt) {
        $rcpt_only++;
    } else {
        $none++;
    }
}

/* ------------------------
 * Prepared statement to load ALL preorder logs with items
 * for one invoice (we will use it in the table loop)
 * ------------------------ */
$preLogsStmt = $pdo->prepare("
    SELECT l.*, u.username
    FROM receipt_print_logs l
    LEFT JOIN users u ON u.id = l.user_id
    WHERE l.invoice_id = ? AND l.print_type = 'preorder'
    ORDER BY l.printed_at ASC, l.id ASC
");
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Pre-Order vs Receipt – FTC POS</title>
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
  </style>
</head>
<body class="bg-light">
<div class="container py-4">

  <!-- Sticky header -->
  <div class="sticky-header">

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">របាយការណ៍ Pre-Order ប្រៀបធៀប Receipt</h3>
      <a class="btn btn-outline-secondary no-print" href="reports.php">Back</a>
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
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label">អ្នកលក់ / អ្នកបោះពុម្ព</label>
            <select class="form-select" name="user_id">
              <option value="0">All users</option>
              <?php foreach ($users as $u): ?>
                <option value="<?= $u['id'] ?>" <?= $filter_user_id==$u['id']?'selected':'' ?>>
                  <?= htmlspecialchars($u['username']) ?> (<?= htmlspecialchars($u['role']) ?>)
                </option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="col-md-2">
            <button class="btn btn-primary w-100">Apply</button>
          </div>

        </div>
      </div>
    </form>

    <!-- Summary -->
    <div class="alert alert-info mb-0">
      Period: <?= $start->format('Y-m-d') ?> → <?= $end->format('Y-m-d') ?>
      &nbsp; | &nbsp;
      Total: <strong>$<?= number_format($total_usd,2) ?></strong> /
             <strong><?= number_format($total_khr) ?> ៛</strong>
      <br>
      Invoice having:
      Pre-Order only: <strong><?= $pre_only ?></strong> &nbsp; |
      Receipt only: <strong><?= $rcpt_only ?></strong> &nbsp; |
      Both: <strong><?= $both ?></strong> &nbsp; |
      None: <strong><?= $none ?></strong>
    </div>

  </div> <!-- /sticky-header -->

  <!-- TABLE -->
  <div class="table-responsive mt-3">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>Invoice #</th>
          <th>Floor/Table</th>
          <th>Cashier (Paid)</th>

          <th>Pre-Order by</th>
          <th>Pre-Order count</th>
          <th>First Pre-Order time</th>

          <th>Receipt by</th>
          <th>Receipt count</th>
          <th>First Receipt time</th>

          <th>Total KHR</th>
          <th>Paid At</th>
          <th class="no-print">Pre-Order Items (all prints)</th>
          <th class="no-print">Actions</th>
        </tr>
      </thead>
      <tbody>
      <?php if (!$rows): ?>
        <tr>
          <td colspan="13" class="text-center text-muted py-3">No data.</td>
        </tr>
      <?php else: ?>
        <?php foreach ($rows as $r): ?>
          <?php
            $invId    = (int)$r['id'];
            $preCount = (int)($r['pre_count'] ?? 0);

            // invoice-level totals (final paid state, used in main table only)
            $inv_sub_usd  = (float)($r['subtotal_usd'] ?? 0);
            $inv_sub_khr  = (int)  ($r['subtotal_khr'] ?? 0);
            $inv_disc_usd = (float)($r['discount_amount_usd'] ?? 0);
            $inv_disc_khr = (int)  ($r['discount_amount_khr'] ?? 0);
            $inv_tot_usd  = (float)($r['total_usd'] ?? 0);
            $inv_tot_khr  = (int)  ($r['total_khr'] ?? 0);
          ?>
          <tr>
            <td>#<?= $invId ?></td>
            <td><?= htmlspecialchars($r['floor_name']) ?>/<?= htmlspecialchars($r['table_no']) ?></td>
            <td><?= htmlspecialchars($r['cashier_name'] ?? '-') ?></td>

            <td><?= htmlspecialchars($r['pre_user_name'] ?? '-') ?></td>
            <td><?= $preCount ?></td>
            <td><?= htmlspecialchars($r['pre_first_printed_at'] ?? '-') ?></td>

            <td><?= htmlspecialchars($r['rcpt_user_name'] ?? '-') ?></td>
            <td><?= (int)($r['rcpt_count'] ?? 0) ?></td>
            <td><?= htmlspecialchars($r['rcpt_first_printed_at'] ?? '-') ?></td>

            <td><?= number_format($r['total_khr']) ?> ៛</td>
            <td><?= htmlspecialchars($r['paid_at']) ?></td>

            <td class="no-print">
              <?php if ($preCount > 0): ?>
                <button class="btn btn-sm btn-outline-secondary"
                        data-bs-toggle="collapse"
                        data-bs-target="#preitems<?= $invId ?>">
                  View all (<?= $preCount ?>)
                </button>
              <?php else: ?>
                <span class="text-muted small">No preorder</span>
              <?php endif; ?>
            </td>

            <td class="no-print">
              <a class="btn btn-sm btn-outline-dark mb-1" target="_blank"
                 href="print_receipt.php?invoice_id=<?= $invId ?>">
                View Receipt
              </a>
            </td>
          </tr>

          <?php if ($preCount > 0): ?>
            <?php
              // Load ALL preorder logs with items for this invoice
              $preLogsStmt->execute([$invId]);
              $logs = $preLogsStmt->fetchAll();
            ?>
            <tr class="collapse no-print" id="preitems<?= $invId ?>">
              <td colspan="13">
                <?php if (!$logs): ?>
                  <div class="text-muted small">
                    No pre-order snapshot logs (maybe old data before feature).
                  </div>
                <?php else: ?>
                  <?php foreach ($logs as $logIndex => $logRow): ?>
                    <?php
                      $items_json = $logRow['items_json'] ?? null;
                      $items = [];

                      $have_snapshot_totals = false;
                      $snap_sub_usd  = 0.0;
                      $snap_sub_khr  = 0;
                      $snap_disc_usd = 0.0;
                      $snap_disc_khr = 0;
                      $snap_tot_usd  = 0.0;
                      $snap_tot_khr  = 0;

                      if ($items_json) {
                          $decoded = json_decode($items_json, true);
                          if (is_array($decoded)) {
                              // New format: { items: [...], subtotal_usd, ... }
                              if (isset($decoded['items']) && is_array($decoded['items'])) {
                                  $items = $decoded['items'];
                                  $have_snapshot_totals = true;

                                  $snap_sub_usd  = (float)($decoded['subtotal_usd'] ?? 0);
                                  $snap_sub_khr  = (int)  ($decoded['subtotal_khr'] ?? 0);
                                  $snap_disc_usd = (float)($decoded['discount_usd'] ?? 0);
                                  $snap_disc_khr = (int)  ($decoded['discount_khr'] ?? 0);
                                  $snap_tot_usd  = (float)($decoded['total_usd'] ?? 0);
                                  $snap_tot_khr  = (int)  ($decoded['total_khr'] ?? 0);
                              } else {
                                  // Old format: plain array of items
                                  $items = $decoded;
                              }
                          }
                      }

                      // compute from items as fallback (and for old logs)
                      $gross_usd = 0.0;
                      $gross_khr = 0;
                      $net_usd   = 0.0;
                      $net_khr   = 0;
                    ?>
                    <div class="mb-3 border rounded p-2">
                      <div class="small mb-1">
                        <strong>Pre-Order #<?= $logIndex+1 ?></strong> |
                        Time: <?= htmlspecialchars($logRow['printed_at']) ?> |
                        User: <?= htmlspecialchars($logRow['username'] ?? '-') ?>
                      </div>

                      <?php if (!$items): ?>
                        <div class="text-muted small">
                          (No item snapshot recorded for this print.)
                        </div>
                      <?php else: ?>
                        <table class="table table-sm mb-1">
                          <thead>
                            <tr>
                              <th style="width:30%;">Item</th>
                              <th style="width:8%;">Qty</th>
                              <th style="width:15%;" class="text-end">Price USD</th>
                              <th style="width:15%;" class="text-end">Price KHR</th>
                              <th style="width:10%;" class="text-end">Disc %</th>
                              <th style="width:11%;" class="text-end">Total USD</th>
                              <th style="width:11%;" class="text-end">Total KHR</th>
                            </tr>
                          </thead>
                          <tbody>
                          <?php foreach ($items as $it): ?>
                            <?php
                              $nm     = $it['name'] ?? '';
                              $qty    = (int)($it['qty'] ?? 0);
                              $p_usd  = (float)($it['price_usd'] ?? 0);
                              $p_khr  = (int)($it['price_khr'] ?? 0);
                              $disc   = isset($it['discount_pct']) && $it['discount_pct'] !== null
                                          ? (float)$it['discount_pct']
                                          : 0.0;

                              // net line total (after discount) – from snapshot if present
                              $lt_usd = isset($it['line_total_usd'])
                                          ? (float)$it['line_total_usd']
                                          : ($qty * $p_usd * (1 - $disc/100));
                              $lt_khr = isset($it['line_total_khr'])
                                          ? (int)$it['line_total_khr']
                                          : (int)round($qty * $p_khr * (1 - $disc/100));

                              // gross before discount
                              $g_usd = $qty * $p_usd;
                              $g_khr = $qty * $p_khr;

                              $gross_usd += $g_usd;
                              $gross_khr += $g_khr;
                              $net_usd   += $lt_usd;
                              $net_khr   += $lt_khr;
                            ?>
                            <tr>
                              <td><?= htmlspecialchars($nm) ?></td>
                              <td><?= $qty ?></td>
                              <td class="text-end">$<?= number_format($p_usd,2) ?></td>
                              <td class="text-end"><?= number_format($p_khr) ?> ៛</td>
                              <td class="text-end">
                                <?= $disc > 0 ? number_format($disc,1).'%' : '-' ?>
                              </td>
                              <td class="text-end">
                                $<?= number_format($lt_usd,2) ?>
                              </td>
                              <td class="text-end">
                                <?= number_format($lt_khr) ?> ៛
                              </td>
                            </tr>
                          <?php endforeach; ?>
                          </tbody>
                          <?php
                            // Fallback totals from items
                            $disc_usd_calc = $gross_usd - $net_usd;
                            $disc_khr_calc = $gross_khr - $net_khr;

                            if ($disc_usd_calc < 0 && $disc_usd_calc > -0.005) $disc_usd_calc = 0;
                            if ($disc_khr_calc < 0 && $disc_khr_calc > -5)     $disc_khr_calc = 0;

                            $pay_usd_calc = $net_usd;
                            $pay_khr_calc = $net_khr;

                            // Choose which totals to display:
                            //  - If snapshot has totals (new logs) => use them
                            //  - Else => use calculated from items
                            if ($have_snapshot_totals) {
                                $sub_usd  = $snap_sub_usd;
                                $sub_khr  = $snap_sub_khr;
                                $disc_usd = $snap_disc_usd;
                                $disc_khr = $snap_disc_khr;
                                $pay_usd  = $snap_tot_usd;
                                $pay_khr  = $snap_tot_khr;
                            } else {
                                $sub_usd  = $gross_usd;
                                $sub_khr  = $gross_khr;
                                $disc_usd = $disc_usd_calc;
                                $disc_khr = $disc_khr_calc;
                                $pay_usd  = $pay_usd_calc;
                                $pay_khr  = $pay_khr_calc;
                            }
                          ?>
                          <tfoot>
                            <tr>
                              <th colspan="5" class="text-end">សរុប</th>
                              <th class="text-end">
                                $<?= number_format($sub_usd,2) ?>
                              </th>
                              <th class="text-end">
                                <?= number_format($sub_khr) ?> ៛
                              </th>
                            </tr>
                            <tr>
                              <th colspan="5" class="text-end">បញ្ចុះតម្លៃ</th>
                              <th class="text-end">
                                $<?= number_format($disc_usd,2) ?>
                              </th>
                              <th class="text-end">
                                <?= number_format($disc_khr) ?> ៛
                              </th>
                            </tr>
                            <tr>
                              <th colspan="5" class="text-end">ទឹកប្រាក់ត្រូវបង់</th>
                              <th class="text-end">
                                $<?= number_format($pay_usd,2) ?>
                              </th>
                              <th class="text-end">
                                <?= number_format($pay_khr) ?> ៛
                              </th>
                            </tr>
                          </tfoot>
                        </table>
                      <?php endif; ?>
                    </div>
                  <?php endforeach; ?>
                <?php endif; ?>
              </td>
            </tr>
          <?php endif; ?>

        <?php endforeach; ?>
      <?php endif; ?>
      </tbody>
    </table>
  </div>

</div>
<script src="<?= BOOTSTRAP_JS ?>"></script>
</body>
</html>
