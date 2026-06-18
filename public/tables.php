<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$msg = '';
$ok  = '';

/* ---------- helpers ---------- */
function post($k, $default = null) { return $_POST[$k] ?? $default; }
function intv($k, $default = 0)     { return (int)($_POST[$k] ?? $default); }

/**
 * Convert Khmer digits to Arabic digits (០១២៣៤៥៦៧៨៩ -> 0123456789)
 */
function khmer_digits_to_arabic(string $s): string {
  $kh = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
  $ar = ['0','1','2','3','4','5','6','7','8','9'];
  return str_replace($kh, $ar, $s);
}

/**
 * Compare tables by table_no in natural order, supporting Khmer digits and text.
 * Example: ១,២,៩,១០, A1, A2, B10...
 */
function cmp_table_no(array $a, array $b): int {
  $aKey = khmer_digits_to_arabic($a['table_no'] ?? '');
  $bKey = khmer_digits_to_arabic($b['table_no'] ?? '');
  // Natural, case-insensitive comparison (1,2,10 instead of 1,10,2)
  return strnatcasecmp($aKey, $bKey);
}

/* ---------- actions ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $action = post('action', '');

  try {
    if ($action === 'floor_create') {
      $name = trim((string)post('name',''));
      if ($name === '') throw new Exception('Floor name is required.');
      $st = db()->prepare("INSERT INTO floors (name, is_active) VALUES (?,1)");
      $st->execute([$name]);
      $ok = "Floor “{$name}” created.";

    } elseif ($action === 'floor_update') {
      $id   = intv('id');
      $name = trim((string)post('name',''));
      if (!$id) throw new Exception('Invalid floor id.');
      if ($name === '') throw new Exception('Floor name is required.');
      $st = db()->prepare("UPDATE floors SET name=? WHERE id=?");
      $st->execute([$name, $id]);
      $ok = "Floor updated.";

    } elseif ($action === 'floor_delete') {
      $id = intv('id');
      if (!$id) throw new Exception('Invalid floor id.');
      // Soft delete to avoid FK trouble when tables exist
      $st = db()->prepare("UPDATE floors SET is_active=0 WHERE id=?");
      $st->execute([$id]);
      $ok = "Floor archived (hidden).";

    } elseif ($action === 'table_create') {
      $floor_id = intv('floor_id');
      $table_no = trim((string)post('table_no',''));
      if (!$floor_id) throw new Exception('Choose a floor.');
      if ($table_no === '') throw new Exception('Table number is required.');
      $st = db()->prepare("INSERT INTO tables (floor_id, table_no, status, is_active) VALUES (?,?, 'free', 1)");
      $st->execute([$floor_id, $table_no]);
      $ok = "Table {$table_no} created.";

    } elseif ($action === 'table_update') {
      $id       = intv('id');
      $floor_id = intv('floor_id');
      $table_no = trim((string)post('table_no',''));
      $status   = trim((string)post('status','free'));
      if (!$id) throw new Exception('Invalid table id.');
      if (!$floor_id) throw new Exception('Choose a floor.');
      if ($table_no === '') throw new Exception('Table number is required.');
      if (!in_array($status, ['free','busy','disabled'], true)) $status = 'free';

      $st = db()->prepare("UPDATE tables SET floor_id=?, table_no=?, status=? WHERE id=?");
      $st->execute([$floor_id, $table_no, $status, $id]);
      $ok = "Table updated.";

    } elseif ($action === 'table_delete') {
      $id = intv('id');
      if (!$id) throw new Exception('Invalid table id.');
      // Prefer soft delete so old invoices keep history; set to inactive & free
      $st = db()->prepare("UPDATE tables SET is_active=0, status='disabled' WHERE id=?");
      $st->execute([$id]);
      $ok = "Table archived (hidden).";
    }
  } catch (Throwable $e) {
    // If UNIQUE constraint fails on (floor_id, table_no), show friendly message
    if (strpos($e->getMessage(), 'uq_floor_table') !== false ||
        strpos($e->getMessage(), 'Duplicate entry') !== false) {
      $msg = 'Duplicate table number in this floor. Please choose another table_no.';
    } else {
      $msg = $e->getMessage();
    }
  }
}

/* ---------- query data ---------- */
// Sort floors by name (supports Khmer & English via collation), then id
$floors = $pdo->query("
  SELECT id, name, COALESCE(is_active,1) AS is_active
  FROM floors
  WHERE COALESCE(is_active,1)=1
  ORDER BY name, id
")->fetchAll(PDO::FETCH_ASSOC);

$tablesByFloor = [];
if ($floors) {
  $in  = implode(',', array_fill(0, count($floors), '?'));
  $ids = array_map(fn($r)=> (int)$r['id'], $floors);

  // We will sort in PHP (Khmer-aware), so no ORDER BY here
  $st = $pdo->prepare("
    SELECT id, floor_id, table_no, status, COALESCE(is_active,1) AS is_active
    FROM tables
    WHERE COALESCE(is_active,1)=1 AND floor_id IN ($in)
  ");
  $st->execute($ids);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  foreach ($rows as $t) {
    $tablesByFloor[$t['floor_id']][] = $t;
  }

  // Sort each floor's tables by table_no in natural order (with Khmer digits)
  foreach ($tablesByFloor as &$list) {
    usort($list, 'cmp_table_no');
  }
  unset($list);
}

$s = get_settings();
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title><?= htmlspecialchars($s['company_name'] ?? 'FTC POS') ?> – Floors & Tables</title>
  <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
  <link rel="stylesheet" href="styles.css">
  <style>
    .badge-free{background:#28a7451a;border:1px solid #28a745;border-radius:6px;padding:2px 6px}
    .badge-busy{background:#dc35451a;border:1px solid #dc3545;border-radius:6px;padding:2px 6px}
    .badge-disabled{background:#6c757d1a;border:1px solid #6c757d;border-radius:6px;padding:2px 6px}
  </style>
</head>
<body class="bg-light">
<nav class="navbar nav-gradient navbar-dark">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="index.php">FTC POS</a>
    <div class="text-white small">Manage floors & tables</div>
    <div>
      <a class="btn btn-outline-light btn-sm" href="merge_pay.php">Merge Pay</a>
      <a class="btn btn-light btn-sm" href="products.php">Products</a>
    </div>
  </div>
</nav>

<div class="container py-3">
  <?php if ($ok): ?><div class="alert alert-success"><?= htmlspecialchars($ok) ?></div><?php endif; ?>
  <?php if ($msg): ?><div class="alert alert-danger"><?= htmlspecialchars($msg) ?></div><?php endif; ?>

  <!-- Add Floor -->
  <div class="card shadow-sm mb-3">
    <div class="card-body">
      <form method="post" class="row g-2 align-items-end">
        <input type="hidden" name="action" value="floor_create">
        <div class="col-md-6">
          <label class="form-label">New Floor Name</label>
          <input type="text" class="form-control" name="name" required placeholder="e.g. Ground Floor">
        </div>
        <div class="col-md-3 d-grid">
          <button class="btn btn-primary">Add Floor</button>
        </div>
      </form>
    </div>
  </div>

  <?php if (!$floors): ?>
    <div class="alert alert-info">No floors yet. Use the form above to create one.</div>
  <?php endif; ?>

  <?php foreach ($floors as $f): 
        $floorTables = $tablesByFloor[$f['id']] ?? []; ?>
    <div class="card shadow-sm mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div class="h5 m-0">Floor: <?= htmlspecialchars($f['name']) ?></div>
        <div class="d-flex gap-2">
          <!-- Edit Floor -->
          <button class="btn btn-sm btn-outline-primary" data-bs-toggle="collapse" data-bs-target="#editFloor<?= $f['id'] ?>">Edit</button>
          <form method="post" onsubmit="return confirm('Archive this floor? (tables will be hidden)');">
            <input type="hidden" name="action" value="floor_delete">
            <input type="hidden" name="id" value="<?= (int)$f['id'] ?>">
            <button class="btn btn-sm btn-outline-danger">Delete</button>
          </form>
        </div>
      </div>

      <div id="editFloor<?= $f['id'] ?>" class="collapse">
        <div class="card-body">
          <form method="post" class="row g-2 align-items-end">
            <input type="hidden" name="action" value="floor_update">
            <input type="hidden" name="id" value="<?= (int)$f['id'] ?>">
            <div class="col-md-6">
              <label class="form-label">Floor Name</label>
              <input type="text" class="form-control" name="name" value="<?= htmlspecialchars($f['name']) ?>" required>
            </div>
            <div class="col-md-3 d-grid">
              <button class="btn btn-success">Save</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="fw-semibold">Tables</div>
          <!-- Add Table -->
          <form method="post" class="d-flex align-items-end gap-2">
            <input type="hidden" name="action" value="table_create">
            <input type="hidden" name="floor_id" value="<?= (int)$f['id'] ?>">
            <div>
              <label class="form-label">Table No.</label>
              <input type="text" class="form-control" name="table_no" placeholder="e.g. 1 / A1 / ១" required>
            </div>
            <button class="btn btn-primary">Add Table</button>
          </form>
        </div>

        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead class="table-light">
              <tr>
                <th style="width:60px">No</th>
                <th style="width:140px">Table No</th>
                <th style="width:140px">Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            <?php if (!$floorTables): ?>
              <tr><td colspan="4" class="text-muted">No tables on this floor.</td></tr>
            <?php else: 
                  $no = 1;
                  foreach ($floorTables as $t): ?>
              <tr>
                <td><?= $no++ ?></td>
                <td><?= htmlspecialchars($t['table_no']) ?></td>
                <td>
                  <?php if ($t['status']==='free'): ?>
                    <span class="badge-free">free</span>
                  <?php elseif ($t['status']==='busy'): ?>
                    <span class="badge-busy">busy</span>
                  <?php else: ?>
                    <span class="badge-disabled"><?= htmlspecialchars($t['status']) ?></span>
                  <?php endif; ?>
                </td>
                <td>
                  <!-- Edit Table (inline collapse form) -->
                  <button class="btn btn-sm btn-outline-primary me-2" data-bs-toggle="collapse" data-bs-target="#editTable<?= $t['id'] ?>">Edit</button>
                  <form method="post" class="d-inline" onsubmit="return confirm('Archive this table? (won\'t show in POS)');">
                    <input type="hidden" name="action" value="table_delete">
                    <input type="hidden" name="id" value="<?= (int)$t['id'] ?>">
                    <button class="btn btn-sm btn-outline-danger">Delete</button>
                  </form>

                  <div id="editTable<?= $t['id'] ?>" class="collapse mt-2">
                    <form method="post" class="row g-2 align-items-end border rounded p-2">
                      <input type="hidden" name="action" value="table_update">
                      <input type="hidden" name="id" value="<?= (int)$t['id'] ?>">
                      <div class="col-md-3">
                        <label class="form-label">Floor</label>
                        <select class="form-select" name="floor_id">
                          <?php foreach ($floors as $f2): ?>
                            <option value="<?= (int)$f2['id'] ?>" <?= $f2['id']==$t['floor_id']?'selected':'' ?>>
                              <?= htmlspecialchars($f2['name']) ?>
                            </option>
                          <?php endforeach; ?>
                        </select>
                      </div>
                      <div class="col-md-3">
                        <label class="form-label">Table No</label>
                        <input class="form-control" name="table_no" value="<?= htmlspecialchars($t['table_no']) ?>" required>
                      </div>
                      <div class="col-md-3">
                        <label class="form-label">Status</label>
                        <select class="form-select" name="status">
                          <option value="free"     <?= $t['status']==='free'?'selected':'' ?>>free</option>
                          <option value="busy"     <?= $t['status']==='busy'?'selected':'' ?>>busy</option>
                          <option value="disabled" <?= $t['status']==='disabled'?'selected':'' ?>>disabled</option>
                        </select>
                      </div>
                      <div class="col-md-3 d-grid">
                        <button class="btn btn-success">Save</button>
                      </div>
                    </form>
                  </div>
                </td>
              </tr>
            <?php endforeach; endif; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  <?php endforeach; ?>
</div>

<script src="<?= BOOTSTRAP_JS ?>"></script>
</body>
</html>
