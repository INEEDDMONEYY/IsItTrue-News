import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  slug: string;
  featured?: boolean;
  /** Duration in seconds. Videos of 180s (3 min) or less show up in the Short Videos section. */
  durationSeconds: number;
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

const mockVideos: Video[] = [
  {
    id: "1",
    title: "The Story Behind the Numbers",
    thumbnail: "/src/assets/images/time-to-move.jpg",
    category: "Investigations",
    slug: "the-story-behind-the-numbers",
    featured: true,
    durationSeconds: 480,
  },
  {
    id: "2",
    title: "What the Evidence Actually Shows",
    thumbnail: "/src/assets/images/speak-up.jpg",
    category: "Fact Checks",
    slug: "what-the-evidence-actually-shows",
    featured: true,
    durationSeconds: 150,
  },
  {
    id: "3",
    title: "Inside a Changing Community",
    thumbnail: "/src/assets/images/same-blood.png",
    category: "Local",
    slug: "inside-a-changing-community",
    durationSeconds: 90,
  },
  {
    id: "4",
    title: "The Facts Behind the Claim",
    thumbnail: "/src/assets/images/power.png",
    category: "Fact Checks",
    slug: "the-facts-behind-the-claim",
    durationSeconds: 165,
  },
  {
    id: "5",
    title: "What Happens When Systems Fail",
    thumbnail: "/src/assets/images/lost.png",
    category: "Investigations",
    slug: "what-happens-when-systems-fail",
    durationSeconds: 540,
  },
  {
    id: "6",
    title: "The People Behind the Story",
    thumbnail: "/src/assets/images/sophie.png",
    category: "Culture",
    slug: "the-people-behind-the-story",
    durationSeconds: 120,
  },
  {
    id: "7",
    title: "Understanding the Bigger Picture",
    thumbnail: "/src/assets/images/caitlin-clark.png",
    category: "Explainers",
    slug: "understanding-the-bigger-picture",
    durationSeconds: 360,
  },
  {
    id: "8",
    title: "A Closer Look at What Changed",
    thumbnail: "/src/assets/images/time-to-move.jpg",
    category: "Local",
    slug: "a-closer-look-at-what-changed",
    durationSeconds: 420,
  },
  {
    id: "9",
    title: "Separating Fact From Fiction",
    thumbnail: "/src/assets/images/speak-up.jpg",
    category: "Explainers",
    slug: "separating-fact-from-fiction",
    durationSeconds: 175,
  },
  {
    id: "10",
    title: "Following the Evidence",
    thumbnail: "/src/assets/images/power.png",
    category: "Investigations",
    slug: "following-the-evidence",
    durationSeconds: 300,
  },
];

const SHORT_VIDEO_MAX_SECONDS = 180;

const shortVideos = mockVideos.filter(
  (video) => video.durationSeconds <= SHORT_VIDEO_MAX_SECONDS,
);

const categories = Array.from(
  new Set(mockVideos.map((video) => video.category)),
);

function VideoCard({ video }: { video: Video }) {
  return (
    <Link
      to={`/videos/${video.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={video.thumbnail}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg">
            <Play
              size={20}
              fill="currentColor"
              className="ml-0.5"
            />
          </span>
        </div>

        <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white">
          {formatDuration(video.durationSeconds)}
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-900 transition-colors group-hover:text-slate-600">
          {video.title}
        </h3>
      </div>
    </Link>
  );
}

export default function VideosPage() {
  const featuredVideos = mockVideos.filter((video) => video.featured);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              Video
            </span>

            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Watch the stories behind the truth.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Explore investigative reporting, fact checks, explainers,
              and stories from our newsroom through video.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Featured Videos */}
        {featuredVideos.length > 0 && (
          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Featured
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Featured videos
                </h2>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {featuredVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}

        {/* Short Videos (<= 3 min) */}
        {shortVideos.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Quick Watch
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Short Videos
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Quick stories, 3 minutes or less.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shortVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        <div className="mt-16 space-y-14">
          {categories.map((category) => {
            const categoryVideos = mockVideos.filter(
              (video) => video.category === category,
            );

            if (categoryVideos.length === 0) {
              return null;
            }

            return (
              <section key={category}>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                      Videos
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-950">
                      {category}
                    </h2>
                  </div>

                  <Link
                    to={`/videos/category/${category
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="group hidden items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950 sm:flex"
                  >
                    View all
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categoryVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>

                <Link
                  to={`/videos/category/${category
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950 sm:hidden"
                >
                  View all {category} videos
                  <ArrowRight size={16} />
                </Link>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
