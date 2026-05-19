/**
 * Point d'entrée unique de la couche services.
 *
 * Les écrans importent depuis ce module les fonctions async ou — préférable — les hooks `hooks/use*`
 * qui exposent loading/error/data via React Query.
 *
 * Migration future vers un backend :
 * 1. Remplacer chaque fichier de service par un wrapper autour de `fetch()` / `axios.get()`.
 * 2. Ajouter l'auth header dans un client commun (à créer dans `services/_client.ts`).
 * 3. Garder les signatures de fonction identiques — les écrans et hooks ne changeront pas.
 */

export * from './_config';
export * as dossiersService from './dossiers';
export * as ecolesService from './ecoles';
export * as messagesService from './messages';
export * as personnesService from './personnes';
export * as rendezVousService from './rendezVous';
export * as statsService from './stats';
