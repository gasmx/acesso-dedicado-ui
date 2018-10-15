const { ipcRenderer } = require('electron')

const ws = new WebSocket('wss://websocket.condominiodedicado.com.br:4000')

ws.onopen = () => {
    // alert('conexao com WS ok!')
}

ws.onmessage = msg => {
    console.log(msg.data)
}

const submitListener
    = document
        .querySelector('form')
        .addEventListener('submit', event => {
            event.preventDefault()

            const files = [...document.getElementById('filePicker').files]

            const filesFormatted = files.map(({ name, path: pathName}) => ({
                name,
                pathName
            }))

            ipcRenderer.send('files', filesFormatted)
        })

ipcRenderer.on('metadata', (event, metadata) => {
    const pre = document.getElementById('data')

    pre.innerHTML = JSON.stringify(metadata, null, 2)
})

ipcRenderer.on('metadata:error', (event, error) => {
    console.error(error)
})