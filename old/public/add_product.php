<?php
require_once __DIR__ . '/../auth.php';
require_role('admin');
require_once __DIR__ . '/../helpers.php';

$cats = get_categories(); // get active categories
$msg = '';
$rate = get_rate();       // current rate

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $name       = trim($_POST['name'] ?? '');
  $price_khr  = (int)($_POST['price_khr'] ?? 0);   // 👉 KHR is primary input
  $rate       = get_rate();
  $price_usd  = $price_khr > 0 && $rate > 0 ? round($price_khr / $rate, 2) : 0;

  $category_id = !empty($_POST['category_id']) ? (int)$_POST['category_id'] : null;

  if ($name && $price_khr > 0) {
    $img = save_image($_FILES['image'] ?? []);
    $st = db()->prepare("
      INSERT INTO products (name, price_usd, price_khr, category_id, image_path, is_active)
      VALUES (?,?,?,?,?,1)
    ");
    $st->execute([$name, $price_usd, $price_khr, $category_id, $img]);
    header("Location: products.php?added=1");
    exit;
  } else {
    $msg = "Please enter product name and KHR price.";
  }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Add Product – FTC POS</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<nav class="navbar navbar-dark" style="background:linear-gradient(90deg,#5b00e5,#007bff)">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="products.php">FTC POS</a>
  </div>
</nav>

<div class="container py-4">
  <div class="card shadow-sm">
    <div class="card-header fw-bold">ដាក់បន្ថែមទំនិញ</div>
    <div class="card-body">
      <?php if ($msg): ?><div class="alert alert-danger"><?= htmlspecialchars($msg) ?></div><?php endif; ?>
      <form method="post" enctype="multipart/form-data" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">ឈ្មោះទំនិញ</label>
          <input type="text" name="name" class="form-control" required>
        </div>

        <div class="col-md-3">
          <label class="form-label">លុយរៀល ៛ (KHR)</label>
          <input type="number" name="price_khr" step="1" min="0" class="form-control" required>
          <small class="text-muted">
            អត្រាប្តូរលុយ: 1 USD = <?= number_format($rate) ?> ៛
          </small>
        </div>

        <div class="col-md-3">
          <label class="form-label">ក្រុមទំនិញ</label>
          <select name="category_id" class="form-select">
            <option value="">— គ្មាន —</option>
            <?php foreach ($cats as $c): ?>
              <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['name']) ?></option>
            <?php endforeach; ?>
          </select>
        </div>

        <div class="col-md-6">
          <label class="form-label">រូបទំនិញ (មិនមានក៏បាន)</label>
          <input type="file" name="image" class="form-control" accept=".jpg,.jpeg,.png,.webp">
        </div>
        <div class="col-md-12 d-grid">
          <button class="btn btn-primary btn-lg">រក្សាទុក</button>
        </div>
      </form>
    </div>
  </div>
</div>
</body>
</html>
