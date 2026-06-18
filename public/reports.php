<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_role('admin');
require_once __DIR__ . '/../helpers.php';

$s = get_settings();
$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

/* ================= DELETE INVOICE(S) FROM REPORT (ADMIN ONLY) ================= */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // 1) BULK DELETE
    if (isset($_POST['bulk_delete']) && !empty($_POST['ids']) && is_array($_POST['ids'])) {
        $ids = array_map('intval', $_POST['ids']);
        $ids = array_filter($ids, fn($v) => $v > 0);

        if (!empty($ids)) {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));

            try {
                $pdo->beginTransaction();

                // delete invoice_items
                $st = $pdo->prepare("DELETE FROM invoice_items WHERE invoice_id IN ($placeholders)");
                $st->execute($ids);

                // delete payment_invoices if table exists
                try {
                    $st = $pdo->prepare("DELETE FROM payment_invoices WHERE invoice_id IN ($placeholders)");
                    $st->execute($ids);
                } catch (Throwable $e) {
                    // ignore if table not exist
                }

                // delete invoices
                $st = $pdo->prepare("DELETE FROM invoices WHERE id IN ($placeholders)");
                $st->execute($ids);

                $pdo->commit();
            } catch (Throwable $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
            }
        }

        redirect('reports.php');
    }

    // 2) SINGLE DELETE (from row "Delete" button)
    if (isset($_POST['delete_invoice_id'])) {
        $delete_id = (int)$_POST['delete_invoice_id'];

        if ($delete_id > 0) {
            try {
                $pdo->beginTransaction();

                $st = $pdo->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
                $st->execute([$delete_id]);

                try {
                    $st = $pdo->prepare("DELETE FROM payment_invoices WHERE invoice_id = ?");
                    $st->execute([$delete_id]);
                } catch (Throwable $e) {
                    // ignore if table not exist
                }

                $st = $pdo->prepare("DELETE FROM invoices WHERE id = ?");
                $st->execute([$delete_id]);

                $pdo->commit();
            } catch (Throwable $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
            }
        }

        redirect('reports.php');
    }
}

/* ================= COMPANY / RECEIPT INFO ================= */
$company_name    = trim($s['company_name']    ?? ($s['business_name'] ?? 'FTC POS'));
$receipt_title   = trim($s['receipt_title']   ?? '');
$company_address = trim($s['company_address'] ?? '');
$company_tel     = trim($s['company_tel']     ?? '');

if ($receipt_title === '') {
    $receipt_title = $company_name; // fallback if empty
}

/* ------------------------
 * Date range: mode + optional custom from/to
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
 * Extra filters
 * ------------------------ */

// invoice | product
$view = $_GET['view'] ?? 'invoice';

// user filter
$cashier_id = (int)($_GET['user_id'] ?? 0);

// pay method filter: '' | cash | qr
$pay_method = $_GET['pay_method'] ?? '';

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

if ($pay_method === 'cash' || $pay_method === 'qr') {
  $where .= " AND i.pay_method = :pm";
  $params[':pm'] = $pay_method;
}

/* ------------------------
 * Loading Data
 * ------------------------ */
$total_usd = 0.0;
$total_khr = 0;

$data_invoices = [];
$data_products = [];

function sel($a,$b){ return $a==$b?'selected':''; }

if ($view === 'product') {

  $sqlProd = "
    SELECT 
      it.product_id,
      it.name AS product_name,
      SUM(it.qty) AS qty,
      SUM(it.line_total_usd) AS sum_usd,
      SUM(it.line_total_khr) AS sum_khr
    FROM invoice_items it
    JOIN invoices i ON i.id = it.invoice_id
    $where
    GROUP BY it.product_id, it.name
    ORDER BY it.name ASC
  ";

  $stp = $pdo->prepare($sqlProd);
  $stp->execute($params);
  $data_products = $stp->fetchAll();

  foreach ($data_products as $r) {
    $total_usd += (float)$r['sum_usd'];
    $total_khr += (int)$r['sum_khr'];
  }

} else {

  $sqlInv = "
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

  $st = $pdo->prepare($sqlInv);
  $st->execute($params);
  $data_invoices = $st->fetchAll();

  foreach ($data_invoices as $r) {
    // already FINAL amount after all discounts
    $total_usd += (float)$r['total_usd'];
    $total_khr += (int)$r['total_khr'];
  }
}

/* ------------------------
 *  EXPORT (CSV / XLS / VIEW)
 * ------------------------ */

if (isset($_GET['export'])) {

    $ext = $_GET['export'];

    // ---------- CSV / XLS download ----------
    if ($ext === 'csv' || $ext === 'xls') {

        $fname = "ftc_report_{$view}_{$mode}_" . $start->format('Ymd') . ".$ext";

        if ($ext === 'csv') {
            header('Content-Type: text/csv; charset=utf-8');
        } else {
            header('Content-Type: application/vnd.ms-excel; charset=utf-8');
        }
        header("Content-Disposition: attachment; filename=$fname");

        $out = fopen('php://output', 'w');

        if ($view === 'product') {
            // header
            fputcsv($out, ['Product', 'Qty', 'Total USD', 'Total KHR']);

            foreach ($data_products as $r) {
                fputcsv($out, [
                  $r['product_name'],
                  $r['qty'],
                  number_format($r['sum_usd'],2,'.',''),
                  $r['sum_khr']
                ]);
            }

            // blank row
            fputcsv($out, ['', '', '', '']);

            // grand total row
            fputcsv($out, [
              'GRAND TOTAL',
              '',
              number_format($total_usd,2,'.',''),
              $total_khr
            ]);

        } else {
            // header
            fputcsv($out, [
              'Invoice ID','Floor','Table','Cashier',
              'Pay Method','Currency','Total USD','Total KHR','Paid At'
            ]);

            foreach ($data_invoices as $r) {
                fputcsv($out, [
                  $r['id'],
                  $r['floor_name'],
                  $r['table_no'],
                  $r['cashier_name'],
                  $r['pay_method'],
                  $r['pay_currency'],
                  number_format($r['total_usd'],2,'.',''),
                  (int)$r['total_khr'],
                  $r['paid_at']
                ]);
            }

            // blank row
            fputcsv($out, ['', '', '', '', '', '', '', '', '']);

            // grand total row
            fputcsv($out, [
              'GRAND TOTAL',
              '',
              '',
              '',
              '',
              '',
              number_format($total_usd,2,'.',''),
              $total_khr,
              ''
            ]);
        }

        fclose($out);
        exit;
    }

    // ---------- VIEW export (display in browser, nice for print/PDF) ----------
    if ($ext === 'view') {
        $autoprint = isset($_GET['autoprint']) ? (int)$_GET['autoprint'] : 0;
        ?>
        <!doctype html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <title><?= htmlspecialchars($receipt_title) ?> – Report</title>
          <style>
            body {
              font-family: DejaVu Sans, Arial, sans-serif;
              font-size: 13px;
              margin: 20px;
              color: #333;
            }
            h2 {
              margin: 0 0 4px 0;
            }
            .small {
              font-size: 12px;
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
            .text-right { text-align: right; }
            .text-center{ text-align: center; }
            .header-row {
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>

        <div class="header-row">
          <h2><?= htmlspecialchars($receipt_title) ?></h2>

          <div class="small">
            <?= htmlspecialchars($company_name) ?><br>
            <?php if ($company_address): ?>
              <?= htmlspecialchars($company_address) ?><br>
            <?php endif; ?>
            <?php if ($company_tel): ?>
              Tel: <?= htmlspecialchars($company_tel) ?><br>
            <?php endif; ?>
            Report (<?= htmlspecialchars($mode) ?>)
          </div>
        </div>

        <div class="small" style="margin-bottom:6px;">
          Period: <?= $start->format('Y-m-d') ?> → <?= $end->format('Y-m-d') ?><br>
          Total: <strong>$<?= number_format($total_usd,2) ?></strong> /
                 <strong><?= number_format($total_khr) ?> ៛</strong><br>
          View: <strong><?= htmlspecialchars($view) ?></strong>
        </div>

        <?php if ($view === 'product'): ?>

          <table>
            <thead>
              <tr>
                <th style="width:5%;">#</th>
                <th style="width:45%;">Product</th>
                <th style="width:10%;" class="text-center">Qty</th>
                <th style="width:20%;" class="text-right">Total USD</th>
                <th style="width:20%;" class="text-right">Total KHR</th>
              </tr>
            </thead>
            <tbody>
            <?php if (!$data_products): ?>
              <tr><td colspan="5" class="text-center small">No data.</td></tr>
            <?php else: ?>
              <?php $i = 1; foreach ($data_products as $r): ?>
                <tr>
                  <td class="text-center"><?= $i++ ?></td>
                  <td><?= htmlspecialchars($r['product_name']) ?></td>
                  <td class="text-center"><?= (int)$r['qty'] ?></td>
                  <td class="text-right">$<?= number_format($r['sum_usd'],2) ?></td>
                  <td class="text-right"><?= number_format($r['sum_khr']) ?> ៛</td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
          </table>

        <?php else: ?>

          <table>
            <thead>
              <tr>
                <th style="width:6%;">ID</th>
                <th style="width:18%;">Floor/Table</th>
                <th style="width:15%;">Cashier</th>
                <th style="width:15%;">Subtotal</th>
                <th style="width:15%;">Invoice Discount</th>
                <th style="width:15%;" class="text-right">Final Total</th>
                <th style="width:16%;">Paid At</th>
              </tr>
            </thead>
            <tbody>
            <?php if (!$data_invoices): ?>
              <tr><td colspan="7" class="text-center small">No data.</td></tr>
            <?php else: ?>
              <?php foreach ($data_invoices as $r): ?>
                <tr>
                  <td class="text-center">#<?= (int)$r['id'] ?></td>
                  <td><?= htmlspecialchars($r['floor_name']) ?>/<?= htmlspecialchars($r['table_no']) ?></td>
                  <td><?= htmlspecialchars($r['cashier_name'] ?? '-') ?></td>
                  <td>
                    $<?= number_format($r['subtotal_usd'],2) ?>
                    / <?= number_format($r['subtotal_khr']) ?>៛
                  </td>
                  <td>
                    <?php
                      $disc_pct = (float)$r['discount_pct'];
                      $disc_usd = (float)$r['discount_amount_usd'];
                      $disc_khr = (int)$r['discount_amount_khr'];
                      if ($disc_pct > 0 || $disc_usd > 0 || $disc_khr > 0):
                    ?>
                      -<?= number_format($disc_pct,1) ?>%,
                      -$<?= number_format($disc_usd,2) ?> /
                      -<?= number_format($disc_khr) ?>៛
                    <?php else: ?>
                      –
                    <?php endif; ?>
                  </td>
                  <td class="text-right">
                    $<?= number_format($r['total_usd'],2) ?> /
                    <?= number_format($r['total_khr']) ?>៛
                  </td>
                  <td><?= htmlspecialchars($r['paid_at']) ?></td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
          </table>

        <?php endif; ?>

        <?php if ($autoprint): ?>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
        <?php endif; ?>

        </body>
        </html>
        <?php
        exit;
    }
}
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Reports – FTC</title>
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
    .form-label{
      padding-top: 5px;
    }
  </style>
</head>
<body class="bg-light">
<div class="container py-4">

  <div class="sticky-header">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">របាយការណ៍ (<?= htmlspecialchars($mode) ?>)</h3>
      <div class="col-md-6 no-print">
        <a class="btn btn-secondary " href="reports_receipts.php?mode=<?= $mode ?>">របាយការណ៍លក់មួយៗ</a>
        <a class="btn btn.success btn-success " href="reports_business.php">របាយការណ៍បិទបញ្ជី</a>
        <a class="btn btn-success" href="unpaid_invoices.php">មិនទាន់គិតលុយ</a>
        <a class="btn btn-outline-secondary " href="index.php">ថយក្រោយ</a>
      </div>
    </div>

    <!-- FILTER FORM -->
    <form class="card mb-3 no-print" method="get">
      <div class="card-body">
        <div class="row g-3 align-items-end">

          <input type="hidden" name="view" value="<?= htmlspecialchars($view) ?>">

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
            <label class="form-label">ប្រភេទការចាយ</label>
            <select class="form-select" name="pay_method">
              <option value="">All</option>
              <option value="cash" <?= sel($pay_method,'cash') ?>>Cash</option>
              <option value="qr"   <?= sel($pay_method,'qr') ?>>QR</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label">View</label>
            <select class="form-select" name="view">
              <option value="invoice" <?= sel($view,'invoice') ?>>Invoice</option>
              <option value="product" <?= sel($view,'product') ?>>Product</option>
            </select>
          </div>
          <div class="row">
            <div class="col-md-2">
              <div class="datecust">
                <label class="form-label">ចាប់ពីថ្ងៃ</label>
                <input type="date" name="date_from" class="form-control"
                      value="<?= htmlspecialchars($date_from_value) ?>">
              </div>
            </div>
            <div class="col-md-2">
              <div class="datecust">
                <label class="form-label">រហូតដល់ថ្ងៃ</label>
                <input type="date" name="date_to" class="form-control"
                      value="<?= htmlspecialchars($date_to_value) ?>">
              </div>
            </div>
          </div>

          <div class="col-md-2">
            <button class="btn btn-primary w-100 mt-3 mt-md-0">Apply</button>
          </div>

        </div>
      </div>
    </form>

    <div class="mb-3 d-flex gap-2 no-print">
      <a href="?<?= http_build_query($_GET + ['export'=>'xls']) ?>"
        class="btn btn-success">Export Excel</a>

      <a href="?<?= http_build_query($_GET + ['export'=>'view','autoprint'=>1]) ?>"
        target="_blank"
        class="btn btn-outline-primary">
        Export as Display / Print 🖨️
      </a>
    </div>

    <div class="alert alert-info mb-0">
      Period: <?= $start->format('Y-m-d') ?> → <?= $end->format('Y-m-d') ?> &nbsp; |
      Total: <strong>$<?= number_format($total_usd,2) ?></strong> /
             <strong><?= number_format($total_khr) ?> ៛</strong>
    </div>
  </div> <!-- /sticky-header -->


  <?php if ($view === 'product'): ?>

  <!-- PRODUCT VIEW -->
  <div class="table-responsive mt-3">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>#</th>
          <th>Product</th>
          <th class="text-center">Qty</th>
          <th class="text-end">Total USD</th>
          <th class="text-end">Total KHR</th>
        </tr>
      </thead>
      <tbody>
        <?php if (!$data_products): ?>
          <tr><td colspan="5" class="text-center text-muted py-3">No data.</td></tr>
        <?php else: ?>
          <?php $i=1; foreach ($data_products as $r): ?>
            <tr>
              <td><?= $i++ ?></td>
              <td><?= htmlspecialchars($r['product_name']) ?></td>
              <td class="text-center"><?= $r['qty'] ?></td>
              <td class="text-end">$<?= number_format($r['sum_usd'],2) ?></td>
              <td class="text-end"><?= number_format($r['sum_khr']) ?> ៛</td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>

  <?php else: ?>

  <!-- INVOICE VIEW WITH BULK + SINGLE DELETE + FINAL PAYMENT + ITEM DETAIL -->
  <form method="post" id="invoiceForm" class="mt-3">
    <!-- for single delete via JS -->
    <input type="hidden" name="delete_invoice_id" id="delete_invoice_id" value="">

    <div class="mb-2 no-print d-flex gap-2">
      <button type="submit"
              name="bulk_delete"
              value="1"
              class="btn btn-danger btn-sm"
              onclick="return confirm('តើអ្នកចង់លុបវិក្កយបត្រដែលបានជ្រើសមែនទេ?');">
        Delete selected
      </button>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-light">
        <tr>
          <th class="no-print">
            <input type="checkbox" id="checkAll">
          </th>
          <th>ID</th>
          <th>Floor/Table</th>
          <th>Cashier</th>
          <th>Subtotal</th>
          <th>Invoice Discount</th>
          <th>Final Total</th>
          <th>Payment</th>
          <th>Paid At</th>
          <th class="no-print">Detail</th>
          <th class="no-print">Delete</th>
        </tr>
        </thead>
        <tbody>
        <?php if (!$data_invoices): ?>
          <tr><td colspan="11" class="text-center text-muted py-3">No data.</td></tr>
        <?php else: ?>
          <?php foreach ($data_invoices as $r): ?>
            <?php
              $sub_usd  = (float)$r['subtotal_usd'];
              $sub_khr  = (int)$r['subtotal_khr'];
              $tot_usd  = (float)$r['total_usd'];
              $tot_khr  = (int)$r['total_khr'];

              $disc_pct = (float)$r['discount_pct'];
              $disc_usd = (float)$r['discount_amount_usd'];
              $disc_khr = (int)$r['discount_amount_khr'];

              $pay_method  = $r['pay_method'] ?? '';
              $pay_currency= $r['pay_currency'] ?? '';
              $cash_usd    = (float)($r['cash_in_usd'] ?? 0);
              $cash_khr    = (int)($r['cash_in_khr'] ?? 0);
              $change_usd  = (float)($r['change_usd'] ?? 0);
              $change_khr  = (int)($r['change_khr'] ?? 0);
            ?>
            <tr>
              <!-- checkbox for bulk delete -->
              <td class="no-print">
                <input type="checkbox" name="ids[]" value="<?= (int)$r['id'] ?>" class="row-check">
              </td>

              <td>#<?= (int)$r['id'] ?></td>
              <td><?= htmlspecialchars($r['floor_name']) ?>/<?= htmlspecialchars($r['table_no']) ?></td>
              <td><?= htmlspecialchars($r['cashier_name'] ?? '-') ?></td>

              <!-- Subtotal (after item discounts only) -->
              <td>
                <div class="small">
                  $<?= number_format($sub_usd,2) ?> /
                  <?= number_format($sub_khr) ?> ៛
                </div>
              </td>

              <!-- Invoice-level discount -->
              <td>
                <?php if ($disc_pct > 0 || $disc_usd > 0 || $disc_khr > 0): ?>
                  <div class="small">
                    <div>-<?= number_format($disc_pct,1) ?>%</div>
                    <div>
                      -$<?= number_format($disc_usd,2) ?> /
                      -<?= number_format($disc_khr) ?> ៛
                    </div>
                  </div>
                <?php else: ?>
                  <span class="text-muted small">–</span>
                <?php endif; ?>
              </td>

              <!-- Final total (customer final pay) -->
              <td>
                <div class="small fw-semibold">
                  $<?= number_format($tot_usd,2) ?> /
                  <?= number_format($tot_khr) ?> ៛
                </div>
              </td>

              <!-- Payment info -->
              <td>
                <div class="small">
                  <div>
                    Method:
                    <?php if ($pay_method === 'qr'): ?>
                      <span class="badge bg-info text-dark">
                        QR <?= htmlspecialchars($pay_currency) ?>
                      </span>
                    <?php else: ?>
                      <span class="badge bg-secondary text-light">
                        Cash <?= htmlspecialchars($pay_currency) ?>
                      </span>
                    <?php endif; ?>
                  </div>

                  <?php if ($cash_usd > 0 || $cash_khr > 0 || $change_usd > 0 || $change_khr > 0): ?>
                    <div>Cash: $<?= number_format($cash_usd,2) ?> / <?= number_format($cash_khr) ?>៛</div>
                    <div class="text-muted">
                      Change: $<?= number_format($change_usd,2) ?> / <?= number_format($change_khr) ?>៛
                    </div>
                  <?php else: ?>
                    <div class="text-muted">No cash detail</div>
                  <?php endif; ?>
                </div>
              </td>

              <td><?= htmlspecialchars($r['paid_at']) ?></td>

              <td class="no-print">
                <button class="btn btn-sm btn-outline-secondary"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#inv<?= (int)$r['id'] ?>">Items</button>
              </td>
              <td class="no-print">
                <button type="button"
                        class="btn btn-sm btn-outline-danger"
                        onclick="deleteSingle(<?= (int)$r['id'] ?>)">
                  Delete
                </button>
              </td>
            </tr>
            <tr class="collapse no-print" id="inv<?= (int)$r['id'] ?>">
              <td colspan="11">
                <?php
                  $it = $pdo->prepare("
                    SELECT name, qty, price_usd, price_khr,
                           COALESCE(discount_pct,0) AS discount_pct,
                           line_total_usd, line_total_khr
                      FROM invoice_items
                     WHERE invoice_id=?
                     ORDER BY id ASC
                  ");
                  $it->execute([$r['id']]);
                  $its = $it->fetchAll();
                ?>
                <?php if (!$its): ?>
                  <div class="text-muted small">No items.</div>
                <?php else: ?>
                  <table class="table table-sm mb-0">
                    <thead>
                      <tr class="small text-muted">
                        <th>Item</th>
                        <th class="text-center">Qty</th>
                        <th class="text-end">Price</th>
                        <th class="text-center">% Disc</th>
                        <th class="text-end">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($its as $i): ?>
                      <tr class="small">
                        <td><?= htmlspecialchars($i['name']) ?></td>
                        <td class="text-center"><?= (int)$i['qty'] ?></td>
                        <td class="text-end">
                          <?= number_format($i['price_khr']) ?>៛ /
                          $<?= number_format($i['price_usd'],2) ?>
                        </td>
                        <td class="text-center">
                          <?= number_format((float)$i['discount_pct'],1) ?>%
                        </td>
                        <td class="text-end">
                          <?= number_format($i['line_total_khr']) ?>៛ /
                          $<?= number_format($i['line_total_usd'],2) ?>
                        </td>
                      </tr>
                    <?php endforeach; ?>
                    </tbody>
                  </table>
                <?php endif; ?>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
        </tbody>
      </table>
    </div>
  </form>

  <?php endif; ?>

</div>
<script src="<?= BOOTSTRAP_JS ?>"></script>
<script>
// select all / unselect all
document.addEventListener('DOMContentLoaded', function() {
  const checkAll = document.getElementById('checkAll');
  const rowChecks = document.querySelectorAll('.row-check');

  if (checkAll) {
    checkAll.addEventListener('change', function() {
      rowChecks.forEach(cb => cb.checked = checkAll.checked);
    });
  }
});

// single delete using same form
function deleteSingle(id) {
  if (!confirm('តើអ្នកចង់លុបវិក្កយបត្រនេះមែនទេ?')) return;
  const hidden = document.getElementById('delete_invoice_id');
  hidden.value = id;
  document.getElementById('invoiceForm').submit();
}
</script>
</body>
</html>
