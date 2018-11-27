const babel = require('@babel/core')
const plugin = require('../')
const fs = require('fs')

it('sould collect dirA directory', () => {
  const {code} = babel.transformFileSync('fixtures/testA.js', {plugins: [plugin]})
  const compileDependenciesList = JSON.parse(fs.readFileSync('./fixtures/testA.compileDependencies.js', 'utf-8'))
  assert( compileDependenciesList.includes('./dirA/') )
  
})

it('sould collect testA file', () => {
  const {code} = babel.transformFileSync('fixtures/testB.js', {plugins: [plugin]})
  const compileDependenciesList = JSON.parse(fs.readFileSync('./fixtures/testB.compileDependencies.js', 'utf-8'))
  assert( compileDependenciesList.includes('./testA') )
})
