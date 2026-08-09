import { ChevronLeft, ChevronRight } from 'lucide-react'

function pageWindow(page: number, totalPages: number) {
  const pages = new Set<number>()
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) pages.add(i)
  pages.add(1)
  pages.add(totalPages)
  return [...pages].sort((a, b) => a - b)
}

export function Pagination({
  page,
  totalPages,
  onChange,
  pageSizeLabel,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
  pageSizeLabel?: string
}) {
  if (totalPages <= 1) return null

  const window = pageWindow(page, totalPages)
  const items: (number | '…')[] = []
  window.forEach((p, i) => {
    if (i > 0 && p - window[i - 1] > 1) items.push('…')
    items.push(p)
  })

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      {pageSizeLabel ? (
        <p className="text-xs text-slate-400 order-2 sm:order-1">{pageSizeLabel}</p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {items.map((it, idx) =>
          it === '…' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={it}
              type="button"
              onClick={() => onChange(it)}
              aria-current={it === page ? 'page' : undefined}
              className={`min-w-9 h-9 px-2 rounded-lg text-sm font-semibold transition-colors ${
                it === page
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {it}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
