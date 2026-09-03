import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Award,
  Camera,
  FileText,
  Globe,
  Link2,
  Loader2,
  MapPin,
  MessageSquare,
  Play,
  Settings,
  UserRound,
} from 'lucide-react'
import dayjs from '@/lib/dayjs'
import { useAuth } from '@/app/providers/AuthProvider'
import { PageLoader } from '@/components/loaders/PageLoader'
import { SignUpPromptModal } from '@/components/modals/SignUpPromptModal'
import { ArticleCard } from '@/features/home/components/ArticleCard'
import { adaptPublicArticle } from '@/features/articles/utils/adaptPublicArticle'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { authorSettingsApi } from '../api/authorSettings.api'
import { useMediaUpload } from '../hooks/useMediaUpload'
import { useAuthorProfile } from '../hooks/useAuthorProfile'
import type { PublicLibraryItem } from '../types/authorProfile.types'

type ProfileTab = 'articles' | 'videos' | 'library'

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function formatCount(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return String(count)
}

export function AuthorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser, isAuthenticated } = useAuth()
  const [tab, setTab] = useState<ProfileTab>('articles')
  const queryClient = useQueryClient()
  const { upload, isUploading } = useMediaUpload()
  const [bannerError, setBannerError] = useState<string | null>(null)
  const [signUpPrompt, setSignUpPrompt] = useState(false)

  const {
    profile,
    isFollowing,
    stats,
    isLoading,
    isError,
    articles,
    isLoadingArticles,
    videos,
    isLoadingVideos,
    library,
    isLoadingLibrary,
    toggleFollow,
    isTogglingFollow,
  } = useAuthorProfile(id)

  if (isLoading) {
    return <PageLoader label="Loading profile..." />
  }

  if (isError || !profile) {
    return (
      <div className="py-16 flex flex-col items-center text-center gap-3">
        <h1 className="text-2xl font-semibold text-heading">Author not found</h1>
        <p className="text-sm text-text-muted">This profile may have been moved or no longer exists.</p>
        <Link to="/" className="text-accent font-medium hover:underline text-sm">
          Back to Home
        </Link>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id
  const info = profile.authorProfile
  const displayName = info?.professionalName || profile.name
  const settingsPath = profile.role === 'reader' ? '/dashboard/reader-settings' : '/dashboard/author-settings'

  const handleBannerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setBannerError(null)
    try {
      const media = await upload(file)
      await authorSettingsApi.updateProfile({ bannerImage: media.url })
      await queryClient.invalidateQueries({ queryKey: ['authorProfile', id] })
    } catch (err) {
      setBannerError(getErrorMessage(err, 'Failed to update banner image.'))
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="relative rounded-2xl overflow-hidden">
        <div className="h-40 md:h-56 w-full bg-gradient-to-r from-accent/30 via-card-2 to-accent/10">
          {info?.bannerImage && (
            <img src={info.bannerImage} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        {isOwnProfile && (
          <label className="absolute top-3 right-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-black/50 text-white cursor-pointer hover:bg-black/65 transition-colors">
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            {isUploading ? 'Uploading...' : 'Change banner'}
            <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
          </label>
        )}

        <div className="absolute left-6 -bottom-10 md:-bottom-12">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-bg bg-accent-bg flex items-center justify-center text-2xl md:text-3xl font-semibold text-accent overflow-hidden">
            {info?.profileImage ? (
              <img src={info.profileImage} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              displayName[0]?.toUpperCase() ?? <UserRound className="w-8 h-8" />
            )}
          </div>
        </div>
      </div>

      {bannerError && <p className="text-xs text-disputed px-1">{bannerError}</p>}

      <div className="flex flex-col gap-4 pt-10 md:pt-12 px-1">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-semibold text-heading">{displayName}</h1>
              {isOwnProfile && (
                <Link
                  to={settingsPath}
                  title="Edit profile"
                  className="text-text-muted hover:text-accent transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <span className="capitalize font-medium text-text">{profile.role}</span>
              <span>·</span>
              <span>{formatCount(profile.followersCount)} Followers</span>
              {info?.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {info.location}
                  </span>
                </>
              )}
            </div>
          </div>

          {isOwnProfile ? (
            <Link
              to={settingsPath}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-border text-text hover:border-accent-border transition-colors"
            >
              Edit Profile
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => (isAuthenticated ? toggleFollow() : setSignUpPrompt(true))}
              disabled={isTogglingFollow}
              aria-pressed={isFollowing}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                isFollowing
                  ? 'border border-border text-text hover:border-disputed hover:text-disputed'
                  : 'bg-accent text-white hover:opacity-90'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {info?.bio && <p className="text-sm text-text-muted leading-relaxed max-w-2xl">{info.bio}</p>}

        {(info?.website || info?.socialLinks?.twitter || info?.socialLinks?.linkedin || info?.socialLinks?.instagram) && (
          <div className="flex items-center gap-4 text-sm text-text-muted">
            {info?.website && (
              <a
                href={info.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-accent transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Website
              </a>
            )}
            {info?.socialLinks?.twitter && (
              <a
                href={info.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-accent transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" />
                Twitter
              </a>
            )}
            {info?.socialLinks?.linkedin && (
              <a
                href={info.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-accent transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" />
                LinkedIn
              </a>
            )}
            {info?.socialLinks?.instagram && (
              <a
                href={info.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-accent transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" />
                Instagram
              </a>
            )}
          </div>
        )}

        {(info?.primaryBeats?.length ||
          info?.secondaryBeats?.length ||
          info?.areasOfExpertise?.length ||
          info?.geographicCoverage?.length ||
          info?.yearsOfExperience) && (
          <div className="flex flex-wrap items-center gap-2">
            {[
              ...(info?.primaryBeats ?? []),
              ...(info?.secondaryBeats ?? []),
              ...(info?.areasOfExpertise ?? []),
              ...(info?.geographicCoverage ?? []),
            ].map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="text-xs font-medium px-3 py-1 rounded-full bg-accent-bg text-accent"
              >
                {tag}
              </span>
            ))}
            {Boolean(info?.yearsOfExperience) && (
              <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border-2 border-amber-400 text-amber-600 dark:text-amber-400">
                <Award className="w-3.5 h-3.5" />
                {info!.yearsOfExperience} {info!.yearsOfExperience === 1 ? 'year' : 'years'} of experience
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 max-w-md gap-3 pt-2">
          <div className="rounded-xl border border-card-border bg-card px-3 py-2.5 text-center">
            <p className="text-lg font-semibold text-card-heading">{stats?.articles ?? 0}</p>
            <p className="text-xs text-card-text-dim">Articles</p>
          </div>
          <div className="rounded-xl border border-card-border bg-card px-3 py-2.5 text-center">
            <p className="text-lg font-semibold text-card-heading">{stats?.videos ?? 0}</p>
            <p className="text-xs text-card-text-dim">Videos</p>
          </div>
          <div className="rounded-xl border border-card-border bg-card px-3 py-2.5 text-center">
            <p className="text-lg font-semibold text-card-heading">{stats?.factChecksVerified ?? 0}</p>
            <p className="text-xs text-card-text-dim">Verified</p>
          </div>
        </div>
      </div>

      <div className="border-b border-border flex items-center gap-6 px-1">
        <button
          type="button"
          onClick={() => setTab('articles')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'articles' ? 'border-accent text-heading' : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          Articles
        </button>
        <button
          type="button"
          onClick={() => setTab('videos')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'videos' ? 'border-accent text-heading' : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          Videos
        </button>
        <button
          type="button"
          onClick={() => setTab('library')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'library' ? 'border-accent text-heading' : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          Library
        </button>
      </div>

      {tab === 'articles' ? (
        isLoadingArticles ? (
          <PageLoader label="Loading articles..." />
        ) : articles.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-1">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={adaptPublicArticle(article)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted px-1">No published articles yet.</p>
        )
      ) : tab === 'videos' ? (
        isLoadingVideos ? (
          <PageLoader label="Loading videos..." />
        ) : videos.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-1">
            {videos.map((video) => (
              <Link
                key={video.id}
                to={`/videos/${video.id}`}
                className="group flex flex-col rounded-2xl border border-card-border bg-card overflow-hidden hover:border-accent-border transition-colors"
              >
                <div className="relative aspect-video bg-card-2 overflow-hidden">
                  {video.thumbnailUrl && (
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                  )}
                  <span className="absolute bottom-2 right-2 text-[11px] font-medium px-1.5 py-0.5 rounded bg-black/70 text-white">
                    {formatDuration(video.duration)}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-1">
                  <h4 className="text-sm font-semibold text-card-heading leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-xs text-card-text-dim">
                    {formatCount(video.views)} views ·{' '}
                    {dayjs(video.publishedAt ?? video.createdAt).format('MMM D, YYYY')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted px-1">No published videos yet.</p>
        )
      ) : isLoadingLibrary ? (
        <PageLoader label="Loading library..." />
      ) : library.length ? (
        <div className="flex flex-col gap-2 px-1">
          {library.map((item) => (
            <LibraryItemRow key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted px-1">
          Nothing liked yet — articles, videos, and comments you like will show up here.
        </p>
      )}

      {signUpPrompt && (
        <SignUpPromptModal
          title="Sign up to follow authors"
          description="Create a free account to follow authors and get notified about their new stories."
          onClose={() => setSignUpPrompt(false)}
        />
      )}
    </div>
  )
}

const LIBRARY_ICONS: Record<PublicLibraryItem['type'], typeof FileText> = {
  article: FileText,
  video: Play,
  comment: MessageSquare,
}

function LibraryItemRow({ item }: { item: PublicLibraryItem }) {
  const Icon = LIBRARY_ICONS[item.type]

  return (
    <Link
      to={item.href}
      className="flex items-center gap-3 rounded-xl border border-card-border bg-card px-4 py-3 hover:border-accent-border transition-colors"
    >
      {item.thumbnailUrl ? (
        <img src={item.thumbnailUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-accent-bg text-accent flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] uppercase tracking-wide font-medium text-text-dim">{item.type}</span>
        <p className="text-sm font-medium text-card-heading truncate">{item.title}</p>
        <p className="text-xs text-card-text-dim">{dayjs(item.createdAt).format('MMM D, YYYY')}</p>
      </div>
    </Link>
  )
}
