<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_role('admin');
require_once __DIR__ . '/../helpers.php';

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$msg = '';
$ok  = '';
$s   = get_settings();
$old_rate = (int)($s['usd_to_khr'] ?? 4100);   // 👈 keep old rate before update

/**
 * Save logo file (for receipt header).
 * Returns string path to store in DB (usually full URL or existing input).
 */
function save_logo_for_settings(?array $file, string $url, array $current): string {
  // If new file uploaded
  if ($file && ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['png','jpg','jpeg','webp'])) {
      throw new Exception('Logo must be PNG/JPG/JPEG/WEBP');
    }
    if (!defined('UPLOAD_DIR')) {
      define('UPLOAD_DIR', __DIR__ . '/../uploads');
    }
    if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0775, true);
    $name = 'logo_'.time().'_'.bin2hex(random_bytes(3)).'.'.$ext;
    $dest = rtrim(UPLOAD_DIR,'/').'/'.$name;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
      throw new Exception('Failed to save uploaded logo');
    }
    // Store full web path so print_receipt.php can use it directly
    return '/ftc-pos/uploads/'.$name;
  }

  // If no new file, keep URL if provided, else keep existing in DB
  $url = trim($url);
  if ($url !== '') return $url;
  return $current['receipt_logo'] ?? '';
}

/**
 * Save QR code image for payment.
 * Returns filename to store in settings.qr_code_path (used with asset()).
 */
function save_qr_for_settings(?array $file, string $existing): string {
  if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    // no new upload → keep existing filename
    return $existing;
  }
  $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
  if (!in_array($ext, ['png','jpg','jpeg','webp'])) {
    throw new Exception('QR must be PNG/JPG/JPEG/WEBP');
  }
  if (!defined('UPLOAD_DIR')) {
    define('UPLOAD_DIR', __DIR__ . '/../uploads');
  }
  if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0775, true);
  $name = 'qr_'.time().'_'.bin2hex(random_bytes(3)).'.'.$ext;
  $dest = rtrim(UPLOAD_DIR,'/').'/'.$name;
  if (!move_uploaded_file($file['tmp_name'], $dest)) {
    throw new Exception('Failed to save uploaded QR image');
  }
  // For qr_code_path we store only filename, and use asset() when displaying
  return $name;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $company_name   = trim($_POST['company_name'] ?? '');
  $company_addr   = trim($_POST['company_address'] ?? '');
  $company_tel    = trim($_POST['company_tel'] ?? '');
  $usd_to_khr     = (int)($_POST['usd_to_khr'] ?? 4100);   // 👈 new rate from form

  $receipt_title  = trim($_POST['receipt_title'] ?? '');
  $show_rate      = isset($_POST['show_exchange_rate']) ? 1 : 0;
  $wifi_password  = trim($_POST['wifi_password'] ?? '');
  $footer_kh      = trim($_POST['receipt_footer_kh'] ?? 'Thank you! សូមអរគុណ');

  // Existing QR filename from hidden input
  $qr_existing    = trim($_POST['qr_code_existing'] ?? ($s['qr_code_path'] ?? ''));

  $logo_url_input = trim($_POST['receipt_logo'] ?? '');

  try {
    if ($company_name === '') throw new Exception('Company name is required.');
    if ($usd_to_khr <= 0) throw new Exception('Rate must be a positive integer.');

    // Save logo (file or URL)
    $logo_final = save_logo_for_settings($_FILES['logo_file'] ?? null, $logo_url_input, $s);

    // Save QR code (file)
    $qr_final   = save_qr_for_settings($_FILES['qr_code'] ?? null, $qr_existing);

    // If title empty -> default to company name
    if ($receipt_title === '') {
      $receipt_title = $company_name;
    }

    // --- Save settings row ---
    $stmt = $pdo->prepare("
      INSERT INTO settings
        (id, company_name, company_address, company_tel, usd_to_khr,
         receipt_title, show_exchange_rate, wifi_password, receipt_footer_kh, receipt_logo, qr_code_path)
      VALUES
        (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        company_name       = VALUES(company_name),
        company_address    = VALUES(company_address),
        company_tel        = VALUES(company_tel),
        usd_to_khr         = VALUES(usd_to_khr),
        receipt_title      = VALUES(receipt_title),
        show_exchange_rate = VALUES(show_exchange_rate),
        wifi_password      = VALUES(wifi_password),
        receipt_footer_kh  = VALUES(receipt_footer_kh),
        receipt_logo       = VALUES(receipt_logo),
        qr_code_path       = VALUES(qr_code_path)
    ");
    $stmt->execute([
      $company_name,
      $company_addr,
      $company_tel,
      $usd_to_khr,
      $receipt_title,
      $show_rate,
      $wifi_password,
      $footer_kh,
      $logo_final,
      $qr_final
    ]);

    // --- 🔥 If rate changed -> recalc all products.price_usd from price_khr ---
    if ($usd_to_khr !== $old_rate) {
        recalc_all_products_price_usd_from_khr($usd_to_khr);
        $ok = 'Settings saved. Product USD prices updated by new rate.';
    } else {
        $ok = 'Settings saved.';
    }

    // reload after save
    $s = get_settings();

  } catch (Throwable $e) { 
    $msg = $e->getMessage(); 
  }
}
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>FTC POS – Settings</title>
  <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
  <link rel="stylesheet" href="styles.css">
  <style>
    .form-hint{font-size:12px;color:#666}
  </style>
</head>
<body class="bg-light">
<nav class="navbar nav-gradient navbar-dark">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="index.php">FTC POS</a>
    <div class="text-white small">Receipt & Payment Settings</div>
    <div class="d-flex align-items-center gap-2">
      <a class="btn btn-light btn-sm" href="products.php">Products</a>
      <a class="btn btn-light btn-sm" href="reports.php">Reports</a>
      <a class="btn btn-light btn-sm" href="tables.php">Tables</a>
      <a class="btn btn-outline-danger btn-sm" href="logout.php">Sign out</a>
    </div>
  </div>
</nav>

<div class="container py-4">
  <?php if ($ok): ?><div class="alert alert-success"><?= htmlspecialchars($ok) ?></div><?php endif; ?>
  <?php if ($msg): ?><div class="alert alert-danger"><?= htmlspecialchars($msg) ?></div><?php endif; ?>

  <form method="post" class="row g-3" enctype="multipart/form-data">
    <!-- TITLE / COMPANY -->
    <div class="col-md-6">
      <label class="form-label">Title (receipt_title)</label>
      <input type="text" name="receipt_title" class="form-control"
             value="<?= htmlspecialchars($s['receipt_title'] ?? ($s['company_name'] ?? 'FTC POS')) ?>">
      <div class="form-hint">Shown as big title on receipt. If empty, use company name.</div>
    </div>
    <div class="col-md-6">
      <label class="form-label">Company Name (company_name)</label>
      <input type="text" name="company_name" class="form-control" required
             value="<?= htmlspecialchars($s['company_name'] ?? 'FTC POS') ?>">
    </div>

    <!-- ADDRESS / TEL -->
    <div class="col-12">
      <label class="form-label">Address (company_address)</label>
      <input type="text" name="company_address" class="form-control"
             value="<?= htmlspecialchars($s['company_address'] ?? '') ?>">
    </div>

    <div class="col-md-6">
      <label class="form-label">Tel (company_tel)</label>
      <input type="text" name="company_tel" class="form-control"
             value="<?= htmlspecialchars($s['company_tel'] ?? '') ?>">
    </div>

    <!-- RATE / WIFI -->
    <div class="col-md-6">
      <label class="form-label">USD → KHR (usd_to_khr)</label>
      <input type="number" name="usd_to_khr" class="form-control" min="1" step="1" required
             value="<?= htmlspecialchars((string)($s['usd_to_khr'] ?? 4100)) ?>">
      <div class="form-hint">Used for KHR conversions on invoice/receipt and product USD prices.</div>
    </div>

    <div class="col-md-6">
      <label class="form-label">Wi-Fi Password (wifi_password)</label>
      <input type="text" name="wifi_password" class="form-control"
             value="<?= htmlspecialchars($s['wifi_password'] ?? '') ?>">
      <div class="form-hint">Optional, show on receipt (if you design to display it).</div>
    </div>

    <div class="col-md-6 d-flex align-items-end">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="show_rate" name="show_exchange_rate"
               <?= !empty($s['show_exchange_rate']) ? 'checked' : '' ?>>
        <label class="form-check-label" for="show_rate">
          Show Exchange Rate on receipt (show_exchange_rate)
        </label>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="col-12">
      <label class="form-label">Footer (receipt_footer_kh)</label>
      <input type="text" name="receipt_footer_kh" class="form-control"
             value="<?= htmlspecialchars($s['receipt_footer_kh'] ?? 'Thank you! សូមអរគុណ') ?>">
      <div class="form-hint">Last line on receipt (Khmer/English).</div>
    </div>

    <!-- LOGO -->
    <div class="col-md-6">
      <label class="form-label">Logo Upload (receipt_logo)</label>
      <input type="file" name="logo_file" accept=".png,.jpg,.jpeg,.webp" class="form-control">
      <div class="form-hint">If you upload new logo, it will override URL below.</div>
    </div>

    <div class="col-md-6">
      <label class="form-label">Logo URL (receipt_logo)</label>
      <input type="text" name="receipt_logo" class="form-control"
             placeholder="/ftc-pos/uploads/logo.png or https://…"
             value="<?= htmlspecialchars($s['receipt_logo'] ?? '') ?>">
      <div class="form-hint">Used directly on receipt (no asset()).</div>
    </div>

    <?php if (!empty($s['receipt_logo'])): ?>
      <div class="col-12">
        <label class="form-label d-block">Current Logo Preview</label>
        <img src="<?= htmlspecialchars($s['receipt_logo']) ?>" style="max-width:220px; max-height:120px;border:1px solid #ddd;border-radius:8px;">
      </div>
    <?php endif; ?>

    <!-- QR PAYMENT CODE -->
    <div class="col-12">
      <label class="form-label fw-semibold">QR Payment Code (qr_code_path)</label><br>
      <?php if (!empty($s['qr_code_path'])): ?>
        <img src="<?= asset($s['qr_code_path']) ?>" alt="QR Code"
             style="width:160px;border:1px solid #ddd;border-radius:8px;margin-bottom:8px;"><br>
      <?php endif; ?>
      <input type="hidden" name="qr_code_existing" value="<?= htmlspecialchars($s['qr_code_path'] ?? '') ?>">
      <input class="form-control" type="file" name="qr_code" accept="image/*">
      <div class="form-hint">Upload KHQR / ABA / Bakong QR image. This will show on Sale page when choosing “Pay as QR”.</div>
    </div>

    <div class="col-12 d-grid d-md-flex gap-2 mt-3">
      <button class="btn btn-primary">Save Settings</button>
      <a class="btn btn-outline-secondary" href="index.php">Back</a>
    </div>
  </form>
</div>

<script src="<?= BOOTSTRAP_JS ?>"></script>
</body>
</html>
