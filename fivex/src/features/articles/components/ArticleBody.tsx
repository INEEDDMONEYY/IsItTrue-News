import { ARTICLE_BODY_CLASSNAME } from '../utils/articleBody'

interface ArticleBodyHtmlProps {
  // Must come from sanitizeArticleHtml.
  html: string
  // Stops select/copy, used for the locked preview shown to anonymous readers.
  protectedContent?: boolean
}

export function ArticleBodyHtml({ html, protectedContent = false }: ArticleBodyHtmlProps) {
  return (
    <div
      className={ARTICLE_BODY_CLASSNAME}
      style={protectedContent ? { userSelect: 'none' } : undefined}
      onCopy={protectedContent ? (event) => event.preventDefault() : undefined}
      onCut={protectedContent ? (event) => event.preventDefault() : undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
