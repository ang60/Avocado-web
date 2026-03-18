import { Send } from 'lucide-react';
import { useState } from 'react';
import { UseInAdvisoryModal } from './UseInAdvisoryModal';

interface UseInAdvisoryButtonProps {
  article: any;
}

export function UseInAdvisoryButton({ article }: UseInAdvisoryButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 rounded-lg transition-all hover:shadow-md flex items-center gap-2"
        style={{ 
          backgroundColor: '#2D6A4F',
          color: '#F7F4EF',
          fontFamily: 'IBM Plex Sans, sans-serif',
          borderRadius: '8px',
        }}
      >
        <Send className="w-4 h-4" />
        Use in Advisory
      </button>

      <UseInAdvisoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        articleId={article.id}
        articleTitle={article.title}
        advisorySnippetEN={article.advisorySnippetEN}
        advisorySnippetSW={article.advisorySnippetSW}
      />
    </>
  );
}
