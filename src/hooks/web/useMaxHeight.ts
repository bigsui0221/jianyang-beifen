import { isNumber } from '@/utils/is'

interface useMaxHeight {
  main: string
  subtract: (number | string)[]
}

export const useMaxHeight = (config: useMaxHeight) => {
  const { main, subtract } = config

  const getHeight = () => {
    const mh = document.getElementById(main)?.offsetHeight ?? 0
    let sh = 0
    for (let i = 0; i < subtract.length; i++) {
      const e = subtract[i]
      isNumber(e) ? (sh += e) : (sh += Number(document.getElementById(e)?.offsetHeight))
    }
    return mh - sh
  }

  return {
    getHeight
  }
}
