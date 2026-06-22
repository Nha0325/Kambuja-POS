const sendTelegramMessage = async ({ chatId, message }) => {
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token || token.startsWith("replace")) {
        throw new Error("TELEGRAM_BOT_TOKEN is not configured")
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
        }),
    })

    if (!response.ok) {
        throw new Error(`Telegram request failed with status ${response.status}`)
    }
}

module.exports = {
    sendTelegramMessage,
}
