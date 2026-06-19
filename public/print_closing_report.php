<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$session_id = (int)($_GET['session_id'] ?? 0);
if (!$session_id) {
    echo "Missing session_id";
    exit;
}

$pdo = db();

// Fetch business session + user names
$st = $pdo->prepare("
    SELECT 
      bs.*,
      u1.username AS opened_by_name,
      u2.username AS closed_by_name
    FROM business_sessions bs
    LEFT JOIN users u1 ON u1.id = bs.opened_by
    LEFT JOIN users u2 ON u2.id = bs.closed_by
    WHERE bs.id = ?
");
$st->execute([$session_id]);
$bs = $st->fetch();

if (!$bs) {
    echo "Session not found.";
    exit;
}

$s = get_settings();

// Use shared renderer with autoPrint=true (for browser)
$html = render_closing_report_html($bs, $s, true);

echo $html;
