'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
import { useEffect } from 'react';

interface ReadOnlyMarkdownViewerProps {
  content: string;
  className?: string;
}

export const ReadOnlyMarkdownViewer: React.FC<ReadOnlyMarkdownViewerProps> = ({
  content,
  className = ""
}) => {
  const lowlight = createLowlight();

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
    /^\s*[-*]{2,}\s*$/m, // Horizontal rule (e.g. ** or --)
    /^\s*\*\*\*\s*$/m,   // Horizontal rule (***)
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

  const editor = useEditor({
    immediatelyRender: false,
    editable: false, // Make it read-only
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Link.configure({
        openOnClick: true, // Allow clicking links in read-only mode
        HTMLAttributes: {
          class: 'text-blue-500 underline hover:text-blue-700 transition-colors',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Table.configure({
        resizable: false, // Disable resizing in read-only mode
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-100 dark:bg-gray-800 rounded-md p-4 font-mono text-sm my-4 overflow-x-auto',
        },
      }),
      Typography,
    ],
    content: '', // We'll set content manually in useEffect
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
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
        htmlContent = await markdownToHtml(htmlContent);
      }
      
      // Set the content
      editor.commands.setContent(htmlContent);
    };

    updateContent();
  }, [editor, content]);

  if (!editor) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <div className={`read-only-markdown-viewer ${className}`}>
      <EditorContent 
        editor={editor} 
        className="prose-content"
      />
    </div>
  );
};
