
import React from 'react';
import { Button } from '@/components/ui/button';
import TileSelector from './TileSelector';
import { FormData, GenerationStatus } from '@/types/worksheet';
import { ArrowRight, RefreshCw } from 'lucide-react';

interface WorksheetFormProps {
  formData: FormData;
  updateField: (field: keyof FormData, value: string) => void;
  generateWorksheet: () => void;
  resetForm: () => void;
  generationStatus: GenerationStatus;
}

const WorksheetForm: React.FC<WorksheetFormProps> = ({
  formData,
  updateField,
  generateWorksheet,
  resetForm,
  generationStatus
}) => {
  const isGenerating = generationStatus === GenerationStatus.GENERATING;
  const isCompleted = generationStatus === GenerationStatus.COMPLETED;

  const topicTiles = [
    "IT: debugowanie kodu",
    "Biznes: negocjacje handlowe",
    "Medycyna: opisywanie objawów",
    "Turystyka: rezerwacja hoteli",
    "Finanse: analiza budżetu"
  ];

  const objectiveTiles = [
    "Przygotowanie do prezentacji w pracy na temat AI",
    "Ćwiczenie słownictwa do rozmowy kwalifikacyjnej",
    "Nauka opisywania procesów biznesowych",
    "Rozwój płynności w dyskusjach o technologii",
    "Zrozumienie gramatyki: zdania warunkowe"
  ];

  const preferencesTiles = [
    "Ćwiczenia pisemne",
    "Dialogi i role-play",
    "Quizy interaktywne",
    "Dyskusje grupowe",
    "Analiza tekstów branżowych"
  ];

  const profileTiles = [
    "Cel: awans w pracy IT, preferuje pisanie, interesuje się programowaniem, umie Present Simple, nie umie Future Tenses",
    "Cel: zdanie egzaminu IELTS, preferuje quizy, interesuje się podróżami, umie słownictwo ogólne, nie umie idioms",
    "Cel: rozmowy biznesowe, preferuje dialogi, interesuje się finansami, umie Past Simple, nie umie phrasal verbs",
    "Cel: prezentacja w pracy, preferuje dyskusje, interesuje się marketingiem, umie słownictwo branżowe, nie umie conditionals",
    "Cel: płynność w rozmowach, preferuje role-play, interesuje się sportem, umie Present Perfect, nie umie Passive Voice"
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-edu-dark">Worksheet Generator</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Czas lekcji</label>
        <div className="flex gap-2">
          {['30', '45', '60'].map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => updateField('lessonDuration', duration)}
              className={`px-4 py-2 text-sm rounded-md border transition-all ${
                formData.lessonDuration === duration
                  ? 'bg-edu-primary text-white border-edu-primary'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-edu-light hover:border-edu-accent'
              }`}
            >
              {duration} minut
            </button>
          ))}
        </div>
      </div>

      <TileSelector
        label="Temat lekcji*"
        placeholder="Np. IT: debugowanie kodu, Biznes: negocjacje"
        tiles={topicTiles}
        value={formData.lessonTopic}
        onChange={(value) => updateField('lessonTopic', value)}
      />

      <TileSelector
        label="Cel lekcji*"
        placeholder="Np. Przygotowanie do prezentacji, Ćwiczenie słownictwa"
        tiles={objectiveTiles}
        value={formData.lessonObjective}
        onChange={(value) => updateField('lessonObjective', value)}
      />

      <TileSelector
        label="Preferencje*"
        placeholder="Np. Ćwiczenia pisemne, Dialogi"
        tiles={preferencesTiles}
        value={formData.preferences}
        onChange={(value) => updateField('preferences', value)}
      />

      <TileSelector
        label="Profil ucznia (nieobowiązkowe)"
        placeholder="Np. Cel: awans w pracy IT, preferuje pisanie..."
        tiles={profileTiles}
        value={formData.studentProfile || ''}
        onChange={(value) => updateField('studentProfile', value)}
      />

      <div className="space-y-2 mb-6">
        <label className="block text-sm font-medium text-gray-700">
          Dodatkowe informacje (nieobowiązkowe)
        </label>
        <textarea
          value={formData.additionalInfo || ''}
          onChange={(e) => updateField('additionalInfo', e.target.value)}
          placeholder="Np. Uczeń ma trudności z wymową 'r', Proszę uwzględnić więcej przykładów z IT"
          className="w-full p-3 border border-gray-300 rounded-md min-h-[80px] focus:outline-none focus:ring-2 focus:ring-edu-accent"
        />
      </div>

      <div className="flex gap-4 justify-end">
        {isCompleted && (
          <Button
            variant="outline"
            onClick={resetForm}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Nowy worksheet
          </Button>
        )}
        <Button
          onClick={generateWorksheet}
          disabled={isGenerating || !formData.lessonTopic || !formData.lessonObjective || !formData.preferences}
          className="bg-edu-primary hover:bg-edu-dark text-white flex items-center gap-2"
        >
          {isGenerating ? 'Generowanie...' : isCompleted ? 'Wygeneruj ponownie' : 'Generuj worksheet'}
          {!isGenerating && <ArrowRight size={16} />}
        </Button>
      </div>
    </div>
  );
};

export default WorksheetForm;
