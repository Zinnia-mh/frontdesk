import hyRequest from './request/index.ts'

export function getEntireData () {
  return hyRequest.post({
    url: '/getJsonData',
    data: { name: "" }
  })
}
export function search (entity) {
  return hyRequest.post({
    url: 'http://8.130.127.77:8000/search_relation',
    data: { name: "" }
  })
}

