const fs = require('fs')

// DOM nodes
let items = document.getElementById('items')

let readerJS
fs.readFile(`${__dirname}/reader.js`, (err, data) => {
  readerJS = data.toString()
})

// Track items in storage
exports.storage = JSON.parse(localStorage.getItem('readit-items')) || []

// Listen for "Done" message from reader window
window.addEventListener('message', e => {

  // Check for correct message
  if (e.data.action === 'delete-reader-item') {

    // Delete item at given index
    this.delete(e.data.itemIndex)

    // Close the reader window
    e.source.close()
  }
})

// Delete item
exports.delete = itemIndex => {

  // Remove item from DOM
  items.removeChild( items.childNodes[itemIndex] )

  // Remove from storage
  this.storage.splice(itemIndex, 1)

  // Persist
  this.save()

  // Select previous item or new first item if first was deleted
  if (this.storage.length) {

    // Get new selected item index
    let newSelectedItemIndex = (itemIndex === 0) ? 0 : itemIndex - 1

    // Set item at new index as selected
    document.getElementsByClassName('read-item')[newSelectedItemIndex].classList.add('selected')
  }
}

// Persist storage
exports.save = () => {
  localStorage.setItem('readit-items', JSON.stringify(this.storage))
}

// Set item as selected
exports.select = e => {

  // Remove currently selected item class
  this.getSelectedItem().node.classList.remove('selected')

  // Add to clicked item
  e.currentTarget.classList.add('selected')
}

// Move to newly selected item
exports.changeSelection = direction => {

  // Get selected item
  let currentItem = this.getSelectedItem().node

  // Handle up/down
  if (direction === 'ArrowUp' && currentItem.previousSibling) {
    currentItem.classList.remove('selected')
    currentItem.previousSibling.classList.add('selected')

  } else if (direction === 'ArrowDown' && currentItem.nextSibling) {
    currentItem.classList.remove('selected')
    currentItem.nextSibling.classList.add('selected')
  }
}

// Open selected item
exports.open = () => {

  // Only if we have items (in case of menu open)
  if( !this.storage.length ) return

  // Get selected item
  let selectedItem = this.getSelectedItem()

  // Get item's url
  let contentURL = selectedItem.node.dataset.url

  let readerWin = window.open(contentURL, '', `
    maxWidth=2000,
    maxheight=2000,
    width=1200,
    height=800,
    backgroundColor=#DEDEDE,
    nodeIntegration=0,
    contextIsolation=1
  `)

  // Inject JavaScript
  readerWin.eval(readerJS.replace('{{index}}', selectedItem.index))
}

// Get selected item index
exports.getSelectedItem = () => {

  // Get selected node
  let currentItem = document.getElementsByClassName('read-item selected')[0]

  // Get item index
  let itemIndex = 0
  let child = currentItem
  while( (child = child.previousSibling) != null ) itemIndex++

  // Return selected item and index
  return { node: currentItem, index: itemIndex }
}

// Add new item
exports.addItem = (item, isNew = false) => {

  // Create a new DOM node
  let itemNode = document.createElement('div')

  // Assign "read-item" class
  itemNode.setAttribute('class', 'read-item')

  // Add inner HTML
  itemNode.innerHTML = `<img src="${item.screenshot}"><h2>${item.title}</h2>`

  // Append new node to "items"
  items.appendChild(itemNode)

  // Set item url as data attribute
  itemNode.setAttribute('data-url', item.url)

  // Attach click handler to select
  itemNode.addEventListener('click', this.select)

  // Attach open doubleclick handler
  itemNode.addEventListener('dblclick', this.open)

  // If this is the first item, select it
  if (document.getElementsByClassName('read-item').length === 1) {
    itemNode.classList.add('selected')
  }

  // Add item to storage and persist
  if(isNew) {
    this.storage.push(item)
    this.save()
  }
}

// Add items from storage when app loads
this.storage.forEach( item => {
  this.addItem(item)
})
