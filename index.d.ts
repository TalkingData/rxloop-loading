import { Observable } from 'rxjs';

export interface Config {
  name?: string,
}

export interface API {
  onModel$: Observable<any>,
  onEpicStart$: Observable<any>,
  onEpicEnd$: Observable<any>,
  onEpicCancel$: Observable<any>,
}

export type Plugin = (api: API) => void;

export default function loading(opts?: Config): Plugin;
