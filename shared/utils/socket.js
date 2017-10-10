export default function(token) {
  const socket = io.connect({ query: { token } })

  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      resolve(socket)
    })

    socket.on('error', (error) => {
      reject(error)
    })
  })
}
