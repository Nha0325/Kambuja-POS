<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$pdo     = db();
$s       = get_settings();
$session = get_business_status();

if (!$session) {
    redirect('index.php');
}

$user = current_user();

/* -------------------------------------------------
 * ❗ BLOCK CLOSING IF ANY TABLE STILL HAS OPEN ORDER
 * ------------------------------------------------- */
$check = $pdo->query("
    SELECT i.id,
           COALESCE(f.name, 'Unknown Floor') AS floor_name,
           COALESCE(t.table_no, '-') AS table_no
    FROM invoices i
    LEFT JOIN floors f ON f.id = i.floor_id
    LEFT JOIN tables t ON t.id = i.table_id
    WHERE i.status = 'open'
      AND i.floor_id IS NOT NULL
      AND i.table_id IS NOT NULL
");
$pending = $check->fetchAll();

if ($pending) {
    echo "<!doctype html><html><head><meta charset='utf-8'>
          <title>Cannot Close Business</title>
          <link rel='stylesheet' href='".BOOTSTRAP_CSS."'>
          </head><body class='bg-light'>
          <div class='container py-5' style='max-width:850px'>";

    echo "<div class='alert alert-danger p-4'>
          <h4 class='text-danger'>❗ មិនអាចបិទបញ្ជីបានទេ</h4>
          <p>តុខាងក្រោមនៅមានការកម្មង់ <b>មិនទាន់បង់លុយ</b>:</p><ul>";

    foreach ($pending as $p) {
        echo "<li>
              ទីតាំង <b>".htmlspecialchars($p['floor_name'])."</b> /
              តុ <b>".htmlspecialchars($p['table_no'])."</b>
              — Order #".$p['id']."
              </li>";
    }

    echo "</ul><p class='mt-3'>សូមបិទ Order ទាំងនេះជាមុនសិន។</p>
          <a class='btn btn-secondary mt-3' href='index.php'>⬅ ត្រឡប់ក្រោយ</a>
          </div></div></body></html>";
    exit;
}

/* -------------------------------------------------
 * 1) Calculate expected totals from invoices
 * ------------------------------------------------- */
$calc = $pdo->prepare("
    SELECT
      SUM(CASE WHEN pay_method='cash'
          THEN (cash_in_usd - change_usd) ELSE 0 END) AS net_cash_usd,
      SUM(CASE WHEN pay_method='cash'
          THEN (cash_in_khr - change_khr) ELSE 0 END) AS net_cash_khr,
      SUM(CASE WHEN pay_method='qr' AND pay_currency='USD'
          THEN total_usd ELSE 0 END) AS qr_usd,
      SUM(CASE WHEN pay_method='qr' AND pay_currency='KHR'
          THEN total_khr ELSE 0 END) AS qr_khr
    FROM invoices
    WHERE status='paid'
      AND paid_at >= ?
");
$calc->execute([$session['opened_at']]);
$row = $calc->fetch();

$net_cash_usd = (float)($row['net_cash_usd'] ?? 0);
$net_cash_khr = (int)  ($row['net_cash_khr'] ?? 0);
$qr_usd       = (float)($row['qr_usd']       ?? 0);
$qr_khr       = (int)  ($row['qr_khr']       ?? 0);

$expected_cash_usd = (float)$session['opening_cash_usd'] + $net_cash_usd;
$expected_cash_khr = (int)$session['opening_cash_khr'] + $net_cash_khr;

$expected_qr_usd   = $qr_usd;
$expected_qr_khr   = $qr_khr;

$closed = false;
$diffs  = [ 'cash_usd'=>0, 'cash_khr'=>0, 'qr_usd'=>0, 'qr_khr'=>0 ];

/* -------------------------------------------------
 * 2) Close session WITHOUT counting money
 * ------------------------------------------------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Khmer local close time (same everywhere: DB + Telegram)
    $closed_at = now_local();

    // Auto-count = expected values
    $count_cash_usd = $expected_cash_usd;
    $count_cash_khr = $expected_cash_khr;
    $count_qr_usd   = $expected_qr_usd;
    $count_qr_khr   = $expected_qr_khr;
    $note           = trim($_POST['note'] ?? '');

    // differences always 0
    $diffs = [
        'cash_usd' => 0,
        'cash_khr' => 0,
        'qr_usd'   => 0,
        'qr_khr'   => 0,
    ];

    // 3) Update session as closed (use ? for closed_at)
    $upd = $pdo->prepare("
        UPDATE business_sessions
        SET
          closed_at         = ?,
          closed_by         = ?,
          closing_cash_usd  = ?,
          closing_cash_khr  = ?,
          closing_qr_usd    = ?,
          closing_qr_khr    = ?,
          expected_cash_usd = ?,
          expected_cash_khr = ?,
          expected_qr_usd   = ?,
          expected_qr_khr   = ?,
          note              = ?,
          status            = 'closed'
        WHERE id = ?
    ");

    $upd->execute([
        $closed_at,          // closed_at in Asia/Phnom_Penh
        $user['id'],
        $count_cash_usd,
        $count_cash_khr,
        $count_qr_usd,
        $count_qr_khr,
        $expected_cash_usd,
        $expected_cash_khr,
        $expected_qr_usd,
        $expected_qr_khr,
        $note,
        $session['id']
    ]);

    // 4) Telegram summary (also use the same Khmer time)
    $summary  = "📘 របាយការណ៍បិទប្រចាំថ្ងៃ #".$session['id']." (Auto-Close)\n";
    $summary .= "🕒 បើក: ".$session['opened_at']."\n";
    $summary .= "🕒 បិទ: ".$closed_at."\n\n";
    $summary .= "💵 លុយសាច់: $".number_format($expected_cash_usd,2)." / ".number_format($expected_cash_khr)." ៛\n";
    $summary .= "📱 QR: $".number_format($expected_qr_usd,2)." / ".number_format($expected_qr_khr)." ៛\n";

    if ($note !== "")
        $summary .= "\n📝 Note: ".$note;

    telegram_send_message($summary);

    // 5) Reload full session for PDF
    $st2 = $pdo->prepare("
        SELECT 
          bs.*,
          u1.username AS opened_by_name,
          u2.username AS closed_by_name
        FROM business_sessions bs
        LEFT JOIN users u1 ON u1.id = bs.opened_by
        LEFT JOIN users u2 ON u2.id = bs.closed_by
        WHERE bs.id = ?
    ");
    $st2->execute([$session['id']]);
    $bs_full = $st2->fetch();

    if ($bs_full) {
        $html = render_closing_report_html($bs_full, $s, false);

        // filename can still use PHP date() (xampp already Khmer),
        // or you can base it on $closed_at if you want.
        $filename   = 'closing_'.$session['id'].'_'.date('Ymd_His').'.pdf';
        $targetPath = sys_get_temp_dir()."/".$filename;

        if (generate_pdf_from_html($html, $targetPath)) {
            telegram_send_document($targetPath, 'Closing Report #'.$session['id']);
        }
    }

    /* -------------------------------------------------
     * 6) Run Windows backup .bat (non-blocking, auto-close)
     * ------------------------------------------------- */
    $backupBat = 'C:\\Users\\ocza\\backup.bat';

    if (strncasecmp(PHP_OS, 'WIN', 3) === 0 && file_exists($backupBat)) {
        // /c  = run then close cmd
        // start "" /b = background, no extra visible window
        $cmd = 'cmd /c start "" /b "' . $backupBat . '"';

        // fire-and-forget (don't block PHP)
        @pclose(@popen($cmd, 'r'));
    }

    $closed = true;
}
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Close Business – <?= htmlspecialchars($s['company_name'] ?? 'FTC POS') ?></title>
  <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
</head>
<body class="bg-light">
<div class="container py-5" style="max-width:850px">
  <h3 class="mb-3">បិទបញ្ជីការលក់ថ្ងៃនេះ</h3>

  <div class="alert alert-secondary">
    Session opened:
    <strong><?= htmlspecialchars($session['opened_at']) ?></strong><br>
    Opening reserve:
    <strong>$<?= number_format((float)$session['opening_cash_usd'],2) ?></strong> /
    <strong><?= number_format((int)$session['opening_cash_khr']) ?> ៛</strong>
  </div>

  <!-- Expected totals -->
  <div class="row g-3 mb-4">

    <div class="col-md-6">
      <div class="card border-success">
        <div class="card-header bg-success text-white">លុយក្នុងថតតុ</div>
        <div class="card-body">

          <p class="mb-1">សាច់ប្រាក់មុនចាប់ផ្តើម:</p>
          <ul class="mb-2">
            <li>$<?= number_format((float)$session['opening_cash_usd'],2) ?> USD</li>
            <li><?= number_format((int)$session['opening_cash_khr']) ?> ៛ KHR</li>
          </ul>

          <p class="mb-1">សាច់ប្រាក់លក់បាន:</p>
          <ul class="mb-2">
            <li>$<?= number_format($net_cash_usd,2) ?> USD</li>
            <li><?= number_format($net_cash_khr) ?> ៛ KHR</li>
          </ul>

          <hr>
          <p class="fw-bold mb-0">
            សរុប:
            $<?= number_format($expected_cash_usd,2) ?> /
            <?= number_format($expected_cash_khr) ?> ៛
          </p>

        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card border-info">
        <div class="card-header bg-info">លុយដែលលក់បាន QR</div>
        <div class="card-body">

          <ul class="mb-0">
            <li>$<?= number_format($expected_qr_usd,2) ?> USD</li>
            <li><?= number_format($expected_qr_khr) ?> ៛ KHR</li>
          </ul>

        </div>
      </div>
    </div>

  </div>
  <?php if ($closed): ?>

      <div class="alert alert-success">
        <b>✔ បញ្ជីបានបិទរួចរាល់!</b><br>
        របាយការណ៍បានផ្ញើទៅក្នុង Telegram group។
      </div>

      <a class="btn btn-dark w-100 mb-3"
         target="_blank"
         href="print_closing_report.php?session_id=<?= $session['id'] ?>">
        🖨️ Print Closing Report
      </a>

      <a class="btn btn-primary w-100" href="index.php">⬅ ត្រឡប់ក្រោយ</a>

  <?php else: ?>

    <!-- SIMPLE AUTO-CLOSE FORM -->
    <form method="post" class="card p-3 shadow-sm">

      <div class="mt-3">
        <label class="form-label">កំណត់សម្គាល់ (មតិតាមចិត្ត)</label>
        <textarea name="note" class="form-control" rows="2"
                  placeholder="Short note…"></textarea>
      </div>

      <div class="mt-3 d-flex justify-content-between">
        <a class="btn btn-outline-secondary" href="index.php">⬅ ត្រឡប់ក្រោយ</a>

        <button class="btn btn-danger"
                onclick="return confirm('បិទបញ្ជីពេលនេះ? (Auto-Close)');">
          បិទបញ្ជីពេលនេះ
        </button>
      </div>

    </form>

  <?php endif; ?>

</div>

<script src="<?= BOOTSTRAP_JS ?>"></script>
</body>
</html>
