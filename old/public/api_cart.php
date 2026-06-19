<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$action     = $_POST['action'] ?? '';
$invoice_id = (int)($_POST['invoice_id'] ?? 0);

/**
 * For all actions EXCEPT 'add', we require a valid invoice_id.
 * For 'add', we allow invoice_id=0 and will create/reuse invoice inside.
 */
if ($action !== 'add' && !$invoice_id) {
    redirect('index.php');
}

try {

    switch ($action) {

        /**
         * ADD ITEM:
         * - If invoice_id = 0:
         *     0) Try to find ANY open invoice that has NO items -> reuse it (even from another table)
         *     1) If none, for table order: find or create open invoice for floor/table
         *     2) If none, for takeaway: find or create open takeaway invoice
         * - If same product already exists in invoice_items -> same row, qty += new qty
         * - After first item is added for a table invoice -> mark table as 'busy'
         */
        case 'add':
            $product_id = (int)($_POST['product_id'] ?? 0);
            $qty        = max(1, (int)($_POST['qty'] ?? 1));

            if ($product_id <= 0) {
                redirect('index.php');
            }

            // Order metadata from form (must be sent from sale.php)
            $order_type = $_POST['order_type'] ?? 'table';  // 'table' or 'takeaway'
            $floor_id   = isset($_POST['floor_id']) ? (int)$_POST['floor_id'] : 0;
            $table_id   = isset($_POST['table_id']) ? (int)$_POST['table_id'] : 0;

            // If invoice not yet created, create/reuse it now
            if ($invoice_id === 0) {
                $rate = get_rate(); // from helpers.php (current usd_to_khr)

                /**
                 * 0) GLOBAL REUSE:
                 *    Look for any OPEN invoice that has NO items.
                 *    This allows reusing an "empty" invoice id,
                 *    even if it was previously attached to another table.
                 */
                $reuseStmt = $pdo->query("
                    SELECT i.id
                      FROM invoices i
                      LEFT JOIN invoice_items it
                        ON it.invoice_id = i.id
                     WHERE i.status = 'open'
                       AND it.id IS NULL
                     ORDER BY i.id ASC
                     LIMIT 1
                ");
                $reuse = $reuseStmt->fetch();

                if ($reuse) {
                    // Reuse this empty invoice
                    $invoice_id = (int)$reuse['id'];

                    if ($order_type === 'takeaway') {
                        $upd = $pdo->prepare("
                            UPDATE invoices
                               SET order_type='takeaway',
                                   floor_id=NULL,
                                   table_id=NULL,
                                   usd_to_khr=?
                             WHERE id=?
                        ");
                        $upd->execute([$rate, $invoice_id]);
                    } else {
                        if (!$floor_id || !$table_id) {
                            redirect('index.php');
                        }
                        $upd = $pdo->prepare("
                            UPDATE invoices
                               SET order_type='table',
                                   floor_id=?,
                                   table_id=?,
                                   usd_to_khr=?
                             WHERE id=?
                        ");
                        $upd->execute([$floor_id, $table_id, $rate, $invoice_id]);
                    }

                } else {
                    /**
                     * 1) / 2) Old logic if there is no empty open invoice:
                     *     - Takeaway: reuse open takeaway invoice or create new
                     *     - Table: reuse open invoice for that table or create new
                     */
                    if ($order_type === 'takeaway') {
                        // Try reuse existing open takeaway invoice
                        $st = $pdo->query("
                            SELECT id, usd_to_khr
                              FROM invoices
                             WHERE status='open' AND order_type='takeaway'
                             ORDER BY id DESC
                             LIMIT 1
                        ");
                        $row = $st->fetch();
                        if ($row) {
                            $invoice_id = (int)$row['id'];
                        } else {
                            // Create new takeaway invoice (no table)
                            $ins = $pdo->prepare("
                              INSERT INTO invoices
                                (order_type, floor_id, table_id, usd_to_khr, status,
                                 subtotal_usd, subtotal_khr, total_usd, total_khr,
                                 discount_pct, discount_amount_usd, discount_amount_khr)
                              VALUES ('takeaway', NULL, NULL, ?, 'open',
                                      0.00, 0, 0.00, 0, 0, 0.00, 0)
                            ");
                            $ins->execute([$rate]);
                            $invoice_id = (int)$pdo->lastInsertId();
                        }

                    } else {
                        // ---- TABLE ORDER ----
                        if (!$floor_id || !$table_id) {
                            redirect('index.php');
                        }

                        // Try reuse existing open invoice for this table
                        $st = $pdo->prepare("
                            SELECT id
                              FROM invoices
                             WHERE status='open'
                               AND order_type='table'
                               AND floor_id=?
                               AND table_id=?
                             ORDER BY id DESC
                             LIMIT 1
                        ");
                        $st->execute([$floor_id, $table_id]);
                        $row = $st->fetch();

                        if ($row) {
                            $invoice_id = (int)$row['id'];
                        } else {
                            // Create new open invoice for this table
                            $ins = $pdo->prepare("
                              INSERT INTO invoices
                                (order_type, floor_id, table_id, usd_to_khr, status,
                                 subtotal_usd, subtotal_khr, total_usd, total_khr,
                                 discount_pct, discount_amount_usd, discount_amount_khr)
                              VALUES ('table', ?, ?, ?, 'open',
                                      0.00, 0, 0.00, 0, 0, 0.00, 0)
                            ");
                            $ins->execute([$floor_id, $table_id, $rate]);
                            $invoice_id = (int)$pdo->lastInsertId();
                        }
                    }
                } // end if reuse / else old logic
            }

            if ($invoice_id === 0) {
                redirect('index.php');
            }

            // --- Ensure TABLE IS BUSY if this is a table invoice ---
            $invInfo = $pdo->prepare("
                SELECT order_type, table_id
                  FROM invoices
                 WHERE id = ?
                 LIMIT 1
            ");
            $invInfo->execute([$invoice_id]);
            $invRow = $invInfo->fetch();
            if ($invRow && $invRow['order_type'] === 'table' && !empty($invRow['table_id'])) {
                $upTbl = $pdo->prepare("UPDATE tables SET status='busy' WHERE id=?");
                $upTbl->execute([(int)$invRow['table_id']]);
            }
            // -------------------------------------------------------

            // 1) Check if this product already exists in this invoice
            $check = $pdo->prepare("
                SELECT id, qty, price_usd, price_khr, COALESCE(discount_pct,0) AS discount_pct
                  FROM invoice_items
                 WHERE invoice_id = ? AND product_id = ?
                 LIMIT 1
            ");
            $check->execute([$invoice_id, $product_id]);
            $existing = $check->fetch();

            if ($existing) {
                // ---- Update existing row (same line) ----
                $item_id      = (int)$existing['id'];
                $old_qty      = (int)$existing['qty'];
                $price_usd    = (float)$existing['price_usd'];
                $price_khr    = (int)$existing['price_khr'];
                $discount_pct = (float)$existing['discount_pct'];

                if ($discount_pct < 0)   $discount_pct = 0;
                if ($discount_pct > 100) $discount_pct = 100;

                $new_qty = max(1, $old_qty + $qty);
                $factor  = 1 - ($discount_pct / 100.0);

                $line_total_usd = round($price_usd * $new_qty * $factor, 2);
                $line_total_khr = (int)round($price_khr * $new_qty * $factor, 0);

                $upd = $pdo->prepare("
                    UPDATE invoice_items
                       SET qty            = ?,
                           line_total_usd = ?,
                           line_total_khr = ?
                     WHERE id = ? AND invoice_id = ?
                ");
                $upd->execute([
                    $new_qty,
                    $line_total_usd,
                    $line_total_khr,
                    $item_id,
                    $invoice_id
                ]);

            } else {
                // ---- No existing row -> insert new one from products ----
                $st = $pdo->prepare("
                  SELECT id, name, price_usd, price_khr
                  FROM products
                  WHERE id=? AND is_active=1
                ");
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
                        0,
                        $line_total_usd,
                        $line_total_khr
                    ]);
                }
            }

            calc_totals($invoice_id);
            // back to sale page with the new or reused invoice id
            redirect('sale.php?invoice=' . (int)$invoice_id);
            break;

        /**
         * SET QTY:
         * - Update qty
         * - Keep price_usd/price_khr & discount_pct
         * - Recalculate line_total_usd / line_total_khr with discount factor
         */
        case 'setqty':
            $item_id = (int)($_POST['item_id'] ?? 0);
            $qty     = max(1, (int)($_POST['qty'] ?? 1));

            if ($item_id) {
                // Load existing prices + discount
                $st = $pdo->prepare("
                    SELECT price_usd, price_khr, COALESCE(discount_pct,0) AS discount_pct
                      FROM invoice_items
                     WHERE id = ? AND invoice_id = ?
                     LIMIT 1
                ");
                $st->execute([$item_id, $invoice_id]);
                $row = $st->fetch();

                if ($row) {
                    $price_usd    = (float)$row['price_usd'];
                    $price_khr    = (int)$row['price_khr'];
                    $discount_pct = (float)$row['discount_pct'];

                    if ($discount_pct < 0)   $discount_pct = 0;
                    if ($discount_pct > 100) $discount_pct = 100;

                    $factor = 1 - ($discount_pct / 100.0);

                    $line_total_usd = round($price_usd * $qty * $factor, 2);
                    $line_total_khr = (int)round($price_khr * $qty * $factor, 0);

                    $upd = $pdo->prepare("
                      UPDATE invoice_items
                         SET qty            = ?,
                             line_total_usd = ?,
                             line_total_khr = ?
                       WHERE id = ? AND invoice_id = ?
                    ");
                    $upd->execute([$qty, $line_total_usd, $line_total_khr, $item_id, $invoice_id]);
                }
            }

            calc_totals($invoice_id);
            redirect('sale.php?invoice=' . (int)$invoice_id);
            break;

        /**
         * REMOVE ITEM:
         * - Delete one line
         * - If this was last item:
         *     - KEEP invoice row (still can reuse same invoice_id)
         *     - Reset totals & discounts to 0
         *     - If table order -> set table status='free'
         * - Then go back to sale page
         */
        case 'remove':
            $item_id = (int)($_POST['item_id'] ?? 0);

            if ($item_id) {
                $st = $pdo->prepare("DELETE FROM invoice_items WHERE id=? AND invoice_id=?");
                $st->execute([$item_id, $invoice_id]);
            }

            // Check remaining items
            $cntSt = $pdo->prepare("SELECT COUNT(*) FROM invoice_items WHERE invoice_id=?");
            $cntSt->execute([$invoice_id]);
            $cnt = (int)$cntSt->fetchColumn();

            // Load invoice info
            $invSt = $pdo->prepare("
                SELECT order_type, table_id
                  FROM invoices
                 WHERE id = ?
                 LIMIT 1
            ");
            $invSt->execute([$invoice_id]);
            $inv = $invSt->fetch();

            if ($cnt === 0) {
                // No more items:
                // 1) For table order -> free table
                if ($inv && $inv['order_type'] === 'table' && !empty($inv['table_id'])) {
                    $freeTable = $pdo->prepare("UPDATE tables SET status='free' WHERE id=?");
                    $freeTable->execute([(int)$inv['table_id']]);
                }

                // 2) Reset invoice totals & discounts but KEEP status (usually 'open')
                $updInv = $pdo->prepare("
                    UPDATE invoices
                       SET subtotal_usd        = 0.00,
                           subtotal_khr        = 0,
                           total_usd           = 0.00,
                           total_khr           = 0,
                           discount_pct        = 0,
                           discount_amount_usd = 0.00,
                           discount_amount_khr = 0
                     WHERE id = ?
                ");
                $updInv->execute([$invoice_id]);
            } else {
                // Still have items -> recalc totals
                calc_totals($invoice_id);
            }

            redirect('sale.php?invoice=' . (int)$invoice_id);
            break;

        /**
         * PER-ITEM % DISCOUNT:
         * discount_pct applies to both USD & KHR totals with same factor
         */
        case 'setdiscount':
            $item_id      = (int)($_POST['item_id'] ?? 0);
            $discount_pct = (float)($_POST['discount_pct'] ?? 0);

            if ($discount_pct < 0)   $discount_pct = 0;
            if ($discount_pct > 100) $discount_pct = 100;

            $st = $pdo->prepare("
              UPDATE invoice_items
                 SET discount_pct   = ?,
                     line_total_usd = ROUND(price_usd * qty * (1 - ?/100), 2),
                     line_total_khr = ROUND(price_khr * qty * (1 - ?/100), 0)
               WHERE id = ? AND invoice_id = ?
            ");
            $st->execute([$discount_pct, $discount_pct, $discount_pct, $item_id, $invoice_id]);

            calc_totals($invoice_id);
            redirect('sale.php?invoice=' . (int)$invoice_id);
            break;

        /**
         * WHOLE-INVOICE % DISCOUNT:
         * - Calculate discount KHR from subtotal_khr
         * - Derive discount USD from KHR / rate
         */
        case 'set_invoice_discount':
            $discount_pct = (float)($_POST['discount_pct'] ?? 0);

            if ($discount_pct < 0)   $discount_pct = 0;
            if ($discount_pct > 100) $discount_pct = 100;

            // Get current subtotal + rate
            $st = $pdo->prepare("
                SELECT subtotal_khr, usd_to_khr
                  FROM invoices
                 WHERE id = ?
                 LIMIT 1
            ");
            $st->execute([$invoice_id]);
            $inv = $st->fetch();

            if ($inv) {
                $subtotal_khr = (int)($inv['subtotal_khr'] ?? 0);
                $rate         = (int)($inv['usd_to_khr']    ?? 4100);
                if ($rate <= 0) $rate = 4100;

                // discount in KHR from %
                $discount_khr = (int)round($subtotal_khr * ($discount_pct / 100.0), 0);
                if ($discount_khr < 0) $discount_khr = 0;
                if ($discount_khr > $subtotal_khr) {
                    $discount_khr = $subtotal_khr;
                }

                // KHR is primary – derive USD from KHR
                $discount_usd = $discount_khr > 0
                    ? round($discount_khr / $rate, 2)
                    : 0.0;

                $upd = $pdo->prepare("
                    UPDATE invoices
                       SET discount_pct        = ?,
                           discount_amount_usd = ?,
                           discount_amount_khr = ?
                     WHERE id = ?
                ");
                $upd->execute([
                    $discount_pct,
                    $discount_usd,
                    $discount_khr,
                    $invoice_id
                ]);

                calc_totals($invoice_id);
            }

            redirect('sale.php?invoice=' . (int)$invoice_id);
            break;

        /**
         * Manual discount by value (USD/KHR) for whole invoice.
         */
        case 'set_invoice_discount_value':

            $discount_usd = isset($_POST['discount_usd'])
                            ? (float)$_POST['discount_usd'] : 0.0;
            $discount_khr = isset($_POST['discount_khr'])
                            ? (int)$_POST['discount_khr'] : 0;

            // Load subtotal & rate
            $st = $pdo->prepare("
                SELECT subtotal_khr, usd_to_khr
                  FROM invoices
                 WHERE id = ?
                 LIMIT 1
            ");
            $st->execute([$invoice_id]);
            $inv = $st->fetch();

            if ($inv) {
                $subtotal_khr = (int)($inv['subtotal_khr'] ?? 0);
                $rate         = (int)($inv['usd_to_khr']    ?? 4100);
                if ($rate <= 0) $rate = 4100;

                // If KHR is not given but USD is, convert USD -> KHR
                if ($discount_khr <= 0 && $discount_usd > 0) {
                    $discount_khr = usd_to_khr_value($discount_usd, $rate);
                }

                if ($discount_khr < 0) $discount_khr = 0;
                if ($discount_khr > $subtotal_khr) {
                    $discount_khr = $subtotal_khr;
                }

                // Recompute USD from KHR (KHR is master)
                $discount_usd = $discount_khr > 0
                    ? round($discount_khr / $rate, 2)
                    : 0.0;

                $upd = $pdo->prepare("
                    UPDATE invoices
                       SET discount_amount_usd = ?,
                           discount_amount_khr = ?
                     WHERE id = ?
                ");
                $upd->execute([
                    $discount_usd,
                    $discount_khr,
                    $invoice_id
                ]);

                calc_totals($invoice_id);
            }

            redirect('sale.php?invoice=' . (int)$invoice_id);
            break;

        /**
         * Admin-only: set new price for an item (USD/KHR).
         */
        case 'setprice':
            $user = current_user();
            $role = $user['role'] ?? '';

            // security: only admin can change price
            if (!in_array($role, ['admin', 'sale', 'sales'], true))  {
                redirect('sale.php?invoice=' . (int)$invoice_id);
            }

            $item_id         = (int)($_POST['item_id']   ?? 0);
            $price_usd_input = $_POST['price_usd'] ?? '';
            $price_khr_input = $_POST['price_khr'] ?? '';

            if (!$item_id) {
                redirect('sale.php?invoice=' . (int)$invoice_id);
            }

            // load current item
            $st = $pdo->prepare("
                SELECT price_usd, price_khr, qty, COALESCE(discount_pct,0) AS discount_pct
                  FROM invoice_items
                 WHERE id = ? AND invoice_id = ?
                 LIMIT 1
            ");
            $st->execute([$item_id, $invoice_id]);
            $row = $st->fetch();
            if (!$row) {
                redirect('sale.php?invoice=' . (int)$invoice_id);
            }

            // load rate from invoice
            $stRate = $pdo->prepare("SELECT usd_to_khr FROM invoices WHERE id = ? LIMIT 1");
            $stRate->execute([$invoice_id]);
            $invRate = $stRate->fetch();
            $rate    = $invRate ? (int)($invRate['usd_to_khr'] ?? 4100) : 4100;
            if ($rate <= 0) $rate = 4100;

            $qty          = (int)$row['qty'];
            $discount_pct = (float)$row['discount_pct'];
            if ($discount_pct < 0)   $discount_pct = 0;
            if ($discount_pct > 100) $discount_pct = 100;

            $hasUsd = strlen(trim($price_usd_input)) > 0;
            $hasKhr = strlen(trim($price_khr_input)) > 0;

            // default to old prices
            $price_usd = (float)$row['price_usd'];
            $price_khr = (int)$row['price_khr'];

            if ($hasUsd && $hasKhr) {
                // both provided: trust both
                $price_usd = max(0, (float)$price_usd_input);
                $price_khr = max(0, (int)$price_khr_input);
            } elseif ($hasUsd && !$hasKhr) {
                // only USD edited: derive KHR
                $price_usd = max(0, (float)$price_usd_input);
                $price_khr = (int)max(0, round($price_usd * $rate, 0));
            } elseif (!$hasUsd && $hasKhr) {
                // only KHR edited: derive USD
                $price_khr = max(0, (int)$price_khr_input);
                $price_usd = max(0, round($price_khr / $rate, 2));
            }
            // if neither edited -> keep old (already set)

            $factor = 1 - $discount_pct / 100.0;

            $line_total_usd = round($price_usd * $qty * $factor, 2);
            $line_total_khr = (int)round($price_khr * $qty * $factor, 0);

            $upd = $pdo->prepare("
                UPDATE invoice_items
                   SET price_usd      = ?,
                       price_khr      = ?,
                       line_total_usd = ?,
                       line_total_khr = ?
                 WHERE id = ? AND invoice_id = ?
            ");
            $upd->execute([
                $price_usd,
                $price_khr,
                $line_total_usd,
                $line_total_khr,
                $item_id,
                $invoice_id
            ]);

            calc_totals($invoice_id);
            redirect('sale.php?invoice=' . (int)$invoice_id);
            break;

        default:
            redirect('index.php');
    }

} catch (Throwable $e) {
    // In case something unexpected happens, avoid HTTP 500 blank page
    echo "<pre style='padding:1em;background:#fff3cd;border:1px solid #ffeeba;font-family:monospace'>";
    echo "<b>Cart error:</b> " . htmlspecialchars($e->getMessage());
    echo "</pre>";
    exit;
}
