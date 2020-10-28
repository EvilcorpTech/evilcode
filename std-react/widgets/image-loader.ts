import React from 'react'
const {useEffect, useRef} = React

export function ImageLoader(props: ImageLoaderProps) {
    const {items} = props
    const loadingRef = useRef<Array<string>>([])
    const loadedRef = useRef<Array<string>>([])
    const identifiers = items.map(it => it.src)

    function onImageLoaded(image: Image, img: HTMLImageElement) {
        const id = imageId(image)
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
            const id = imageId(it)
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
    }, identifiers)

    return null
}

export function imageId(image: Image) {
    return image.src
}

export function createImageLoader(image: Image, onEndObserver?: ImageOnEnd) {
    const img = document.createElement('img')

    function onEnd() {
        img.removeEventListener('load', onEnd)
        img.removeEventListener('error', onEnd)
        onEndObserver?.(image, img)
    }

    img.addEventListener('load', onEnd)
    img.addEventListener('error', onEnd)
    img.src = image.src
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

    function unmount() {
        unmountImageLoader(img)
    }

    return unmount
}

export function unmountImageLoader(img: HTMLImageElement) {
    document.body.removeChild(img)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ImageLoaderProps {
    items: Array<Image>
}

export interface Image {
    src: string
}

export interface ImageOnEnd {
    (image: Image, img: HTMLImageElement): void
}
