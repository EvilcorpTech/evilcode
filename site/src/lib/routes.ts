import {Arg, createRoute, createSimpleRoute} from '@eviljs/web/route'

export const HomeRoute = createSimpleRoute('/')
export const ThemeRoute = createSimpleRoute('/theme')
export const DocRoute = createSimpleRoute('/doc/' + Arg)
