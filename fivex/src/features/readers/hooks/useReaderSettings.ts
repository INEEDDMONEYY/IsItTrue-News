import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { readerSettingsApi, type ReaderProfileApi } from '../api/readerSettings.api'
import type {
  ReaderSettings,
  ReaderExperienceSettings,
  ReaderContentPreferences,
} from '../types/readerSettings.types'

const DEFAULT_SETTINGS: ReaderSettings = {
  experience: {
    fontSize: 'medium',
    theme: 'light',
    distractionFreeMode: false,
    autoSaveProgress: true,
    showEstimatedReadingTime: true,
    summariesFirst: false,
  },

  content: {
    topics: [],
    regions: [],
    formats: [],
    depth: 'quick-summaries',
  },
}

function fromApi(profile: ReaderProfileApi): ReaderSettings {
  return {
    experience: {
      fontSize: profile.fontSize ?? 'medium',
      theme: profile.theme ?? 'light',
      distractionFreeMode: profile.distractionFreeMode ?? false,
      autoSaveProgress: profile.autoSaveProgress ?? true,
      showEstimatedReadingTime: profile.showEstimatedReadingTime ?? true,
      summariesFirst: profile.summariesFirst ?? false,
    },
    content: {
      topics: profile.topics ?? [],
      regions: profile.regions ?? [],
      formats: profile.formats ?? [],
      depth: profile.depth ?? 'quick-summaries',
    },
  }
}

function toApi(settings: ReaderSettings): Partial<ReaderProfileApi> {
  return {
    fontSize: settings.experience.fontSize,
    theme: settings.experience.theme,
    distractionFreeMode: settings.experience.distractionFreeMode,
    autoSaveProgress: settings.experience.autoSaveProgress,
    showEstimatedReadingTime: settings.experience.showEstimatedReadingTime,
    summariesFirst: settings.experience.summariesFirst,
    topics: settings.content.topics,
    regions: settings.content.regions,
    formats: settings.content.formats,
    depth: settings.content.depth,
  }
}

export function useReaderSettings() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['readers', 'settings', 'mine'],
    queryFn: readerSettingsApi.getMine,
  })

  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS)

  // Seed local editable state once the real profile has loaded, without
  // clobbering in-progress edits on every background refetch.
  useEffect(() => {
    if (data) {
      setSettings(fromApi(data.readerProfile))
    }
  }, [data])

  const updateExperience = (updates: Partial<ReaderExperienceSettings>) => {
    setSettings((current) => ({
      ...current,
      experience: {
        ...current.experience,
        ...updates,
      },
    }))
  }

  const updateContent = (updates: Partial<ReaderContentPreferences>) => {
    setSettings((current) => ({
      ...current,
      content: {
        ...current.content,
        ...updates,
      },
    }))
  }

  const saveMutation = useMutation({
    mutationFn: async (next: ReaderSettings) => {
      await readerSettingsApi.updateProfile(toApi(next))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['readers', 'settings', 'mine'] }),
  })

  const saveSettings = async () => {
    await saveMutation.mutateAsync(settings)
    return settings
  }

  return {
    settings,
    isLoading,
    isSaving: saveMutation.isPending,
    updateExperience,
    updateContent,
    saveSettings,
  }
}
