import {readExcel} from './parser'

const ROOT_PATH = './app/data/tasks.xlsx'
const ROOT_SHEET = 'task'

const nodeTypes = {
  'default': {
    'icon': 'glyphicon glyphicon-list'
  },
  '#': {
    'valid_children': ['task']
  },
  'task': {
    'icon': 'glyphicon glyphicon-tasks'
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
    readExcel(ROOT_PATH, ROOT_SHEET, cb)
  } else {
    console.log(node.original)
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
