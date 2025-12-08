'use client'

import { useState } from 'react'
import { Bold, Italic, Link, Image, Code } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState('edit')

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const toolbarButtons = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertMarkdown('**', '**'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertMarkdown('*', '*'),
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertMarkdown('[', '](url)'),
    },
    {
      icon: Image,
      label: 'Image',
      action: () => insertMarkdown('![alt](', ')'),
    },
    {
      icon: Code,
      label: 'Code Block',
      action: () => insertMarkdown('```\n', '\n```'),
    },
  ]

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b bg-gray-50 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {toolbarButtons.map((button) => (
                <Button
                  key={button.label}
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  title={button.label}
                >
                  <button.icon size={16} />
                </Button>
              ))}
            </div>
            <TabsList>
              <TabsTrigger value="edit">編集</TabsTrigger>
              <TabsTrigger value="preview">プレビュー</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="edit" className="m-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Markdownで記述してください...'}
            className="min-h-[500px] border-0 rounded-none focus-visible:ring-0 font-mono"
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0 p-6 min-h-[500px]">
          {value ? (
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-12">
              プレビューする内容がありません
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
