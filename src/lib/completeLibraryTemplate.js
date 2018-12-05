/**
 * Facilitates completing a library template
 */

async function completeLibraryTemplate (context, content) {
  const { print } = context
  const { terminal: term, ScreenBuffer } = require( 'terminal-kit' )
  var screen = new ScreenBuffer({dst: term, noFill: false})
  var templateState = {
    content: content,
    workingContent: content,
    currentSite: 1,
    currentEntry: '',
  }

  function getWorkingContent (content, currentEntryPoint, entry, showCursor=true) {
    var regex = new RegExp('\\$' + currentEntryPoint, "gm")
    const cursor = showCursor ?  '▋' : ''

    if (content.search(regex) > 0) {
      return content.replace(regex, entry+cursor)
    } else {
      return false
    }
  }

  function terminate() {
    term.grabInput( false ) ;
    setTimeout( function() { process.exit() } , 100 ) ;
  }

  function drawTemplate(content) {
    term.clear()
    term(content)
    screen.draw()
  }

  async function handleInput(templateState, name = '') {
    print.info(JSON.stringify(templateState))

    var nextSite = templateState.currentSite
    var content = templateState.content
    var workingContent = templateState.content
    var entry = templateState.currentEntry

    if ( name === 'CTRL_C' ) {
      terminate()
    } else if ( name === 'ENTER' ) {
      content = getWorkingContent(content, nextSite, entry, false)
      entry = ''
      nextSite++
    } else {
      entry = entry + name
    }

    workingContent = getWorkingContent(content, nextSite, entry)

    if(!workingContent) { terminate() ; }

    drawTemplate(workingContent)

    return {
      content,
      workingContent: workingContent,
      finished: !workingContent,
      currentSite: nextSite,
      currentEntry: entry,
    }
  }

  const newTemplateState = await handleInput(templateState)
  Object.assign(templateState, newTemplateState)
  
  term.grabInput( );
  term.on( 'key' , async function( name , _matches , _data ) {
    const newTemplateState = await handleInput(templateState, name)
    
    if (newTemplateState.finished) {
      term.clear()
      return newTemplateState
    }

    Object.assign(templateState, newTemplateState)
  } ) ;
}

module.exports = completeLibraryTemplate