<?php
// --- CONFIG ---
$botToken = '8187725474:AAFix_DiOZLtIbLKcLaZa9ilIV575nFDK5M'; // your token
$chatId   = '-5012742082'; // your group id

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
