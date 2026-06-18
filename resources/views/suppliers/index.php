<?php ob_start(); ?>
<div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Suppliers</h5>
        <a href="<?= htmlspecialchars(url('/suppliers/create')) ?>" class="btn btn-primary btn-sm">Add Supplier</a>
    </div>
    <div class="card-body">
        <p>List of suppliers will go here.</p>
    </div>
</div>
<?php 
$content = ob_get_clean();
require __DIR__ . '/../layouts/app.php';
