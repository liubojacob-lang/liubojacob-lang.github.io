---
title: 构建智能AI应用：从LLM到AI Agent的完整指南
slug: build-ai-applications-from-llm-to-agent
date: 2026-01-21 11:09:10
categories:
  - 前端
  - AI
tags:
  - AI
  - LLM
  - AI Agent
  - LangChain
  - 实战教程
index_img: https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1920&h=400&fit=crop
cover: /images/Building Intelligent AI Applications.webp
top_img: /images/Building Intelligent AI Applications.webp
banner_img: https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1920&h=400&fit=crop
---

## 前言

![AI Neural Network](https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop)

随着 GPT-4、Claude、Gemini 等大语言模型（LLM）的爆发式发展，AI 应用开发已经进入了一个全新的时代。从简单的聊天机器人到复杂的 AI Agent，从单一模型调用到 RAG（检索增强生成）系统，开发者正在构建越来越智能的应用。

本文将带你深入了解如何构建现代 AI 应用，涵盖 LLM 集成、Prompt Engineering、AI Agent 开发和 RAG 系统实战。

## 一、LLM 基础与 API 集成

### 1.1 什么是大语言模型？

大语言模型（Large Language Model，LLM）是基于深度学习的自然语言处理模型，通过在海量文本数据上训练，学会了理解和生成人类语言。

**主流 LLM 对比：**

| 模型 | 提供商 | 特点 | 适用场景 |
|------|--------|------|----------|
| GPT-4 | OpenAI | 综合能力强，上下文长 | 通用任务、复杂推理 |
| Claude 3 | Anthropic | 安全性强，长文本 | 分析、总结、代码 |
| Gemini | Google | 多模态能力强 | 图文理解、视频分析 |
| Llama 3 | Meta | 开源，可本地部署 | 隐私要求高的场景 |

### 1.2 快速开始：OpenAI API 集成

首先安装必要的依赖：

```bash
npm install openai dotenv
```

创建基础的 LLM 调用类：

```typescript
// src/llm/openai-client.ts
import OpenAI from 'openai';

export class LLMClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: false // 生产环境必须通过后端调用
    });
  }

  async chat(
    messages: Array<{role: 'user' | 'assistant' | 'system'; content: string}>,
    model: string = 'gpt-4'
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 0.7, // 控制随机性，0-2，越高越随机
        max_tokens: 2000,  // 最大输出 token 数
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('LLM API Error:', error);
      throw error;
    }
  }

  // 流式输出，适合实时响应
  async *chatStream(
    messages: Array<{role: string; content: string}>,
    model: string = 'gpt-4'
  ): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.chat.completions.create({
      model: model,
      messages: messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}
```

**使用示例：**

```typescript
// 示例：基础对话
const llm = new LLMClient(process.env.OPENAI_API_KEY!);

const messages = [
  {
    role: 'system',
    content: '你是一个专业的技术顾问，擅长帮助开发者解决问题。'
  },
  {
    role: 'user',
    content: '请解释什么是 React Hooks？'
  }
];

const response = await llm.chat(messages);
console.log(response);
```

### 1.3 安全的 API 调用：后端封装

**重要**：永远不要在前端直接调用 LLM API，这会暴露你的 API Key！

创建 Next.js API 路由：

```typescript
// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { LLMClient } from '@/lib/llm/openai-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  // 验证请求
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' });
  }

  try {
    const llm = new LLMClient(process.env.OPENAI_API_KEY!);
    const response = await llm.chat(messages);

    res.status(200).json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

前端调用：

```typescript
// components/ChatInterface.tsx
import { useState } from 'react';

export function ChatInterface() {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
  }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="message assistant">Thinking...</div>}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="输入你的问题..."
        />
        <button onClick={sendMessage} disabled={loading}>
          发送
        </button>
      </div>
    </div>
  );
}
```

## 二、Prompt Engineering 最佳实践

### 2.1 什么是 Prompt Engineering？

Prompt Engineering（提示工程）是设计和优化输入给 LLM 的提示词，以获得更准确、更相关输出的技术。

### 2.2 核心原则

**1. 清晰具体**

```typescript
// ❌ 不好的 prompt
const badPrompt = "写代码";

// ✅ 好的 prompt
const goodPrompt = `
请用 TypeScript 写一个 React 函数组件，实现以下功能：
1. 显示一个计数器
2. 有增加和减少按钮
3. 使用 useState hook
4. 添加适当的类型注解
5. 包含基本的样式
`;
```

**2. 提供上下文**

```typescript
const systemPrompt = `
你是一位有 10 年经验的前端工程师，专精于 React 和 TypeScript。
你的回答应该：
- 技术准确，遵循最佳实践
- 代码简洁，易于维护
- 包含必要的注释
- 考虑性能和可访问性
`;
```

**3. 使用示例（Few-shot Learning）**

```typescript
const prompt = `
任务：将自然语言转换为 SQL 查询

示例 1：
输入：查找所有年龄大于 25 的用户
输出：SELECT * FROM users WHERE age > 25;

示例 2：
输入：获取销量前 10 的产品
输出：SELECT * FROM products ORDER BY sales DESC LIMIT 10;

输入：查找名字包含 "John" 的用户
输出：
`;
```

**4. 链式思考（Chain of Thought）**

```typescript
const prompt = `
问题：小明有 5 个苹果，他给了小红 2 个，然后又买了 3 个，现在他有多少个苹果？

请一步步思考：
1. 初始数量：小明有 5 个苹果
2. 给小红后：5 - 2 = 3 个
3. 买入后：3 + 3 = 6 个

答案：小明现在有 6 个苹果。

现在请用同样的方式解决：
小红有 10 个橙子，她给小丽 3 个，又吃了 2 个，然后妈妈给了她 5 个，现在她有多少个橙子？
`;
```

### 2.3 结构化 Prompt 模板

```typescript
// src/prompts/structured-prompt.ts
export interface PromptTemplate {
  role: 'system' | 'user' | 'assistant';
  template: string;
  variables?: Record<string, any>;
}

export class PromptBuilder {
  private messages: Array<{role: string; content: string}> = [];

  addSystem(content: string): this {
    this.messages.push({ role: 'system', content });
    return this;
  }

  addUser(content: string, variables?: Record<string, any>): this {
    let formattedContent = content;
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        formattedContent = formattedContent.replace(
          new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
          String(value)
        );
      });
    }
    this.messages.push({ role: 'user', content: formattedContent });
    return this;
  }

  build(): Array<{role: string; content: string}> {
    return [...this.messages];
  }
}

// 使用示例
const prompt = new PromptBuilder()
  .addSystem('你是一个专业的代码审查员')
  .addUser(`
    请审查以下 {{language}} 代码，重点关注：
    1. 代码质量
    2. 潜在的 bug
    3. 性能问题
    4. 改进建议

    代码：
    ```{{language}}
    {{code}}
    ```
  `, {
    language: 'TypeScript',
    code: 'const data = await fetch(url);'
  })
  .build();
```

## 三、构建 AI Agent

### 3.1 什么是 AI Agent？

AI Agent 是能够自主感知环境、做出决策并执行行动的 AI 系统。与传统 LLM 聊天机器人不同，Agent 可以：

- 🔧 使用工具（Tools）
- 🔄 多步推理
- 📊 访问外部数据
- 🤝 与其他 Agent 协作

![AI Agent Architecture](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop)

### 3.2 Agent 核心组件

```typescript
// src/agent/types.ts
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

export interface AgentConfig {
  name: string;
  role: string;
  tools: Tool[];
  llmClient: LLMClient;
}

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
}
```

### 3.3 实现基础 Agent

```typescript
// src/agent/base-agent.ts
import { LLMClient } from '../llm/openai-client';

export class Agent {
  protected llm: LLMClient;
  protected tools: Map<string, Tool> = new Map();
  protected memory: Array<{role: string; content: string}> = [];

  constructor(llm: LLMClient) {
    this.llm = llm;
  }

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  async think(userInput: string): Promise<string> {
    // 1. 分析用户意图
    const intent = await this.analyzeIntent(userInput);

    // 2. 决定是否需要使用工具
    if (intent.requiresTool) {
      const toolResult = await this.executeTool(intent.toolName, intent.parameters);
      return toolResult;
    }

    // 3. 直接回答
    const response = await this.llm.chat([
      { role: 'system', content: this.getSystemPrompt() },
      ...this.memory,
      { role: 'user', content: userInput }
    ]);

    // 保存到记忆
    this.memory.push({ role: 'user', content: userInput });
    this.memory.push({ role: 'assistant', content: response });

    return response;
  }

  private async analyzeIntent(userInput: string): Promise<{
    requiresTool: boolean;
    toolName?: string;
    parameters?: any;
  }> {
    const toolsDescription = Array.from(this.tools.values())
      .map(tool => `- ${tool.name}: ${tool.description}`)
      .join('\n');

    const prompt = `
      可用工具：
      ${toolsDescription}

      用户输入：${userInput}

      判断是否需要使用工具。如果需要，返回 JSON 格式：
      {
        "requiresTool": true,
        "toolName": "工具名称",
        "parameters": {参数}
      }

      如果不需要，返回：
      {
        "requiresTool": false
      }
    `;

    const response = await this.llm.chat([
      { role: 'user', content: prompt }
    ]);

    return JSON.parse(response);
  }

  private async executeTool(toolName: string, parameters: any): Promise<string> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return `工具 ${toolName} 不存在`;
    }

    try {
      const result = await tool.execute(parameters);
      return `工具执行结果：${JSON.stringify(result, null, 2)}`;
    } catch (error) {
      return `工具执行失败：${error}`;
    }
  }

  protected getSystemPrompt(): string {
    return '你是一个智能助手。';
  }
}
```

### 3.4 实用工具示例

**1. 网页搜索工具**

```typescript
// src/agent/tools/search.ts
import axios from 'axios';

export const searchTool: Tool = {
  name: 'web_search',
  description: '在互联网上搜索信息',
  parameters: {
    query: { type: 'string', description: '搜索关键词' },
    numResults: { type: 'number', description: '结果数量', default: 5 }
  },
  execute: async (params) => {
    // 使用 Google Custom Search API 或其他搜索 API
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: params.query,
        api_key: process.env.SERPAPI_KEY
      }
    });

    return {
      results: response.data.organic_results?.slice(0, params.numResults || 5)
    };
  }
};
```

**2. 代码执行工具**

```typescript
// src/agent/tools/code-executor.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const codeExecutorTool: Tool = {
  name: 'execute_code',
  description: '执行 JavaScript/TypeScript 代码并返回结果',
  parameters: {
    code: { type: 'string', description: '要执行的代码' },
    language: { type: 'string', description: '代码语言', default: 'javascript' }
  },
  execute: async (params) => {
    try {
      // 注意：生产环境需要沙箱环境，这里仅作演示
      const result = await execAsync(`node -e "${params.code}"`);
      return {
        success: true,
        output: result.stdout,
        error: result.stderr
      };
    } catch (error) {
      return {
        success: false,
        error: error
      };
    }
  }
};
```

**3. 文件操作工具**

```typescript
// src/agent/tools/file-operations.ts
import fs from 'fs/promises';
import path from 'path';

export const fileReadTool: Tool = {
  name: 'read_file',
  description: '读取文件内容',
  parameters: {
    filePath: { type: 'string', description: '文件路径' }
  },
  execute: async (params) => {
    try {
      const content = await fs.readFile(params.filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
};

export const fileWriteTool: Tool = {
  name: 'write_file',
  description: '写入文件内容',
  parameters: {
    filePath: { type: 'string', description: '文件路径' },
    content: { type: 'string', description: '文件内容' }
  },
  execute: async (params) => {
    try {
      await fs.writeFile(params.filePath, params.content, 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
};
```

### 3.5 创建专用 Agent

```typescript
// src/agents/code-review-agent.ts
import { Agent } from './base-agent';
import { codeExecutorTool } from '../agent/tools/code-executor';

export class CodeReviewAgent extends Agent {
  constructor(llm: LLMClient) {
    super(llm);
    this.registerTool(codeExecutorTool);
  }

  protected getSystemPrompt(): string {
    return `
      你是一位资深的代码审查员，专精于多种编程语言。

      审查代码时，你关注：
      1. 代码质量和可读性
      2. 潜在的 bug 和边界情况
      3. 性能优化机会
      4. 安全漏洞
      5. 最佳实践遵循情况

      你的回复应该：
      - 建设性且具体
      - 提供改进建议和代码示例
      - 解释为什么这样改进
    `;
  }

  async reviewCode(code: string, language: string): Promise<{
    summary: string;
    issues: Array<{
      severity: 'high' | 'medium' | 'low';
      line?: number;
      description: string;
      suggestion?: string;
    }>;
    overallScore: number;
  }> {
    const prompt = `
      请审查以下 ${language} 代码：

      \`\`\`${language}
      ${code}
      \`\`\`

      提供详细的审查报告，包括：
      1. 总体评价（1-10分）
      2. 发现的问题（按严重程度排序）
      3. 每个问题的具体位置和改进建议
    `;

    const response = await this.llm.chat([
      { role: 'system', content: this.getSystemPrompt() },
      { role: 'user', content: prompt }
    ]);

    // 解析结构化响应（实际应用中应该让 LLM 返回 JSON）
    return {
      summary: response,
      issues: [],
      overallScore: 8
    };
  }
}
```

## 四、RAG 系统实战

### 4.1 什么是 RAG？

RAG（Retrieval-Augmented Generation，检索增强生成）通过结合信息检索和 LLM 生成，让 AI 能够访问和利用外部知识库，大大提升了回答的准确性和可信度。

![RAG Architecture](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop)

**RAG 的优势：**
- ✅ 减少幻觉（Hallucination）
- ✅ 知识实时更新
- ✅ 可溯源引用
- ✅ 领域专业知识

### 4.2 RAG 系统架构

```
用户查询
    ↓
向量化 Embedding
    ↓
向量检索 ← → 知识库（向量数据库）
    ↓
上下文构建
    ↓
LLM 生成
    ↓
答案 + 引用
```

### 4.3 实现向量存储

首先安装依赖：

```bash
npm install @langchain/openai @langchain/pinecone pinecone-client
```

创建向量存储服务：

```typescript
// src/rag/vector-store.ts
import { PineconeClient } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';

export class VectorStore {
  private pinecone: PineconeClient;
  private embeddings: OpenAIEmbeddings;
  private index: any;

  constructor() {
    this.pinecone = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!
    });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    });
  }

  async initialize(indexName: string) {
    await this.pinecone.init({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!
    });

    this.index = this.pinecone.Index(indexName);
  }

  async addDocuments(
    documents: Array<{
      id: string;
      text: string;
      metadata?: Record<string, any>;
    }>
  ) {
    const vectors = await Promise.all(
      documents.map(async (doc) => {
        const embedding = await this.embeddings.embedQuery(doc.text);

        return {
          id: doc.id,
          values: embedding,
          metadata: {
            ...doc.metadata,
            text: doc.text
          }
        };
      })
    );

    await this.index.upsert({
      vectors: vectors,
      namespace: 'default'
    });
  }

  async similaritySearch(
    query: string,
    topK: number = 5,
    filter?: Record<string, any>
  ): Promise<Array<{id: string; score: number; metadata: any}>> {
    const queryEmbedding = await this.embeddings.embedQuery(query);

    const result = await this.index.query({
      queryRequest: {
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
        filter: filter
      }
    });

    return result.matches?.map((match: any) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata
    })) || [];
  }
}
```

### 4.4 文档处理与切分

```typescript
// src/rag/document-loader.ts
export class DocumentLoader {
  /**
   * 按字符数切分文档
   */
  static splitByCharacter(
    text: string,
    chunkSize: number = 1000,
    overlap: number = 200
  ): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = start + chunkSize;
      const chunk = text.slice(start, end);
      chunks.push(chunk);
      start = end - overlap;
    }

    return chunks;
  }

  /**
   * 按段落切分（保持语义完整性）
   */
  static splitByParagraph(text: string): string[] {
    return text
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  /**
   * 按标题层次切分（Markdown 专用）
   */
  static splitMarkdownByHeading(text: string): Array<{
    title: string;
    level: number;
    content: string;
  }> {
    const sections: Array<{title: string; level: number; content: string}> = [];
    const lines = text.split('\n');
    let currentSection = { title: 'Introduction', level: 0, content: '' };

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headingMatch) {
        // 保存当前章节
        if (currentSection.content) {
          sections.push({...currentSection});
        }

        // 开始新章节
        currentSection = {
          title: headingMatch[2],
          level: headingMatch[1].length,
          content: ''
        };
      } else {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection.content) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * 智能切分：结合多种策略
   */
  static async smartSplit(
    text: string,
    options: {
      maxSize?: number;
      overlap?: number;
      preserveStructure?: boolean;
    } = {}
  ): Promise<Array<{id: string; text: string; metadata: any}>> {
    const chunks: Array<{id: string; text: string; metadata: any}> = [];
    const { maxSize = 1000, overlap = 200, preserveStructure = true } = options;

    if (preserveStructure) {
      // 优先按段落切分
      const paragraphs = this.splitByParagraph(text);

      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];

        // 如果段落太长，进一步切分
        if (paragraph.length > maxSize) {
          const subChunks = this.splitByCharacter(paragraph, maxSize, overlap);
          subChunks.forEach((chunk, j) => {
            chunks.push({
              id: `chunk_${i}_${j}`,
              text: chunk,
              metadata: {
                source: 'paragraph',
                paragraphIndex: i,
                chunkIndex: j
              }
            });
          });
        } else {
          chunks.push({
            id: `paragraph_${i}`,
            text: paragraph,
            metadata: {
              source: 'paragraph',
              index: i
            }
          });
        }
      }
    } else {
      // 直接按字符切分
      const textChunks = this.splitByCharacter(text, maxSize, overlap);
      textChunks.forEach((chunk, i) => {
        chunks.push({
          id: `chunk_${i}`,
          text: chunk,
          metadata: { index: i }
        });
      });
    }

    return chunks;
  }
}
```

### 4.5 完整的 RAG 管道

```typescript
// src/rag/rag-pipeline.ts
import { VectorStore } from './vector-store';
import { DocumentLoader } from './document-loader';
import { LLMClient } from '../llm/openai-client';

export class RAGPipeline {
  private vectorStore: VectorStore;
  private llm: LLMClient;

  constructor(vectorStore: VectorStore, llm: LLMClient) {
    this.vectorStore = vectorStore;
    this.llm = llm;
  }

  /**
   * 索引文档
   */
  async indexDocuments(
    documents: Array<{
      id: string;
      text: string;
      metadata?: Record<string, any>;
    }>
  ) {
    const chunks = await Promise.all(
      documents.map(async (doc) => {
        const splitChunks = await DocumentLoader.smartSplit(doc.text, {
          maxSize: 500,
          overlap: 50,
          preserveStructure: true
        });

        return splitChunks.map((chunk, idx) => ({
          id: `${doc.id}_${idx}`,
          text: chunk.text,
          metadata: {
            ...doc.metadata,
            ...chunk.metadata,
            docId: doc.id
          }
        }));
      })
    );

    const allChunks = chunks.flat();
    await this.vectorStore.addDocuments(allChunks);

    console.log(`Indexed ${allChunks.length} chunks from ${documents.length} documents`);
  }

  /**
   * 查询并生成答案
   */
  async query(
    question: string,
    options: {
      topK?: number;
      filter?: Record<string, any>;
      includeSources?: boolean;
    } = {}
  ): Promise<{
    answer: string;
    sources?: Array<{
      id: string;
      text: string;
      score: number;
      metadata: any;
    }>;
  }> {
    const { topK = 5, filter, includeSources = true } = options;

    // 1. 检索相关文档
    const relevantDocs = await this.vectorStore.similaritySearch(
      question,
      topK,
      filter
    );

    // 2. 构建上下文
    const context = relevantDocs
      .map((doc, idx) => `[来源 ${idx + 1}] ${doc.metadata.text}`)
      .join('\n\n');

    // 3. 生成提示
    const prompt = `
      基于以下上下文回答问题。如果上下文中没有相关信息，请明确说明。

      上下文：
      ${context}

      问题：${question}

      答案：
    `;

    // 4. 生成答案
    const answer = await this.llm.chat([
      {
        role: 'system',
        content: '你是一个专业的助手，负责基于提供的上下文准确回答问题。'
      },
      { role: 'user', content: prompt }
    ]);

    // 5. 返回结果
    const result: any = { answer };

    if (includeSources) {
      result.sources = relevantDocs.map(doc => ({
        id: doc.id,
        text: doc.metadata.text?.substring(0, 200) + '...',
        score: doc.score,
        metadata: doc.metadata
      }));
    }

    return result;
  }
}
```

### 4.6 使用 RAG 构建知识问答系统

```typescript
// src/rag/knowledge-base.ts
import { RAGPipeline } from './rag-pipeline';
import { VectorStore } from './vector-store';
import { LLMClient } from '../llm/openai-client';

export class KnowledgeBase {
  private rag: RAGPipeline;

  constructor() {
    const vectorStore = new VectorStore();
    const llm = new LLMClient(process.env.OPENAI_API_KEY!);
    this.rag = new RAGPipeline(vectorStore, llm);
  }

  async initialize() {
    await this.rag['vectorStore'].initialize('techflow-kb');
  }

  /**
   * 从 Markdown 文件加载文档
   */
  async loadFromMarkdown(files: string[]) {
    const fs = await import('fs/promises');

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const fileName = file.split('/').pop()!;

      await this.rag.indexDocuments([{
        id: fileName.replace('.md', ''),
        text: content,
        metadata: {
          source: file,
          type: 'markdown'
        }
      }]);
    }
  }

  /**
   * 从网页加载文档
   */
  async loadFromWeb(urls: string[]) {
    const axios = (await import('axios')).default;
    const { JSDOM } = await import('jsdom');

    for (const url of urls) {
      const response = await axios.get(url);
      const dom = new JSDOM(response.data);
      const text = dom.window.document.body.textContent || '';

      await this.rag.indexDocuments([{
        id: new URL(url).hostname,
        text: text,
        metadata: {
          source: url,
          type: 'webpage'
        }
      }]);
    }
  }

  /**
   * 问答接口
   */
  async ask(question: string, topK: number = 5) {
    return await this.rag.query(question, { topK, includeSources: true });
  }
}

// 使用示例
async function main() {
  const kb = new KnowledgeBase();
  await kb.initialize();

  // 加载文档
  await kb.loadFromMarkdown([
    './docs/react-guide.md',
    './docs/vue3-guide.md',
    './docs/typescript-best-practices.md'
  ]);

  // 问答
  const answer = await kb.ask('React Hooks 有哪些最佳实践？');
  console.log('Answer:', answer.answer);
  console.log('Sources:', answer.sources);
}
```

## 五、实战项目：智能代码助手

### 5.1 项目概述

构建一个 AI 驱动的代码助手，具备以下功能：

- 💬 代码问答
- 🔍 代码搜索
- 📝 代码生成
- 🔧 代码重构建议
- 📚 文档生成

![Code Assistant Demo](https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=600&fit=crop)

### 5.2 项目结构

```
code-assistant/
├── frontend/                 # Next.js 前端
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/        # 聊天 API
│   │   │   ├── search/      # 搜索 API
│   │   │   └── generate/    # 代码生成 API
│   │   ├── page.tsx         # 主页面
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ChatBox.tsx
│   │   ├── CodeEditor.tsx
│   │   └── FileExplorer.tsx
│   └── lib/
│       ├── llm.ts
│       └── rag.ts
├── backend/                  # Python 后端（可选）
│   └── services/
│       ├── code_analysis.py
│       └── test_generation.py
└── shared/
    └── types.ts
```

### 5.3 核心实现

**Chat API：**

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { LLMClient } from '@/lib/llm';
import { KnowledgeBase } from '@/lib/rag';

const llm = new LLMClient(process.env.OPENAI_API_KEY!);
const kb = new KnowledgeBase();

export async function POST(request: NextRequest) {
  const { message, context } = await request.json();

  try {
    // 使用 RAG 增强的回答
    if (context?.useKnowledgeBase) {
      const answer = await kb.ask(message, 3);
      return NextResponse.json({
        response: answer.answer,
        sources: answer.sources
      });
    }

    // 普通对话
    const response = await llm.chat([
      {
        role: 'system',
        content: '你是一个专业的代码助手，擅长帮助开发者解决问题。'
      },
      { role: 'user', content: message }
    ]);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**代码生成 API：**

```typescript
// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { LLMClient } from '@/lib/llm';

const llm = new LLMClient(process.env.OPENAI_API_KEY!);

export async function POST(request: NextRequest) {
  const { prompt, language, context } = await request.json();

  const systemPrompt = `
    你是一个专业的代码生成助手。根据用户的需求生成代码。

    要求：
    1. 代码必须语法正确
    2. 包含必要的注释
    3. 遵循最佳实践
    4. 考虑边界情况
    5. 如果提供了上下文代码，保持风格一致
  `;

  const userPrompt = `
    语言：${language}

    用户需求：${prompt}

    ${context ? `上下文代码：\n${context}` : ''}

    请生成代码：
  `;

  try {
    const response = await llm.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    return NextResponse.json({ code: response });
  } catch (error) {
    console.error('Generate API Error:', error);
    return NextResponse.json(
      { error: 'Code generation failed' },
      { status: 500 }
    );
  }
}
```

**前端组件：**

```typescript
// components/ChatBox.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    id: string;
    text: string;
    score: number;
  }>;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useKB, setUseKB] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: { useKnowledgeBase: useKB }
        })
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        sources: data.sources
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后重试。'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">智能代码助手</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useKB}
            onChange={(e) => setUseKB(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">使用知识库</span>
        </label>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg p-4 ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="text-xs font-semibold mb-2">参考来源：</div>
                  {msg.sources.map((source, i) => (
                    <div key={i} className="text-xs mt-1 p-2 bg-white rounded">
                      <div className="font-semibold">[{source.id}]</div>
                      <div className="opacity-80">{source.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="输入你的问题..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 六、部署与优化

### 6.1 性能优化策略

**1. 缓存机制**

```typescript
// src/cache/redis-cache.ts
import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// 使用缓存包装 LLM 调用
export class CachedLLMClient extends LLMClient {
  private cache: CacheService;

  constructor(apiKey: string) {
    super(apiKey);
    this.cache = new CacheService();
  }

  async chat(messages: Array<any>, model: string = 'gpt-4'): Promise<string> {
    // 生成缓存键
    const cacheKey = `llm:${model}:${JSON.stringify(messages)}`;

    // 尝试从缓存获取
    const cached = await this.cache.get<string>(cacheKey);
    if (cached) {
      console.log('Cache hit!');
      return cached;
    }

    // 调用 API
    const response = await super.chat(messages, model);

    // 缓存结果（24小时）
    await this.cache.set(cacheKey, response, 86400);

    return response;
  }
}
```

**2. 批处理与并发**

```typescript
// 批量处理文档索引
async function batchIndexDocuments(
  documents: Array<any>,
  batchSize: number = 10
) {
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    await Promise.all(
      batch.map(doc => rag.indexDocuments([doc]))
    );
    console.log(`Processed batch ${Math.floor(i / batchSize) + 1}`);
  }
}
```

**3. 流式输出**

```typescript
// app/api/stream-chat/route.ts
export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const chunk of llm.chatStream(messages)) {
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

### 6.2 安全最佳实践

**1. API 密钥管理**

```bash
# .env.local
OPENAI_API_KEY=sk-xxx
PINECONE_API_KEY=xxx-xxx
SERPAPI_KEY=xxx

# 永远不要提交到 Git！
```

```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

**2. 内容过滤**

```typescript
// src/safety/content-filter.ts
export class ContentFilter {
  private harmfulPatterns = [
    /password/i,
    /api[_-]?key/i,
    /secret/i,
    /token/i
  ];

  async filter(content: string): Promise<{
    safe: boolean;
    filtered?: string;
    reason?: string;
  }> {
    // 检查敏感信息
    for (const pattern of this.harmfulPatterns) {
      if (pattern.test(content)) {
        return {
          safe: false,
          reason: '可能包含敏感信息'
        };
      }
    }

    // 使用 OpenAI Moderation API
    const moderation = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({ input: content })
    });

    const result = await moderation.json();

    if (result.results[0].flagged) {
      return {
        safe: false,
        reason: '内容违规'
      };
    }

    return { safe: true };
  }
}
```

**3. 速率限制**

```typescript
// src/rate-limit/limiter.ts
import { LRUCache } from 'lru-cache';

export class RateLimiter {
  private cache: LRUCache<string, number[]>;

  constructor(private maxRequests: number = 10, private windowMs: number = 60000) {
    this.cache = new LRUCache({
      max: 500,
      ttl: windowMs
    });
  }

  check(identifier: string): boolean {
    const now = Date.now();
    const requests = this.cache.get(identifier) || [];

    // 移除窗口外的请求
    const validRequests = requests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.cache.set(identifier, validRequests);
    return true;
  }
}

// Next.js API 中间件
export async function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const limiter = new RateLimiter(10, 60000); // 10 requests per minute

  if (!limiter.check(ip)) {
    return new Response('Too many requests', { status: 429 });
  }

  return NextResponse.next();
}
```

### 6.3 监控与日志

```typescript
// src/monitoring/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// 使用
logger.info({ userId, query }, 'Chat request received');
logger.error({ error }, 'LLM API failed');
```

```typescript
// src/monitoring/metrics.ts
export class Metrics {
  private counters: Map<string, number> = new Map();

  increment(name: string, value: number = 1) {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.counters);
  }
}

// 使用
const metrics = new Metrics();
metrics.increment('llm.requests.total');
metrics.increment('llm.tokens.used', tokenCount);
```

## 七、总结与展望

### 本文回顾

本文从零开始，构建了完整的 AI 应用栈：

1. ✅ **LLM 基础集成**：掌握 OpenAI API 的使用方法
2. ✅ **Prompt Engineering**：学习设计高质量的提示词
3. ✅ **AI Agent 开发**：构建能够使用工具的智能代理
4. ✅ **RAG 系统**：实现检索增强生成，提升回答准确性
5. ✅ **实战项目**：完成智能代码助手的开发

### 技术栈总结

| 层级 | 技术 | 用途 |
|------|------|------|
| **前端** | Next.js, React, TypeScript | 用户界面 |
| **后端** | Node.js, Express | API 服务 |
| **LLM** | OpenAI GPT-4 | 核心智能 |
| **向量存储** | Pinecone, Weaviate | 语义检索 |
| **框架** | LangChain | AI 应用开发 |
| **缓存** | Redis | 性能优化 |
| **监控** | Pino, Prometheus | 日志和指标 |

### 未来方向

**1. 多模态 AI**
- 图像理解与生成
- 视频分析
- 语音交互

**2. 更强的 Agent**
- 自主规划与执行
- 多 Agent 协作
- 长期记忆

**3. 边缘 AI**
- 本地模型部署
- WebGPU 加速
- 离线 AI 应用

**4. AI + Web3**
- 去中心化 AI
- 数据隐私保护
- 激励机制

### 学习资源

- 📚 [OpenAI Documentation](https://platform.openai.com/docs)
- 📚 [LangChain Documentation](https://python.langchain.com/)
- 📚 [Pinecone Learning Center](https://www.pinecone.io/learn/)
- 📚 [Andrej Karpathy's Neural Networks: Zero to Hero](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ)

---

**下一步行动建议：**

1. 选择一个实际项目需求
2. 从简单的 LLM 聊天开始
3. 逐步添加 RAG 和 Agent 能力
4. 关注用户体验和性能优化
5. 持续迭代和改进

AI 开发是一个快速发展的领域，保持学习和实验是最重要的。祝你在 AI 应用开发的旅程中收获满满！

🚀 **Happy Coding!**

---

*本文持续更新中，欢迎在评论区分享你的实践经验和问题！*

**相关文章：**
- [TypeScript完全指南](/categories/前端/TypeScript/)
- [前端工程化实战](/categories/前端/工程化/)
- [微前端架构设计](/categories/前端/架构/)
