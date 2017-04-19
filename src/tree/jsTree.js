import fs from 'fs'

const SRC = './app/data/tasks.json'
const NPC_SRC = './app/data/npc.json'

const nodeTypes = {
  '#': {
    'valid_children': ['task']
  },
  'talk_task': {
    'icon': 'glyphicon glyphicon-comment'
  },
  'battle_task': {
    'icon': 'glyphicon glyphicon-fire'
  },
  'level_limit': {
    'icon': 'glyphicon glyphicon-chevron-up'
  },
  'talk_steps': {
    'icon': 'glyphicon glyphicon-th-list'
  },
  'npc_id': {
    'icon': 'glyphicon glyphicon-user'
  },
  'npc': {
    'icon': 'glyphicon glyphicon-user'
  },
  'battle_id': {
    'icon': 'glyphicon glyphicon-record'
  },
  'script': {
    'icon': 'glyphicon glyphicon-list-alt'
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
}

function getData (node, cb) {
  if (node.id === '#') {
    readFile(SRC, cb)
  } else if (node.type === 'npc_id') {
    readFile(NPC_SRC, cb)
  }
}

function readFile (url, cb) {
  fs.readFile(url, 'utf-8', (err, data) => {
    if (err) throw err
    if (data) cb(JSON.parse(data))
  })
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

  const Create = {
    label: 'Create',
    action: obj => {
      tree.create_node(node, { text: 'new_node' }, 'last', newNode => {
        tree.edit(newNode)
      })
    }
  }

  if (node.type === 'talk_task' || node.type === 'battle_task' ||
     node.type === 'level_limit') return {Edit}

  if (node.type === 'talk_steps') return {Create}
}
