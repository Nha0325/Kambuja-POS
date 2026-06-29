import { useEffect, useState } from "react"
import dayjs from "dayjs"
import { notificationService } from "../../../services/engagement/notification.service"
import formatDate from "../../../utils/formatters/formatDate"
import { adminSurface } from "../adminPageUi"
import { useTranslation } from "react-i18next";

function NotificationLogs() {
  const [allLogs, setAllLogs] = useState([])
  const [logs, setLogs] = useState([])
  const [startDate, setStartDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const { t } = useTranslation();

  useEffect(() => {
    notificationService.logs()
      .then((response) => {
        const data = response.data.result || [];
        setAllLogs(data);
        setLogs(data);
      })
  }, [])

  const handleFilter = (e) => {
    e.preventDefault();
    const start = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).endOf('day');
    const filtered = allLogs.filter(log => {
      const logDate = dayjs(log.createdAt);
      return (logDate.isAfter(start) || logDate.isSame(start)) && (logDate.isBefore(end) || logDate.isSame(end));
    });
    setLogs(filtered);
  };

  const handleClear = () => {
    setStartDate(dayjs().format("YYYY-MM-DD"));
    setEndDate(dayjs().format("YYYY-MM-DD"));
    setLogs(allLogs);
  };

  return (
    <section className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>{t('notifications')}</p>
          <h1 className={adminSurface.title}>{t('notification_logs')}</h1>
          <p className={adminSurface.description}>
            {t('notification_logs_desc')}
          </p>
        </div>
      </div>

      <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3 w-full">
        <div className="min-w-0 w-full sm:w-auto">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#6B7280]">
            {t('start_date')}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`${adminSurface.input} w-full sm:w-48`}
            required
          />
        </div>
        <div className="min-w-0 w-full sm:w-auto">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#6B7280]">
            {t('end_date')}
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`${adminSurface.input} w-full sm:w-48`}
            required
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button type="submit" className={`${adminSurface.primaryButton} flex-1 sm:flex-none`}>
            {t('filter')}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className={`${adminSurface.secondaryButton} flex-1 sm:flex-none text-red-600 hover:text-red-700 dark:text-red-500`}
          >
            {t('clear')}
          </button>
        </div>
      </form>

      <div className={adminSurface.tableShell}>
        <div className={adminSurface.toolbar}>
          <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">{logs.length} {t('notification_logs_count')}</p>
        </div>
        <div className={adminSurface.tableWrap}>
        <table className={`${adminSurface.table} min-w-[760px]`}>
          <thead className={adminSurface.tableHead}>
            <tr>
              <th className={adminSurface.th}>{t('date')}</th>
              <th className={adminSurface.th}>{t('event')}</th>
              <th className={adminSurface.th}>{t('message')}</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className={adminSurface.row}>
                <td className={`${adminSurface.td} text-slate-700 dark:text-[#A9A6BB]`}>{formatDate(log.createdAt)}</td>
                <td className={`${adminSurface.td} font-semibold text-slate-900 dark:text-[#F8FAFC]`}>{log.eventType}</td>
                <td className={`${adminSurface.td} min-w-80 text-slate-700 dark:text-[#A9A6BB]`}>{log.message}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-sm text-slate-500 dark:text-[#A9A6BB]">{t('no_notification_logs')}</td></tr>}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  )
}

export default NotificationLogs
