<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$invoice_id = (int)($_POST['invoice_id'] ?? 0);
if (!$invoice_id) redirect('index.php');

// From sale form
$pay_method   = $_POST['pay_method'] ?? 'cash';  // 'cash' or 'qr'
$qr_ref       = trim($_POST['qr_ref'] ?? '');    // QR reference (optional)
// QR currency (from radio): QR USD / QR KHR
$qr_currency  = ($_POST['qr_currency'] ?? 'USD') === 'KHR' ? 'KHR' : 'USD';

// Cash amounts (used when pay_method = cash)
$cash_in_usd = (float)($_POST['cash_in_usd'] ?? 0);
$cash_in_khr = (int)($_POST['cash_in_khr'] ?? 0);

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Load invoice
$st = $pdo->prepare("SELECT * FROM invoices WHERE id=?");
$st->execute([$invoice_id]);
$inv = $st->fetch();
if (!$inv) {
    redirect('index.php');
}

// Use stored rate on invoice
$rate = (int)$inv['usd_to_khr'];

// Always recalc BEFORE reading amounts (so it includes any new discounts)
calc_totals($invoice_id);

// IMPORTANT: use TOTAL (after item + whole discount), not SUBTOTAL
$st = $pdo->prepare("SELECT total_usd, total_khr FROM invoices WHERE id=?");
$st->execute([$invoice_id]);
$t = $st->fetch();

$due_usd = (float)($t['total_usd'] ?? 0);
$due_khr = (int)($t['total_khr'] ?? 0);

// Get current cashier (logged-in user)
$cashier_id = null;
if (function_exists('current_user')) {
    $u = current_user();
    if (is_array($u) && !empty($u['id'])) {
        $cashier_id = (int)$u['id'];
    }
}

if ($pay_method === 'qr') {
    // ==========================
    //        QR PAYMENT
    // ==========================
    // Use QR currency selection to mark pay_currency = 'USD' or 'KHR'
    $upd = $pdo->prepare("
        UPDATE invoices
        SET status       = 'paid',
            cashier_id   = ?,
            pay_method   = 'qr',
            pay_currency = ?,           -- 'USD' or 'KHR' from QR radio
            qr_ref       = ?,
            cash_in_usd  = 0,
            cash_in_khr  = 0,
            change_usd   = 0,
            change_khr   = 0,
            total_usd    = ?,           -- keep the final total here
            total_khr    = ?,           -- same as due_khr
            paid_at      = NOW()
        WHERE id = ?
    ");
    $upd->execute([
        $cashier_id,
        $qr_currency,
        $qr_ref,
        $due_usd,
        $due_khr,
        $invoice_id
    ]);

} else {
    // ==========================
    //        CASH PAYMENT
    // ==========================
    // Auto-detect pay currency:
    // - If only KHR given → treat as KHR
    // - Otherwise default to USD (can mix both)
    $pay_currency = ($cash_in_khr > 0 && $cash_in_usd == 0) ? 'KHR' : 'USD';

    if ($pay_currency === 'USD') {
        $effective_rate = max(1, $rate);
        $paid_usd   = $cash_in_usd + ($cash_in_khr > 0 ? ($cash_in_khr / $effective_rate) : 0);
        $change_usd = max(0, $paid_usd - $due_usd);

        $upd = $pdo->prepare("
            UPDATE invoices
            SET status       = 'paid',
                cashier_id   = ?,
                pay_method   = 'cash',
                pay_currency = 'USD',
                qr_ref       = NULL,
                cash_in_usd  = ?,
                cash_in_khr  = ?,
                change_usd   = ?,
                change_khr   = 0,
                total_usd    = ?,   -- final total after discounts
                total_khr    = ?,   -- for reference / printing
                paid_at      = NOW()
            WHERE id = ?
        ");
        $upd->execute([
            $cashier_id,
            $cash_in_usd,
            $cash_in_khr,
            $change_usd,
            $due_usd,
            $due_khr,
            $invoice_id
        ]);

    } else {
        $paid_khr   = $cash_in_khr + ($cash_in_usd > 0 ? usd_to_khr_value($cash_in_usd, $rate) : 0);
        $change_khr = max(0, $paid_khr - $due_khr);

        $upd = $pdo->prepare("
            UPDATE invoices
            SET status       = 'paid',
                cashier_id   = ?,
                pay_method   = 'cash',
                pay_currency = 'KHR',
                qr_ref       = NULL,
                cash_in_usd  = ?,
                cash_in_khr  = ?,
                change_usd   = 0,
                change_khr   = ?,
                total_usd    = ?,   -- final total after discounts
                total_khr    = ?,   -- for reference / printing
                paid_at      = NOW()
            WHERE id = ?
        ");
        $upd->execute([
            $cashier_id,
            $cash_in_usd,
            $cash_in_khr,
            $change_khr,
            $due_usd,
            $due_khr,
            $invoice_id
        ]);
    }
}

// free table
$pdo->prepare("
    UPDATE tables t
    JOIN invoices i ON i.table_id = t.id
    SET t.status='free'
    WHERE i.id=?
")->execute([$invoice_id]);

// Redirect to printable receipt with auto print
header("Location: print_receipt.php?invoice_id=".$invoice_id."&auto=1");
exit;
