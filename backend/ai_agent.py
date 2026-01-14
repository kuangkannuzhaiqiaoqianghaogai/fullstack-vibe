# 文件路径: backend/ai_agent.py

import os
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv

# 1. 加载同级目录下的 .env 文件
load_dotenv()

# 2. 初始化 DeepSeek 客户端
# 即使我们用的是 DeepSeek，因为通过 OpenAI 协议兼容，所以用 AsyncOpenAI 库
client = AsyncOpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL")
)

async def analyze_task_text(text: str):
    print(f"🧠 AI 正在分析: {text}") # 打印日志，方便你在终端看进度
    
    # 3. 核心 Prompt (提示词)
    # 我们要教会 AI 怎么提取信息，并强制它返回 JSON
    system_prompt = """
    你是一个任务管理助手。请分析用户的输入，提取任务信息。
    必须严格返回合法的 JSON 格式，不要包含 Markdown 格式（如 ```json ... ```）。
    
    JSON 结构要求如下：
    {
        "title": "简短的任务标题",
        "description": "详细描述(如果没有则留空)",
        "due_date": "YYYY-MM-DD (如果用户提到了日期，请基于当前时间推算，否则返回 null)",
        "priority": 1 
    }
    
    关于 priority (优先级) 的定义：
    1 = 普通
    2 = 重要
    3 = 紧急
    
    如果用户输入完全无法识别为任务（比如乱码），title 返回 "无法识别"。
    """

    try:
        response = await client.chat.completions.create(
            model="deepseek-chat", # 或者 deepseek-v3，看官方文档支持
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text},
            ],
            response_format={ "type": "json_object" }, # 关键：强制 JSON 模式
            temperature=0.1 # 温度越低，回答越严谨
        )
        
        # 解析返回的内容
        content = response.choices[0].message.content
        return json.loads(content)

    except Exception as e:
        print(f"❌ AI 分析出错: {e}")
        return None