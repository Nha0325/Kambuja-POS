<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$user = current_user();
$user_id = $user['id'] ?? null;

// Load settings for rate info
$s = get_settings();
$rate_default = (int)($s['usd_to_khr'] ?? 4100);

$msg = ''; 
$ok  = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $action = $_POST['action'] ?? '';

  // Common: collect selected invoice IDs
  $ids = array_map('intval', $_POST['invoice_ids'] ?? []);
  $ids = array_values(array_unique(array_filter($ids)));

  try {

    if ($action === 'preprint') {
      // ===================== PRE-PRINT ONLY =====================
      if (!$ids) {
        throw new Exception("Please select at least one open invoice for pre-print.");
      }

      // Optional: check they are still open (not strictly required for pre-print)
      $in_q = implode(',', array_fill(0, count($ids), '?'));
      $st   = $pdo->prepare("SELECT id FROM invoices WHERE id IN ($in_q) AND status='open'");
      $st->execute($ids);
      $found = $st->fetchAll(PDO::FETCH_COLUMN);

      if (!$found) {
        throw new Exception("No open invoices found for selected IDs.");
      }

      // Redirect to pre-print page with selected IDs as GET
      $queryIds = implode(',', $found);
      header("Location: print_merged_preprint.php?invoice_ids=" . urlencode($queryIds));
      exit;
    }

    if ($action === 'merge_pay') {
      // ===================== MERGE & PAY (existing logic) =====================
      if (!$ids) throw new Exception("Please select at least one open invoice.");

      // Get open invoices only
      $in_q = implode(',', array_fill(0, count($ids), '?'));
      $st   = $pdo->prepare("SELECT * FROM invoices WHERE id IN ($in_q) AND status='open'");
      $st->execute($ids);
      $invs = $st->fetchAll();
      if (!$invs) throw new Exception("No open invoices found for selected IDs.");

      $sum_usd = 0.00; 
      $sum_khr = 0; 
      $any_rate = $rate_default;

      foreach ($invs as $iv) {
        $sum_usd += (float)$iv['total_usd'];
        $sum_khr += (int)$iv['total_khr'];
        if (!empty($iv['usd_to_khr'])) {
          $any_rate = (int)$iv['usd_to_khr'];
        }
      }

      $pay_currency = $_POST['pay_currency'] ?? 'USD';
      $cash_in_usd  = (float)($_POST['cash_in_usd'] ?? 0);
      $cash_in_khr  = (int)($_POST['cash_in_khr'] ?? 0);
      $change_usd   = 0.00; 
      $change_khr   = 0;

      if ($pay_currency === 'USD') {
        $total_cash_usd = $cash_in_usd + ($cash_in_khr / max(1, $any_rate));
        $change_usd     = max(0, $total_cash_usd - $sum_usd);
      } else {
        $total_cash_khr = $cash_in_khr + (int)round($cash_in_usd * $any_rate, 0);
        $change_khr     = max(0, $total_cash_khr - $sum_khr);
      }

      $pdo->beginTransaction();

      // Create payment
      $insPay = $pdo->prepare("
        INSERT INTO payments (pay_currency, total_usd, total_khr, cash_in_usd, cash_in_khr, change_usd, change_khr, cashier_user_id)
        VALUES (?,?,?,?,?,?,?,?)
      ");
      $insPay->execute([
        $pay_currency,
        $sum_usd,
        $sum_khr,
        $cash_in_usd,
        $cash_in_khr,
        $change_usd,
        $change_khr,
        $user_id
      ]);
      $payment_id = (int)$pdo->lastInsertId();

      // Link invoices
      $insLink = $pdo->prepare("
        INSERT INTO payment_invoices (payment_id, invoice_id, amount_usd, amount_khr)
        VALUES (?,?,?,?)
      ");
      $updInv = $pdo->prepare("
        UPDATE invoices
           SET status='paid',
               paid_at=?,
               pay_currency=?,
               cash_in_usd=?,
               cash_in_khr=?,
               change_usd=?,
               change_khr=?
         WHERE id=?
      ");
      $freeTable = $pdo->prepare("UPDATE tables SET status='free' WHERE id=?");

      $now = date('Y-m-d H:i:s');
      foreach ($invs as $iv) {
        $invId = (int)$iv['id'];

        $insLink->execute([
          $payment_id,
          $invId,
          (float)$iv['total_usd'],
          (int)$iv['total_khr']
        ]);

        $updInv->execute([
          $now,
          $pay_currency,
          $cash_in_usd,
          $cash_in_khr,
          $change_usd,
          $change_khr,
          $invId
        ]);

        if (($iv['order_type'] ?? 'table') !== 'takeaway' && !empty($iv['table_id'])) {
          $freeTable->execute([(int)$iv['table_id']]);
        }
      }

      $pdo->commit();
      header("Location: print_merged_receipt.php?payment_id={$payment_id}&auto=1");
      exit;
    }

  } catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    $msg = $e->getMessage();
  }
}

// Load open invoices
$open = $pdo->query("
  SELECT i.id, i.order_type, i.floor_id, i.table_id,
         i.total_usd, i.total_khr, i.created_at,
         f.name AS floor_name, t.table_no
    FROM invoices i
    LEFT JOIN floors f ON f.id=i.floor_id
    LEFT JOIN tables t ON t.id=i.table_id
   WHERE i.status='open'
   ORDER BY i.created_at DESC, i.id DESC
")->fetchAll();
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Merge Pay – FTC POS</title>
  <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
  <style>
    .badge-usd{background:#0d6efd1a;border:1px solid #0d6efd;padding:2px 6px;border-radius:6px}
    .badge-khr{background:#ffc1071a;border:1px solid #ffc107;padding:2px 6px;border-radius:6px}
  </style>
</head>
<body class="bg-light">
<nav class="navbar nav-gradient navbar-dark">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="index.php">FTC POS</a>
    <div class="text-white small">Merge multiple open invoices into one payment</div>
  </div>
</nav>

<div class="container py-3">
  <?php if ($ok): ?><div class="alert alert-success"><?= $ok ?></div><?php endif; ?>
  <?php if ($msg): ?><div class="alert alert-danger"><?= htmlspecialchars($msg) ?></div><?php endif; ?>

  <form method="post" class="card shadow-sm">
    <div class="card-header fw-semibold">Select Invoices</div>
    <div class="card-body">
      <?php if (!$open): ?>
        <div class="text-muted">No open invoices.</div>
      <?php else: ?>
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead class="table-light">
              <tr>
                <th><input type="checkbox" id="chkAll"></th>
                <th>#</th>
                <th>Type</th>
                <th>Floor/Table</th>
                <th>Totals</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($open as $r): ?>
                <tr>
                  <td><input type="checkbox" class="chk" name="invoice_ids[]" value="<?= (int)$r['id'] ?>"></td>
                  <td><?= (int)$r['id'] ?></td>
                  <td>
                    <?php if (($r['order_type'] ?? 'table') === 'takeaway'): ?>
                      <span class="badge text-bg-info">Take Away</span>
                    <?php else: ?>
                      <span class="badge text-bg-secondary">Table</span>
                    <?php endif; ?>
                  </td>
                  <td><?= htmlspecialchars(($r['floor_name'] ?? '-') . '/' . ($r['table_no'] ?? '-')) ?></td>
                  <td>
                    <span class="badge-usd">$<?= number_format((float)$r['total_usd'],2) ?></span>
                    <span class="badge-khr ms-1"><?= number_format((int)$r['total_khr']) ?>៛</span>
                  </td>
                  <td><?= htmlspecialchars($r['created_at']) ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php endif; ?>
    </div>

    <!-- Payment + Pre-Print -->
    <div class="card-header fw-semibold d-flex justify-content-between align-items-center">
      <span>Payment</span>
      <!-- PRE-PRINT BUTTON -->
      <button type="submit" name="action" value="preprint"
              class="btn btn-outline-dark btn-sm">
        🖨️ Pre-Print Selected
      </button>
    </div>

    <div class="card-body row g-2">
      <div class="col-12 col-md-2">
        <label class="form-label">Currency</label>
        <select class="form-select" name="pay_currency">
          <option value="USD">USD</option>
          <option value="KHR">KHR</option>
        </select>
      </div>
      <div class="col-6 col-md-2">
        <label class="form-label">Cash USD</label>
        <input class="form-control" name="cash_in_usd" type="number" step="0.01" value="0">
      </div>
      <div class="col-6 col-md-2">
        <label class="form-label">Cash KHR</label>
        <input class="form-control" name="cash_in_khr" type="number" step="1" value="0">
      </div>
      <div class="col-12 col-md-3 d-grid">
        <label class="form-label">&nbsp;</label>
        <!-- MERGE & PAY BUTTON (sets action=merge_pay) -->
        <button type="submit" name="action" value="merge_pay"
                class="btn btn-success btn-lg">
          Merge & Pay
        </button>
      </div>
      <div class="col-12 col-md-3">
        <label class="form-label">Rate Info</label>
        <input class="form-control" value="<?= (int)$rate_default ?> KHR/USD" disabled>
      </div>
    </div>
  </form>

  <div class="mt-3">
    <a class="btn btn-outline-secondary" href="index.php">Back</a>
  </div>
</div>

<script src="<?= BOOTSTRAP_JS ?>"></script>
<script>
  const all = document.getElementById('chkAll');
  const chks = document.querySelectorAll('.chk');
  if (all) {
    all.addEventListener('change', () => chks.forEach(c => c.checked = all.checked));
  }
</script>
</body>
</html>
