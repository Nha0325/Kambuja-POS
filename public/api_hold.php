<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$action     = $_POST['action'] ?? '';
$invoice_id = (int)($_POST['invoice_id'] ?? 0);

if (!$invoice_id) {
    redirect('index.php');
}

switch ($action) {

    case 'add':
        $product_id = (int)($_POST['product_id'] ?? 0);
        $qty        = max(1, (int)($_POST['qty'] ?? 1));

        if ($product_id > 0) {
            // load product
            $st = $pdo->prepare("SELECT id, name, price_usd, price_khr FROM products WHERE id=? AND is_active=1");
            $st->execute([$product_id]);
            $p = $st->fetch();

            if ($p) {
                $name      = $p['name'];
                $price_usd = (float)$p['price_usd'];
                $price_khr = (int)$p['price_khr'];

                $line_total_usd = $price_usd * $qty;
                $line_total_khr = $price_khr * $qty;

                $ins = $pdo->prepare("
                  INSERT INTO invoice_items
                    (invoice_id, product_id, name, qty, price_usd, price_khr,
                     discount_pct, line_total_usd, line_total_khr)
                  VALUES (?,?,?,?,?,?,?,?,?)
                ");
                $ins->execute([
                    $invoice_id,
                    $product_id,
                    $name,
                    $qty,
                    $price_usd,
                    $price_khr,
                    0,                 // discount_pct
                    $line_total_usd,
                    $line_total_khr
                ]);

                calc_totals($invoice_id);
            }
        }
        break;

    case 'setqty':
        $item_id = (int)($_POST['item_id'] ?? 0);
        $qty     = max(1, (int)($_POST['qty'] ?? 1));

        $st = $pdo->prepare("
          UPDATE invoice_items
          SET qty = ?, 
              line_total_usd = price_usd * ?, 
              line_total_khr = price_khr * ?
          WHERE id = ? AND invoice_id = ?
        ");
        $st->execute([$qty, $qty, $qty, $item_id, $invoice_id]);

        calc_totals($invoice_id);
        break;

    case 'remove':
        $item_id = (int)($_POST['item_id'] ?? 0);
        $st = $pdo->prepare("DELETE FROM invoice_items WHERE id=? AND invoice_id=?");
        $st->execute([$item_id, $invoice_id]);

        calc_totals($invoice_id);
        break;

    case 'setdiscount': // item discount %
        $item_id      = (int)($_POST['item_id'] ?? 0);
        $discount_pct = (float)($_POST['discount_pct'] ?? 0);

        if ($discount_pct < 0)   $discount_pct = 0;
        if ($discount_pct > 100) $discount_pct = 100;

        // Update item discount only for this row
        $st = $pdo->prepare("
          UPDATE invoice_items
          SET discount_pct   = ?,
              line_total_usd = ROUND(price_usd * qty * (1 - ?/100), 2),
              line_total_khr = ROUND(price_khr * qty * (1 - ?/100), 0)
          WHERE id = ? AND invoice_id = ?
        ");
        $st->execute([$discount_pct, $discount_pct, $discount_pct, $item_id, $invoice_id]);

        calc_totals($invoice_id);
        break;

    case 'set_invoice_discount': // WHOLE invoice discount %
        $discount_pct = (float)($_POST['discount_pct'] ?? 0);

        if ($discount_pct < 0)   $discount_pct = 0;
        if ($discount_pct > 100) $discount_pct = 100;

        // only update invoices.discount_pct – do NOT touch invoice_items
        $st = $pdo->prepare("UPDATE invoices SET discount_pct = ? WHERE id = ?");
        $st->execute([$discount_pct, $invoice_id]);

        calc_totals($invoice_id);
        break;

    case 'set_invoice_discount_value': // set WHOLE discount by amount USD/KHR
        $discount_usd = isset($_POST['discount_usd']) ? (float)$_POST['discount_usd'] : 0.0;
        $discount_khr = isset($_POST['discount_khr']) ? (int)$_POST['discount_khr'] : 0;

        // Load current subtotal (after item discounts) + rate
        $st = $pdo->prepare("
            SELECT subtotal_usd, subtotal_khr, usd_to_khr
            FROM invoices
            WHERE id = ?
            LIMIT 1
        ");
        $st->execute([$invoice_id]);
        $inv = $st->fetch();

        if ($inv) {
            $subtotal_usd = (float)($inv['subtotal_usd'] ?? 0);
            $subtotal_khr = (int)  ($inv['subtotal_khr'] ?? 0);
            $rate         = (int)  ($inv['usd_to_khr']    ?? 4100);
            if ($rate <= 0) $rate = 4100;

            $discount_pct = 0.0;

            // Prefer KHR amount if user provided
            if ($discount_khr > 0 && $subtotal_khr > 0) {
                if ($discount_khr > $subtotal_khr) {
                    $discount_khr = $subtotal_khr;
                }
                $discount_pct = ($discount_khr / $subtotal_khr) * 100.0;
            } elseif ($discount_usd > 0 && $subtotal_usd > 0) {
                if ($discount_usd > $subtotal_usd) {
                    $discount_usd = $subtotal_usd;
                }
                $discount_pct = ($discount_usd / $subtotal_usd) * 100.0;
            }

            if ($discount_pct < 0)   $discount_pct = 0;
            if ($discount_pct > 100) $discount_pct = 100;

            $upd = $pdo->prepare("UPDATE invoices SET discount_pct = ? WHERE id = ?");
            $upd->execute([$discount_pct, $invoice_id]);

            calc_totals($invoice_id);
        }
        break;

    default:
        // nothing
        break;
}

// back to sale page
redirect('sale.php?invoice='.(int)$invoice_id);
