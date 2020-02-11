// Types
import {MonacoType, FLUXLANGID, Server} from 'src/types'
import {completion, sendMessage} from 'src/external/monaco.lspMessages'
import {get} from 'lodash'

import {
  MonacoToProtocolConverter,
  ProtocolToMonacoConverter,
} from 'monaco-languageclient/lib/monaco-converter'
import {CompletionItem} from 'monaco-languageclient/lib/services'

const m2p = new MonacoToProtocolConverter()
const p2m = new ProtocolToMonacoConverter()

export const registerCompletion = (monaco: MonacoType, server: Server) => {
  const completionProvider = monaco.languages.registerCompletionItemProvider(
    FLUXLANGID,
    {
      provideCompletionItems: (model, position, context) => {
        const versionID = model.getVersionId()
        const wordUntil = model.getWordUntilPosition(position)
        const defaultRange = new monaco.Range(
          position.lineNumber,
          wordUntil.startColumn,
          position.lineNumber,
          wordUntil.endColumn
        )
        const response = sendMessage(
          completion(
            m2p.asPosition(position.lineNumber, position.column),
            context,
            versionID
          ),
          server
        )

        const completionItems = get(
          response,
          'result.items',
          null
        ) as CompletionItem[]

        if (!completionItems) {
          return
        }
        return p2m.asCompletionResult(completionItems, defaultRange)
      },
    }
  )
  return completionProvider
}