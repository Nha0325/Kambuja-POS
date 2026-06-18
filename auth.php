<?php
// auth.php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
require_once __DIR__ . '/db.php';

/** Build absolute redirect to public login page */
function _login_url(): string {
  // Change this if your project path differs
  return '/ftc-pos/public/login.php';
}

/** Backward-compatible password verify:
 *  - If hash starts with $2y$ -> bcrypt (password_hash)
 *  - Else -> legacy sha256(username/password style you used)
 */
function _verify_password(string $plain, string $stored_hash): bool {
  if (strpos($stored_hash, '$2y$') === 0) {
    // bcrypt
    return password_verify($plain, $stored_hash);
  }
  // fallback legacy sha256
  return hash('sha256', $plain) === $stored_hash;
}

/** Get user by username */
function _get_user_by_username(string $username): ?array {
  $pdo = db();
  $st = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
  $st->execute([$username]);
  $row = $st->fetch();
  return $row ?: null;
}

/** Public API: login */
function login_user(string $username, string $password): bool {
  $user = _get_user_by_username($username);
  if (!$user) return false;

  // If the table has is_active, enforce it
  if (array_key_exists('is_active', $user) && (int)$user['is_active'] !== 1) {
    // Inactive user: deny login
    return false;
  }

  if (!_verify_password($password, (string)$user['password_hash'])) {
    return false;
  }

  // Good login → harden session
  session_regenerate_id(true);
  $_SESSION['user'] = [
    'id'       => (int)$user['id'],
    'username' => (string)$user['username'],
    'role'     => (string)$user['role'],
    // keep for convenience if present
    'is_active'=> array_key_exists('is_active', $user) ? (int)$user['is_active'] : 1,
  ];
  return true;
}

/** Public API: logout */
function logout_user(): void {
  // Clear session array
  $_SESSION = [];
  // Kill session cookie
  if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
  }
  // Destroy session
  session_destroy();
  header("Location: " . _login_url());
  exit;
}

/** Alias used elsewhere */
function auth_logout(): void { logout_user(); }

/** Current user */
function current_user(): ?array {
  return $_SESSION['user'] ?? null;
}

/** Require logged in */
function require_login(): void {
  if (empty($_SESSION['user'])) {
    header("Location: " . _login_url());
    exit;
  }
  // If we track is_active in session and it became disabled meanwhile, block
  if (isset($_SESSION['user']['is_active']) && (int)$_SESSION['user']['is_active'] !== 1) {
    logout_user(); // will redirect
  }
}

/** Require specific role */
function require_role(string $role): void {
  require_login();
  $u = $_SESSION['user'];
  if (!isset($u['role']) || $u['role'] !== $role) {
    http_response_code(403);
    echo "<h3 style='font-family:system-ui'>Access denied for role '".htmlspecialchars($u['role'] ?? 'unknown')."'</h3>";
    exit;
  }
}
