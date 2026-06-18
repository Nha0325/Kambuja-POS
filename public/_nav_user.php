<?php $u = current_user(); ?>
<div class="ms-auto">
  <span class="me-2 text-muted"><?= htmlspecialchars($u['username']) ?> (<?= htmlspecialchars($u['role']) ?>)</span>
  <a href="logout.php" class="btn btn-outline-secondary btn-sm">Logout</a>
</div>
