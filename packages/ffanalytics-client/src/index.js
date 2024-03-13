const ffanalyticsUrl = 'http://localhost:3060'

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

  const { ffaClientId, ffaPublicKey, userAgent } = ffaConfig

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

  if (queue.length > 0 && token) {
    callFfa(queue).then(() => {
      cache.set('ffa-queue', [])
    })
  } else if (!token) {
    cache.set('ffa-queue', [
      {
        name: 'ffaInit',
        payload: { ffaClientId },
        userAgent,
        date: new Date(),
      },
    ])
  }

  if (sanityClient.ffaConfigured === true) {
    return sanityClient
  }

  const originalFetch = sanityClient.fetch

  sanityClient.fetch = async (query, params, ...config) => {
    try {
      const event = {
        name: 'sanityCall',
        payload: { params, query, config },
        userAgent,
        date: new Date(),
      }
      if (cache.get('ffa-token')) {
        callFfa([event])
      } else {
        cache.set('ffa-queue', cache.get('ffa-queue').push(event))
      }
    } catch (error) {
      console.error('ffanalytics send event failed')
    }
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