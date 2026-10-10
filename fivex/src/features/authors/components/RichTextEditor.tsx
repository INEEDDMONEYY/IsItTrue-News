import { useEffect, useRef, useState, type ClipboardEvent, type DragEvent } from 'react'
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
  'w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-accent hover:bg-surface-2 transition-colors disabled:opacity-50'

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
          aria-label="Font size"
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

        <button type="button" title="Bold" aria-label="Bold" onClick={() => runCommand('bold')} className={TOOLBAR_BTN_CLASS}>
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" title="Italic" aria-label="Italic" onClick={() => runCommand('italic')} className={TOOLBAR_BTN_CLASS}>
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Underline"
          aria-label="Underline"
          onClick={() => runCommand('underline')}
          className={TOOLBAR_BTN_CLASS}
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          type="button"
          title="Bullet list"
          aria-label="Bullet list"
          onClick={() => runCommand('insertUnorderedList')}
          className={TOOLBAR_BTN_CLASS}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Numbered list"
          aria-label="Numbered list"
          onClick={() => runCommand('insertOrderedList')}
          className={TOOLBAR_BTN_CLASS}
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button type="button" title="Insert link" aria-label="Insert link" onClick={handleInsertLink} className={TOOLBAR_BTN_CLASS}>
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Insert image"
          aria-label="Insert image"
          // Keeps the caret in the text so the image lands where the author was writing.
          onMouseDown={rememberCaret}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={TOOLBAR_BTN_CLASS}
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
