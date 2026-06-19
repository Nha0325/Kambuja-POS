<?php
// TEMP helper to create users (delete after use!)
// Access: /ftc-pos/tools/create_user.php?token=SET_ME
require_once __DIR__ . '/../helpers.php';

$token = $_GET['token'] ?? '';
$ALLOW = 'SET_ME_CHANGE_THIS_TOKEN';
if ($token !== $ALLOW) {
  http_response_code(403);
  echo "Forbidden. Edit /tools/create_user.php and change $ALLOW, then call with ?token=...";
  exit;
}

$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $name = trim($_POST['name'] ?? '');
  $username = trim($_POST['username'] ?? '');
  $password = $_POST['password'] ?? '';
  $role = $_POST['role'] ?? 'sale';
  $active = isset($_POST['active']) ? 1 : 0;

  if ($name && $username && $password && in_array($role, ['admin','sale'], true)) {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $st = db()->prepare("INSERT INTO users(name,username,password_hash,role,active) VALUES(?,?,?,?,?)");
    try { $st->execute([$name,$username,$hash,$role,$active]); $msg = "User created."; }
    catch (Throwable $e) { $msg = "Error: " . $e->getMessage(); }
  } else {
    $msg = "Please fill all fields.";
  }
}
?>
<!doctype html>
<html><head><meta charset="utf-8"/>
<title>Create User – FTC POS</title>
<link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
</head><body class="bg-light p-4">
  <div class="container">
    <h3>Create User (temp)</h3>
    <?php if ($msg): ?><div class="alert alert-info"><?= htmlspecialchars($msg) ?></div><?php endif; ?>
    <form method="post" class="card p-3" style="max-width:520px;">
      <div class="mb-2"><label class="form-label">Name</label><input class="form-control" name="name" required></div>
      <div class="mb-2"><label class="form-label">Username</label><input class="form-control" name="username" required></div>
      <div class="mb-2"><label class="form-label">Password</label><input type="password" class="form-control" name="password" required></div>
      <div class="mb-2">
        <label class="form-label">Role</label>
        <select class="form-select" name="role">
          <option value="sale">Sale</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" name="active" id="active" checked>
        <label class="form-check-label" for="active">Active</label>
      </div>
      <button class="btn btn-primary">Create</button>
    </form>
    <div class="mt-3 text-muted small">After creating accounts, DELETE this file: <code>/var/www/html/ftc-pos/tools/create_user.php</code>.</div>
  </div>
</body></html>
