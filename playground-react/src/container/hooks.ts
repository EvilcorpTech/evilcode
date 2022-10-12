import {useContainer as useCoreContainer} from '@eviljs/react/container'
import type {Container} from './apis'

export type {Container} from './apis'
export const useContainer = useCoreContainer<Container>
