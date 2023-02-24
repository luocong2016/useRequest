import type { DebouncedFunc, DebounceSettings } from 'lodash'
import type { Plugin } from '../types'
import _ from 'lodash'
import { watch, computed, ref, unref } from 'vue'

const useDebouncePlugin: Plugin<any, any[]> = (
  fetchInstance,
  { debounceWait, debounceLeading, debounceTrailing, debounceMaxWait }
) => {
  const debouncedRef = ref<DebouncedFunc<any>>()

  const debounceWaitRef = computed<number | undefined>(() =>
    unref(debounceWait)
  )

  const optionsRef = computed(() => {
    const ret: DebounceSettings = {}
    if (debounceLeading !== undefined) {
      ret.leading = unref(debounceLeading)
    }
    if (debounceTrailing !== undefined) {
      ret.trailing = unref(debounceTrailing)
    }
    if (debounceMaxWait !== undefined) {
      ret.maxWait = unref(debounceMaxWait)
    }
    return ret
  })

  watch([debounceWaitRef, optionsRef], () => {
    if (debounceWaitRef.value) {
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance)

      debouncedRef.value = _.debounce(
        (callback: (...args: any[]) => any) => {
          callback()
        },
        debounceWaitRef.value,
        optionsRef.value
      )

      // debounce runAsync should be promise
      // https://github.com/lodash/lodash/issues/4400#issuecomment-834800398
      fetchInstance.runAsync = (...args) => {
        return new Promise((resolve, reject) => {
          debouncedRef.value?.(() => {
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject)
          })
        })
      }

      return () => {
        debouncedRef.value?.cancel()
        fetchInstance.runAsync = _originRunAsync
      }
    }
  })

  if (!debounceWait) {
    return {}
  }

  return {
    onCancel: () => {
      debouncedRef.value?.cancel()
    }
  }
}

export default useDebouncePlugin
