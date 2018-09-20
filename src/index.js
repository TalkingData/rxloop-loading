export default function loading(
  config = {
    name: 'loading',
  }
) {
  return function init({
    onModel$,
    onEpicStart$,
    onEpicEnd$,
    onEpicCancel$,
    onEpicError$,
    onStart$,
   }) {
    const _model = {
      name: config.name,
      state: {
        global: 0,
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
  
    // hooks
    onStart$
    .subscribe(() => {
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
 
    onEpicStart$
    .subscribe(data => {
      this.dispatch({
        epic: data.epic,
        type: 'loading/epicStart',
        model: data.model,
        loading: 1,
      });
    });
  
    onEpicEnd$
    .subscribe(data => {
      this.dispatch({
        epic: data.epic,
        type: 'loading/epicStop',
        model: data.model,
        loading: 0,
        isEnd: true,
      });
    });

    onEpicError$
    .subscribe(data => {
      this.dispatch({
        epic: data.epic,
        type: 'loading/epicStop',
        model: data.model,
        loading: 0,
        isError: true,
      });
    });
  
    onEpicCancel$
    .subscribe(data => {
      this.dispatch({
        epic: data.epic,
        type: 'loading/epicStop',
        model: data.model,
        loading: 0,
        isCancel: true,
      });
    });
  };
};
