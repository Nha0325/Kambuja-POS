<?php
require_once __DIR__ . '/../auth.php';
require_role('admin');                 // admin only
require_once __DIR__ . '/../helpers.php';

$pdo = db();
$ok = ''; $err = '';

// Show helpful DB errors instead of blank 500
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

function valid_role($r){ return in_array($r, ['admin','sale'], true); }

try {
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'add_user') {
      $username = trim($_POST['username'] ?? '');
      $password = (string)($_POST['password'] ?? '');
      $role     = $_POST['role'] ?? 'sale';
      if ($username === '' || strlen($password) < 6 || !valid_role($role)) {
        throw new Exception("Please provide username, password (>=6), and a valid role.");
      }
      $exists = $pdo->prepare("SELECT id FROM users WHERE username=?");
      $exists->execute([$username]);
      if ($exists->fetch()) throw new Exception("Username already exists.");

      $hash = password_hash($password, PASSWORD_BCRYPT);
      $ins  = $pdo->prepare("INSERT INTO users (username, password_hash, role, is_active) VALUES (?,?,?,1)");
      $ins->execute([$username, $hash, $role]);
      $ok = "User added.";
    }

    if ($action === 'toggle_active') {
      $id = (int)($_POST['id'] ?? 0);
      $pdo->prepare("UPDATE users SET is_active = 1 - is_active WHERE id=?")->execute([$id]);
      $ok = "User status updated.";
    }

    if ($action === 'set_role') {
      $id   = (int)($_POST['id'] ?? 0);
      $role = $_POST['role'] ?? 'sale';
      if (!valid_role($role)) throw new Exception("Invalid role.");
      $pdo->prepare("UPDATE users SET role=? WHERE id=?")->execute([$role, $id]);
      $ok = "Role updated.";
    }

    if ($action === 'reset_pw') {
      $id  = (int)($_POST['id'] ?? 0);
      $pwd = (string)($_POST['new_password'] ?? '');
      if (strlen($pwd) < 6) throw new Exception("Password must be at least 6 characters.");
      $hash = password_hash($pwd, PASSWORD_BCRYPT);
      $pdo->prepare("UPDATE users SET password_hash=? WHERE id=?")->execute([$hash, $id]);
      $ok = "Password reset.";
    }
  }

  $users = $pdo->query("SELECT id, username, role, is_active, created_at FROM users ORDER BY id DESC")->fetchAll();

} catch (Throwable $e) {
  $err = $e->getMessage();
  $users = [];
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Users – FTC POS</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>.form-inline{display:flex;gap:.5rem;align-items:center}</style>
</head>
<body class="bg-light">
<nav class="navbar navbar-dark" style="background:linear-gradient(90deg,#5b00e5,#007bff)">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="index.php">FTC POS</a>
    <div class="ms-auto d-flex gap-2">
      <a class="btn btn-outline-light btn-sm" href="products.php">បញ្ជីមុខម្ហូរ</a>
      <a class="btn btn-outline-light btn-sm" href="categories.php">បញ្ជីក្រុមទំនិញ</a>
      <a class="btn btn-outline-light btn-sm" href="settings.php">ការកំណត់ក្រុមហ៊ុន</a>
    </div>
  </div>
</nav>

<div class="container py-4">
  <?php if ($ok): ?><div class="alert alert-success"><?= htmlspecialchars($ok) ?></div><?php endif; ?>
  <?php if ($err): ?><div class="alert alert-danger"><?= htmlspecialchars($err) ?></div>
  <div class="alert alert-warning">
    If this says “Base table or view not found: <code>users</code>”, please run the SQL in step 1 to create the table.
  </div><?php endif; ?>

  <div class="card shadow-sm mb-4">
    <div class="card-header fw-bold">បន្ថែមឈ្មោះអ្នកប្រើ</div>
    <div class="card-body">
      <form method="post" class="row g-2">
        <input type="hidden" name="action" value="add_user">
        <div class="col-md-4">
          <label class="form-label">ឈ្មោះពេញ</label>
          <input name="username" class="form-control" required>
        </div>
        <div class="col-md-4">
          <label class="form-label">ពាក្យសម្ងាត់</label>
          <input name="password" type="password" minlength="6" class="form-control" required>
        </div>
        <div class="col-md-2">
          <label class="form-label">តួនាទី</label>
          <select name="role" class="form-select">
            <option value="sale">ជាអ្នកលក់</option>
            <option value="admin">ជាអ្នកពេញលេញ</option>
          </select>
        </div>
        <div class="col-md-2 d-grid">
          <label class="form-label">&nbsp;</label>
          <button class="btn btn-primary">រក្សាទុក</button>
        </div>
      </form>
    </div>
  </div>

  <div class="card shadow-sm">
    <div class="card-header fw-bold">បញ្ជីឈ្មោះ</div>
    <div class="table-responsive">
      <table class="table align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th style="width:80px">#</th>
            <th>ឈ្មោះពេញ</th>
            <th style="width:140px">តួនាទី</th>
            <th style="width:120px">ស្ថានភាព</th>
            <th style="width:240px">ប្តូរពាក្យសម្ងាត់</th>
            <th style="width:200px">ការកំណត់</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($users as $u): ?>
          <tr>
            <td><?= (int)$u['id'] ?></td>
            <td><?= htmlspecialchars($u['username']) ?></td>

            <td>
              <form method="post" class="form-inline">
                <input type="hidden" name="action" value="set_role">
                <input type="hidden" name="id" value="<?= (int)$u['id'] ?>">
                <select name="role" class="form-select form-select-sm">
                  <option value="sale"  <?= $u['role']==='sale'  ? 'selected':'' ?>>ជាអ្នកលក់</option>
                  <option value="admin" <?= $u['role']==='admin' ? 'selected':'' ?>>admin</option>
                </select>
                <button class="btn btn-sm btn-outline-primary">រួចរាល់</button>
              </form>
            </td>

            <td>
              <?php if ($u['is_active']): ?>
                <span class="badge bg-success">ដំណើរការ</span>
              <?php else: ?>
                <span class="badge bg-secondary">មិនដំណើរការ</span>
              <?php endif; ?>
            </td>

            <td>
              <form method="post" class="form-inline">
                <input type="hidden" name="action" value="reset_pw">
                <input type="hidden" name="id" value="<?= (int)$u['id'] ?>">
                <input type="password" name="new_password" minlength="6" placeholder="New password" class="form-control form-control-sm" required>
                <button class="btn btn-sm btn-outline-dark">Reset</button>
              </form>
            </td>

            <td class="text-end">
              <form method="post" class="d-inline" onsubmit="return confirm('Toggle active/inactive?');">
                <input type="hidden" name="action" value="toggle_active">
                <input type="hidden" name="id" value="<?= (int)$u['id'] ?>">
                <button class="btn btn-sm <?= $u['is_active']?'btn-outline-danger':'btn-outline-success' ?>">
                  <?= $u['is_active'] ? 'Deactivate' : 'Activate' ?>
                </button>
              </form>
            </td>
          </tr>
          <?php endforeach; ?>
          <?php if (!$users): ?>
            <tr><td colspan="6" class="text-center text-muted p-4">No users.</td></tr>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>

</div>
</body>
</html>
