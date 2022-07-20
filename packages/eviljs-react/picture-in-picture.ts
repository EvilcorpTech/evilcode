import {useCallback, useEffect} from 'react'

export function usePictureInPicture(
    videoRef: React.RefObject<HTMLVideoElement>,
    options?: {
        onEnter?(): void
        onExit?(): void
        onError?(): void
    },
) {
    const {onEnter, onError, onExit} = options ?? {}

    useEffect(() => {
        ;onEnter && videoRef.current?.addEventListener('enterpictureinpicture', onEnter, false)
        ;onExit && videoRef.current?.addEventListener('leavepictureinpicture', onExit, false)
    }, [onEnter, onExit])

    const enter = useCallback(() => {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture()
                .catch(onError)
                .then(() => videoRef.current?.requestPictureInPicture())
                .then(onEnter, onError)
        }
        else {
            videoRef.current?.requestPictureInPicture().then(onEnter, onError)
        }

    }, [onEnter, onError]) // eslint-disable-line

    const exit = useCallback(() => {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture().then(onExit, onError)
        }
    }, [onExit, onError])

    const toggle = useCallback(() => {
        if (document.pictureInPictureElement) {
            exit()
        }
        else {
            enter()
        }
    }, [enter, exit])

    return {enter, exit, toggle}
}
