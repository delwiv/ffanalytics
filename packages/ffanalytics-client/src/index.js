const ffanalyticsUrl = 'https://ffanalytics.wildredbeard.tech'

const getCache = () => {
  if (typeof window === 'undefined') {
    if (!global.ffaCache) {
      global.ffaCache = new Map()
    }
    return global.ffaCache
  }
  if (!window.__ffaCache__) {
    window.__ffaCache__ = new Map()
  }
  return window.__ffaCache__
}

export const configureFfanalytics = (sanityClient, ffaConfig) => {
  console.log('configureFfanalytics')

  const cache = getCache()

  let token = cache.get('ffa-token')
  let queue = cache.get('ffa-queue')

  if (!queue) {
    queue = []
    cache.set('ffa-queue', queue)
  }

  if (!sanityClient || !ffaConfig) {
    console.error('Missing sanityClient or config')
    return sanityClient
  }

  const { ffaClientId, ffaPublicKey, ...data } = ffaConfig

  if (!ffaClientId || !ffaPublicKey) {
    console.error('Missing ffaClientId or ffaPublicKey')
    return sanityClient
  }

  const callFfa = async (events) => {
    const token = cache.get('ffa-token')
    console.log('callFfa ', { token })
    if (!token) {
      return
    }
    try {
      const response = await fetch(`${ffanalyticsUrl}/api/events`, {
        headers: {
          'ffanalytics-client-id': ffaClientId,
          'ffanalytics-token': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ events }),
      })

      const result = await response.json()

      if (response.status !== 200) {
        console.info('ffanalytics call failed', result)
      }
    } catch (err) {
      console.info('ffanalytics call failed (global catch)', err)
    }
  }

  if (sanityClient.ffaConfigured === true) {
    return sanityClient
  }

  setInterval(() => {
    if (queue.length > 0 && token) {
      callFfa(queue)
      cache.set('ffa-queue', [])
      return
    }

    if (!token && queue.length === 0) {
      cache.set('ffa-queue', [
        {
          name: 'ffaInit',
          payload: { ffaClientId },
          date: new Date(),
          ...data,
        },
      ])
    }
  }, 2_000)

  const originalFetch = sanityClient.fetch

  sanityClient.fetch = async (query, params, ...config) => {
    const event = {
      name: 'sanityCall',
      payload: { params, query, config },
      date: new Date(),
      ...data,
    }
    const queue = cache.get('ffa-queue')
    cache.set('ffa-queue', queue.concat(event))
    return originalFetch.call(sanityClient, query, params)
  }

  sanityClient.ffaConfigured = true

  if (!token) {
    fetch(`${ffanalyticsUrl}/api/auth/request-token`, {
      method: 'POST',
      headers: {
        'ffanalytics-client-id': ffaClientId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ffaPublicKey,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log({ data })
        token = data.token
        if (!token) {
          return
        }
        cache.set('ffa-token', token)
        const queue = cache.get('ffa-queue')
        if (queue.length > 0) {
          callFfa(queue)
          cache.set('ffa-queue', [])
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return sanityClient
}
