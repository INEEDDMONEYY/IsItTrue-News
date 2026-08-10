import { useEffect, useRef } from 'react'
import { Bold, Italic, Underline, Image as ImageIcon, Link as LinkIcon, List, ListOrdered } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const FONT_SIZE_OPTIONS = [
  { label: 'Small', execValue: '2' },
  { label: 'Normal', execValue: '3' },
  { label: 'Large', execValue: '5' },
  { label: 'X-Large', execValue: '6' },
]

const FORMAT_BLOCK_OPTIONS = [
  { label: 'Paragraph', tag: 'p' },
  { label: 'Heading', tag: 'h2' },
  { label: 'Subheading', tag: 'h3' },
  { label: 'Quote', tag: 'blockquote' },
]

const TOOLBAR_BTN_CLASS =
  'w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-accent hover:bg-surface-2 transition-colors'

/**
 * A lightweight contentEditable rich-text editor. There's no articles API yet
 * (and this whole feature is mock/local for now), so a minimal toolbar built
 * on execCommand keeps things simple rather than pulling in a full WYSIWYG
 * library — swap this out for something like TipTap once the backend exists.
 */
export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set the initial content once on mount; after that the DOM owns its own
  // state so typing doesn't fight React re-renders / cursor position.
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const emitChange = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    emitChange()
  }

  const handleInsertLink = () => {
    const url = window.prompt('Link URL')
    if (!url) return
    runCommand('createLink', url)
  }

  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        runCommand('insertImage', reader.result)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="rounded-xl border border-border bg-bg overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-border bg-surface">
        <select
          onChange={(e) => {
            const tag = e.target.value
            runCommand('formatBlock', `<${tag}>`)
            e.target.value = ''
          }}
          defaultValue=""
          className="text-xs bg-transparent text-text px-1.5 py-1 rounded-md hover:bg-surface-2 focus:outline-none"
        >
          <option value="" disabled>
            Format
          </option>
          {FORMAT_BLOCK_OPTIONS.map((option) => (
            <option key={option.tag} value={option.tag}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => {
            runCommand('fontSize', e.target.value)
            e.target.value = ''
          }}
          defaultValue=""
          className="text-xs bg-transparent text-text px-1.5 py-1 rounded-md hover:bg-surface-2 focus:outline-none"
        >
          <option value="" disabled>
            Font size
          </option>
          {FONT_SIZE_OPTIONS.map((option) => (
            <option key={option.execValue} value={option.execValue}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="w-px h-5 bg-border mx-1" />

        <button type="button" title="Bold" onClick={() => runCommand('bold')} className={TOOLBAR_BTN_CLASS}>
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" title="Italic" onClick={() => runCommand('italic')} className={TOOLBAR_BTN_CLASS}>
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Underline"
          onClick={() => runCommand('underline')}
          className={TOOLBAR_BTN_CLASS}
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          type="button"
          title="Bullet list"
          onClick={() => runCommand('insertUnorderedList')}
          className={TOOLBAR_BTN_CLASS}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Numbered list"
          onClick={() => runCommand('insertOrderedList')}
          className={TOOLBAR_BTN_CLASS}
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button type="button" title="Insert link" onClick={handleInsertLink} className={TOOLBAR_BTN_CLASS}>
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Insert image"
          onClick={handleImageButtonClick}
          className={TOOLBAR_BTN_CLASS}
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelected}
          className="hidden"
        />
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={emitChange}
        onBlur={emitChange}
        data-placeholder={placeholder}
        className="prose-editor min-h-[220px] max-h-[480px] overflow-y-auto px-3.5 py-3 text-sm text-heading focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-text-dim [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-accent-border [&_blockquote]:pl-3 [&_blockquote]:text-text-muted [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
      />
    </div>
  )
}
