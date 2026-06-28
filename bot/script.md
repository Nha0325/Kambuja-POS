const invokeNvidiaApi = async () => {
  const invokeUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
  
  const payload = {
    model: "deepseek-ai/deepseek-v4-flash",
    messages: [{ role: "user", content: "Your message here" }],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    chat_template_kwargs: { thinking: true, reasoning_effort: "high" },
    stream: false
  };

  try {
    const response = await fetch(invokeUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error invoking NVIDIA API:', error);
  }
};


===========================



import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

 
async function main() {
  const completion = await openai.chat.completions.create({
    model: "deepseek-ai/deepseek-v4-flash",
    messages: [{"content":"hi","role":"user"}],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    chat_template_kwargs: {"thinking":true,"reasoning_effort":"high"},
    stream: true
  })
   
  for await (const chunk of completion) {
        const reasoning = chunk.choices[0]?.delta?.reasoning || chunk.choices[0]?.delta?.reasoning_content;
    if (reasoning) process.stdout.write(reasoning);
        process.stdout.write(chunk.choices[0]?.delta?.content || '')
    
  }
  
}

main();