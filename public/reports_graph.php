<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_role('admin');
require_once __DIR__ . '/../helpers.php';

$mode = $_GET['mode'] ?? 'daily';
$now = new DateTime('now');
$start = clone $now; $end = clone $now; $group='hour';
if ($mode==='weekly'){ $start->modify('monday this week')->setTime(0,0,0); $end->modify('sunday this week')->setTime(23,59,59); $group='day'; }
elseif($mode==='monthly'){ $start->modify('first day of this month')->setTime(0,0,0); $end->modify('last day of this month')->setTime(23,59,59); $group='day'; }
else { $mode='daily'; $start->setTime(0,0,0); $end->setTime(23,59,59); $group='hour'; }

$st = db()->prepare("SELECT paid_at,total_usd,total_khr FROM invoices WHERE status='paid' AND paid_at BETWEEN ? AND ? ORDER BY paid_at");
$st->execute([$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]);
$rows = $st->fetchAll();

$labels = []; $usd=[]; $khr=[];
if($group==='hour'){ for($h=0;$h<24;$h++){ $labels[$h]=sprintf('%02d:00',$h); $usd[$h]=0.0; $khr[$h]=0; }
  foreach($rows as $r){ $h=(int)date('G',strtotime($r['paid_at'])); if(isset($usd[$h])){ $usd[$h]+=(float)$r['total_usd']; $khr[$h]+=(int)$r['total_khr']; } }
} else {
  $end2=clone $end; $end2->modify('+1 day');
  $period=new DatePeriod($start,new DateInterval('P1D'),$end2);
  foreach($period as $d){ $k=$d->format('Y-m-d'); $labels[$k]=$k; $usd[$k]=0.0; $khr[$k]=0; }
  foreach($rows as $r){ $k=date('Y-m-d',strtotime($r['paid_at'])); if(isset($usd[$k])){ $usd[$k]+=(float)$r['total_usd']; $khr[$k]+=(int)$r['total_khr']; } }
}
$labels=array_values($labels); $usd=array_values($usd); $khr=array_values($khr);
$total_usd=array_sum($usd); $total_khr=array_sum($khr);
?>
<!doctype html><html><head><meta charset="utf-8"/>
<title>Reports Graph – FTC POS</title>
<link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

  <style>
    /* Lock canvas size to prevent jitter & auto-scroll on resize */
    .chart-wrap { position: relative; height: 260px; }
    #chartComboWrap { height: 300px; }
    canvas { display:block; height:100% !important; width:100% !important; }
  </style>

<style>.card{border-radius:1rem;}.stat{font-size:1.1rem;font-weight:600;}.muted{color:#6c757d;}</style>
</head><body class="bg-light">
<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center">
    <h3 class="mb-0">Reports (Graph)</h3>
    <!-- <div class="btn-group"> -->
      <div class="col-md-4">
        <a class="btn btn-outline-primary btn-sm <?= $mode==='daily'?'active':'' ?>" href="?mode=daily">Daily</a>
        <a class="btn btn-outline-primary btn-sm <?= $mode==='weekly'?'active':'' ?>" href="?mode=weekly">Weekly</a>
        <a class="btn btn-outline-primary btn-sm <?= $mode==='monthly'?'active':'' ?>" href="?mode=monthly">Monthly</a>
        <a class="btn btn-secondary btn-sm" href="reports.php?mode=<?= $mode ?>">Table</a>
        <a class="btn btn-outline-secondary btn-sm" href="index.php">Back</a>
      </div>
    <!-- </div> -->
  </div>
  <div class="mt-2 muted">Period: <?= $start->format('Y-m-d') ?> → <?= $end->format('Y-m-d') ?></div>

  <div class="row g-3 mt-2">
    <div class="col-md-6"><div class="card p-3"><div class="stat">Total USD: $<?= number_format($total_usd,2) ?></div><div class="chart-wrap"><canvas id="chartUsd"></canvas></div></div></div>
    <div class="col-md-6"><div class="card p-3"><div class="stat">Total KHR: <?= number_format($total_khr) ?> ៛</div><div class="chart-wrap"><canvas id="chartKhr"></canvas></div></div></div>
  </div>

  <div class="card p-3 mt-3"><div class="stat">Combined (USD & KHR)</div><div id="chartComboWrap"><canvas id="chartCombo"></canvas></div></div>
</div>

<script>
const labels = <?= json_encode($labels) ?>;
const usd    = <?= json_encode($usd) ?>;
const khr    = <?= json_encode($khr) ?>;
if(window.myCharts){ window.myCharts.forEach(c=>c.destroy()); }
window.myCharts=[];

const BASE_OPTS = {
  responsive: false,              // <-- stop auto-resize redraw that scrolls
  maintainAspectRatio: false,
  animation: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
  transitions: { active: { animation: { duration: 0 } }, resize: { animation: { duration: 0 } } }
};
// Prevent canvas auto-focus from causing scroll jumps
document.querySelectorAll('canvas').forEach(cv => {
  cv.addEventListener('focus', e => e.target.blur(), { passive: true });
});
// Preserve and restore scroll position after charts render
const __y = window.scrollY || 0;
setTimeout(() => { window.scrollTo(0, __y); }, 0);


function mkChart(id,label,data,type='bar'){
  const c = new Chart(document.getElementById(id), { type, data: { labels, datasets: [{ label, data }] }, options: BASE_OPTS });
  window.myCharts.push(c); return c;
}
mkChart('chartUsd','USD',usd,'bar');
mkChart('chartKhr','KHR',khr,'bar');
const combo = new Chart(document.getElementById('chartCombo'), {
  type:'bar', data:{ labels, datasets:[
    { type:'line', label:'USD', data:usd },
    { type:'bar',  label:'KHR', data:khr }
  ]}, options: BASE_OPTS
});
window.myCharts.push(combo);
</script>
</body></html>
