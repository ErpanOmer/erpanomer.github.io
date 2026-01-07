type DebounceOptions = {
    leading?: boolean
    trailing?: boolean
}

type DebouncedFunction<T extends (...args: any[]) => any> = {
    (...args: Parameters<T>): void
    cancel: () => void
    flush: () => ReturnType<T> | undefined
}

export default function debounce<T extends (...args: any[]) => any>(
    fn: T,
    wait = 300,
    options: DebounceOptions = {}
): DebouncedFunction<T> {
    let timer: ReturnType<typeof setTimeout> | null = null
    let lastArgs: Parameters<T> | null = null
    let lastThis: any = null
    let result: ReturnType<T> | undefined

    const { leading = false, trailing = true } = options

    const invoke = () => {
        if (!lastArgs) return
        result = fn.apply(lastThis, lastArgs)
        lastArgs = lastThis = null
    }

    const debounced = function (this: any, ...args: Parameters<T>) {
        lastArgs = args
        lastThis = this

        const shouldCallNow = leading && !timer

        if (timer) {
            clearTimeout(timer)
        }

        timer = setTimeout(() => {
            timer = null
            if (trailing) {
                invoke()
            }
        }, wait)

        if (shouldCallNow) {
            invoke()
        }
    } as DebouncedFunction<T>

    debounced.cancel = () => {
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
        lastArgs = lastThis = null
    }

    debounced.flush = () => {
        if (timer) {
            clearTimeout(timer)
            timer = null
            invoke()
        }
        return result
    }

    return debounced
}
