/**
 * Docker container port mapping.
 */
export interface ContainerPort {
  privatePort: number;
  publicPort?: number;
  type: 'tcp' | 'udp';
}

/**
 * Docker container information from listing.
 */
export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: 'running' | 'paused' | 'restarting' | 'exited' | 'dead' | 'created';
  created: Date;
  ports: ContainerPort[];
}

/**
 * Docker container runtime statistics.
 */
export interface ContainerStats {
  id: string;
  name: string;
  cpuPercent: number;
  memoryUsed: number;
  memoryLimit: number;
  memoryPercent: number;
  networkRx: number;
  networkTx: number;
  blockRead: number;
  blockWrite: number;
}

/**
 * Docker daemon status including availability and container counts.
 */
export interface DockerStatus {
  available: boolean;
  version?: string;
  containers: {
    total: number;
    running: number;
    paused: number;
    stopped: number;
  };
  error?: string;
}
