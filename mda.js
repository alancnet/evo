// Multi Dimensional Array

const get = (arr, indicies, i) =>
  i === undefined ? get(arr, indicies, 0)
  : !arr ? null
  : i < indicies.length - 1 ? get(arr[indicies[i]], indicies, i + 1)
  : arr[indicies[i]]

const put = (arr, indicies, value, i) =>
  i === undefined ? put(arr, indicies, value, 0)
  : i < indicies.length - 1 ? (
    arr[indicies[i]]
    ? put(arr[indicies[i]], indicies, value, i + 1)
    : put(arr[indicies[i]] = [], indicies, value, i + 1)
  ) :
  (arr[indicies[i]] = value)

const keys = (arr, depth) =>
  depth > 1
  ? arr.map((x, i) =>
    keys(x, depth - 1).map(key => [i].concat(key))
  )
  .reduce((a, b) => a.concat(b), [])
  .filter(x => x)
  : arr.map((x, i) => i)

const map = (arr, depth, mapper) =>
  !arr ? null
  : depth > 1 ? arr.map(x => map(x, depth - 1, mapper))
  : arr.map(mapper)

const flatten = (arr, depth) =>
  !arr ? []
  : depth > 1 ? arr.map(x => flatten(x, depth - 1))
    .reduce((a, b) => a.concat(b), [])
    .filter(x => x !== undefined && x !== null)
  : arr

const remove = (arr, indicies) => put(arr, indicies, undefined)
module.exports = {get, put, keys, map, flatten, remove}
