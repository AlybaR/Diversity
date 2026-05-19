import type { Ecole } from '../types';
import { ECOLES } from '../data/mockData';
import { mockAsync } from './_config';

export function listEcoles(): Promise<Ecole[]> {
  return mockAsync(ECOLES);
}

export function getEcoleById(id: string): Promise<Ecole | null> {
  const ecole = ECOLES.find((e) => e.id === id) ?? null;
  return mockAsync(ecole);
}
