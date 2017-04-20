import xlsx from 'xlsx'

export function readExcel (path, sheetName, cb) {
  // parsing xlsx
  const wb = xlsx.readFile(path)
  if (!wb) throwError(`Parsing Error: ${path}`)

  wb.SheetNames.forEach(name => {
    if (name === sheetName) {
      // dealing with worksheet
      const ws = wb.Sheets[name]
      ws.path = path

      ws.name = name

      const sheet = readSheet(ws)
      cb(sheet.data)
    }
  })
}

function readSheet (ws) {
  if (ws['!ref']) {
    const range = xlsx.utils.decode_range(ws['!ref'])

    // find the index objects
    const propName = findIndexRow(ws, range, '$prop_name')
    const type = findIndexRow(ws, range, '$type')
    const link = findIndexRow(ws, range, '$link')
    const desc = findIndexRow(ws, range, '$desc')

    // if all index fields existed, fill the result
    if (propName && type && link && desc) {
      const index = {propName, type, link, desc}
      return readData(ws, range, index)
    }
  }

  return null
}

function readData (ws, range, index) {
  const res = { link: {}, desc: {}, data: [] }

  // links
  for (const key in index.link) {
    const name = index.propName[key]
    res.link[name] = index.link[key]
  }

  // desc for prefix
  for (const key in index.desc) {
    const name = index.propName[key]
    res.desc[name] = index.desc[key]
  }

  // items
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const firstCell = xlsx.utils.encode_cell({c: range.s.c, r: R})
    const firstCellValue = ws[firstCell] ? ws[firstCell].v : null

    // jump the index rows
    if (firstCellValue === '$prop_name' || firstCellValue === '$type' || firstCellValue === '$link' || firstCellValue === '$desc') continue

    // read the row
    const rowData = readRow(ws, range, index, R)
    if (rowData) res.data.push(postfix(ws.path, rowData, index))
  }

  return res
}

function postfix (path, data, index) {
  const res = {}
  const children = []
  for (const key in data) {
    if (key === 'text' || key === 'data') {
      res[key] = data[key]
    } else {
      const child = {}
      child.data = data[key]

      child.type = getInfoFromIndex(key, 'type', index)

      const desc = getInfoFromIndex(key, 'desc', index)
      const link = getInfoFromIndex(key, 'link', index)

      child.text = desc + ':' + child.data

      if (link) {
        child.link = getLink(link)
        if (!child.link.file) child.link.file = path
        child.children = true
      }

      children.push(child)
    }
  }

  if (children.length > 0) res.children = children
  return res
}

function getInfoFromIndex (key, prop, index) {
  for (const i in index.propName) {
    if (index.propName[i] === key) {
      return index[prop][i]
    }
  }

  return null
}

function getLink (link) {
  const l = {}
  const arr = link.split(':')
  if (arr.length > 1) {
    l.file = arr[0]
    l.sheet = arr[1]
  } else if (arr.length === 1) {
    l.sheet = link
  }
  return l
}

function readRow (ws, range, index, r) {
  const cell = xlsx.utils.encode_cell({c: range.s.c, r})
  const rowData = {}
  // if commented ,then return null
  if (ws[cell] && ws[cell].v === '#') return null
  for (const key in index.propName) {
    const cell = xlsx.utils.encode_cell({c: key, r})
    let value = ws[cell] ? ws[cell].v : undefined

    checkType(value, index.type[key])

    const propName = index.propName[key]
    rowData[propName] = value
  }

  return rowData
}

function checkType (value, type) {
  // console.log(value, type)
  // TODO: type check here
  return true
}

// get the index object by the certain name: $title, $isKey, $isNum
function findIndexRow (ws, range, name) {
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const firstCell = xlsx.utils.encode_cell({c: range.s.c, r: R})
    if (ws[firstCell] && ws[firstCell].v === name) {
      const props = {}
      let commentOn = false

      for (let C = range.s.c + 1; C <= range.e.c; ++C) {
        const cell = xlsx.utils.encode_cell({c: C, r: R})

        if (ws[cell] && ws[cell].v === '#') commentOn = true
        if (ws[cell] && commentOn === false) {
          props[C] = ws[cell].v
        }
      }

      return props
    }
  }

  return null
}

function throwError (str) {
  throw new Error(str)
}
