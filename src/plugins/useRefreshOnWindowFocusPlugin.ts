import type { Plugin } from "../types";
import { ref, unref, onUnmounted, watch, computed, isRef } from "vue";
import { limit, subscribeFocus } from "../utils";

const useRefreshOnWindowFocusPlugin: Plugin<any, any[]> = (
  fetchInstance,
  { refreshOnWindowFocus, focusTimespan = 5000 }
) => {
  const unsubscribeRef = ref<() => void>();

  const stopSubscribe = () => {
    unsubscribeRef.value?.();
  };

  const source = computed(() => [refreshOnWindowFocus, focusTimespan].filter(isRef));

  watch(
    source,
    () => {
      if (unref(refreshOnWindowFocus)) {
        const limitRefresh = limit(fetchInstance.refresh.bind(fetchInstance), unref(focusTimespan));
        unsubscribeRef.value = subscribeFocus(() => {
          limitRefresh();
        });
      } else {
        stopSubscribe();
      }
    },
    {
      immediate: true,
      deep: true,
    }
  );

  onUnmounted(() => {
    stopSubscribe();
  });

  return {};
};

export default useRefreshOnWindowFocusPlugin;
