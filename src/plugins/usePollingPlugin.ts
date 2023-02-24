import { ref, watch } from 'vue'
import type { Plugin, Timeout } from '../types'
import { isDocumentVisible, subscribeReVisible } from '../utils'

const usePollingPlugin: Plugin<any, any[]> = (
  fetchInstance,
  { pollingInterval, pollingWhenHidden = true, pollingErrorRetryCount = -1 }
) => {
  const timerRef = ref<Timeout>()
  const unsubscribeRef = ref<() => void>()
  const countRef = ref<number>(0)

  const stopPolling = () => {
    if (timerRef.value) {
      clearTimeout(timerRef.value)
    }
    unsubscribeRef.value?.()
  }

  watch(
    () => pollingInterval,
    val => {
      if (!val) {
        stopPolling()
      }
    }
  )

  if (!pollingInterval) {
    return {}
  }

  return {
    onBefore: () => {
      stopPolling()
    },
    onError: () => {
      countRef.value += 1
    },
    onSuccess: () => {
      countRef.value = 0
    },
    onFinally: () => {
      if (
        pollingErrorRetryCount === -1 ||
        // When an error occurs, the request is not repeated after pollingErrorRetryCount retries
        (pollingErrorRetryCount !== -1 &&
          countRef.value <= pollingErrorRetryCount)
      ) {
        // if pollingWhenHidden = false && document is hidden, then stop polling and subscribe revisible
        if (!pollingWhenHidden && !isDocumentVisible()) {
          unsubscribeRef.value = subscribeReVisible(() => {
            fetchInstance.refresh()
          })
          return
        }

        timerRef.value = setTimeout(() => {
          fetchInstance.refresh()
        }, pollingInterval)
      } else {
        countRef.value = 0
      }
    },
    onCancel: () => {
      stopPolling()
    }
  }
}

export default usePollingPlugin
