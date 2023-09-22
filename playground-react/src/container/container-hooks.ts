import {useContainer as useCoreContainer} from '@eviljs/react/container'
import type {Container} from './container-apis'

export type {Container} from './container-apis'
export const useContainer = useCoreContainer<Container>
