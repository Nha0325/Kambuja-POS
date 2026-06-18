<?php ob_start(); ?>
<div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Categories</h5>
        <a href="<?= htmlspecialchars(url('/categories/create')) ?>" class="btn btn-primary btn-sm">Add Category</a>
    </div>
    <div class="card-body">
        <p>List of categories will go here.</p>
    </div>
</div>
<?php 
$content = ob_get_clean();
require __DIR__ . '/../layouts/app.php';
