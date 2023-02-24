import type { DebouncedFunc, ThrottleSettings } from 'lodash'
import type { Plugin } from '../types'
import _ from 'lodash'
import { watch, ref, unref, computed } from 'vue'

const useThrottlePlugin: Plugin<any, any[]> = (
  fetchInstance,
  { throttleWait, throttleLeading, throttleTrailing }
) => {
  const throttledRef = ref<DebouncedFunc<any>>()

  const throttleWaitRef = computed<number | undefined>(() =>
    unref(throttleWait)
  )

  const optionsRef = computed<ThrottleSettings>(() => {
    const options: ThrottleSettings = {}

    if (throttleLeading !== undefined) {
      options.leading = unref(throttleLeading)
    }
    if (throttleTrailing !== undefined) {
      options.trailing = unref(throttleTrailing)
    }

    return options
  })

  watch([throttleWaitRef, optionsRef], () => {
    if (throttleWaitRef.value) {
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance)

      throttledRef.value = _.throttle(
        (callback: (...args: any[]) => any) => {
          callback()
        },
        throttleWaitRef.value,
        optionsRef.value
      )

      // throttle runAsync should be promise
      // https://github.com/lodash/lodash/issues/4400#issuecomment-834800398
      fetchInstance.runAsync = (...args) => {
        return new Promise((resolve, reject) => {
          throttledRef.value?.(() => {
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject)
          })
        })
      }

      return () => {
        fetchInstance.runAsync = _originRunAsync
        throttledRef.value?.cancel()
      }
    }
  })

  if (!throttleWaitRef.value) {
    return {}
  }

  return {
    onCancel: () => {
      throttledRef.value?.cancel()
    }
  }
}

export default useThrottlePlugin
