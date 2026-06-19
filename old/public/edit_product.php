<?php
require_once __DIR__ . '/../auth.php';
require_role('admin');
require_once __DIR__ . '/../helpers.php';

$pdo = db();
$id  = (int)($_GET['id'] ?? 0);
if ($id <= 0) { http_response_code(400); echo "Invalid product id."; exit; }

// ---------- helpers to detect optional schema ----------
function column_exists(PDO $pdo, string $table, string $column): bool {
  try {
    $st = $pdo->prepare("SHOW COLUMNS FROM {$table} LIKE ?");
    $st->execute([$column]);
    return (bool)$st->fetch();
  } catch (Throwable $e) { return false; }
}
$has_category_id = column_exists($pdo, 'products', 'category_id');

// Load product (with safe fallback)
try {
  if ($has_category_id) {
    $st = $pdo->prepare("
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id=?
      LIMIT 1
    ");
    $st->execute([$id]);
  } else {
    $st = $pdo->prepare("SELECT * FROM products WHERE id=? LIMIT 1");
    $st->execute([$id]);
  }
  $product = $st->fetch();
  if (!$product) { http_response_code(404); echo "Product not found."; exit; }
} catch (Throwable $e) {
  http_response_code(500);
  echo "Load error: " . htmlspecialchars($e->getMessage());
  exit;
}

// Categories list (if available)
$cats = [];
if ($has_category_id) {
  try { $cats = get_categories(); } catch (Throwable $e) { $cats = []; }
}

$msg = '';
$rate = get_rate();

// For display: prefer stored KHR; if empty but USD present, convert once for UI
$price_khr_initial = (int)($product['price_khr'] ?? 0);
if ($price_khr_initial <= 0 && isset($product['price_usd']) && $product['price_usd'] > 0 && $rate > 0) {
  $price_khr_initial = usd_to_khr_int((float)$product['price_usd'], $rate);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  try {
    $name       = trim($_POST['name'] ?? '');
    $price_khr  = (int)($_POST['price_khr'] ?? 0);    // 👉 KHR primary
    $rate       = (int)(get_settings()['usd_to_khr'] ?? 4100);
    $price_usd  = $price_khr > 0 && $rate > 0 ? round($price_khr / $rate, 2) : 0;
    $new_img    = save_image($_FILES['image'] ?? []);   // returns 'uploads/...' or null

    if ($name === '' || $price_khr <= 0) {
      throw new Exception("Please fill product name and a valid KHR price.");
    }

    if ($new_img) {
      if ($has_category_id) {
        $category_id = isset($_POST['category_id']) && $_POST['category_id'] !== '' ? (int)$_POST['category_id'] : null;
        $sql = "UPDATE products SET name=?, price_usd=?, price_khr=?, category_id=?, image_path=? WHERE id=?";
        $ok  = $pdo->prepare($sql)->execute([$name, $price_usd, $price_khr, $category_id, $new_img, $id]);
      } else {
        $sql = "UPDATE products SET name=?, price_usd=?, price_khr=?, image_path=? WHERE id=?";
        $ok  = $pdo->prepare($sql)->execute([$name, $price_usd, $price_khr, $new_img, $id]);
      }
    } else {
      if ($has_category_id) {
        $category_id = isset($_POST['category_id']) && $_POST['category_id'] !== '' ? (int)$_POST['category_id'] : null;
        $sql = "UPDATE products SET name=?, price_usd=?, price_khr=?, category_id=? WHERE id=?";
        $ok  = $pdo->prepare($sql)->execute([$name, $price_usd, $price_khr, $category_id, $id]);
      } else {
        $sql = "UPDATE products SET name=?, price_usd=?, price_khr=? WHERE id=?";
        $ok  = $pdo->prepare($sql)->execute([$name, $price_usd, $price_khr, $id]);
      }
    }

    if (!$ok) throw new Exception("Database update failed.");
    header("Location: products.php?updated=1");
    exit;

  } catch (Throwable $e) {
    $msg = $e->getMessage();
  }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Edit Product – FTC POS</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<nav class="navbar navbar-dark" style="background:linear-gradient(90deg,#5b00e5,#007bff)">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="products.php">FTC POS</a>
    <a class="btn btn-outline-light btn-sm" href="products.php">Back</a>
  </div>
</nav>

<div class="container py-4">
  <div class="card shadow-sm">
    <div class="card-header fw-bold">Edit Product #<?= (int)$product['id'] ?></div>
    <div class="card-body">
      <?php if ($msg): ?><div class="alert alert-danger"><?= htmlspecialchars($msg) ?></div><?php endif; ?>

      <form method="post" enctype="multipart/form-data" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Product Name</label>
          <input type="text" name="name" value="<?= htmlspecialchars($product['name'] ?? '') ?>" class="form-control" required>
        </div>

        <div class="col-md-3">
          <label class="form-label">Price (KHR)</label>
          <input type="number" name="price_khr" step="1" min="0"
                 value="<?= htmlspecialchars((string)$price_khr_initial) ?>"
                 class="form-control" required>
          <small class="text-muted">
            Current rate: 1 USD = <?= number_format($rate) ?> ៛
            <br>
            Approx: $<?= number_format((float)($product['price_usd'] ?? 0), 2) ?>
          </small>
        </div>

        <?php if ($has_category_id): ?>
        <div class="col-md-3">
          <label class="form-label">Category</label>
          <select name="category_id" class="form-select">
            <option value="">— None —</option>
            <?php foreach ($cats as $c): ?>
              <option value="<?= (int)$c['id'] ?>" <?= ((int)($product['category_id'] ?? 0) === (int)$c['id']) ? 'selected' : '' ?>>
                <?= htmlspecialchars($c['name']) ?>
              </option>
            <?php endforeach; ?>
          </select>
        </div>
        <?php endif; ?>

        <div class="col-md-6">
          <label class="form-label">Image (optional)</label>
          <input type="file" name="image" class="form-control" accept=".jpg,.jpeg,.png,.webp">
          <?php if (!empty($product['image_path'])): ?>
            <div class="mt-2">
              <img src="<?= asset($product['image_path']) ?>" alt="" style="width:120px;border-radius:8px;object-fit:cover;">
            </div>
          <?php endif; ?>
        </div>

        <div class="col-md-12 d-grid">
          <button class="btn btn-primary btn-lg">Update Product</button>
        </div>
      </form>
    </div>
  </div>
</div>
</body>
</html>
