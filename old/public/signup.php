<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../db.php';

if (current_user()) {
  header("Location: index.php");
  exit;
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $username = trim($_POST['username'] ?? '');
  $password = trim($_POST['password'] ?? '');
  $confirm_password = trim($_POST['confirm_password'] ?? '');
  
  // Validation
  if ($username === '' || $password === '' || $confirm_password === '') {
    $error = 'All fields are required';
  } elseif (strlen($username) < 3) {
    $error = 'Username must be at least 3 characters';
  } elseif (strlen($password) < 6) {
    $error = 'Password must be at least 6 characters';
  } elseif ($password !== $confirm_password) {
    $error = 'Passwords do not match';
  } else {
    // Check if username already exists
    $pdo = db();
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    
    if ($stmt->fetch()) {
      $error = 'Username already exists';
    } else {
      // Create new user
      $password_hash = password_hash($password, PASSWORD_BCRYPT);
      $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, 'sale', 1)");
      
      if ($stmt->execute([$username, $password_hash])) {
        $success = 'Account created successfully! You can now sign in.';
      } else {
        $error = 'Failed to create account. Please try again.';
      }
    }
  }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Sign up – FTC POS</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
  <style>
    body { background:#eef1f8; }
    .auth-card {
      max-width: 960px;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,.1);
      background: #fff;
      border: none;
    }
    .form-pane {
      padding: 48px 40px;
    }
    .form-pane h1 {
      font-weight: 800;
      letter-spacing: .5px;
      margin-bottom: 24px;
      color: #212529;
    }
    .btn-gradient {
      background: linear-gradient(90deg, #5b00e5 0%, #007bff 100%);
      border: none;
      color: #fff;
      font-weight: 600;
      border-radius: 10px;
      height: 50px;
      transition: all .3s;
    }
    .btn-gradient:hover {
      filter: brightness(1.1);
      color: #fff;
    }
    .welcome-pane {
      background: linear-gradient(90deg, #5b00e5 0%, #007bff 100%);
      color:#fff;
      padding: 48px 40px;
    }
    .welcome-pane h2 { font-weight: 800; margin-bottom: 12px; }
    .welcome-pane p { opacity:.93; line-height:1.5; }
    .welcome-pane .cta {
      background: rgba(255,255,255,.15);
      border: 0;
      height: 48px;
      border-radius: 999px;
      color:#fff;
      padding: 0 24px;
      font-weight:600;
      text-decoration:none;
      backdrop-filter: blur(2px);
      display: inline-block;
      line-height: 48px;
    }
    .welcome-pane .cta:hover { background: rgba(255,255,255,.25); color:#fff; }
    @media (max-width: 991.98px){ .welcome-pane{display:none;} }
  </style>
</head>
<body class="d-flex align-items-center justify-content-center" style="min-height:100vh;">
  <div class="container px-3">
    <div class="row justify-content-center">
      <div class="col-12">
        <div class="auth-card mx-auto">
          <div class="row g-0">
            <!-- Left: welcome -->
            <div class="col-lg-6">
              <div class="welcome-pane h-100 d-flex flex-column justify-content-center">
                <h2>Join us today!</h2>
                <p>Create your account and start managing your sales efficiently. We're excited to have you on board!</p>
                <div class="mt-3">
                  <a href="login.php" class="cta">Already have an account? Sign in.</a>
                </div>
              </div>
            </div>
            <!-- Right: form -->
            <div class="col-lg-6">
              <div class="form-pane">
                <h1>Sign up</h1>
                <?php if ($error): ?>
                  <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
                <?php endif; ?>
                <?php if ($success): ?>
                  <div class="alert alert-success">
                    <?= htmlspecialchars($success) ?>
                    <a href="login.php" class="alert-link">Go to Sign in</a>
                  </div>
                <?php endif; ?>
                <form method="post" autocomplete="off">
                  <div class="mb-3">
                    <input class="form-control form-control-lg" name="username" placeholder="Username" required value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">
                  </div>
                  <div class="mb-3">
                    <input class="form-control form-control-lg" type="password" name="password" placeholder="Password (min 6 characters)" required>
                  </div>
                  <div class="mb-3">
                    <input class="form-control form-control-lg" type="password" name="confirm_password" placeholder="Confirm Password" required>
                  </div>
                  <button class="btn btn-gradient w-100" type="submit">Create Account</button>
                </form>
                <div class="text-center mt-3">
                  <small class="text-muted">Already have an account? <a href="login.php">Sign in</a></small>
                </div>
              </div>
            </div>
            <!-- /Right -->
          </div>
        </div>
      </div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
