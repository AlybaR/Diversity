import { STATS_MAIRIE, STATS_PARENT } from '../data/mockData';
import { mockAsync } from './_config';

export interface StatsParent {
  dossiersOuverts: number;
  dossiersUrgents: number;
  enAttenteMairie: number;
  dossiersArchives: number;
  rdvRealises: number;
  messagesMairie: number;
}

export interface StatsMairie {
  nbEcoles: number;
  representantsActifs: number;
  dossiersOuverts: number;
  dossiersUrgents: number;
  ecolesASurveiller: number;
  delaiMoyenJours: number;
  deltaDelaiJours: number;
  dossiersTraitesMois: number;
  deltaDossiersTraitesMois: number;
}

export function getStatsParent(_ecoleId: string): Promise<StatsParent> {
  return mockAsync(STATS_PARENT);
}

export function getStatsMairie(_collectiviteId: string): Promise<StatsMairie> {
  return mockAsync(STATS_MAIRIE);
}
