import React from 'react'
const {useEffect} = React

export function useEscKey(onKey: () => void) {
    useEffect(() => {
        function onEsc(event: KeyboardEvent) {
            switch (event.key) {
                case 'Escape':
                    onKey()
                break
            }
        }

        function unmount() {
            document.removeEventListener('keyup', onEsc, false)
        }

        document.addEventListener('keyup', onEsc, false)

        return unmount
    }, [onKey])
}
