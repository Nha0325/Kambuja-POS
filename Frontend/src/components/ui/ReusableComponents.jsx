import { 
  FaMagnifyingGlass, 
  FaCircleExclamation, 
  FaInbox, 
  FaXmark, 
  FaCircleQuestion, 
  FaSun, 
  FaMoon 
} from 'react-icons/fa6';

// Theme Toggle Component
export const ThemeToggle = ({ isDark, onToggleTheme }) => {
  return (
    <button
      onClick={onToggleTheme}
      className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-border/40 transition-all duration-200 active:scale-95"
      aria-label="Toggle theme"
      id="theme-toggle"
    >
      {isDark ? (
        <FaSun className="w-4.5 h-4.5 text-amber-400" />
      ) : (
        <FaMoon className="w-4.5 h-4.5 text-indigo-600" />
      )}
    </button>
  );
};

// Reusable Button Component
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/95 hover:shadow-md hover:shadow-primary/15 border border-transparent',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/85 border border-transparent',
    outline: 'bg-transparent border border-border text-foreground hover:bg-muted',
    ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/95 hover:shadow-md hover:shadow-destructive/15'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs',
    lg: 'px-5 py-2.5 text-sm'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// Reusable Card Component
export const Card = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs transition-all duration-200 ${
        hoverable ? 'hover:border-border/80 hover:shadow-sm hover:translate-y-[-1px]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Badge Status Indicator
export const Badge = ({ status, variant }) => {
  const norm = String(status).toUpperCase();
  let styles = 'bg-muted text-muted-foreground border-border';

  if (variant) {
    if (variant === 'primary' || variant === 'violet') styles = 'bg-primary/10 text-primary border-primary/20';
    else if (variant === 'secondary') styles = 'bg-secondary text-secondary-foreground border-border';
    else if (variant === 'outline') styles = 'bg-transparent text-foreground border-border';
    else if (variant === 'destructive') styles = 'bg-destructive/10 text-destructive border-destructive/20';
    else if (variant === 'emerald') styles = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    else if (variant === 'amber') styles = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    else if (variant === 'blue') styles = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  } else {
    // Auto color map based on keyword
    if (['ACTIVE', 'COMPLETED', 'PAID', 'RECEIVED', 'SENT', 'OPEN', 'YES'].includes(norm)) {
      styles = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    } else if (['PENDING', 'PARTIAL', 'HOLD', 'ORDERED'].includes(norm)) {
      styles = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    } else if (['INACTIVE', 'CANCELLED', 'DUE', 'FAILED', 'CLOSED', 'CRITICAL', 'NO'].includes(norm)) {
      styles = 'bg-destructive/10 text-destructive border-destructive/20';
    } else if (['ADMIN_MANAGER', 'MANAGER'].includes(norm)) {
      styles = 'bg-primary/10 text-primary border-primary/20';
    } else if (['ADMIN'].includes(norm)) {
      styles = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    } else if (['CASHIER'].includes(norm)) {
      styles = 'bg-teal-500/10 text-teal-500 border-teal-500/20';
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${styles}`}>
      {String(status).replace('_', ' ')}
    </span>
  );
};

// Stat Dashboard Card
export const StatCard = ({ 
  title, value, icon, description, trend, accentColor = 'primary' 
}) => {
  const accentClasses = {
    violet: 'bg-primary/10 text-primary border-primary/20 hover:border-primary/40',
    primary: 'bg-primary/10 text-primary border-primary/20 hover:border-primary/40',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:border-blue-500/40',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:border-emerald-500/40',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:border-amber-500/40',
    rose: 'bg-destructive/10 text-destructive border-destructive/20 hover:border-destructive/40'
  };

  const currentAccent = accentClasses[accentColor] || accentClasses.primary;

  return (
    <Card hoverable className="flex items-center justify-between p-5">
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">{title}</span>
        <h4 className="text-2xl font-bold text-foreground tracking-tight">{value}</h4>
        
        {(description || trend) && (
          <div className="flex items-center gap-1.5 pt-1 text-xs">
            {trend && (
              <span className={`font-semibold ${trend.isPositive ? 'text-emerald-500' : 'text-destructive'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {description && <span className="text-muted-foreground">{description}</span>}
          </div>
        )}
      </div>

      <div className={`p-3 rounded-xl shrink-0 ${currentAccent.split(' ')[0]} ${currentAccent.split(' ')[1]}`}>
        {icon}
      </div>
    </Card>
  );
};

// Loading State Spinner
export const LoadingState = ({ message = 'Loading records...' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-muted-foreground" id="loading-state">
    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
    <span className="text-xs font-mono">{message}</span>
  </div>
);

// Empty Table State
export const EmptyState = ({ 
  title = 'No records found', 
  description = 'There is currently no data to display in this list.', 
  actionBtn 
}) => (
  <div className="flex flex-col items-center justify-center text-center p-10 border border-dashed border-border rounded-2xl bg-muted/20" id="empty-state">
    <div className="bg-muted p-3 rounded-full text-muted-foreground mb-3 border border-border/50">
      <FaInbox className="w-6 h-6" />
    </div>
    <h5 className="font-bold text-foreground text-sm">{title}</h5>
    <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
    {actionBtn}
  </div>
);

// Generic Data Table Component
export function DataTable({
  data,
  columns,
  searchPlaceholder = 'Search index...',
  onSearchChange,
  searchValue = '',
  actionButton,
  keyExtractor
}) {
  return (
    <Card className="overflow-hidden p-0" id="data-table-container">
      {/* Top Header Controls */}
      {(onSearchChange || actionButton) && (
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {onSearchChange ? (
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                <FaMagnifyingGlass className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-primary transition duration-150"
                placeholder={searchPlaceholder}
              />
            </div>
          ) : (
            <div />
          )}
          
          {actionButton && <div className="flex shrink-0 items-center gap-2">{actionButton}</div>}
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              {columns.map((col, idx) => (
                <th key={idx} className={`p-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <div className="py-12 px-4">
                    <EmptyState />
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={keyExtractor(item)} className="hover:bg-muted/35 transition-colors duration-150">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`p-4 text-xs text-foreground/90 font-normal leading-normal ${col.className || ''}`}>
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Styled Text Input
export const FormInput = ({ 
  label, error, icon, className = '', ...props 
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
    <div className="relative">
      {icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`w-full text-xs py-2 px-3 bg-card border text-foreground rounded-xl placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-primary transition duration-150 ${
          icon ? 'pl-9' : ''
        } ${error ? 'border-destructive focus:ring-destructive/20 focus:border-destructive' : 'border-border'}`}
      />
    </div>
    {error && (
      <p className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
        <FaCircleExclamation className="w-3 h-3" /> {error}
      </p>
    )}
  </div>
);

// Styled Dropdown Select Input
export const SelectInput = ({
  label, options, error, className = '', ...props
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
    <select
      {...props}
      className={`w-full text-xs py-2 px-3 bg-card border text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-primary transition duration-150 ${
        error ? 'border-destructive focus:ring-destructive/20 focus:border-destructive' : 'border-border'
      }`}
    >
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value} className="bg-card text-foreground">
          {opt.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
        <FaCircleExclamation className="w-3 h-3" /> {error}
      </p>
    )}
  </div>
);

// Standard Backdrop blur Modal Overlay
export const Modal = ({ 
  isOpen, onClose, title, children, size = 'md' 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in" id="modal-root">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#000000]/40 dark:bg-[#000000]/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className={`relative bg-card text-card-foreground w-full ${sizeClasses[size]} rounded-2xl shadow-xl overflow-hidden border border-border flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-150`}>
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <h4 className="font-bold text-foreground text-sm tracking-tight">{title}</h4>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 text-xs text-foreground/80">
          {children}
        </div>
      </div>
    </div>
  );
};

// Confirm Action Dialog
export const ConfirmDialog = ({
  isOpen, onClose, onConfirm, title, message, 
  confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 fade-in" id="confirm-dialog">
      <div className="absolute inset-0 bg-[#000000]/40 dark:bg-[#000000]/60 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative bg-card text-card-foreground w-full max-w-sm rounded-2xl p-5 shadow-xl border border-border z-10 animate-in fade-in zoom-in-95 duration-100">
        <div className="flex gap-3 mb-4">
          <div className={`p-2.5 rounded-xl shrink-0 ${isDangerous ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            <FaCircleQuestion className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm tracking-tight">{title}</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

// PageHeader Component
export const PageHeader = ({ title, description, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40 mb-6" id="page-header">
      <div className="space-y-1">
        <h1 className="text-xl font-extrabold text-foreground tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="text-xs text-muted-foreground font-medium">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
};
