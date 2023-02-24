import type { Plugin } from '../types'
import { ref, watch, unref } from 'vue'

// support refreshDeps & ready
const useAutoRunPlugin: Plugin<any, any[]> = (
  fetchInstance,
  {
    manual,
    ready = true,
    defaultParams = [],
    refreshDeps = [],
    refreshDepsAction
  }
) => {
  const hasAutoRun = ref(false)

  watch(
    () => unref(ready),
    readyVal => {
      if (!manual && readyVal) {
        hasAutoRun.value = true
        fetchInstance.run(...defaultParams)
      }
    }
  )

  if (refreshDeps.length) {
    watch(refreshDeps, () => {
      if (hasAutoRun.value) {
        return
      }
      if (!manual) {
        if (refreshDepsAction) {
          refreshDepsAction()
        } else {
          fetchInstance.refresh()
        }
      }
    })
  }

  return {
    onBefore: () => {
      if (!unref(ready)) {
        return {
          stopNow: true
        }
      }
    }
  }
}

useAutoRunPlugin.onInit = ({ ready = true, manual }) => {
  return {
    loading: !manual && unref(ready)
  }
}

export default useAutoRunPlugin
