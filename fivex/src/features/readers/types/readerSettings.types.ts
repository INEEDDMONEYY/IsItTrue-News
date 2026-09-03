export interface ReaderExperienceSettings {
  fontSize: 'small' | 'medium' | 'large'
  theme: 'light' | 'dark' | 'sepia'
  distractionFreeMode: boolean
  autoSaveProgress: boolean
  showEstimatedReadingTime: boolean
  summariesFirst: boolean
}

export interface ReaderContentPreferences {
  topics: string[]
  regions: string[]
  formats: string[]
  depth: 'quick-summaries' | 'full-investigative'
}

export interface ReaderSettings {
  experience: ReaderExperienceSettings
  content: ReaderContentPreferences
}
