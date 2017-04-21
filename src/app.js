import './helpers/context_menu.js'
import './helpers/external_links.js'
import './helpers/window.js'

import { remote } from 'electron'

import CreateTree from './tree/jsTree'

$('#open_btn').click(OpenFile)

function OpenFile () {
  remote.dialog.showOpenDialog({
    title: 'Select the EXCEL file',
    filters: [{name: 'EXCEL', extensions: ['xlsx']}],
    properties: ['openFile']
  }, (file) => {
    if (file === undefined) return

    CreateTree.ROOT_PATH = file[0]
    CreateTree.ROOT_SHEET = null

    container.jstree(true).refresh()
    // TODO: handle format errors here
  })
}

const container = $('.tree')
CreateTree(container)
