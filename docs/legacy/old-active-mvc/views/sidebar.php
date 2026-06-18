<div class="sidebar" style="width: 250px;">
    <h3 class="p-3 text-white border-bottom border-secondary">TFC POS</h3>
    <ul class="nav flex-column mt-2">
        <li class="nav-item"><a href="<?= htmlspecialchars(url('/dashboard')) ?>"><i class="bi bi-speedometer2 me-2"></i> Dashboard</a></li>
        <li class="nav-item"><a href="<?= htmlspecialchars(url('/products')) ?>"><i class="bi bi-box me-2"></i> Products</a></li>
        <li class="nav-item"><a href="<?= htmlspecialchars(url('/categories')) ?>"><i class="bi bi-tags me-2"></i> Categories</a></li>
        <li class="nav-item"><a href="<?= htmlspecialchars(url('/customers')) ?>"><i class="bi bi-people me-2"></i> Customers</a></li>
        <li class="nav-item"><a href="<?= htmlspecialchars(url('/suppliers')) ?>"><i class="bi bi-truck me-2"></i> Suppliers</a></li>
        <li class="nav-item"><a href="<?= htmlspecialchars(url('/sales')) ?>"><i class="bi bi-cart me-2"></i> Sales / POS</a></li>
        <li class="nav-item"><a href="<?= htmlspecialchars(url('/purchases')) ?>"><i class="bi bi-bag me-2"></i> Purchases</a></li>
        <li class="nav-item"><a href="<?= htmlspecialchars(url('/stock')) ?>"><i class="bi bi-boxes me-2"></i> Stock</a></li>
        <li class="nav-item"><a href="<?= htmlspecialchars(url('/reports')) ?>"><i class="bi bi-file-earmark-bar-graph me-2"></i> Reports</a></li>
        <li class="nav-item"><a href="<?= htmlspecialchars(url('/settings')) ?>"><i class="bi bi-gear me-2"></i> Settings</a></li>
        <li class="nav-item mt-4"><a href="<?= htmlspecialchars(url('/logout')) ?>" class="text-danger"><i class="bi bi-box-arrow-right me-2"></i> Logout</a></li>
    </ul>
</div>
