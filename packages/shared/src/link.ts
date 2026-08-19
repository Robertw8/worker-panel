export type Landing = 'LAND_1' | 'LAND_2' | 'LAND_3' | 'LAND_4';

export type LinkStatus = 'ACTIVE' | 'DISABLED';

export interface Link {
  id: string;
  url: string;
  landing: Landing;
  status: LinkStatus;
}
