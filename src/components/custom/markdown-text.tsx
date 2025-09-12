import { Markdown, MarkdownProps } from '@lobehub/ui';

const textStylesContent = `**Bold text** and __also bold__

*Italic text* and _also italic_

***Bold and italic combined***

~~Strikethrough text~~

This is <sub>subscript</sub> text

This is <sup>superscript</sup> text

This is <ins>underlined</ins> text

Press <kbd>mod+c</kbd>
`;

export const MarkdownText = ({ content, className }: { content?: string; className?: string }) => {
  const options: MarkdownProps = {
    children: content || textStylesContent,
    fontSize: 18,
    headerMultiple: 1,
    lineHeight: 1.8,
    marginMultiple: 2,
  };

  return (
    <div className={className}>
      <Markdown {...options} />
    </div>
  );
};
