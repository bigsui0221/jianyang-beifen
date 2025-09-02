/**
 * 菜单工具函数
 */

/**
 * 检查是否是外部链接
 * @param path 路径
 * @returns 是否是外部链接
 */
export function isExternalLink(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://')
}

/**
 * 处理菜单点击事件
 * @param path 菜单路径
 * @param router Vue Router 实例
 */
export function handleMenuClick(path: string, router: any) {
  if (isExternalLink(path)) {
    // 外部链接，在新窗口打开
    window.open(path, '_blank')
  } else {
    // 内部路由，使用 router.push
    router.push(path)
  }
}

/**
 * 过滤菜单数据，分离内部路由和外部链接
 * @param menus 菜单数据
 * @returns 分离后的菜单数据
 */
export function filterMenus(menus: any[]) {
  const internalMenus: any[] = []
  const externalMenus: any[] = []

  menus.forEach((menu) => {
    if (isExternalLink(menu.path)) {
      externalMenus.push(menu)
    } else {
      internalMenus.push(menu)
    }
  })

  return {
    internal: internalMenus,
    external: externalMenus
  }
}
