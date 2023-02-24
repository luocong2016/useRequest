import type { UseRequestOptions, Plugin, Service } from './types'
import { useRequestImplement } from './useRequestImplement'

import useAutoRunPlugin from './plugins/useAutoRunPlugin'
import useDebouncePlugin from './plugins/useDebouncePlugin'
import useLoadingDelayPlugin from './plugins/useLoadingDelayPlugin'
import usePollingPlugin from './plugins/usePollingPlugin'
import useRefreshOnWindowFocusPlugin from './plugins/useRefreshOnWindowFocusPlugin'
import useThrottlePlugin from './plugins/useThrottlePlugin'
import useRetryPlugin from './plugins/useRetryPlugin'
import useCachePlugin from './plugins/useCachePlugin'

export function useRequest<TData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options?: UseRequestOptions<TData, TParams>,
  plugins?: Plugin<TData, TParams>[]
) {
  return useRequestImplement<TData, TParams>(service, options, [
    ...(plugins || []),
    useDebouncePlugin,
    useLoadingDelayPlugin,
    usePollingPlugin,
    useRefreshOnWindowFocusPlugin,
    useThrottlePlugin,
    useAutoRunPlugin,
    useCachePlugin,
    useRetryPlugin
  ] as Plugin<TData, TParams>[])
}
