import './helpers/context_menu.js'
import './helpers/external_links.js'
import './helpers/window.js'

import { remote } from 'electron'
import fs from 'fs'

$('#open_btn').click(OpenFile)

function OpenFile () {
  remote.dialog.showOpenDialog({
    title: 'Select the JSON file',
    filters: [{name: 'JSON', extensions: ['json']}],
    properties: ['openFile']
  }, (file) => {
    if (file === undefined) return
    fs.readFile(file[0], 'utf-8', (err, data) => {
      if (err) throw err
      if (data) {
        console.log($('#tree').jstree(true))
        $('.tree').jstree(true).settings.core.data = JSON.parse(data)
        $('.tree').jstree(true).refresh()
      }
    })
  })
}

$('.tree').jstree({
  'core': {
    'animation': 0,
    'themes': {
      'dots': false,
      'stripes': true
    },
    'check_callback': true
  },
  'types': {
    '#': {
      'valid_children': ['task']
    },
    'task': {
      'icon': 'glyphicon glyphicon-tasks',
      'valid_children': ['']
    }
  },
  'plugins': ['themes', 'contextmenu', 'dnd', 'search', 'types', 'state']
})
