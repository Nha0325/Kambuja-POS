<?php ob_start(); ?>
<h2>POS Sale</h2>
<?php $content = ob_get_clean(); require __DIR__ . '/../layouts/app.php'; 
