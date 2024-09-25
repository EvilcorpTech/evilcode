import {isFunction} from '@eviljs/std/type-is.js'
import Repl from 'repl'

export function ShellService(container: ShellContainer): Repl.REPLServer {
    const {ShellSpec: shellSpec} = container

    const spec = {
        ...shellSpec,
        services: {
            container,
            ...shellSpec?.services,
        },
    }

    return createShell(spec)
}

export function createShell(spec?: undefined | ShellSpec): Repl.REPLServer {
    const services = spec?.services ?? {}
    const self = {} as Record<string, any>

    for (const serviceId in services) {
        const serviceImpl = services[serviceId]

        self[serviceId] = isFunction(serviceImpl)
            ? serviceImpl.bind(self, self)
            : serviceImpl
    }

    const shell = Repl.start('node> ')
    shell.context.shell = self
    shell.on('exit', process.exit)

    return shell
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ShellContainer {
    ShellSpec?: ShellSpec
}

export interface ShellSpec {
    services?: Record<string, any>
}
