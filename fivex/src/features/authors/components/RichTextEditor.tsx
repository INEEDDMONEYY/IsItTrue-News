import { useEffect, useRef, useState, type ClipboardEvent, type DragEvent, type ReactNode } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
} from 'lucide-react'
import { ARTICLE_BODY_CLASSNAME } from '@/features/articles/utils/articleBody'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useMediaUpload } from '../hooks/useMediaUpload'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  ariaLabel?: string
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
  'w-8 h-8 rounded-md flex items-center justify-center transition-colors disabled:opacity-50'
const TOOLBAR_BTN_IDLE = 'text-text-muted hover:text-accent hover:bg-surface-2'
// A format that is switched on where the caret is: filled, so it reads as "on" until it is turned off.
const TOOLBAR_BTN_ACTIVE = 'bg-accent-bg text-accent ring-1 ring-accent-border'

interface FormatState {
  bold: boolean
  italic: boolean
  underline: boolean
  unorderedList: boolean
  orderedList: boolean
  link: boolean
  // 'p', 'h2', 'h3' or 'blockquote'; empty when it is something else or mixed.
  block: string
  // The execCommand size value ('2', '3', '5', '6'); empty when it is something else or mixed.
  size: string
}

const NO_FORMATS: FormatState = {
  bold: false,
  italic: false,
  underline: false,
  unorderedList: false,
  orderedList: false,
  link: false,
  block: '',
  size: '',
}

// What is applied at the caret or across the selection, as the browser itself reports it.
function readFormats(editor: HTMLElement, selection: Selection): FormatState {
  const state = (command: string) => {
    try {
      return document.queryCommandState(command)
    } catch {
      return false
    }
  }
  const value = (command: string) => {
    try {
      return document.queryCommandValue(command)
    } catch {
      return ''
    }
  }

  const anchor = selection.anchorNode
  const element = anchor && anchor.nodeType === Node.TEXT_NODE ? anchor.parentElement : (anchor as Element | null)
  const insideLink = Boolean(element?.closest('a') && editor.contains(element.closest('a')))

  // Browsers report the block as "p", "h2", "<p>" or "div" depending on the engine.
  const block = value('formatBlock').toLowerCase().replace(/[<>]/g, '')
  const size = value('fontSize')

  return {
    bold: state('bold'),
    italic: state('italic'),
    underline: state('underline'),
    unorderedList: state('insertUnorderedList'),
    orderedList: state('insertOrderedList'),
    link: insideLink,
    block: block === 'div' ? 'p' : FORMAT_BLOCK_OPTIONS.some((option) => option.tag === block) ? block : '',
    size: FONT_SIZE_OPTIONS.some((option) => option.execValue === size) ? size : '',
  }
}

const sameFormats = (a: FormatState, b: FormatState) => (Object.keys(a) as (keyof FormatState)[]).every((key) => a[key] === b[key])

// A toolbar toggle. It looks "on" and says so to assistive tech for as long as its format applies at the caret.
function FormatButton({
  label,
  active,
  onToggle,
  children,
}: {
  label: string
  active: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={active ? `${label} (on)` : label}
      aria-label={label}
      aria-pressed={active}
      // Pressing a button would otherwise pull focus, and the selection, out of the text.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onToggle}
      className={`${TOOLBAR_BTN_CLASS} ${active ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN_IDLE}`}
    >
      {children}
    </button>
  )
}

/**
 * A lightweight contentEditable rich-text editor. A minimal toolbar built on execCommand keeps things simple
 * rather than pulling in a full WYSIWYG library. The writing surface uses the same typography as a published
 * article, so what the author types looks like what readers will read.
 *
 * Images are uploaded and inserted by URL. Inlining them as base64 would make the article too large to save.
 */
export function RichTextEditor({ value, onChange, placeholder, ariaLabel = 'Article text' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // The caret position when the author asked for an image, since choosing a file moves focus away.
  const savedRangeRef = useRef<Range | null>(null)
  const { upload, isUploading } = useMediaUpload()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [formats, setFormats] = useState<FormatState>(NO_FORMATS)

  const refreshFormats = () => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection || !selection.anchorNode || !editor.contains(selection.anchorNode)) return
    const next = readFormats(editor, selection)
    setFormats((current) => (sameFormats(current, next) ? current : next))
  }

  // The caret moving, or a selection changing, changes which formats apply, so the toolbar follows it.
  useEffect(() => {
    document.addEventListener('selectionchange', refreshFormats)
    return () => document.removeEventListener('selectionchange', refreshFormats)
  }, [])

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
    // Turning bold on at a bare caret fires no selection change, so read the result straight away.
    refreshFormats()
  }

  const rememberCaret = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange()
    }
  }

  const restoreCaret = () => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    const selection = window.getSelection()
    if (!selection) return
    selection.removeAllRanges()
    if (savedRangeRef.current) {
      selection.addRange(savedRangeRef.current)
    } else {
      const end = document.createRange()
      end.selectNodeContents(editor)
      end.collapse(false)
      selection.addRange(end)
    }
  }

  const handleInsertLink = () => {
    // Inside a link the button is "on", and pressing it takes the link off again.
    if (formats.link) {
      runCommand('unlink')
      return
    }
    rememberCaret()
    const entered = window.prompt('Link URL')?.trim()
    if (!entered) return
    restoreCaret()
    runCommand('createLink', /^[a-z][a-z0-9+.-]*:/i.test(entered) ? entered : `https://${entered}`)
  }

  const insertUploadedImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files can be added to the text.')
      return
    }
    setUploadError(null)
    try {
      const media = await upload(file)
      restoreCaret()
      runCommand('insertImage', media.url)
    } catch (error) {
      setUploadError(getErrorMessage(error, 'Image upload failed. Please try again.'))
    }
  }

  const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) void insertUploadedImage(file)
  }

  const imageFrom = (files: FileList | null | undefined) =>
    Array.from(files ?? []).find((file) => file.type.startsWith('image/'))

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const image = imageFrom(event.clipboardData.files)
    if (!image) return
    event.preventDefault()
    rememberCaret()
    void insertUploadedImage(image)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    const image = imageFrom(event.dataTransfer.files)
    if (!image) return
    event.preventDefault()
    rememberCaret()
    void insertUploadedImage(image)
  }

  return (
    <div className="rounded-xl border border-border bg-bg overflow-hidden focus-within:ring-2 focus-within:ring-accent-border">
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-border bg-surface"
      >
        <select
          aria-label="Text format"
          value={formats.block}
          onChange={(e) => runCommand('formatBlock', `<${e.target.value}>`)}
          className={`text-xs px-1.5 py-1 rounded-md focus:outline-none ${
            formats.block && formats.block !== 'p' ? 'bg-accent-bg text-accent font-medium' : 'bg-transparent text-text hover:bg-surface-2'
          }`}
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
          aria-label="Font size"
          value={formats.size}
          onChange={(e) => runCommand('fontSize', e.target.value)}
          className={`text-xs px-1.5 py-1 rounded-md focus:outline-none ${
            formats.size && formats.size !== '3' ? 'bg-accent-bg text-accent font-medium' : 'bg-transparent text-text hover:bg-surface-2'
          }`}
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

        <FormatButton label="Bold" active={formats.bold} onToggle={() => runCommand('bold')}>
          <Bold className="w-4 h-4" />
        </FormatButton>
        <FormatButton label="Italic" active={formats.italic} onToggle={() => runCommand('italic')}>
          <Italic className="w-4 h-4" />
        </FormatButton>
        <FormatButton label="Underline" active={formats.underline} onToggle={() => runCommand('underline')}>
          <Underline className="w-4 h-4" />
        </FormatButton>

        <div className="w-px h-5 bg-border mx-1" />

        <FormatButton label="Bullet list" active={formats.unorderedList} onToggle={() => runCommand('insertUnorderedList')}>
          <List className="w-4 h-4" />
        </FormatButton>
        <FormatButton label="Numbered list" active={formats.orderedList} onToggle={() => runCommand('insertOrderedList')}>
          <ListOrdered className="w-4 h-4" />
        </FormatButton>

        <div className="w-px h-5 bg-border mx-1" />

        <FormatButton label={formats.link ? 'Remove link' : 'Insert link'} active={formats.link} onToggle={handleInsertLink}>
          <LinkIcon className="w-4 h-4" />
        </FormatButton>
        <button
          type="button"
          title="Insert image"
          aria-label="Insert image"
          // Keeps the caret in the text so the image lands where the author was writing.
          onMouseDown={rememberCaret}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`${TOOLBAR_BTN_CLASS} ${TOOLBAR_BTN_IDLE}`}
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          aria-label="Choose an image to insert"
          onChange={handleImageSelected}
          className="hidden"
        />
        {isUploading && <span className="text-xs text-text-muted ml-1">Uploading image…</span>}
      </div>

      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        onInput={emitChange}
        onPaste={handlePaste}
        onDrop={handleDrop}
        data-placeholder={placeholder}
        className={`${ARTICLE_BODY_CLASSNAME} min-h-[28rem] px-5 py-4 focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-text-dim`}
      />

      {uploadError && (
        <p role="alert" className="px-4 py-2 border-t border-border text-xs text-disputed">
          {uploadError}
        </p>
      )}
    </div>
  )
}
