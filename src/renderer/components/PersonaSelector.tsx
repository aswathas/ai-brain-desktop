import React from 'react';
import { Persona } from '../App';

interface PersonaSelectorProps {
  personas: Persona[];
  selectedPersona: Persona;
  onSelectPersona: (persona: Persona) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  personas,
  selectedPersona,
  onSelectPersona,
}) => {
  return (
    <div className="persona-selector">
      <div className="persona-selector-title">Thinking Personas</div>
      <div className="persona-list">
        {personas.map((persona) => (
          <button
            key={persona.id}
            className={`persona-chip ${selectedPersona.id === persona.id ? 'active' : ''}`}
            onClick={() => onSelectPersona(persona)}
            title={persona.description}
          >
            {persona.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PersonaSelector;