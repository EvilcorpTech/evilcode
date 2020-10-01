import {createExampleRoute} from './routes/example'
import {createSimpleRoute} from '@eviljs/std-web/router.js'

export const HomeRoute = createSimpleRoute('/')
export const ThemeRoute = createSimpleRoute('/theme')
export const ExampleRoute = createExampleRoute()
