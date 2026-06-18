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

/* -------------------------------------------------------------------
 * 1) Calculate expected totals from invoices (same as Linux version)
 * ------------------------------------------------------------------- */
$calc = $pdo->prepare("
    SELECT
      SUM(
        CASE 
          WHEN pay_method='cash' 
          THEN (cash_in_usd - change_usd)
          ELSE 0 
        END
      ) AS net_cash_usd,
      SUM(
        CASE 
          WHEN pay_method='cash'
          THEN (cash_in_khr - change_khr)
          ELSE 0
        END
      ) AS net_cash_khr,

      SUM(
        CASE 
          WHEN pay_method='qr' AND pay_currency='USD'
          THEN total_usd
          ELSE 0
        END
      ) AS qr_usd,

      SUM(
        CASE 
          WHEN pay_method='qr' AND pay_currency='KHR'
          THEN total_khr
          ELSE 0
        END
      ) AS qr_khr

    FROM invoices
    WHERE status='paid'
      AND paid_at >= ?
");
$calc->execute([$session['opened_at']]);
$row = $calc->fetch();

$net_cash_usd = (float)($row['net_cash_usd'] ?? 0);
$net_cash_khr = (int)  ($row['net_cash_khr'] ?? 0);
$qr_usd       = (float)($row['qr_usd'] ?? 0);
$qr_khr       = (int)  ($row['qr_khr'] ?? 0);

/* Expected Totals */
$expected_cash_usd = (float)$session['opening_cash_usd'] + $net_cash_usd;
$expected_cash_khr = (int)$session['opening_cash_khr'] + $net_cash_khr;

$expected_qr_usd   = $qr_usd;
$expected_qr_khr   = $qr_khr;

$closed = false;
$diffs = [
  'cash_usd' => 0,
  'cash_khr' => 0,
  'qr_usd'   => 0,
  'qr_khr'   => 0,
];

/* -------------------------------------------------------------------
 * 2) CLOSE SESSION – AUTO mode (no money counting)
 * ------------------------------------------------------------------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $count_cash_usd = $expected_cash_usd;
    $count_cash_khr = $expected_cash_khr;
    $count_qr_usd   = $expected_qr_usd;
    $count_qr_khr   = $expected_qr_khr;
    $note           = trim($_POST['note'] ?? '');

    /* Diff = counted - expected = always 0 */
    $diffs = [
      'cash_usd' => 0,
      'cash_khr' => 0,
      'qr_usd'   => 0,
      'qr_khr'   => 0,
    ];

    /* Update business session as CLOSED */
    $upd = $pdo->prepare("
        UPDATE business_sessions
        SET
          closed_at         = NOW(),
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

    /* -------------------------------------------------------------------
     * 3) Telegram Summary
     * ------------------------------------------------------------------- */
    $summary  = "📘 Closing session #".$session['id']." (Auto-Close)\n";
    $summary .= "🕒 Opened: ".$session['opened_at']."\n";
    $summary .= "🕒 Closed: ".date('Y-m-d H:i:s')."\n\n";
    $summary .= "💵 Cash: $".number_format($expected_cash_usd,2)." / ".number_format($expected_cash_khr)." ៛\n";
    $summary .= "📱 QR: $".number_format($expected_qr_usd,2)." / ".number_format($expected_qr_khr)." ៛\n";

    if ($note !== "") {
        $summary .= "\n📝 Note: ".$note;
    }

    telegram_send_message($summary);

    /* -------------------------------------------------------------------
     * 4) Reload session for PDF (get usernames)
     * ------------------------------------------------------------------- */
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


    /* -------------------------------------------------------------------
     * 5) Generate PDF using Windows-safe function
     * ------------------------------------------------------------------- */
    if ($bs_full) {

        $html = render_closing_report_html($bs_full, $s, false);

        // Windows-friendly PDF path
        list($targetPath, $filename) = closing_pdf_target_path((int)$session['id']);

        if (generate_pdf_from_html($html, $targetPath)) {
            telegram_send_document($targetPath, "Closing Report #".$session['id']);
        } else {
            error_log("[PDF ERROR] Failed generating PDF for session ".$session['id']);
        }
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

<div class="container py-5" style="max-width:800px">

  <h3 class="mb-3">Close Business (Auto Mode)</h3>

  <div class="alert alert-secondary">
    Session opened:
    <strong><?= htmlspecialchars($session['opened_at']) ?></strong><br>
    Opening reserve:
    <strong>$<?= number_format((float)$session['opening_cash_usd'],2) ?></strong> /
    <strong><?= number_format((int)$session['opening_cash_khr']) ?> ៛</strong>
  </div>

  <div class="row g-3 mb-4">

    <div class="col-md-6">
      <div class="card border-success">
        <div class="card-header bg-success text-white">Expected Cash</div>
        <div class="card-body">
          <p class="mb-1">Opening:</p>
          <ul>
            <li>$<?= number_format((float)$session['opening_cash_usd'],2) ?></li>
            <li><?= number_format((int)$session['opening_cash_khr']) ?> ៛</li>
          </ul>
          <p class="mb-1">Net sales:</p>
          <ul>
            <li>$<?= number_format($net_cash_usd,2) ?></li>
            <li><?= number_format($net_cash_khr) ?> ៛</li>
          </ul>
          <hr>
          <p class="fw-bold mb-0">
            Total Cash: $<?= number_format($expected_cash_usd,2) ?> /
            <?= number_format($expected_cash_khr) ?> ៛
          </p>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card border-info">
        <div class="card-header bg-info text-white">Expected QR</div>
        <div class="card-body">
          <ul>
            <li>$<?= number_format($expected_qr_usd,2) ?> USD</li>
            <li><?= number_format($expected_qr_khr) ?> ៛</li>
          </ul>
        </div>
      </div>
    </div>

  </div>

  <?php if ($closed): ?>

      <div class="alert alert-success">
        ✔ Session is now <strong>CLOSED</strong><br>
        ✔ Telegram summary sent<br>
        ✔ PDF report sent via Telegram
      </div>

      <a class="btn btn-dark w-100 mb-3"
         target="_blank"
         href="print_closing_report.php?session_id=<?= $session['id'] ?>">
         🖨 Print Closing Report
      </a>

      <a class="btn btn-primary w-100" href="index.php">Back</a>

  <?php else: ?>

    <!-- Auto close form -->
    <form method="post" class="card p-3 shadow-sm">
      <h5>Close without counting money?</h5>
      <p>System will assume the actual cash = expected cash.</p>

      <textarea name="note" class="form-control" rows="2"
                placeholder="Optional note..."></textarea>

      <div class="d-flex justify-content-between mt-3">
        <a href="index.php" class="btn btn-outline-secondary">Cancel</a>
        <button class="btn btn-danger"
                onclick="return confirm('Close business now?');">
          Close Business
        </button>
      </div>
    </form>

  <?php endif; ?>

</div>

<script src="<?= BOOTSTRAP_JS ?>"></script>
</body>
</html>
