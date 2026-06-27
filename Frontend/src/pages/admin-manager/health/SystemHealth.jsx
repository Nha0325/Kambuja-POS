import { useCallback, useEffect, useState } from "react"
import { adminManagerService } from "../../../services/adminManager.service"
import formatDate from "../../../utils/formatDate"
import {
  FaServer,
  FaDatabase,
  FaHardDrive,
  FaCloudArrowUp,
  FaRotateRight,
  FaDownload,
  FaTrash,
  FaCircleCheck,
  FaTriangleExclamation,
  FaClock
} from "react-icons/fa6"
import toast from "react-hot-toast"
import { useConfirm } from "../components/confirm/useConfirm"

function SystemHealth() {
  const [healthData, setHealthData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const { confirm, closeConfirm } = useConfirm()

  const loadHealthData = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    
    try {
      const res = await adminManagerService.getSystemHealth()
      if (res?.data?.result) {
        setHealthData(res.data.result)
      } else {
        setIsError(true)
      }
    } catch (err) {
      console.error(err)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHealthData()
  }, [loadHealthData])

  const handleBackupNow = async () => {
    setIsBackingUp(true)
    try {
      const res = await adminManagerService.createBackup()
      if (res.data?.success === false) {
        toast.error(res.data.message || "Backup failed")
        window.dispatchEvent(new Event("refetchNotifications"))
      } else {
        toast.success("Backup created successfully")
        loadHealthData()
        window.dispatchEvent(new Event("refetchNotifications"))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start backup")
      window.dispatchEvent(new Event("refetchNotifications"))
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleDeleteBackup = async (fileName) => {
    const ok = await confirm({
      title: "Delete Backup?",
      message: `Are you sure you want to delete ${fileName}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger"
    })
    if (!ok) return
    try {
      const res = await adminManagerService.deleteBackup(fileName)
      if (res.data?.success === false) {
        toast.error(res.data.message || "Failed to delete backup")
      } else {
        toast.success("Backup deleted")
        loadHealthData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete backup")
    } finally {
      closeConfirm()
    }
  }

  const formatMB = (mb) => {
    if (!mb || mb === 0) return '0 MB'
    if (mb < 1) return (mb * 1024).toFixed(2) + ' KB'
    if (mb > 1024) return (mb / 1024).toFixed(2) + ' GB'
    return mb.toFixed(2) + ' MB'
  }

  if (isLoading && !healthData) {
    return (
      <div className="flex flex-col gap-6 max-w-[1600px] mx-auto animate-pulse">
        <div className="h-16 bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-[120px] bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl"></div>)}
        </div>
      </div>
    )
  }

  if (isError && !healthData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 max-w-[1600px] mx-auto text-[#020617] dark:text-[#f8fafc]">
        <FaTriangleExclamation className="text-6xl text-red-200 dark:text-red-500/20 mb-6" />
        <h2 className="text-2xl font-bold mb-2">System Health Error</h2>
        <p className="text-[#64748b] dark:text-[#a1a1aa] text-center mb-8">Failed to load system health data.</p>
        <button onClick={loadHealthData} className="px-5 py-2.5 bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] text-[#020617] dark:text-[#f8fafc] text-sm font-semibold rounded-lg hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors shadow-sm inline-flex items-center gap-2">
          <FaRotateRight /> Try Again
        </button>
      </div>
    )
  }

  const api = healthData?.api || {}
  const mongodb = healthData?.mongodb || {}
  const storage = healthData?.storage || {}
  const backup = healthData?.backup || {}
  const backups = healthData?.backups || []

  const totalStorageMB = (storage.uploadsSizeMB || 0) + (storage.backupsSizeMB || 0) + (storage.logsSizeMB || 0)

  // Derived alerts
  const alerts = []
  if (api.status === 'OFFLINE') alerts.push({ type: 'error', message: 'API Server is currently unreachable or reporting offline status.' })
  if (mongodb.status === 'DISCONNECTED') alerts.push({ type: 'error', message: 'MongoDB connection lost. Database operations will fail.' })
  if (backup.lastBackupStatus === 'FAILED') alerts.push({ type: 'warning', message: 'The last automated backup failed.' })

  return (
    <div className="flex flex-col gap-6 text-[#020617] dark:text-[#f8fafc] max-w-[1600px] mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">Monitor API, Database, and Backup status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadHealthData} className="h-10 px-4 bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] text-[#020617] dark:text-[#f8fafc] text-sm font-semibold rounded-lg hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors shadow-sm inline-flex items-center justify-center gap-2">
            <FaRotateRight className={isLoading ? "animate-spin" : ""} /> Refresh
          </button>
          <button 
            onClick={handleBackupNow} 
            disabled={isBackingUp}
            className="h-10 px-4 bg-[#7033ff] text-white text-sm font-semibold rounded-lg hover:bg-[#7033ff]/90 transition-colors shadow-sm shadow-[#7033ff]/20 inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <FaCloudArrowUp /> {isBackingUp ? 'Processing...' : 'Backup Now'}
          </button>
        </div>
      </div>

      {/* System Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          {alerts.map((alert, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${alert.type === 'error' ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400'}`}>
              <FaTriangleExclamation className={`mt-0.5 shrink-0 ${alert.type === 'error' ? 'text-red-600 dark:text-red-500' : 'text-amber-600 dark:text-amber-500'}`} />
              <div className="text-sm font-medium">{alert.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Health Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-5 flex flex-col justify-between h-[120px] shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-1.5 rounded-lg bg-[#f8fafc] dark:bg-[#09090b] border border-[#e5e7eb] dark:border-[#27272a] text-[#3b82f6]">
              <FaServer className="h-4 w-4" />
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${api.status === 'ONLINE' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
              {api.status === 'ONLINE' ? <FaCircleCheck /> : <FaTriangleExclamation />}
              {api.status || 'UNKNOWN'}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">API Server</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">Uptime:</span>
              <span className="text-[10px] text-[#94a3b8] dark:text-[#64748b] truncate">{api.uptimeSeconds ? Math.floor(api.uptimeSeconds / 60) + ' min' : '---'}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-5 flex flex-col justify-between h-[120px] shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-1.5 rounded-lg bg-[#f8fafc] dark:bg-[#09090b] border border-[#e5e7eb] dark:border-[#27272a] text-[#10b981]">
              <FaDatabase className="h-4 w-4" />
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${mongodb.status === 'CONNECTED' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
              {mongodb.status === 'CONNECTED' ? <FaCircleCheck /> : <FaTriangleExclamation />}
              {mongodb.status || 'UNKNOWN'}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight" title={mongodb.databaseName}>MongoDB</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">Ping:</span>
              <span className="text-[10px] text-[#94a3b8] dark:text-[#64748b] truncate">{mongodb.pingMs !== undefined ? `${mongodb.pingMs} ms` : '---'}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-5 flex flex-col justify-between h-[120px] shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-1.5 rounded-lg bg-[#f8fafc] dark:bg-[#09090b] border border-[#e5e7eb] dark:border-[#27272a] text-[#f59e0b]">
              <FaCloudArrowUp className="h-4 w-4" />
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${backup.lastBackupStatus === 'SUCCESS' ? 'bg-[#10b981]/10 text-[#10b981]' : backup.lastBackupStatus === 'FAILED' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 'bg-[#f8fafc] dark:bg-[#09090b] text-[#64748b] dark:text-[#a1a1aa]'}`}>
              {backup.lastBackupStatus || 'NONE'}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Last Backup</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">Date:</span>
              <span className="text-[10px] text-[#94a3b8] dark:text-[#64748b] truncate">{backup.lastBackupAt ? formatDate(backup.lastBackupAt, "MMM DD, HH:mm") : 'Never'}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl p-5 flex flex-col justify-between h-[120px] shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-1.5 rounded-lg bg-[#f8fafc] dark:bg-[#09090b] border border-[#e5e7eb] dark:border-[#27272a] text-[#8b5cf6]">
              <FaHardDrive className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">{formatMB(totalStorageMB)}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">Platform Storage</span>
              <span className="text-[10px] text-[#94a3b8] dark:text-[#64748b] truncate">· Combined</span>
            </div>
          </div>
        </div>

      </div>

      {/* Backup History Table */}
      <div className="bg-[#ffffff] dark:bg-[#111113] border border-[#e5e7eb] dark:border-[#27272a] rounded-xl shadow-sm overflow-hidden flex flex-col mt-2">
        <div className="p-5 border-b border-[#e5e7eb] dark:border-[#27272a] flex justify-between items-center bg-[#ffffff] dark:bg-[#111113]">
          <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">Backup History</h3>
          <p className="text-xs text-[#64748b] dark:text-[#a1a1aa] flex items-center gap-1"><FaClock /> Showing recent backups</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] dark:bg-[#09090b] border-b border-[#e5e7eb] dark:border-[#27272a]">
                <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">File Name</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Size</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {backups?.length > 0 ? backups.map((item) => (
                <tr key={item.fileName} className="hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-[#020617] dark:text-[#f8fafc]">{formatDate(item.createdAt, "MMM DD, YYYY HH:mm")}</td>
                  <td className="px-5 py-4 text-sm font-mono text-[#64748b] dark:text-[#a1a1aa]">{item.fileName}</td>
                  <td className="px-5 py-4 text-sm text-[#64748b] dark:text-[#a1a1aa]">{formatMB(item.sizeMB)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.status === 'SUCCESS' ? 'bg-[#10b981]/10 text-[#10b981]' : item.status === 'FAILED' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 'bg-[#f8fafc] dark:bg-[#09090b] border border-[#e5e7eb] dark:border-[#27272a] text-[#64748b] dark:text-[#a1a1aa]'}`}>
                        {item.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a 
                        href={`/api/v1/admin-manager/backups/${item.fileName}/download`}
                        className="p-1.5 text-[#3b82f6] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Download Backup"
                      >
                        <FaDownload />
                      </a>
                      <button 
                        onClick={() => handleDeleteBackup(item.fileName)}
                        className="p-1.5 text-[#ef4444] hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Backup"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-[#94a3b8] dark:text-[#64748b] text-sm">No backups found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default SystemHealth
