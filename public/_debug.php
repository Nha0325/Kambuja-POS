<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/../config.php';
echo "<h3>PHP OK</h3>";
try { require_once __DIR__ . '/../db.php'; $pdo = db(); $ver = $pdo->query("SELECT VERSION()")->fetchColumn(); echo "<p>DB OK — MySQL version: {$ver}</p>"; }
catch (Throwable $e) { echo "<p><strong>DB ERROR:</strong> " . htmlspecialchars($e->getMessage()) . "</p>"; }
echo "<p>UPLOAD_DIR: " . UPLOAD_DIR . "</p>";
echo "<p>UPLOAD_URL: " . UPLOAD_URL . "</p>";
echo "<p>BASE_URL: " . BASE_URL . "</p>";
