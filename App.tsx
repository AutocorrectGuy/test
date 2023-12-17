import './App.css'
import { Editor, useMonaco } from '@monaco-editor/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { editor as editorType } from 'monaco-editor'

/**
 * A set containing all printable characters from the Windows-1252 encoding.
 * This set is used to validate whether a given character is part of the Windows-1252 character set.
 * It includes a variety of characters, such as standard alphanumeric characters, punctuation marks,
 * and specific symbols unique to the Windows-1252 encoding.
 */
const windows1252PrintableChars = new Set([
  '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?',
  '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_',
  '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '{', '|', '}', '~', 'DEL',
  '€', '‚', 'ƒ', '„', '…', '†', '‡', 'ˆ', '‰', 'Š', '‹', 'Œ', 'Ž', '‘', '’', '“',
  '”', '•', '–', '—', '˜', '™', 'š', '›', 'œ', 'ž', 'Ÿ',
  ' ', '¡', '¢', '£', '¤', '¥', '¦', '§', '¨', '©', 'ª', '«', '¬', 'SHY', '®', '¯',
  '°', '±', '²', '³', '´', 'µ', '¶', '·', '¸', '¹', 'º', '»', '¼', '½', '¾', '¿',
  'À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï',
  'Ð', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', '×', 'Ø', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'Þ', 'ß',
  'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï',
  'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', '÷', 'ø', 'ù', 'ú', 'û', 'ü', 'ý', 'þ', 'ÿ'
])

/**
 * Determines whether a given string contains only characters from the Windows-1252 encoding.
 * It iterates through each character of the input string and checks if the character is in the
 * `windows1252PrintableChars` set or if it is a newline (`\n`) or carriage return (`\r`) character.
 * If it encounters any character not in the set and not a newline or carriage return, it 
 * returns false, indicating the presence of a non-Windows-1252 character.
 * 
 * @param {string} inputString - The string to be checked.
 * @returns {boolean} - True if the string only contains Windows-1252 characters or newlines/carriage returns,
 *                      false otherwise.
 */
const containsOnlyWindows1252PrintableChars = (inputString: string) => {
  for (let char of inputString) {
    if (char !== '\n' && char !== '\r' && !windows1252PrintableChars.has(char)) {
      return false
    }
  }
  return true
}

/**
 * The main application component.
 * It provides a code editor using Monaco Editor and highlights lines that contain non-Windows-1252 characters.
 */
const App = () => {
  // State for the input value and line decorations
  const [value, setValue] = useState<string>('')
  const [currentDecorations, setCurrentDecorations] = useState<string[]>([])

  // Reference to the Monaco Editor instance
  const editorRef = useRef<editorType.IStandaloneCodeEditor | null>(null)

  // Access to the Monaco Editor API
  const monaco = useMonaco()

  /**
   * Callback function called when the editor is mounted.
   * It sets the initial value in the IDE.
   *
   * @param {editorType.IStandaloneCodeEditor} editor - The Monaco Editor instance.
   */
  const onMount = useCallback((editor: editorType.IStandaloneCodeEditor) => {
    editorRef.current = editor

    // Sets initial value in IDE
    setValue('// type your code here my bebeā')
  }, [])

  /**
   * Updates line decorations in the editor based on the content of the input value.
   * It highlights lines that contain non-Windows-1252 characters.
   */
  const updateDecorations = useCallback(() => {
    if (!monaco || !editorRef.current) return

    setCurrentDecorations(editorRef.current.deltaDecorations(
      currentDecorations,
      value
        .split('\n')
        .map((line, index) => {
          return (!containsOnlyWindows1252PrintableChars(line) ? ({
            options: { isWholeLine: true, className: 'bg-red-500' },
            range: new monaco.Range(index + 1, 1, index + 1, line.length + 1)
          }) : null)
        })
        .filter(decoration => decoration !== null) as editorType.IModelDeltaDecoration[]
    ))
  }, [value])

  // Update decorations whenever the input value changes
  useEffect(() => {
    updateDecorations()
  }, [updateDecorations])

  /**
   * Callback function called when the editor content changes.
   * It updates the input value.
   *
   * @param {string} val - The new content of the editor.
   */
  const onChange = useCallback((val: string) => {
    setValue(val)
  }, [])

  return (
    <div style={{ height: '100vh', backgroundColor: '#' }}>
      <div style={{ height: 60, display: 'flex', justifyItems: 'center', alignItems: 'center' }}>
        {/* Additional content can be added here */}
      </div>
      <Editor
        value={value}
        height={'600px'}
        theme='vs-dark'
        width={window.innerWidth}
        onMount={onMount}
        onChange={(val) => onChange(val as string)}
      />
    </div>
  )
}


export default App
