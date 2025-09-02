import { defineStore } from 'pinia'
import { store } from '@/store'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

const { wsCache } = useCache()

export interface PermissionState {
  menus: any[]
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    menus: []
  }),
  getters: {
    getMenus(): any[] {
      return this.menus
    }
  },
  actions: {
    setMenus(menus: any[]): void {
      this.menus = menus
      wsCache.set(CACHE_KEY.ROLE_ROUTERS, menus)
    },
    getMenusFromCache(): any[] {
      const cachedMenus = wsCache.get(CACHE_KEY.ROLE_ROUTERS)
      if (cachedMenus) {
        this.menus = cachedMenus
      }
      return this.menus
    }
  },
  persist: false
})

export const usePermissionStoreWithOut = () => {
  return usePermissionStore(store)
}
