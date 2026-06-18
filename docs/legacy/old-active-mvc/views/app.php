<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TFC POS Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link href="<?= htmlspecialchars(asset('assets/css/app.css')) ?>" rel="stylesheet">
</head>
<body class="d-flex">
    <?php require __DIR__ . '/sidebar.php'; ?>
    <div class="content">
        <?php require __DIR__ . '/header.php'; ?>
        <div class="mt-4">
            <?= $content ?? '' ?>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="<?= htmlspecialchars(asset('assets/js/app.js')) ?>"></script>
</body>
</html>
