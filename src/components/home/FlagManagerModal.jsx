import { useState, useMemo } from "react";
import { Plus, X, Tag, GripVertical, Trash2, BookMarked, ChevronRight } from "lucide-react";

export default function FlagManagerModal({
  isOpen,
  onClose,
  flags,
  technologies,
  onSyncStructure,
}) {
  const [activeTab, setActiveTab] = useState("filter"); // filter | crud
  const [selectedFlagFilter, setSelectedFlagFilter] = useState(null);
  
  // CRUD states
  const [flagName, setFlagName] = useState("");
  const [flagColor, setFlagColor] = useState("");

  const DEFAULT_COLORS = ["#ff3366", "#33ccff", "#33ff99", "#ffcc00", "#cc33ff", "#ff6633"];

  const handleCreateFlag = () => {
    if (!flagName.trim()) return;

    let assignedColor = flagColor;
    if (!assignedColor) {
      const usedColors = flags.map(f => f.color);
      const available = DEFAULT_COLORS.filter(c => !usedColors.includes(c));
      assignedColor = available.length > 0 ? available[0] : DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
    }

    const newFlag = {
      id: `flag-${Date.now()}`,
      name: flagName,
      color: assignedColor,
    };

    onSyncStructure(null, null, [...flags, newFlag]);
    setFlagName("");
    setFlagColor("");
  };

  const handleDeleteFlag = (id) => {
    onSyncStructure(null, null, flags.filter(f => f.id !== id));
    if (selectedFlagFilter === id) setSelectedFlagFilter(null);
  };

  // Coleta todos conteúdos atrelados à flag atual
  const filteredContents = useMemo(() => {
    if (!selectedFlagFilter) return [];
    const results = [];
    technologies.forEach(tech => {
      (tech.contents || []).forEach(content => {
        if (content.flags?.includes(selectedFlagFilter)) {
          results.push({ ...content, techName: tech.name });
        }
      });
    });
    return results;
  }, [selectedFlagFilter, technologies]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative z-10 flex w-full max-w-4xl max-h-[85vh] flex-col overflow-hidden rounded-xl border border-[#40485d]/30 bg-[#0f1930] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#40485d]/30 bg-[#091328] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#141f38] text-[#a3aac4]">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-['Manrope'] text-lg font-bold text-[#dee5ff]">
                Gerenciador de Flags
              </h2>
              <p className="text-xs text-[#a3aac4]">
                Classifique conteúdos e encontre-os filtrando as marcações especiais.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-[#a3aac4] hover:bg-[#141f38] hover:text-[#dee5ff] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Menu Esquerdo: Abas e Lista de Flags */}
          <aside className="w-1/3 border-r border-[#40485d]/20 bg-[#091328]/50 flex flex-col">
            <div className="p-4 border-b border-[#40485d]/20">
              <button 
                onClick={() => { setActiveTab("crud"); setFlagName(""); }}
                className="w-full rounded-md border border-[#69daff]/30 bg-[#69daff]/10 py-2.5 font-['Manrope'] text-[11px] font-bold tracking-widest text-[#69daff] uppercase transition-colors hover:bg-[#69daff]/20"
              >
                + Nova Flag
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {flags.map(flag => (
                <div 
                  key={flag.id}
                  onClick={() => { setActiveTab("filter"); setSelectedFlagFilter(flag.id); }}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                    activeTab === "filter" && selectedFlagFilter === flag.id
                      ? "border-[#69daff] bg-[#141f38]"
                      : "border-[#40485d]/20 bg-transparent hover:bg-[#141f38]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: flag.color || "#6d758c" }} />
                    <span className="font-['Manrope'] text-sm font-bold text-[#dee5ff]">
                      {flag.name}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteFlag(flag.id); }}
                    className="opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {flags.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-[#a3aac4]">Nenhuma flag cadastrada</p>
                </div>
              )}
            </div>
          </aside>

          {/* Painel Principal */}
          <main className="w-2/3 bg-[#060e20] p-6 flex flex-col overflow-y-auto">
            {activeTab === "crud" ? (
              <div className="max-w-md mx-auto w-full mt-10">
                <h3 className="font-['Manrope'] text-lg font-bold text-[#dee5ff] mb-6">
                  Criar Nova Flag
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#a3aac4]">
                      Nome da Flag
                    </label>
                    <input 
                      type="text"
                      value={flagName}
                      onChange={e => setFlagName(e.target.value)}
                      placeholder="Ex: Essencial"
                      className="w-full rounded-md border border-[#40485d]/30 bg-[#0f1930] px-4 py-2 text-sm text-[#dee5ff] placeholder:text-[#6d758c] focus:border-[#69daff]/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#a3aac4]">
                      Cor (Opcional)
                    </label>
                    <input 
                      type="color"
                      value={flagColor}
                      onChange={e => setFlagColor(e.target.value)}
                      className="h-10 w-full cursor-pointer rounded-md border border-[#40485d]/30 bg-[#0f1930] p-1"
                    />
                    <p className="mt-1 text-xs text-[#6d758c]">Se não preenchido, o sistema atribuirá uma cor exclusiva.</p>
                  </div>
                  <button 
                    onClick={handleCreateFlag}
                    className="w-full rounded-md bg-[#69daff] py-3 font-['Manrope'] text-sm font-bold text-[#002a35] hover:bg-[#00c0ea] transition-colors"
                  >
                    Salvar Flag
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <h3 className="font-['Manrope'] text-lg font-bold text-[#dee5ff] mb-6 border-b border-[#40485d]/10 pb-4">
                  {selectedFlagFilter 
                    ? `Conteúdos Filtrados (${filteredContents.length})`
                    : "Selecione uma flag ao lado"
                  }
                </h3>
                
                {selectedFlagFilter ? (
                  filteredContents.length > 0 ? (
                    <div className="grid gap-4">
                      {filteredContents.map(content => (
                        <div key={content.id} className="flex flex-col rounded-lg border border-[#40485d]/20 bg-[#0f1930] p-4 transition-colors hover:border-[#69daff]/30">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a3aac4] mb-2">
                              {content.techName}
                            </span>
                            <BookMarked className="h-4 w-4 text-[#a3aac4]" />
                          </div>
                          <h4 className="font-['Manrope'] text-md font-bold text-[#dee5ff] line-clamp-1">
                            {content.title}
                          </h4>
                          {content.summary && (
                            <p className="mt-2 text-xs text-[#a3aac4] line-clamp-2">
                              {content.summary}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-center text-center">
                      <p className="text-[#a3aac4] text-sm">Nenhum bloco de estudo vinculado a esta flag.</p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-1 items-center justify-center text-center">
                    <Tag className="h-10 w-10 text-[#141f38] mb-4" />
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
