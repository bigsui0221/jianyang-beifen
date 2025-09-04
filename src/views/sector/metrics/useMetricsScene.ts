import { ref } from 'vue'

export type MetricsSceneKey = 'publicSecurity' | 'publicManagement' | 'publicService'

const active = ref<MetricsSceneKey>('publicSecurity')

export function useMetricsScene() {
  const setScene = (key: MetricsSceneKey) => (active.value = key)
  return { active, setScene }
}
