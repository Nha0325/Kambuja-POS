<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_role('admin');
require_once __DIR__ . '/../helpers.php';
$mode=$_GET['mode']??'daily'; $ctype=$_GET['ctype']??'bar'; $startQ=$_GET['start']??null; $endQ=$_GET['end']??null;
$now=new DateTime('now'); $start=clone $now; $end=clone $now; $group='hour';
if($mode==='weekly'){ $start->modify('monday this week')->setTime(0,0,0); $end->modify('sunday this week')->setTime(23,59,59); $group='day'; }
elseif($mode==='monthly'){ $start->modify('first day of this month')->setTime(0,0,0); $end->modify('last day of this month')->setTime(23,59,59); $group='day'; }
elseif($mode==='custom' && $startQ && $endQ){ $start=new DateTime($startQ.' 00:00:00'); $end=new DateTime($endQ.' 23:59:59'); $group = ($start->format('Y-m-d')===$end->format('Y-m-d'))?'hour':'day'; }
else{ $mode='daily'; $start->setTime(0,0,0); $end->setTime(23,59,59); $group='hour'; }
$st=db()->prepare("SELECT paid_at,total_usd,total_khr FROM invoices WHERE status='paid' AND paid_at BETWEEN ? AND ? ORDER BY paid_at");
$st->execute([$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]); $rows=$st->fetchAll();
$labels=[];$usd=[];$khr=[];
if($group==='hour'){ for($h=0;$h<24;$h++){ $labels[$h]=sprintf('%02d:00',$h); $usd[$h]=0.0; $khr[$h]=0; } foreach($rows as $r){ $h=(int)date('G',strtotime($r['paid_at'])); if(isset($usd[$h])){ $usd[$h]+=(float)$r['total_usd']; $khr[$h]+=(int)$r['total_khr']; } } }
else{ $end2=clone $end; $end2->modify('+1 day'); $period=new DatePeriod($start,new DateInterval('P1D'),$end2);
  foreach($period as $d){ $k=$d->format('Y-m-d'); $labels[$k]=$k; $usd[$k]=0.0; $khr[$k]=0; }
  foreach($rows as $r){ $k=date('Y-m-d',strtotime($r['paid_at'])); if(isset($usd[$k])){ $usd[$k]+=(float)$r['total_usd']; $khr[$k]+=(int)$r['total_khr']; } }
}
$labels=array_values($labels); $usd=array_values($usd); $khr=array_values($khr);
$total_usd=array_sum($usd); $total_khr=array_sum($khr);
$top=db()->prepare("SELECT ii.name, SUM(ii.line_total_usd) s FROM invoice_items ii JOIN invoices i ON i.id=ii.invoice_id WHERE i.status='paid' AND i.paid_at BETWEEN ? AND ? GROUP BY ii.name ORDER BY s DESC LIMIT 10");
$top->execute([$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]); $topRows=$top->fetchAll();
$top_labels=array_map(fn($r)=>$r['name'],$topRows); $top_values=array_map(fn($r)=>(float)$r['s'],$topRows);
$s=get_settings();
?>
<!doctype html><html><head><meta charset="utf-8"/>
<title>Advanced Graph – FTC POS</title>
<link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>

  <style>
    /* Lock canvas size to prevent jitter & auto-scroll on resize */
    .chart-wrap { position: relative; height: 260px; }
    #chartComboWrap { height: 300px; }
    canvas { display:block; height:100% !important; width:100% !important; }
  </style>

<style>body{background:#f5f6f8;}.card{border-radius:1rem;}.muted{color:#6c757d;}.stat{font-size:1.1rem;font-weight:600;}</style>
</head><body>
<div class="container py-4">
  <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
    <h3 class="mb-0">Reports (Graph Advanced)</h3>
    <!-- <div class="btn-group"> -->
      <div class="col-md-4">
        <a class="btn btn-outline-primary btn-sm <?= $mode==='daily'?'active':'' ?>" href="?mode=daily&ctype=<?= $ctype ?>">Daily</a>
        <a class="btn btn-outline-primary btn-sm <?= $mode==='weekly'?'active':'' ?>" href="?mode=weekly&ctype=<?= $ctype ?>">Weekly</a>
        <a class="btn btn-outline-primary btn-sm <?= $mode==='monthly'?'active':'' ?>" href="?mode=monthly&ctype=<?= $ctype ?>">Monthly</a>
        <a class="btn btn-outline-primary btn-sm <?= $mode==='custom'?'active':'' ?>" href="?mode=custom&ctype=<?= $ctype ?>&start=<?= $start->format('Y-m-d') ?>&end=<?= $end->format('Y-m-d') ?>">Custom</a>
        <a class="btn btn-secondary btn-sm" href="reports_graph.php?mode=<?= htmlspecialchars($mode) ?>">Simple</a>
        <a class="btn btn-outline-secondary btn-sm" href="index.php">Back</a>
      </div>

    <!-- </div> -->
  </div>

  <div class="row g-2 align-items-end mt-2">
    <form class="col-md-8 d-flex align-items-end gap-2" method="get">
      <input type="hidden" name="mode" value="custom">
      <div><label class="form-label mb-0">Start</label><input class="form-control" id="start" name="start" value="<?= $start->format('Y-m-d') ?>"></div>
      <div><label class="form-label mb-0">End</label><input class="form-control" id="end" name="end" value="<?= $end->format('Y-m-d') ?>"></div>
      <div><label class="form-label mb-0">Chart</label>
        <select class="form-select" name="ctype"><option value="bar" <?= $ctype==='bar'?'selected':'' ?>>Bar</option><option value="line" <?= $ctype==='line'?'selected':'' ?>>Line</option></select>
      </div>
      <button class="btn btn-primary">Apply</button>
      <a class="btn btn-outline-success" href="export_csv.php?mode=<?= $mode ?>&start=<?= $start->format('Y-m-d') ?>&end=<?= $end->format('Y-m-d') ?>">Export CSV</a>
    </form>
    <div class="col-md-4 text-md-end muted">Period: <?= $start->format('Y-m-d') ?> → <?= $end->format('Y-m-d') ?> &nbsp;|&nbsp; Rate: 1 USD = <?= number_format((int)$s['usd_to_khr']) ?> KHR</div>
  </div>

  <div class="row g-3 mt-2">
    <div class="col-md-6"><div class="card p-3"><div class="stat">Total USD: $<?= number_format($total_usd,2) ?></div><div class="chart-wrap"><canvas id="chartUsd"></canvas></div></div></div>
    <div class="col-md-6"><div class="card p-3"><div class="stat">Total KHR: <?= number_format($total_khr) ?> ៛</div><div class="chart-wrap"><canvas id="chartKhr"></canvas></div></div></div>
  </div>
  <div class="row g-3 mt-2">
    <div class="col-md-8"><div class="card p-3"><div class="stat">Combined (USD & KHR)</div><div id="chartComboWrap"><canvas id="chartCombo"></canvas></div></div></div>
    <div class="col-md-4"><div class="card p-3"><div class="stat">Top 10 Items (USD)</div><div class="chart-wrap"><canvas id="chartTop"></canvas></div></div></div>
  </div>
</div>

<script>
const labels = <?= json_encode($labels) ?>;
const usd    = <?= json_encode($usd) ?>;
const khr    = <?= json_encode($khr) ?>;
const topLabels = <?= json_encode($top_labels) ?>;
const topValues = <?= json_encode($top_values) ?>;
const chartType = <?= json_encode($ctype) ?>;
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


function mk(id, type, label, data){
  const cfg = { type, data: { labels, datasets: [{ label, data }] }, options: BASE_OPTS };
  const c = new Chart(document.getElementById(id), cfg); window.myCharts.push(c); return c;
}
mk('chartUsd', chartType, 'USD', usd);
mk('chartKhr', chartType, 'KHR', khr);
const combo = new Chart(document.getElementById('chartCombo'), {
  type:'bar', data:{ labels, datasets:[ { type: chartType, label:'USD', data:usd }, { type:'bar', label:'KHR', data:khr } ] }, options: BASE_OPTS
});
window.myCharts.push(combo);
new Chart(document.getElementById('chartTop'), { type:'pie', data:{ labels: topLabels, datasets:[{ data: topValues }] }, options: { responsive:false, maintainAspectRatio:false, animation:false } });
flatpickr('#start', { dateFormat:'Y-m-d' });
flatpickr('#end',   { dateFormat:'Y-m-d' });
</script>
</body></html>
