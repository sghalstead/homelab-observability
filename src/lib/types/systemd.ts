export interface ServiceInfo {
  name: string;
  description: string;
  loadState: 'loaded' | 'not-found' | 'bad-setting' | 'error' | 'masked';
  activeState: 'active' | 'reloading' | 'inactive' | 'failed' | 'activating' | 'deactivating';
  subState: string;
  unitFileState:
    | 'enabled'
    | 'disabled'
    | 'static'
    | 'masked'
    | 'generated'
    | 'transient'
    | 'indirect';
}

export interface ServiceDetails extends ServiceInfo {
  mainPid: number | null;
  memoryUsage: number | null;
  cpuUsage: number | null;
  startedAt: Date | null;
  uptime: number | null; // seconds
}

export interface SystemdStatus {
  available: boolean;
  version?: string;
  error?: string;
}

export interface ServiceControlResult {
  success: boolean;
  error?: string;
}
