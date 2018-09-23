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
          state.epics = action.epics;
          return state;
        },
        epicStart(state, action) {
          const epicCounterKey = `${action.epic}Counter`;
          let epicCounter = state.epics[action.model][epicCounterKey] + action.loading;

          state.epics[action.model][epicCounterKey] = epicCounter;
          state.epics[action.model][action.epic] = epicCounter > 0;

          return state;
        },
        epicStop(state, action) {
          const epicCounterKey = `${action.epic}Counter`;
          state.epics[action.model][epicCounterKey] = 0;
          state.epics[action.model][action.epic] = false;
          return state;
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
        const epicCounterKey = `${epic}Counter`;
        const epicCounter = state.loading[epicCounterKey] + 1
        state.loading[epicCounterKey] = epicCounter;
        state.loading[epic] = epicCounter > 0;
        return state;
      }

      function loadingEnd(state, { payload: { epic } }) {
        state.loading[`${epic}Counter`] = 0;
        state.loading[epic] = false;
        return state;
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
