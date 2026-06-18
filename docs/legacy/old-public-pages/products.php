<?php
require_once __DIR__ . '/../auth.php';
require_role('admin');
require_once __DIR__ . '/../helpers.php';

$pdo  = db();

$s    = get_settings();
$rate = (int)$s['usd_to_khr'];

$term = trim($_GET['q'] ?? '');

// Fetch products with category join
$params = [];
$sql = "SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.is_active=1";

if ($term !== '') {
  $sql .= " AND p.name LIKE ?";
  $params[] = "%{$term}%";
}

$sql .= " ORDER BY p.id DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

// flash flags
$added    = !empty($_GET['added']);
$updated  = !empty($_GET['updated']);
$deleted  = !empty($_GET['deleted']);
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Products – FTC POS</title>
<meta name="viewport" content="width=device-width, initial-scale=1">

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
  img.thumb{
    width:60px;
    height:60px;
    object-fit:cover;
    border-radius:8px;
  }

  /* Sticky header */
  .table-sticky thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f8f9fa !important;
    backdrop-filter: blur(4px);
    border-bottom: 2px solid #ddd;
  }

  /* Scrollable product list */
  .table-scroll {
    max-height: 75vh;
    overflow-y: auto;
  }
</style>
</head>

<body class="bg-light">
<nav class="navbar navbar-expand-lg navbar-dark" style="background:linear-gradient(90deg,#5b00e5,#007bff)">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="index.php">FTC POS</a>
    <div class="ms-auto">
      <a class="btn btn-outline-light btn-sm" href="add_product.php">ដាក់បន្ថែមទំនិញ</a>
    </div>
  </div>
</nav>

<div class="container py-4">
  <?php if ($added): ?>
    <div class="alert alert-success">✔ ដាក់បន្ថែមបញ្ជីមុខម្ហូបរួចរាល់</div>
  <?php endif; ?>

  <?php if ($updated): ?>
    <div class="alert alert-success">✔ កែប្រែមុខម្ហូបរួចរាល់</div>
  <?php endif; ?>

  <?php if ($deleted): ?>
    <div class="alert alert-success">✔ លុបមុខម្ហូប (Hidden) រួចរាល់</div>
  <?php endif; ?>


  <!-- Search bar -->
  <form class="row g-2 mb-3" method="get">
    <div class="col-sm-6">
      <input class="form-control" name="q" value="<?= htmlspecialchars($term) ?>"
             placeholder="ស្វែងរកមុខម្ហូប ឬ ទំនិញ...">
    </div>

    <div class="col-sm-3">
      <button class="btn btn-primary w-100">ស្វែងរក</button>
    </div>

    <div class="col-sm-3">
      <a class="btn btn-outline-secondary w-100" href="products.php">បង្ហាញទាំងអស់</a>
    </div>
  </form>


  <!-- Product List -->
  <div class="card shadow-sm">
    
    <div class="table-scroll">
      <table class="table table-sticky align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th style="width:80px">លេខរៀង</th>
            <th style="width:80px">រូប</th>
            <th>ឈ្មោះទំនិញ</th>
            <th>ក្រុម</th>
            <th class="text-end" style="width:120px">ដុល្លារ $</th>
            <th class="text-end" style="width:140px">រៀល ៛</th>
            <th class="text-center" style="width:100px">Qty</th>
            <th class="text-end" style="width:150px">ការកំណត់</th>
          </tr>
        </thead>

        <tbody>
          <?php $i = 1; foreach ($products as $p): ?>
          <tr>
            <td><?= $i++ ?></td>

            <td>
              <?php if (!empty($p['image_path'])): ?>
                <img class="thumb" src="<?= asset($p['image_path']) ?>" alt="">
              <?php endif; ?>
            </td>

            <td><?= htmlspecialchars($p['name']) ?></td>

            <td><?= htmlspecialchars($p['category_name'] ?? '—') ?></td>

            <td class="text-end">
              $<?= number_format((float)($p['price_usd'] ?? 0), 2) ?>
            </td>

            <td class="text-end">
              <?= number_format((int)($p['price_khr'] ?? 0)) ?> ៛
            </td>

            <td class="text-center">
              <?= isset($p['qty']) ? (int)$p['qty'] : 0 ?>
            </td>

            <td class="text-end">
              <a class="btn btn-sm btn-primary" href="edit_product.php?id=<?= (int)$p['id'] ?>">កែប្រែ</a>

              <form method="post" action="products_delete.php" class="d-inline"
                    onsubmit="return confirm('Delete this product? It will only be hidden.');">
                <input type="hidden" name="id" value="<?= (int)$p['id'] ?>">
                <button class="btn btn-sm btn-danger">លុប</button>
              </form>
            </td>
          </tr>
          <?php endforeach; ?>
          <?php if (!$products): ?>
            <tr>
              <td colspan="8" class="text-center text-muted p-4">
                មិនទាន់មានទំនិញនៅក្នុងប្រព័ន្ធ
              </td>
            </tr>
          <?php endif; ?>

        </tbody>
      </table>
    </div> <!-- end .table-scroll -->

  </div> <!-- end .card -->

</div> <!-- end container -->

</body>
</html>
