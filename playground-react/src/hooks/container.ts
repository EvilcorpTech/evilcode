import {useContainer as useEvilContainer} from '@eviljs/react/container'
import {type Container} from '../container'

export {type Container} from '../container'
export const useContainer = useEvilContainer<Container>
