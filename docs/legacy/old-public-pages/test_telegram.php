<?php
// --- CONFIG ---
$botToken = getenv('TELEGRAM_BOT_TOKEN') ?: '';
$chatId   = getenv('TELEGRAM_CHAT_ID') ?: '';

$url  = "https://api.telegram.org/bot{$botToken}/sendMessage";
$data = [
    'chat_id' => $chatId,
    'text'    => '🔔 Test message from FTC POS server at ' . date('Y-m-d H:i:s'),
];

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $url,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $data,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT        => 30,
]);

$response = curl_exec($ch);
if ($response === false) {
    header('Content-Type: text/plain; charset=utf-8');
    echo "cURL error:\n";
    echo curl_error($ch);
    curl_close($ch);
    exit;
}
curl_close($ch);

header('Content-Type: application/json; charset=utf-8');
echo $response;
