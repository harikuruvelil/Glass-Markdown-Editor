import { useSettingsStore } from '../stores/settingsStore'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// Icons used inline in the modal body

/* Custom Toggle component */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`toggle-switch ${checked ? 'active' : ''}`}
        role="switch"
        aria-checked={checked}
      />
    </label>
  )
}

/* Section wrapper */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

/* Label + control wrapper */
function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{label}</label>
      {children}
    </div>
  )
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const {
    theme, fontFamily, fontSize, codeFontFamily, autoSave, autoSaveInterval,
    defaultView, spellCheck, wordWrap,
    setTheme, setFontFamily, setFontSize, setCodeFontFamily,
    setAutoSave, setAutoSaveInterval, setDefaultView, setSpellCheck, setWordWrap,
  } = useSettingsStore()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 animate-backdrop-in"
        style={{ background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="card-glass w-[480px] max-h-[85vh] overflow-auto custom-scrollbar pointer-events-auto animate-fade-in"
          style={{ padding: '28px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-card flex items-center justify-center"
                style={{ background: 'var(--gradient-lavender)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Customize your editor</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-glass"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--canvas-surface-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <IconClose />
            </button>
          </div>

          <div className="space-y-6">
            {/* Appearance */}
            <Section title="Appearance">
              <SettingRow label="Theme">
                <div className="flex gap-2">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className="flex-1 py-2 rounded-button text-[12px] font-medium transition-glass capitalize"
                      style={{
                        background: theme === t ? 'rgba(108, 180, 238, 0.12)' : 'transparent',
                        color: theme === t ? '#4A90D9' : 'var(--text-secondary)',
                        border: `1.5px solid ${theme === t ? 'rgba(108, 180, 238, 0.3)' : 'var(--canvas-border)'}`,
                        boxShadow: theme === t ? '0 0 12px rgba(108, 180, 238, 0.1)' : 'none',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </SettingRow>
            </Section>

            {/* Typography */}
            <Section title="Typography">
              <SettingRow label="Body Font">
                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="select-glass">
                  <option value="Inter">Inter</option>
                  <option value="Segoe UI Variable">Segoe UI Variable</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </SettingRow>

              <SettingRow label={`Font Size: ${fontSize}px`}>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="range-accent"
                />
              </SettingRow>

              <SettingRow label="Code Font">
                <select value={codeFontFamily} onChange={(e) => setCodeFontFamily(e.target.value)} className="select-glass">
                  <option value="Cascadia Code">Cascadia Code</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Fira Code">Fira Code</option>
                  <option value="Consolas">Consolas</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </SettingRow>
            </Section>

            {/* Editor */}
            <Section title="Editor">
              <SettingRow label="Default View">
                <div className="flex gap-2">
                  {(['wysiwyg', 'raw'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setDefaultView(v)}
                      className="flex-1 py-2 rounded-button text-[12px] font-medium transition-glass uppercase"
                      style={{
                        background: defaultView === v ? 'rgba(184, 169, 232, 0.12)' : 'transparent',
                        color: defaultView === v ? '#9B8AD4' : 'var(--text-secondary)',
                        border: `1.5px solid ${defaultView === v ? 'rgba(184, 169, 232, 0.3)' : 'var(--canvas-border)'}`,
                        boxShadow: defaultView === v ? '0 0 12px rgba(184, 169, 232, 0.1)' : 'none',
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </SettingRow>

              <Toggle checked={wordWrap} onChange={setWordWrap} label="Word Wrap" />
              <Toggle checked={spellCheck} onChange={setSpellCheck} label="Spell Check" />
            </Section>

            {/* Auto-save */}
            <Section title="Auto-save">
              <Toggle checked={autoSave} onChange={setAutoSave} label="Enable Auto-save" />
              {autoSave && (
                <SettingRow label={`Interval: ${autoSaveInterval}s`}>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={autoSaveInterval}
                    onChange={(e) => setAutoSaveInterval(parseInt(e.target.value))}
                    className="range-accent"
                  />
                </SettingRow>
              )}
            </Section>
          </div>
        </div>
      </div>
    </>
  )
}
