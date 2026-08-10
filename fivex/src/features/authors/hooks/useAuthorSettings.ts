import { useState } from 'react'
import type {
  AuthorSettings,
  AuthorProfileSettings,
  AuthorExpertiseSettings,
  AuthorPublishingSettings,
  AuthorNotificationPreferences,
} from '../types/authorSettings.types'

const initialSettings: AuthorSettings = {
  profile: {
    displayName: 'Jordan Mitchell',
    professionalName: 'Jordan Mitchell',
    bio: 'Investigative journalist focused on accountability, public policy, and stories that deserve deeper scrutiny.',
    location: 'Denver, Colorado',
    website: '',
    profileImage: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      instagram: '',
    },
  },

  expertise: {
    primaryBeats: ['Investigations', 'Politics'],
    secondaryBeats: ['Public Policy', 'Local Government'],
    areasOfExpertise: ['Investigative Reporting', 'Fact Checking'],
    geographicCoverage: ['Colorado', 'United States'],
    languages: ['English'],
    yearsOfExperience: 5,
  },

  publishing: {
    defaultCategory: 'Investigations',
    defaultVisibility: 'draft',
    factCheckingEnabled: true,
    sourceAttributionEnabled: true,
    allowEditorialSuggestions: true,
  },

  preferences: {
    editorialUpdates: true,
    assignmentNotifications: true,
    revisionNotifications: true,
    collaborationNotifications: true,
    investigationNotifications: true,
  },

  status: {
    status: 'active',
    editorialStatus: 'good-standing',
    factCheckAccess: true,
    investigationAccess: true,
  },
}

export function useAuthorSettings() {
  const [settings, setSettings] =
    useState<AuthorSettings>(initialSettings)

  const updateProfile = (
    updates: Partial<AuthorProfileSettings>,
  ) => {
    setSettings((current) => ({
      ...current,
      profile: {
        ...current.profile,
        ...updates,
      },
    }))
  }

  const updateExpertise = (
    updates: Partial<AuthorExpertiseSettings>,
  ) => {
    setSettings((current) => ({
      ...current,
      expertise: {
        ...current.expertise,
        ...updates,
      },
    }))
  }

  const updatePublishing = (
    updates: Partial<AuthorPublishingSettings>,
  ) => {
    setSettings((current) => ({
      ...current,
      publishing: {
        ...current.publishing,
        ...updates,
      },
    }))
  }

  const updatePreferences = (
    updates: Partial<AuthorNotificationPreferences>,
  ) => {
    setSettings((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        ...updates,
      },
    }))
  }

  const saveSettings = async () => {
    // API integration will be added here.
    return settings
  }

  return {
    settings,
    updateProfile,
    updateExpertise,
    updatePublishing,
    updatePreferences,
    saveSettings,
  }
}