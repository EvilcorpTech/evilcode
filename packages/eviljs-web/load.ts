export function loadScript(url: string, options?: LoadScriptOptions): Promise<HTMLScriptElement> {
    const root = options?.root ?? document.head
    const clean = options?.clean ?? false
    const scriptSelector = `script[src="${url}"]`

    const promise = new Promise<HTMLScriptElement>((resolve, reject) => {
        const element = document.querySelector(scriptSelector)

        if (element) {
            resolve(element as HTMLScriptElement)
            return
        }

        const loader = document.createElement('script')
        loader.src = url
        loader.async = true
        loader.onload = onLoad
        loader.onerror = onError

        function onLoad() {
            if (clean) {
                root.removeChild(loader)
            }
            resolve(loader)
        }
        function onError() {
            reject(undefined)
        }

        root.appendChild(loader)
    })

    return promise
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LoadScriptOptions {
    root?: undefined | HTMLElement
    clean?: undefined | boolean
}
