<?php ob_start(); ?>
<div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Sales / POS</h5>
        <a href="/sales/create" class="btn btn-primary btn-sm">New Sale</a>
    </div>
    <div class="card-body">
        <p>POS interface will go here.</p>
    </div>
</div>
<?php 
$content = ob_get_clean();
require __DIR__ . '/../layouts/app.php';
