<?php
require_once __DIR__ . '/../auth.php';

if (current_user()) {
  header("Location: index.php");
  exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $user = trim($_POST['username'] ?? '');
  $pass = trim($_POST['password'] ?? '');
  if ($user !== '' && $pass !== '' && login_user($user, $pass)) {
    header("Location: index.php");
    exit;
  }
  $error = 'Invalid username or password';
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Sign in – FTC POS</title>
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
    .social a {
      width:44px; height:44px;
      border-radius:50%;
      display:inline-flex; align-items:center; justify-content:center;
      background:#f1f3f5; margin-right:10px;
      text-decoration:none; color:#495057;
      transition:background .2s;
    }
    .social a:hover { background:#dee2e6; }
    /* 👉 Gradient like your navbar */
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
    }
    .welcome-pane .cta:hover { background: rgba(255,255,255,.25); }
    @media (max-width: 991.98px){ .welcome-pane{display:none;} }
  </style>
</head>
<body class="d-flex align-items-center justify-content-center" style="min-height:100vh;">
  <div class="container px-3">
    <div class="row justify-content-center">
      <div class="col-12">
        <div class="auth-card mx-auto">
          <div class="row g-0">
            <!-- Left: form -->
            <div class="col-lg-6">
              <div class="form-pane">
                <h1>Sign in</h1>
                <?php if ($error): ?>
                  <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
                <?php endif; ?>
                <form method="post" autocomplete="off">
                  <div class="mb-3">
                    <input class="form-control form-control-lg" name="username" placeholder="Username" required>
                  </div>
                  <div class="mb-3">
                    <input class="form-control form-control-lg" type="password" name="password" placeholder="Password" required>
                  </div>
                  <button class="btn btn-gradient w-100" type="submit">Sign in</button>
                </form>
                <div class="text-center my-3 text-muted">or sign in with</div>
                <div class="social d-flex justify-content-center">
                  <a href="#"><i class="bi bi-facebook"></i></a>
                  <a href="#"><i class="bi bi-google"></i></a>
                  <a href="#"><i class="bi bi-linkedin"></i></a>
                </div>
              </div>
            </div>
            <!-- Right: welcome -->
            <div class="col-lg-6">
              <div class="welcome-pane h-100 d-flex flex-column justify-content-center">
                <h2>Welcome back!</h2>
                <p>We’re so happy to have you here. It’s great to see you again — let’s make today’s sales smooth and easy.</p>
                <div class="mt-3">
                  <a href="signup.php" class="cta">No account yet? Signup.</a>
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
