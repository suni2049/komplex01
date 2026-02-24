import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { useFolders } from '../hooks/useFolders'
import { formatDate } from '../utils/formatTime'
import {
  IconShare,
  IconCheck,
  IconFolder,
  IconFolderOpen,
  IconPlus,
  IconMove,
  IconTrash,
  IconPencil,
  IconArrowLeft,
} from '../components/icons/Icons'
import { encodeWorkout, buildShareUrl } from '../lib/workoutSharing'
import type { WorkoutHistoryEntry, WorkoutFolder } from '../types/workout'

// Preset colors for folders
const FOLDER_COLORS = [
  { id: 'red',    hex: '#ef4444' },
  { id: 'orange', hex: '#f97316' },
  { id: 'amber',  hex: '#f59e0b' },
  { id: 'green',  hex: '#22c55e' },
  { id: 'cyan',   hex: '#06b6d4' },
  { id: 'blue',   hex: '#3b82f6' },
  { id: 'violet', hex: '#8b5cf6' },
  { id: 'pink',   hex: '#ec4899' },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function WorkoutCard({
  entry,
  folders,
  onCommence,
  onShare,
  onRename,
  onMove,
  onRemove,
}: {
  entry: WorkoutHistoryEntry
  folders: WorkoutFolder[]
  onCommence: () => void
  onShare: () => void
  onRename: () => void
  onMove: () => void
  onRemove: () => void
}) {
  const workout = entry.workout
  const currentFolder = folders.find(f => f.id === entry.folderId)

  return (
    <div className="card-base overflow-hidden">
      {/* Color accent strip from folder */}
      {currentFolder && (
        <div className="h-0.5 w-full" style={{ backgroundColor: currentFolder.color }} />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {entry.name ? (
                <p className="text-sm font-heading font-bold text-text-primary uppercase tracking-wider truncate">
                  {entry.name}
                </p>
              ) : null}
              <p className={`font-heading font-bold uppercase tracking-wider ${entry.name ? 'text-[10px] text-text-muted' : 'text-xs text-text-primary'}`}>
                {formatDate(entry.completedAt)}
              </p>
            </div>
            <p className="text-[10px] text-text-ghost font-mono whitespace-nowrap shrink-0">
              {workout.totalExerciseCount} EX // ~{workout.totalEstimatedMinutes}M
            </p>
          </div>
        </div>

        {/* Muscle tags */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {Object.entries(workout.muscleGroupCoverage)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 4)
            .map(([muscle]) => (
              <span
                key={muscle}
                className="text-[10px] bg-primary-900 text-primary-400 px-1.5 py-0.5 border border-primary-700 font-mono uppercase"
              >
                {muscle.replace('-', ' ')}
              </span>
            ))}
        </div>

        {/* Circuit preview */}
        <div className="space-y-0.5 mb-4">
          {workout.mainWorkout.blocks.map(block => (
            <div key={block.name}>
              <p className="text-[10px] font-mono text-text-ghost uppercase">{block.name}</p>
              <p className="text-[10px] text-text-muted font-mono ml-2 leading-relaxed">
                {block.exercises.map(we => we.exercise.name).join(' · ')}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onCommence}
            className="flex-1 min-w-[80px] py-2.5 bg-primary-600 text-white font-heading font-bold text-[10px] tracking-widest border border-primary-500 uppercase"
          >
            COMMENCE
          </motion.button>
          <button
            onClick={onMove}
            className="px-3 py-2.5 bg-surface-2 text-text-muted text-[10px] font-heading font-bold tracking-wider border border-surface-3 uppercase flex items-center gap-1"
          >
            <IconMove className="w-3 h-3" />
            FOLDER
          </button>
          <button
            onClick={onShare}
            className="px-3 py-2.5 bg-surface-2 text-text-muted text-[10px] font-heading font-bold tracking-wider border border-surface-3 uppercase flex items-center gap-1"
          >
            <IconShare className="w-3 h-3" />
          </button>
          <button
            onClick={onRename}
            className="px-3 py-2.5 bg-surface-2 text-text-muted text-[10px] font-heading font-bold tracking-wider border border-surface-3 uppercase flex items-center gap-1"
          >
            <IconPencil className="w-3 h-3" />
          </button>
          <button
            onClick={onRemove}
            className="px-3 py-2.5 bg-surface-2 text-red-500/70 text-[10px] font-heading font-bold tracking-wider border border-surface-3 uppercase flex items-center gap-1"
          >
            <IconTrash className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

function FolderCard({
  folder,
  count,
  onOpen,
  onEdit,
  onDelete,
}: {
  folder: WorkoutFolder
  count: number
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      layout
      className="relative"
    >
      <button
        onClick={onOpen}
        className="w-full text-left card-base overflow-hidden"
      >
        <div className="h-1 w-full" style={{ backgroundColor: folder.color }} />
        <div className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <IconFolder className="w-4 h-4 shrink-0" style={{ color: folder.color }} />
            <span className="font-heading font-bold text-xs tracking-wider uppercase text-text-primary truncate">
              {folder.name}
            </span>
          </div>
          <p className="text-[10px] font-mono text-text-muted">
            {count} PROTOCOL{count !== 1 ? 'S' : ''}
          </p>
        </div>
      </button>
      {/* Edit / delete trigger */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowActions(v => !v) }}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-text-ghost hover:text-text-muted"
        aria-label="Folder options"
      >
        <span className="font-mono text-sm leading-none">···</span>
      </button>
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            className="absolute top-8 right-2 z-10 bg-surface-1 border border-surface-3 shadow-lg min-w-[110px]"
            onMouseLeave={() => setShowActions(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setShowActions(false); onEdit() }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[10px] font-heading font-bold tracking-wider text-text-secondary uppercase hover:bg-surface-2"
            >
              <IconPencil className="w-3 h-3" /> RENAME
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowActions(false); onDelete() }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[10px] font-heading font-bold tracking-wider text-red-400 uppercase hover:bg-surface-2"
            >
              <IconTrash className="w-3 h-3" /> DELETE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { favorites, toggleFavorite, renameWorkout, assignToFolder, loading: histLoading } = useWorkoutHistory()
  const { folders, loading: foldersLoading, createFolder, updateFolder, deleteFolder } = useFolders()

  // View state
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)

  // Modals
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  const [shareTarget, setShareTarget] = useState<WorkoutHistoryEntry | null>(null)
  const [shareName, setShareName] = useState('')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const shareNameInputRef = useRef<HTMLInputElement>(null)

  const [moveTarget, setMoveTarget] = useState<WorkoutHistoryEntry | null>(null)

  const [folderModal, setFolderModal] = useState<{ mode: 'create' } | { mode: 'edit'; folder: WorkoutFolder } | null>(null)
  const [folderName, setFolderName] = useState('')
  const [folderColor, setFolderColor] = useState(FOLDER_COLORS[0].hex)
  const folderNameRef = useRef<HTMLInputElement>(null)

  const [confirmDelete, setConfirmDelete] = useState<WorkoutFolder | null>(null)

  // Auto-focus
  useEffect(() => {
    if (renameTargetId && renameInputRef.current) renameInputRef.current.focus()
  }, [renameTargetId])
  useEffect(() => {
    if (shareTarget && shareNameInputRef.current) shareNameInputRef.current.focus()
  }, [shareTarget])
  useEffect(() => {
    if (folderModal && folderNameRef.current) folderNameRef.current.focus()
  }, [folderModal])

  const loading = histLoading || foldersLoading

  // Derived data
  const activeFolder = folders.find(f => f.id === activeFolderId)
  const folderCounts = Object.fromEntries(
    folders.map(f => [f.id, favorites.filter(w => w.folderId === f.id).length])
  )
  const unsorted = favorites.filter(w => !w.folderId)
  const inFolder = (folderId: string) => favorites.filter(w => w.folderId === folderId)

  // Share helpers
  function openShare(entry: WorkoutHistoryEntry) {
    setShareTarget(entry)
    setShareName(entry.name || '')
    setShareUrl(null)
    setCopied(false)
  }
  function generateLink() {
    if (!shareTarget) return
    const code = encodeWorkout(shareTarget.workout, shareName.trim() || undefined)
    setShareUrl(buildShareUrl(code))
  }
  async function copyLink() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch { /* fallback: user can select manually */ }
  }

  // Folder modal helpers
  function openCreateFolder() {
    setFolderName('')
    setFolderColor(FOLDER_COLORS[0].hex)
    setFolderModal({ mode: 'create' })
  }
  function openEditFolder(folder: WorkoutFolder) {
    setFolderName(folder.name)
    setFolderColor(folder.color)
    setFolderModal({ mode: 'edit', folder })
  }
  async function submitFolderModal() {
    const name = folderName.trim()
    if (!name) return
    if (folderModal?.mode === 'create') {
      await createFolder(name, folderColor)
    } else if (folderModal?.mode === 'edit') {
      await updateFolder(folderModal.folder.id, { name, color: folderColor })
    }
    setFolderModal(null)
  }
  async function handleDeleteFolder(folder: WorkoutFolder) {
    await deleteFolder(folder.id)
    if (activeFolderId === folder.id) setActiveFolderId(null)
    setConfirmDelete(null)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-4 pt-12 text-center">
        <p className="text-text-muted font-mono text-sm">LOADING ARCHIVES...</p>
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (favorites.length === 0) {
    return (
      <div className="px-4 pt-10 pb-6">
        <h1 className="font-heading text-2xl font-bold mb-8 text-text-primary tracking-wider">SAVED PROTOCOLS</h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-16">
          <div className="flex justify-center mb-4 text-text-ghost">
            <IconFolder className="w-14 h-14" />
          </div>
          <p className="text-text-secondary font-heading font-bold tracking-wider mb-2 uppercase">No saved protocols</p>
          <p className="text-xs text-text-muted font-mono mb-6">COMPLETE A PROTOCOL AND SAVE IT FROM THE LOG</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 text-white font-heading font-bold tracking-widest text-sm border border-primary-500"
          >
            GENERATE PROTOCOL
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Folder detail view ─────────────────────────────────────────────────────
  if (activeFolderId && activeFolder) {
    const folderWorkouts = inFolder(activeFolderId)

    return (
      <div className="px-4 pt-10 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setActiveFolderId(null)}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <IconArrowLeft className="w-5 h-5" />
          </button>
          <div
            className="w-2 h-8 shrink-0"
            style={{ backgroundColor: activeFolder.color }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-xl font-bold text-text-primary tracking-wider uppercase truncate">
              {activeFolder.name}
            </h1>
            <p className="text-[10px] font-mono text-text-muted">
              {folderWorkouts.length} PROTOCOL{folderWorkouts.length !== 1 ? 'S' : ''}
            </p>
          </div>
          <button
            onClick={() => openEditFolder(activeFolder)}
            className="px-3 py-1.5 bg-surface-2 text-text-muted text-[10px] font-heading font-bold tracking-wider border border-surface-3 uppercase flex items-center gap-1"
          >
            <IconPencil className="w-3 h-3" /> EDIT
          </button>
        </div>

        {folderWorkouts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-12">
            <IconFolderOpen className="w-10 h-10 text-text-ghost mx-auto mb-3" />
            <p className="text-text-muted font-mono text-xs">FOLDER EMPTY</p>
            <p className="text-text-ghost font-mono text-[10px] mt-1">MOVE PROTOCOLS HERE FROM THE UNSORTED SECTION</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {folderWorkouts.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <WorkoutCard
                    entry={entry}
                    folders={folders}
                    onCommence={() => {
                      sessionStorage.setItem('activeWorkout', JSON.stringify(entry.workout))
                      navigate('/workout')
                    }}
                    onShare={() => openShare(entry)}
                    onRename={() => { setRenameTargetId(entry.id); setRenameValue(entry.name || '') }}
                    onMove={() => setMoveTarget(entry)}
                    onRemove={() => toggleFavorite(entry.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modals (shared across views) */}
        {renderModals()}
      </div>
    )
  }

  // ── Overview (folders + unsorted) ──────────────────────────────────────────
  return (
    <div className="px-4 pt-10 pb-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary tracking-wider">SAVED</h1>
          <p className="text-[10px] font-mono text-text-muted">{favorites.length} PROTOCOL{favorites.length !== 1 ? 'S' : ''}</p>
        </div>
        <button
          onClick={openCreateFolder}
          className="flex items-center gap-1.5 px-3 py-2 bg-surface-2 border border-surface-3 text-text-muted text-[10px] font-heading font-bold tracking-wider uppercase hover:border-primary-500 hover:text-primary-400 transition-colors"
        >
          <IconPlus className="w-3.5 h-3.5" /> NEW FOLDER
        </button>
      </div>

      {/* Folders grid */}
      {folders.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] font-mono text-text-ghost mb-2 uppercase tracking-widest">FOLDERS</p>
          <div className="grid grid-cols-2 gap-2">
            <AnimatePresence>
              {folders.map(folder => (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <FolderCard
                    folder={folder}
                    count={folderCounts[folder.id] ?? 0}
                    onOpen={() => setActiveFolderId(folder.id)}
                    onEdit={() => openEditFolder(folder)}
                    onDelete={() => setConfirmDelete(folder)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Unsorted section */}
      {unsorted.length > 0 && (
        <div>
          <p className="text-[10px] font-mono text-text-ghost mb-2 uppercase tracking-widest">
            UNSORTED{folders.length > 0 ? ` · ${unsorted.length}` : ''}
          </p>
          <div className="space-y-3">
            <AnimatePresence>
              {unsorted.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <WorkoutCard
                    entry={entry}
                    folders={folders}
                    onCommence={() => {
                      sessionStorage.setItem('activeWorkout', JSON.stringify(entry.workout))
                      navigate('/workout')
                    }}
                    onShare={() => openShare(entry)}
                    onRename={() => { setRenameTargetId(entry.id); setRenameValue(entry.name || '') }}
                    onMove={() => setMoveTarget(entry)}
                    onRemove={() => toggleFavorite(entry.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* All in folders, nothing unsorted */}
      {unsorted.length === 0 && folders.length > 0 && (
        <div className="text-center py-8">
          <p className="text-text-ghost font-mono text-[10px]">ALL PROTOCOLS ORGANISED</p>
        </div>
      )}

      {renderModals()}
    </div>
  )

  // ── Modals ─────────────────────────────────────────────────────────────────
  function renderModals() {
    return (
      <>
        {/* Rename workout modal */}
        <AnimatePresence>
          {renameTargetId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-surface-0/95 flex items-center justify-center px-6"
              onClick={() => setRenameTargetId(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm border border-primary-500 bg-surface-1 p-6"
                onClick={e => e.stopPropagation()}
              >
                <p className="font-heading text-sm font-bold text-primary-500 tracking-widest uppercase mb-1">RENAME PROTOCOL</p>
                <p className="text-[10px] text-text-muted font-mono mb-4">CLEAR TO REVERT TO DATE</p>
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { renameWorkout(renameTargetId!, renameValue.trim()); setRenameTargetId(null) }
                  }}
                  placeholder="e.g. UPPER BODY DESTROYER"
                  className="w-full bg-surface-0 border border-surface-3 px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-ghost tracking-wider uppercase focus:border-primary-500 focus:outline-none mb-4"
                />
                <div className="flex gap-2">
                  <button onClick={() => setRenameTargetId(null)} className="flex-1 py-2.5 bg-surface-2 text-text-secondary font-heading font-bold text-[10px] tracking-wider border border-surface-3 uppercase">CANCEL</button>
                  <button
                    onClick={() => { renameWorkout(renameTargetId!, renameValue.trim()); setRenameTargetId(null) }}
                    className="flex-1 py-2.5 bg-primary-600 text-white font-heading font-bold text-[10px] tracking-wider border border-primary-500 uppercase"
                  >CONFIRM</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share modal */}
        <AnimatePresence>
          {shareTarget && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-surface-0/95 flex items-center justify-center px-6"
              onClick={() => setShareTarget(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm border border-primary-500 bg-surface-1 p-6"
                onClick={e => e.stopPropagation()}
              >
                <p className="font-heading text-sm font-bold text-primary-500 tracking-widest uppercase mb-1">SHARE PROTOCOL</p>
                <p className="text-[10px] text-text-muted font-mono mb-4">GIVE IT A NAME OTHERS WILL SEE</p>
                <input
                  ref={shareNameInputRef}
                  type="text"
                  value={shareName}
                  onChange={e => setShareName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') generateLink() }}
                  placeholder="e.g. UPPER BODY DESTROYER"
                  className="w-full bg-surface-0 border border-surface-3 px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-ghost tracking-wider uppercase focus:border-primary-500 focus:outline-none mb-3"
                />
                {!shareUrl ? (
                  <div className="flex gap-2">
                    <button onClick={() => setShareTarget(null)} className="flex-1 py-2.5 bg-surface-2 text-text-secondary font-heading font-bold text-[10px] tracking-wider border border-surface-3 uppercase">CANCEL</button>
                    <button onClick={generateLink} className="flex-1 py-2.5 bg-primary-600 text-white font-heading font-bold text-[10px] tracking-wider border border-primary-500 uppercase flex items-center justify-center gap-1.5">
                      <IconShare className="w-3 h-3" /> GENERATE LINK
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-surface-0 border border-surface-3 px-3 py-2">
                      <p className="text-[9px] font-mono text-text-ghost break-all leading-relaxed">{shareUrl}</p>
                    </div>
                    <button onClick={copyLink} className="w-full py-2.5 bg-primary-600 text-white font-heading font-bold text-[10px] tracking-wider border border-primary-500 uppercase flex items-center justify-center gap-1.5">
                      {copied ? <><IconCheck className="w-3 h-3" /> COPIED!</> : 'COPY LINK'}
                    </button>
                    <button onClick={() => setShareTarget(null)} className="w-full py-2 text-text-muted font-mono text-[10px] tracking-wider">DONE</button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Move to folder modal */}
        <AnimatePresence>
          {moveTarget && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-surface-0/95 flex items-end justify-center px-0"
              onClick={() => setMoveTarget(null)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-full max-w-lg border-t border-surface-3 bg-surface-1 pb-8"
                onClick={e => e.stopPropagation()}
              >
                <div className="px-6 pt-5 pb-3 border-b border-surface-3">
                  <p className="font-heading text-sm font-bold text-text-primary tracking-widest uppercase">MOVE TO FOLDER</p>
                  <p className="text-[10px] text-text-muted font-mono mt-0.5 truncate">
                    {moveTarget.name || formatDate(moveTarget.completedAt)}
                  </p>
                </div>

                <div className="px-6 py-3 space-y-1 max-h-64 overflow-y-auto">
                  {/* No folder option */}
                  <button
                    onClick={async () => {
                      await assignToFolder(moveTarget.id, null)
                      setMoveTarget(null)
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors ${
                      !moveTarget.folderId
                        ? 'bg-surface-2 border border-surface-3'
                        : 'hover:bg-surface-2'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full border border-surface-3 shrink-0" />
                    <div>
                      <p className="text-xs font-heading font-bold text-text-secondary uppercase tracking-wider">UNSORTED</p>
                      <p className="text-[10px] font-mono text-text-ghost">Remove from all folders</p>
                    </div>
                    {!moveTarget.folderId && <IconCheck className="w-3 h-3 text-primary-400 ml-auto" />}
                  </button>

                  {/* Folder options */}
                  {folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={async () => {
                        await assignToFolder(moveTarget.id, folder.id)
                        setMoveTarget(null)
                        // If we're in folder view, stay in it
                      }}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors ${
                        moveTarget.folderId === folder.id
                          ? 'bg-surface-2 border border-surface-3'
                          : 'hover:bg-surface-2'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: folder.color }}
                      />
                      <div>
                        <p className="text-xs font-heading font-bold text-text-primary uppercase tracking-wider">{folder.name}</p>
                        <p className="text-[10px] font-mono text-text-ghost">{folderCounts[folder.id] ?? 0} protocols</p>
                      </div>
                      {moveTarget.folderId === folder.id && <IconCheck className="w-3 h-3 text-primary-400 ml-auto" />}
                    </button>
                  ))}

                  {/* Create new folder inline */}
                  <button
                    onClick={() => {
                      setMoveTarget(null)
                      openCreateFolder()
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-surface-2 text-text-muted"
                  >
                    <IconPlus className="w-3 h-3" />
                    <p className="text-[10px] font-heading font-bold tracking-wider uppercase">CREATE NEW FOLDER</p>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create / edit folder modal */}
        <AnimatePresence>
          {folderModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-surface-0/95 flex items-center justify-center px-6"
              onClick={() => setFolderModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm border border-primary-500 bg-surface-1 p-6"
                onClick={e => e.stopPropagation()}
              >
                <p className="font-heading text-sm font-bold text-primary-500 tracking-widest uppercase mb-4">
                  {folderModal.mode === 'create' ? 'NEW FOLDER' : 'RENAME FOLDER'}
                </p>

                <input
                  ref={folderNameRef}
                  type="text"
                  value={folderName}
                  onChange={e => setFolderName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitFolderModal() }}
                  placeholder="FOLDER NAME"
                  className="w-full bg-surface-0 border border-surface-3 px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-ghost tracking-wider uppercase focus:border-primary-500 focus:outline-none mb-4"
                />

                {/* Color picker */}
                <p className="text-[10px] font-mono text-text-ghost mb-2 uppercase tracking-widest">COLOR</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {FOLDER_COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setFolderColor(c.hex)}
                      className="w-7 h-7 rounded-full transition-transform hover:scale-110 relative"
                      style={{ backgroundColor: c.hex }}
                    >
                      {folderColor === c.hex && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <IconCheck className="w-3.5 h-3.5 text-white drop-shadow" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Preview */}
                <div
                  className="flex items-center gap-2 px-3 py-2 bg-surface-0 border border-surface-3 mb-4"
                  style={{ borderLeftColor: folderColor, borderLeftWidth: 3 }}
                >
                  <IconFolder className="w-4 h-4 shrink-0" style={{ color: folderColor }} />
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-text-primary truncate">
                    {folderName || 'PREVIEW'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setFolderModal(null)} className="flex-1 py-2.5 bg-surface-2 text-text-secondary font-heading font-bold text-[10px] tracking-wider border border-surface-3 uppercase">CANCEL</button>
                  <button
                    onClick={submitFolderModal}
                    disabled={!folderName.trim()}
                    className="flex-1 py-2.5 bg-primary-600 text-white font-heading font-bold text-[10px] tracking-wider border border-primary-500 uppercase disabled:opacity-40"
                  >
                    {folderModal.mode === 'create' ? 'CREATE' : 'SAVE'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm delete folder */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-surface-0/95 flex items-center justify-center px-6"
              onClick={() => setConfirmDelete(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm border border-red-500/50 bg-surface-1 p-6"
                onClick={e => e.stopPropagation()}
              >
                <p className="font-heading text-sm font-bold text-red-400 tracking-widest uppercase mb-2">DELETE FOLDER</p>
                <p className="text-xs text-text-muted font-mono mb-1">
                  DELETE <span className="text-text-primary uppercase">{confirmDelete.name}</span>?
                </p>
                <p className="text-[10px] text-text-ghost font-mono mb-5">
                  PROTOCOLS WILL BE MOVED TO UNSORTED. THIS CANNOT BE UNDONE.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 bg-surface-2 text-text-secondary font-heading font-bold text-[10px] tracking-wider border border-surface-3 uppercase">CANCEL</button>
                  <button
                    onClick={() => handleDeleteFolder(confirmDelete)}
                    className="flex-1 py-2.5 bg-red-600/80 text-white font-heading font-bold text-[10px] tracking-wider border border-red-500/50 uppercase"
                  >
                    DELETE
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }
}
