export type Role = "ADMIN" | "BUILDER" | "MEMBER" | "VIEWER";
export type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
export type MediaType = "IMAGE" | "VIDEO" | "EMBED";

export interface User {
  id: string;
  discordId: string;
  username: string;
  avatar?: string;
  role: Role;
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  role: Role;
  joinedAt: string;
  user: User;
}

export interface ProjectGoal {
  id: string;
  material: string;
  requiredAmount: number;
  currentAmount?: number;
  percent?: number;
}

export interface ItemSnapshot {
  material: string;
  amount: number;
}

export interface ProjectSnapshot {
  id: string;
  timestamp: string;
  fullness: number;
  totalItems: number;
  uniqueItems: number;
  containers: number;
  items: ItemSnapshot[];
}

export interface ProjectUpdate {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: User;
}

export interface ProjectComment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
}

export interface ProjectMedia {
  id: string;
  type: MediaType;
  url: string;
  createdAt: string;
  uploader: User;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  world?: string;
  x?: number;
  y?: number;
  z?: number;
  videoUrl?: string;
  mapUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  goals: ProjectGoal[];
  latestSnapshot?: ProjectSnapshot;
  updates?: ProjectUpdate[];
  comments?: ProjectComment[];
  media?: ProjectMedia[];
}
