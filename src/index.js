const path = require('path')
const fs = require('fs')
const JSON5 = require('json5')

const { resolvePath } = require('babel-plugin-module-resolver')
const readBabelrcUp = require('read-babelrc-up')
const babelOptions = require('@babel/cli/lib/babel/options')

const rootPath = process.cwd()

const prefix = '@compileDependencies'
const fileSuffix = '.compileDependencies'

module.exports = ({ types: t }) => {
  
  const {cliOptions} = babelOptions.default(process.argv)

  const {
    outDir,
    outFile,
  } = cliOptions
  
  const outPath = outDir || path.basename( outFile || "" )
  
  return {
    name: 'compile-dependencies',
    pre: ()=>{
      this.compileDependencies = new Set()
    },
    post: (state)=>{
      const dependencies = this.compileDependencies
      // console.log(state)
      
      const {
        cwd,
        root,
        filename,
      } = state.opts
      
      const parent = path.join(cwd, root)
      
      const relativeFilepath = filename.slice(parent.length+1)
      const filepath = path.join(outPath, relativeFilepath)
      
      const dependenciesPath = filepath+fileSuffix
      
      const str = JSON.stringify(Array.from(dependencies))
      
      fs.writeFile(dependenciesPath, str, 'utf8', function(err){
        if(err) throw err
        console.log(dependenciesPath, ' +')
      })
    },
    visitor: {
      CallExpression: (p, state) => {
        // console.log('compile-dependencies')
        const {
          leadingComments,
          trailingComments,
        } = p.node
        if(!(leadingComments || trailingComments))
          return
          
        const handleComments = (comment)=>{
          let {value} = comment
          if(!value) 
            return
          value = value.trim()
          
          if(value.slice(0,1)==='!')
            value = value.slice(1)
            
          if(value.slice(0, prefix.length)!==prefix)
            return
          
          const dependenciesJSON = value.slice(prefix.length+1, -1)
          let dependencies
          try{
            dependencies = JSON5.parse(dependenciesJSON)
          }
          catch(e){
            // console.error(e, dependenciesJSON)
            console.error(dependenciesJSON)
            throw e
          }
          
          if(!dependencies)
            return
          dependencies.forEach(d=>this.compileDependencies.add(d))
        }
        
        if(leadingComments){
          leadingComments.forEach(handleComments)
        }
        if(trailingComments){
          trailingComments.forEach(handleComments)
        }
      },
    },
  }
}
