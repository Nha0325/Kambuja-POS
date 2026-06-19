<?php
require_once __DIR__ . '/../auth.php';
require_role('admin');
require_once __DIR__ . '/../helpers.php';

$err = $ok = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $action = $_POST['action'] ?? '';
  try {
    if ($action === 'add') {
      $name = trim($_POST['name'] ?? '');
      if ($name === '') throw new Exception("Name is required.");
      create_category($name);
      $ok = "Category created.";
    } elseif ($action === 'edit') {
      $id = (int)($_POST['id'] ?? 0);
      $name = trim($_POST['name'] ?? '');
      if (!$id || $name==='') throw new Exception("Invalid request.");
      update_category($id, $name);
      $ok = "Category updated.";
    } elseif ($action === 'del') {
      $id = (int)($_POST['id'] ?? 0);
      if (!$id) throw new Exception("Invalid request.");
      delete_category($id);
      $ok = "Category disabled.";
    }
  } catch (Exception $e) { $err = $e->getMessage(); }
}
$cats = get_categories(false);
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Categories – FTC POS</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<nav class="navbar navbar-expand-lg nav-gradient navbar-dark">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="index.php">FTC POS</a>
    <div class="ms-auto"><a class="btn btn-outline-light btn-sm" href="logout.php">Sign Out</a></div>
  </div>
</nav>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3 class="m-0">បញ្ជីក្រុមទំនិញ</h3>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addModal">បន្ថែមក្រុមទំនិញ</button>
  </div>

  <?php if ($ok): ?><div class="alert alert-success"><?= htmlspecialchars($ok) ?></div><?php endif; ?>
  <?php if ($err): ?><div class="alert alert-danger"><?= htmlspecialchars($err) ?></div><?php endif; ?>

  <div class="card">
    <div class="table-responsive">
      <table class="table table-hover align-middle m-0">
        <thead><tr><th>#</th><th>ឈ្មោះ</th><th>ស្ថានភាព</th><th>ការកំណត់</th></tr></thead>
        <tbody>
          <?php foreach ($cats as $c): ?>
          <tr>
            <td><?= (int)$c['id'] ?></td>
            <td><?= htmlspecialchars($c['name']) ?></td>
            <td>
              <?php if ((int)$c['is_active'] === 1): ?>
                <span class="badge bg-success">ដំណើរការ</span>
              <?php else: ?>
                <span class="badge bg-secondary">មិនដំណើរការ</span>
              <?php endif; ?>
            </td>
            <td class="text-nowrap">
              <button class="btn btn-sm btn-outline-primary"
                data-bs-toggle="modal" data-bs-target="#editModal"
                data-id="<?= (int)$c['id'] ?>" data-name="<?= htmlspecialchars($c['name']) ?>">ប្តូរឈ្មោះ</button>
              <?php if ((int)$c['is_active'] === 1): ?>
                <form class="d-inline" method="post" onsubmit="return confirm('Disable this category?');">
                  <input type="hidden" name="action" value="del">
                  <input type="hidden" name="id" value="<?= (int)$c['id'] ?>">
                  <button class="btn btn-sm btn-outline-danger">បិទដំណើរការ</button>
                </form>
              <?php endif; ?>
            </td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Add Modal -->
<div class="modal fade" id="addModal" tabindex="-1">
  <div class="modal-dialog">
    <form class="modal-content" method="post">
      <input type="hidden" name="action" value="add">
      <div class="modal-header"><h5 class="modal-title">បន្ថែមក្រុមទំនិញ</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body">
        <label class="form-label">ឈ្មោះ</label>
        <input name="name" class="form-control" required>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary">រក្សាទុក</button>
      </div>
    </form>
  </div>
</div>

<!-- Edit Modal -->
<div class="modal fade" id="editModal" tabindex="-1">
  <div class="modal-dialog">
    <form class="modal-content" method="post">
      <input type="hidden" name="action" value="edit">
      <input type="hidden" name="id" id="edit_id">
      <div class="modal-header"><h5 class="modal-title">បន្ថែមក្រុមទំនិញ</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body">
        <label class="form-label">ឈ្មោះ</label>
        <input name="name" id="edit_name" class="form-control" required>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary">កែប្រែ</button>
      </div>
    </form>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
const editModal = document.getElementById('editModal');
editModal?.addEventListener('show.bs.modal', e => {
  const btn = e.relatedTarget;
  document.getElementById('edit_id').value = btn.getAttribute('data-id');
  document.getElementById('edit_name').value = btn.getAttribute('data-name');
});
</script>
</body>
</html>
