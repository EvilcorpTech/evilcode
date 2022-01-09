import Path from 'path'
import Fs from 'fs'

/*
* Requires every JavaScript (.js) files inside a directory.
* Directory path must be absolute.
*
* requireAll('/abs/path/to/dir')
*/
export function requireAll(dir: string) {
    if (! dir.startsWith('/')) {
        throw 'Directory path must be absolute. Given: ' + dir
    }

    function tryReadingDir(dir: string) {
        try {
            return Fs.readdirSync(dir)
        }
        catch (error) {
            return
        }
    }

    const files = tryReadingDir(dir)

    if (! files) {
        return
    }

    const reqs: Array<RequireAllEntry> = []

    for (const file of files) {
        const fileExt = Path.extname(file)

        // Fastest check first.
        if (fileExt !== '.js') {
            continue
        }

        const filePath = Path.join(dir, file)
        const fileStats = Fs.statSync(filePath)

        const isFile =
            fileStats.isFile()
            || fileStats.isSymbolicLink()

        if (! isFile) {
            continue
        }

        const item = {
            path: filePath,
            dir,
            file,
            name: Path.basename(file, '.js'),
            ext: 'js',
            exports: require(filePath),
        }

        reqs.push(item)
    }

    return reqs
}

/*
* Requires every JavaScript (.js) files inside a directory mapping the filename
* with the exported content.
* Directory path must be absolute.
* See `requireAll()` for more information.
*
* importApis('/abs/path/to/dir')
*/
export function importApis(dir: string) {
    const imports = requireAll(dir)

    const apis = imports?.reduce((set, it) => {
        set[it.name] = it.exports

        return set
    }, {} as Record<string, unknown>)

    return apis
}

/*
* Augments an object with modules dynamically required.
*
* EXAMPLE
*
* const api = buildApi().add('/abs/myApi1').add('/abs/myApi2').end()
* const api = buildApi().withPath(__dirname).add('myApi1').add('myApi2').end()
* const api = buildApi(otherApi, {path: __dirname}).add('myApi1').add('myApi2').end()
*/
export function buildApi(baseApis?: Record<string, unknown>, buildOptions?: BuildApiOptions) {
    const apis: Record<string, unknown> = {...baseApis}

    let basePath = buildOptions?.path

    const self = {
        withPath(path: string) {
            basePath = path

            return self
        },
        add(module: string, options?: BuildApiOptions) {
            const dir = options?.path ?? basePath
            const name = Path.basename(module)
            const modulePath = dir
                ? Path.join(dir, module) // A relative path.
                : module // An absolute path.

            apis[name] = require(modulePath)

            return self
        },
        end() {
            return apis
        },
    }

    return self
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BuildApiOptions {
    path?: string
}

export interface RequireAllEntry {
    path: string
    dir: string
    file: string
    name: string
    ext: string
    exports: unknown
}
