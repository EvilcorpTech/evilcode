import {useContainer as useStdContainer} from '@eviljs/react/container'
import type {Container} from './container-apis'

export type {Container} from './container-apis'
export const useContainer = useStdContainer<Container>
