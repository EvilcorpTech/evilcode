import type {RouterFactory} from '@eviljs/react/router'
import {createHashRouter, createPathRouter} from '@eviljs/react/router'
import {BasePath, RouterType} from '~/env/apis'

export const createRouter: RouterFactory = RouterType === 'path'
    ? observer => createPathRouter(observer, {basePath: BasePath})
    : observer => createHashRouter(observer, {basePath: BasePath})
