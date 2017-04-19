import './helpers/context_menu.js'
import './helpers/external_links.js'
import './helpers/window.js'

import { remote } from 'electron'
import fs from 'fs'
import CreateTree from './tree/jsTree'

$('#open_btn').click(OpenFile)

function OpenFile () {
  remote.dialog.showOpenDialog({
    title: 'Select the JSON file',
    filters: [{name: 'JSON', extensions: ['json']}],
    properties: ['openFile']
  }, (file) => {
    if (file === undefined) return
    // TODO: handle format errors here
    fs.readFile(file[0], 'utf-8', (err, data) => {
      if (err) throw err
      if (data) {
        container.jstree(true).settings.core.data = JSON.parse(data)
        container.jstree(true).refresh()
      }
    })
  })
}

const container = $('.tree')
CreateTree(container)

container.on('select_node.jstree', (evt, data) => {
  const node = data.node
  if (node.parent) {
    const parentNode = container.jstree(true).get_node(node.parent)
    if (parentNode && parentNode.original.prefix) {
      container.jstree(true).set_text(parentNode, parentNode.original.prefix + node.text)
      parentNode.data = node.data
    }
  }
})

container.on('rename_node.jstree', (evt, data) => {
  const node = data.node
  const newData = data.text

  if (node.original.prefix) {
    container.jstree(true).set_text(node, node.original.prefix + newData)
  } else {
    container.jstree(true).set_text(node, newData)
  }
})
