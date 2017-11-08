const ElmRepl = require('node-elm-repl');

const preludeTemplate = require('./prelude.template.js');
const screenTemplate = require('./screen.template.js');

class RevlDocument {

  constructor() {
    this.imports = []; // [Screen ID] -> [Import ID] -> [String]
    this.definitions = []; // [Screen ID] -> [Definition ID] -> [String]
    this.chunks = []; // [Screen ID] -> [Cell ID] -> [String]

    this.blockReader = new BlockReader({
      imports: isImport,
      definitions: line => isDefinition(line) || isTypeDeclaration(line),
      chunks: line => !isImport(line) && !isDefinition(line) && !isTypeDeclaration(line)
    })
  }

  append(screenId, content) {
    this.imports[screenId] = []
    this.definitions[screenId] = [];
    this.chunks[screenId] = [];

    const sortedContent = this.blockReader.parse(content.split('\n'));

    this.imports[screenId] = sortedContent.imports;
    this.definitions[screenId] = sortedContent.definitions;
    this.chunks[screenId] = sortedContent.chunks;
  }

  getCellCount(screenId) {
    return this.chunks[screenId] ? this.chunks[screenId].length : 0;
  }

  buildPreludeFor(screenId) {
    return preludeTemplate(screenId, this.imports,
                           this.definitions[screenId], this.chunks[screenId]);
  }

  buildScreenFor(screenId, types) {
    return screenTemplate(screenId, types,
                          this.imports[screenId], this.chunks[screenId]);
  }

}

function isImport(line) {
  return line.indexOf('import ') == 0;
}

function isTypeDeclaration(line) {
  return (line.indexOf('type ') == 0) ||
         (line.match(/^\w+\s*:/) != null);
}

function isDefinition(line) {
  return (line.match(/^\w+\s*=/) != null) ||
         (line.indexOf('-- ') == 0) ||
         (line.indexOf('{- ') == 0); // FIXME: store comments separately
}

class BlockReader {

  constructor(rules) {
    this.rules = rules;
  }

  parse(lines) {
    const rules = this.rules;
    let currentRule = '';
    let blockId = {}; // by ruleName
    const result = {};

    for (const ruleName of Object.keys(rules)) {
      blockId[ruleName] = 0;
      result[ruleName] = [];
    }

    for (const line of lines) {

      if (!currentRule && line.length) {
        for (const ruleName of Object.keys(rules)) {
          if (rules[ruleName](line)) {
            currentRule = ruleName;
            result[ruleName][blockId[ruleName]] = [];
            result[ruleName][blockId[ruleName]].push(line);
            break;
          }
        }
      } else if (currentRule) {
        result[currentRule][blockId[currentRule]].push(line);
        if (!line.length) {
          blockId[currentRule] += 1;
          currentRule = '';
        }
      }

    }

    return result;
  }

}

module.exports = RevlDocument;