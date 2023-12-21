import {useEffect, useRef} from 'react'

export function ImageLoader(props: ImageLoaderProps): undefined {
    const {items} = props
    const loadingRef = useRef<Array<string>>([])
    const loadedRef = useRef<Array<string>>([])
    const identifiers = items.join('|')

    function onImageLoaded(imageUrl: string, img: HTMLImageElement) {
        const id = imageIdOf(imageUrl)
        const idx = loadingRef.current.indexOf(id)

        if (idx === -1) {
            console.warn('ImageLoader: missing id', id)
            return
        }

        // 1) We expire the loading state.
        loadingRef.current.splice(idx, 1)
        // 2) We track the loaded state.
        loadedRef.current.push(id)
        // 3) We remove the loader from the document.
        unmountImageLoader(img)
    }

    useEffect(() => {
        for (const it of items) {
            const id = imageIdOf(it)
            const isLoading = loadingRef.current.includes(id)
            const isLoaded = ! isLoading && loadedRef.current.includes(id)

            if (isLoading || isLoaded) {
                // It is loading or it has been loaded. We have nothing to do.
                continue
            }

            // 1) We track the loading state.
            loadingRef.current.push(id)
            // 2) We create a loader.
            const img = createImageLoader(it, onImageLoaded)
            // 3) We attach the loader to the document.
            mountImageLoader(img)
        }
    }, [identifiers])
}

export function imageIdOf(imageUrl: string) {
    return imageUrl
}

export function createImageLoader(imageUrl: string, onEndObserver?: ImageOnEnd) {
    const img = document.createElement('img')

    function onEnd() {
        img.removeEventListener('load', onEnd)
        img.removeEventListener('error', onEnd)
        onEndObserver?.(imageUrl, img)
    }

    img.addEventListener('load', onEnd)
    img.addEventListener('error', onEnd)
    img.src = imageUrl
    img.style.width = '0'
    img.style.height = '0'
    img.style.opacity = '0'
    img.style.visibility = 'hidden'
    img.style.position = 'absolute'
    img.style.bottom = '-1000px'
    img.style.left = '-1000px'

    return img
}

export function mountImageLoader(img: HTMLImageElement) {
    document.body.appendChild(img)

    function onClean() {
        unmountImageLoader(img)
    }

    return onClean
}

export function unmountImageLoader(img: HTMLImageElement) {
    document.body.removeChild(img)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ImageLoaderProps {
    items: Array<string>
}

export interface ImageOnEnd {
    (url: string, img: HTMLImageElement): void
}
