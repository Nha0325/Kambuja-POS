<?php

use App\Core\Database;
use App\Services\AuthService;

function db(): PDO {
  return Database::getConnection();
}

function app_config(): array {
  static $config = null;

  if ($config === null) {
    $config = require dirname(__DIR__, 2) . '/config/app.php';
  }

  return $config;
}

function base_url(): string {
  $path = parse_url(app_config()['url'], PHP_URL_PATH);

  if (!is_string($path) || $path === '/') {
    return '';
  }

  return rtrim($path, '/');
}

function url(string $path = ''): string {
  $path = '/' . ltrim($path, '/');
  return base_url() . ($path === '/' ? '/' : $path);
}

function login_user(string $username, string $password): bool {
  return AuthService::attempt($username, $password);
}

function logout_user(): void {
  AuthService::logout();
  header('Location: ' . url('/login'));
  exit;
}

function auth_logout(): void {
  logout_user();
}

function current_user(): ?array {
  return AuthService::user();
}

function require_login(): void {
  if (current_user() === null) {
    header('Location: ' . url('/login'));
    exit;
  }
}

function require_role(string $role): void {
  require_login();
  $user = current_user();

  if (($user['role'] ?? null) !== $role) {
    http_response_code(403);
    echo 'Access denied.';
    exit;
  }
}

/**
 * Return current datetime string in Asia/Phnom_Penh timezone,
 * formatted for MySQL DATETIME (Y-m-d H:i:s)
 */
function now_local(): string {
    static $tz = null;
    if ($tz === null) {
        $tz = new DateTimeZone('Asia/Phnom_Penh');
    }
    $dt = new DateTime('now', $tz);
    return $dt->format('Y-m-d H:i:s');
}

/**
 * ==========================
 * Global configuration
 * ==========================
 */

/**
 * Build absolute URL for assets (images, css, js, etc.)
 */
function asset(string $path): string {
  return url($path);
}

/**
 * ==========================
 * Global settings & currency
 * ==========================
 */
function get_settings(): array {
  $stmt = db()->query("SELECT * FROM settings ORDER BY id ASC LIMIT 1");
  return $stmt->fetch() ?: ['usd_to_khr' => 4100, 'company_name' => 'TFC POS'];
}

function get_rate(): int {
  $s = get_settings();
  return (int)($s['usd_to_khr'] ?? 4100);
}

function usd_to_khr_value(float $usd, int $rate): int {
  return (int)round($usd * $rate, 0);
}
function usd_to_khr_int(float $usd, int $rate): int {
  return (int)round($usd * $rate);
}
function fmt_money_usd(float $v): string { return '$' . number_format($v, 2); }
function fmt_money_khr(int $v): string   { return number_format($v) . ' ៛'; }

/**
 * ==========================
 * Misc utils
 * ==========================
 */
function redirect(string $url) {
  header("Location: {$url}");
  exit;
}

function ensure_upload_dir(): void {
  if (!defined('UPLOAD_DIR')) {
    define('UPLOAD_DIR', dirname(__DIR__, 2) . '/public/uploads');
  }
  if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0775, true);
  }
}

function save_image(array $file): ?string {
  if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) return null;
  $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
  if (!in_array($ext, ['jpg','jpeg','png','webp'])) return null;
  ensure_upload_dir();
  $name   = 'p_'.time().'_'.bin2hex(random_bytes(4)).'.'.$ext;
  $target = rtrim(UPLOAD_DIR,'/').'/'.$name;
  if (!move_uploaded_file($file['tmp_name'], $target)) return null;
  return 'uploads/'.$name;
}

/* ======= HOLD helpers ======= */
function release_expired_holds(): void {
  // ស្រាយ hold ផុតកំណត់មក 'free'
  $sql = "UPDATE tables
          SET status='free', hold_until=NULL, hold_by_user_id=NULL, hold_note=NULL
          WHERE status='hold' AND hold_until IS NOT NULL AND hold_until < NOW()";
  db()->exec($sql);
}

function table_set_hold(int $table_id, int $minutes, int $user_id, string $note=''): bool {
  if ($minutes < 1) $minutes = 1;
  $st = db()->prepare("
    UPDATE tables
    SET status='hold',
        hold_until = DATE_ADD(NOW(), INTERVAL ? MINUTE),
        hold_by_user_id = ?,
        hold_note = ?
    WHERE id=? AND status IN ('free','hold') -- អនុញ្ញាត renew
  ");
  return $st->execute([$minutes, $user_id, $note, $table_id]);
}

function table_release_hold(int $table_id): bool {
  $st = db()->prepare("
    UPDATE tables
    SET status='free', hold_until=NULL, hold_by_user_id=NULL, hold_note=NULL
    WHERE id=? AND status='hold'
  ");
  return $st->execute([$table_id]);
}

/**
 * ==========================
 * Floors / Tables
 * ==========================
 */

function get_floors(): array {
  return db()->query("SELECT * FROM floors WHERE COALESCE(is_active,1)=1 ORDER BY id")->fetchAll();
}

/**
 * Convert Khmer digits to Arabic digits (១២៣ -> 123)
 */
function kh_digits_to_arabic(string $s): string {
  $map = [
    '០' => '0',
    '១' => '1',
    '២' => '2',
    '៣' => '3',
    '៤' => '4',
    '៥' => '5',
    '៦' => '6',
    '៧' => '7',
    '៨' => '8',
    '៩' => '9',
  ];
  return strtr($s, $map);
}

/**
 * Build numeric sort key from table label.
 * e.g. "ល១២" -> 12, "T01" -> 1, "TAKE AWAY" -> very large number (go to end)
 */
function table_sort_key(string $label): int {
  // keep only digits (Khmer or Arabic)
  $digits = preg_replace('/[^0-9០-៩]/u', '', $label);
  $digits = kh_digits_to_arabic($digits);
  if ($digits === '') {
    return PHP_INT_MAX; // for labels without number
  }
  return (int)$digits;
}

function get_tables_by_floor(int $floor_id): array {
  $st = db()->prepare("
    SELECT *
    FROM tables
    WHERE floor_id = ? AND COALESCE(is_active,1)=1
  ");
  $st->execute([$floor_id]);
  $rows = $st->fetchAll();

  // Sort by numeric part of table_no (supports Khmer & English digits)
  usort($rows, function ($a, $b) {
    $a_no = $a['table_no'] ?? '';
    $b_no = $b['table_no'] ?? '';
    return table_sort_key($a_no) <=> table_sort_key($b_no);
  });

  return $rows;
}

/**
 * Change Table
 */
function move_invoice_to_table(PDO $pdo, int $invoice_id, int $new_floor_id, int $new_table_id): void
{
    $pdo->beginTransaction();
    try {
        // 1. load invoice
        $st = $pdo->prepare("SELECT floor_id, table_id FROM invoices WHERE id=? FOR UPDATE");
        $st->execute([$invoice_id]);
        $inv = $st->fetch(PDO::FETCH_ASSOC);
        if (!$inv) {
            throw new Exception("Invoice not found");
        }

        $old_floor_id = (int)($inv['floor_id'] ?? 0);
        $old_table_id = (int)($inv['table_id'] ?? 0);

        // 2. free old table if no other open invoice uses it
        if ($old_table_id > 0) {
            $st2 = $pdo->prepare("
                SELECT COUNT(*) 
                FROM invoices 
                WHERE table_id=? AND status='open' AND id<>?
            ");
            $st2->execute([$old_table_id, $invoice_id]);
            $cnt = (int)$st2->fetchColumn();

            if ($cnt === 0) {
                $u = $pdo->prepare("UPDATE tables SET status='free' WHERE id=?");
                $u->execute([$old_table_id]);
            }
        }

        // 3. mark new table busy
        $u2 = $pdo->prepare("UPDATE tables SET status='busy' WHERE id=?");
        $u2->execute([$new_table_id]);

        // 4. update invoice floor/table
        $u3 = $pdo->prepare("
            UPDATE invoices 
               SET floor_id = ?, table_id = ?
             WHERE id = ?
        ");
        $u3->execute([$new_floor_id, $new_table_id, $invoice_id]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

/**
 * ==========================
 * Invoices
 * ==========================
 */

// fixed: no created_by column, only floor_id, table_id, usd_to_khr
function get_or_create_open_invoice(int $floor_id, int $table_id, int $rate): int {
    $pdo = db();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1) Try to find existing open invoice for this table
    $st = $pdo->prepare("
        SELECT id
          FROM invoices
         WHERE status = 'open'
           AND order_type = 'table'
           AND floor_id = ?
           AND table_id = ?
         ORDER BY id ASC
         LIMIT 1
    ");
    $st->execute([$floor_id, $table_id]);
    $existing_id = $st->fetchColumn();

    if ($existing_id) {
        return (int)$existing_id;
    }

    // 2) No open invoice -> create a new one
    $ins = $pdo->prepare("
        INSERT INTO invoices (
            order_type,
            floor_id,
            table_id,
            usd_to_khr,
            status,
            subtotal_usd,
            subtotal_khr,
            total_usd,
            total_khr,
            discount_pct,
            discount_amount_usd,
            discount_amount_khr
        ) VALUES (
            'table',
            ?, ?, ?, 'open',
            0.00, 0,
            0.00, 0,
            0,
            0.00, 0
        )
    ");
    $ins->execute([$floor_id, $table_id, $rate]);

    return (int)$pdo->lastInsertId();
}

/**
 * Recalc invoice totals.
 * - Sums invoice_items.line_total_* (already include item discount_pct)
 * - Uses REAL money discount (discount_amount_khr) as primary value
 */
function calc_totals(int $invoice_id): array {
    $pdo = db();

    // 1) sum all items (already include item-level discount_pct)
    $st = $pdo->prepare("
        SELECT 
          SUM(line_total_usd) AS su,
          SUM(line_total_khr) AS sk
        FROM invoice_items
        WHERE invoice_id = ?
    ");
    $st->execute([$invoice_id]);
    $s = $st->fetch() ?: ['su' => 0, 'sk' => 0];

    $subtotal_usd = (float)$s['su'];
    $subtotal_khr = (int)$s['sk'];

    // 2) load invoice discount info + rate
    $inv = $pdo->prepare("
        SELECT usd_to_khr,
               discount_pct,
               COALESCE(discount_amount_usd, 0)  AS discount_amount_usd,
               COALESCE(discount_amount_khr, 0)  AS discount_amount_khr
        FROM invoices
        WHERE id = ?
        LIMIT 1
    ");
    $inv->execute([$invoice_id]);
    $row = $inv->fetch();

    $rate = $row ? (int)$row['usd_to_khr'] : 4100;
    if ($rate <= 0) $rate = 4100;

    $discount_pct = $row ? (float)$row['discount_pct'] : 0.0;
    if ($discount_pct < 0)   $discount_pct = 0;
    if ($discount_pct > 100) $discount_pct = 100;

    // ❗ REAL money discount (KHR) – this is what user edits
    $discount_khr = $row ? (int)$row['discount_amount_khr'] : 0;

    // clamp between 0 and subtotal
    if ($discount_khr < 0)              $discount_khr = 0;
    if ($discount_khr > $subtotal_khr)  $discount_khr = $subtotal_khr;

    // keep USD side in sync (KHR is primary)
    $discount_usd = ($subtotal_khr > 0)
        ? round($discount_khr / $rate, 2)
        : 0.00;

    // 3) final totals
    $total_khr = $subtotal_khr - $discount_khr;
    if ($total_khr < 0) $total_khr = 0;

    $total_usd = $subtotal_usd - $discount_usd;
    if ($total_usd < 0) $total_usd = 0;

    // 4) update invoice
    $upd = $pdo->prepare("
        UPDATE invoices
           SET subtotal_usd        = ?,
               subtotal_khr        = ?,
               total_usd           = ?,
               total_khr           = ?,
               discount_pct        = ?,   -- keep % as-is
               discount_amount_usd = ?,
               discount_amount_khr = ?
         WHERE id = ?
    ");
    $upd->execute([
        $subtotal_usd,
        $subtotal_khr,
        $total_usd,
        $total_khr,
        $discount_pct,
        $discount_usd,
        $discount_khr,
        $invoice_id
    ]);

    return [
        'subtotal_usd'        => $subtotal_usd,
        'subtotal_khr'        => $subtotal_khr,
        'total_usd'           => $total_usd,
        'total_khr'           => $total_khr,
        'discount_pct'        => $discount_pct,
        'discount_amount_usd' => $discount_usd,
        'discount_amount_khr' => $discount_khr,
    ];
}

/**
 * Log a full snapshot of a pre-order print (items + totals) into receipt_print_logs.
 *
 * Call from pre-print:
 *    log_preorder_snapshot($invoiceId, (int)$user['id']);
 */
function log_preorder_snapshot(int $invoice_id, int $user_id): void {
    $pdo = db();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Ensure invoice totals are in sync with items
    $tot = calc_totals($invoice_id);

    // Load invoice row (for stored totals, if present)
    $stInv = $pdo->prepare("
        SELECT id,
               usd_to_khr,
               subtotal_usd,
               subtotal_khr,
               discount_amount_usd,
               discount_amount_khr,
               total_usd,
               total_khr
        FROM invoices
        WHERE id = ?
        LIMIT 1
    ");
    $stInv->execute([$invoice_id]);
    $inv = $stInv->fetch(PDO::FETCH_ASSOC);
    if (!$inv) {
        return;
    }

    // Load invoice items with product names
    $stItems = $pdo->prepare("
        SELECT ii.*, p.name
        FROM invoice_items ii
        LEFT JOIN products p ON p.id = ii.product_id
        WHERE ii.invoice_id = ?
        ORDER BY ii.id ASC
    ");
    $stItems->execute([$invoice_id]);
    $rows = $stItems->fetchAll(PDO::FETCH_ASSOC);

    $items = [];
    foreach ($rows as $row) {
        $qty      = (int)($row['qty'] ?? 0);
        $priceUsd = (float)($row['price_usd'] ?? 0);
        $priceKhr = (int)($row['price_khr'] ?? 0);
        $discPct  = isset($row['discount_pct']) ? (float)$row['discount_pct'] : 0.0;

        // Net line totals after discount – use stored columns if exist
        if (isset($row['line_total_usd'])) {
            $lineUsd = (float)$row['line_total_usd'];
        } else {
            $lineUsd = $qty * $priceUsd * (1 - $discPct / 100);
        }

        if (isset($row['line_total_khr'])) {
            $lineKhr = (int)$row['line_total_khr'];
        } else {
            $lineKhr = (int)round($qty * $priceKhr * (1 - $discPct / 100));
        }

        $items[] = [
            'name'           => $row['name'] ?? '',
            'qty'            => $qty,
            'price_usd'      => $priceUsd,
            'price_khr'      => $priceKhr,
            'discount_pct'   => $discPct,
            'line_total_usd' => $lineUsd,
            'line_total_khr' => $lineKhr,
        ];
    }

    // Prefer values from invoice row if present, otherwise from calc_totals()
    $subtotal_usd = isset($inv['subtotal_usd'])        ? (float)$inv['subtotal_usd']        : (float)($tot['subtotal_usd']        ?? 0);
    $subtotal_khr = isset($inv['subtotal_khr'])        ? (int)$inv['subtotal_khr']          : (int)  ($tot['subtotal_khr']        ?? 0);
    $discount_usd = isset($inv['discount_amount_usd']) ? (float)$inv['discount_amount_usd'] : (float)($tot['discount_amount_usd'] ?? 0);
    $discount_khr = isset($inv['discount_amount_khr']) ? (int)$inv['discount_amount_khr']   : (int)  ($tot['discount_amount_khr'] ?? 0);
    $total_usd    = isset($inv['total_usd'])           ? (float)$inv['total_usd']           : (float)($tot['total_usd']           ?? 0);
    $total_khr    = isset($inv['total_khr'])           ? (int)$inv['total_khr']             : (int)  ($tot['total_khr']           ?? 0);

    $snapshot = [
        'items'        => $items,
        'subtotal_usd' => $subtotal_usd,
        'subtotal_khr' => $subtotal_khr,
        'discount_usd' => $discount_usd,
        'discount_khr' => $discount_khr,
        'total_usd'    => $total_usd,
        'total_khr'    => $total_khr,
    ];

    $json = json_encode($snapshot, JSON_UNESCAPED_UNICODE);

    $printed_at = now_local();

    $stIns = $pdo->prepare("
        INSERT INTO receipt_print_logs (invoice_id, print_type, user_id, printed_at, items_json)
        VALUES (?, 'preorder', ?, ?, ?)
    ");
    $stIns->execute([
        $invoice_id,
        $user_id,
        $printed_at,
        $json,
    ]);
}

/**
 * ==========================
 * Categories
 * ==========================
 */
function get_categories(bool $only_active = true): array {
  $sql = "SELECT * FROM categories";
  if ($only_active) $sql .= " WHERE is_active=1";
  $sql .= " ORDER BY name";
  return db()->query($sql)->fetchAll();
}

function get_category(int $id): ?array {
  $st = db()->prepare("SELECT * FROM categories WHERE id=?");
  $st->execute([$id]);
  $row = $st->fetch();
  return $row ?: null;
}

function create_category(string $name): int {
  $name = trim($name);
  if ($name === '') throw new Exception("Category name is required.");
  $st = db()->prepare("INSERT INTO categories(name) VALUES (?)");
  $st->execute([$name]);
  return (int)db()->lastInsertId();
}

function update_category(int $id, string $name): bool {
  $name = trim($name);
  if ($name === '') throw new Exception("Category name is required.");
  $st = db()->prepare("UPDATE categories SET name=? WHERE id=?");
  return $st->execute([$name, $id]);
}

function disable_category(int $id): bool {
  $st = db()->prepare("UPDATE categories SET is_active=0 WHERE id=?");
  return $st->execute([$id]);
}

/**
 * ==========================
 * Products
 * ==========================
 */
function get_products_by_category(?int $category_id = null): array {
  if ($category_id === null) {
    return db()->query("SELECT * FROM products WHERE is_active=1 ORDER BY id DESC")->fetchAll();
  }
  $st = db()->prepare("SELECT * FROM products WHERE category_id=? AND is_active=1 ORDER BY id DESC");
  $st->execute([$category_id]);
  return $st->fetchAll();
}

function set_product_category(int $product_id, ?int $category_id): bool {
  $st = db()->prepare("UPDATE products SET category_id=? WHERE id=?");
  return $st->execute([$category_id, $product_id]);
}

/**
 * ==========================
 * Open Business
 * ==========================
 */

// --- BUSINESS SESSION HELPERS ---

function get_business_status() {
    // Return current open business session row, or false if none.
    $pdo = db();
    $st  = $pdo->query("
        SELECT *
        FROM business_sessions
        WHERE status = 'open'
        ORDER BY opened_at DESC
        LIMIT 1
    ");
    return $st->fetch();
}

function require_business_open() {
    if (!get_business_status()) {
        // If no session open, force go to open business page
        redirect('open_business.php');
    }
}

/**
 * Create new business session (open business) with opening reserve cash.
 * Uses now_local() so opened_at / closed_at follow Asia/Phnom_Penh.
 */
function open_business_session(float $cash_usd, int $cash_khr): int {
    $pdo  = db();
    $user = current_user();

    // auto close any leftover open sessions (safety) with local time
    $now = now_local();
    $st  = $pdo->prepare("
        UPDATE business_sessions
           SET status='closed', closed_at=?
         WHERE status='open'
    ");
    $st->execute([$now]);

    // open new session with local time
    $opened_at = now_local();
    $st = $pdo->prepare("
        INSERT INTO business_sessions
          (opened_at, opened_by, opening_cash_usd, opening_cash_khr, status)
        VALUES (?, ?, ?, ?, 'open')
    ");
    $st->execute([$opened_at, $user['id'], $cash_usd, $cash_khr]);

    return (int)$pdo->lastInsertId();
}

/**
 * Old business_day flags (optional, if you still use them).
 * Also switched to now_local() for consistent local time.
 */
function open_business($user_id) {
    $pdo = db();
    $pdo->prepare("UPDATE business_day SET is_open=0 WHERE is_open=1")->execute();

    $now = now_local();
    $st  = $pdo->prepare("
        INSERT INTO business_day (open_at, opened_by, is_open)
        VALUES (?, ?, 1)
    ");
    $st->execute([$now, $user_id]);
}

function close_business($user_id) {
    $pdo = db();
    $now = now_local();
    $st  = $pdo->prepare("
        UPDATE business_day
           SET close_at=?, closed_by=?, is_open=0
         WHERE is_open=1
    ");
    $st->execute([$now, $user_id]);
}

/* ==========================
 * Telegram + PDF helpers
 * ========================== */

/**
 * Send plain text message to Telegram group.
 */
function telegram_send_message(string $text): bool {
    // Check if curl is available
    if (!function_exists('curl_init')) {
        error_log('Telegram sendMessage error: cURL extension is not enabled');
        return false;
    }

    $botToken = getenv('TELEGRAM_BOT_TOKEN') ?: '';
    $chatId   = getenv('TELEGRAM_CHAT_ID') ?: '';

    if ($botToken === '' || $chatId === '') {
        error_log('Telegram configuration is missing');
        return false;
    }

    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";

    $postFields = [
        'chat_id' => $chatId,
        'text'    => $text,
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $postFields,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT        => 30,
    ]);
    $response = curl_exec($ch);
    if ($response === false) {
        error_log('Telegram sendMessage error: '.curl_error($ch));
        curl_close($ch);
        return false;
    }
    curl_close($ch);

    $data = json_decode($response, true);
    if (!isset($data['ok']) || !$data['ok']) {
        error_log('Telegram sendMessage API error: '.$response);
        return false;
    }
    return true;
}

/**
 * Send a document (PDF) to Telegram group.
 */
function telegram_send_document(string $filePath, string $caption = ''): bool {
    // Check if curl is available
    if (!function_exists('curl_init')) {
        error_log('Telegram sendDocument error: cURL extension is not enabled');
        return false;
    }

    if (!file_exists($filePath)) {
        error_log("telegram_send_document: file not found: $filePath");
        return false;
    }

    $botToken = getenv('TELEGRAM_BOT_TOKEN') ?: '';
    $chatId   = getenv('TELEGRAM_CHAT_ID') ?: '';

    if ($botToken === '' || $chatId === '') {
        error_log('Telegram configuration is missing');
        return false;
    }

    $url = "https://api.telegram.org/bot{$botToken}/sendDocument";

    $postFields = [
        'chat_id'  => $chatId,
        'caption'  => $caption,
        'document' => new CURLFile($filePath)
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $postFields,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT        => 60,
    ]);

    $response = curl_exec($ch);
    if ($response === false) {
        error_log('Telegram sendDocument error: '.curl_error($ch));
        curl_close($ch);
        return false;
    }
    curl_close($ch);

    $data = json_decode($response, true);
    if (!isset($data['ok']) || !$data['ok']) {
        error_log('Telegram sendDocument API error: '.$response);
        return false;
    }

    return true;
}

/* ==========================
 * wkhtmltopdf helpers (Linux + Windows)
 * ========================== */

/**
 * Get wkhtmltopdf binary path for Linux/Windows.
 */
function wkhtmltopdf_bin(): string {
    // PHP_OS_FAMILY is "Windows", "Linux", "Darwin", etc.
    if (PHP_OS_FAMILY === 'Windows') {

        // Common install paths on Windows
        $candidates = [
            'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe',
            'C:\Program Files (x86)\wkhtmltopdf\bin\wkhtmltopdf.exe',
        ];

        foreach ($candidates as $p) {
            if (file_exists($p)) {
                // Wrap in quotes because of space in "Program Files"
                return '"' . $p . '"';
            }
        }

        // Fallback: assume it's in PATH
        return 'wkhtmltopdf.exe';
    }

    // Linux / others – assume available in PATH
    return 'wkhtmltopdf';
}

// Generate target path + filename for invoice PDF
function invoice_pdf_target_path(int $invoice_id): array
{
    $invoice_id = max(1, $invoice_id);
    $filename   = 'invoice_' . $invoice_id . '_' . date('Ymd_His') . '.pdf';
    $dir        = sys_get_temp_dir();   // or a custom folder like __DIR__.'/../storage/pdf'
    $path       = $dir . DIRECTORY_SEPARATOR . $filename;

    return [$path, $filename];
}

/**
 * Generate PDF from URL using wkhtmltopdf.
 * Support optional cookie (for PHP session).
 *
 *  - $cookieName / $cookieValue can be used like:
 *      generate_pdf_from_url($url, $target, 'PHPSESSID', session_id());
 */
function generate_pdf_from_url(
    string $url,
    string $targetPath,
    ?string $cookieName = null,
    ?string $cookieValue = null
): bool {
    // Make sure directory exists
    $dir = dirname($targetPath);
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }

    $wk  = wkhtmltopdf_bin();
    $cmd = $wk . " ";

    if ($cookieName !== null && $cookieValue !== null) {
        $cmd .= "--cookie "
             .  escapeshellarg($cookieName) . " "
             .  escapeshellarg($cookieValue) . " ";
    }

    $cmd .= escapeshellarg($url) . " " . escapeshellarg($targetPath) . " 2>&1";

    $output = shell_exec($cmd);
    error_log('wkhtmltopdf(url) cmd: '.$cmd.' => '.$output);

    return file_exists($targetPath) && filesize($targetPath) > 0;
}

/**
 * Generate PDF from raw HTML using wkhtmltopdf.
 */
function generate_pdf_from_html(string $html, string $targetPath): bool {
    $dir = dirname($targetPath);
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }

    $tmpHtml = tempnam(sys_get_temp_dir(), 'closing_') . '.html';
    file_put_contents($tmpHtml, $html);

    $wk  = wkhtmltopdf_bin();
    $cmd = $wk . " " . escapeshellarg($tmpHtml) . " " . escapeshellarg($targetPath) . " 2>&1";
    $output = shell_exec($cmd);
    error_log('wkhtmltopdf(html) output: '.$cmd.' => '.$output);

    @unlink($tmpHtml);

    return file_exists($targetPath) && filesize($targetPath) > 0;
}

/**
 * Helper: build target path + filename for closing report PDF (Linux + Windows)
 */
function closing_pdf_target_path(int $sessionId): array {
    // Folder under project: /storage/closing
    $dir = dirname(__DIR__, 2) . '/storage/closing';

    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }

    // Filename: " report 19_20251116_034726.pdf"
    $filename   = ' report ' . $sessionId . '_' . date('Ymd_His') . '.pdf';
    $targetPath = $dir . DIRECTORY_SEPARATOR . $filename;

    return [$targetPath, $filename];
}

/**
 * ==========================
 * Sale merge helper
 * ==========================
 */
function merge_sales(int $source_sale_id, int $target_sale_id) {
  if ($source_sale_id === $target_sale_id) {
    throw new Exception("Cannot merge same invoice.");
  }
  $pdo = db();
  $pdo->beginTransaction();
  try {
    $check = $pdo->prepare("SELECT id FROM invoices WHERE id=? AND status='open'");
    $check->execute([$source_sale_id]);
    if (!$check->fetch()) throw new Exception("Source invoice not open.");
    $check->execute([$target_sale_id]);
    if (!$check->fetch()) throw new Exception("Target invoice not open.");

    $move = $pdo->prepare("UPDATE invoice_items SET invoice_id=? WHERE invoice_id=?");
    $move->execute([$target_sale_id, $source_sale_id]);

    calc_totals($target_sale_id);

    $pdo->prepare("UPDATE invoices SET status='void' WHERE id=?")
        ->execute([$source_sale_id]);

    $pdo->commit();
    return true;
  } catch (Exception $e) {
    $pdo->rollBack();
    throw $e;
  }
}

/** Load settings used by receipt (now includes logo) */
function receipt_settings(): array {
  $s = get_settings();
  return [
    'title'         => $s['receipt_title']     ?? ($s['company_name'] ?? 'TFC POS'),
    'company_name'  => $s['company_name']      ?? 'TFC POS',
    'address'       => $s['company_address']   ?? 'Phnom Penh',
    'tel'           => $s['company_tel']       ?? '081 900 288',
    'rate'          => (int)($s['usd_to_khr']  ?? 4100),
    'show_rate'     => (int)($s['show_exchange_rate'] ?? 1),
    'wifi'          => $s['wifi_password']     ?? '',
    'footer_kh'     => $s['receipt_footer_kh'] ?? 'Thank you! សូមអរគុណ',
    'logo'          => $s['receipt_logo']      ?? '',   // logo URL (optional)
  ];
}

/** Render the 80mm receipt HTML (shows discount, receive, change, etc.) */
function render_receipt_html(array $invoice, array $items, array $cfg, bool $auto=false): string {
    $is_paid = ($invoice['status'] ?? '') === 'paid';

    $rate = (int)($invoice['usd_to_khr'] ?? $cfg['rate'] ?? 4100);
    if ($rate <= 0) $rate = 4100;

    $created_at = $invoice['created_at'] ?? '';
    $paid_at    = $invoice['paid_at']    ?? '';

    $floor_label = $invoice['floor_name'] ?? '—';
    $table_label = $invoice['table_no']   ?? '—';

    // subtotal = after item discount, before whole discount
    $subtotal_usd = (float)($invoice['subtotal_usd'] ?? 0);
    $subtotal_khr = (int)  ($invoice['subtotal_khr'] ?? 0);

    // total = after whole discount
    $total_usd    = (float)($invoice['total_usd']    ?? 0);
    $total_khr    = (int)  ($invoice['total_khr']    ?? 0);

    // --- DISCOUNTS ---
    // invoice-level discount (whole bill, after items)
    $invoice_discount_khr = max(0, $subtotal_khr - $total_khr);
    $invoice_discount_usd = $invoice_discount_khr / $rate;

    // we will sum item-level discounts while rendering rows
    $item_discounts_khr = 0;

    // Cash / change
    $cash_usd = (float)($invoice['cash_in_usd'] ?? 0);
    $cash_khr = (int)  ($invoice['cash_in_khr'] ?? 0);
    $chg_usd  = (float)($invoice['change_usd']  ?? 0);
    $chg_khr  = (int)  ($invoice['change_khr']  ?? 0);

    $pay_method   = $invoice['pay_method']   ?? '';
    $pay_currency = $invoice['pay_currency'] ?? '';
    $qr_ref       = $invoice['qr_ref']       ?? '';

    // For display: total receive & change converted to KHR + USD
    if ($pay_method === 'qr') {
        // QR: assume paid exactly total
        $receive_khr    = $total_khr;
        $receive_usd_eq = $total_usd;
        $change_khr     = 0;
        $change_usd_eq  = 0.0;
    } else {
        // Cash: combine both currencies
        $receive_khr    = $cash_khr + usd_to_khr_value($cash_usd, $rate);
        $receive_usd_eq = $receive_khr / $rate;

        $change_khr     = $chg_khr + usd_to_khr_value($chg_usd, $rate);
        $change_usd_eq  = $change_khr / $rate;
    }

    // Decide whether to show change row (only if receive > total)
    $show_change_row = false;
    if ($is_paid && $receive_khr > $total_khr) {
        $show_change_row = true;
    }

    ob_start(); ?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt #<?= (int)$invoice['id'] ?></title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    body {
      margin:0;
      padding:8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas,
                   "Liberation Mono", monospace;
    }
    .ticket { width: 76mm; margin: 0 auto; }
    .center { text-align:center; }
    .bold { font-weight:700; }
    .big { font-size: 22px; letter-spacing: 1px; }
    .sm { font-size: 12px; }
    .xs { font-size: 11px; }
    .line { margin:6px 0; border-top:1px solid #000; }
    .dash { margin:6px 0; border-top:1px dashed #000; }
    .noprint { margin-top:10px; }

    table { border-collapse:collapse; width:100%; }
    .tbl-border td, .tbl-border th {
      border:1px solid #000;
      padding:2px 3px;
    }
    .tbl-border th {
      text-align:center;
    }
    .summary-row {
      display:flex;
      justify-content:space-between;
      font-size:12px;
      margin:2px 0;
    }

    @media print {
      .noprint { display:none; }
      body { padding:0; }
    }
    button { padding:6px 10px; }
  </style>
</head>
<body>
  <div class="ticket">
    <?php if (!empty($cfg['logo'])): ?>
      <div class="center">
        <img src="<?= htmlspecialchars($cfg['logo']) ?>"
             style="max-width:50mm; max-height:25mm;">
      </div>
    <?php endif; ?>

    <div class="center big bold"><?= htmlspecialchars($cfg['title']) ?></div>

    <div class="center sm"><?= htmlspecialchars($cfg['address']) ?></div>
    <div class="center sm">tel: <?= htmlspecialchars($cfg['tel']) ?></div>

    <div class="sm" style="margin-top:6px;">
      <div>លេខតុ:  <?= htmlspecialchars($floor_label) ?>/<?= htmlspecialchars($table_label) ?></div>
      <div>លេខរៀង:  #<?= (int)$invoice['id'] ?></div>
      <div>ម៉ោងចូល: <?= htmlspecialchars($created_at) ?></div>
      <div>ម៉ោងចេញ: <?= htmlspecialchars($paid_at) ?></div>
      <div>អ្នកគិតលុយ: <?= htmlspecialchars($_SESSION['user']['username'] ?? '—') ?></div>
    </div>

    <?php if ($cfg['show_rate']): ?>
      <div class="center sm">
        អត្រាប្តូរប្រាក់&nbsp;&nbsp;1$ = <?= number_format($rate) ?>៛
      </div>
    <?php endif; ?>

    <!-- ITEMS TABLE -->
    <table class="tbl-border sm">
      <thead>
        <tr>
          <th>ទំនិញ</th>
          <th>ចំនួន</th>
          <th>តម្លៃ</th>
          <th>%</th>
          <th>សរុប</th>
        </tr>
      </thead>
      <tbody>
      <?php if ($items): ?>
        <?php foreach ($items as $r):
          $qty = (int)($r['qty'] ?? 0);

          // Base price in KHR (per unit)
          $price_khr = isset($r['price_khr'])
                       ? (int)$r['price_khr']
                       : usd_to_khr_value((float)($r['price_usd'] ?? 0), $rate);

          // Total after discount (already stored)
          $line_khr  = isset($r['line_total_khr'])
                       ? (int)$r['line_total_khr']
                       : $price_khr * $qty;

          // Original (no discount) for this item
          $original_khr = $price_khr * $qty;

          // Item-level discount (original - after)
          $item_disc_khr = max(0, $original_khr - $line_khr);
          $item_discounts_khr += $item_disc_khr;

          $discount_pct = isset($r['discount_pct']) ? (float)$r['discount_pct'] : 0;
          $discount_pct_str = rtrim(rtrim(number_format($discount_pct,2), '0'), '.');
        ?>
          <tr>
            <td><?= htmlspecialchars($r['name'] ?? '') ?></td>
            <td style="text-align:center;"><?= $qty ?></td>
            <td style="text-align:right;"><?= number_format($price_khr) ?>៛</td>
            <td style="text-align:center;"><?= $discount_pct_str ?>%</td>
            <td style="text-align:right;"><?= number_format($line_khr) ?>៛</td>
          </tr>
        <?php endforeach; ?>
      <?php else: ?>
        <tr><td colspan="5" class="center">No items</td></tr>
      <?php endif; ?>
      </tbody>
    </table>

    <?php
      // TOTAL DISCOUNT (item + invoice)
      $total_discount_khr = $item_discounts_khr + $invoice_discount_khr;
      $total_discount_usd = $total_discount_khr / $rate;

      // ORIGINAL TOTAL BEFORE ANY DISCOUNT:
      //   original = final total + all discounts
      $original_khr = $total_khr + $total_discount_khr;
      $original_usd = $original_khr / $rate;
    ?>

    <div style="height:6px;"></div>

    <!-- TOTAL / DISCOUNT / PAYMENT -->
    <div class="summary-row">
      <span>សរុប</span>
      <span><?= number_format($original_khr) ?>៛ = $<?= number_format($original_usd, 2) ?></span>
    </div>
    <div class="summary-row">
      <span>បញ្ចុះតម្លៃ</span>
      <span><?= number_format($total_discount_khr) ?>៛ = $<?= number_format($total_discount_usd, 2) ?></span>
    </div>
    <div class="summary-row">
      <span>ទឹកប្រាក់ត្រូវបង់</span>
      <span><?= number_format($total_khr) ?>៛ = $<?= number_format($total_usd, 2) ?></span>
    </div>

    <?php if ($is_paid): ?>
      <div class="summary-row">
        <span>បានបង់</span>
        <span><?= number_format($receive_khr) ?>៛ = $<?= number_format($receive_usd_eq, 2) ?></span>
      </div>

      <?php if ($show_change_row): ?>
        <div class="summary-row">
          <span>លុយអាប់</span>
          <span><?= number_format($change_khr) ?>៛ = $<?= number_format($change_usd_eq, 2) ?></span>
        </div>
      <?php endif; ?>
    <?php endif; ?>

    <?php if (!empty($cfg['wifi'])): ?>
      <div class="center sm">WIFI: <?= htmlspecialchars($cfg['wifi']) ?></div>
    <?php endif; ?>
    <div class="center sm"><?= htmlspecialchars($cfg['footer_kh']) ?></div>

    <div class="center noprint">
      <button onclick="window.print()">Print</button>
      <a href="index.php"><button type="button">Back</button></a>
    </div>
  </div>

  <?php if ($auto): ?>
  <script>
    window.onload = () => { window.print(); };
  </script>
  <?php endif; ?>
</body>
</html>
<?php
    return ob_get_clean();
}

/* ==========================
 * Closing report helpers
 * ==========================
 */

/**
 * Render closing report HTML (used by print_closing_report.php and PDF generator).
 *
 * @param array $bs        business_sessions row + (optional) opened_by_name, closed_by_name
 * @param array $settings  settings from get_settings()
 * @param bool  $autoPrint if true, add window.print() & auto-close script
 */
function render_closing_report_html(array $bs, array $settings, bool $autoPrint = false): string {
    $company = $settings['company_name'] ?? 'TFC POS';

    // --- Numbers from session ---
    $opening_usd       = (float)($bs['opening_cash_usd']  ?? 0);
    $opening_khr       = (int)  ($bs['opening_cash_khr']  ?? 0);
    $expected_cash_usd = (float)($bs['expected_cash_usd'] ?? 0);
    $expected_cash_khr = (int)  ($bs['expected_cash_khr'] ?? 0);
    $expected_qr_usd   = (float)($bs['expected_qr_usd']   ?? 0);
    $expected_qr_khr   = (int)  ($bs['expected_qr_khr']   ?? 0);
    $closing_cash_usd  = (float)($bs['closing_cash_usd']  ?? 0);
    $closing_cash_khr  = (int)  ($bs['closing_cash_khr']  ?? 0);
    $closing_qr_usd    = (float)($bs['closing_qr_usd']    ?? 0);
    $closing_qr_khr    = (int)  ($bs['closing_qr_khr']    ?? 0);

    // --- Total cash from sales (this session) = net cash from sales ---
    $net_cash_usd = $expected_cash_usd - $opening_usd;
    $net_cash_khr = $expected_cash_khr - $opening_khr;

    // --- Total Amount (Reserve + Cash sales + QR sales) ---
    $total_amount_usd = $opening_usd + $net_cash_usd + $expected_qr_usd;
    $total_amount_khr = $opening_khr + $net_cash_khr + $expected_qr_khr;
    // = expected_cash_usd + expected_qr_usd, expected_cash_khr + expected_qr_khr

    // --- Difference (counted - expected) ---
    $diff_cash_usd = $closing_cash_usd - $expected_cash_usd;
    $diff_cash_khr = $closing_cash_khr - $expected_cash_khr;
    $diff_qr_usd   = $closing_qr_usd   - $expected_qr_usd;
    $diff_qr_khr   = $closing_qr_khr   - $expected_qr_khr;

    // --- Display names for open/close cashier ---
    $opened_display = '-';
    if (!empty($bs['opened_by_name'])) {
        $opened_display = $bs['opened_by_name'];
    } elseif (!empty($bs['opened_by'])) {
        $opened_display = (string)$bs['opened_by'];
    }

    $closed_display = '-';
    if (!empty($bs['closed_by_name'])) {
        $closed_display = $bs['closed_by_name'];
    } elseif (!empty($bs['closed_by'])) {
        $closed_display = (string)$bs['closed_by'];
    }

    $opened_at = $bs['opened_at'] ?? '';
    $closed_at = $bs['closed_at'] ?? '';

    // small helper for label/value rows
    $line = function(string $label, string $value): string {
        return "<div style='display:flex;justify-content:space-between'>
                    <span>{$label}</span><span>{$value}</span>
                </div>";
    };

    ob_start();
    ?>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Closing Report</title>
<style>
body {
    font-family: monospace;
    padding: 10px;
    width: 280px; /* thermal printer width */
}
h3, h4 {
    text-align: center;
    margin: 0;
    padding: 0;
}
.small-center {
    text-align:center;
    font-size:12px;
    margin-bottom:2px;
}
.divider {
    border-top: 1px dashed #000;
    margin: 8px 0;
}
.section-title {
    font-weight:bold;
    margin:2px 0;
}
.block {
    margin-bottom:4px;
}
</style>
</head>
<body>

<!-- Company name -->
<h3><?= htmlspecialchars($company) ?></h3>

<div class="divider"></div>

<!-- Cashier (Open / Close) -->
<div class="small-center">
  ឈ្មោះអ្នកបើកបញ្ជី: <?= htmlspecialchars($opened_display) ?>
</div>
<div class="small-center">
  ឈ្មោះអ្នកបិទបញ្ជី: <?= htmlspecialchars($closed_display) ?>
</div>

<div class="divider"></div>

<!-- Closing Report title -->
<h4>របាយការណ៍</h4>

<div class="divider"></div>

<!-- Opened / Closed -->
<div class="block">
  <?= $line("ម៉ោងបើក", htmlspecialchars($opened_at)) ?>
  <?= $line("ម៉ោងបិទ", htmlspecialchars($closed_at)) ?>
</div>

<div class="divider"></div>

<!-- Total cash from sales (this session) (net cash) -->
<div class="section-title">សរុបលុបលក់បាន:</div>
<div class="block">
  <?= $line("", number_format($net_cash_usd, 2)." USD") ?>
  <?= $line(" ", number_format($net_cash_khr)." ៛ KHR") ?>
</div>

<div class="divider"></div>

<!-- Total Amount QR from sale (Bank / KHQR) (QR total) -->
<div class="section-title">សរុបលុយបានពី​ QR(Bank / KHQR)</div>
<div class="block">
  <div>លុយបានពី​ QR:</div>
  <?= $line("", number_format($expected_qr_usd, 2)." USD") ?>
  <?= $line(" ", number_format($expected_qr_khr)." ៛ KHR") ?>
</div>

<div class="divider"></div>

<!-- Reserve Cash (Drawer) (opening reserve) -->
<div class="section-title">ដែលដាក់លុយបម្រុង</div>
<div class="block">
  <div>ចំនួនលុយ:</div>
  <?= $line("$", number_format($opening_usd, 2)." USD") ?>
  <?= $line(" ", number_format($opening_khr)." ៛ KHR") ?>
</div>

<div class="divider"></div>

<!-- Total Amount (KHR & USD = Reserve + Cash Sales + QR) -->
<div class="section-title">Total Amount</div>
<div class="block">
  <?= $line(
        "Total:",
        "$".number_format($total_amount_usd, 2)." / ".number_format($total_amount_khr)." ៛"
  ) ?>
</div>

<div class="divider"></div>

<!-- Business is now CLOSED -->
<div class="block">
  <div>បានបិទបញ្ជី.</div>
</div>

<div class="divider"></div>

<?php if (!empty($bs['note'])): ?>
  <div class="divider"></div>
  <div class="section-title">Note</div>
  <p><?= nl2br(htmlspecialchars($bs['note'])) ?></p>
<?php endif; ?>

<p style="text-align:center;">Thank you!</p>

<?php if ($autoPrint): ?>
<script>
window.print();
setTimeout(() => window.close(), 1000);
</script>
<?php endif; ?>

</body>
</html>
<?php
    return ob_get_clean();
}

/**
 * Recalculate all products.price_usd from products.price_khr
 * based on the current exchange rate.
 *
 * 1 USD = $rate KHR
 */
function recalc_all_products_price_usd_from_khr(int $rate): void {
    if ($rate <= 0) {
        return; // safety
    }

    $pdo = db();
    $sql = "UPDATE products
            SET price_usd = ROUND(price_khr / ?, 2)
            WHERE price_khr IS NOT NULL AND price_khr > 0";
    $st  = $pdo->prepare($sql);
    $st->execute([$rate]);
}
