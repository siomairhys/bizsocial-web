import { useEffect, useState } from 'react'
import PageContainer from './PageContainer'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'

function AppShell({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMobileSidebarOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-slate-800">
      <Sidebar />
      <div className="lg:pl-64">
        <TopHeader onMenuClick={() => setMobileSidebarOpen(true)} />
        <PageContainer>{children}</PageContainer>
      </div>

      {mobileSidebarOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/50"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
          <Sidebar mobile onClose={() => setMobileSidebarOpen(false)} />
        </div>
      ) : null}
    </div>
  )
}

export default AppShell
