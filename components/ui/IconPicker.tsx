"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, 
  Laptop, 
  Smartphone, 
  Headphones, 
  Monitor, 
  Keyboard, 
  Mouse, 
  Printer, 
  Camera, 
  Watch,
  Shield,
  Briefcase,
  FileText,
  Settings,
  Wrench,
  Hammer,
  Zap,
  Star,
  Heart,
  Book,
  Home,
  Building,
  Car,
  Plane,
  Ship,
  Truck,
  Bike,
  Gamepad2,
  Music,
  Video,
  Image,
  File,
  Folder,
  Archive,
  Database,
  Server,
  Cloud,
  Globe,
  Lock,
  Key,
  Bell,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Users,
  User,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Filter,
  SortAsc,
  Download,
  Upload,
  Share,
  Copy,
  Edit,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  label?: string;
  placeholder?: string;
}

const iconOptions = [
  { name: 'Package', component: Package },
  { name: 'Laptop', component: Laptop },
  { name: 'Smartphone', component: Smartphone },
  { name: 'Headphones', component: Headphones },
  { name: 'Monitor', component: Monitor },
  { name: 'Keyboard', component: Keyboard },
  { name: 'Mouse', component: Mouse },
  { name: 'Printer', component: Printer },
  { name: 'Camera', component: Camera },
  { name: 'Watch', component: Watch },
  { name: 'Shield', component: Shield },
  { name: 'Briefcase', component: Briefcase },
  { name: 'FileText', component: FileText },
  { name: 'Settings', component: Settings },
  { name: 'Wrench', component: Wrench },
  { name: 'Hammer', component: Hammer },
  { name: 'Zap', component: Zap },
  { name: 'Star', component: Star },
  { name: 'Heart', component: Heart },
  { name: 'Book', component: Book },
  { name: 'Home', component: Home },
  { name: 'Building', component: Building },
  { name: 'Car', component: Car },
  { name: 'Plane', component: Plane },
  { name: 'Ship', component: Ship },
  { name: 'Truck', component: Truck },
  { name: 'Bike', component: Bike },
  { name: 'Gamepad2', component: Gamepad2 },
  { name: 'Music', component: Music },
  { name: 'Video', component: Video },
  { name: 'Image', component: Image },
  { name: 'File', component: File },
  { name: 'Folder', component: Folder },
  { name: 'Archive', component: Archive },
  { name: 'Database', component: Database },
  { name: 'Server', component: Server },
  { name: 'Cloud', component: Cloud },
  { name: 'Globe', component: Globe },
  { name: 'Lock', component: Lock },
  { name: 'Key', component: Key },
  { name: 'Bell', component: Bell },
  { name: 'Calendar', component: Calendar },
  { name: 'Clock', component: Clock },
  { name: 'MapPin', component: MapPin },
  { name: 'Phone', component: Phone },
  { name: 'Mail', component: Mail },
  { name: 'MessageSquare', component: MessageSquare },
  { name: 'Users', component: Users },
  { name: 'User', component: User },
  { name: 'UserPlus', component: UserPlus },
  { name: 'UserCheck', component: UserCheck },
  { name: 'UserX', component: UserX },
  { name: 'Search', component: Search },
  { name: 'Filter', component: Filter },
  { name: 'SortAsc', component: SortAsc },
  { name: 'Download', component: Download },
  { name: 'Upload', component: Upload },
  { name: 'Share', component: Share },
  { name: 'Copy', component: Copy },
  { name: 'Edit', component: Edit },
  { name: 'Trash2', component: Trash2 },
  { name: 'Plus', component: Plus },
  { name: 'Minus', component: Minus },
  { name: 'Check', component: Check },
  { name: 'X', component: X },
  { name: 'AlertCircle', component: AlertCircle },
  { name: 'Info', component: Info },
  { name: 'CheckCircle', component: CheckCircle },
  { name: 'XCircle', component: XCircle },
  { name: 'HelpCircle', component: HelpCircle },
  { name: 'ChevronDown', component: ChevronDown },
  { name: 'ChevronUp', component: ChevronUp },
  { name: 'ChevronLeft', component: ChevronLeft },
  { name: 'ChevronRight', component: ChevronRight },
  { name: 'ArrowUp', component: ArrowUp },
  { name: 'ArrowDown', component: ArrowDown },
  { name: 'ArrowLeft', component: ArrowLeft },
  { name: 'ArrowRight', component: ArrowRight }
];

export default function IconPicker({ value = '', onChange, label, placeholder = 'Seleccionar ícono' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredIcons = iconOptions.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedIcon = iconOptions.find(icon => icon.name === value);

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={pickerRef}>
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          className="w-full flex items-center gap-2 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          style={{ 
            borderColor: 'var(--border)',
            color: 'var(--text-primary)'
          }}
        >
          {selectedIcon ? (
            <selectedIcon.component size={16} />
          ) : (
            <Package size={16} style={{ color: 'var(--text-muted)' }} />
          )}
          <span className="flex-1 text-left">
            {selectedIcon ? selectedIcon.name : placeholder}
          </span>
          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-1 w-80">
            <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-lg" style={{ borderColor: 'var(--border)' }}>
              <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <input
                  type="text"
                  placeholder="Buscar ícono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
                  style={{ 
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                <div className="grid grid-cols-6 gap-2">
                  {filteredIcons.map((icon) => {
                    const IconComponent = icon.component;
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => handleIconSelect(icon.name)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={icon.name}
                      >
                        <IconComponent size={20} style={{ color: 'var(--text-primary)' }} />
                        <span className="text-xs truncate w-full text-center" style={{ color: 'var(--text-muted)' }}>
                          {icon.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {filteredIcons.length === 0 && (
                  <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    No se encontraron íconos
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
