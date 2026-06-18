<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';
include __DIR__ . '/style_global.php';

require_business_open();

$s        = get_settings();
$rate     = (int)$s['usd_to_khr'];
$user     = current_user();
$is_admin = isset($user['role']) && in_array($user['role'], ['admin', 'sale', 'sales'], true);

if (!empty($s['qr_code_path'])) {
    $qr_src = asset('uploads/' . ltrim($s['qr_code_path'], '/'));
} else {
    $qr_src = asset('uploads/qr_default.png');
}

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$invoice_id_param = (int)($_GET['invoice'] ?? 0);
$takeaway         = isset($_GET['takeaway']) && (int)$_GET['takeaway'] === 1;

// We will allow: 
// - sale.php?invoice=ID
// - sale.php?floor=X&table=Y (no invoice yet)
// - sale.php?takeaway=1 (no invoice yet)
$invoice_id = 0;
$floor_id   = null;
$table_id   = null;

try {

    if ($invoice_id_param > 0) {
        // Load existing invoice by ID
        $st = $pdo->prepare("SELECT * FROM invoices WHERE id = ?");
        $st->execute([$invoice_id_param]);
        $invRow = $st->fetch();
        if (!$invRow) {
            throw new Exception("Invoice not found");
        }

        $invoice_id = (int)$invRow['id'];
        $floor_id   = $invRow['floor_id'] !== null ? (int)$invRow['floor_id'] : null;
        $table_id   = $invRow['table_id'] !== null ? (int)$invRow['table_id'] : null;
        $takeaway   = ($invRow['order_type'] === 'takeaway');
        $rate       = (int)$invRow['usd_to_khr'];

    } else {
        if ($takeaway) {
            // Takeaway screen, but we DO NOT create invoice until first order
            // However, if there is already an open takeaway invoice, reuse it
            $st = $pdo->query("
                SELECT id, usd_to_khr
                  FROM invoices
                 WHERE status='open' AND order_type='takeaway'
                 ORDER BY id DESC
                 LIMIT 1
            ");
            $row = $st->fetch();
            if ($row) {
                $invoice_id = (int)$row['id'];
                $rate       = (int)$row['usd_to_khr'];
            }
        } else {
            // Table order: get floor/table from URL
            $floor_id = (int)($_GET['floor'] ?? 0);
            $table_id = (int)($_GET['table'] ?? 0);
            if (!$floor_id || !$table_id) {
                redirect('index.php');
            }

            // Try to reuse existing open invoice for that table
            $st = $pdo->prepare("
                SELECT id, usd_to_khr
                  FROM invoices
                 WHERE status='open'
                   AND order_type='table'
                   AND floor_id = ?
                   AND table_id = ?
                 ORDER BY id DESC
                 LIMIT 1
            ");
            $st->execute([$floor_id, $table_id]);
            $row = $st->fetch();
            if ($row) {
                $invoice_id = (int)$row['id'];
                $rate       = (int)$row['usd_to_khr'];
            }
            // If not found -> invoice_id stays 0 (no order yet)
        }
    }

    // ===================== LOAD FLOOR NAME + TABLE NAME =====================
    $floor_name = '';
    $table_no   = '';

    if ($floor_id) {
        $ff = $pdo->prepare("SELECT name FROM floors WHERE id=? LIMIT 1");
        $ff->execute([$floor_id]);
        $floor_name = $ff->fetchColumn() ?: $floor_id;
    }

    if ($table_id) {
        $tt = $pdo->prepare("SELECT table_no FROM tables WHERE id=? LIMIT 1");
        $tt->execute([$table_id]);
        $table_no = $tt->fetchColumn() ?: $table_id;
    }

    // ================= PRODUCTS ==================
    $products = $pdo->query("
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = 1
      ORDER BY p.name ASC
    ")->fetchAll();

    // ================= ITEMS & TOTALS ==================
    $rows = [];
    $subtotal_after_item_usd = 0.0;
    $subtotal_after_item_khr = 0;
    $total_usd               = 0.0;
    $total_khr               = 0;
    $invoice_discount_pct    = 0;
    $whole_discount_usd      = 0.0;
    $whole_discount_khr      = 0;
    $item_discount_usd       = 0.0;
    $item_discount_khr       = 0;

    if ($invoice_id > 0) {
        // recalc totals for existing invoice
        calc_totals($invoice_id);

        $items = $pdo->prepare("SELECT * FROM invoice_items WHERE invoice_id=? ORDER BY id DESC");
        $items->execute([$invoice_id]);
        $rows = $items->fetchAll();

        // ORIGINAL PRICE BEFORE ANY DISCOUNT
        $original_usd = 0.0;
        $original_khr = 0;
        foreach ($rows as $rr) {
            $original_usd += (float)$rr['price_usd'] * (int)$rr['qty'];
            $original_khr += (int)$rr['price_khr'] * (int)$rr['qty'];
        }

        // TOTALS + WHOLE DISCOUNT AMOUNT FROM INVOICE
        $totals = $pdo->prepare("
          SELECT subtotal_usd, subtotal_khr,
                 total_usd, total_khr,
                 discount_pct,
                 COALESCE(discount_amount_usd,0) AS discount_amount_usd,
                 COALESCE(discount_amount_khr,0) AS discount_amount_khr
          FROM invoices 
          WHERE id=?
        ");
        $totals->execute([$invoice_id]);
        $t = $totals->fetch();

        $subtotal_after_item_usd = (float)($t['subtotal_usd'] ?? 0);
        $subtotal_after_item_khr = (int)  ($t['subtotal_khr'] ?? 0);

        $total_usd            = (float)($t['total_usd']    ?? 0);
        $total_khr            = (int)  ($t['total_khr']    ?? 0);
        $invoice_discount_pct = (float)($t['discount_pct'] ?? 0);

        $item_discount_usd = max(0, $original_usd - $subtotal_after_item_usd);
        $item_discount_khr = max(0, $original_khr - $subtotal_after_item_khr);

        $whole_discount_usd = (float)($t['discount_amount_usd'] ?? 0);
        $whole_discount_khr = (int)  ($t['discount_amount_khr'] ?? 0);
    } else {
        // no invoice yet -> empty cart
        $rows = [];
    }

} catch (Throwable $e) {
    echo "<pre style='padding:1em;background:#fff3cd;border:1px solid #ffeeba;font-family:monospace'>";
    echo "<b>Sale page error:</b> " . htmlspecialchars($e->getMessage());
    echo "</pre>";
    exit;
}
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>FTC POS – Sale</title>
  <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">

  <style>
    body { padding-top: 70px; }
    .nav-gradient { position: fixed; top: 0; left: 0; right: 0; z-index: 1030; }
    .cart-pane { display: flex; flex-direction: column; height: calc(100vh - 70px); background: #ffffff; border-radius: 8px; overflow: hidden; }
    .cart-list { flex: 1; overflow-y: auto; padding: 0 12px; }
    .cart-footer { padding: 12px; background: #f8f9fa; border-top: 1px solid #ddd; }
    .col-lg-3 .sticky-top-xs { position: sticky; top: 80px; }
    .badge-usd { background:#0d6efd; color:#fff; }
    .badge-khr { background:#ffc107; color:#000; }
    .product-thumb { width:100%; height:120px; object-fit:cover; border-top-left-radius:8px; border-top-right-radius:8px; }
    .product-card { cursor:pointer; transition:transform 0.08s ease, box-shadow 0.08s ease; }
    .product-card:hover { transform:translateY(-1px); box-shadow:0 0.25rem 0.75rem rgba(0,0,0,.08); }
    .cat-chip { display:inline-block; margin:2px 0; padding:4px 10px; border-radius:999px; font-size:13px; color:#333; border:1px solid #ddd; text-decoration:none; }
    .cat-chip.active { background:#0d6efd; color:#fff; border-color:#0d6efd; }

    .qty-wrap {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .qty-btn {
      border: 1px solid #ced4da;
      background: #f8f9fa;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1;
    }
    .qty-num {
      min-width: 28px;
      text-align: center;
      font-weight: 600;
    }

    /* admin inline price edit */
    .price-edit-input {
      border: none;
      padding: 0;
      margin: 0;
      background: transparent;
      width: 70px;
      font-size: 0.8rem;
    }
    .price-edit-input:focus {
      outline: none;
      box-shadow: none;
      background: #fff7d6;
    }
  </style>

  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-light">

<nav class="navbar nav-gradient navbar-dark">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="index.php">FTC POS</a>

    <div class="text-white small d-flex flex-wrap align-items-center gap-2">
      <?php if ($takeaway): ?>
        <span class="badge bg-info text-dark">🥡 Take Away</span>
      <?php else: ?>
        <span>
          Floor <span class="badge bg-light text-dark"><?= htmlspecialchars($floor_name) ?></span> /
          Table <span class="badge bg-light text-dark"><?= htmlspecialchars($table_no) ?></span>
        </span>
      <?php endif; ?>

      <span class="badge bg-success text-dark">
        <?= $invoice_id ? "Order #{$invoice_id}" : "Order New" ?>
      </span>
      <span class="badge bg-warning text-dark">Rate 1 USD = <?= $rate ?> KHR</span>
    </div>

    <form class="d-flex" onsubmit="event.preventDefault()">
      <input id="q" class="form-control" type="search" placeholder="Search menu…" aria-label="Search">
    </form>
  </div>
</nav>

<div class="container-fluid py-3">
  <div class="row g-3">

    <!-- CATEGORY LIST -->
    <div class="col-lg-2">
      <div class="sticky-top-xs">
        <div class="card">
          <div class="card-header fw-semibold">Menus</div>

          <div class="card-body">
            <a href="#" class="cat-chip active" data-cat="*">All</a>

            <?php
            // CATEGORY LIST
            $cats_stmt = $pdo->query("
              SELECT COALESCE(NULLIF(TRIM(c.name),''),'General') AS c
              FROM products p
              LEFT JOIN categories c ON c.id = p.category_id
              WHERE p.is_active=1
              GROUP BY 1
              ORDER BY 1
            ");
            $cats = $cats_stmt->fetchAll(PDO::FETCH_COLUMN);
            if (!$cats) $cats = ['General'];

            foreach ($cats as $c): ?>
              <a href="#" class="cat-chip" data-cat="<?= htmlspecialchars($c) ?>">
                <?= htmlspecialchars($c) ?>
              </a>
            <?php endforeach; ?>
          </div>

        </div>
      </div>
    </div>

    <!-- PRODUCT GRID -->
    <div class="col-lg-7">
      <div class="row g-3" id="grid">

        <?php foreach ($products as $p):
            $cat = trim($p['category_name'] ?? 'General');
        ?>
          <div class="col-6 col-md-3" data-cat="<?= htmlspecialchars($cat) ?>">
            <!-- Wrap whole card in a form, so clicking the card = add to cart -->
            <form method="post" action="api_cart.php" class="product-form h-100">
              <input type="hidden" name="action" value="add">
              <input type="hidden" name="invoice_id" value="<?= (int)$invoice_id ?>">
              <input type="hidden" name="product_id" value="<?= (int)$p['id'] ?>">
              <input type="hidden" name="qty" value="1">

              <?php if ($takeaway): ?>
                <input type="hidden" name="order_type" value="takeaway">
              <?php else: ?>
                <input type="hidden" name="order_type" value="table">
                <input type="hidden" name="floor_id"  value="<?= (int)$floor_id ?>">
                <input type="hidden" name="table_id"  value="<?= (int)$table_id ?>">
              <?php endif; ?>

              <div class="card product-card h-100">

                <?php if (!empty($p['image_path'])): ?>
                  <img class="product-thumb" src="<?= asset($p['image_path']) ?>" alt="">
                <?php endif; ?>

                <div class="card-body">
                  <div class="fw-bold"><?= htmlspecialchars($p['name']) ?></div>
                  <div class="small text-muted"><?= htmlspecialchars($cat) ?></div>
                </div>

                <div class="card-footer bg-white d-flex justify-content-between align-items-center">
                  <div>
                    <span class="badge badge-usd">
                      $<?= number_format((float)$p['price_usd'],2) ?>
                    </span>
                    <span class="badge badge-khr ms-1">
                      <?= number_format((int)$p['price_khr']) ?> ៛
                    </span>
                  </div>
                  <small class="text-muted">ចុចដើម្បីបញ្ចូល</small>
                </div>

              </div>
            </form>
          </div>
        <?php endforeach; ?>

      </div>
    </div>

    <!-- CART PANEL -->
    <div class="col-lg-3">
      <div class="cart-pane sticky-top-xs">

        <!-- CART HEADER -->
        <div class="px-3 pt-1 d-flex justify-content-between">
          <div class="fw-bold">Order</div>
          <span class="badge text-bg-secondary">
            <?= $invoice_id ? "#{$invoice_id}" : "New" ?>
          </span>
        </div>

        <!-- CART SCROLL -->
        <div class="cart-list">
        <?php
          $count = 0;
          foreach ($rows as $r):
            $count++;
            $item_discount = (float)($r['discount_pct'] ?? 0);
        ?>
          <div class="border-bottom py-2">
            <div class="d-flex align-items-center">

              <!-- LEFT: item name + price + discount -->
              <div class="flex-grow-1 me-2">
                <div class="fw-semibold"><?= htmlspecialchars($r['name']) ?></div>

                <div class="small text-muted d-flex flex-wrap align-items-center gap-1">

                  <?php if ($is_admin): ?>
                    <!-- price edit (admin only) -->
                    <form method="post" action="api_cart.php"
                          class="d-inline-flex align-items-center gap-1 price-edit-form">
                      <input type="hidden" name="action" value="setprice">
                      <input type="hidden" name="item_id" value="<?= $r['id'] ?>">
                      <input type="hidden" name="invoice_id" value="<?= $invoice_id ?>">

                      <input type="number"
                             name="price_khr"
                             step="1"
                             min="0"
                             class="price-edit-input text-success fw-semibold"
                             value="<?= (int)$r['price_khr'] ?>"
                             title="Edit price KHR">
                      <span>៛ / $</span>
                      <input type="number"
                             name="price_usd"
                             step="0.01"
                             min="0"
                             class="price-edit-input"
                             value="<?= htmlspecialchars(number_format($r['price_usd'],2,'.','')) ?>"
                             title="Edit price USD">
                    </form>
                  <?php else: ?>
                    <!-- normal user: just show price -->
                    <span>
                      <?= number_format($r['price_khr']) ?> ៛ /
                      $<?= number_format($r['price_usd'],2) ?>
                    </span>
                  <?php endif; ?>

                  <!-- Discount % near price – no button, auto-submit -->
                  <form method="post" action="api_cart.php"
                        class="d-inline-flex align-items-center gap-1 item-discount-form ms-2">
                    <input type="hidden" name="action" value="setdiscount">
                    <input type="hidden" name="item_id" value="<?= $r['id'] ?>">
                    <input type="hidden" name="invoice_id" value="<?= $invoice_id ?>">
                    <span class="text-muted">បញ្ចុះតម្លៃ%</span>
                    <input type="number"
                           name="discount_pct"
                           min="0" max="100" step="0.5"
                           value="<?= htmlspecialchars($item_discount) ?>"
                           class="form-control form-control-sm discount-input"
                           style="width:65px;">
                  </form>

                </div>
              </div>

              <!-- CENTER: [- qty +] -->
              <div class="qty-wrap">

                <!-- minus -->
                <form method="post" action="api_cart.php" class="m-0">
                  <input type="hidden" name="action" value="setqty">
                  <input type="hidden" name="item_id" value="<?= $r['id'] ?>">
                  <input type="hidden" name="invoice_id" value="<?= $invoice_id ?>">
                  <input type="hidden" name="qty" value="<?= max(1, (int)$r['qty'] - 1) ?>">
                  <button type="submit" class="qty-btn">−</button>
                </form>

                <span class="qty-num"><?= (int)$r['qty'] ?></span>

                <!-- plus -->
                <form method="post" action="api_cart.php" class="m-0">
                  <input type="hidden" name="action" value="setqty">
                  <input type="hidden" name="item_id" value="<?= $r['id'] ?>">
                  <input type="hidden" name="invoice_id" value="<?= $invoice_id ?>">
                  <input type="hidden" name="qty" value="<?= (int)$r['qty'] + 1 ?>">
                  <button type="submit" class="qty-btn">+</button>
                </form>
              </div>

              <!-- RIGHT: line total + delete -->
              <div class="text-end ms-3">
                <div class="fw-bold"><?= number_format($r['line_total_khr']) ?> ៛</div>
                <div class="small text-muted">$<?= number_format($r['line_total_usd'],2) ?></div>
              </div>

              <form method="post" action="api_cart.php" class="ms-2">
                <input type="hidden" name="action" value="remove">
                <input type="hidden" name="item_id" value="<?= $r['id'] ?>">
                <input type="hidden" name="invoice_id" value="<?= $invoice_id ?>">
                <button class="btn btn-sm btn-outline-danger">✕</button>
              </form>

            </div>
          </div>
        <?php endforeach; ?>

        <!-- EMPTY ROWS FOR CLEAN UI -->
        <?php for ($i = $count; $i < 4; $i++): ?>
          <div class="d-flex justify-content-between border-bottom py-2" style="opacity:0.3;">
            <div class="me-2">
              <div class="fw-semibold">&nbsp;</div>
              <div class="small text-muted">&nbsp;</div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span>&nbsp;</span>
            </div>
          </div>
        <?php endfor; ?>

        <?php if ($count == 0): ?>
          <div class="text-center text-muted py-3">
            មិនទាន់បញ្ជាទិញ. សូមជ្រើសរើសមុខទំនិញ→
          </div>
        <?php endif; ?>

        </div> <!-- end cart-list -->

        <!-- CART FOOTER -->
        <div class="cart-footer">

          <?php if ($invoice_id > 0 && $count > 0): ?>
          <!-- Subtotal AFTER item discount -->
          <div class="d-flex justify-content-between mt-1">
            <div class="text-muted small">សរុបបន្ទាប់ពីបញ្ចុះតម្លៃទំនិញ</div>
            <div class="fw-bold">
              <span class="badge badge-usd">$<?= number_format($subtotal_after_item_usd,2) ?></span>
              <span class="badge badge-khr ms-1"><?= number_format($subtotal_after_item_khr) ?> ៛</span>
            </div>
          </div>

          <!-- Invoice discount % -->
          <div class="d-flex justify-content-between align-items-center mt-1">
            <div class="text-muted small">បញ្ចុះតម្លៃ % (គ្រប់មុខ)</div>
            <form method="post" action="api_cart.php" class="d-flex align-items-center gap-1">
              <input type="hidden" name="action" value="set_invoice_discount">
              <input type="hidden" name="invoice_id" value="<?= $invoice_id ?>">

              <input type="number" name="discount_pct" min="0" max="100" step="0.5"
                     value="<?= htmlspecialchars($invoice_discount_pct) ?>"
                     class="form-control form-control-sm" style="width:70px;">
              <button class="btn btn-sm btn-outline-warning">Apply</button>
            </form>
          </div>

          <!-- Whole discount amount (two-way USD <-> KHR) -->
          <div class="d-flex justify-content-between align-items-center mt-1">
            <div class="text-muted small">ចំនួនលុយបញ្ចុះតម្លៃ (គ្រប់មុខ)</div>

            <form method="post" action="api_cart.php"
                  class="d-flex align-items-center gap-1 invoice-discount-value-form">
              <input type="hidden" name="action" value="set_invoice_discount_value">
              <input type="hidden" name="invoice_id" value="<?= $invoice_id ?>">

              <input type="number"
                     name="discount_usd"
                     step="0.01"
                     min="0"
                     value="<?= number_format($whole_discount_usd, 2, '.', '') ?>"
                     class="form-control form-control-sm"
                     style="width:80px;">
              <span class="small">USD</span>

              <input type="number"
                     name="discount_khr"
                     step="1"
                     min="0"
                     value="<?= $whole_discount_khr ?>"
                     class="form-control form-control-sm"
                     style="width:90px;">
              <span class="small">៛</span>

              <button class="btn btn-sm btn-outline-warning">Set</button>
            </form>
          </div>

          <!-- FINAL TOTAL -->
          <div class="d-flex justify-content-between mt-1">
            <div class="fw-semibold">តម្លៃត្រូវទូទាត់</div>
            <div class="fw-bold">
              <span class="badge badge-usd">$<?= number_format($total_usd,2) ?></span>
              <span class="badge badge-khr ms-1"><?= number_format($total_khr) ?> ៛</span>
            </div>
          </div>

          <!-- Print Buttons: Kitchen + Pre-Order -->
          <div class="d-grid gap-2 mt-2">
            <a class="btn btn-outline-warning" target="_blank"
               href="print_receipt.php?invoice_id=<?= $invoice_id ?>&type=kitchen">
              🍳 Kitchen Print
            </a>
            <a class="btn btn-outline-dark" target="_blank"
               href="print_receipt.php?invoice_id=<?= $invoice_id ?>">
              🖨️ Print (Pre-Order)
            </a>
          </div>

          <?php if (!$takeaway && $floor_id && $table_id): ?>
            <a class="btn btn-outline-primary w-100 mt-2"
               href="change_table.php?invoice=<?= $invoice_id ?>">
              ប្តូរតុ (Change Table)
            </a>
          <?php endif; ?>

          <!-- PAYMENT FORM -->
          <form id="checkout_form" class="row g-2 mt-2" method="post" action="checkout.php">
            <input type="hidden" name="invoice_id" value="<?= $invoice_id ?>">

            <div class="col-12">
              <label class="form-label fw-semibold small mb-1">ជម្រើសការគិតលុយ</label>
              <select class="form-select" id="pay_method" name="pay_method"
                      required onchange="togglePayMethod()">
                <option value="cash" selected>💵 ចាយលុយ</option>
                <option value="qr">📱 តាម​ QR</option>
              </select>
            </div>

            <!-- CASH FIELDS -->
            <div id="cash_fields">
              <div class="col-12 mt-2">
                <label class="form-label fw-semibold small mb-1">ប្រភេទលុយ</label>
              </div>

              <div class="row">
                <div class="col-6">
                  <input class="form-control" name="cash_in_khr"
                         type="number" step="1" placeholder="លុយរៀល KHR">
                </div>
                <div class="col-6">
                  <input class="form-control" name="cash_in_usd"
                         type="number" step="0.01" placeholder="លុយដុល្លារ USD">
                </div>
              </div>
            </div>

            <!-- QR FIELDS -->
            <div id="qr_fields" class="mt-3" style="display:none;">
              <div class="col-12">
                <label class="form-label fw-semibold small mb-1">QR Currency</label>

                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input class="form-check-input" type="radio"
                           name="qr_currency" value="USD" checked>
                    <label class="form-check-label">QR USD</label>
                  </div>

                  <div class="form-check">
                    <input class="form-check-input" type="radio"
                           name="qr_currency" value="KHR">
                    <label class="form-check-label">QR KHR</label>
                  </div>
                </div>
              </div>

              <div class="col-12 mt-2">
                <label class="form-label small fw-semibold">ចំនួនលុយ (optional)</label>
                <input class="form-control" name="qr_amount"
                       type="number" step="0.01" min="0">
              </div>

              <div class="col-12 mt-2">
                <label class="form-label small fw-semibold">លេខយោង / Transaction ID</label>
                <input class="form-control form-control-sm" name="qr_ref">
              </div>
            </div>

            <div class="col-12 d-grid mt-2">
              <button class="btn btn-success btn-lg">✅ គិតលុយ</button>
            </div>
          </form>

          <?php endif; ?> <!-- end: if invoice_id>0 && count>0 -->

          <!-- ❌ CLEAR / CANCEL ORDER BUTTON (even if cart empty) -->
          <?php if ($invoice_id > 0): ?>
            <a class="btn btn-outline-danger w-100 mt-2"
               href="cancel_invoice.php?invoice=<?= $invoice_id ?>"
               onclick="return confirm('តើអ្នកចង់លុបបញ្ជាទិញនេះមែនទេ? (Cancel this order completely?)');">
              ❌ លុបបញ្ជាទិញ / Clear Order
            </a>
          <?php endif; ?>

          <!-- Back button -->
          <a class="btn btn-outline-secondary w-100 mt-2"
             href="release_table.php?invoice=<?= $invoice_id ?>">
            ត្រឡប់ទៅផ្ទាំដើម
          </a>

        </div> <!-- end cart-footer -->

      </div> <!-- end cart-pane -->
    </div> <!-- end col-lg-3 -->

  </div>
</div>

<script src="<?= BOOTSTRAP_JS ?>"></script>

<script>
// Exchange rate for JS side
const PRICE_RATE = <?= (int)$rate ?>;

// CLICK PRODUCT CARD = SUBMIT FORM (ADD TO CART)
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('click', () => {
    const form = card.closest('form.product-form');
    if (form) form.submit();
  });
});

// CATEGORY FILTER
const chips = document.querySelectorAll('.cat-chip');
const cards = document.querySelectorAll('#grid > div[data-cat]');

chips.forEach(ch => ch.addEventListener('click', e => {
  e.preventDefault();
  chips.forEach(x => x.classList.remove('active'));
  ch.classList.add('active');

  const cat = ch.dataset.cat;
  cards.forEach(el => {
    el.style.display = (cat === '*' || el.dataset.cat === cat) ? '' : 'none';
  });
}));

// SEARCH FILTER
const q = document.getElementById('q');
q.addEventListener('input', () => {
  const term = q.value.toLowerCase();
  cards.forEach(el => {
    const txt = el.innerText.toLowerCase();
    el.style.display = txt.includes(term) ? '' : 'none';
  });
});

// PAYMENT METHOD TOGGLE
function togglePayMethod() {
  const method     = document.getElementById('pay_method').value;
  const cashFields = document.getElementById('cash_fields');
  const qrFields   = document.getElementById('qr_fields');

  if (method === 'cash') {
    cashFields.style.display = '';
    qrFields.style.display   = 'none';
  } else {
    cashFields.style.display = 'none';
    qrFields.style.display   = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const paySelect = document.getElementById('pay_method');
  if (paySelect) togglePayMethod();

  const form      = document.getElementById('checkout_form');
  const cashUsd   = document.querySelector('input[name="cash_in_usd"]');
  const cashKhr   = document.querySelector('input[name="cash_in_khr"]');

  if (form && cashUsd && cashKhr && paySelect) {
    form.addEventListener('submit', function (e) {
      const method = paySelect.value;

      if (method === 'cash') {
        const usd = parseFloat(cashUsd.value || '0');
        const khr = parseFloat(cashKhr.value || '0');

        if (!(usd > 0 || khr > 0)) {
          e.preventDefault();
          alert('Please input Cash USD or Cash KHR before receiving payment.');
          cashUsd.focus();
          return false;
        }
      }
    });
  }

  // -------------------------------
  // Khmer digits -> English 0-9
  // -------------------------------
  const khDigitMap = {
    '០': '0',
    '១': '1',
    '២': '2',
    '៣': '3',
    '៤': '4',
    '៥': '5',
    '៦': '6',
    '៧': '7',
    '៨': '8',
    '៩': '9'
  };

  function normalizeKhmerDigits(str) {
    return (str || '').replace(/[០-៩]/g, c => khDigitMap[c] || c);
  }

  function attachKhmerNumericHandler(selector) {
    document.querySelectorAll(selector).forEach(inp => {
      // Handle paste or programmatic changes
      inp.addEventListener('input', function () {
        const oldVal = this.value || '';
        const newVal = normalizeKhmerDigits(oldVal);
        if (newVal !== oldVal) {
          this.value = newVal;
        }
      });

      // Handle direct key presses (Khmer layout)
      inp.addEventListener('keydown', function (e) {
        const key = e.key;
        if (khDigitMap.hasOwnProperty(key)) {
          // Stop browser from trying to insert Khmer digit (which number input rejects)
          e.preventDefault();

          const ascii = khDigitMap[key];
          const start = this.selectionStart ?? this.value.length;
          const end   = this.selectionEnd   ?? this.value.length;
          const before = this.value.slice(0, start);
          const after  = this.value.slice(end);

          this.value = before + ascii + after;

          // Move caret after inserted digit
          try {
            this.setSelectionRange(start + 1, start + 1);
          } catch (err) {
            // some browsers might not support setSelectionRange on type=number
          }

          // Fire input event so other listeners (if any) react
          const evt = new Event('input', { bubbles: true });
          this.dispatchEvent(evt);
        }
      });
    });
  }

  // Apply to ALL number inputs on the page
  attachKhmerNumericHandler('input[type="number"]');

  // Admin inline price edit: link USD <-> KHR with rate, then submit.
  document.querySelectorAll('.price-edit-form').forEach(form => {
    const usdInput = form.querySelector('input[name="price_usd"]');
    const khrInput = form.querySelector('input[name="price_khr"]');

    function syncFromUsd() {
      if (!usdInput || !khrInput || !PRICE_RATE) return;
      const usdVal = parseFloat(usdInput.value || '0');
      if (isNaN(usdVal)) return;
      const khrVal = Math.round(usdVal * PRICE_RATE);
      khrInput.value = khrVal;
    }

    function syncFromKhr() {
      if (!usdInput || !khrInput || !PRICE_RATE) return;
      const khrVal = parseInt(khrInput.value || '0', 10);
      if (isNaN(khrVal)) return;
      const usdVal = khrVal / PRICE_RATE;
      usdInput.value = usdVal.toFixed(2);
    }

    function handleSubmitFrom(input) {
      if (!input) return;
      const v = input.value.trim();
      if (v === '') return;

      if (input.name === 'price_usd') {
        syncFromUsd();
      } else if (input.name === 'price_khr') {
        syncFromKhr();
      }

      form.submit();
    }

    [usdInput, khrInput].forEach(inp => {
      if (!inp) return;

      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmitFrom(this);
        }
      });

      inp.addEventListener('blur', function () {
        handleSubmitFrom(this);
      });

      inp.addEventListener('change', function () {
        handleSubmitFrom(this);
      });
    });
  });

  // Per-item discount inline: submit automatically (change/blur/Enter)
  document.querySelectorAll('.item-discount-form .discount-input').forEach(inp => {
    const original = inp.value;

    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.form.submit();
      }
    });

    inp.addEventListener('blur', function () {
      if (this.value !== original) {
        this.form.submit();
      }
    });

    inp.addEventListener('change', function () {
        this.form.submit();
    });
  });

  // Invoice whole discount (USD <-> KHR two-way, auto-submit)
  const invForm = document.querySelector('.invoice-discount-value-form');
  if (invForm && PRICE_RATE) {
    const usdInput = invForm.querySelector('input[name="discount_usd"]');
    const khrInput = invForm.querySelector('input[name="discount_khr"]');

    function syncFromUsdInv() {
      if (!usdInput || !khrInput) return;
      const usdVal = parseFloat(usdInput.value || '0');
      if (isNaN(usdVal)) return;
      const khrVal = Math.round(usdVal * PRICE_RATE);
      khrInput.value = khrVal;
    }

    function syncFromKhrInv() {
      if (!usdInput || !khrInput) return;
      const khrVal = parseInt(khrInput.value || '0', 10);
      if (isNaN(khrVal)) return;
      const usdVal = khrVal / PRICE_RATE;
      usdInput.value = usdVal.toFixed(2);
    }

    function handleSubmitFromInv(input) {
      if (!input) return;
      const v = input.value.trim();

      if (v === '') {
        if (usdInput) usdInput.value = '';
        if (khrInput) khrInput.value = '';
      } else {
        if (input.name === 'discount_usd') {
          syncFromUsdInv();
        } else if (input.name === 'discount_khr') {
          syncFromKhrInv();
        }
      }
      invForm.submit();
    }

    [usdInput, khrInput].forEach(inp => {
      if (!inp) return;

      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmitFromInv(this);
        }
      });

      inp.addEventListener('blur', function () {
        handleSubmitFromInv(this);
      });

      inp.addEventListener('change', function () {
        handleSubmitFromInv(this);
      });
    });
  }
});
</script>

</body>
</html>
