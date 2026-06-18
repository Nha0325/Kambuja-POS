<?php ob_start(); ?>
<div class="container d-flex align-items-center justify-content-center" style="min-height: 100vh;">
    <div class="card shadow" style="max-width: 400px; width: 100%;">
        <div class="card-body p-4">
            <h3 class="text-center mb-4">FTC POS Login</h3>
            <?php if (!empty($error)): ?>
                <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>
            <form method="post" action="/login">
                <div class="mb-3">
                    <label>Username</label>
                    <input type="text" name="username" class="form-control" required autofocus>
                </div>
                <div class="mb-3">
                    <label>Password</label>
                    <input type="password" name="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Sign In</button>
            </form>
        </div>
    </div>
</div>
<?php 
$content = ob_get_clean();
require __DIR__ . '/../layouts/auth.php';
