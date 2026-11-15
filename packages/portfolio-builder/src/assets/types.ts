export interface PortfolioAsset {
  id: string;
  userId: string;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  kind: 'image' | 'document';
  createdAt: string;
  publicUrl: string;
}
