import {readExcel} from './parser'

const nodeTypes = {
  'default': {
    'icon': 'glyphicon glyphicon-list'
  },
  'link': {
    'icon': 'glyphicon glyphicon-link'
  },
  'boolean': {
    'icon': 'glyphicon glyphicon-adjust'
  },
  'number': {
    'icon': 'glyphicon glyphicon-pencil'
  }
}

export default function CreateTree (container) {
  // create tree with some default settings
  container.jstree({
    core: {
      animation: 0,
      themes: {
        dots: false,
        stripes: true
      },
      data: getData,
      check_callback: true
    },
    types: nodeTypes,
    contextmenu: {
      items: ContextMenuItems
    },
    plugins: ['themes', 'contextmenu', 'dnd', 'search', 'types']
  })

  container.on('rename_node.jstree', (evt, data) => {
    const node = data.node
    const tree = $('.tree').jstree(true)
    // TODO: validate input data

    if (node.original.desc && node.type !== 'string') {
      tree.set_text(node, node.original.desc + ': ' + data.text)
    }
  })
}

CreateTree.ROOT_PATH = './app/data/tasks.xlsx'
CreateTree.ROOT_SHEET = 'task'

function getData (node, cb) {
  console.log(CreateTree.ROOT_PATH)
  if (node.id === '#') {
    readExcel(CreateTree.ROOT_PATH, CreateTree.ROOT_SHEET, cb)
  } else {
    readExcel(node.original.link.file, node.original.link.sheet, cb)
  }
}

// custom context menu items
function ContextMenuItems (node) {
  const tree = $('.tree').jstree(true)

  const Edit = {
    label: 'Edit',
    action: () => {
      tree.edit(node)
    }
  }

  const Yes = {
    label: 'true',
    action: () => {
      node.data = true
      tree.set_text(node, node.original.desc + ': true')
    }
  }

  const No = {
    label: 'false',
    action: () => {
      node.data = false
      tree.set_text(node, node.original.desc + ': false')
    }
  }

  if (node.type === 'default' || node.type === 'number' || node.type === 'string') {
    return {Edit}
  }

  if (node.type === 'boolean') {
    return {Yes, No}
  }
}
