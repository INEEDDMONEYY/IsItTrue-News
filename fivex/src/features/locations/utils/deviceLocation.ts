export type DeviceLocationResult =
  | { status: 'ok'; latitude: number; longitude: number }
  | { status: 'denied' | 'unavailable' | 'timeout' | 'unsupported' }

/**
 * Asks for the device position once, after an explicit reader action.
 * It does not watch the position, and the caller must not store the coordinates.
 */
export function requestDeviceLocation(): Promise<DeviceLocationResult> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return Promise.resolve({ status: 'unsupported' })
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({ status: 'ok', latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) resolve({ status: 'denied' })
        else if (error.code === error.TIMEOUT) resolve({ status: 'timeout' })
        else resolve({ status: 'unavailable' })
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  })
}
