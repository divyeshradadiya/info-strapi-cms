'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Typography from '@tiptap/extension-typography';
import { createLowlight } from 'lowlight';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  List, 
  ListOrdered, 
  Quote, 
  Minus, 
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Eye,
  Edit3
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  outputFormat?: 'html' | 'markdown'; // New prop to specify output format
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing...",
  className = "",
  outputFormat = 'html'
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'markdown'>('visual');
  const [markdownSource, setMarkdownSource] = useState<string>('');
  const lowlight = createLowlight();
  
  // Initialize turndown service for HTML to Markdown conversion
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  });

  // Utility function to detect if content is likely markdown
  const isMarkdown = (text: string): boolean => {
    if (!text) return false;
    // Check for common markdown patterns
    const markdownPatterns = [
      /^#{1,6}\s+/m, // Headers
      /\*\*.*\*\*/,  // Bold
      /\*.*\*/,      // Italic
      /^\s*[\*\-\+]\s+/m, // Unordered lists
      /^\s*\d+\.\s+/m, // Ordered lists
      /```[\s\S]*```/, // Code blocks
      /`[^`]+`/,     // Inline code
      /^\>.*/m,      // Blockquotes
    ];
    return markdownPatterns.some(pattern => pattern.test(text));
  };

  // Convert markdown to HTML
  const markdownToHtml = async (markdown: string): Promise<string> => {
    try {
      return await marked(markdown);
    } catch (error) {
      console.error('Error converting markdown to HTML:', error);
      return markdown;
    }
  };

  // Convert HTML to markdown
  const htmlToMarkdown = (html: string): string => {
    try {
      return turndownService.turndown(html);
    } catch (error) {
      console.error('Error converting HTML to markdown:', error);
      return html;
    }
  };
  
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-100 dark:bg-gray-800 rounded-md p-4 font-mono text-sm',
        },
      }),
      Typography,
    ],
    content: '', // We'll set content manually in useEffect
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (outputFormat === 'markdown') {
        onChange(htmlToMarkdown(html));
      } else {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (!editor) return;

    const updateContent = async () => {
      let htmlContent = content || '';
      
      // If content looks like markdown, convert it to HTML
      if (htmlContent && isMarkdown(htmlContent)) {
        setMarkdownSource(htmlContent); // Store original markdown
        htmlContent = await markdownToHtml(htmlContent);
      } else {
        // If HTML content, convert to markdown for source view
        setMarkdownSource(htmlToMarkdown(htmlContent));
      }
      
      // Only update if content is different
      if (editor.getHTML() !== htmlContent) {
        editor.commands.setContent(htmlContent);
      }
    };

    updateContent();
  }, [editor, content]);

  // Sync markdown source when switching to markdown view
  useEffect(() => {
    if (viewMode === 'markdown' && editor) {
      const currentHtml = editor.getHTML();
      setMarkdownSource(htmlToMarkdown(currentHtml));
    }
  }, [viewMode, editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    
    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        {/* Text Formatting */}
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('strike') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className="h-8 w-8 p-0"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('code') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className="h-8 w-8 p-0"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="h-8 w-8 p-0"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="h-8 w-8 p-0"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="h-8 w-8 p-0"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Block Elements */}
        <Button
          type="button"
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Media & Links */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className="h-8 w-8 p-0"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          className="h-8 w-8 p-0"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addTable}
          className="h-8 w-8 p-0"
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* View Mode Toggle */}
        <Button
          type="button"
          variant={viewMode === 'visual' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('visual')}
          className="h-8 w-8 p-0"
          title="Visual Editor"
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={viewMode === 'markdown' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('markdown')}
          className="h-8 w-8 p-0"
          title="Markdown Source"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      {viewMode === 'visual' ? (
        <EditorContent 
          editor={editor} 
          className="bg-white dark:bg-gray-950"
        />
      ) : (
        <Textarea
          value={markdownSource}
          onChange={(e) => {
            setMarkdownSource(e.target.value);
            if (outputFormat === 'markdown') {
              onChange(e.target.value);
            } else {
              // Convert markdown to HTML and update
              markdownToHtml(e.target.value).then(html => {
                onChange(html);
                if (editor) {
                  editor.commands.setContent(html);
                }
              });
            }
          }}
          placeholder={placeholder}
          className="min-h-[200px] p-4 font-mono text-sm border-0 resize-none focus:ring-0 bg-white dark:bg-gray-950"
          style={{ fontFamily: 'monospace' }}
        />
      )}
    </div>
  );
};
