import type { EditorElement } from '@/components/providers/editor/editor-provider'
import React from 'react'

type Props = {
  element: EditorElement
}

const TwoColumns = ({ element }: Props) => {
  return (
    <div style={element.styles} className="flex flex-col md:flex-row w-full">
      {Array.isArray(element.content) && element.content.map((childElement) => (
        <div key={childElement.id} className="flex-1">
          {/* Child elements would be rendered here recursively */}
          {childElement.name}
        </div>
      ))}
    </div>
  )
}

export default TwoColumns