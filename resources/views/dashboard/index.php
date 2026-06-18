<?php ob_start(); ?>
<div class="row g-4">
    <div class="col-md-3">
        <div class="card bg-primary text-white">
            <div class="card-body">
                <h5>Total Products</h5>
                <h2><?= htmlspecialchars($stats['total_products']) ?></h2>
            </div>
        </div>
    </div>
    <!-- Add other stats here... -->
</div>
<?php 
$content = ob_get_clean();
require __DIR__ . '/../layouts/app.php';
