<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$pdo = db();
$current = get_business_status();

// If already open, just show info
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($current) {
        // already open
        redirect('index.php');
    }

    $usd = (float)($_POST['opening_cash_usd'] ?? 0);
    $khr = (int)($_POST['opening_cash_khr'] ?? 0);

    if ($usd < 0) $usd = 0;
    if ($khr < 0) $khr = 0;

    open_business_session($usd, $khr);
    redirect('index.php');
}

$s = get_settings();
$user = current_user();
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Open Business – <?= htmlspecialchars($s['company_name'] ?? 'FTC POS') ?></title>
  <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
</head>
<body class="bg-light">
<div class="container py-5" style="max-width:600px">
  <h3 class="mb-3">ផ្ទាំងបើកការលក់</h3>

  <?php if ($current): ?>
    <div class="alert alert-info">
      Business is already <strong>OPEN</strong> since
      <strong><?= htmlspecialchars($current['opened_at']) ?></strong><br>
      Opening reserve:
      $<?= number_format((float)$current['opening_cash_usd'], 2) ?> /
      <?= number_format((int)$current['opening_cash_khr']) ?> ៛
    </div>
    <a class="btn btn-primary" href="index.php">Back to Tables</a>

  <?php else: ?>
    <div class="alert alert-secondary">
      ឈ្នោះអ្នកបើកបញ្ជី: <strong><?= htmlspecialchars($user['username']) ?></strong><br>
      សូមបញ្ចូលសាច់ប្រាក់មុនចាប់ផ្តើមការលក់ (ចំនួនលុយទុកក្នុងកិក) នៅក្នុងថតលុយ។
    </div>

    <form method="post" class="card p-3 shadow-sm">
      <div class="mb-3">
        <label class="form-label">លុយរៀល ៛ (KHR)</label>
        <input type="number" step="1" name="opening_cash_khr"
               class="form-control" value="0">
      </div>

      <div class="mb-3">
        <label class="form-label">លុយដុល្លារ $ (USD)</label>
        <input type="number" step="0.01" name="opening_cash_usd"
               class="form-control" value="0">
      </div>

      <button class="btn btn-success w-100">ចុចបើការលក់ពេលនេះ</button>
      <a class="btn btn-link mt-2" href="index.php">ថយក្រោយវិញ</a>
    </form>
  <?php endif; ?>
</div>
<script src="<?= BOOTSTRAP_JS ?>"></script>
</body>
</html>
