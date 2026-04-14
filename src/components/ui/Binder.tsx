// ============================================================
// BINDER UI — Ported 1:1 from original UIController
// Full collection view with set tabs, thumbnails, and inspector
// ============================================================

import { useGameStore } from '../../store/useGameStore';
import { ALL_SETS } from '../../constants/setDefinitions';
import { useState, useEffect, useRef } from 'react';
import { drawPogToCanvas } from '../../utils/TextureGenerator';
import './Binder.css';

export function Binder() {
  const binderOpen = useGameStore((s) => s.binderOpen);
  const toggleBinder = useGameStore((s) => s.toggleBinder);
  const collection = useGameStore((s) => s.collection);
  
  const [currentSetId, setCurrentSetId] = useState(ALL_SETS[0].id);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectedTheme, setInspectedTheme] = useState<string | null>(null);

  if (!binderOpen) return null;

  const counts: Record<string, number> = {};
  const ownedThemes = new Set<string>();
  collection.forEach((p) => {
    counts[p.theme] = (counts[p.theme] || 0) + 1;
    ownedThemes.add(p.theme);
  });

  const activeSet = ALL_SETS.find((s) => s.id === currentSetId);
  if (!activeSet) return null;

  const ownedCount = activeSet.members.filter((m) => ownedThemes.has(m)).length;
  const isComplete = ownedCount === activeSet.members.length;

  const handleOpenInspector = (themeId: string) => {
    setInspectedTheme(themeId);
    setInspectorOpen(true);
  };

  return (
    <>
      <div className="binder-overlay" onClick={() => toggleBinder()}>
        <div className="binder-content" onClick={(e) => e.stopPropagation()}>
          <div className="binder-header">POG COLLECTION PORTFOLIO</div>
          
          <div className="binder-tabs">
            {ALL_SETS.map((setDef) => (
              <button
                key={setDef.id}
                className={currentSetId === setDef.id ? 'active' : ''}
                style={{
                  background: currentSetId === setDef.id ? setDef.color : '#333',
                  borderColor: currentSetId === setDef.id ? '#fff' : '#222',
                }}
                onClick={() => setCurrentSetId(setDef.id)}
              >
                {setDef.name.replace(/[^a-zA-Z ]/g, '').trim()}
              </button>
            ))}
          </div>

          <div className="set-completion-status" style={{ color: isComplete ? '#ffdd00' : activeSet.color }}>
            {isComplete
              ? `🏆 ${activeSet.name} COMPLETE!`
              : `${activeSet.name} Progress: ${ownedCount} / ${activeSet.members.length}`}
          </div>

          <div className="binder-grid">
            {activeSet.members.map((themeId) => {
              const isOwned = ownedThemes.has(themeId);
              return (
                <BinderSlot
                  key={themeId}
                  themeId={themeId}
                  isOwned={isOwned}
                  count={counts[themeId] || 0}
                  setColor={activeSet.color}
                  onInspect={handleOpenInspector}
                />
              );
            })}
          </div>

          <div className="global-stats">TOTAL POGS: {collection.length}</div>

          <button className="binder-close-btn" onClick={() => toggleBinder()}>
            CLOSE [B]
          </button>
        </div>
      </div>

      {inspectorOpen && inspectedTheme && (
        <ArtworkInspector theme={inspectedTheme} onClose={() => setInspectorOpen(false)} />
      )}
    </>
  );
}

function BinderSlot({
  themeId,
  isOwned,
  count,
  setColor,
  onInspect,
}: {
  themeId: string;
  isOwned: boolean;
  count: number;
  setColor: string;
  onInspect: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOwned && canvasRef.current) {
      drawPogToCanvas(canvasRef.current, 'pog', 'metal', themeId, 'standard');
    }
  }, [isOwned, themeId]);

  if (!isOwned) {
    return (
      <div className="binder-slot empty">
        <div className="mystery-icon">?</div>
        <div className="pog-label">{themeId.replace(/_/g, ' ')}</div>
      </div>
    );
  }

  return (
    <div className="binder-slot owned" style={{ borderColor: setColor }} onClick={() => onInspect(themeId)}>
      <div className="pog-thumb">
        <canvas ref={canvasRef} width={100} height={100} />
      </div>
      <div className="pog-count" style={{ background: setColor }}>
        {count}
      </div>
      <div className="pog-label" style={{ color: setColor }}>
        {themeId.replace(/_/g, ' ')}
      </div>
    </div>
  );
}

function ArtworkInspector({ theme, onClose }: { theme: string; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawPogToCanvas(canvasRef.current, 'pog', 'metal', theme, 'standard');
    }
  }, [theme]);

  return (
    <div className="artwork-inspector" onClick={onClose}>
      <div className="inspector-content" onClick={(e) => e.stopPropagation()}>
        <div className="inspector-name">{theme.replace(/_/g, ' ').toUpperCase()}</div>
        <canvas ref={canvasRef} id="inspector-canvas" width={300} height={300} />
        <button onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
}
