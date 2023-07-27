import {useCallback, useEffect} from 'react'

export function usePictureInPicture(
    videoRef: React.RefObject<HTMLVideoElement>,
    options?: undefined | {
        onEnter?: undefined | (() => void)
        onExit?: undefined | (() => void)
        onError?: undefined | (() => void)
    },
) {
    const {onEnter, onError, onExit} = options ?? {}

    useEffect(() => {
        if (onEnter) {
            videoRef.current?.addEventListener('enterpictureinpicture', onEnter, false)
        }
        if (onExit) {
            videoRef.current?.addEventListener('leavepictureinpicture', onExit, false)
        }
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

    }, [onEnter, onError])

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
