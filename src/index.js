export default function loading(
  config = {
    name: 'loading',
  }
) {
  return function init({ onModel$, onEpicStart$, onEpicEnd$, onEpicCancel$, onEpicError$ }) {
    const _model = {
      name: config.name,
      state: {
        global: 0,
        epics: {},
      },
      reducers: {
        epicInit(state, action) {
          if (!state.epics[action.model]) {
            let initEpics = {};
            action.epics.forEach(item => {
              initEpics[`${item}Counter`] = 0;
              initEpics[item] = false;
            });
            return {
              ...state,
              epics: {
                ...state.epics,
                [action.model]: initEpics,
              }
            };
          }
          return state;
        },
        epicStart(state, action) {
          const epicCounterKey = `${action.epic}Counter`;
          let epicCounter = state.epics[action.model][epicCounterKey] + action.loading;
          return {
            ...state,
            epics: {
              ...state.epics,
              [action.model]: {
                ...state.epics[action.model],
                [epicCounterKey]: epicCounter,
                [action.epic]: (epicCounter > 0)
              },
            }
          };
        },
        epicStop(state, action) {
          const epicCounterKey = `${action.epic}Counter`;
          return {
            ...state,
            epics: {
              ...state.epics,
              [action.model]: {
                ...state.epics[action.model],
                [epicCounterKey]: 0,
                [action.epic]: false,
              },
            }
          };
        },
      },
    };
    this.model(_model);
    this.stream('loading').subscribe();
  
    // hooks
    // 初始化 model 状态
    onModel$
    .subscribe(data => {
      
      this.dispatch({
        epics: Object.keys(this._epics[data.model]),
        type: 'loading/epicInit',
        model: data.model,
        loading: 0,
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
