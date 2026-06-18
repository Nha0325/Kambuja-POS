<?php
require_once __DIR__ . '/../auth.php';
require_login();
require_once __DIR__ . '/../helpers.php';

$mode = $_GET['mode'] ?? 'daily';
$startQ = $_GET['start'] ?? null;
$endQ   = $_GET['end'] ?? null;

$now = new DateTime('now'); $start = clone $now; $end = clone $now; $group='hour';
if ($mode==='weekly'){ $start->modify('monday this week')->setTime(0,0,0); $end->modify('sunday this week')->setTime(23,59,59); $group='day'; }
elseif($mode==='monthly'){ $start->modify('first day of this month')->setTime(0,0,0); $end->modify('last day of this month')->setTime(23,59,59); $group='day'; }
elseif($mode==='custom' && $startQ && $endQ){ $start=new DateTime($startQ.' 00:00:00'); $end=new DateTime($endQ.' 23:59:59'); $group='day'; if($start->format('Y-m-d')===$end->format('Y-m-d')) $group='hour'; }
else { $mode='daily'; $start->setTime(0,0,0); $end->setTime(23,59,59); $group='hour'; }

$st = db()->prepare("SELECT paid_at,total_usd,total_khr FROM invoices WHERE status='paid' AND paid_at BETWEEN ? AND ? ORDER BY paid_at");
$st->execute([$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]);
$rows = $st->fetchAll();

$labels=[]; $usd=[]; $khr=[];
if ($group==='hour'){
  for($h=0;$h<24;$h++){ $labels[$h]=sprintf('%02d:00',$h); $usd[$h]=0.0; $khr[$h]=0; }
  foreach($rows as $r){ $h=(int)date('G',strtotime($r['paid_at'])); $usd[$h]+=(float)$r['total_usd']; $khr[$h]+=(int)$r['total_khr']; }
  $out = [["Hour","Total USD","Total KHR"]];
  for($h=0;$h<24;$h++){ $out[] = [$labels[$h], number_format($usd[$h],2,'.',''), $khr[$h]]; }
} else {
  $end2=clone $end; $end2->modify('+1 day');
  $period=new DatePeriod($start,new DateInterval('P1D'),$end2);
  foreach($period as $d){ $k=$d->format('Y-m-d'); $labels[$k]=$k; $usd[$k]=0.0; $khr[$k]=0; }
  foreach($rows as $r){ $k=date('Y-m-d',strtotime($r['paid_at'])); if(isset($usd[$k])){ $usd[$k]+=(float)$r['total_usd']; $khr[$k]+=(int)$r['total_khr']; } }
  $out = [["Date","Total USD","Total KHR"]];
  foreach($labels as $k){ $out[] = [$k, number_format($usd[$k],2,'.',''), $khr[$k]]; }
}

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="ftc_pos_report.csv"');
$fp = fopen('php://output','w');
foreach($out as $row){ fputcsv($fp, $row); }
fclose($fp);
exit;
