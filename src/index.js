import produce from "immer";

export default function loading(
  config = {
    name: 'loading',
  }
) {
  return function init({
    onModelBeforeCreate$,
    onEpicStart$,
    onEpicEnd$,
    onEpicCancel$,
    onEpicError$,
    onStart$,
   }) {
    const _model = {
      name: config.name,
      state: {
        epics: {},
      },
      reducers: {
        init(state, action) {
          return produce(state, draft => {
            draft.epics = action.epics;
          });
        },
        epicStart(state, action) {
          return produce(state, draft => {
            const epicCounterKey = `${action.epic}Counter`;
            let epicCounter = draft.epics[action.model][epicCounterKey] + action.loading;

            draft.epics[action.model][epicCounterKey] = epicCounter;
            draft.epics[action.model][action.epic] = epicCounter > 0;
          });
        },
        epicStop(state, action) {
          return produce(state, draft => {
            const epicCounterKey = `${action.epic}Counter`;
            draft.epics[action.model][epicCounterKey] = 0;
            draft.epics[action.model][action.epic] = false;
          });
        },
      },
    };
    this.model(_model);
    this.stream('loading').subscribe();

    onModelBeforeCreate$.subscribe(({ model }) => {
      if (
        typeof model.state !== 'object' ||
        !model.epics ||
        model.state.loading !== void 0
      ) return;

      const loading = {};
      Object.keys(model.epics).forEach(epic => {
        loading[`${epic}Counter`] = 0;
        loading[epic] = false;
      });

      model.state.loading = loading;
      model.reducers.loadingStart = loadingStart;
      model.reducers.loadingEnd = loadingEnd;

      function loadingStart(state, { payload: { epic } }) {
        return produce(state, draft => {
          const epicCounterKey = `${epic}Counter`;
          const epicCounter = draft.loading[epicCounterKey] + 1
          draft.loading[epicCounterKey] = epicCounter;
          draft.loading[epic] = epicCounter > 0;
        });
      }

      function loadingEnd(state, { payload: { epic } }) {
        return produce(state, draft => {
          draft.loading[`${epic}Counter`] = 0;
          draft.loading[epic] = false;
        });
      }
    });
  
    // hooks
    onStart$.subscribe(() => {
      const epics = {};
      Object.keys(this._stream).forEach((model) => {
        if (model === 'loading') return;
        epics[model] = {};
        Object.keys(this._epics[model]).forEach((epic) => {
          epics[model][epic] = false;
          epics[model][`${epic}Counter`] = 0;
        });
      });
      this.dispatch({
        epics,
        type: 'loading/init',
      });
    });
 
    onEpicStart$.subscribe(({ model, epic }) => {
      this.dispatch({
        model,
        epic,
        type: 'loading/epicStart',
        loading: 1,
      });
      this.dispatch({
        type: `${model}/loadingStart`,
        payload: { epic },
      });
    });
  
    onEpicEnd$.subscribe(({ model, epic }) => {
      this.dispatch({
        model,
        epic,
        type: 'loading/epicStop',
        loading: 0,
        isEnd: true,
      });
      this.dispatch({
        type: `${model}/loadingEnd`,
        payload: { epic },
      });
    });

    onEpicError$.subscribe(({ model, epic }) => {
      this.dispatch({
        model,
        epic,
        type: 'loading/epicStop',
        loading: 0,
        isError: true,
      });
      this.dispatch({
        type: `${model}/loadingEnd`,
        payload: { epic },
      });
    });
  
    onEpicCancel$.subscribe(({ model, epic }) => {
      this.dispatch({
        model,
        epic,
        type: 'loading/epicStop',
        loading: 0,
        isCancel: true,
      });
      this.dispatch({
        type: `${model}/loadingEnd`,
        payload: { epic },
      });
    });
  };
};
