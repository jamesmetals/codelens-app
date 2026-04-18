import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { Folder, LayoutGrid, Plus, Trash2, X } from "lucide-react";

// --- Draggable Tech Item --- //
function TechDraggable({ tech }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tech-${tech.id}`,
    data: { type: "Technology", tech },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`relative mb-2 flex cursor-grab items-center gap-3 overflow-hidden rounded-lg border border-white/5 bg-[#141f38] px-3 py-2 text-sm text-[#dee5ff] shadow-sm transition-all hover:bg-white/5 active:cursor-grabbing ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#1d2b4b]">
        {tech.image?.src ? (
          <img
            src={tech.image.src}
            alt={tech.name}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <span className="text-[10px] font-bold uppercase text-sky-300">
            {tech.name.substring(0, 2)}
          </span>
        )}
      </div>
      <span className="truncate font-medium">{tech.name}</span>
    </div>
  );
}

// --- Droppable Category Box --- //
function CategoryDroppable({ category, technologies, onDelete }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `cat-${category.name}`,
    data: { type: "Category", category },
  });

  const isSystemCategory = ["Minhas tecnologias"].includes(
    category.name,
  );

  return (
    <div
      ref={setNodeRef}
      className={`flex h-[320px] w-64 shrink-0 flex-col overflow-hidden rounded-xl border-2 transition-colors ${
        isOver ? "border-sky-400 bg-[#121c32]" : "border-[#40485d]/20 bg-[#0a1224]"
      }`}
    >
      <header className="flex items-center justify-between border-b border-[#40485d]/20 bg-[#0f1930] px-4 py-3">
        <div className="flex flex-col">
          <span className="font-['Manrope'] text-sm font-bold text-[#dee5ff]">
            {category.name}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[#a3aac4]">
            {technologies.length} item(s)
          </span>
        </div>
        {!isSystemCategory && onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(category)}
            className="rounded p-1 text-slate-400 opacity-60 hover:bg-rose-500/10 hover:text-rose-400 hover:opacity-100"
            title="Excluir Categoria"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </header>

      <div className="flex-1 overflow-y-auto p-3 outline-none">
        {technologies.map((tech) => (
          <TechDraggable key={tech.id} tech={tech} />
        ))}
        {technologies.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center text-center text-[#6d758c] opacity-60">
            <LayoutGrid className="mb-2 h-6 w-6" />
            <p className="text-xs">Solte os itens aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Modal --- //
export default function CategoryManagerModal({
  isOpen,
  onClose,
  categoryList,
  techList,
  technologies,
  onSyncStructure,
}) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [activeDragTech, setActiveDragTech] = useState(null);
  const safeTechList = Array.isArray(techList)
    ? techList
    : Array.isArray(technologies)
      ? technologies
      : [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const categoriesToRender = useMemo(() => {
    const list = Array.isArray(categoryList) && categoryList.length > 0 ? categoryList : [];
    // Ensure standard 'Minhas tecnologias' always appears to hold non-categorized items
    if (!list.some(c => c.name === "Minhas tecnologias")) {
      return [{ id: "minhas-tecnologias", name: "Minhas tecnologias", accent: "Personalizado" }, ...list];
    }
    return list;
  }, [categoryList]);

  if (!isOpen) return null;

  const handleCreateCategory = (e) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) return;

    const exists = categoriesToRender.some(
      (c) => c.name.toLowerCase() === cleanName.toLowerCase(),
    );
    if (exists) {
      alert("Categoria já existe.");
      return;
    }

    const newCategory = {
      id: `cat-${Date.now()}`,
      name: cleanName,
      accent: "Customizado",
    };

    onSyncStructure(null, [...categoriesToRender, newCategory]);
    setNewCategoryName("");
  };

  const handleDeleteCategory = (catToDelete) => {
    let nextTechList = null;

    const count = safeTechList.filter((t) => t.category === catToDelete.name).length;
    if (count > 0) {
      if (!confirm(`Existem ${count} tecnologias ligadas a esta categoria. Elas serão movidas para "Minhas tecnologias". Reprogresso?`)) {
        return;
      }
      
      nextTechList = safeTechList.map(t => 
        t.category === catToDelete.name ? { ...t, category: "Minhas tecnologias" } : t
      );
    }
    
    const nextCategories = categoriesToRender.filter((c) => c.id !== catToDelete.id);
    onSyncStructure(nextTechList, nextCategories);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.type === "Technology") {
      setActiveDragTech(active.data.current.tech);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragTech(null);

    if (!over) return;
    if (
      active.data.current?.type === "Technology" &&
      over.data.current?.type === "Category"
    ) {
      const draggedTech = active.data.current.tech;
      const targetCategory = over.data.current.category;

      if (draggedTech.category !== targetCategory.name) {
        const newTechList = safeTechList.map((t) =>
          t.id === draggedTech.id ? { ...t, category: targetCategory.name } : t,
        );
        onSyncStructure(newTechList, null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-0 lg:p-4 xl:p-8">
      <div className="modal-enter-backdrop absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="modal-enter-panel relative z-10 flex h-full w-full flex-col overflow-hidden bg-[#060e20] shadow-2xl lg:rounded-2xl lg:border lg:border-white/10">
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0f1930] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-300">
              <Folder className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-['Manrope'] text-lg font-bold text-white">
                Distribuição de Tecnologia
              </h2>
              <p className="text-xs text-slate-400">
                Arraste as tecnologias para organizá-las em categorias.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <main className="flex min-h-0 flex-1 flex-col p-6">
          <form
            onSubmit={handleCreateCategory}
            className="mb-8 flex shrink-0 items-center gap-3"
          >
            <input
              type="text"
              placeholder="Criar nova categoria (ex: Frontend, Banco de Dados...)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="h-11 flex-1 rounded-lg border border-white/10 bg-black px-4 text-sm text-white placeholder:text-slate-600 focus:border-sky-400/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newCategoryName.trim()}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-sky-400 to-cyan-400 px-5 text-sm font-bold text-[#083445] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Cadastrar categoria
            </button>
          </form>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex min-h-0 flex-1 items-start gap-4 overflow-x-auto pb-4">
              {categoriesToRender.map((category) => {
                const categoryTechs = safeTechList.filter(
                  (t) => (t.category || "Minhas tecnologias") === category.name,
                );

                return (
                  <CategoryDroppable
                    key={category.id || category.name}
                    category={category}
                    technologies={categoryTechs}
                    onDelete={handleDeleteCategory}
                  />
                );
              })}
            </div>

            <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
              {activeDragTech ? (
                <div className="z-50 -rotate-2 scale-105 opacity-90 shadow-xl ring-2 ring-sky-400 rounded-lg">
                  <TechDraggable tech={activeDragTech} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </main>
      </div>
    </div>
  );
}
