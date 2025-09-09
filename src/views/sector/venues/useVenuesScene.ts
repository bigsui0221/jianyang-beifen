import { ref } from 'vue'

export type VenuesSceneKey = 'floodControl' | 'waterEnvironment' | 'waterSupplyDrainage'

const active = ref<VenuesSceneKey>('floodControl')

export function useVenuesScene() {
  const setScene = (key: VenuesSceneKey) => (active.value = key)
  return { active, setScene }
}
