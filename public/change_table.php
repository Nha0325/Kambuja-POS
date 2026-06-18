<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$user = current_user();
$s    = get_settings();

$invoice_id = (int)($_GET['invoice'] ?? $_POST['invoice'] ?? 0);
if (!$invoice_id) {
    redirect('index.php');
}

// load current invoice
$st = $pdo->prepare("
    SELECT i.*, f.name AS floor_name, t.table_no
    FROM invoices i
    LEFT JOIN floors f ON f.id = i.floor_id
    LEFT JOIN tables t ON t.id = i.table_id
    WHERE i.id=?
");
$st->execute([$invoice_id]);
$inv = $st->fetch(PDO::FETCH_ASSOC);

if (!$inv) {
    echo "Invoice not found";
    exit;
}

// all floors
$floors = get_floors();

// If POST => perform change
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $new_floor_id = (int)($_POST['floor_id'] ?? 0);
    $new_table_id = (int)($_POST['table_id'] ?? 0);

    if ($new_floor_id && $new_table_id) {
        try {
            move_invoice_to_table($pdo, $invoice_id, $new_floor_id, $new_table_id);
            // back to sale on new table
            redirect('sale.php?invoice=' . $invoice_id);
        } catch (Throwable $e) {
            $error = $e->getMessage();
        }
    } else {
        $error = "Please choose floor and table.";
    }
}

?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Change Table – FTC POS</title>
  <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
</head>
<body class="bg-light">
<div class="container py-4">
  <h3>Change Table for Invoice #<?= $invoice_id ?></h3>

  <p>
    Current: 
    <strong><?= htmlspecialchars($inv['floor_name'] ?? 'N/A') ?></strong> /
    <strong><?= htmlspecialchars($inv['table_no'] ?? 'N/A') ?></strong>
  </p>

  <?php if (!empty($error)): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
  <?php endif; ?>

  <form method="post">
    <input type="hidden" name="invoice" value="<?= $invoice_id ?>">

    <div class="mb-3">
      <label class="form-label">Floor</label>
      <select name="floor_id" id="floor_id" class="form-select" required>
        <option value="">-- Select Floor --</option>
        <?php foreach ($floors as $f): ?>
          <option value="<?= $f['id'] ?>">
            <?= htmlspecialchars($f['name']) ?>
          </option>
        <?php endforeach; ?>
      </select>
    </div>

    <div class="mb-3">
      <label class="form-label">Table</label>
      <select name="table_id" id="table_id" class="form-select" required>
        <option value="">-- Select Table --</option>
        <!-- will be filled by JS based on floor -->
      </select>
      <div class="form-text">
        Only tables with status <strong>free</strong> should be shown (we filter in JS).
      </div>
    </div>

    <button class="btn btn-primary">Change Table</button>
    <a href="sale.php?invoice=<?= $invoice_id ?>" class="btn btn-secondary">Back</a>
  </form>
</div>

<script src="<?= BOOTSTRAP_JS ?>"></script>

<script>
// preload tables by floor as JSON for client-side filter
<?php
$floorTables = [];
foreach ($floors as $fl) {
    $floorTables[$fl['id']] = get_tables_by_floor((int)$fl['id']);
}
?>
const floorTables = <?= json_encode($floorTables) ?>;

const floorSelect = document.getElementById('floor_id');
const tableSelect = document.getElementById('table_id');

function refreshTables() {
  const fid = floorSelect.value;
  tableSelect.innerHTML = '<option value="">-- Select Table --</option>';

  if (!fid || !floorTables[fid]) return;

  floorTables[fid].forEach(t => {
    // show only free tables
    if (t.status !== 'free') return;
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.table_no} (${t.status})`;
    tableSelect.appendChild(opt);
  });
}

floorSelect.addEventListener('change', refreshTables);
</script>
</body>
</html>
