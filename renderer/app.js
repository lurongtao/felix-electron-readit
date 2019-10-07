const { ipcRenderer } = require('electron')

let showModal = document.getElementById('show-modal'),
    closeModal = document.getElementById('close-modal'),
    modal = document.getElementById('modal'),
    addItem = document.getElementById('add-item'),
    itemUrl = document.getElementById('url')

const toggleModalButtons = () => {
  if (addItem.disabled === true) {
    addItem.disabled = false
    addItem.style.opacity = 1
    addItem.innerText = '添加'
    closeModal.style.display = 'inline'
  } else {
    addItem.disabled = true
    addItem.style.opacity = 0.5
    addItem.innerText = '添加中...'
    closeModal.style.display = 'none'
  }
}

showModal.addEventListener('click', e => {
  modal.style.display = 'flex'
})

closeModal.addEventListener('click', e => {
  modal.style.display = 'none'
})

addItem.addEventListener('click', e => {
  if (itemUrl.value) {
    ipcRenderer.send('new-item', itemUrl.value)
    toggleModalButtons()
  }
})

// Listen for new item from main process
ipcRenderer.on('new-item-success', (e, newItem) => {
  console.log(newItem)

  // Enable buttons
  toggleModalButtons()

  // Hide modal and clear value
  modal.style.display = 'none'
  itemUrl.value = ''
})

// Listen for keyboard submit
itemUrl.addEventListener('keyup', e => {
  if( e.key === 'Enter' ) addItem.click()
})