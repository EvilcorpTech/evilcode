import {scheduleMacroTaskUsingMessageChannel, scheduleMacroTaskUsingPostMessage, scheduleMacroTaskUsingTimeout, scheduleMicroTaskUsingMutationObserver, scheduleMicroTaskUsingPromise} from '../packages/@eviljs/std/eventloop.js'

console.log('Group 1')
scheduleMicroTaskUsingPromise(() => console.log('[Micro] Promise (1)'))
scheduleMicroTaskUsingMutationObserver(() => console.log('[Micro] MutationObserver (1)'))
scheduleMacroTaskUsingTimeout(() => console.log('[Macro] Timeout (1)'))
scheduleMacroTaskUsingPostMessage(() => console.log('[Macro] PostMessage (1)'))
scheduleMacroTaskUsingMessageChannel(() => console.log('[Macro] MessageChannel (1)'))

console.log('Group 2')
scheduleMicroTaskUsingPromise(() => console.log('[Micro] Promise (2)'))
scheduleMicroTaskUsingMutationObserver(() => console.log('[Micro] MutationObserver (2)'))
scheduleMacroTaskUsingTimeout(() => console.log('[Macro] Timeout (2)'))
scheduleMacroTaskUsingPostMessage(() => console.log('[Macro] PostMessage (2)'))
scheduleMacroTaskUsingMessageChannel(() => console.log('[Macro] MessageChannel (2)'))
