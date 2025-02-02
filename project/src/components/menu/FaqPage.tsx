import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

interface FaqSection {
  id: number;
  title: string;
  items: FaqItem[];
}

interface FaqPageProps {
  onClose: () => void;
}

const faqSections: FaqSection[] = [
  {
    id: 1,
    title: 'Общие вопросы',
    items: [
      {
        id: 1,
        question: 'Как начать работать с сервисом?',
        answer: 'Чтобы начать работу, необходимо заполнить профиль в разделе "Мои данные" и пройти верификацию. После этого вы сможете принимать заказы.'
      },
      {
        id: 2,
        question: 'Как происходит оплата услуг?',
        answer: 'Оплата производится напрямую от клиента мастеру через выбранный способ оплаты (банковская карта или СБП). Сервис не участвует в финансовых операциях между клиентом и мастером.'
      },
      {
        id: 3,
        question: 'Что такое верификация?',
        answer: 'Верификация - это процесс подтверждения вашей личности и квалификации. Необходимо предоставить фото с документом, подтверждающим личность. Это обеспечивает безопасность и доверие между клиентами и мастерами.'
      }
    ]
  },
  {
    id: 2,
    title: 'Заказы и работа',
    items: [
      {
        id: 4,
        question: 'Как получать заказы?',
        answer: 'После верификации вам будут доступны заказы в разделе "Заявки". Вы можете просматривать доступные заказы и принимать те, которые вам подходят.'
      },
      {
        id: 5,
        question: 'Могу ли я отказаться от заказа?',
        answer: 'Да, вы можете отказаться от заказа до его принятия. После принятия заказа рекомендуется довести работу до конца, чтобы поддерживать высокий рейтинг.'
      },
      {
        id: 6,
        question: 'Как формируется моя репутация?',
        answer: 'Репутация формируется на основе отзывов клиентов, количества успешно выполненных заказов и качества вашей работы.'
      }
    ]
  },
  {
    id: 3,
    title: 'Техническая поддержка',
    items: [
      {
        id: 7,
        question: 'Что делать если возникли проблемы?',
        answer: 'В случае возникновения проблем вы можете обратиться в службу поддержки через раздел "Поддержка". Наши специалисты помогут решить любые вопросы.'
      },
      {
        id: 8,
        question: 'Как обновить данные профиля?',
        answer: 'Данные профиля можно обновить в разделе "Мои данные". После внесения изменений не забудьте нажать кнопку "Сохранить".'
      }
    ]
  }
];

export function FaqPage({ onClose }: FaqPageProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleSection = (sectionId: number) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const toggleItem = (itemId: number) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 bg-[#1F1F1F] rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-[#2D2D2D]">
          <h2 className="text-xl font-medium">FAQ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2D2D2D] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-4 space-y-2">
            {faqSections.map(section => (
              <div 
                key={section.id}
                className="bg-[#2D2D2D] rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-3 flex justify-between items-center"
                >
                  <span className="font-medium">{section.title}</span>
                  <ChevronDown 
                    size={20}
                    className={`transition-transform ${
                      expandedSection === section.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedSection === section.id && (
                  <div className="px-4 pb-2 space-y-2">
                    {section.items.map(item => (
                      <div 
                        key={item.id}
                        className="bg-[#1F1F1F] rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-full px-4 py-3 flex justify-between items-center text-left"
                        >
                          <span className="text-sm">{item.question}</span>
                          <ChevronDown 
                            size={16}
                            className={`transition-transform ${
                              expandedItems.includes(item.id) ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {expandedItems.includes(item.id) && (
                          <div className="px-4 pb-3 text-sm text-gray-400">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}